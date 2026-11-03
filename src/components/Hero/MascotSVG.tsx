import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './MascotSVG.module.css'

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

export function MascotSVG() {
  const svgRef        = useRef<SVGSVGElement>(null)
  const bodyGrpRef    = useRef<SVGGElement>(null)
  const tailRef       = useRef<SVGPathElement>(null)
  const earLRef       = useRef<SVGGElement>(null)
  const earRRef       = useRef<SVGGElement>(null)
  const faceGrpRef    = useRef<SVGGElement>(null)
  const shineRef      = useRef<SVGRectElement>(null)
  const bubbleRef     = useRef<SVGGElement>(null)
  const bubbleTextRef = useRef<SVGTextElement>(null)

  const MESSAGES = ['Oi! 👋', 'E aí? 😎', 'Me clica!', 'Uhul! 🎉', 'Vamo lá!']
  const msgIdx = useRef(0)

  /* ── Idle animations ─────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {

      // Breathing
      gsap.to(bodyGrpRef.current, {
        scaleY: 1.025, scaleX: 0.985,
        transformOrigin: '50% 95%',
        duration: 2.3, ease: 'sine.inOut',
        repeat: -1, yoyo: true,
      })

      // Tail wag
      gsap.to(tailRef.current, {
        rotation: 20,
        transformOrigin: '308px 328px',
        duration: 1.0, ease: 'sine.inOut',
        repeat: -1, yoyo: true,
      })

      // Ear wiggle (every 3-4s)
      const earTl = gsap.timeline({ repeat: -1, repeatDelay: 3.5 })
      earTl
        .to(earLRef.current, { rotation: -12, transformOrigin: '110px 138px', duration: 0.18, ease: 'power2.out' })
        .to(earLRef.current, { rotation: 0,   duration: 0.5,  ease: 'elastic.out(1.5, 0.4)' })
        .to(earRRef.current, { rotation: 12,  transformOrigin: '288px 138px', duration: 0.18, ease: 'power2.out' }, '<0.1')
        .to(earRRef.current, { rotation: 0,   duration: 0.5,  ease: 'elastic.out(1.5, 0.4)' }, '<0.1')

      // Glasses shine sweep
      const shineTl = gsap.timeline({ repeat: -1, repeatDelay: 4 })
      shineTl
        .set(shineRef.current, { x: 0, opacity: 0.45 })
        .to(shineRef.current, { x: 38, opacity: 0, duration: 0.55, ease: 'power1.inOut' })
    }, svgRef)

    return () => ctx.revert()
  }, [])

  /* ── Mouse tracking ─────────────────────────── */
  useEffect(() => {
    const face = faceGrpRef.current
    if (!face) return
    const onMove = (e: MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return
      const cx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)
      const cy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)
      gsap.to(face, { x: cx * 9, y: cy * 6, duration: 0.65, ease: 'power2.out' })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  /* ── Click: jump + confetti + speech ─────────── */
  const handleClick = () => {
    const svg = svgRef.current
    if (!svg) return

    // Pick next message
    const msg = MESSAGES[msgIdx.current % MESSAGES.length]
    msgIdx.current++
    if (bubbleTextRef.current) bubbleTextRef.current.textContent = msg

    const rect = svg.getBoundingClientRect()
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 3)

    const tl = gsap.timeline()
    tl.to(svg, { y: -45, duration: 0.28, ease: 'power2.out' })
      .to(svg, { y: 0,   duration: 0.55, ease: 'bounce.out' })

    gsap.to(bubbleRef.current, { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(2)', transformOrigin: '50% 100%' })
    gsap.to(bubbleRef.current, { opacity: 0, scale: 0.8, duration: 0.2, delay: 1.6, ease: 'power2.in', transformOrigin: '50% 100%' })
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.mascot}
      onClick={handleClick}
      role="img"
      aria-label="Mascote Abacat — gatinho abacate com óculos escuros, clicável"
    >
      <defs>
        {/* Body skin gradient */}
        <radialGradient id="bodyGrad" cx="38%" cy="32%" r="58%">
          <stop offset="0%"   stopColor="#2A5A18"/>
          <stop offset="60%"  stopColor="#1A3D0C"/>
          <stop offset="100%" stopColor="#0D2006"/>
        </radialGradient>

        {/* Flesh gradient */}
        <radialGradient id="fleshGrad" cx="42%" cy="36%" r="56%">
          <stop offset="0%"   stopColor="#DCE83A"/>
          <stop offset="70%"  stopColor="#C0CC2A"/>
          <stop offset="100%" stopColor="#A8B220"/>
        </radialGradient>

        {/* Pit gradient */}
        <radialGradient id="pitGrad" cx="38%" cy="30%" r="55%">
          <stop offset="0%"   stopColor="#B87040"/>
          <stop offset="100%" stopColor="#6B3D20"/>
        </radialGradient>

        {/* Face highlight gradient */}
        <radialGradient id="faceGrad" cx="45%" cy="38%" r="52%">
          <stop offset="0%"   stopColor="#E0EC44"/>
          <stop offset="100%" stopColor="#C8D832"/>
        </radialGradient>

        {/* Ear pink gradient */}
        <radialGradient id="earGrad" cx="50%" cy="55%" r="55%">
          <stop offset="0%"   stopColor="#FFA898"/>
          <stop offset="100%" stopColor="#E8806C"/>
        </radialGradient>

        {/* Glow filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Drop shadow */}
        <filter id="shadow" x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* ── Ground shadow ── */}
      <ellipse cx="200" cy="448" rx="118" ry="13" fill="rgba(0,0,0,0.22)"/>

      {/* ── Tail (behind body) ── */}
      <path
        ref={tailRef}
        d="M314 332 C352 298 368 258 348 228 C336 210 315 214 310 230 C328 250 324 292 293 326 Z"
        fill="url(#bodyGrad)"
        opacity="0.9"
      />
      {/* Tail tip lighter highlight */}
      <path
        d="M340 234 C342 222 334 218 328 224 C334 236 332 252 318 268 C330 256 342 248 340 234 Z"
        fill="rgba(255,255,255,0.06)"
      />

      {/* ── Body group (breathing) ── */}
      <g ref={bodyGrpRef} filter="url(#shadow)">

        {/* Outer avocado skin */}
        <ellipse cx="198" cy="293" rx="138" ry="162" fill="url(#bodyGrad)"/>
        {/* Skin highlight (top specular) */}
        <ellipse cx="160" cy="175" rx="42" ry="28" fill="rgba(255,255,255,0.08)" transform="rotate(-15 160 175)"/>

        {/* Inner flesh */}
        <ellipse cx="198" cy="304" rx="106" ry="128" fill="url(#fleshGrad)"/>
        {/* Flesh inner highlight */}
        <ellipse cx="178" cy="228" rx="36" ry="24" fill="rgba(255,255,255,0.18)" transform="rotate(-10 178 228)"/>

        {/* Pit */}
        <ellipse cx="198" cy="338" rx="52" ry="57" fill="url(#pitGrad)"/>
        {/* Pit highlight */}
        <ellipse cx="186" cy="322" rx="17" ry="12" fill="rgba(255,255,255,0.14)" transform="rotate(-15 186 322)"/>
        {/* Pit dark edge */}
        <ellipse cx="198" cy="338" rx="52" ry="57" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="2"/>

      </g>

      {/* ── Face group (mouse tracking) ── */}
      <g ref={faceGrpRef}>

        {/* Face highlight (lighter lime area) */}
        <ellipse cx="198" cy="214" rx="93" ry="79" fill="url(#faceGrad)"/>

        {/* ── Ears ── */}
        <g ref={earLRef}>
          <polygon points="66,148 38,50 152,122" fill="url(#bodyGrad)"/>
          <polygon points="74,142 54,66 144,116" fill="url(#earGrad)"/>
        </g>
        <g ref={earRRef}>
          <polygon points="330,148 362,50 244,122" fill="url(#bodyGrad)"/>
          <polygon points="322,142 342,66 252,116" fill="url(#earGrad)"/>
        </g>

        {/* ── Sunglasses ── */}
        {/* Left lens */}
        <rect x="106" y="176" width="80" height="53" rx="13" fill="#0a0a0a"/>
        {/* Right lens */}
        <rect x="194" y="176" width="80" height="53" rx="13" fill="#0a0a0a"/>
        {/* Bridge */}
        <rect x="186" y="193" width="8" height="10" rx="4" fill="#0a0a0a"/>
        {/* Left frame border */}
        <rect x="106" y="176" width="80" height="53" rx="13" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
        {/* Right frame border */}
        <rect x="194" y="176" width="80" height="53" rx="13" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
        {/* Glasses shine (animated) */}
        <rect ref={shineRef} x="112" y="181" width="30" height="11" rx="5.5" fill="rgba(255,255,255,0.42)" opacity="0.42"/>

        {/* ── Nose ── */}
        <ellipse cx="198" cy="246" rx="9" ry="6.5" fill="#1A3D0C"/>

        {/* ── Mouth (small smile) ── */}
        <path d="M180 263 Q198 278 216 263" stroke="#1A3D0C" strokeWidth="2.8" strokeLinecap="round" fill="none"/>

        {/* ── Whiskers left ── */}
        <line x1="72"  y1="244" x2="165" y2="250" stroke="#1A3D0C" strokeWidth="2"   strokeLinecap="round" opacity="0.9"/>
        <line x1="70"  y1="259" x2="163" y2="259" stroke="#1A3D0C" strokeWidth="1.8" strokeLinecap="round" opacity="0.8"/>
        <line x1="76"  y1="230" x2="164" y2="241" stroke="#1A3D0C" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        {/* ── Whiskers right ── */}
        <line x1="324" y1="244" x2="231" y2="250" stroke="#1A3D0C" strokeWidth="2"   strokeLinecap="round" opacity="0.9"/>
        <line x1="326" y1="259" x2="233" y2="259" stroke="#1A3D0C" strokeWidth="1.8" strokeLinecap="round" opacity="0.8"/>
        <line x1="320" y1="230" x2="232" y2="241" stroke="#1A3D0C" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>

      </g>

      {/* ── Paws ── */}
      <ellipse cx="136" cy="424" rx="42" ry="22" fill="url(#bodyGrad)"/>
      <ellipse cx="260" cy="424" rx="42" ry="22" fill="url(#bodyGrad)"/>
      {/* Paw knuckle lines */}
      <path d="M118 419 Q136 413 154 419" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M242 419 Q260 413 278 419" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* ── Speech bubble (click) ── */}
      <g
        ref={bubbleRef}
        style={{ opacity: 0, transformOrigin: '248px 92px' }}
      >
        {/* Bubble background */}
        <rect x="194" y="28" width="130" height="58" rx="18" fill="white"/>
        {/* Bubble shadow */}
        <rect x="194" y="28" width="130" height="58" rx="18" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5"/>
        {/* Tail of bubble */}
        <polygon points="220,84 206,102 242,84" fill="white"/>
        {/* Text */}
        <text
          ref={bubbleTextRef}
          x="259"
          y="63"
          textAnchor="middle"
          fontSize="15"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight="700"
          fill="#1A3008"
        >
          Oi! 👋
        </text>
      </g>
    </svg>
  )
}
