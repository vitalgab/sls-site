import { useState } from 'react'

const WA_NUMBER = '5571999999999'

export default function Contato() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', interesse: '', mensagem: '' })
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const texto = `Olá, me chamo *${form.nome}*.\n\nTenho interesse em: ${form.interesse || 'Não informado'}\nE-mail: ${form.email}\nTelefone: ${form.telefone}\n\n${form.mensagem}`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`, '_blank')
    setEnviado(true)
  }

  return (
    <>
      {/* Faixa CTA */}
      <section style={{
        background: 'var(--navy)',
        padding: '80px 0',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 16,
          }}>Próximo passo</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 600,
            color: 'var(--white)',
            marginBottom: 18,
            letterSpacing: '-0.01em',
          }}>
            Pronto para proteger o seu legado?
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 17, lineHeight: 1.75,
            marginBottom: 40, maxWidth: 500, margin: '0 auto 40px',
          }}>
            Fale com um corretor que vai entender a sua necessidade e indicar a cobertura certa —
            sem jargão, sem pressão.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              className="btn-primary"
              href={`https://wa.me/${WA_NUMBER}?text=Olá,%20quero%20uma%20consultoria%20gratuita`}
              target="_blank" rel="noopener"
              style={{ background: 'var(--white)', color: 'var(--navy)', border: 'none', fontSize: 16, padding: '15px 32px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.847L.057 23.882l6.198-1.447A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.887 9.887 0 01-5.031-1.376l-.362-.214-3.68.859.874-3.595-.235-.373A9.88 9.88 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.42 0 9.894 4.474 9.894 9.894 0 5.42-4.474 9.894-9.894 9.894z"/>
              </svg>
              Falar pelo WhatsApp agora
            </a>
            <a className="btn-outline-white" href="#contato">
              Prefiro preencher formulário
            </a>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section id="contato" style={{ background: 'var(--gray-50)' }}>
        <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span className="section-eyebrow">Contato</span>
            <h2 className="section-title" style={{ margin: '0 auto 12px' }}>Prefere preencher um formulário?</h2>
            <p style={{ color: 'var(--gray-600)', fontSize: 15 }}>Preencha abaixo e entraremos em contato via WhatsApp.</p>
          </div>

          {enviado ? (
            <div style={{ textAlign: 'center', padding: 56, background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--steel-light)', color: 'var(--navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--navy)', marginBottom: 10 }}>Mensagem enviada!</h3>
              <p style={{ color: 'var(--gray-600)', fontSize: 15 }}>Você foi redirecionado para o WhatsApp. Responderemos em breve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              display: 'flex', flexDirection: 'column', gap: 16,
              background: 'var(--white)', padding: 40, borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow)',
            }}>
              {[
                { name: 'nome', label: 'Nome completo', type: 'text', placeholder: 'Dr. João Silva', required: true },
                { name: 'email', label: 'E-mail', type: 'email', placeholder: 'joao@exemplo.com', required: false },
                { name: 'telefone', label: 'Telefone / WhatsApp', type: 'tel', placeholder: '(71) 99999-9999', required: true },
              ].map(f => (
                <div key={f.name}>
                  <label style={{
                    display: 'block', fontSize: 12, fontWeight: 700,
                    color: 'var(--navy)', marginBottom: 7, letterSpacing: 0.3,
                  }}>{f.label} {f.required && <span style={{ color: 'var(--navy)' }}>*</span>}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    required={f.required}
                    value={form[f.name]}
                    onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    style={{
                      width: '100%', padding: '13px 16px',
                      border: '1.5px solid var(--gray-200)',
                      borderRadius: 'var(--radius)', fontSize: 15,
                      outline: 'none', transition: 'border-color 0.2s',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--gray-800)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--navy)'}
                    onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                  />
                </div>
              ))}

              <div>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 700,
                  color: 'var(--navy)', marginBottom: 7, letterSpacing: 0.3,
                }}>Tenho interesse em</label>
                <select
                  value={form.interesse}
                  onChange={e => setForm(prev => ({ ...prev, interesse: e.target.value }))}
                  style={{
                    width: '100%', padding: '13px 16px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius)', fontSize: 15,
                    outline: 'none', background: 'white',
                    fontFamily: 'var(--font-body)',
                    color: form.interesse ? 'var(--gray-800)' : '#94a3b8',
                  }}
                >
                  <option value="">Selecione um produto...</option>
                  <option value="Seguro Saúde">Seguro Saúde</option>
                  <option value="Seguro de Vida">Seguro de Vida</option>
                  <option value="Previdência Privada">Previdência Privada</option>
                  <option value="RC Profissional">Responsabilidade Civil Profissional</option>
                  <option value="Mais de um produto">Mais de um produto</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 700,
                  color: 'var(--navy)', marginBottom: 7, letterSpacing: 0.3,
                }}>Mensagem (opcional)</label>
                <textarea
                  placeholder="Conte um pouco sobre o que você precisa..."
                  rows={4}
                  value={form.mensagem}
                  onChange={e => setForm(prev => ({ ...prev, mensagem: e.target.value }))}
                  style={{
                    width: '100%', padding: '13px 16px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius)', fontSize: 15,
                    outline: 'none', resize: 'vertical',
                    fontFamily: 'var(--font-body)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--navy)'}
                  onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', fontSize: 15, padding: '14px' }}>
                Enviar via WhatsApp
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
