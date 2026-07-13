const WA_NUMBER = '5571999999999'

const stats = [
  { num: '10+', label: 'Anos de experiência' },
  { num: '500+', label: 'Famílias protegidas' },
  { num: '15+', label: 'Seguradoras parceiras' },
]

export default function Hero() {
  return (
    <section id="inicio" style={{
      background: 'var(--white)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: 72,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Fundo decorativo suave */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: '48%', height: '100%',
        background: 'var(--steel-light)',
        clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)',
        zIndex: 0,
      }} />

      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 64,
        alignItems: 'center',
        padding: '80px 28px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Coluna de texto */}
        <div>
          <span className="section-eyebrow">Corretora de Seguros · Salvador, BA</span>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 5.5vw, 68px)',
            fontWeight: 600,
            color: 'var(--navy)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 24,
          }}>
            Proteja o que<br />
            <em style={{ fontStyle: 'italic', fontWeight: 400 }}>você construiu.</em>
          </h1>

          <p style={{
            fontSize: 18,
            color: 'var(--gray-600)',
            lineHeight: 1.8,
            marginBottom: 36,
            maxWidth: 460,
          }}>
            Seguro de saúde, vida e previdência para médicos, advogados e profissionais
            liberais em Salvador. Atendimento personalizado. Cobertura real. Legado protegido.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a className="btn-primary" href={`https://wa.me/${WA_NUMBER}?text=Olá,%20quero%20uma%20cotação%20gratuita`} target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.847L.057 23.882l6.198-1.447A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.887 9.887 0 01-5.031-1.376l-.362-.214-3.68.859.874-3.595-.235-.373A9.88 9.88 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.42 0 9.894 4.474 9.894 9.894 0 5.42-4.474 9.894-9.894 9.894z"/>
              </svg>
              Solicitar cotação grátis
            </a>
            <a className="btn-outline" href="#produtos">
              Conhecer produtos
            </a>
          </div>

          <div style={{
            display: 'flex', gap: 40, marginTop: 52,
            paddingTop: 32, borderTop: '1px solid var(--gray-100)',
          }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 34, fontWeight: 700, color: 'var(--navy)',
                  lineHeight: 1,
                }}>{s.num}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna visual */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', minHeight: 420,
        }}>
          {/* Card principal com icon */}
          <div style={{
            width: 300, height: 300,
            background: 'var(--navy)',
            borderRadius: 28,
            backgroundImage: "url('/assets/icon-navy-bg.png')",
            backgroundSize: '58%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            boxShadow: '0 32px 80px rgba(0,58,112,0.28)',
            position: 'relative', zIndex: 2,
          }} />

          {/* Cartão flutuante - experiência */}
          <div style={{
            position: 'absolute', top: 32, right: -16,
            background: 'var(--white)',
            borderRadius: 14,
            padding: '16px 22px',
            boxShadow: '0 8px 32px rgba(0,58,112,0.13)',
            border: '1px solid var(--gray-100)',
            zIndex: 3,
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28, fontWeight: 700, color: 'var(--navy)', lineHeight: 1,
            }}>10+</div>
            <div style={{ fontSize: 11, color: 'var(--gray-600)', marginTop: 3 }}>Anos de experiência</div>
          </div>

          {/* Cartão flutuante - famílias */}
          <div style={{
            position: 'absolute', bottom: 40, left: -16,
            background: 'var(--navy)',
            borderRadius: 14,
            padding: '16px 22px',
            boxShadow: '0 8px 32px rgba(0,58,112,0.25)',
            zIndex: 3,
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28, fontWeight: 700, color: 'var(--white)', lineHeight: 1,
            }}>500+</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>Famílias protegidas</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #inicio > .container {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
            padding: 60px 20px !important;
          }
          #inicio > .container > div:last-child { display: none !important; }
          #inicio > .container > div:first-child > div:last-child { gap: 24px !important; }
        }
        #inicio::before {
          display: none;
        }
        @media (max-width: 768px) {
          #inicio > div[style*="position: absolute"] { display: none !important; }
        }
      `}</style>
    </section>
  )
}
