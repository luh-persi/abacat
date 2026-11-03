import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import styles from './Mascot3D.module.css'

const MESSAGES = ['Oi! 👋', 'E aí? 😎', 'Me clica!', 'Uhul! 🎉', 'Vamo lá!']

const WHISKERS: Array<[[number, number, number], [number, number, number]]> = [
  [[-0.22, 0.28, 1.12], [-0.86, 0.4, 0.9]],
  [[-0.22, 0.16, 1.14], [-0.9, 0.16, 0.92]],
  [[-0.22, 0.06, 1.12], [-0.84, 0.02, 0.9]],
  [[0.22, 0.28, 1.12], [0.86, 0.4, 0.9]],
  [[0.22, 0.16, 1.14], [0.9, 0.16, 0.92]],
  [[0.22, 0.06, 1.12], [0.84, 0.02, 0.9]],
]

function spawnConfetti(originX: number, originY: number) {
  const colors = ['#C8D832', '#F4907A', '#A06030', '#1E4011', '#fff', '#EEECD8']
  for (let i = 0; i < 28; i++) {
    const dot = document.createElement('div')
    const size = 6 + Math.random() * 8
    const isRect = Math.random() > 0.4
    dot.style.cssText = `
      position:fixed;width:${size}px;height:${isRect ? size * 0.5 : size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${isRect ? '2px' : '50%'};
      top:${originY}px;left:${originX}px;
      pointer-events:none;z-index:9999;
    `
    document.body.appendChild(dot)
    gsap.to(dot, {
      x: (Math.random() - 0.5) * 300,
      y: Math.random() * -280 - 40,
      opacity: 0,
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.5 + 0.5,
      duration: 0.9 + Math.random() * 0.6,
      ease: 'power2.out',
      onComplete: () => dot.remove(),
    })
  }
}

function useShadowMap() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 128
    const g = c.getContext('2d')!
    const grd = g.createRadialGradient(64, 64, 8, 64, 64, 62)
    grd.addColorStop(0, 'rgba(0,0,0,0.42)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 128, 128)
    const map = new THREE.CanvasTexture(c)
    map.colorSpace = THREE.SRGBColorSpace
    return map
  }, [])

  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

function Whisker({ a, b }: { a: [number, number, number]; b: [number, number, number] }) {
  const pose = useMemo(() => {
    const start = new THREE.Vector3(...a)
    const end = new THREE.Vector3(...b)
    const mid = start.clone().add(end).multiplyScalar(0.5)
    const len = start.distanceTo(end)
    const dir = end.clone().sub(start).normalize()
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    return { mid, len, quat }
  }, [a, b])

  return (
    <mesh position={pose.mid} quaternion={pose.quat}>
      <cylinderGeometry args={[0.016, 0.01, pose.len, 6]} />
      <meshStandardMaterial color="#16320e" roughness={0.45} />
    </mesh>
  )
}

