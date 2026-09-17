import { WA_NUMBER } from '../contato'

// A seção do formulário do fim saiu: um site com dois formulários iguais pede a
// mesma coisa duas vezes, e quem chega ao fim já passou pelo do topo. Saíram
// junto o useState, o handleSubmit e o estado `enviado` — eram só dela. O que
// resta aqui é a faixa CTA, e ela leva ao formulário do hero, #cotacao.
export default function Contato() {
  return (
    <>
      {/* Faixa CTA */}
      <section style={{ background: 'var(--navy)', padding: 'calc(var(--space-divisor-y) - var(--tinta-eyebrow)) 0 var(--space-cta-y)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', fontSize: 'var(--fs-eyebrow)', fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 16,
          }}>Próximo passo</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--fs-h2-contato)',
            fontWeight: 300,
            color: 'var(--white)',
            marginBottom: 18,
            letterSpacing: '-0.015em',
          }}>
            Pronto para proteger o seu legado?
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 'var(--fs-lead)', lineHeight: 1.75,
            marginBottom: 40, maxWidth: 500, margin: '0 auto 40px',
          }}>
            Fale com um corretor que vai entender a sua necessidade e indicar a cobertura certa — sem jargão, sem pressão.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              className="btn-primary"
              href={`https://wa.me/${WA_NUMBER}?text=Olá,%20quero%20uma%20consultoria%20gratuita`}
              target="_blank" rel="noopener"
              style={{ background: 'var(--white)', color: 'var(--navy)', border: 'none', fontSize: 'var(--fs-body)', padding: '15px 32px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.847L.057 23.882l6.198-1.447A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.887 9.887 0 01-5.031-1.376l-.362-.214-3.68.859.874-3.595-.235-.373A9.88 9.88 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.42 0 9.894 4.474 9.894 9.894 0 5.42-4.474 9.894-9.894 9.894z"/>
              </svg>
              Falar pelo WhatsApp agora
            </a>
            <a className="btn-outline-white" href="#cotacao">
              Prefiro preencher formulário
            </a>
          </div>
        </div>
      </section>

    </>
  )
}
