const diferenciais = [
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Corretor dedicado, não call center',
    desc: 'Você fala sempre com o Gabriel — não com um atendente diferente a cada contato. Seu corretor conhece sua apólice, sua família e seus objetivos.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Cuida da apólice pelo ciclo de vida',
    desc: 'Nosso trabalho não termina na assinatura. Acompanhamos renovações, adequamos coberturas quando sua vida muda e te lembramos antes de qualquer vencimento.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: 'Parcerias com as melhores seguradoras',
    desc: 'Trabalhamos com Porto Seguro, SulAmérica, Bradesco Saúde, Amil, Unimed e outras líderes de mercado — sempre indicando a mais adequada para o seu perfil.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Raízes em Salvador, cobertura nacional',
    desc: 'Somos da Bahia e conhecemos o mercado local. Mas as coberturas que oferecemos atuam em todo o território nacional.',
  },
]

export default function Sobre() {
  return (
    <section id="sobre" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 72,
          alignItems: 'start',
        }}>
          {/* Coluna de texto */}
          <div>
            <span className="section-eyebrow">Por que a Seu Legado?</span>
            <h2 className="section-title">
              Um corretor que pensa no seu futuro, não só na venda
            </h2>
            <p style={{ fontSize: 16, color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 36 }}>
              Gabriel Vital fundou a Seu Legado Seguro com uma missão clara: oferecer proteção real
              para profissionais que constroem patrimônio e legado — com atendimento humano, técnico
              e de longo prazo.
            </p>

            <blockquote style={{
              borderLeft: '3px solid var(--navy)',
              paddingLeft: 24,
              marginBottom: 40,
            }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 20,
                color: 'var(--navy)',
                lineHeight: 1.6,
                marginBottom: 12,
              }}>
                "Meu objetivo não é vender um seguro. É garantir que quando algo inesperado acontecer,
                o meu cliente e sua família estejam de verdade protegidos."
              </p>
              <footer style={{ fontStyle: 'normal', fontWeight: 600, color: 'var(--gray-600)', fontSize: 14 }}>
                — Gabriel Vital, Corretor SUSEP
              </footer>
            </blockquote>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: 32 }}>
              {[['10+', 'Anos no mercado'], ['500+', 'Famílias atendidas'], ['15+', 'Parceiras']].map(([n, l]) => (
                <div key={l}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 30, fontWeight: 700, color: 'var(--navy)', lineHeight: 1,
                  }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid de diferenciais */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {diferenciais.map(d => (
              <div key={d.title} style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow)',
                border: '1px solid var(--gray-200)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--steel)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--gray-200)'
                e.currentTarget.style.boxShadow = 'var(--shadow)'
              }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, marginBottom: 14,
                  background: 'var(--steel-light)', color: 'var(--navy)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {d.icon}
                </div>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16, fontWeight: 600, color: 'var(--navy)', marginBottom: 8, lineHeight: 1.3,
                }}>{d.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.65 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #sobre .container > div {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  )
}
