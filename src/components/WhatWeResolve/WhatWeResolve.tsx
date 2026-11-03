import { useEffect, useRef } from 'react'
import styles from './WhatWeResolve.module.css'

const PROBLEMS = [
  {
    id: 'site',
    problem: 'Site que não converte',
    solution: 'Redesenhamos a experiência com foco em performance e conversão — layout, copy e CTA alinhados ao seu objetivo.',
    icon: '🌐',
    color: 'lime',
  },
  {
    id: 'marketing',
    problem: 'Marketing sem resultado',
    solution: 'Estratégia integrada de tráfego pago, conteúdo e SEO para gerar leads e vender — não apenas engajamento.',
    icon: '📣',
    color: 'amber',
  },
  {
    id: 'processos',
    problem: 'Processos comerciais bagunçados',
    solution: 'Mapeamos seu funil, identificamos os gargalos e estruturamos um processo de vendas que escala.',
    icon: '⚙️',
    color: 'coral',
  },
  {
    id: 'presenca',
    problem: 'Sem presença digital relevante',
    solution: 'Do zero ou do caos: construímos uma presença digital coerente que comunica valor para o cliente certo.',
    icon: '📍',
    color: 'lime',
  },
  {
    id: 'sistemas',
    problem: 'Sistemas que não se conversam',
    solution: 'Integramos suas ferramentas — CRM, ERP, e-commerce, atendimento — para que os dados fluam e o time perca menos tempo.',
    icon: '🔗',
    color: 'amber',
  },
  {
    id: 'clientes',
    problem: 'Dificuldade de captar clientes',
    solution: 'Criamos estratégias de aquisição que funcionam no seu contexto — com o orçamento e o canal certos para o seu mercado.',
    icon: '🎯',
    color: 'coral',
  },
  {
    id: 'manual',
    problem: 'Tarefas manuais que travam o crescimento',
    solution: 'Automatizamos os processos repetitivos usando IA e integrações, para você focar no que realmente importa.',
    icon: '🤖',
    color: 'lime',
  },
]

export function WhatWeResolve() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const items = sectionRef.current?.querySelectorAll('.reveal')
    if (!items) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    items.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="problemas" ref={sectionRef} className={styles.section}>
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <span className="tag-label" style={{ color: 'var(--text-muted)' }}>// problemas que resolvemos</span>
          <h2 className={`display-lg ${styles.heading}`}>
            Parece familiar?
          </h2>
          <p className={styles.headingSub}>
            Vire o card para ver como a Abacat resolve cada um desses problemas.
          </p>
        </div>

        <div className={styles.grid}>
          {PROBLEMS.map((item, i) => (
            <div
              key={item.id}
              className={`${styles.flipCard} ${styles[`flip--${item.color}`]} reveal reveal-delay-${Math.min(i % 4, 4)}`}
              role="button"
              tabIndex={0}
              aria-label={`${item.problem} — clique para ver a solução`}
            >
              <div className={styles.flipInner}>
                {/* Front: Problem */}
                <div className={styles.flipFront}>
                  <span className={styles.flipEmoji} aria-hidden="true">{item.icon}</span>
                  <h3 className={styles.flipTitle}>{item.problem}</h3>
                  <span className={styles.flipHint}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    ver solução
                  </span>
                </div>

                {/* Back: Solution */}
                <div className={styles.flipBack}>
                  <div className={styles.flipBackIcon} aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className={styles.flipSolution}>{item.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Bridge */}
        <div className={`${styles.bridge} reveal`}>
          <p className={styles.bridgeText}>
            Se você se identificou com algum desses pontos, a Abacat provavelmente pode ajudar.
          </p>
          <a
            href="https://wa.me/5500000000000?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Abacat%20e%20quero%20conversar%20sobre%20meu%20negócio."
            className={styles.bridgeBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            Vamos conversar
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
