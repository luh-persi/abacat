import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Skip on small screens to save battery/performance
    if (window.innerWidth < 768) return

    const W = mount.clientWidth
    const H = mount.clientHeight

    // ── Scene ──────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 100)
    camera.position.z = 7

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Circular particle texture ──────────────────────
    const cvs = document.createElement('canvas')
    cvs.width = 64; cvs.height = 64
    const c = cvs.getContext('2d')!
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0,   'rgba(255,255,255,1)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.5)')
    g.addColorStop(1,   'rgba(255,255,255,0)')
    c.fillStyle = g
    c.fillRect(0, 0, 64, 64)
    const tex = new THREE.CanvasTexture(cvs)

    // ── Particles ──────────────────────────────────────
    const COUNT = 220
    const pos   = new Float32Array(COUNT * 3)
    const col   = new Float32Array(COUNT * 3)

    const palette = [
      new THREE.Color('#C8D832'),  // lime       35%
      new THREE.Color('#4A7A25'),  // mid green  30%
      new THREE.Color('#2A5015'),  // dark green 20%
      new THREE.Color('#1E4011'),  // forest     15%
    ]

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10

      const r = Math.random()
      const clr = r > 0.65 ? palette[0]
                : r > 0.35 ? palette[1]
                : r > 0.15 ? palette[2]
                : palette[3]
      col[i * 3]     = clr.r
      col[i * 3 + 1] = clr.g
      col[i * 3 + 2] = clr.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.09,
      map: tex,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    // ── Mouse tracking ─────────────────────────────────
    let tX = 0, tY = 0
    const onMove = (e: MouseEvent) => {
      tX =  (e.clientX / window.innerWidth  - 0.5) * 1.2
      tY = -(e.clientY / window.innerHeight - 0.5) * 0.8
    }
    window.addEventListener('mousemove', onMove)

    // ── Render loop ────────────────────────────────────
    let raf: number
    const clock = new THREE.Clock()

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const t = clock.getElapsedTime()

      points.rotation.y = t * 0.012
      points.rotation.x = Math.sin(t * 0.007) * 0.08

      // Smooth camera drift
      camera.position.x += (tX - camera.position.x) * 0.025
      camera.position.y += (tY - camera.position.y) * 0.025

      renderer.render(scene, camera)
    }
    tick()

    // ── Resize ─────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      tex.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
