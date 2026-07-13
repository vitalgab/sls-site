const WA_NUMBER = '5571999999999'
const SUSEP = 'XXXXXXXXXX'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy-dark)', color: 'rgba(255,255,255,0.65)', paddingTop: 64, paddingBottom: 36 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 52, marginBottom: 52 }}>

          {/* Coluna principal */}
          <div>
            <img
              src={`${import.meta.env.BASE_URL}assets/logo-white-transparent.png`}
              alt="Seu Legado Seguro"
              style={{ height: 52, width: 'auto', marginBottom: 20 }}
            />
            <p style={{ fontSize: 14, lineHeight: 1.8, maxWidth: 300 }}>
              Corretora de seguros em Salvador especializada em proteção para médicos,
              advogados e profissionais liberais.
            </p>
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank" rel="noopener"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24,
                color: '#4ade80', fontWeight: 600, fontSize: 14, transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.847L.057 23.882l6.198-1.447A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.887 9.887 0 01-5.031-1.376l-.362-.214-3.68.859.874-3.595-.235-.373A9.88 9.88 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.42 0 9.894 4.474 9.894 9.894 0 5.42-4.474 9.894-9.894 9.894z"/>
              </svg>
              (71) 9 9999-9999
            </a>
          </div>

          {/* Produtos */}
          <div>
            <h4 style={{ color: 'var(--white)', fontWeight: 700, fontSize: 11, marginBottom: 20, letterSpacing: 2.5, textTransform: 'uppercase' }}>
              Produtos
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Seguro Saúde', 'Seguro de Vida', 'Previdência Privada', 'RC Profissional', 'Seguro Auto', 'Seguro Residencial'].map(item => (
                <li key={item}>
                  <a href="#produtos" style={{ fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
                  >{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: 'var(--white)', fontWeight: 700, fontSize: 11, marginBottom: 20, letterSpacing: 2.5, textTransform: 'uppercase' }}>
              Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Para quem é', href: '#para-quem' },
                { label: 'Sobre nós', href: '#sobre' },
                { label: 'Contato', href: '#contato' },
              ].map(item => (
                <li key={item.label}>
                  <a href={item.href} style={{ fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
                  >{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 28,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 13 }}>© 2025 Seu Legado Seguro. Todos os direitos reservados.</p>
          <p style={{ fontSize: 13 }}>Corretor SUSEP nº {SUSEP} · Salvador, BA</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          footer .container > div:last-child {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  )
}
