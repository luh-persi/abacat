import styles from './Footer.module.css'

const YEAR = new Date().getFullYear()

const SECTIONS = [
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Como trabalhamos', href: '#como-trabalhamos' },
  { label: 'Problemas que resolvemos', href: '#problemas' },
  { label: 'Falar com a Abacat', href: '#contato' },
]

export function Footer() {
  const scroll = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logoRow}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#152B0B"/>
              <ellipse cx="16" cy="17" rx="9" ry="11" fill="#1E4011"/>
              <ellipse cx="16" cy="18" rx="6" ry="7.5" fill="#C8D832"/>
              <ellipse cx="16" cy="20" rx="3.2" ry="3.5" fill="#8B5E3C"/>
              <polygon points="9,9 7,4 12,8" fill="#1E4011"/>
              <polygon points="23,9 25,4 20,8" fill="#1E4011"/>
              <polygon points="9.5,8.5 8,5 12,7.5" fill="#F4907A" opacity="0.7"/>
              <polygon points="22.5,8.5 24,5 20,7.5" fill="#F4907A" opacity="0.7"/>
            </svg>
            <span className={styles.logoText}>abacat</span>
          </div>
          <p className={styles.tagline}>
            Criatividade que resolve.<br />
            Tecnologia que funciona.
          </p>
          <p className={styles.domain}>abacat.com.br</p>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Links rápidos">
          <span className={`tag-label ${styles.navTitle}`}>Navegação</span>
          {SECTIONS.map(s => (
            <button
              key={s.href}
              className={styles.navLink}
              onClick={() => scroll(s.href)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Contact info */}
        <div className={styles.contact}>
          <span className={`tag-label ${styles.navTitle}`}>Fale com a gente</span>
          <a
            href="https://wa.me/5500000000000"
            className={styles.contactLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 10L10 2M10 2H4M10 2v6"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <p className={styles.footerNote}>
            Tempo médio de resposta: algumas horas.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className="container">
          <p className={styles.copy}>
            © {YEAR} Abacat. Todos os direitos reservados.
          </p>
          <p className={styles.madeWith}>
            Feito com{' '}
            <span aria-label="amor" style={{ color: 'var(--lime-flash)' }}>♥</span>
            {' '}pela própria Abacat.
          </p>
        </div>
      </div>
    </footer>
  )
}
