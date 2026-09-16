// Logos oficiais em public/seguradoras/. A procedência de cada arquivo está em
// public/seguradoras/FONTES.md — nenhum foi redesenhado nem gerado.
//
// Todas têm logo oficial. Nenhum foi redesenhado nem gerado.
//
// Omint e Akad Seguros ficaram de fora: os dois domínios respondem HTTP 403 (é
// o WAF dos próprios sites, não o proxy — os alternativos que respondem são de
// outra empresa ou só um stub). Melhor uma parceira ausente do que um logo
// errado ou inventado. Detalhes em FONTES.md.
//
// A NotreDame Intermédica saiu da lista: a marca foi incorporada pela Hapvida,
// que já tem card próprio aqui, e o site da NotreDame hoje serve o logo da
// Hapvida — o alt do cabeçalho de lá diz "Logo Hapvida SP/RJ".
const parceiras = [
  { nome: 'Porto Seguro', logo: 'seguradoras/porto-seguro.svg' },
  { nome: 'SulAmérica', logo: 'seguradoras/sulamerica.svg' },
  { nome: 'Bradesco Seguros', logo: 'seguradoras/bradesco.svg' },
  { nome: 'Amil', logo: 'seguradoras/amil.svg' },
  { nome: 'Unimed', logo: 'seguradoras/unimed.svg' },
  { nome: 'Hapvida', logo: 'seguradoras/hapvida.svg' },
  { nome: 'Azos', logo: 'seguradoras/azos.svg' },
  { nome: 'MAG Seguros', logo: 'seguradoras/mag-seguros.svg' },
  { nome: 'Icatu Seguros', logo: 'seguradoras/icatu.svg' },
  { nome: 'Zurich', logo: 'seguradoras/zurich.svg' },
  { nome: 'Tokio Marine', logo: 'seguradoras/tokio-marine.svg' },
  { nome: 'Allianz', logo: 'seguradoras/allianz.svg' },
  { nome: 'Seguros Unimed', logo: 'seguradoras/seguros-unimed.png' },
  { nome: 'Mapfre', logo: 'seguradoras/mapfre.svg' },
  { nome: 'Qualicorp', logo: 'seguradoras/qualicorp.png' },
  { nome: 'Fairfax', logo: 'seguradoras/fairfax.svg' },
  { nome: 'Coris Seguro Viagem', logo: 'seguradoras/coris.svg' },
  { nome: 'Ademicon', logo: 'seguradoras/ademicon.svg' },
]

function CartaoSeguradora({ p }) {
  return (
    <div className="seg-card" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '20px 12px 16px',
      background: 'var(--white)',
      border: '1.5px solid var(--gray-200)',
      borderRadius: 'var(--radius-lg)',
      cursor: 'default',
      minHeight: 90,
    }}>
      {/* O `color` daqui nao pinta mais nada: existia para o azos.svg, que vinha
          com fill="currentColor" — e currentColor dentro de <img> NAO herda a
          cor da pagina, entao renderizava preto. O SVG agora traz a cor da
          marca no proprio arquivo, como os outros. */}
      <div className="seg-logo-wrap" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', height: 48,
      }}>
        {p.logo ? (
          <img
            src={`${import.meta.env.BASE_URL}${p.logo}`}
            alt={p.nome}
            loading="lazy"
            /* teto de altura E de largura: só altura faria um logo 4:1 como o da
               Porto esmagar os quadrados ao lado. Com os dois, o largo trava na
               largura e o quadrado trava na altura, e a mancha fica parecida. */
            style={{ maxHeight: 42, maxWidth: '100%', width: 'auto', height: 'auto', display: 'block' }}
          />
        ) : (
          <span style={{
            fontSize: 14, fontWeight: 700, letterSpacing: 0.2,
            color: 'var(--navy)', textAlign: 'center', lineHeight: 1.25,
          }}>{p.nome}</span>
        )}
      </div>
    </div>
  )
}

// Quantas colunas cabem SEM deixar cartao solto na ultima linha: o maior
// divisor de N que nao passa do teto. Com 18 parceiras da 6/3/2; com 20 daria
// 5/4/2. O numero nao fica cravado em lugar nenhum — ele se recalcula quando a
// lista muda, que e o unico jeito de a regra sobreviver a proxima parceira.
function colunas (n, teto) {
  for (let c = teto; c >= 1; c--) if (n % c === 0) return c
  return 1
}

export default function Seguradoras() {
  const n = parceiras.length
  const colDesk = colunas(n, 6)
  const colTab = colunas(n, 4)
  const colMob = 2   // no celular sao sempre 2, e por isso N precisa ser par
  return (
    <section style={{ background: 'var(--gray-50)', paddingTop: 64, paddingBottom: 64 }}>
      <div className="container">
        <p style={{
          textAlign: 'center',
          fontSize: 11, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase', color: 'var(--navy)',
          opacity: 0.4, marginBottom: 44,
        }}>
          Trabalhamos com as melhores seguradoras do Brasil
        </p>

        {/* auto-fit deixava o navegador escolher, e em várias larguras a conta
            dele deixava 1 ou 2 cartões sozinhos na última linha. Agora o número
            de colunas vem de N, e toda linha fecha cheia. */}
        <div className="seguradoras-grid" style={{ display: 'grid', gap: 14 }}>
          {parceiras.map(p => <CartaoSeguradora key={p.nome} p={p} />)}
        </div>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--gray-600)' }}>
          + diversas outras seguradoras e administradoras
        </p>
      </div>

      <style>{`
        .seg-card {
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
          filter: grayscale(100%) opacity(0.55);
        }
        .seg-card:hover {
          border-color: var(--steel) !important;
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
          filter: grayscale(0%) opacity(1);
        }
        .seguradoras-grid { grid-template-columns: repeat(${colDesk}, 1fr); }
        @media (max-width: 1023px) {
          .seguradoras-grid { grid-template-columns: repeat(${colTab}, 1fr); }
        }
        @media (max-width: 559px) {
          .seguradoras-grid { grid-template-columns: repeat(${colMob}, 1fr); }
        }
      `}</style>
    </section>
  )
}
