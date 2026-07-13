const parceiras = [
  { nome: 'Porto Seguro', desc: 'Líder em seguros no Brasil' },
  { nome: 'SulAmérica', desc: 'Saúde e previdência' },
  { nome: 'Bradesco Saúde', desc: 'Planos de saúde' },
  { nome: 'Amil', desc: 'Saúde corporativa' },
  { nome: 'Unimed', desc: 'Cooperativa médica' },
  { nome: 'Zurich', desc: 'Seguros corporativos' },
]

export default function Seguradoras() {
  return (
    <section style={{ background: 'var(--white)', paddingTop: 56, paddingBottom: 56 }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
            color: 'var(--navy)', opacity: 0.4, marginBottom: 0,
          }}>
            Trabalhamos com as melhores seguradoras do Brasil
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
        }}>
          {parceiras.map(p => (
            <div key={p.nome} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 22px',
              background: 'var(--gray-50)',
              border: '1px solid var(--gray-200)',
              borderRadius: 40,
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--steel)'
              e.currentTarget.style.background = 'var(--steel-light)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--gray-200)'
              e.currentTarget.style.background = 'var(--gray-50)'
            }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--navy)', opacity: 0.4,
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 14, fontWeight: 600, color: 'var(--navy)',
              }}>{p.nome}</span>
              <span style={{
                fontSize: 12, color: 'var(--gray-600)',
              }}>· {p.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