export function AvocadoCat({
  jumpRef,
}: {
  jumpRef: { current: () => void }
}) {
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const face = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const earL = useRef<THREE.Group>(null)
  const earR = useRef<THREE.Group>(null)
  const shine = useRef<THREE.Mesh>(null)
  const shineMat = useRef<THREE.MeshBasicMaterial>(null)
  const vel = useRef(0)
  const hop = useRef(0)
  const squash = useRef(0)
  const shadow = useShadowMap()

  const tailGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.28, 0.18, -0.18),
      new THREE.Vector3(0.42, 0.58, -0.06),
      new THREE.Vector3(0.12, 0.92, 0.08),
      new THREE.Vector3(-0.08, 0.74, 0.14),
    ])
    return new THREE.TubeGeometry(curve, 28, 0.105, 12, false)
  }, [])

  const smileGeo = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.18, 0.02, 0),
      new THREE.Vector3(0, -0.12, 0.04),
      new THREE.Vector3(0.18, 0.02, 0),
    )
    return new THREE.TubeGeometry(curve, 16, 0.04, 8, false)
  }, [])

  useEffect(() => () => {
    tailGeo.dispose()
    smileGeo.dispose()
  }, [tailGeo, smileGeo])

  useEffect(() => {
    jumpRef.current = () => { vel.current = 4.4 }
  }, [jumpRef])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const px = state.pointer.x
    const py = state.pointer.y

    const nextHop = hop.current + vel.current * dt
    const nextVel = vel.current - 16 * dt
    if (nextHop <= 0 && hop.current > 0.08) squash.current = 0.16
    hop.current = Math.max(0, nextHop)
    vel.current = hop.current === 0 ? 0 : nextVel
    if (squash.current > 0) squash.current = Math.max(0, squash.current - dt)

    if (root.current) {
      root.current.position.y = Math.sin(t * 1.45) * 0.045 + hop.current
      root.current.rotation.y = Math.sin(t * 0.45) * 0.22 + px * 0.2
      root.current.rotation.x = py * 0.05
    }

    if (body.current) {
      const breathe = Math.sin(t * 2.15)
      const squashAmt = squash.current > 0 ? Math.sin((squash.current / 0.16) * Math.PI) * 0.07 : 0
      body.current.scale.set(1 - breathe * 0.012 + squashAmt, 1 + breathe * 0.02 - squashAmt, 1)
    }

    if (tail.current) tail.current.rotation.z = Math.sin(t * 3.1) * 0.42

    const cycle = t % 4.2
    const twitch = cycle < 0.16 ? Math.sin((cycle / 0.16) * Math.PI) : 0
    if (earL.current) earL.current.rotation.z = 0.46 - twitch * 0.4
    if (earR.current) earR.current.rotation.z = -0.46 + twitch * 0.28

    if (face.current) {
      face.current.position.x += (px * 0.1 - face.current.position.x) * 0.08
      face.current.position.y += (-py * 0.05 - face.current.position.y) * 0.08
    }

    if (shine.current && shineMat.current) {
      const u = (t % 4.6) / 4.6
      const moving = u < 0.18
      shine.current.position.x = -0.4 + (moving ? (u / 0.18) * 0.24 : 0.24)
      shineMat.current.opacity = moving ? 0.75 * (1 - u / 0.18) : 0
    }
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, 0.05]}>
        <planeGeometry args={[2.5, 1.25]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>

      <group ref={root}>
        <group ref={body}>
          <mesh scale={[1.05, 1.22, 0.78]}>
            <sphereGeometry args={[1, 40, 32]} />
            <meshStandardMaterial color="#1a4512" roughness={0.58} metalness={0.04} />
          </mesh>
          <mesh position={[-0.28, 0.55, 0.42]} scale={[0.28, 0.14, 0.08]} rotation={[0, 0, -0.4]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
          </mesh>

          <mesh position={[0, -0.04, 0.42]} scale={[0.8, 0.98, 0.62]}>
            <sphereGeometry args={[1, 40, 32]} />
            <meshStandardMaterial
              color="#d4e24a"
              roughness={0.38}
              metalness={0.02}
              emissive="#c8d832"
              emissiveIntensity={0.07}
            />
          </mesh>
          <mesh position={[-0.18, 0.32, 0.92]} scale={[0.2, 0.1, 0.05]} rotation={[0, 0, -0.3]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.22} />
          </mesh>

          <mesh position={[0, -0.62, 0.86]} scale={[0.3, 0.3, 0.24]}>
            <sphereGeometry args={[1, 28, 22]} />
            <meshStandardMaterial color="#a06030" roughness={0.42} metalness={0.08} />
          </mesh>
          <mesh position={[-0.08, -0.52, 1.06]} scale={[0.08, 0.05, 0.03]}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
          </mesh>

          <mesh position={[-0.34, -1.16, 0.62]} scale={[0.3, 0.16, 0.22]}>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color="#1a4512" roughness={0.6} />
          </mesh>
          <mesh position={[0.34, -1.16, 0.62]} scale={[0.3, 0.16, 0.22]}>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color="#1a4512" roughness={0.6} />
          </mesh>
        </group>

        <group ref={tail} position={[0.92, -0.05, 0.05]}>
          <mesh geometry={tailGeo}>
            <meshStandardMaterial color="#1a4512" roughness={0.58} />
          </mesh>
        </group>

        <group ref={face}>
          <group ref={earL} position={[-0.52, 1.02, 0.02]} rotation={[0.12, 0, 0.46]}>
            <mesh rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.3, 0.62, 4]} />
              <meshStandardMaterial color="#1a4512" roughness={0.55} />
            </mesh>
            <mesh position={[0.02, -0.02, 0.08]} scale={0.58} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.3, 0.62, 4]} />
              <meshStandardMaterial color="#f4a090" roughness={0.7} />
            </mesh>
          </group>
          <group ref={earR} position={[0.52, 1.02, 0.02]} rotation={[0.12, 0, -0.46]}>
            <mesh rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.3, 0.62, 4]} />
              <meshStandardMaterial color="#1a4512" roughness={0.55} />
            </mesh>
            <mesh position={[-0.02, -0.02, 0.08]} scale={0.58} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.3, 0.62, 4]} />
              <meshStandardMaterial color="#f4a090" roughness={0.7} />
            </mesh>
          </group>

          <RoundedBox args={[0.48, 0.28, 0.08]} radius={0.08} smoothness={4} position={[-0.26, 0.42, 1.12]}>
            <meshPhysicalMaterial color="#141414" roughness={0.16} metalness={0.55} clearcoat={1} clearcoatRoughness={0.12} />
          </RoundedBox>
          <RoundedBox args={[0.48, 0.28, 0.08]} radius={0.08} smoothness={4} position={[0.26, 0.42, 1.12]}>
            <meshPhysicalMaterial color="#141414" roughness={0.16} metalness={0.55} clearcoat={1} clearcoatRoughness={0.12} />
          </RoundedBox>
          <mesh position={[0, 0.42, 1.1]}>
            <boxGeometry args={[0.1, 0.06, 0.06]} />
            <meshStandardMaterial color="#141414" roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[-0.56, 0.42, 0.92]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[0.22, 0.035, 0.04]} />
            <meshStandardMaterial color="#141414" metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh position={[0.56, 0.42, 0.92]} rotation={[0, -0.4, 0]}>
            <boxGeometry args={[0.22, 0.035, 0.04]} />
            <meshStandardMaterial color="#141414" metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh ref={shine} position={[-0.38, 0.5, 1.18]}>
            <boxGeometry args={[0.14, 0.04, 0.02]} />
            <meshBasicMaterial ref={shineMat} color="#ffffff" transparent opacity={0.5} depthWrite={false} />
          </mesh>

          <mesh position={[0, 0.2, 1.24]} scale={[0.1, 0.065, 0.05]}>
            <sphereGeometry args={[1, 14, 12]} />
            <meshStandardMaterial color="#1a3008" roughness={0.4} />
          </mesh>
          <mesh geometry={smileGeo} position={[0, 0.04, 1.22]}>
            <meshStandardMaterial color="#1a3008" roughness={0.4} />
          </mesh>
          {WHISKERS.map(([a, b]) => (
            <Whisker key={`${a[0]}-${a[1]}-${b[1]}`} a={a} b={b} />
          ))}
        </group>
      </group>
    </group>
  )
}

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
        <AvocadoCat jumpRef={jumpRef} />
      </Canvas>
      {bubble && (
        <div key={bubble.id} className={styles.bubble} role="status">
          {bubble.text}
        </div>
      )}
    </div>
  )
}
