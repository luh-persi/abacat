import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import mascoteUrl from '../../assets/mascote-rig.glb'
import styles from './Mascot3D.module.css'

const MESSAGES = ['Oi!', 'E aí?', 'Me clica!', 'Uhul!', 'Vamo lá!']

function useShadowMap() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grd = g.createRadialGradient(64, 64, 8, 64, 64, 64)
    grd.addColorStop(0, 'rgba(0,0,0,0.55)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 128, 128)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

function spawnConfetti(x: number, y: number) {
  const colors = ['#C8D832', '#F4A090', '#A06030', '#EFE7C4', '#7FA832']
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('span')
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:7px;height:7px;border-radius:2px;background:${colors[i % colors.length]};pointer-events:none;z-index:80;`
    document.body.appendChild(el)
    const angle = Math.random() * Math.PI * 2
    const dist = 40 + Math.random() * 90
    const rot = Math.random() * 360
    el.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 30}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' },
    ).finished.then(() => el.remove())
  }
}

const EAR_BONES = ['Orelha_E', 'Orelha_D'] as const
const FOOT_BONES = ['Pezinho_E', 'Pezinho_D'] as const

export function AvocadoCat({
  jumpRef,
  shadow = true,
  face = 'front',
  strideRef,
}: {
  jumpRef?: RefObject<() => void>
  shadow?: boolean
  face?: 'front' | 'back'
  strideRef?: RefObject<number>
}) {
  const gltf = useGLTF(mascoteUrl)
  const rig = useMemo(() => {
    const cloned = cloneSkinned(gltf.scene)
    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    const c = new THREE.Vector3()
    cloned.traverse((obj) => {
      obj.frustumCulled = false
      const mesh = obj as THREE.Mesh
      const index = mesh.isMesh ? mesh.geometry?.index : null
      if (!mesh.isMesh || !index) return
      const geom = mesh.geometry
      const pos = geom.attributes.position
      const keep: number[] = []
      for (let i = 0; i < index.count; i += 3) {
        const ia = index.getX(i)
        const ib = index.getX(i + 1)
        const ic = index.getX(i + 2)
        a.fromBufferAttribute(pos, ia)
        b.fromBufferAttribute(pos, ib)
        c.fromBufferAttribute(pos, ic)
        const groundCard = a.y < -0.4 && b.y < -0.4 && c.y < -0.4
        if (!groundCard) keep.push(ia, ib, ic)
      }
      if (keep.length < index.count) geom.setIndex(keep)
    })
    return cloned
  }, [gltf.scene])
  const bones = useMemo(() => {
    const found = new Map<string, THREE.Bone>()
    rig.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) found.set(obj.name, obj as THREE.Bone)
    })
    return found
  }, [rig])
  const rest = useMemo(() => {
    const poses = new Map<string, THREE.Quaternion>()
    for (const name of [...EAR_BONES, ...FOOT_BONES]) {
      const bone = bones.get(name)
      if (bone) poses.set(name, bone.quaternion.clone())
    }
    return poses
  }, [bones])

  const rigRoot = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const vel = useRef(0)
  const squash = useRef(0)
  const shadowMap = useShadowMap()
  const { actions } = useAnimations(gltf.animations, rigRoot)
  const earOffset = useMemo(() => new THREE.Quaternion(), [])
  const footOffset = useMemo(() => new THREE.Quaternion(), [])
  const axisZ = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const axisX = useMemo(() => new THREE.Vector3(1, 0, 0), [])

  useEffect(() => {
    const action = actions.Rabinho_Balanco
    if (!action) return
    action.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.35).play()
    return () => {
      action.fadeOut(0.2)
    }
  }, [actions])

  useEffect(() => {
    if (!jumpRef) return
    jumpRef.current = () => {
      vel.current = 4.4
    }
  }, [jumpRef])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033)
    const t = state.clock.elapsedTime
    vel.current -= 16 * dt
    const y = (root.current?.position.y ?? 0) + vel.current * dt
    if (y <= 0) {
      if (vel.current < -1) squash.current = Math.min(1, -vel.current / 9)
      vel.current = 0
      if (root.current) root.current.position.y = 0
    } else if (root.current) {
      root.current.position.y = y
    }

    const hop = root.current?.position.y ?? 0
    const air = Math.min(1, hop / 0.45)
    const landing = Math.max(0, squash.current - dt * 3.2)
    squash.current = landing
    if (body.current) {
      const breathe = 1 + Math.sin(t * 2.1) * 0.015
      body.current.scale.set(
        (1 + landing * 0.08) * breathe,
        (1 - landing * 0.1 + air * 0.04) * breathe,
        1,
      )
    }
    if (root.current && face === 'front') {
      const lookX = (state.pointer.x || 0) * 0.22
      const lookY = (state.pointer.y || 0) * 0.08
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, lookX, 0.08)
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, -lookY, 0.08)
    } else if (root.current) {
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, 0, 0.12)
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, 0, 0.12)
    }

    const stride = strideRef?.current
    const running = stride !== undefined
    const phase = running ? stride * 2.7 : t * 3.2
    const earAmp = running ? 0.16 : 0.08
    const footAmp = (running ? 0.42 : 0.1) * (1 - air)
    const earL = bones.get('Orelha_E')
    const earR = bones.get('Orelha_D')
    const restL = rest.get('Orelha_E')
    const restR = rest.get('Orelha_D')
    if (earL && restL) {
      earOffset.setFromAxisAngle(axisZ, Math.sin(phase) * earAmp)
      earL.quaternion.copy(restL).multiply(earOffset)
    }
    if (earR && restR) {
      earOffset.setFromAxisAngle(axisZ, Math.sin(phase + 0.6) * -earAmp)
      earR.quaternion.copy(restR).multiply(earOffset)
    }
    FOOT_BONES.forEach((name, index) => {
      const bone = bones.get(name)
      const pose = rest.get(name)
      if (!bone || !pose) return
      footOffset.setFromAxisAngle(axisX, Math.sin(phase + index * Math.PI) * footAmp)
      bone.quaternion.copy(pose).multiply(footOffset)
    })
  })

  return (
    <group>
      {shadow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.22, 0.05]}>
          <planeGeometry args={[2.5, 1.25]} />
          <meshBasicMaterial map={shadowMap} transparent depthWrite={false} />
        </mesh>
      )}
      <group ref={root}>
        <group ref={body}>
          <group ref={rigRoot} rotation={[0, face === 'back' ? Math.PI / 2 : -Math.PI / 2, 0]} scale={2.25}>
            <primitive object={rig} />
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(mascoteUrl)

export function Mascot3D() {
  const stageRef = useRef<HTMLDivElement>(null)
  const jumpRef = useRef<() => void>(() => {})
  const timer = useRef(0)
  const msgIdx = useRef(0)
  const [bubble, setBubble] = useState<{ id: number; text: string } | null>(null)
  const [alive, setAlive] = useState(true)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setAlive(entry.isIntersecting),
      { threshold: 0.04 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const celebrate = () => {
    const text = MESSAGES[msgIdx.current % MESSAGES.length]
    const id = msgIdx.current++
    setBubble({ id, text })
    const rect = stageRef.current?.getBoundingClientRect()
    if (rect) spawnConfetti(rect.left + rect.width * 0.5, rect.top + rect.height * 0.32)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setBubble(null), 1700)
  }

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      role="button"
      tabIndex={0}
      aria-label="Mascote Abacat em 3D. Clique ou aperte Enter."
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          jumpRef.current()
          celebrate()
        }
      }}
      onPointerDown={() => {
        stageRef.current?.focus({ preventScroll: true })
        jumpRef.current()
        celebrate()
      }}
    >
      <Canvas
        camera={{ position: [0, 0.08, 6.15], fov: 30 }}
        dpr={[1, 1.6]}
        frameloop={alive ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.toneMappingExposure = 1.12
          gl.domElement.style.touchAction = 'pan-y'
        }}
      >
        <ambientLight intensity={1.05} />
        <hemisphereLight args={['#f3f6d2', '#102006', 0.45]} />
        <directionalLight position={[3.2, 4.2, 4.5]} intensity={2.5} color="#fff8ec" />
        <directionalLight position={[-3.2, 1.4, -2]} intensity={0.7} color="#b7d84e" />
        <pointLight position={[0.2, 0.5, 2.6]} intensity={1.4} distance={7} color="#ffffff" />
        <Suspense fallback={null}>
          <AvocadoCat jumpRef={jumpRef} />
        </Suspense>
      </Canvas>
      {bubble && (
        <div key={bubble.id} className={styles.bubble} role="status">
          {bubble.text}
        </div>
      )}
    </div>
  )
}
