import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { AvocadoCat } from '../Hero/Mascot3D'

/**
 * Corrida em terceira pessoa inspirada no Cuberun de Adam Karlsten (MIT).
 * https://github.com/akarlsten/cuberun
 * Faixas, pulo, abaixada e pontos são da Abacat. O código não é uma cópia do original.
 */

export type Hud = {
  score: number
  meters: number
  combo: number
  shield: boolean
}

export type GameBridge = {
  playing: boolean
  run: number
  jumpRef: { current: () => void }
  onHud: (hud: Hud) => void
  onCrash: () => void
  onShield: () => void
}

type Kind = 'block' | 'low' | 'high' | 'coin' | 'shield' | 'sweep'

type Part = { kind: Kind; lane: number; da: number }

type Item = {
  kind: Kind
  lane: number
  at: number
  live: boolean
  prevZ: number
  judged: boolean
}

const LANES = [-2.15, 0, 2.15] as const
const POOL = 40
const BUILDINGS = 14
const WINDOWS = BUILDINGS * 2
const COIN = new THREE.Color('#C8D832')
const SHIELD_COLOR = new THREE.Color('#F6C56B')
const BUILDING_COLORS = ['#101e0c', '#17301a', '#0d1a0b', '#1c3820', '#142616'].map((hex) => new THREE.Color(hex))
const HIT_Z = 0.2

function emptyItem(): Item {
  return { kind: 'block', lane: 1, at: 0, live: false, prevZ: -99, judged: false }
}

function coins(lane: number, start: number): Part[] {
  return [0, 1, 2].map((i) => ({ kind: 'coin' as const, lane, da: start + i * 1.55 }))
}

function patternFor(at: number, n: number): { parts: Part[]; gap: number } {
  const lane = n % 3
  const side = (lane + 1) % 3
  const free = (lane + 2) % 3
  const gap = Math.max(13.5, 17.5 - at / 180)

  if (n === 0) return { parts: [...coins(0, -5), { kind: 'block', lane: 1, da: 0 }, ...coins(0, 3.2)], gap: 14 }
  if (n === 1) return { parts: [...coins(1, -5), { kind: 'low', lane: 1, da: 0 }, ...coins(1, 3.2)], gap: 14 }
  if (n === 2) return { parts: [...coins(1, -5), { kind: 'high', lane: 1, da: 0 }, ...coins(1, 3.2)], gap: 14 }

  const roll = n % 8
  if (at > 50 && roll === 0) return { parts: [...coins(1, -4.6), { kind: 'low', lane: 3, da: 0 }, ...coins(1, 3.4)], gap }
  if (at > 78 && roll === 1) return { parts: [...coins(1, -4.6), { kind: 'high', lane: 3, da: 0 }, ...coins(1, 3.4)], gap }
  if (at > 64 && roll === 2) return { parts: [...coins(free, -4.6), { kind: 'sweep', lane: 1, da: 0 }, ...coins(free, 3.4)], gap }
  if (roll === 3) {
    return {
      parts: [
        ...coins(free, -4.6),
        { kind: 'block', lane, da: 0 },
        { kind: 'block', lane: side, da: 0 },
        ...coins(free, 3.2),
      ],
      gap,
    }
  }
  if (roll === 4) {
    return {
      parts: [
        ...coins(free, -4.6),
        { kind: 'low', lane, da: 0 },
        { kind: 'block', lane: side, da: 0 },
        ...coins(free, 3.2),
      ],
      gap,
    }
  }
  if (at > 42 && roll === 5) {
    return {
      parts: [
        ...coins(free, -4.6),
        { kind: 'high', lane, da: 0 },
        { kind: 'block', lane: side, da: 0 },
        ...coins(free, 3.2),
      ],
      gap,
    }
  }
  if (roll === 6 && n % 12 === 6) {
    return { parts: [...coins(free, -3), { kind: 'shield', lane: free, da: 0 }, ...coins(free, 2.6)], gap: gap + 1 }
  }
  return { parts: [...coins(side, -4.6), { kind: 'block', lane, da: 0 }, ...coins(side, 3.2)], gap }
}

function claim(items: Item[], part: Part, at: number) {
  const slot = items.find((item) => !item.live)
  if (!slot) return
  slot.kind = part.kind
  slot.lane = part.lane
  slot.at = at + part.da
  slot.live = true
  slot.prevZ = -99
  slot.judged = false
}

