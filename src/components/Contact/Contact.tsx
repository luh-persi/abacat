import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useMascotImage } from '../../hooks/useMascotImage'
import styles from './Contact.module.css'

// Update this with your real WhatsApp number (country code + number, no spaces or symbols)
const WHATSAPP_NUMBER = '5500000000000'
const WHATSAPP_MSG = encodeURIComponent(
  'Olá! Vim pelo site da Abacat e quero conversar sobre meu projeto.'
)
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`

export function Contact() {
  const sectionRef  = useRef<HTMLElement>(null)
  const mascotRef   = useRef<HTMLImageElement>(null)
  const mascotSrc   = useMascotImage('/mascote.png')

  // Idle wave when in view
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && mascotRef.current) {
          gsap.fromTo(
            mascotRef.current,
            { opacity: 0, x: 60, scale: 0.85 },
            { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)' }
          )
          gsap.to(mascotRef.current, {
            rotate: 6,
            duration: 1.2,
            ease: 'sine.inOut',
            repeat: 5,
            yoyo: true,
            delay: 0.9,
          })
        }
      },
      { threshold: 0.4 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  // Reveal items
  useEffect(() => {
    const items = sectionRef.current?.querySelectorAll('.reveal')
    if (!items) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    items.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="contato" ref={sectionRef} className={styles.section}>
      {/* Texture overlay */}
      <div className={styles.textureOverlay} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {/* Left: copy */}
        <div className={styles.copy}>
          <span className={`tag-label ${styles.eyebrow} reveal`}>
            // vamos conversar
          </span>

          <h2 className={`${styles.headline} reveal reveal-delay-1`}>
            Tem um problema<br />
            pra resolver?<br />
            <span className={styles.accent}>A Abacat topa.</span>
          </h2>

          <p className={`${styles.sub} reveal reveal-delay-2`}>
            A gente não promete apresentação linda.
            A gente promete resultado.
          </p>

          <a
            href={WHATSAPP_URL}
            className={`${styles.whatsappBtn} reveal reveal-delay-3`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir conversa no WhatsApp com a Abacat"
          >
            {/* WhatsApp icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path
                d="M11 1C5.477 1 1 5.477 1 11c0 1.825.488 3.538 1.34 5.015L1 21l5.115-1.315A9.95 9.95 0 0011 21c5.523 0 10-4.477 10-10S16.523 1 11 1z"
                stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path
                d="M7.5 8.5c.5 1.5 1.5 2.8 2.8 3.8 1.3 1 2.7 1.7 3.7 1.7.3 0 .5-.1.7-.3l.6-.6c.2-.2.2-.5 0-.7L14 11.2c-.2-.2-.5-.2-.7 0l-.5.5c-.8-.4-1.5-1-2-1.8l.5-.5c.2-.2.2-.5 0-.7L10.1 7.5c-.2-.2-.5-.2-.7 0l-.6.6c-.2.2-.3.4-.3.4z"
                fill="currentColor"/>
            </svg>
            Falar no WhatsApp
          </a>

          <p className={`${styles.note} reveal reveal-delay-4`}>
            Tempo médio de resposta: algumas horas.
            Pode perguntar à vontade — a primeira conversa é sempre sem compromisso.
          </p>
        </div>

        {/* Right: Mascot */}
        <div className={styles.mascotWrap}>
          <div className={styles.mascotGlow} aria-hidden="true" />
          <img
            ref={mascotRef}
            src={mascotSrc}
            alt="Mascote Abacat acenando"
            className={styles.mascotImg}
            style={{ opacity: 0 }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
