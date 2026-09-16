const perfis = [
  {
    photo: 'assets/persona-rc-profissional.webp',
    photoAlt: 'Profissional liberal',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Profissionais Liberais',
    subtitle: 'RC Profissional · Vida · Previdência',
    desc: 'Autônomo não tem rede de proteção corporativa. Sua segurança depende das escolhas que você faz hoje — e nós ajudamos a fazer as escolhas certas.',
  },
  {
    photo: 'assets/persona-medico.webp',
    photoAlt: 'Médico',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: 'Médicos e Profissionais de Saúde',
    subtitle: 'Plano de Saúde · Vida · RC Médico',
    desc: 'Uma carreira construída com anos de estudo merece uma proteção à altura. Coberturas específicas para profissionais da saúde — com plano de saúde e RC médico.',
  },
  {
    photo: 'assets/persona-advogado.webp',
    photoAlt: 'Advogado e profissional liberal',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    title: 'Advogados',
    subtitle: 'RC Profissional · Previdência · Vida',
    desc: 'Para quem constrói seu próprio escritório ou atua em sociedade. RC Profissional e previdência privada são os pilares da sua proteção como operador do direito.',
  },
  {
    photo: 'assets/persona-clt.webp',
    photoAlt: 'Profissional CLT',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    title: 'Profissionais CLT',
    subtitle: 'Vida · Invalidez · Previdência',
    desc: 'Para quem trabalha em empresa privada. Num imprevisto, o INSS pode não ser suficiente para manter sua renda e proteger sua família. Montamos a proteção que complementa o que a carteira assinada não cobre.',
  },
]

export default function ParaQuem() {
  return (
    <section id="para-quem" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span className="section-eyebrow">Para quem é</span>
          <h2 className="section-title" style={{ margin: '0 auto 16px' }}>
            Para quem se preocupa com<br />família, carreira e legado
          </h2>
          <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
            Cada perfil tem necessidades diferentes. Nós entendemos isso — e encontramos a proteção certa para cada um.
          </p>
        </div>

        {/* 4 cartoes: 4 colunas, 2x2 ou 1 — os tres divisores de 4. Nunca sobra
            cartao solto numa ultima linha pela metade. */}
        <div className="paraquem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {perfis.map(p => (
            <div key={p.title} className="paraquem-card" style={{
              background: 'var(--white)',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow)',
              transition: 'transform 0.22s, box-shadow 0.22s, border-color 0.22s',
            }}>
              {/* A foto e PNG/WebP transparente: quem pinta o fundo e este
                  container, na cor da marca. Antes a cor vinha queimada dentro
                  do JPG e nao batia com a do cartao — dava a impressao de
                  imagem colada, com cantos brancos por cima do arredondamento.
                  O arredondamento agora e do cartao (overflow hidden), nao da
                  imagem. */}
              <div style={{ height: 300, overflow: 'hidden', position: 'relative', background: 'var(--navy)' }}>
                <img
                  src={`${import.meta.env.BASE_URL}${p.photo}`}
                  alt={p.photoAlt}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(0deg, rgba(0,20,52,0.35) 0%, transparent 40%)',
                }} />
              </div>

              <div style={{ padding: '0 28px', marginTop: -28, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'var(--white)',
                  boxShadow: '0 4px 16px rgba(0,58,112,0.14)',
                  border: '2px solid var(--steel-light)',
                  color: 'var(--navy)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {p.icon}
                </div>
              </div>

              <div style={{ padding: '14px 28px 32px' }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 21, fontWeight: 400, color: 'var(--navy)',
                  marginBottom: 10, lineHeight: 1.25,
                }}>{p.title}</h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.75, fontSize: 14 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .paraquem-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg) !important;
          border-color: var(--steel) !important;
        }
        @media (max-width: 1199px) {
          .paraquem-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .paraquem-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
