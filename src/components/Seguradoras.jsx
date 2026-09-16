const parceiras = [
  {
    nome: 'Porto Seguro',
    cor: '#C5000A',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <rect x="0" y="0" width="110" height="44" rx="4" fill="#C5000A" />
        <text x="55" y="16" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="10" letterSpacing="1">PORTO</text>
        <text x="55" y="29" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="10" letterSpacing="1">SEGURO</text>
        <rect x="20" y="32" width="70" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
        <text x="55" y="41" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontFamily="Arial,sans-serif" fontSize="6" letterSpacing="0.5">SEGUROS</text>
      </svg>
    ),
  },
  {
    nome: 'SulAmérica',
    cor: '#0066B3',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <text x="55" y="20" textAnchor="middle" fill="#0066B3" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="20" letterSpacing="-0.5">Sul</text>
        <text x="55" y="38" textAnchor="middle" fill="#0066B3" fontFamily="Arial,sans-serif" fontWeight="400" fontSize="13" letterSpacing="0.5">América</text>
      </svg>
    ),
  },
  {
    nome: 'Bradesco',
    cor: '#CC0000',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <circle cx="18" cy="22" r="14" fill="#CC0000" />
        <text x="18" y="27" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="16">B</text>
        <text x="62" y="27" textAnchor="middle" fill="#CC0000" fontFamily="Arial,sans-serif" fontWeight="600" fontSize="14" letterSpacing="-0.3">radesco</text>
      </svg>
    ),
  },
  {
    nome: 'Amil',
    cor: '#0080C9',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <text x="55" y="31" textAnchor="middle" fill="#0080C9" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="30" letterSpacing="-1">Amil</text>
      </svg>
    ),
  },
  {
    nome: 'Unimed',
    cor: '#00843D',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <polygon points="18,8 28,26 8,26" fill="#00843D" />
        <text x="62" y="28" textAnchor="middle" fill="#00843D" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="15" letterSpacing="-0.3">Unimed</text>
      </svg>
    ),
  },
  {
    nome: 'Hapvida',
    cor: '#0077B6',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <text x="55" y="29" textAnchor="middle" fill="#0077B6" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="18" letterSpacing="-0.5">hapvida</text>
        <rect x="15" y="33" width="80" height="2" rx="1" fill="#0077B6" opacity="0.3" />
        <text x="55" y="42" textAnchor="middle" fill="#0077B6" fontFamily="Arial,sans-serif" fontSize="7" letterSpacing="1" opacity="0.6">NOTREDAME INTERMÉDICA</text>
      </svg>
    ),
  },
  {
    nome: 'Azos',
    cor: '#2B3A8F',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <text x="55" y="30" textAnchor="middle" fill="#2B3A8F" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="26" letterSpacing="-1">azos</text>
      </svg>
    ),
  },
  {
    nome: 'MAG Seguros',
    cor: '#E05C00',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <text x="55" y="24" textAnchor="middle" fill="#E05C00" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="22" letterSpacing="2">MAG</text>
        <text x="55" y="38" textAnchor="middle" fill="#E05C00" fontFamily="Arial,sans-serif" fontWeight="400" fontSize="9" letterSpacing="2" opacity="0.7">SEGUROS</text>
      </svg>
    ),
  },
  {
    nome: 'ICATU',
    cor: '#004B87',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <text x="55" y="26" textAnchor="middle" fill="#004B87" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="22" letterSpacing="3">ICATU</text>
        <text x="55" y="39" textAnchor="middle" fill="#004B87" fontFamily="Arial,sans-serif" fontSize="8" letterSpacing="1.5" opacity="0.6">SEGUROS</text>
      </svg>
    ),
  },
  {
    nome: 'Zurich',
    cor: '#003591',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <circle cx="18" cy="22" r="14" fill="#003591" />
        <text x="18" y="27" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="16">Z</text>
        <text x="65" y="27" textAnchor="middle" fill="#003591" fontFamily="Arial,sans-serif" fontWeight="600" fontSize="15" letterSpacing="-0.3">urich</text>
      </svg>
    ),
  },
  {
    nome: 'Tokio Marine',
    cor: '#1B2A4A',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <text x="55" y="21" textAnchor="middle" fill="#1B2A4A" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="13" letterSpacing="-0.3">TOKIO</text>
        <text x="55" y="36" textAnchor="middle" fill="#1B2A4A" fontFamily="Arial,sans-serif" fontWeight="400" fontSize="11" letterSpacing="0.5">MARINE</text>
      </svg>
    ),
  },
  {
    nome: 'Allianz',
    cor: '#003781',
    logo: (
      <svg viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <text x="55" y="29" textAnchor="middle" fill="#003781" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="20" letterSpacing="-0.5">Allianz</text>
      </svg>
    ),
  },
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
      <div className="seg-logo-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 44 }}>
        {p.logo}
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

        <div className="seguradoras-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
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
        @media (max-width: 900px) {
          .seguradoras-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .seguradoras-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
