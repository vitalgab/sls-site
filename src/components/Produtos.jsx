import { WA_NUMBER } from '../contato'

const produtos = [
  {
    id: 'saude',
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    featured: true,
    title: 'Plano de Saúde',
    tag: 'Saúde',
    desc: 'Acesso aos melhores hospitais e clínicas. Planos individuais e familiares com coberturas amplas e atendimento personalizado na escolha.',
    items: ['Internação e cirurgias', 'Exames e consultas', 'Saúde mental inclusa', 'Reembolso de despesas'],
    cta: 'Simular plano',
  },
  {
    id: 'vida',
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Seguro de Vida',
    tag: 'Vida',
    desc: 'Garante que sua família mantenha o padrão de vida mesmo diante de imprevistos. Indenização em morte, invalidez e doenças graves.',
    items: ['Indenização por morte', 'Invalidez permanente', 'Doenças graves (câncer, AVC...)', 'Diária hospitalar'],
    cta: 'Quero cobertura de vida',
  },
  {
    id: 'previdencia',
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Previdência Privada',
    tag: 'Previdência',
    desc: 'Complemento ao INSS ou construção de patrimônio para a aposentadoria. PGBL ou VGBL com eficiência fiscal e liberdade de resgate.',
    items: ['PGBL e VGBL', 'Dedução no IR (PGBL)', 'Portabilidade entre planos', 'Benefício de risco incluso'],
    cta: 'Planejar aposentadoria',
  },
  {
    id: 'rc',
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'RC Profissional',
    tag: 'Responsabilidade',
    desc: 'Para médicos, advogados e outros profissionais. Cobertura contra reclamações e processos decorrentes de erros ou omissões profissionais.',
    items: ['RC Médico e Advogado', 'Custas processuais', 'Honorários de defesa', 'Cobertura retroativa'],
    cta: 'Contratar RC Profissional',
  },
]

export default function Produtos() {
  return (
    <section id="produtos" style={{ background: 'var(--white)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-eyebrow">Produtos</span>
          <h2 className="section-title" style={{ margin: '0 auto 16px' }}>
            Soluções para cada fase da sua vida
          </h2>
          <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
            Do plano de saúde à aposentadoria. Trabalhamos com as melhores seguradoras para encontrar a cobertura certa para você.
          </p>
        </div>

        <div className="produtos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {produtos.map(p => (
            <div key={p.id} style={{
              borderRadius: 'var(--radius-lg)',
              border: p.featured ? '2px solid var(--navy)' : '1.5px solid var(--gray-200)',
              background: p.featured ? 'var(--navy)' : 'var(--white)',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: p.featured ? '0 16px 56px rgba(0,30,65,0.22)' : 'var(--shadow)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = p.featured ? '0 24px 64px rgba(0,30,65,0.30)' : 'var(--shadow-lg)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = p.featured ? '0 16px 56px rgba(0,30,65,0.22)' : 'var(--shadow)'
            }}
            >
              {p.tag && (
                <span style={{
                  position: 'absolute', top: -12, left: 20,
                  background: p.featured ? 'var(--white)' : 'var(--navy)',
                  color: p.featured ? 'var(--navy)' : '#fff',
                  fontSize: 10, fontWeight: 700,
                  padding: '4px 12px', borderRadius: 20, letterSpacing: 0.5,
                }}>{p.tag}</span>
              )}

              <div style={{
                width: 60, height: 60, borderRadius: 14, marginBottom: 20,
                background: p.featured ? 'rgba(255,255,255,0.14)' : 'var(--steel-light)',
                color: p.featured ? '#fff' : 'var(--navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {p.icon}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 21, fontWeight: 400,
                color: p.featured ? '#fff' : 'var(--navy)',
                marginBottom: 8,
              }}>
                {p.title}
              </h3>
              <p style={{
                fontSize: 13, lineHeight: 1.75, flex: 1, marginBottom: 20,
                color: p.featured ? 'rgba(255,255,255,0.72)' : 'var(--gray-600)',
              }}>
                {p.desc}
              </p>

              <ul style={{ listStyle: 'none', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.items.map(item => (
                  <li key={item} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 12, color: p.featured ? 'rgba(255,255,255,0.85)' : 'var(--gray-800)',
                  }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      background: p.featured ? 'rgba(255,255,255,0.14)' : 'var(--steel-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: p.featured ? '#fff' : 'var(--navy)',
                      fontSize: 9, fontWeight: 700,
                    }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <p style={{
                fontSize: 11,
                fontStyle: 'italic',
                marginBottom: 28,
                color: p.featured ? 'rgba(255,255,255,0.6)' : 'var(--gray-500)',
              }}>
                dentre outras...
              </p>

              <a
                href={`https://wa.me/${WA_NUMBER}?text=Olá,%20tenho%20interesse%20em%20${encodeURIComponent(p.title)}`}
                target="_blank" rel="noopener"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '11px 16px', borderRadius: 'var(--radius)',
                  background: p.featured ? '#fff' : 'var(--navy)',
                  color: p.featured ? 'var(--navy)' : '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'opacity 0.2s', textDecoration: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=Olá,%20quero%20saber%20mais%20sobre%20outros%20tipos%20de%20seguro`}
            target="_blank" rel="noopener"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              border: '2px solid var(--navy)', borderRadius: 50,
              padding: '15px 40px',
              color: 'var(--navy)', fontWeight: 600, fontSize: 15,
              fontFamily: 'var(--font-body)',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--navy)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--navy)'
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Seguros de demais ramos — Auto, Residencial, Empresarial e mais
          </a>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .produtos-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 520px) {
            .produtos-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  )
}
