import { Suspense, lazy, useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './Hero.module.css'

const ThreeBackground = lazy(() =>
  import('./ThreeBackground').then(m => ({ default: m.ThreeBackground }))
)

const Mascot3D = lazy(() =>
  import('./Mascot3D').then(m => ({ default: m.Mascot3D }))
)

export function Hero() {
  const tagRef      = useRef<HTMLSpanElement>(null)
  const line1Ref    = useRef<HTMLSpanElement>(null)
  const line2Ref    = useRef<HTMLSpanElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctasRef     = useRef<HTMLDivElement>(null)
  const mascotRef   = useRef<HTMLDivElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)
  const statsRef    = useRef<HTMLDivElement>(null)

  /* ── Entrance sequence ─────────────────────────── */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(tagRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 }, 0.3)

    tl.fromTo(line1Ref.current,
      { opacity: 0, y: 60, clipPath: 'inset(0 0 100% 0)' },
      { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.9 }, 0.5)

    tl.fromTo(line2Ref.current,
      { opacity: 0, y: 60, clipPath: 'inset(0 0 100% 0)' },
      { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.9 }, 0.72)

    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7 }, 1.0)

    tl.fromTo(ctasRef.current?.children ?? [],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, 1.15)

    tl.fromTo(statsRef.current?.children ?? [],
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.5 }, 1.4)

    tl.fromTo(mascotRef.current,
      { opacity: 0, y: 100, scale: 0.85 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.5)' }, 0.55)

    tl.fromTo(scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }, 1.9)

    return () => { tl.kill() }
  }, [])

  return (
    <section id="hero" className={styles.hero}>
      {/* Three.js particle field */}
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      {/* Radial bloom */}
      <div className={styles.bloom} aria-hidden="true" />

      <div className={`container ${styles.content}`}>

        {/* ── Left: Text ── */}
        <div className={styles.textSide}>

          <span ref={tagRef} className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true"/>
            estúdio criativo &amp; tecnológico
          </span>

          <h1 className={styles.headline}>
            <span ref={line1Ref} className={styles.line1}>
              Criatividade que resolve.
            </span>
            <span ref={line2Ref} className={styles.line2}>
              Tecnologia que funciona.
            </span>
          </h1>

          <p ref={subtitleRef} className={styles.subtitle}>
            Reunimos design, código, marketing e estratégia para resolver
            problemas reais — e executamos do começo ao fim.
          </p>

          <div ref={ctasRef} className={styles.ctas}>
            <a
              href="#solucoes"
              className={styles.ctaPrimary}
              onClick={e => {
                e.preventDefault()
                document.querySelector('#solucoes')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Ver soluções
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="https://wa.me/5500000000000?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Abacat%20e%20quero%20conversar."
              className={styles.ctaSecondary}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar com a Abacat
            </a>
          </div>

          {/* Fun stat pills */}
          <div ref={statsRef} className={styles.stats}>
            <div className={styles.statPill}>
              <span className={styles.statDot} style={{ background: 'var(--lime-flash)' }}/>
              Design + Código
            </div>
            <div className={styles.statPill}>
              <span className={styles.statDot} style={{ background: 'var(--ear-coral)' }}/>
              Marketing + Estratégia
            </div>
            <div className={styles.statPill}>
              <span className={styles.statDot} style={{ background: 'var(--pit-amber)' }}/>
              IA + Automação
            </div>
          </div>

          {/* Fun hint */}
          <p className={styles.clickHint} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l4 5-4 5" stroke="var(--lime-flash)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            clique no Abacat pra ver o que acontece
          </p>

        </div>

        {/* ── Right: 3D mascot ── */}
        <div ref={mascotRef} className={styles.mascotSide}>
          <div className={styles.aura} aria-hidden="true" />
          <div className={styles.auraInner} aria-hidden="true" />
          <Suspense fallback={null}>
            <Mascot3D />
          </Suspense>
        </div>

      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} className={styles.scrollIndicator} aria-hidden="true">
        <span className={styles.scrollLabel}>scroll</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.scrollArrow}>
          <path d="M10 4v12M5 12l5 5 5-5"
                stroke="var(--lime-flash)" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Bottom curve into next section */}
      <div className={styles.curveBottom} aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80 Q720 0 1440 80 L1440 80 L0 80 Z" fill="var(--cream)"/>
        </svg>
      </div>
    </section>
  )
}
