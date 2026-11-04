import styles from './HowWeWork.module.css'

const STEPS = [
  {
    num: '01',
    title: 'Entender',
    sub: 'O negócio primeiro',
    desc: 'Antes de qualquer solução, entendemos o seu negócio, seus desafios e seus objetivos reais. Não chegamos com um deck de 40 slides. Chegamos com as perguntas certas.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M20 20l7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M11 14h6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Planejar',
    sub: 'Clareza antes da ação',
    desc: 'Identificamos os gargalos, priorizamos as oportunidades e definimos o caminho mais direto para o resultado. Sem enrolação, sem meses de planejamento que nunca saem do papel.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 16l4 4 8-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 10h12M10 22h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Construir',
    sub: 'Execução de verdade',
    desc: 'Desenvolvemos, desenhamos, ativamos. Da landing page ao sistema, do post ao anúncio — a Abacat executa com agilidade e critério, sem terceirizar o que importa.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 26l4-4 12-12 4 4-12 12-4 4-4-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M22 6l4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="8" cy="24" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Evoluir',
    sub: 'Crescimento contínuo',
    desc: 'Acompanhamos os resultados, medimos o que funciona e melhoramos continuamente. Não somos parceiros de projeto pontual — queremos ver seu negócio crescer de verdade.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 22l6-8 6 4 8-12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 10h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="28" cy="28" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M25.8 25.8l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export function HowWeWork() {
  return (
    <section id="como-trabalhamos" className={styles.section}>
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <span className="tag-label" style={{ color: 'var(--text-muted)' }}>// nossa metodologia</span>
          <h2 className={`display-lg ${styles.heading}`}>
            Nossa forma<br />
            <span className="text-lime">de trabalhar.</span>
          </h2>
          <p className={styles.headingSub}>
            Não queremos apenas executar tarefas isoladas. Queremos entender
            o problema completo e conectar as soluções certas.
          </p>
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`${styles.step} reveal reveal-delay-${i + 1}`}
            >
              {/* Connector line (not on last) */}
              {i < STEPS.length - 1 && (
                <div className={styles.connector} aria-hidden="true">
                  <div className={styles.connectorLine} />
                  <div className={styles.connectorDot} />
                </div>
              )}

              <div className={styles.stepNum} aria-hidden="true">{step.num}</div>

              <div className={styles.stepIcon}>{step.icon}</div>

              <div className={styles.stepContent}>
                <span className={`tag-label ${styles.stepSub}`}>{step.sub}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom callout */}
        <div className={`${styles.callout} reveal`}>
          <div className={styles.calloutInner}>
            <div className={styles.calloutIcon} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 4C8.477 4 4 8.477 4 14s4.477 10 10 10 10-4.477 10-10S19.523 4 14 4z"
                      stroke="var(--lime-flash)" strokeWidth="1.8"/>
                <path d="M14 10v4l3 3" stroke="var(--lime-flash)" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className={styles.calloutText}>
              Da primeira conversa até o resultado — a Abacat está junto em cada etapa.
              <span className={styles.calloutAccent}> Sem passar o bastão para terceiros.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
