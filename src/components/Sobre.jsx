// Servida do proprio site, nao de CDN de terceiro: a foto de fundo nao pode
// depender de um host que sai do ar. Procedencia em public/assets/FONTES.md.
const FAIXA_IMG = `${import.meta.env.BASE_URL}assets/faixa-familia.webp`
// Os rotulos ficam em HTML, FORA da imagem: <text> dentro de SVG nao quebra
// linha sozinho e, em 390px, "FOCO NO CLIENTE" saia da viewBox sem aviso.
const TRIANGULO = `${import.meta.env.BASE_URL}assets/triangulo-pilares.svg`

const pilares = [
  { n: '01', label: 'Confiança', desc: 'Transparência em cada indicação. Você sabe exatamente o que está contratando e por quê.' },
  { n: '02', label: 'Longo Prazo', desc: 'Não vendemos e desaparecemos. Acompanhamos sua apólice ao longo de toda a sua vida.' },
  { n: '03', label: 'Foco no Cliente', desc: 'A cobertura certa para o seu perfil — não a mais cara, nem a mais simples. A mais adequada.' },
]

const diferenciais = [
  {
    icon: (
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Corretor dedicado, não call center',
    desc: 'Você fala sempre com um corretor dedicado e especialista. Ele conhece sua necessidade, sua família, seus objetivos e suas apólices.',
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Acompanha a cobertura de ponta a ponta',
    desc: 'Nosso trabalho não termina na assinatura. Acompanhamos renovações, adequamos coberturas quando sua vida muda e avisamos antes de qualquer vencimento.',
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: 'As melhores seguradoras parceiras',
    desc: 'Porto Seguro, SulAmérica, Bradesco Saúde, Amil, Unimed, Azos e outras — sempre indicando a mais adequada para o seu perfil e objetivo.',
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'Atendimento em todo o Brasil',
    desc: 'Atendemos clientes de norte a sul do país. Onde você estiver, a Seu Legado está com você — digital, ágil e com o mesmo padrão de atenção.',
  },
]

export default function Sobre() {
  return (
    <>
      {/* Faixa parallax com a missão */}
      <div className="faixa-parallax" style={{
        height: 300,
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `url('${FAIXA_IMG}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundAttachment: 'fixed',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(0deg, rgba(0,15,40,0.82) 0%, rgba(0,15,40,0.65) 100%)',
        }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 720 }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 3vw, 40px)',
              fontStyle: 'normal',
              fontWeight: 300,
              color: '#fff',
              lineHeight: 1.35,
              textShadow: '0 2px 24px rgba(0,0,0,0.6)',
              margin: 0,
            }}>
              Nosso propósito é cuidar do nosso cliente. Somos especialistas em proteger{' '}
              <em style={{ fontWeight: 700, fontStyle: 'normal' }}>famílias, carreiras e legados</em>.
            </p>
          </div>
        </div>
      </div>

      <section id="sobre" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="sobre-top" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 72,
            alignItems: 'start',
            marginBottom: 64,
          }}>
            <div>
              <span className="section-eyebrow">Por que a Seu Legado?</span>
              <h2 className="section-title">Uma corretora que pensa em você, não na venda</h2>
              <p style={{ fontSize: 16, color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 36 }}>
                A Seu Legado Seguro tem três pilares muito claros:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                {pilares.map(pi => (
                  <div key={pi.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 13, fontWeight: 700, color: 'var(--navy)',
                      opacity: 0.35, letterSpacing: 1, flexShrink: 0, paddingTop: 2,
                    }}>{pi.n}</span>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 19, fontWeight: 600, color: 'var(--navy)', marginBottom: 4,
                      }}>{pi.label}</div>
                      <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7 }}>{pi.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pilares-fig">
              <div className="pilares-linha">
                <span className="pilar-rotulo pilar-esq" style={{ color: '#4B6A8A' }}>Foco no cliente</span>
                <img
                  className="pilares-img"
                  src={TRIANGULO}
                  width="320" height="251"
                  alt="Pilares Seu Legado Seguro: Confiança, Longo Prazo e Foco no Cliente"
                />
                <span className="pilar-rotulo pilar-dir" style={{ color: '#003A70' }}>Confiança</span>
              </div>
              <span className="pilar-rotulo pilar-base" style={{ color: '#A6872F' }}>Longo prazo</span>
            </div>

            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: 8 }}>
              <blockquote style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontStyle: 'normal',
                fontWeight: 300,
                color: 'var(--navy)',
                lineHeight: 1.6,
                borderLeft: 'none',
                margin: 0,
                padding: 0,
              }}>
                "Meu objetivo é que você e sua família tenham a tranquilidade que merecem — com a cobertura certa, pelo preço justo."
              </blockquote>
              <footer style={{
                fontSize: 13, fontWeight: 600, color: 'var(--gray-600)',
                marginTop: 12, letterSpacing: 0.5,
              }}>
                — Gabriel Vital
              </footer>
            </div>
          </div>

          <div className="diferenciais-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {diferenciais.map(d => (
              <div key={d.title} className="dif-card" style={{
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 24px',
                border: '1.5px solid var(--gray-200)',
                transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 18,
                  background: 'var(--steel-light)', color: 'var(--navy)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {d.icon}
                </div>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18, fontWeight: 600, color: 'var(--navy)',
                  marginBottom: 10, lineHeight: 1.3,
                }}>{d.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.7 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .dif-card:hover {
            border-color: var(--navy) !important;
            box-shadow: var(--shadow-md);
            background: var(--white) !important;
          }
          /* Rotulo FORA da figura, nunca por cima: a linha e um flex de tres
             colunas, entao o espaco do texto sai do espaco da imagem em vez de
             cobri-la. Cada um alinhado a peca da sua cor — aco a esquerda,
             navy a direita, dourado na base. */
          .pilares-fig {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 14px; height: 100%;
          }
          .pilares-linha {
            display: flex; align-items: center; justify-content: center;
            gap: 14px; width: 100%;
          }
          .pilares-img {
            flex: 0 1 320px; min-width: 0;
            width: 100%; max-width: 320px; height: auto; display: block;
          }
          .pilar-rotulo {
            font-family: var(--font-display);
            font-weight: 600; font-size: 13px;
            letter-spacing: 1.2px; text-transform: uppercase;
            line-height: 1.35; flex-shrink: 0;
          }
          /* A largura tem de caber "CONFIANCA" INTEIRA: e uma palavra so, nao
             quebra linha, e max-width curto demais nao aperta — transborda. */
          .pilar-esq { max-width: 92px; text-align: right; }
          .pilar-dir { max-width: 92px; text-align: left; }
          .pilar-base { text-align: center; }
          @media (max-width: 560px) {
            .pilares-linha { gap: 10px; }
            .pilar-rotulo { font-size: 11px; letter-spacing: 0.6px; }
            .pilar-esq, .pilar-dir { max-width: 76px; }
          }
          @media (max-width: 400px) {
            .pilares-linha { gap: 8px; }
            .pilar-rotulo { font-size: 10px; letter-spacing: 0.4px; }
            .pilar-esq, .pilar-dir { max-width: 68px; }
          }
          /* background-attachment: fixed nao funciona no iOS — o Safari ignora e a
             foto sai esticada ou borrada. Abaixo de 768px vira scroll. */
          @media (max-width: 768px) {
            .faixa-parallax { background-attachment: scroll !important; }
          }
          @media (max-width: 900px) {
            .sobre-top { grid-template-columns: 1fr !important; gap: 36px !important; }
            .diferenciais-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .faixa-parallax { background-attachment: scroll !important; }
          }
          @media (max-width: 520px) {
            .diferenciais-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  )
}
