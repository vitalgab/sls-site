const personas = [
  {
    icon: (
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: 'Médicos',
    desc: 'Você dedica anos estudando para construir uma carreira sólida. Mas e se uma reclamação de paciente, um afastamento por doença ou a falta de planejamento na aposentadoria colocarem tudo isso em risco?',
    highlight: 'RC Profissional · Saúde · Previdência',
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971z" />
      </svg>
    ),
    title: 'Advogados e Profissionais Liberais',
    desc: 'Profissionais autônomos não têm FGTS, INSS robusto, nem proteção corporativa. A segurança que você tem hoje depende exclusivamente do que você construiu — e de como protege isso.',
    highlight: 'Vida · Previdência · RC Profissional',
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    title: 'Famílias que pensam no legado',
    desc: 'Seguro de vida e previdência não são gastos — são instrumentos de planejamento. Garantem que o padrão de vida da sua família se mantenha mesmo diante de imprevistos ou na sua aposentadoria.',
    highlight: 'Vida · Previdência · Saúde familiar',
  },
]

export default function ParaQuem() {
  return (
    <section id="para-quem" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span className="section-eyebrow">Para quem é</span>
          <h2 className="section-title" style={{ margin: '0 auto 16px' }}>
            Proteção para quem mais precisa de cobertura real
          </h2>
          <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
            Profissionais de alta renda têm necessidades que um seguro CLT jamais vai cobrir.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {personas.map(p => (
            <div key={p.title} style={{
              background: 'var(--white)',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 36,
              boxShadow: 'var(--shadow)',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              e.currentTarget.style.borderColor = 'var(--steel)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'var(--shadow)'
              e.currentTarget.style.borderColor = 'var(--gray-200)'
            }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: 'var(--steel-light)',
                color: 'var(--navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
              }}>
                {p.icon}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22, fontWeight: 600, color: 'var(--navy)', marginBottom: 12,
              }}>{p.title}</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.75, marginBottom: 24, fontSize: 15 }}>{p.desc}</p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--steel-light)', color: 'var(--navy)',
                fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20,
                letterSpacing: 0.2,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                {p.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
