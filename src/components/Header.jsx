import { useState, useEffect } from 'react'

const WA_NUMBER = '5571999999999'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Para quem', href: '#para-quem' },
    { label: 'Produtos', href: '#produtos' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Contato', href: '#contato' },
  ]

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--white)',
      borderBottom: scrolled ? '1px solid var(--gray-200)' : '1px solid transparent',
      boxShadow: scrolled ? '0 2px 20px rgba(0,58,112,0.07)' : 'none',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 72,
      }}>
        <a href="#inicio" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/assets/logo-color-transparent.png"
            alt="Seu Legado Seguro"
            style={{ height: 48, width: 'auto' }}
          />
        </a>

        <nav style={{ display: 'flex', gap: 36, alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} style={{
              color: 'var(--gray-600)',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: 0.2,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--navy)'}
            onMouseLeave={e => e.target.style.color = 'var(--gray-600)'}
            >
              {link.label}
            </a>
          ))}
          <a
            className="btn-primary"
            href={`https://wa.me/${WA_NUMBER}?text=Olá,%20quero%20uma%20cotação`}
            target="_blank" rel="noopener"
            style={{ padding: '10px 20px', fontSize: 14 }}
          >
            Solicitar cotação
          </a>
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--navy)', padding: 8 }}
          aria-label="Menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {menuOpen
              ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div style={{
          background: 'var(--white)',
          borderTop: '1px solid var(--gray-200)',
          padding: '20px 28px 28px',
          display: 'flex', flexDirection: 'column', gap: 20,
          boxShadow: '0 8px 32px rgba(0,58,112,0.08)',
        }}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href}
              style={{ color: 'var(--gray-800)', fontSize: 16, fontWeight: 500 }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            className="btn-primary"
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank" rel="noopener"
            style={{ textAlign: 'center', justifyContent: 'center' }}
            onClick={() => setMenuOpen(false)}
          >
            Falar pelo WhatsApp
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  )
}
