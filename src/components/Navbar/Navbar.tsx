import { useEffect, useRef, useState } from 'react'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Como trabalhamos', href: '#como-trabalhamos' },
  { label: 'Problemas que resolvemos', href: '#problemas' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      ref={navRef}
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
    >
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="#hero" className={styles.logo} onClick={() => handleNavClick('#hero')}>
          <svg className={styles.logoIcon} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#0B1A07"/>
            <ellipse cx="16" cy="17" rx="9" ry="11" fill="#1E4011"/>
            <ellipse cx="16" cy="18" rx="6" ry="7.5" fill="#C8D832"/>
            <ellipse cx="16" cy="20" rx="3.2" ry="3.5" fill="#8B5E3C"/>
            <polygon points="9,9 7,4 12,8" fill="#1E4011"/>
            <polygon points="23,9 25,4 20,8" fill="#1E4011"/>
            <polygon points="9.5,8.5 8,5 12,7.5" fill="#F4907A" opacity="0.7"/>
            <polygon points="22.5,8.5 24,5 20,7.5" fill="#F4907A" opacity="0.7"/>
          </svg>
          <span className={styles.logoText}>abacat</span>
        </a>

        {/* Desktop Nav */}
        <nav className={styles.nav} aria-label="Navegação principal">
          {NAV_LINKS.map(link => (
            <button
              key={link.href}
              className={styles.navLink}
              onClick={() => handleNavClick(link.href)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="https://wa.me/5500000000000?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Abacat%20e%20quero%20conversar."
          className={styles.ctaBtn}
          target="_blank"
          rel="noopener noreferrer"
        >
          Falar com a Abacat
        </a>

        {/* Mobile toggle */}
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        {NAV_LINKS.map(link => (
          <button
            key={link.href}
            className={styles.mobileNavLink}
            onClick={() => handleNavClick(link.href)}
          >
            {link.label}
          </button>
        ))}
        <a
          href="https://wa.me/5500000000000?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Abacat%20e%20quero%20conversar."
          className={styles.mobileCta}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuOpen(false)}
        >
          Falar com a Abacat
        </a>
      </div>
    </header>
  )
}
