// Servida do proprio site, nao de CDN de terceiro: a foto de fundo nao pode
// depender de um host que sai do ar. Procedencia em public/assets/FONTES.md.
const FAIXA_IMG = `${import.meta.env.BASE_URL}assets/faixa-familia.webp`
// Os rotulos ficam em HTML, FORA da imagem: <text> dentro de SVG nao quebra
// linha sozinho e, em 390px, "FOCO NO CLIENTE" saia da viewBox sem aviso.
const TRIANGULO = `${import.meta.env.BASE_URL}assets/triangulo-pilares.svg`
const FOTO_GABRIEL = `${import.meta.env.BASE_URL}assets/gabriel.webp`

const pilares = [
  { n: '01', label: 'Confiança', desc: 'Transparência em cada indicação. Você sabe exatamente o que está contratando e por quê.' },
  { n: '02', label: 'Longo Prazo', desc: 'Não vendemos e desaparecemos. Acompanhamos sua apólice ao longo de toda a sua vida.' },
  { n: '03', label: 'Foco no Cliente', desc: 'A cobertura certa para o seu perfil — não a mais cara, nem a mais simples. A mais adequada.' },
]

const diferenciais = [
  {
    icon: (
      <svg style={{ width: 'var(--icone-m)', height: 'var(--icone-m)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Corretor dedicado, não call center',
    desc: 'Você fala sempre com um corretor dedicado e especialista. Ele conhece sua necessidade, sua família, seus objetivos e suas apólices.',
  },
  {
    icon: (
      <svg style={{ width: 'var(--icone-m)', height: 'var(--icone-m)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Acompanhamento de ponta a ponta',
    desc: 'Nosso trabalho não termina na assinatura. Acompanhamos renovações, adequamos coberturas quando sua vida muda e avisamos antes de qualquer vencimento.',
  },
  {
    icon: (
      <svg style={{ width: 'var(--icone-m)', height: 'var(--icone-m)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: 'As melhores seguradoras parceiras',
    desc: 'Porto Seguro, SulAmérica, Bradesco Saúde, Amil, Unimed, Azos e outras — sempre indicando a mais adequada para o seu perfil e objetivo.',
  },
  {
    icon: (
      <svg style={{ width: 'var(--icone-m)', height: 'var(--icone-m)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
        height: 'var(--h-faixa)',
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
              fontSize: 'var(--fs-faixa)',
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#fff',
              lineHeight: 1.35,
              textShadow: '0 2px 24px rgba(0,0,0,0.6)',
              margin: 0,
            }}>
              {'"Nosso propósito é cuidar de você. Somos especialistas em proteger '}
              <em style={{ fontWeight: 600, fontStyle: 'italic' }}>famílias, carreiras e legados</em>
              {'."'}
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
              <p style={{ fontSize: 'var(--fs-body)', color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 36 }}>
                A Seu Legado Seguro tem três pilares muito claros:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                {pilares.map(pi => (
                  <div key={pi.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--navy)',
                      opacity: 0.35, letterSpacing: 1, flexShrink: 0, paddingTop: 2,
                    }}>{pi.n}</span>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--fs-pilar)', fontWeight: 600, color: 'var(--navy)', marginBottom: 4,
                      }}>{pi.label}</div>
                      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--gray-600)', lineHeight: 1.7 }}>{pi.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pilares-fig">
              <span className="pilar-rotulo pilar-esq" style={{ color: '#4B6A8A' }}>Foco no<br />cliente</span>
              <img
                className="pilares-img"
                src={TRIANGULO}
                width="320" height="251"
                alt="Pilares Seu Legado Seguro: Confiança, Longo Prazo e Foco no Cliente"
              />
              <span className="pilar-rotulo pilar-dir" style={{ color: '#003A70' }}>Confiança</span>
              <span className="pilar-rotulo pilar-base" style={{ color: '#8F7325' }}>Longo prazo</span>
            </div>

          </div>

          <div className="diferenciais-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-m)' }}>
            {diferenciais.map(d => (
              <div key={d.title} className="dif-card" style={{
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-card) var(--space-card-x)',
                border: '1.5px solid var(--gray-200)',
                transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
              }}>
                <div style={{
                  width: 'var(--caixa-icone-m)', height: 'var(--caixa-icone-m)', borderRadius: 12, marginBottom: 18,
                  background: 'var(--steel-light)', color: 'var(--navy)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {d.icon}
                </div>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--fs-h4)', fontWeight: 600, color: 'var(--navy)',
                  marginBottom: 10, lineHeight: 1.3,
                }}>{d.title}</h4>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--gray-600)', lineHeight: 1.7 }}>{d.desc}</p>
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
          /* A faixa da citacao. O dourado da assinatura e #C9A84C, que da 5,00:1
             sobre o navy — o mesmo dourado claro da marca. O #8F7325 do rotulo
             LONGO PRAZO foi escolhido para fundo BRANCO e aqui daria 2,4:1:
             contraste e uma relacao entre DUAS cores, nao propriedade de uma. */
          /* A DIVISORIA, e ela existe porque o conserto anterior criou o
             problema seguinte. Tirar a tira branca fez a faixa encostar na CTA,
             e como as duas sao o mesmo navy o resultado foi um bloco unico sem
             comeco nem fim — o Gabriel viu na tela antes de qualquer assercao
             minha: "precisa ter uma divisoria aqui".

             Ela e DECORATIVA: aria-hidden, sem texto, sem papel semantico. Um
             leitor de tela nao anuncia "linha" — a separacao e visual, e so
             visual. Dourado da marca a 50%, 30% do container e no maximo 360px.

             O respiro dos dois lados sai do MESMO token, --space-divisor-y, e e
             assim que a simetria fica verdadeira por construcao em vez de
             depender de dois numeros que alguem lembre de manter iguais. */
          .faixa-citacao {
            background: var(--navy);
            padding: var(--space-faixa-y) 0 var(--space-divisor-y);
          }
          .divisor-citacao {
            background: var(--navy);
            display: flex; justify-content: center;
          }
          .divisor-citacao span {
            display: block; height: 1px;
            width: 30%; max-width: 360px;
            background: rgba(201,168,76,0.5);
          }
          .citacao-grade {
            display: grid; grid-template-columns: auto 1fr;
            gap: 48px; align-items: center;
          }
          .citacao-foto {
            width: var(--d-citacao-foto); height: var(--d-citacao-foto); border-radius: 50%;
            border: 3px solid #C9A84C; object-fit: cover;
            display: block; flex-shrink: 0;
          }
          .citacao-texto {
            font-family: var(--font-display);
            font-size: var(--fs-citacao);
            font-weight: 300; font-style: normal;
            color: #fff; line-height: 1.45;
            margin: 0; padding: 0; border-left: none;
          }
          .citacao-assinatura {
            margin-top: 20px; font-size: var(--fs-xs); font-weight: 600;
            letter-spacing: 2px; text-transform: uppercase; color: #C9A84C;
          }
          @media (max-width: 768px) {
            .citacao-grade {
              grid-template-columns: 1fr; gap: 26px;
              justify-items: center; text-align: center;
            }
          }
          /* Rotulo FORA da figura, nunca por cima. Grade de tres colunas: o
             texto ocupa coluna propria, entao o espaco dele sai do espaco da
             imagem em vez de cobri-la — sobrepor virou impossivel por
             construcao, nao por ajuste de coordenada.
             O rotulo da base fica na MESMA COLUNA da imagem (linha 2), e e
             assim que ele nasce centrado NELA. Centrar na figura inteira nao
             serve: os rotulos laterais tem larguras diferentes e puxariam o
             centro para o lado. */
          .pilares-fig {
            display: grid;
            grid-template-columns: auto auto auto;
            align-items: center; justify-items: center;
            align-content: center;
            column-gap: var(--gap-p); row-gap: var(--gap-p);
            height: 100%;
          }
          .pilares-img {
            grid-area: 1 / 2;
            width: 100%; max-width: var(--w-triangulo); height: auto; display: block;
          }
          .pilar-rotulo {
            font-family: var(--font-display);
            font-weight: 600; font-size: var(--fs-rotulo);
            letter-spacing: 1.2px; text-transform: uppercase;
            line-height: 1.35; white-space: nowrap;
          }
          /* Sem max-width, de proposito: a caixa se dimensiona pelo TEXTO e a
             quebra de "FOCO NO / CLIENTE" e explicita no JSX, entao transbordar
             virou impossivel. A versao anterior capava em 92px, medido aqui: no
             runner do CI a mesma palavra renderizou 94px e cortou. Largura de
             texto e propriedade do RENDERIZADOR — numero cravado a mao contra
             uma maquina so nao sobrevive a outra. */
          .pilar-esq { grid-area: 1 / 1; justify-self: end; text-align: right; }
          .pilar-dir { grid-area: 1 / 3; justify-self: start; text-align: left; }
          .pilar-base { grid-area: 2 / 2; text-align: center; }
          @media (max-width: 560px) {
            .pilares-fig { column-gap: 10px; }
            .pilar-rotulo { letter-spacing: 0.6px; }
          }
          @media (max-width: 400px) {
            .pilares-fig { column-gap: 8px; }
            .pilar-rotulo { letter-spacing: 0.4px; }
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

      {/* A FAIXA E BLOCO PROPRIO, IRMA DA SECAO, E ISSO NAO E DETALHE DE
          ARRUMACAO. Enquanto ela morava DENTRO de <section id="sobre">, dois
          defeitos nasciam de uma vez, medidos em 390/768/1280/1440:

            - o ultimo card dos diferenciais encostava nela, 0px em TODAS as
              larguras, porque o .container fechava exatamente ali;
            - e o padding-bottom da secao (48/64/96px) sobrava DEPOIS da faixa,
              pintado de branco, entre dois blocos navy. Em producao, no
              screenshot de 390: navy ate 8665, BRANCO de 8666 a 8713, navy de
              8714 em diante.

          Fora da secao, o mesmo padding-bottom passa a separar os cards da
          faixa — o ritmo do site, sem numero novo — e a faixa encosta na secao
          seguinte, que e navy como ela. Duas areas navy que se tocam leem como
          uma; o respiro entre a citacao e a CTA vem do padding de cada uma
          (56+80 no celular), nao de um vao branco no meio.

          A citacao virou faixa de largura inteira porque antes era um paragrafo
          cinza no fim de uma grade: dizia a mesma coisa e ninguem lia. */}
      <div className="faixa-citacao">
        <div className="container citacao-grade">
          <img
            className="citacao-foto"
            src={FOTO_GABRIEL}
            alt="Gabriel Vital"
            width="712" height="712"
            loading="lazy"
          />
          <div className="citacao-texto-col">
            <blockquote className="citacao-texto">
              {'"Meu papel é estar lá antes de você precisar."'}
            </blockquote>
            <footer className="citacao-assinatura">— Gabriel Vital</footer>
          </div>
        </div>
      </div>

      <div className="divisor-citacao" aria-hidden="true"><span /></div>
    </>
  )
}
