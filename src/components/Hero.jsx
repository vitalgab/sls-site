import { useState, useEffect } from 'react'
import { WA_NUMBER } from '../contato'

// Servidas do proprio site, nao de CDN de terceiro: a foto do hero e a primeira
// coisa que a pessoa ve, e um engasgo no Unsplash deixava o hero sem foto
// nenhuma, sem erro no console. Procedencia em public/assets/FONTES.md.
const slides = [
  { url: `${import.meta.env.BASE_URL}assets/hero-1.webp`, alt: 'Família reunida em casa' },
  { url: `${import.meta.env.BASE_URL}assets/hero-2.webp`, alt: 'Profissionais trabalhando juntos' },
  { url: `${import.meta.env.BASE_URL}assets/hero-3.webp`, alt: 'Família em casa no sofá' },
]

const iconeWhats = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.847L.057 23.882l6.198-1.447A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.887 9.887 0 01-5.031-1.376l-.362-.214-3.68.859.874-3.595-.235-.373A9.88 9.88 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.42 0 9.894 4.474 9.894 9.894 0 5.42-4.474 9.894-9.894 9.894z"/>
  </svg>
)

function FormularioCotacao() {
  const [form, setForm] = useState({ nome: '', telefone: '', interesse: '' })

  function handleSubmit(e) {
    e.preventDefault()
    const texto = `Olá! Me chamo *${form.nome}*.\nTenho interesse em: ${form.interesse || 'não informado'}\nMeu WhatsApp: ${form.telefone}`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const campoStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #CDD9EA',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'var(--font-body)',
    color: '#1C2E45',
    background: '#fff',
    transition: 'border-color 0.2s',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22, fontWeight: 400, color: 'var(--navy)',
          lineHeight: 1.2, marginBottom: 6,
        }}>
          Solicite uma cotação grátis
        </h3>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>
          Resposta em até 24h · Sem compromisso
        </p>
      </div>

      <input
        type="text"
        placeholder="Seu nome completo"
        required
        value={form.nome}
        onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
        style={campoStyle}
        onFocus={e => e.target.style.borderColor = 'var(--navy)'}
        onBlur={e => e.target.style.borderColor = '#CDD9EA'}
      />
      <input
        type="tel"
        placeholder="WhatsApp com DDD"
        required
        value={form.telefone}
        onChange={e => setForm(prev => ({ ...prev, telefone: e.target.value }))}
        style={campoStyle}
        onFocus={e => e.target.style.borderColor = 'var(--navy)'}
        onBlur={e => e.target.style.borderColor = '#CDD9EA'}
      />
      <select
        value={form.interesse}
        onChange={e => setForm(prev => ({ ...prev, interesse: e.target.value }))}
        style={{
          ...campoStyle,
          color: form.interesse ? '#1C2E45' : '#94a3b8',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23003A70' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: 40,
        }}
      >
        <option value="">Tenho interesse em...</option>
        <option>Plano de Saúde</option>
        <option>Seguro de Vida</option>
        <option>Previdência Privada</option>
        <option>RC Profissional</option>
        <option>Mais de um produto</option>
      </select>

      <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: 4, padding: '14px 24px', fontSize: 15 }}>
        {iconeWhats}
        Enviar pelo WhatsApp
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid #EEF4FB' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4B6280" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span style={{ fontSize: 11, color: 'var(--gray-600)' }}>
          Seus dados são protegidos e nunca compartilhados
        </span>
      </div>
    </form>
  )
}

export default function Hero() {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => { setSlide(s => (s + 1) % slides.length) }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="inicio" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 88,
    }}>
      {slides.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${s.url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          zIndex: 0,
          opacity: +(i === slide),
          transition: 'opacity 1.2s ease-in-out',
        }} />
      ))}

      <div className="hero-overlay" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      <div className="container hero-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: 56,
        alignItems: 'center',
        padding: '80px 28px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(34px, 5vw, 62px)',
            fontWeight: 300,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 24,
          }}>
            Proteja o que<br />
            <em style={{ fontStyle: 'normal', fontWeight: 700 }}>você construiu.</em>
          </h1>

          <p style={{
            fontSize: 17,
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.8,
            marginBottom: 36,
            maxWidth: 480,
          }}>
            Seguro de saúde, vida e previdência para médicos, advogados e profissionais liberais. Atendimento personalizado. Cobertura real.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              className="btn-primary"
              href={`https://wa.me/${WA_NUMBER}?text=Olá,%20quero%20uma%20cotação%20gratuita`}
              target="_blank" rel="noopener"
              style={{ background: '#fff', color: 'var(--navy)', border: '2px solid #fff', fontSize: 16, padding: '14px 28px' }}
            >
              {iconeWhats}
              Falar pelo WhatsApp
            </a>
            <a href="#produtos" className="btn-outline-white" style={{ fontSize: 15 }}>
              Conhecer produtos
            </a>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === slide ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  background: i === slide ? '#fff' : 'rgba(255,255,255,0.35)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        <div className="hero-form-card" style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '32px 28px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
        }}>
          <FormularioCotacao />
        </div>
      </div>

      <style>{`
        /* O veu escuro existe para o texto ser legivel, nao para esconder a
           foto. Ele e DIRECIONAL: forte so onde o texto passa, quase nada no
           resto — ate 0,02 na ponta direita, contra 0,05 de antes, e 0,55 no
           meio contra 0,70. */
        .hero-overlay {
          background: linear-gradient(95deg,
            rgba(0,20,52,0.90) 0%,
            rgba(0,20,52,0.86) 34%,
            rgba(0,20,52,0.62) 50%,
            rgba(0,20,52,0.14) 60%,
            rgba(0,20,52,0.02) 78%,
            rgba(0,20,52,0.00) 100%);
        }
        /* Abaixo de 900px a grade vira UMA coluna e o texto ocupa a largura
           inteira — o gradiente horizontal deixava o fim de cada linha sobre a
           parte clara da foto. Medido em producao: 2,04:1 em 390px, reprovando
           AA com folga. No celular o veu passa a ser VERTICAL, forte em cima,
           onde o texto esta, e leve embaixo. */
        @media (max-width: 900px) {
          .hero-overlay {
            background: linear-gradient(180deg,
              rgba(0,20,52,0.86) 0%,
              rgba(0,20,52,0.80) 40%,
              rgba(0,20,52,0.45) 66%,
              rgba(0,20,52,0.12) 100%);
          }
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
        /* Em 320px a pagina transbordava 20px, e a culpa era daqui, nao da grade
           de seguradoras: o min-content de .hero-grid media 349px = 56 de padding
           inline + 293 do cartao do formulario, e os 293 vinham do botao "Enviar
           pelo WhatsApp", que herda white-space: nowrap de .btn-primary e nao
           quebra. Os tres !important sao para vencer o padding inline. */
        @media (max-width: 560px) {
          .hero-grid { padding: 60px 20px !important; }
          .hero-form-card { padding: 28px 20px !important; }
          .hero-form-card .btn-primary { white-space: normal !important; }
        }
      `}</style>
    </section>
  )
}
