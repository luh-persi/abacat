import { useEffect, useRef } from 'react'
import styles from './WhatWeDo.module.css'

const SERVICES = [
  {
    id: 'tech',
    tag: '01 / tecnologia',
    title: 'Desenvolvimento & Sistemas',
    desc: 'Sites, plataformas, sistemas e integrações que funcionam de verdade — rápidos, seguros e fáceis de manter.',
    color: 'lime',
    size: 'tall',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M16 18l-8 6 8 6M32 18l8 6-8 6M26 12l-4 24"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'design',
    tag: '02 / criatividade',
    title: 'Design & Identidade Visual',
    desc: 'Identidade visual, interfaces e materiais que comunicam quem você é — com clareza e personalidade.',
    color: 'dark',
    size: 'normal',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M20 4l4.5 11.5L36 20l-11.5 4.5L20 36l-4.5-11.5L4 20l11.5-4.5L20 4z"
              stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'ai',
    tag: '06 / inovação',
    title: 'Automação & IA',
    desc: 'Fluxos automatizados e inteligência artificial integrados ao seu negócio para eliminar trabalho manual.',
    color: 'amber',
    size: 'normal',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="8" y="12" width="24" height="18" rx="4" stroke="currentColor" strokeWidth="2.2"/>
        <circle cx="15" cy="20" r="2.5" fill="currentColor"/>
        <circle cx="25" cy="20" r="2.5" fill="currentColor"/>
        <path d="M15 8v4M25 8v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M8 28l-3 4M32 28l3 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'seo',
    tag: '04 / orgânico',
    title: 'SEO & Posicionamento',
    desc: 'Estratégia de conteúdo e otimização técnica para aparecer quando seu cliente está procurando.',
    color: 'dark',
    size: 'normal',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="17" cy="18" r="9" stroke="currentColor" strokeWidth="2.2"/>
        <path d="M24 24l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M13 18h8M17 14v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'marketing',
    tag: '03 / performance',
    title: 'Marketing & Tráfego Pago',
    desc: 'Campanhas que convertem, redes sociais com estratégia e resultados que aparecem no financeiro.',
    color: 'coral',
    size: 'normal',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M8 28l8-10 6 6 8-14" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M30 12l4-4M30 12h4M30 12v4" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'strategy',
    tag: '05 / estratégia',
    title: 'Estratégia Comercial & Processos',
    desc: 'Organizamos seu funil de vendas, mapeamos processos e criamos estruturas que escalam — sem depender de caos.',
    color: 'dark',
    size: 'wide',
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect x="4" y="20" width="8" height="20" rx="2" stroke="currentColor" strokeWidth="2.2"/>
        <rect x="18" y="12" width="8" height="28" rx="2" stroke="currentColor" strokeWidth="2.2"/>
        <rect x="32" y="4" width="8" height="36" rx="2" stroke="currentColor" strokeWidth="2.2"/>
        <path d="M8 18l10-6 14-8" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeDasharray="2 3"/>
      </svg>
    ),
  },
]

export function WhatWeDo() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.reveal')
    if (!cards) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    cards.forEach(c => obs.observe(c))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="solucoes" ref={sectionRef} className={styles.section}>
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <span className="tag-label" style={{ color: 'var(--text-muted)' }}>// o que fazemos</span>
          <h2 className={`display-lg ${styles.heading}`}>
            Tudo que o seu negócio precisa,<br />
            <span style={{ color: 'var(--forest-mid)' }}>em um só lugar.</span>
          </h2>
          <p className={styles.headingSub}>
            Não trabalhamos em silos. Cada competência se conecta
            para entregar um resultado maior do que a soma das partes.{' '}
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              (Sim, conseguimos fazer tudo isso de verdade.)
            </span>
          </p>
        </div>

        <div className={styles.grid}>
          {SERVICES.map((s, i) => (
            <div
              key={s.id}
              className={`${styles.card} ${styles[`card--${s.color}`]} ${styles[`card--${s.size}`]} reveal reveal-delay-${Math.min(i, 5)}`}
            >
              <div className={styles.cardIcon}>{s.icon}</div>
              <span className={`${styles.cardTag} tag-label`}>{s.tag}</span>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardDesc}>{s.desc}</p>
              <div className={styles.cardArrow}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9h10M10 5l4 4-4 4"
                        stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
