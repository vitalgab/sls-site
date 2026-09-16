// Logos oficiais em public/seguradoras/. A procedência de cada arquivo está em
// public/seguradoras/FONTES.md — nenhum foi redesenhado nem gerado.
//
// A Icatu segue como TEXTO porque o arquivo oficial ainda não foi obtido: o
// domínio dela responde 403 pelo proxy desta sessão. Melhor um nome escrito do
// que um logo inventado.
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
  { nome: 'Azos', logo: 'seguradoras/azos.svg', cor: '#0A0A0A' },
  { nome: 'MAG Seguros', logo: 'seguradoras/mag-seguros.svg' },
  { nome: 'Icatu Seguros' },
  { nome: 'Zurich', logo: 'seguradoras/zurich.svg' },
  { nome: 'Tokio Marine', logo: 'seguradoras/tokio-marine.svg' },
  { nome: 'Allianz', logo: 'seguradoras/allianz.svg' },
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
      <div className="seg-logo-wrap" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', height: 48,
        color: p.cor || 'var(--navy)',
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

export default function Seguradoras() {
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

        {/* auto-fit + minmax deixa o navegador escolher quantas colunas cabem.
            A versão anterior forçava 3 colunas abaixo de 560px, e 3 cartões de
            126px não cabem em 350px de área útil — daí a rolagem lateral. */}
        <div className="seguradoras-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 14,
        }}>
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
        @media (max-width: 560px) {
          .seguradoras-grid { grid-template-columns: repeat(auto-fit, minmax(128px, 1fr)) !important; }
        }
      `}</style>
    </section>
  )
}
