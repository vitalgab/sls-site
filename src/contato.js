// Fonte unica dos dados de contato.
//
// Antes disso o numero do WhatsApp estava duplicado em seis arquivos, e foi
// exatamente por isso que um placeholder ficou espalhado pelo site inteiro:
// trocar em cinco lugares e esquecer o sexto nao deixa rastro nenhum na tela.
// Qualquer tela nova deve importar daqui, nunca redeclarar a constante.

/** So digitos, no formato que a wa.me espera. */
export const WA_NUMBER = '5571981018556'

/** Como o numero aparece para quem le a pagina. */
export const TELEFONE_EXIBIDO = '(71) 98101-8556'

/** Formato E.164, para href="tel:". */
export const TELEFONE_TEL = '+5571981018556'

/** Registro do corretor na SUSEP. */
export const SUSEP = '242156562'

/** Monta um link de WhatsApp ja com a mensagem codificada. */
export function linkWhatsApp(texto) {
  return texto
    ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`
    : `https://wa.me/${WA_NUMBER}`
}