function paintBox(mesh: THREE.Mesh, color: THREE.Color) {
  const mat = mesh.material as THREE.MeshStandardMaterial
  mat.color.copy(color)
  mat.emissive.copy(color)
}

function useFloorMap() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    const width = 280
    const height = 256
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.Texture()
    ctx.fillStyle = '#071208'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#0d1c0b'
    for (const lane of [-2.15, 0, 2.15]) {
      ctx.fillRect((lane + 7) * 20 - 24, 0, 48, height)
    }
    ctx.fillStyle = 'rgba(200, 216, 50, 0.72)'
    for (const divider of [-1.08, 1.08]) {
      const x = (divider + 7) * 20 - 1.5
      for (let y = 10; y < height; y += 52) ctx.fillRect(x, y, 3, 24)
    }
    ctx.fillStyle = '#C8D832'
    for (const rail of [-3.7, 3.7]) ctx.fillRect((rail + 7) * 20 - 1, 0, 2, height)
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1, 8)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [])
}

export function Runner({ bridge }: { bridge: MutableRefObject<GameBridge> }) {
  const floor = useFloorMap()
  const pool = useRef<Item[]>(Array.from({ length: POOL }, emptyItem))
  const slots = useRef<(THREE.Group | null)[]>([])
  const buildings = useRef<THREE.InstancedMesh>(null)
  const windows = useRef<THREE.InstancedMesh>(null)
  const painted = useRef(false)
  const stride = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const player = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const aura = useRef<THREE.Mesh>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const streaks = useRef<(THREE.Mesh | null)[]>([])
  const x = useRef(0)
  const lane = useRef(1)
  const keysUntil = useRef(0)
  const wantJump = useRef(false)
  const wantSlide = useRef(false)
  const playerY = useRef(0)
  const vy = useRef(0)
  const slide = useRef(0)
  const shield = useRef(false)
  const invuln = useRef(0)
  const combo = useRef(1)
  const comboLeft = useRef(0)
  const bank = useRef(0)
  const speed = useRef(3.2)
  const travel = useRef(0)
  const distance = useRef(0)
  const shake = useRef(0)
  const crashed = useRef(false)
  const seenRun = useRef(0)
  const plan = useRef({ at: 12, n: 0 })
  const shown = useRef<Hud>({ score: -1, meters: -1, combo: -1, shield: false })
  const gesture = useRef({ x: 0, y: 0, used: false })
  const glow = typeof window !== 'undefined' && window.innerWidth >= 768

  useEffect(() => {
    const stageOf = (target: EventTarget | null) =>
      target instanceof Element ? target.closest('[aria-label^="Mini-jogo"]') : null

    const onKeyDown = (e: KeyboardEvent) => {
      const left = e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A'
      const right = e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D'
      const jump = e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W'
      const duck = e.key === 'ArrowDown' || e.key === 's' || e.key === 'S'
      if (!left && !right && !jump && !duck) return
      if (bridge.current.playing && (e.key.startsWith('Arrow') || e.key === ' ')) e.preventDefault()
      if (e.repeat) return
      if (left || right) {
        lane.current = THREE.MathUtils.clamp(lane.current + (right ? 1 : -1), 0, 2)
        keysUntil.current = performance.now() + 1200
      }
      if (jump) wantJump.current = true
      if (duck) wantSlide.current = true
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest('button')) return
      gesture.current = { x: e.clientX, y: e.clientY, used: false }
    }

    const onPointerMove = (e: PointerEvent) => {
      const stage = stageOf(e.target)
      if (!stage) return
      const dx = e.clientX - gesture.current.x
      const dy = e.clientY - gesture.current.y
      if (e.pointerType === 'touch') {
        if (!gesture.current.used && Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) {
          gesture.current.used = true
          lane.current = THREE.MathUtils.clamp(lane.current + (dx > 0 ? 1 : -1), 0, 2)
          keysUntil.current = performance.now() + 800
        }
        if (!gesture.current.used && dy > 36 && dy > Math.abs(dx)) {
          gesture.current.used = true
          wantSlide.current = true
        }
        return
      }
      if (performance.now() < keysUntil.current) return
      const rect = stage.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const current = lane.current
      if (current === 0) lane.current = nx > 0.22 ? 2 : nx > -0.05 ? 1 : 0
      else if (current === 2) lane.current = nx < -0.22 ? 0 : nx < 0.05 ? 1 : 2
      else lane.current = nx < -0.28 ? 0 : nx > 0.28 ? 2 : 1
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest('button')) return
      if (!stageOf(e.target)) return
      const dx = e.clientX - gesture.current.x
      const dy = e.clientY - gesture.current.y
      if (Math.hypot(dx, dy) < 26 && !gesture.current.used) wantJump.current = true
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [bridge])

  useFrame((state, dt) => {
    const step = Math.min(dt, 0.05)
    if (bridge.current.run !== seenRun.current) {
      seenRun.current = bridge.current.run
      for (const item of pool.current) item.live = false
      plan.current.at = 12
      plan.current.n = 0
      travel.current = 0
      distance.current = 0
      x.current = LANES[1]
      lane.current = 1
      keysUntil.current = performance.now() + 400
      wantJump.current = false
      wantSlide.current = false
      playerY.current = 0
      vy.current = 0
      slide.current = 0
      shield.current = false
      invuln.current = 0.45
      combo.current = 1
      comboLeft.current = 0
      bank.current = 0
      shake.current = 0
      crashed.current = false
      speed.current = 6.4
      shown.current = { score: -1, meters: -1, combo: -1, shield: false }
    }

    const playing = bridge.current.playing && !crashed.current
    const preview = seenRun.current === 0
    const desired = playing ? Math.min(17.5, 6.6 + distance.current * 0.05) : preview ? 3.3 : 0
    speed.current += (desired - speed.current) * Math.min(1, step * 0.85)
    travel.current += speed.current * step
    if (playing) distance.current += speed.current * step
    if (invuln.current > 0) invuln.current = Math.max(0, invuln.current - step)
    if (slide.current > 0) slide.current = Math.max(0, slide.current - step)
    if (comboLeft.current > 0) {
      comboLeft.current = Math.max(0, comboLeft.current - step)
      if (comboLeft.current === 0) combo.current = 1
    }

    if (wantJump.current) {
      wantJump.current = false
      if (playerY.current <= 0.02 && slide.current <= 0) vy.current = 8.6
    }
    if (wantSlide.current) {
      wantSlide.current = false
      if (playerY.current <= 0.05) {
        slide.current = 0.52
        vy.current = 0
        playerY.current = 0
      }
    }

    playerY.current += vy.current * step
    vy.current -= 24 * step
    if (playerY.current <= 0) {
      playerY.current = 0
      vy.current = 0
    }

    const goal = LANES[lane.current]
    const prevX = x.current
    x.current += (goal - x.current) * Math.min(1, step * 11)
    floor.offset.y = -travel.current * (8 / 56)
    stride.current = travel.current

    const items = pool.current
    const sweepX = Math.sin(state.clock.elapsedTime * 1.25) * 2.15
    let crashedNow = false
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const group = slots.current[i]
      if (!item.live) {
        if (group) group.visible = false
        continue
      }
      const z = travel.current - item.at
      if (item.prevZ < -90) item.prevZ = z
      else if (playing && !item.judged && item.prevZ < HIT_Z && z >= HIT_Z) {
        item.judged = true
        const wide = item.lane === 3
        const ix = item.kind === 'sweep' ? sweepX : wide ? x.current : LANES[item.lane]
        const radius = item.kind === 'coin' || item.kind === 'shield' ? 0.78 : item.kind === 'sweep' ? 0.95 : 0.9
        const inLane = wide || Math.abs(x.current - ix) < radius
        if (item.kind === 'coin' || item.kind === 'shield') {
          if (inLane && playerY.current < 1.5) {
            if (item.kind === 'shield') {
              shield.current = true
              bank.current += 20
            } else {
              bank.current += 10 * combo.current
              combo.current = Math.min(8, combo.current + 1)
              comboLeft.current = 2.8
            }
            item.live = false
          }
        } else if (inLane && invuln.current <= 0) {
          const cleared =
            (item.kind === 'low' && playerY.current > 0.5) ||
            (item.kind === 'high' && slide.current > 0) ||
            ((item.kind === 'block' || item.kind === 'sweep') && playerY.current > 0.85)
          if (!cleared) {
            if (shield.current) {
              shield.current = false
              invuln.current = 1.15
              shake.current = 0.38
              combo.current = 1
              comboLeft.current = 0
              item.live = false
              bridge.current.onShield()
            } else {
              crashed.current = true
              crashedNow = true
              speed.current = 0
              shake.current = 0.55
            }
          } else {
            bank.current += 5 * combo.current
            combo.current = Math.min(8, combo.current + 1)
            comboLeft.current = 2.8
          }
        }
      }
      item.prevZ = z
      if (z > 3.2) item.live = false
      if (!group) continue
      if (!item.live) {
        group.visible = false
        continue
      }

      const wide = item.lane === 3
      const ix = item.kind === 'sweep' ? sweepX : wide ? 0 : LANES[item.lane]
      const time = state.clock.elapsedTime
      const block = group.children[0] as THREE.Group
      const low = group.children[1] as THREE.Group
      const high = group.children[2] as THREE.Group
      const saw = group.children[3] as THREE.Group
      const pickup = group.children[4] as THREE.Group
      block.visible = item.kind === 'block'
      low.visible = item.kind === 'low'
      high.visible = item.kind === 'high'
      saw.visible = item.kind === 'sweep'
      pickup.visible = item.kind === 'coin' || item.kind === 'shield'

      let y = 0
      let rotX = 0
      let rotY = 0
      let rotZ = 0
      if (item.kind === 'block') {
        y = Math.sin(time * 2.1 + item.at) * 0.045
        rotY = Math.sin(time * 0.8 + item.at) * 0.28
      } else if (item.kind === 'low') {
        y = Math.sin(time * 2.6 + item.at) * 0.02
      } else if (item.kind === 'sweep') {
        y = 0.58
        rotX = time * 1.6
        rotY = time * 2.3 + item.at
      } else if (item.kind === 'coin' || item.kind === 'shield') {
        y = 0.78 + Math.sin(time * 4 + item.at) * 0.08
        rotY = time * 2.2
        const gem = pickup.children[0] as THREE.Mesh
        const ring = pickup.children[1] as THREE.Mesh
        paintBox(gem, item.kind === 'shield' ? SHIELD_COLOR : COIN)
        gem.scale.setScalar(item.kind === 'shield' ? 1.25 : 1)
        ring.visible = item.kind === 'shield'
      }
      if (item.kind === 'low' || item.kind === 'high') {
        const gate = item.kind === 'low' ? low : high
        const bar = gate.children[2] as THREE.Mesh
        const postL = gate.children[0] as THREE.Mesh
        const postR = gate.children[1] as THREE.Mesh
        bar.scale.y = wide ? 3.7 : 1
        const postX = wide ? 2.85 : item.kind === 'low' ? 0.68 : 0.74
        postL.position.x = -postX
        postR.position.x = postX
      }

      group.visible = true
      group.position.set(ix, y, z)
      group.rotation.set(rotX, rotY, rotZ)
      const arrive = THREE.MathUtils.smoothstep(z, -22, -12)
      group.scale.setScalar(0.86 + arrive * 0.14)
    }

    while ((preview || seenRun.current > 0) && plan.current.at < travel.current + 46) {
      const next = patternFor(plan.current.at, plan.current.n)
      for (const part of next.parts) claim(items, part, plan.current.at)
      plan.current.n += 1
      plan.current.at += next.gap
    }

    if (playing || preview) {
      const meters = Math.floor(distance.current)
      const hud = {
        score: meters + bank.current,
        meters,
        combo: combo.current,
        shield: shield.current,
      }
      const prev = shown.current
      if (hud.score !== prev.score || hud.meters !== prev.meters || hud.combo !== prev.combo || hud.shield !== prev.shield) {
        shown.current = hud
        if (playing) bridge.current.onHud(hud)
      }
    }
    if (crashedNow) bridge.current.onCrash()

    const city = buildings.current
    if (city) {
      if (!painted.current) {
        for (let i = 0; i < BUILDINGS; i++) city.setColorAt(i, BUILDING_COLORS[i % BUILDING_COLORS.length])
        if (city.instanceColor) city.instanceColor.needsUpdate = true
        painted.current = true
      }
      for (let i = 0; i < BUILDINGS; i++) {
        const side = i % 2 === 0 ? -1 : 1
        const span = 70
        const z = (((i * 10 + travel.current) % span) + span) % span - 46
        const height = 1.5 + (i % 5) * 0.7
        dummy.position.set(side * 5.55, height / 2, z)
        dummy.scale.set(1.45, height, 1.7 + (i % 3) * 0.35)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        city.setMatrixAt(i, dummy.matrix)
      }
      city.instanceMatrix.needsUpdate = true
    }
    const win = windows.current
    if (win) {
      for (let i = 0; i < WINDOWS; i++) {
        const b = i % BUILDINGS
        const level = Math.floor(i / BUILDINGS)
        const side = b % 2 === 0 ? -1 : 1
        const span = 70
        const z = (((b * 10 + travel.current) % span) + span) % span - 46
        const height = 1.5 + (b % 5) * 0.7
        const lit = (b + level) % 4 !== 0
        dummy.position.set(side * 4.82, 0.42 + level * height * 0.36, z)
        dummy.scale.set(lit ? 0.05 : 0, lit ? 0.16 : 0, lit ? 0.26 : 0)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        win.setMatrixAt(i, dummy.matrix)
      }
      win.instanceMatrix.needsUpdate = true
    }

    const fast = Math.max(0, speed.current - 8)
    for (let i = 0; i < streaks.current.length; i++) {
      const streak = streaks.current[i]
      if (!streak) continue
      streak.visible = fast > 0.4
      let z = streak.position.z + speed.current * step * 1.6
      if (z > 5) z = -16 - (i % 5) * 3.2
      const side = i % 2 === 0 ? -1 : 1
      streak.position.set(side * (4.15 + (i % 3) * 0.18), 0.35 + (i % 4) * 0.42, z)
      streak.scale.set(1, 1, 0.8 + fast * 0.18)
      const mat = streak.material as THREE.MeshBasicMaterial
      mat.opacity = Math.min(0.45, fast / 18)
    }

    const duck = slide.current > 0
    const bob = playerY.current < 0.02 && !duck ? Math.sin(travel.current * 8) * 0.035 : 0
    if (player.current) {
      player.current.position.set(x.current, 0.64 + playerY.current * 0.92 + bob - (duck ? 0.16 : 0), 0.2)
    }
    if (body.current) {
      const vx = (x.current - prevX) / step
      body.current.scale.y += ((duck ? 0.62 : 1) - body.current.scale.y) * Math.min(1, step * 12)
      body.current.rotation.x += ((duck ? -0.5 : -0.34) - body.current.rotation.x) * Math.min(1, step * 10)
      body.current.rotation.z += (-vx * 0.045 - body.current.rotation.z) * Math.min(1, step * 8)
      body.current.visible = invuln.current <= 0 || Math.sin(state.clock.elapsedTime * 42) > 0
    }
    if (aura.current) {
      aura.current.visible = shield.current
      aura.current.rotation.z += step * 3.2
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.06
      aura.current.scale.setScalar(pulse)
    }
    if (shadow.current) {
      shadow.current.position.x = x.current
      const s = Math.max(0.42, 1 - playerY.current * 0.32)
      shadow.current.scale.set(s, s, 1)
    }

    if (shake.current > 0) shake.current = Math.max(0, shake.current - step * 1.5)
    const time = state.clock.elapsedTime
    const sx = Math.sin(time * 72) * shake.current
    const sy = Math.cos(time * 61) * shake.current
    const aim = x.current
    const phone = state.size.width < 560
    const cam = state.camera as THREE.PerspectiveCamera
    const fov = phone ? 48 : 40
    if (cam.fov !== fov) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }
    state.camera.position.set(
      aim * (phone ? 0.28 : 0.4) + sx,
      (phone ? 3.15 : 2.4) + playerY.current * 0.16 - (duck ? 0.22 : 0) + sy,
      phone ? 6.85 : 5.55,
    )
    state.camera.lookAt(aim * 0.4, phone ? 0.42 : 0.55 + playerY.current * 0.1, phone ? -5.5 : -8)
  })

  return (
    <>
      <color attach="background" args={['#060e04']} />
      <fog attach="fog" args={['#071208', 12, 38]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#e7f0b8', '#071407', 0.55]} />
      <directionalLight position={[2.4, 6.5, 5]} intensity={2.4} color="#fff6e8" />
      <directionalLight position={[0, 3.2, -10]} intensity={1.15} color="#d5e86a" />
      <pointLight position={[0, 1.6, 2.2]} intensity={2.2} distance={8} color="#fff4d4" />

      <mesh position={[0, 7.5, -34]}>
        <planeGeometry args={[80, 22]} />
        <meshBasicMaterial color="#10240e" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, -8]}>
        <planeGeometry args={[36, 64]} />
        <meshStandardMaterial color="#050c04" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -8]}>
        <planeGeometry args={[14, 56]} />
        <meshStandardMaterial map={floor} roughness={0.84} metalness={0.04} />
      </mesh>

      <instancedMesh ref={buildings} args={[undefined, undefined, BUILDINGS]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.88} metalness={0.04} />
      </instancedMesh>
      <instancedMesh ref={windows} args={[undefined, undefined, WINDOWS]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e7f4a4" emissive="#C8D832" emissiveIntensity={0.9} />
      </instancedMesh>

      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          ref={(node) => { streaks.current[i] = node }}
          position={[i % 2 === 0 ? -4.3 : 4.3, 0.5 + (i % 4) * 0.35, -i * 2.4]}
        >
          <boxGeometry args={[0.035, 0.035, 1.5]} />
          <meshBasicMaterial color="#c8d832" transparent opacity={0.2} />
        </mesh>
      ))}

      {Array.from({ length: POOL }, (_, i) => (
        <group key={i} ref={(node) => { slots.current[i] = node }} visible={false}>
          <group>
            <mesh position={[0, 0.58, 0]}>
              <boxGeometry args={[1.02, 1.02, 1.02]} />
              <meshStandardMaterial color="#162812" roughness={0.46} metalness={0.12} />
            </mesh>
            <mesh position={[0, 0.58, 0.52]}>
              <boxGeometry args={[1.06, 0.1, 0.04]} />
              <meshStandardMaterial color="#C8D832" emissive="#C8D832" emissiveIntensity={0.85} />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <boxGeometry args={[1.06, 0.06, 1.06]} />
              <meshStandardMaterial color="#C8D832" emissive="#C8D832" emissiveIntensity={0.4} />
            </mesh>
          </group>
          <group>
            <mesh position={[-0.68, 0.28, 0]}>
              <cylinderGeometry args={[0.055, 0.08, 0.56, 8]} />
              <meshStandardMaterial color="#3a1814" roughness={0.55} />
            </mesh>
            <mesh position={[0.68, 0.28, 0]}>
              <cylinderGeometry args={[0.055, 0.08, 0.56, 8]} />
              <meshStandardMaterial color="#3a1814" roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.48, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.065, 0.065, 1.5, 12]} />
              <meshStandardMaterial color="#F4907A" emissive="#F4907A" emissiveIntensity={0.28} />
            </mesh>
          </group>
          <group>
            <mesh position={[-0.74, 0.72, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 1.44, 8]} />
              <meshStandardMaterial color="#241838" roughness={0.5} />
            </mesh>
            <mesh position={[0.74, 0.72, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 1.44, 8]} />
              <meshStandardMaterial color="#241838" roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.32, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.075, 0.075, 1.62, 12]} />
              <meshStandardMaterial color="#d7ef6a" emissive="#C8D832" emissiveIntensity={0.4} />
            </mesh>
          </group>
          <group>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.46, 0.07, 10, 22]} />
              <meshStandardMaterial color="#F4907A" emissive="#F4907A" emissiveIntensity={1.15} />
            </mesh>
            <mesh>
              <octahedronGeometry args={[0.2, 0]} />
              <meshStandardMaterial color="#fff1c4" emissive="#F6C56B" emissiveIntensity={1.5} />
            </mesh>
          </group>
          <group>
            <mesh>
              <octahedronGeometry args={[0.26, 0]} />
              <meshStandardMaterial color="#C8D832" emissive="#C8D832" emissiveIntensity={1.7} roughness={0.22} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.4, 0.035, 8, 20]} />
              <meshStandardMaterial color="#F6C56B" emissive="#F6C56B" emissiveIntensity={1.3} />
            </mesh>
          </group>
        </group>
      ))}

      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0.2]}>
        <circleGeometry args={[0.42, 18]} />
        <meshBasicMaterial color="#020802" transparent opacity={0.5} />
      </mesh>

      <group ref={player} position={[0, 0.64, 0.2]}>
        <group ref={body}>
          <Suspense fallback={null}>
            <group scale={0.5}>
              <AvocadoCat jumpRef={bridge.current.jumpRef} shadow={false} face="back" strideRef={stride} />
            </group>
          </Suspense>
        </group>
        <mesh ref={aura} visible={false} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.7, 0]}>
          <torusGeometry args={[0.64, 0.04, 8, 28]} />
          <meshStandardMaterial color="#F6C56B" emissive="#F6C56B" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>

      {glow && (
        <Suspense fallback={null}>
          <EffectComposer enableNormalPass={false}>
            <Bloom intensity={0.28} luminanceThreshold={0.78} luminanceSmoothing={0.28} mipmapBlur />
            <Vignette eskil={false} offset={0.28} darkness={0.7} />
          </EffectComposer>
        </Suspense>
      )}
    </>
  )
}
