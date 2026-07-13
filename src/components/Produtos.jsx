const WA_NUMBER = '5571999999999'

const produtos = [
  {
    id: 'saude',
    featured: true,
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
    title: 'Seguro Saúde',
    tag: 'Mais procurado',
    desc: 'Acesso aos melhores hospitais e clínicas do Brasil. Planos individuais e familiares com coberturas amplas e atendimento personalizado na escolha.',
    items: ['Internação e cirurgias', 'Exames e consultas', 'Saúde mental inclusa', 'Reembolso de despesas', 'Planos nacionais e regionais'],
    cta: 'Simular plano de saúde',
  },
  {
    id: 'vida',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Seguro de Vida',
    tag: 'Proteção familiar',
    desc: 'Garante que sua família mantenha o padrão de vida mesmo diante de imprevistos. Indenização em morte, invalidez, doenças graves e diária por incapacidade.',
    items: ['Indenização por morte', 'Invalidez permanente', 'Doenças graves (câncer, AVC...)', 'Diária hospitalar'],
    cta: 'Quero proteção de vida',
  },
  {
    id: 'previdencia',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Previdência Privada',
    tag: 'Aposentadoria planejada',
    desc: 'Complemento ao INSS ou construção de patrimônio para a aposentadoria. PGBL ou VGBL com eficiência fiscal e liberdade de resgate.',
    items: ['PGBL e VGBL', 'Dedução no IR (PGBL)', 'Portabilidade entre planos', 'Benefício de risco incluso'],
    cta: 'Planejar minha aposentadoria',
  },
  {
    id: 'rc',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971z" />
      </svg>
    ),
    title: 'RC Profissional',
    tag: 'Em breve',
    desc: 'Para médicos, advogados e outros profissionais que precisam de cobertura contra reclamações e processos decorrentes de erros ou omissões profissionais.',
    items: ['RC Médico', 'RC Advogado', 'Custas processuais', 'Honorários de defesa'],
    cta: 'Me avise quando disponível',
    comingSoon: true,
  },
]

export default function Produtos() {
  return (
    <section id="produtos" style={{ background: 'var(--white)' }}>
      <div className="container">
        <div style={{ marginBottom: 60 }}>
          <span className="section-eyebrow">Produtos</span>
          <h2 className="section-title">Soluções para cada fase da sua vida</h2>
          <p className="section-sub">
            Do plano de saúde à aposentadoria. Trabalhamos com as melhores seguradoras
            para encontrar a cobertura certa para você.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {produtos.map(p => (
            <div key={p.id} style={{
              borderRadius: 'var(--radius-lg)',
              border: p.featured ? '2px solid var(--navy)' : '1px solid var(--gray-200)',
              background: p.featured ? 'var(--navy)' : 'var(--white)',
              padding: 32,
              display: 'flex', flexDirection: 'column',
              position: 'relative',
              opacity: p.comingSoon ? 0.75 : 1,
              boxShadow: p.featured ? 'var(--shadow-lg)' : 'var(--shadow)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              if (!p.comingSoon) {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = p.featured
                  ? '0 16px 56px rgba(0,58,112,0.28)'
                  : 'var(--shadow-lg)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = p.featured ? 'var(--shadow-lg)' : 'var(--shadow)'
            }}
            >
              {p.tag && (
                <span style={{
                  position: 'absolute', top: -13, left: 24,
                  background: p.featured ? 'var(--white)' : p.comingSoon ? 'var(--gray-600)' : 'var(--navy)',
                  color: p.featured ? 'var(--navy)' : 'white',
                  fontSize: 11, fontWeight: 700,
                  padding: '4px 12px', borderRadius: 20, letterSpacing: 0.5,
                }}>{p.tag}</span>
              )}

              <div style={{
                width: 52, height: 52, borderRadius: 12, marginBottom: 20,
                background: p.featured ? 'rgba(255,255,255,0.12)' : 'var(--steel-light)',
                color: p.featured ? 'var(--white)' : 'var(--navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {p.icon}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22, fontWeight: 600,
                color: p.featured ? 'var(--white)' : 'var(--navy)',
                marginBottom: 10,
              }}>
                {p.title}
              </h3>
              <p style={{
                fontSize: 14, lineHeight: 1.75, flex: 1, marginBottom: 20,
                color: p.featured ? 'rgba(255,255,255,0.75)' : 'var(--gray-600)',
              }}>
                {p.desc}
              </p>

              <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {p.items.map(item => (
                  <li key={item} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 13, color: p.featured ? 'rgba(255,255,255,0.85)' : 'var(--gray-800)',
                  }}>
                    <span style={{ color: p.featured ? 'rgba(255,255,255,0.6)' : 'var(--navy)', flexShrink: 0, fontSize: 16 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={p.comingSoon ? '#contato' : `https://wa.me/${WA_NUMBER}?text=Olá,%20tenho%20interesse%20em%20${encodeURIComponent(p.title)}`}
                target={p.comingSoon ? '_self' : '_blank'}
                rel="noopener"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 'var(--radius)',
                  background: p.featured ? 'var(--white)' : 'transparent',
                  border: p.featured ? 'none' : '1.5px solid var(--navy)',
                  color: p.featured ? 'var(--navy)' : 'var(--navy)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 36, color: 'var(--gray-600)', fontSize: 14 }}>
          Também trabalhamos com seguro auto, residencial e empresarial.{' '}
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener"
            style={{ color: 'var(--navy)', fontWeight: 600, borderBottom: '1px solid var(--steel)' }}>
            Fale com a gente.
          </a>
        </p>
      </div>
    </section>
  )
}
