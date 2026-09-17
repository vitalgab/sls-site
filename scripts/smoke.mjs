/**
 * Smoke dinamico do site institucional.
 *
 *   node scripts/smoke.mjs                      # modo real
 *   MODO=impostor-css node scripts/smoke.mjs    # controle negativo
 *
 * Variaveis: SMOKE_URL (padrao http://127.0.0.1:8099/), SHOTS_DIR, MODO.
 *
 * Codigos de saida:  0 = tudo verde | 1 = alguma assercao vermelha
 *                    3 = INSTRUMENTO (modo desconhecido ou mutacao sem alvo)
 *
 * Todo modo impostor muta o ARTEFATO SERVIDO (a folha real, o bundle real), nunca
 * empilha estilo por cima: regra que apaga declaracao vira no-op e o impostor
 * passa verde sem ter mordido. E toda mutacao que nao encontra alvo derruba o
 * script com exit 3, para "nao mordeu" nunca se confundir com "nao rodou".
 */
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
import { capturar, assinar, comparar, capturarReferencia, LARGURAS } from './referencia-desktop.mjs'

const BASE = process.env.SMOKE_URL || 'http://127.0.0.1:8099/'
// build do commit anterior, para o diff de desktop. 'nenhum' desliga a guarda
// e IMPRIME que desligou — o smoke de producao roda sem par para comparar.
const ANTERIOR = process.env.ANTERIOR || 'http://127.0.0.1:8098/'
const SHOTS = process.env.SHOTS_DIR || null
const WA = '5571981018556'
const TEL = '+5571981018556'
const MODO = process.env.MODO || 'real'

const MODOS = ['real', 'impostor-css', 'impostor-rede', 'impostor-wa', 'impostor-em',
  'impostor-missao', 'impostor-persona', 'impostor-manifest', 'impostor-logo',
  'impostor-gray', 'impostor-pwa', 'impostor-azos', 'impostor-faixa',
  'impostor-overlay', 'impostor-pilares', 'impostor-grade', 'impostor-ital', 'impostor-veu',
  'impostor-cabecalho', 'impostor-impar', 'impostor-herdada', 'impostor-dourado',
  'impostor-retrato', 'impostor-desktop', 'impostor-desktop-cor', 'impostor-zoom', 'impostor-campo',
  'impostor-vizinhanca', 'impostor-vao-branco', 'impostor-sem-divisoria', 'impostor-piso', 'impostor-piso-cartao', 'impostor-piso-eyebrow', 'impostor-hierarquia',
  'impostor-ancora', 'impostor-foco', 'impostor-titulo', 'impostor-cidade',
  'impostor-cidade-ld', 'impostor-ldurl',
  // NAO e impostor: e teste de robustez. A fonte do runner do CI renderiza ~2px
  // mais larga que a daqui, e foi por 2px que o deploy do triangulo caiu. Este
  // modo alarga o tracking de proposito e exige que TUDO continue verde.
  'estresse']
if (!MODOS.includes(MODO)) { console.error(`modo desconhecido: ${MODO}`); process.exit(3) }

let ok = 0, bad = 0
const V = (n, c, d = '') => {
  if (c) { ok++; console.log(`✓ ${n}${d ? ' — ' + d : ''}`) }
  else { bad++; console.log(`✗ ${n}${d ? ' — ' + d : ''}`) }
}
const mutar = (txt, de, para, rotulo) => {
  const n = txt.split(de).length - 1
  if (n === 0) { console.error(`INSTRUMENTO: mutacao "${rotulo}" nao achou alvo`); process.exit(3) }
  console.error(`  [${MODO}] mutou ${n}x: ${rotulo}`)
  return txt.split(de).join(para)
}

// O Chromium e a CA mudam conforme onde isto roda. Em CI o Playwright resolve o
// binario sozinho; num ambiente atras de proxy que reemite TLS, o binario vem
// pronto em /opt/pw-browsers e e preciso confiar na CA do proxy — e se faz isso
// FIXANDO o SPKI dessa CA, nunca desligando a verificacao.
const CHROMIUM_LOCAL = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const CA_PROXY = '/root/.ccr/agent-proxy-ca.crt'
const SPKI_PROXY = 'KnP1OnzHv/y42eRQmbGwoYTHcSJF448m6CU5mdngwKk=,PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='
const opcoes = {}
if (existsSync(CHROMIUM_LOCAL)) opcoes.executablePath = CHROMIUM_LOCAL
if (existsSync(CA_PROXY)) opcoes.args = [`--ignore-certificate-errors-spki-list=${SPKI_PROXY}`]
const browser = await chromium.launch(opcoes)

// O hero puxa 4 fotos do images.unsplash.com. Esperar por networkidle e o ideal,
// mas se o Unsplash engasgar o smoke morre e leva o deploy junto — falha de
// terceiro derrubando publicacao. Entao: tenta networkidle, e cai para 'load'.
// Nenhuma assercao depende dessas fotos; as que dependem de imagem (personas,
// logos) sao servidas pelo proprio site e tem espera propria.
async function irPara (page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 })
  } catch {
    console.error('  [aviso] networkidle estourou; seguindo com waitUntil=load')
    await page.goto(url, { waitUntil: 'load', timeout: 25000 })
  }
}

// Todas as mutacoes de artefato SERVIDO num lugar so. Extraido de abrir()
// porque o bloco do golden master abre contexto proprio: sem chamar isto la, o
// impostor-desktop mutaria a folha em todos os contextos MENOS naquele que ele
// existe para morder.
async function aplicarRotas (page) {
  if (MODO === 'impostor-rede') await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort())
  // Tira o eixo ITALICO do pedido ao Google Fonts. A face italica de verdade
  // nunca chega, o navegador SINTETIZA uma inclinacao por cisalhamento da
  // romana — e inclinacao sintetizada tem exatamente as MESMAS larguras de
  // avanco da romana. E assim que a assercao abaixo separa uma da outra.
  if (MODO === 'impostor-ital') {
    await page.route(/fonts\.googleapis\.com\/css2/, async r => {
      const u = new URL(r.request().url())
      const fam = u.searchParams.getAll('family')
      if (!fam.some(f => f.includes('ital'))) {
        console.error('INSTRUMENTO: mutacao "eixo italico" nao achou alvo no pedido de fonte')
        process.exit(3)
      }
      u.searchParams.delete('family')
      for (const f of fam) {
        u.searchParams.append('family', f.includes('ital')
          ? f.replace(/ital,wght@[^&]*/, 'wght@300;400;600;700')
          : f)
      }
      console.error(`  [${MODO}] pedido de fonte sem eixo italico: ${u.search}`)
      const resp = await r.fetch({ url: u.toString() })
      await r.fulfill({ response: resp })
    })
  }
  if (MODO === 'impostor-persona') await page.route(/persona-.*\.(jpg|webp)/, r => r.abort())
  // derruba o retrato do Gabriel na faixa da citacao
  if (MODO === 'impostor-retrato') await page.route(/assets\/gabriel\.webp/, r => r.abort())
  // derruba a foto da faixa: o fundo some e so sobra o gradiente
  if (MODO === 'impostor-faixa') await page.route(/faixa-familia\.webp/, r => r.abort())
  // derruba UM logo: o teste tem de acusar o que faltou, nao so contar quantos ha
  if (MODO === 'impostor-logo') await page.route(/seguradoras\/unimed\.svg/, r => r.abort())
  // Devolve fill="currentColor" ao SVG da Fairfax. Dentro de um <img> o SVG e um
  // documento PROPRIO: currentColor nao herda cor nenhuma da pagina e resolve
  // para o preto padrao dele. Foi exatamente o que aconteceu com a Azos, e o
  // sintoma e um logo preto que ninguem estranha.
  if (MODO === 'impostor-herdada') {
    await page.route(/seguradoras\/fairfax\.svg/, async r => {
      const t = mutar(await (await r.fetch()).text(), 'fill="#012AFF"', 'fill="currentColor"', 'cor da Fairfax')
      await r.fulfill({ body: t, contentType: 'image/svg+xml' })
    })
  }
  if (MODO === 'impostor-manifest') await page.route(/manifest\.json/, r => r.fulfill({ status: 404, body: '' }))
  // volta ao estado em que o azos.svg usava fill="currentColor", que dentro de
  // <img> nao herda cor e renderiza PRETO. O par cinza/verde tem de acusar.
  if (MODO === 'impostor-azos') {
    await page.route(/seguradoras\/azos\.svg/, async r => {
      let t = await (await r.fetch()).text()
      t = mutar(t, 'fill="#00B000"', 'fill="currentColor"', 'cor da marca da Azos')
      await r.fulfill({ body: t, contentType: 'image/svg+xml' })
    })
  }
  // volta ao estado anterior: manifest e icones publicados, mas o index.html sem
  // anuncia-los. O impostor-manifest derruba o ARQUIVO; este derruba o ANUNCIO,
  // que e coisa diferente e precisava da propria prova.
  // QUATRO IMPOSTORES PARA UM PAR DE CAMPOS, e o motivo e que as assercoes
  // apontam para LADOS OPOSTOS: o titulo tem de PERDER a cidade, e a description
  // e o JSON-LD tem de MANTE-LA. Um impostor so, mexendo em tudo, morderia e nao
  // diria qual das cinco linhas soube reprovar. Um por campo diz.
  if (['impostor-titulo', 'impostor-cidade', 'impostor-cidade-ld', 'impostor-ldurl'].includes(MODO)) {
    await page.route(u => u.href === BASE || u.href === BASE + 'index.html', async r => {
      let t = await (await r.fetch()).text()
      if (MODO === 'impostor-titulo') {
        t = mutar(t, '<title>Seu Legado Seguro | Corretora de Seguros</title>',
          '<title>Seu Legado Seguro | Corretora de Seguros em Salvador</title>', 'titulo da pagina')
      } else if (MODO === 'impostor-cidade') {
        // tira a cidade da description. E o defeito CARO e invisivel: a previa
        // continua bonita, o titulo continua certo, e a busca local se perde.
        t = mutar(t, 'Corretora de seguros em Salvador especializada',
          'Corretora de seguros especializada', 'cidade na description')
      } else if (MODO === 'impostor-cidade-ld') {
        t = mutar(t, '"addressLocality": "Salvador"', '"addressLocality": "Brasil"', 'cidade no JSON-LD')
      } else {
        t = mutar(t, '"url": "https://seulegadoseguro.com.br"',
          '"url": "https://vitalgab.github.io/sls-site/"', 'url do JSON-LD')
      }
      await r.fulfill({ body: t, contentType: 'text/html' })
    })
  }
  if (MODO === 'impostor-pwa') {
    await page.route(u => u.href === BASE || u.href === BASE + 'index.html', async r => {
      let t = await (await r.fetch()).text()
      t = mutar(t, '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />', '', 'link apple-touch-icon')
      t = mutar(t, '<link rel="manifest" href="/manifest.json" />', '', 'link manifest')
      t = mutar(t, '<meta name="theme-color" content="#003A70" />', '', 'meta theme-color')
      await r.fulfill({ body: t, contentType: 'text/html' })
    })
  }
  // Tres mutacoes na folha servida, uma por guarda nova desta rodada.
  if (['impostor-desktop', 'impostor-desktop-cor', 'impostor-zoom', 'impostor-campo',
    'impostor-vizinhanca', 'impostor-piso', 'impostor-piso-cartao',
    'impostor-piso-eyebrow', 'impostor-hierarquia', 'impostor-ancora'].includes(MODO)) {
    await page.route(/\.css(\?|$)/, async r => {
      let t = await (await r.fetch()).text()
      // Os alvos sao o texto MINIFICADO, que e o que o navegador recebe. Escrevi
      // os tres com o espacamento do fonte primeiro e os tres sairam em exit 3:
      // "nao achou alvo". O mutar tem essa saida justamente para isso — impostor
      // que nao encontra alvo nao pode virar impostor que nao mordeu.
      if (MODO === 'impostor-desktop') {
        // 1px a mais de padding em CADA secao do desktop. E a menor mudanca de
        // layout que existe, e e de proposito: se a guarda nao pega 1px, ela nao
        // pega nada.
        t = mutar(t, '--space-secao:96px', '--space-secao:97px', 'padding das secoes no desktop')
      } else if (MODO === 'impostor-desktop-cor') {
        // O IRMAO DO DE CIMA, E ELE EXISTE POR UM MOTIVO ESTREITO. O impostor do
        // padding muda a ALTURA da pagina, e a comparacao morde ali, no teste de
        // dimensao, antes de olhar um bloco sequer. Com so ele, o braco que
        // compara bloco a bloco nunca seria exercido e eu estaria afirmando
        // "0% dos pixels" com metade do instrumento sem prova.
        // Um degrau no azul da marca (#003a70 -> #003a71, minificado em minusculas)
        // nao move um pixel de lugar: mesma altura, mesma largura, cor outra. So o
        // braco dos blocos pode pegar isso.
        t = mutar(t, '#003a70', '#003a71', 'navy da marca')
      } else if (MODO === 'impostor-ancora') {
        // Tira o desconto do header sticky. A pagina ROLA igual — o scrollY
        // chega no mesmo lugar — e o cartao para ATRAS da barra do topo. E o
        // defeito que a ancora crua tem, e a razao de a assercao afirmar
        // "abaixo do header" em vez de "rolou".
        t = mutar(t, '#cotacao{scroll-margin-top:calc(var(--h-header) + 12px)}',
          '#cotacao{scroll-margin-top:0}', 'desconto do header sticky')
      } else if (MODO === 'impostor-piso') {
        // Corpo abaixo de 13px no celular. O piso existe porque o pedido e
        // sempre "reduza mais", e reduzir tem fim.
        t = mutar(t, '--fs-body:13px', '--fs-body:12px', 'piso do corpo no celular')
      } else if (MODO === 'impostor-piso-cartao') {
        // UM IMPOSTOR POR PISO, E NAO UM PARA OS TRES. Um so que quebrasse os
        // tres morderia mesmo que duas das assercoes estivessem vazias — o
        // placar diria "mordeu" e nao diria QUAL soube reprovar.
        t = mutar(t, '--fs-xs:12px', '--fs-xs:11px', 'piso do texto de cartao')
      } else if (MODO === 'impostor-piso-eyebrow') {
        t = mutar(t, '--fs-eyebrow:9px', '--fs-eyebrow:8px', 'piso do eyebrow no celular')
      } else if (MODO === 'impostor-hierarquia') {
        // h3 por baixo do corpo. Um piso que morde num degrau e nao no de baixo
        // inverte a ordem sem que nenhum piso seja violado — nenhuma das outras
        // assercoes pegaria isso.
        t = mutar(t, '--fs-h3:14px', '--fs-h3:12.5px', 'h3 abaixo do corpo no celular')
      } else if (MODO === 'impostor-vizinhanca') {
        // Zera o padding de BAIXO de toda secao, que e exatamente o espaco que
        // separa o ultimo card da faixa da citacao. E o defeito que estava no ar
        // ate 7fc053a, reproduzido de proposito: com a faixa dentro da secao,
        // esse padding sobrava DEPOIS dela e o vao entre o card e a faixa era 0.
        t = mutar(t, 'section{padding:var(--space-secao) 0}',
          'section{padding:var(--space-secao) 0 0}', 'padding de baixo das secoes')
      } else if (MODO === 'impostor-zoom') {
        // O jeito errado de encolher: amplia o pixel em vez de mudar o tamanho.
        t = mutar(t, 'body{font-size:var(--fs-body)}', 'body{font-size:var(--fs-body);zoom:.85}', 'zoom no body')
      } else {
        // Campo abaixo de 16px: o iPhone da zoom sozinho ao tocar.
        t = mutar(t, 'font-size:16px!important', 'font-size:14px!important', 'tamanho dos campos no celular')
      }
      await r.fulfill({ body: t, contentType: 'text/css' })
    })
  }
  if (MODO === 'impostor-css') {
    await page.route(/\.css(\?|$)/, async r => {
      let t = await (await r.fetch()).text()
      t = mutar(t, '"Montserrat", "Inter", sans-serif', 'Georgia, serif', 'token --font-display')
      t = mutar(t, 'font-style:normal', 'font-style:italic', 'font-style dos titulos')
      await r.fulfill({ body: t, contentType: 'text/css' })
    })
  }
  // volta ao estado em que --gray-500 era usado sem nunca ter sido definido.
  // Apaga a declaracao da folha SERVIDA — empilhar regra por cima nao removeria
  // nada, e o impostor passaria verde sem ter mordido.
  if (MODO === 'impostor-gray') {
    await page.route(/\.css(\?|$)/, async r => {
      let t = await (await r.fetch()).text()
      t = mutar(t, '--gray-500:#5e7490;', '', 'declaracao de --gray-500')
      await r.fulfill({ body: t, contentType: 'text/css' })
    })
  }
  if (['impostor-wa', 'impostor-em', 'impostor-missao', 'impostor-overlay', 'impostor-pilares',
    'impostor-grade', 'impostor-vao-branco', 'impostor-sem-divisoria', 'impostor-veu',
    'impostor-foco', 'impostor-cabecalho',
    'impostor-impar', 'impostor-dourado',
    'estresse'].includes(MODO)) {
    await page.route(/\.js(\?|$)/, async r => {
      let t = await (await r.fetch()).text()
      if (MODO === 'impostor-wa') {
        t = mutar(t, '5571981018556', '5571999999999', 'numero do WhatsApp')
        t = mutar(t, '(71) 98101-8556', '(71) 9 9999-9999', 'telefone exibido')
        t = mutar(t, '242156562', 'XXXXXXXXXX', 'SUSEP')
      } else if (MODO === 'impostor-em') {
        t = mutar(t, 'fontStyle:`normal`,fontWeight:700', 'fontStyle:`italic`,fontWeight:400', 'destaque do hero')
      } else if (MODO === 'impostor-foco') {
        // Desliga o gatilho do foco sem tocar no scroll: os links continuam
        // levando ao formulario, e o campo nao recebe foco. Sem este impostor
        // as seis assercoes de foco nunca teriam provado saber reprovar — e
        // foram elas que pegaram o meu defeito do hashchange.
        t = mutar(t, 'a[href="#cotacao"]', 'a[href="#nunca-existe"]', 'gatilho do foco no formulario')
      } else if (MODO === 'impostor-dourado') {
        // Devolve ao rotulo o dourado da PECA. Ele fica bonito e ilegivel:
        // 3,43:1 sobre branco, abaixo do piso AA para texto pequeno. E o
        // defeito que estava no ar, e nenhuma outra assercao o pegava.
        t = mutar(t, '`#8F7325`', '`#A6872F`', 'cor do rotulo Longo prazo')
      } else if (MODO === 'impostor-impar') {
        // Tira uma parceira: N vai de 18 para 17, IMPAR.
        //
        // Repare onde ele NAO morde: em 1440 a assercao continua verde, porque
        // 17 e primo, colunas(17,6) devolve 1 e uma grade de uma coluna tem toda
        // linha "cheia" por construcao. Quem pega o caso e o celular, que sao
        // sempre 2 colunas, e a assercao de paridade. Sem ela, um N impar
        // passaria em metade das larguras medidas.
        t = mutar(t, ',{nome:`Ademicon`,logo:`seguradoras/ademicon.svg`}', '', 'uma parceira da lista')
      } else if (MODO === 'impostor-cabecalho') {
        // Largura fixa em cima de altura fixa: a marca estica. "Sem deformar" e
        // uma afirmacao sobre a PROPORCAO, e e so ela que este impostor quebra.
        t = mutar(t, 'width: auto; display: block', 'width: 300px; display: block', 'largura do logo do cabecalho')
      } else if (MODO === 'impostor-veu') {
        // Apaga o veu do celular: a propriedade afirmada e "o veu e o que
        // sustenta o contraste do texto do hero", e e nele que o controle tem
        // de bater.
        //
        // ⚠️ ESTE IMPOSTOR JA FOI OUTRO, E ELE MORREU NA SEGUNDA REDUCAO. A
        // versao anterior devolvia o veu HORIZONTAL ao celular, que era o
        // defeito historico: com a grade em uma coluna o fim de cada linha caia
        // sobre a parte clara da foto, e media 2,04:1 em producao. Com o texto
        // do hero menor, as linhas encurtaram e deixaram de alcancar a parte
        // clara: o mesmo veu horizontal passou a medir 5,56 / 4,91 / 4,69:1 nos
        // tres slides — pior que os 12,71 / 11,78 / 11,43 do real, e ainda assim
        // ACIMA do piso de 4,5. O impostor saiu VERDE e a assercao ficou sem
        // controle, sem ninguem tocar nela.
        //
        // Fica registrado o numero, porque ele e um aviso e nao uma vitoria:
        // 4,69:1 no slide 3 e 0,19 de folga. Se alguem devolver o veu
        // horizontal, o site nao reprova — passa raspando.
        t = mutar(t, 'rgba(0,20,52,0.86) 0%,\n              rgba(0,20,52,0.80) 40%',
          'rgba(0,20,52,0.10) 0%,\n              rgba(0,20,52,0.08) 40%', 'forca do veu no celular')
      } else if (MODO === 'impostor-sem-divisoria') {
        // Apaga a linha. Sem ela as duas areas navy voltam a ler como uma, que
        // e o estado que o Gabriel reprovou olhando a tela.
        t = mutar(t, 'background: rgba(201,168,76,0.5);', 'background: transparent;',
          'linha dourada da divisoria')
      } else if (MODO === 'impostor-vao-branco') {
        // O IRMAO DO impostor-vizinhanca, E ELE EXISTE PORQUE O OUTRO NAO
        // BASTOU. Zerar o padding das secoes derruba a assercao do VAO, mas
        // deixa a do pixel branco VERDE: sem controle proprio, ela seria uma
        // linha verde que nunca provou saber reprovar — que e o defeito mais
        // repetido deste projeto.
        // Aqui volta o defeito que estava no ar: 48px brancos entre a faixa
        // navy e a CTA navy. A regra da faixa mora num <style> DENTRO do
        // bundle, nao na folha, entao a mutacao e aqui.
        // ⚠️ ESTA ANCORA JA QUEBROU DUAS VEZES, e as duas foram exit 3, nunca
        // "passou verde": a regra .faixa-citacao foi reescrita pelo commit da
        // divisoria e depois de novo quando a linha virou dourada. E o motivo
        // de o CI so aceitar exit 1 como mordida.
        t = mutar(t, 'padding: var(--space-faixa-y) 0 var(--space-divisor-y);',
          'padding: var(--space-faixa-y) 0 var(--space-divisor-y); margin-bottom: 48px;',
          'vao branco embaixo da faixa')
      } else if (MODO === 'impostor-grade') {
        // 3 nao divide 4: o quarto cartao fica sozinho na segunda linha, que e
        // exatamente o defeito que a assercao existe para pegar.
        // o gap desambigua: ha tres grades de 4 colunas no bundle, e mutar as
        // tres mexeria em secao que nenhuma assercao daqui observa. O alvo era
        // `gap:24` e virou `gap:var(--gap-g)` quando os literais viraram token —
        // a mutacao saiu 3 na hora, que e o que ela tem de fazer.
        t = mutar(t, 'gridTemplateColumns:`repeat(4, 1fr)`,gap:`var(--gap-g)`',
          'gridTemplateColumns:`repeat(3, 1fr)`,gap:`var(--gap-g)`', 'colunas da grade de "Para quem"')
      } else if (MODO === 'estresse') {
        // ESTRESSE_PX existe para PROVAR que este modo esta ligado nas
        // assercoes: com +1px tudo fica verde (e a folga encolhe, medida), com
        // +12px a folga cai abaixo do piso e o modo fica vermelho. Sem esse
        // segundo ponto, "passou no estresse" nao significaria nada.
        const dx = Number(process.env.ESTRESSE_PX || 1)
        if (!Number.isFinite(dx)) { console.error(`ESTRESSE_PX invalido: ${process.env.ESTRESSE_PX}`); process.exit(3) }
        for (const base of [1.2, 0.6, 0.4]) {
          t = mutar(t, `letter-spacing: ${base}px`, `letter-spacing: ${(base + dx).toFixed(2)}px`,
            `tracking dos rotulos (${base}px -> +${dx}px)`)
        }
      } else if (MODO === 'impostor-pilares') {
        // A figura passa a poder crescer sem limite: ela empurra os rotulos para
        // fora da coluna, e e a mesma mutacao que morde nas DUAS larguras
        // medidas — negativo que so cobre uma delas nao e controle nenhum.
        // tira o rotulo da base da coluna da imagem: ele para debaixo do rotulo
        // da esquerda. Morde nas DUAS larguras medidas — negativo que so cobre
        // uma delas nao e controle nenhum.
        t = mutar(t, 'grid-area: 2 / 2;', 'grid-area: 2 / 1;', 'coluna do rotulo da base')
      } else if (MODO === 'impostor-overlay') {
        t = mutar(t, 'linear-gradient(0deg, rgba(0,15,40,0.82) 0%, rgba(0,15,40,0.65) 100%)',
          'linear-gradient(0deg, rgba(0,15,40,0) 0%, rgba(0,15,40,0) 100%)', 'overlay da faixa')
      } else {
        t = mutar(t, 'fontWeight:600,fontStyle:`italic`', 'fontWeight:400,fontStyle:`normal`', 'destaque da missao')
      }
      await r.fulfill({ body: t, contentType: 'text/javascript' })
    })
  }
}

async function abrir (w, h, opcoes = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.addInitScript(() => { window.__abertos = []; window.open = u => { window.__abertos.push(String(u)); return null } })
  // O carrossel do hero troca de foto sozinho a cada 5s. Medir contraste com ele
  // girando nao da: a foto muda ENTRE os dois quadros da mascara, a diferenca
  // passa a cobrir o hero inteiro e o "fundo mais claro" vira o cartao branco —
  // 1,00:1 sobre rgb(255,255,255), que e assinatura de medicao quebrada.
  // Entao ele fica congelado por padrao, e a rotacao tem bloco proprio, com o
  // relogio correndo, mais abaixo.
  if (opcoes.congelarCarrossel !== false) {
    await page.addInitScript(() => {
      const orig = window.setInterval
      window.setInterval = (fn, t, ...r) => (t === 5000 ? 0 : orig(fn, t, ...r))
    })
  }

  await aplicarRotas(page)
  return { ctx, page }
}

// percorre a pagina para disparar o loading="lazy" das personas
async function varrerPagina (page) {
  await page.evaluate(async () => {
    const passo = window.innerHeight
    for (let y = 0; y < document.body.scrollHeight; y += passo) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })
  // As imagens com loading="lazy" so terminam de chegar DEPOIS da rolagem. Com
  // 500 ms as 11 logos ainda mediam naturalWidth 0 e o teste acusaria falso.
  await page.waitForTimeout(1600)
}

// Contraste do texto branco da faixa contra a FOTO, no ponto mais claro que
// fica ATRAS de um glifo. Medir o retangulo inteiro do <p> nao serve: ele cobre
// area onde nao ha letra nenhuma (um bordado colorido na roupa de uma das
// criancas cai ali) e reprovaria um texto perfeitamente legivel.
//
// A mascara do texto sai da DIFERENCA entre o mesmo quadro com e sem o <p>
// visivel, dilatada 2px para pegar tambem o fundo encostado no glifo. O valor
// medido e o do quadro SEM texto, senao estariamos lendo o proprio branco.
async function contrasteDaFaixa (page) {
  const achou = await page.evaluate(() => {
    const el = document.querySelector('.faixa-parallax')
    if (!el) return null
    const r = el.getBoundingClientRect()
    window.scrollTo(0, Math.max(0, r.top + window.scrollY + r.height / 2 - window.innerHeight / 2))
    return true
  })
  if (!achou) return null
  await page.waitForTimeout(500)
  const alvo = page.locator('.faixa-parallax')
  const com = (await alvo.screenshot()).toString('base64')
  await page.evaluate(() => { document.querySelector('.faixa-parallax p').style.visibility = 'hidden' })
  await page.waitForTimeout(200)
  const sem = (await alvo.screenshot()).toString('base64')
  await page.evaluate(() => { document.querySelector('.faixa-parallax p').style.visibility = '' })

  return await page.evaluate(async ([a, b]) => {
    const carregar = async d => { const i = new Image(); await new Promise(r => { i.onload = r; i.src = 'data:image/png;base64,' + d }); return i }
    const dados = im => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height
      const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, c.width, c.height) }
    const A = dados(await carregar(a)), B = dados(await carregar(b))
    const w = A.width, h = A.height
    const m = new Uint8Array(w * h)
    let nGlifo = 0
    for (let i = 0, k = 0; i < A.data.length; i += 4, k++) {
      const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2])
      if (d > 30) { m[k] = 1; nGlifo++ }
    }
    const md = new Uint8Array(w * h), R = 2
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!m[y * w + x]) continue
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        const yy = y + dy, xx = x + dx
        if (yy >= 0 && yy < h && xx >= 0 && xx < w) md[yy * w + xx] = 1
      }
    }
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
    let cor = null, maxL = -1, nMascara = 0
    for (let k = 0; k < md.length; k++) {
      if (!md[k]) continue
      nMascara++
      const i = k * 4, Rr = B.data[i], G = B.data[i + 1], Bb = B.data[i + 2]
      const L = 0.2126 * f(Rr) + 0.7152 * f(G) + 0.0722 * f(Bb)
      if (L > maxL) { maxL = L; cor = [Rr, G, Bb] }
    }
    return { cor, nGlifo, nMascara, razao: nGlifo ? 1.05 / (maxL + 0.05) : 0 }
  }, [com, sem])
}

// Os rotulos dos pilares vivem FORA da figura. Duas coisas podem dar errado sem
// erro nenhum no console: o texto transbordar a propria caixa (CONFIANCA e uma
// palavra so e nao quebra linha) ou a caixa pisar em cima da imagem. As duas se
// medem por geometria, e as duas tem de ser medidas em CADA largura — o que
// cabe em 1440 nao diz nada sobre 390.
async function medirPilares (page) {
  return await page.evaluate(() => {
    const fig = document.querySelector('.pilares-fig')
    if (!fig) return null
    fig.scrollIntoView({ block: 'center' })
    const img = fig.querySelector('.pilares-img')
    const rot = [...fig.querySelectorAll('.pilar-rotulo')]
    if (!img || !rot.length) return { n: rot.length, img: !!img }
    const cai = e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } }
    const ci = cai(img)
    const bate = (a, b) => !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y)
    return {
      n: rot.length,
      img: true,
      src: img.getAttribute('src'),
      natural: img.naturalWidth,
      // "alinhado a peca da sua cor" e uma afirmacao de POSICAO, e e a unica
      // parte disto que uma folha de estilo consegue inverter sem quebrar mais
      // nada — por isso ela e o alvo do impostor.
      // folga ate a borda do container: rotulo colado na borda e a vespera do
      // rotulo POR FORA dela na proxima maquina que renderizar 2px mais largo.
      folga: (() => {
        const cont = fig.closest('.container') || fig.parentElement
        const rc = cont.getBoundingClientRect()
        return Math.round(Math.min(...rot.flatMap(e => {
          const r = e.getBoundingClientRect(); return [r.x - rc.x, rc.right - r.right]
        })))
      })(),
      esqAEsquerda: cai(rot[0]).x + cai(rot[0]).w <= ci.x + 1,
      dirADireita: cai(rot[1]).x >= ci.x + ci.w - 1,
      baseAbaixo: cai(rot[2]).y >= ci.y + ci.h - 1,
      baseCentrada: Math.abs((cai(rot[2]).x + cai(rot[2]).w / 2) - (ci.x + ci.w / 2)) <= 4,
      cortados: rot.filter(e => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)
        .map(e => `${e.textContent}(${e.scrollWidth}>${e.clientWidth})`),
      sobrepostos: rot.filter(e => bate(cai(e), ci)).map(e => e.textContent),
      fora: rot.filter(e => { const r = cai(e); return r.x < 0 || r.x + r.w > window.innerWidth })
        .map(e => e.textContent),
      cores: rot.map(e => getComputedStyle(e).color),
      fam: rot.map(e => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '')),
      peso: rot.map(e => getComputedStyle(e).fontWeight),
      caixaAlta: rot.every(e => getComputedStyle(e).textTransform === 'uppercase'),
      tracking: rot.every(e => parseFloat(getComputedStyle(e).letterSpacing) > 0),
    }
  })
}

// Contraste do texto do hero contra a FOTO, por slide. Mesma tecnica da faixa:
// mascara do texto pela diferenca entre o quadro com e sem o <h1>/<p>, e o valor
// lido no quadro SEM texto. O <h1> e o <p> sao escondidos por visibility, nunca
// por display: tirar do fluxo moveria tudo e a diferenca deixaria de ser o texto.
async function contrasteDoHero (page) {
  const dots = page.locator('#inicio button[aria-label^="Slide"]')
  const n = await dots.count()
  if (!n) return null
  // topo antes de comecar: o hero e o primeiro bloco e o resto da suite deixa a
  // pagina rolada. Sem isto o primeiro clique rola a pagina POR CONTA PROPRIA, e
  // o quadro sai de uma cena que ainda esta se acomodando.
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  const fora = []
  for (let i = 0; i < n; i++) {
    await dots.nth(i).click()
    await page.waitForTimeout(1500)   // a transicao de opacidade e 1,2s
    const alvo = page.locator('#inicio')
    const com = (await alvo.screenshot()).toString('base64')
    await page.evaluate(() => {
      const st = document.createElement('style'); st.id = '__oc'
      st.textContent = '#inicio h1, #inicio h1 ~ p { visibility: hidden !important }'
      document.head.appendChild(st)
    })
    await page.waitForTimeout(180)
    const sem = (await alvo.screenshot()).toString('base64')
    await page.evaluate(() => document.getElementById('__oc')?.remove())
    const r = await page.evaluate(async ([a, b]) => {
      const carregar = async d => { const i = new Image(); await new Promise(r => { i.onload = r; i.src = 'data:image/png;base64,' + d }); return i }
      const dados = im => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height
        const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, c.width, c.height) }
      const A = dados(await carregar(a)), B = dados(await carregar(b))
      // Quadros de tamanhos diferentes fariam a comparacao ler pixels trocados,
      // e o resultado disso e plausivel demais para dar na vista.
      if (A.width !== B.width || A.height !== B.height) {
        return { erro: `quadros de tamanhos diferentes: ${A.width}x${A.height} vs ${B.width}x${B.height}` }
      }
      const w = A.width, h = A.height
      const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
      const m = new Uint8Array(w * h); let nG = 0
      for (let i = 0, k = 0; i < A.data.length; i += 4, k++) {
        const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i+1] - B.data[i+1]) + Math.abs(A.data[i+2] - B.data[i+2])
        if (d > 30) { m[k] = 1; nG++ }
      }
      const md = new Uint8Array(w * h), R = 2
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!m[y * w + x]) continue
        for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
          const yy = y + dy, xx = x + dx
          if (yy >= 0 && yy < h && xx >= 0 && xx < w) md[yy * w + xx] = 1
        }
      }
      let cor = null, maxL = -1
      for (let k = 0; k < md.length; k++) {
        if (!md[k]) continue
        const i = k * 4, Rr = B.data[i], G = B.data[i+1], Bb = B.data[i+2]
        const L = 0.2126 * f(Rr) + 0.7152 * f(G) + 0.0722 * f(Bb)
        if (L > maxL) { maxL = L; cor = [Rr, G, Bb] }
      }
      return { nG, cor, razao: 1.05 / (maxL + 0.05), fracao: nG / (w * h) }
    }, [com, sem])
    if (r.erro) { console.error(`INSTRUMENTO: hero slide ${i + 1}: ${r.erro}`); process.exit(3) }
    fora.push(r)
  }
  return fora
}

// O logo do cabecalho: tamanho, proporcao e se ele cabe na barra. A caixa do
// <img> e a marca eram coisas diferentes ate agora — o PNG tinha 76% de
// transparencia na vertical, entao "height: 90" desenhava 21px de marca. O
// arquivo foi recortado na tinta, e por isso a caixa medida aqui E a marca.
async function medirLogoCabecalho (page) {
  return await page.evaluate(() => {
    const img = document.querySelector('header img')
    if (!img) return null
    const r = img.getBoundingClientRect()
    const barra = img.closest('.container').getBoundingClientRect()
    const vizinhos = [...img.closest('.container').children]
      .filter(e => !e.contains(img) && getComputedStyle(e).display !== 'none')
      .map(e => e.getBoundingClientRect())
    return {
      larg: Math.round(r.width), alt: Math.round(r.height),
      nat: img.naturalWidth / img.naturalHeight,
      prop: r.width / r.height,
      transborda: Math.round(Math.max(0, barra.top - r.top) + Math.max(0, r.bottom - barra.bottom)),
      folga: vizinhos.length ? Math.round(Math.min(...vizinhos.map(v => v.left)) - r.right) : null,
      completo: img.complete && img.naturalWidth > 0,
    }
  })
}

// ---------------- DESKTOP ----------------
{
  const { ctx, page } = await abrir(1440, 1000)
  await irPara(page, BASE)
  await page.evaluate(() => document.fonts.ready.then(() => 0))
  await varrerPagina(page)

  // ---- 1. a fonte da marca carregou de fato ----
  // document.fonts.check() devolve TRUE quando a familia nem esta declarada
  // (nao ha face pendente a reportar): sozinho ele e vacuo — o impostor-rede
  // prova isso. Quem discrimina e fonts.load(), que devolve ARRAY VAZIO quando
  // nada casa, e a medicao da largura renderizada.
  const chk = await page.evaluate(() => ({
    c3: document.fonts.check('300 16px Montserrat'),
    c7: document.fonts.check('700 16px Montserrat'),
  }))
  V('document.fonts.check 300/700 Montserrat [nao discrimina sozinho]', chk.c3 && chk.c7, JSON.stringify(chk))

  const faces = await page.evaluate(async () => {
    const l3 = await document.fonts.load('300 16px Montserrat')
    const l7 = await document.fonts.load('700 16px Montserrat')
    return { n3: l3.length, n7: l7.length, pesos: [...document.fonts].filter(f => /Montserrat/i.test(f.family) && f.status === 'loaded').map(f => f.weight) }
  })
  V('document.fonts.load casa a face Montserrat 300', faces.n3 > 0, `${faces.n3} face(s); pesos carregados: ${faces.pesos.join(',') || 'nenhum'}`)
  V('document.fonts.load casa a face Montserrat 700', faces.n7 > 0, `${faces.n7} face(s)`)

  const sonda = await page.evaluate(() => {
    const medir = ff => {
      const s = document.createElement('span')
      s.textContent = 'Proteja o que você construiu'
      s.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-size:40px;font-weight:300;font-family:${ff}`
      document.body.appendChild(s); const w = s.getBoundingClientRect().width; s.remove(); return w
    }
    return { mont: medir("'Montserrat'"), fake: medir("'NaoExisteEssaFonte123'") }
  })
  V('texto renderizado com Montserrat difere do fallback', Math.abs(sonda.mont - sonda.fake) > 2,
    `Montserrat=${sonda.mont.toFixed(1)}px fallback=${sonda.fake.toFixed(1)}px`)

  // ---- 2. titulos, citacao e bloco da missao ----
  // Tipografia de DISPLAY. Os <h4> do rodape ficam de fora de proposito: sao
  // rotulos de coluna em var(--font-body) (Inter), como no que esta no ar.
  const tit = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3, blockquote, .faixa-parallax p, #sobre h4')].map(el => {
    const cs = getComputedStyle(el)
    return { tag: el.tagName.toLowerCase(), txt: (el.textContent || '').trim().slice(0, 34), ff: cs.fontFamily, fs: cs.fontStyle, fw: cs.fontWeight,
      faixa: !!el.closest('.faixa-parallax') }
  }))
  V('titulos/citacao/missao presentes no DOM', tit.length >= 20, `${tit.length} elementos`)
  const foraFam = tit.filter(t => !/^["']?Montserrat/i.test(t.ff.trim()))
  V('fontFamily comeca com Montserrat', foraFam.length === 0, foraFam.length ? JSON.stringify(foraFam.slice(0, 2)) : `${tit.length}/${tit.length}`)

  // A frase do proposito e a UNICA inclinada entre os titulos, e isso se afirma
  // nos DOIS sentidos: ela italica, e todo o resto normal. So a segunda metade
  // deixaria passar a frase voltando a ficar reta sem ninguem perceber.
  const inclinados = tit.filter(t => t.fs !== 'normal')
  const faixaInclinada = inclinados.filter(t => t.faixa)
  const outrosInclinados = inclinados.filter(t => !t.faixa)
  V('a frase do proposito e italica', faixaInclinada.length === 1,
    `${faixaInclinada.length} elemento(s) da faixa inclinado(s)`)
  V('fontStyle normal em todo o resto', outrosInclinados.length === 0,
    outrosInclinados.length ? JSON.stringify(outrosInclinados.slice(0, 2)) : `${tit.length - 1}/${tit.length - 1}`)

  // ---- 3. varredura: nenhuma fonte serifada renderizada, SVG do monograma incluso ----
  const sweep = await page.evaluate(() => {
    const alvos = [document.body, ...document.body.querySelectorAll('*')]
      .filter(el => !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName))
    const ruins = []
    for (const el of alvos) {
      const ff = getComputedStyle(el).fontFamily
      if (/serif|cormorant|georgia|times/i.test(ff.replace(/sans-serif/gi, ''))) {
        ruins.push({ tag: el.tagName.toLowerCase(), ff, txt: (el.textContent || '').trim().slice(0, 26) })
      }
    }
    // os rotulos dos pilares sairam do SVG e viraram HTML: o que precisa ficar
    // provado e que a varredura PASSA por eles, nao onde eles moram.
    const rotPilares = alvos.filter(el => el.classList && el.classList.contains('pilar-rotulo')).length
    return { varridos: alvos.length, ruins, rotPilares }
  })
  V('varredura cobriu a arvore', sweep.varridos > 300, `${sweep.varridos} elementos`)
  V('varredura alcancou os rotulos dos pilares', sweep.rotPilares === 3, `${sweep.rotPilares} rotulos varridos`)

  // ---- 3b. a figura dos pilares e os tres rotulos ----
  const pil = await medirPilares(page)
  if (!pil) { console.error('INSTRUMENTO: .pilares-fig nao existe'); process.exit(3) }
  V('figura dos pilares e os 3 rotulos existem', pil.n === 3 && pil.img === true, `${pil.n} rotulos, img=${pil.img}`)
  if (pil.natural !== undefined) {
    // ⚠️ ANTES ISTO CRAVAVA '/sls-site/assets/...'. A propriedade que importa
    // nunca foi o CAMINHO, e sim que a imagem venha do NOSSO servidor — o teste
    // existe contra hotlink. Com a troca de base o literal viraria mentira em
    // dois sentidos: reprovaria o conserto hoje, e amanha passaria com qualquer
    // origem se alguem so apagasse o prefixo. Agora afirma a ORIGEM.
    //
    // E o src aqui e o ATRIBUTO, que e relativo: '/assets/...'. Compara-lo cru
    // com a origem reprovava o conserto — resolver contra o BASE e o que
    // transforma "o caminho escrito no HTML" em "de onde o arquivo vem".
    const srcPil = new URL(String(pil.src), BASE)
    V('triangulo e local e decodifica',
      srcPil.origin === new URL(BASE).origin && srcPil.pathname.endsWith('/assets/triangulo-pilares.svg') && pil.natural > 0,
      `${srcPil.href} naturalWidth=${pil.natural}`)
    V('rotulos em Montserrat 600, caixa alta e com tracking',
      pil.fam.every(f => f === 'Montserrat') && pil.peso.every(w => w === '600') && pil.caixaAlta && pil.tracking,
      `${JSON.stringify(pil.fam)} ${JSON.stringify(pil.peso)} caixaAlta=${pil.caixaAlta} tracking=${pil.tracking}`)
    // Aco e navy sao a cor exata da peca. O dourado do rotulo da base e MAIS
    // ESCURO que o da peca (#8F7325 contra #A6872F): o da peca dava 3,43:1 sobre
    // branco, abaixo do piso AA para texto pequeno. A peca do triangulo nao
    // mudou — quem mudou foi a letra.
    V('cada rotulo na cor esperada',
      JSON.stringify(pil.cores) === JSON.stringify(['rgb(75, 106, 138)', 'rgb(0, 58, 112)', 'rgb(143, 115, 37)']),
      JSON.stringify(pil.cores))
    V('rotulos dos pilares nao cortam nem sobrepoem a figura em 1440px',
      pil.cortados.length === 0 && pil.sobrepostos.length === 0 && pil.fora.length === 0,
      `cortados=${JSON.stringify(pil.cortados)} sobrepostos=${JSON.stringify(pil.sobrepostos)} fora=${JSON.stringify(pil.fora)}`)
    V('cada rotulo do lado da sua peca em 1440px',
      pil.esqAEsquerda && pil.dirADireita && pil.baseAbaixo && pil.baseCentrada,
      `esq=${pil.esqAEsquerda} dir=${pil.dirADireita} base=${pil.baseAbaixo} centrada=${pil.baseCentrada}`)
  }

  // ---- 3b2. o logo do cabecalho ----
  const logoD = await medirLogoCabecalho(page)
  if (!logoD) { console.error('INSTRUMENTO: nao achei o logo do cabecalho'); process.exit(3) }
  // Contraste dos TRES rotulos contra o fundo que esta atras deles. O dourado
  // era o que reprovava, mas afirmar so ele deixaria os outros dois livres para
  // regredir sem ninguem ver.
  const ctRot = await page.evaluate(() => {
    const resolver = el => {
      for (let n = el; n; n = n.parentElement) {
        const c = getComputedStyle(n).backgroundColor
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c
      }
      return 'rgb(255, 255, 255)'
    }
    const canal = s => { const m = s.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 } }
    const compor = (f0, b0) => { const f = canal(f0), b = canal(b0)
      return { r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 } }
    const lin = v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
    return [...document.querySelectorAll('.pilar-rotulo')].map(el => {
      const cor = getComputedStyle(el).color, fundo = resolver(el)
      const x = lum(compor(cor, fundo)), y = lum(canal(fundo))
      return { txt: el.textContent, cor, fundo,
        razao: +(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05))).toFixed(2) }
    })
  })
  V('contraste AA dos tres rotulos dos pilares', ctRot.length === 3 && ctRot.every(r => r.razao >= 4.5),
    ctRot.map(r => `${r.txt} ${r.razao}:1`).join(' | '))

  // ---- 3b4. a faixa da citacao ----
  // O retrato tem loading="lazy": ele so e buscado quando a faixa chega perto da
  // viewport. Sem levar a faixa ate la e ESPERAR, naturalWidth mede 0 e a
  // assercao acusa um defeito que nao existe — foi o que aconteceu aqui.
  // A espera tem prazo e o erro e engolido de proposito: se a foto nao chegar,
  // quem reprova e a assercao abaixo. Esperar pela propria condicao que se
  // afirma, sem prazo, seria vacuidade.
  const faixaCit = await page.$('.faixa-citacao')
  if (faixaCit) {
    await faixaCit.scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForFunction(
      () => { const i = document.querySelector('.citacao-foto'); return i && i.complete && i.naturalWidth > 0 },
      null, { timeout: 10000 }).catch(() => {})
  }
  const cit = await page.evaluate(() => {
    const f = document.querySelector('.faixa-citacao')
    if (!f) return null
    const img = f.querySelector('.citacao-foto')
    const q = f.querySelector('.citacao-texto')
    const a = f.querySelector('.citacao-assinatura')
    if (!img || !q || !a) return { incompleta: true, img: !!img, q: !!q, a: !!a }
    const resolver = el => {
      for (let n = el; n; n = n.parentElement) {
        const c = getComputedStyle(n).backgroundColor
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c
      }
      return 'rgb(255, 255, 255)'
    }
    const canal = s => { const m = s.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 } }
    const compor = (f0, b0) => { const x = canal(f0), y = canal(b0)
      return { r: x.r * x.a + y.r * (1 - x.a), g: x.g * x.a + y.g * (1 - x.a), b: x.b * x.a + y.b * (1 - x.a), a: 1 } }
    const lin = v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
    const razao = (frente, fundo) => { const x = lum(compor(frente, fundo)), y = lum(canal(fundo))
      return +(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05))).toFixed(2) }
    const ri = img.getBoundingClientRect(), rq = q.getBoundingClientRect()
    const cs = getComputedStyle(img)
    return {
      texto: q.textContent.trim(), assinatura: a.textContent.trim(),
      fundo: getComputedStyle(f).backgroundColor,
      ctTexto: razao(getComputedStyle(q).color, resolver(q)),
      ctAssinatura: razao(getComputedStyle(a).color, resolver(a)),
      fam: getComputedStyle(q).fontFamily.split(',')[0].replace(/"/g, ''),
      peso: getComputedStyle(q).fontWeight, estilo: getComputedStyle(q).fontStyle,
      nat: img.naturalWidth, src: img.getAttribute('src'),
      redonda: cs.borderRadius === '50%',
      borda: `${cs.borderTopWidth} ${cs.borderTopColor}`,
      lado: Math.round(ri.width), quadrada: Math.abs(ri.width - ri.height) <= 1,
      aEsquerda: Math.round(ri.right) <= Math.round(rq.left) + 2,
      largura: Math.round(f.getBoundingClientRect().width),
      janela: window.innerWidth,
    }
  })
  if (!cit) { console.error('INSTRUMENTO: .faixa-citacao nao existe'); process.exit(3) }
  if (cit.incompleta) { console.error(`INSTRUMENTO: faixa da citacao incompleta: ${JSON.stringify(cit)}`); process.exit(3) }
  V('citacao do Gabriel na faixa', cit.texto === '"Meu papel é estar lá antes de você precisar."' && cit.assinatura === '— Gabriel Vital',
    `${JSON.stringify(cit.texto)} / ${JSON.stringify(cit.assinatura)}`)
  V('faixa da citacao e navy e ocupa a largura da tela', cit.fundo === 'rgb(0, 58, 112)' && cit.largura === cit.janela,
    `${cit.fundo}, ${cit.largura}px de ${cit.janela}px`)
  V('citacao em Montserrat 300, sem inclinacao', cit.fam === 'Montserrat' && cit.peso === '300' && cit.estilo === 'normal',
    `${cit.fam} ${cit.peso} ${cit.estilo}`)
  // Dourado sobre navy: a assinatura e o ponto fraco obvio, e e por isso que ela
  // e medida junto com o texto, nao no lugar dele.
  V('contraste AA do texto e da assinatura da citacao', cit.ctTexto >= 4.5 && cit.ctAssinatura >= 4.5,
    `texto ${cit.ctTexto}:1 | assinatura ${cit.ctAssinatura}:1 sobre ${cit.fundo}`)
  V('retrato do Gabriel carregou, redondo e com borda dourada',
    cit.nat > 0 && cit.redonda && cit.quadrada && cit.borda === '3px rgb(201, 168, 76)',
    `${cit.src} nat=${cit.nat} ${cit.lado}px raio50=${cit.redonda} quadrada=${cit.quadrada} borda=${cit.borda}`)
  V('retrato a esquerda do texto em 1440px', cit.aEsquerda, `img.right <= texto.left: ${cit.aEsquerda}`)

  V('logo do cabecalho carregou', logoD.completo, `${logoD.larg}x${logoD.alt}`)
  V('logo do cabecalho sem deformar (proporcao igual a do arquivo)',
    Math.abs(logoD.prop - logoD.nat) / logoD.nat < 0.01,
    `renderizado ${logoD.prop.toFixed(3)} vs natural ${logoD.nat.toFixed(3)}`)
  V('logo do cabecalho cabe na barra em 1440px', logoD.transborda === 0, `transborda ${logoD.transborda}px`)
  V('logo do cabecalho nao encosta no menu em 1440px', logoD.folga === null || logoD.folga > 16, `folga ${logoD.folga}px`)

  // ---- 3b3. a grade de seguradoras fecha toda linha ----
  // Cartao solto na ultima linha e o defeito. A propriedade travada e "o numero
  // de colunas DIVIDE o numero de cartoes", em cada largura — nunca um numero de
  // colunas cravado, que precisaria ser reescrito a cada parceira nova.
  for (const larg of [1440, 1024, 900, 560, 390, 320]) {
    await page.setViewportSize({ width: larg, height: 900 })
    await page.waitForTimeout(280)
    const g = await page.evaluate(() => {
      const el = document.querySelector('.seguradoras-grid')
      if (!el) return null
      el.scrollIntoView({ block: 'center' })
      const cols = getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length
      const cards = el.children.length
      const tops = [...el.children].map(c => Math.round(c.getBoundingClientRect().top))
      const ultima = Math.max(...tops)
      return { cols, cards, linhas: new Set(tops).size, naUltima: tops.filter(t => t === ultima).length,
        rolagem: document.documentElement.scrollWidth <= document.documentElement.clientWidth }
    })
    if (!g) { console.error('INSTRUMENTO: .seguradoras-grid nao existe'); process.exit(3) }
    V(`grade de seguradoras sem cartao solto em ${larg}px`,
      g.cards % g.cols === 0 && g.naUltima === g.cols,
      `${g.cards} cartoes em ${g.cols} coluna(s), ${g.linhas} linha(s), ${g.naUltima} na ultima`)
    V(`sem rolagem lateral na grade de seguradoras em ${larg}px`, g.rolagem === true, g.rolagem ? 'ok' : 'HORIZONTAL')
  }
  // No celular sao sempre 2 colunas, entao um numero IMPAR de parceiras deixaria
  // uma sozinha por construcao — nenhuma escolha de colunas conserta isso.
  const nParceiras = await page.evaluate(() => document.querySelectorAll('.seguradoras-grid > *').length)
  V('numero de parceiras e par', nParceiras % 2 === 0, `${nParceiras} parceiras`)

  // Nenhum SVG de seguradora pode depender de currentColor. Dentro de um <img> o
  // SVG e um documento PROPRIO: currentColor nao herda nada da pagina e resolve
  // para o preto padrao dele. Foi o defeito da Azos, e o sintoma — um logo preto
  // no meio de logos coloridos — nao chama atencao de ninguem.
  const svgsCor = await page.evaluate(async () => {
    const urls = [...new Set([...document.querySelectorAll('.seguradoras-grid img')]
      .map(i => i.getAttribute('src')).filter(u => u.endsWith('.svg')))]
    const ruins = []
    for (const u of urls) {
      try {
        const t = await (await fetch(u)).text()
        if (/currentColor/i.test(t)) ruins.push(u.split('/').pop())
      } catch { ruins.push(u.split('/').pop() + '(nao baixou)') }
    }
    return { n: urls.length, ruins }
  })
  V('nenhum logo de seguradora depende de currentColor', svgsCor.n > 0 && svgsCor.ruins.length === 0,
    `${svgsCor.n} SVGs conferidos` + (svgsCor.ruins.length ? ` | COM currentColor: ${JSON.stringify(svgsCor.ruins)}` : ''))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.waitForTimeout(280)

  // ---- 3c. as fotos do hero ----
  const fotosHero = await page.evaluate(async () => {
    const divs = [...document.querySelectorAll('#inicio > div')]
      .filter(d => getComputedStyle(d).backgroundImage.includes('url('))
    const out = []
    for (const d of divs) {
      const u = (getComputedStyle(d).backgroundImage.match(/url\("?([^")]+)"?\)/) || [])[1]
      if (!u) continue
      let status = 0, larg = 0
      try { status = (await fetch(u)).status } catch { status = 0 }
      larg = await new Promise(res => { const i = new Image(); i.onload = () => res(i.naturalWidth); i.onerror = () => res(0); i.src = u })
      out.push({ url: u, status, larg })
    }
    return out
  })
  V('tres fotos de hero no DOM', fotosHero.length === 3, `${fotosHero.length}: ${fotosHero.map(f => f.url.split('/').pop()).join(', ')}`)
  // Mesmo motivo da faixa: um engasgo no CDN de terceiro deixava o hero — a
  // PRIMEIRA coisa que a pessoa ve — sem foto nenhuma, e sem erro no console.
  V('toda foto do hero e local e decodifica',
    fotosHero.length === 3 && fotosHero.every(f => f.url.startsWith(new URL(BASE).origin) && /\/assets\/hero-[123]\.webp$/.test(f.url) && f.status === 200 && f.larg > 0),
    fotosHero.map(f => `${f.url.split('/').pop()} http=${f.status} w=${f.larg}`).join(' | '))

  const heroDesk = await contrasteDoHero(page)
  if (!heroDesk || heroDesk.some(h => !h.nG)) { console.error('INSTRUMENTO: mascara do texto do hero vazia em 1440px'); process.exit(3) }
  // Mascara gigante = a foto trocou entre os dois quadros e a diferenca virou o
  // hero inteiro. O numero que sairia dai e sobre o cartao branco, nao sobre a
  // foto — e melhor morrer do que reportar 1,00:1 como se fosse medicao.
  if (heroDesk.some(h => h.fracao > 0.25)) {
    console.error(`INSTRUMENTO: mascara do hero grande demais (${heroDesk.map(h => (100*h.fracao).toFixed(0) + '%').join(', ')}) — o carrossel nao congelou`)
    process.exit(3)
  }
  heroDesk.forEach((h, i) => V(`contraste AA do texto do hero, slide ${i + 1}, em 1440px`, h.razao >= 4.5,
    `${h.razao.toFixed(2)}:1 sobre rgb(${h.cor.join(',')}), ${h.nG}px de glifo`))
  V('zero elementos com fonte serifada', sweep.ruins.length === 0, sweep.ruins.length ? JSON.stringify(sweep.ruins.slice(0, 3)) : `0 de ${sweep.varridos}`)

  // ---- 4. destaques no peso do logo ----
  const destaques = await page.evaluate(() => {
    const ler = sel => {
      const el = document.querySelector(sel); if (!el) return null
      const cs = getComputedStyle(el)
      return { txt: el.textContent, fw: cs.fontWeight, fs: cs.fontStyle, ff: cs.fontFamily }
    }
    return { hero: ler('#inicio h1 em'), missao: ler('.faixa-parallax em') }
  })
  V('<em> do hero existe', destaques.hero !== null, destaques.hero ? `"${destaques.hero.txt}"` : 'ausente')
  if (destaques.hero) {
    V('<em> do hero: peso 700, sem inclinacao', destaques.hero.fw === '700' && destaques.hero.fs === 'normal',
      `peso=${destaques.hero.fw} estilo=${destaques.hero.fs}`)
  }
  // ---- a faixa do proposito ----
  const faixa = await page.evaluate(async () => {
    const el = document.querySelector('.faixa-parallax')
    if (!el) return null
    const p = el.querySelector('p')
    const bg = getComputedStyle(el).backgroundImage
    const url = (bg.match(/url\("?([^")]+)"?\)/) || [])[1]
    let status = 0, larg = 0
    if (url) {
      try { status = (await fetch(url)).status } catch { status = 0 }
      larg = await new Promise(res => { const i = new Image(); i.onload = () => res(i.naturalWidth); i.onerror = () => res(0); i.src = url })
    }
    return {
      texto: (p ? p.textContent : '').trim(),
      url, status, larg,
      temSpan: !!el.querySelector('span'),
      anexo: getComputedStyle(el).backgroundAttachment,
    }
  })
  V('faixa do proposito existe', faixa !== null)
  if (faixa) {
    V('texto novo da faixa', faixa.texto === '"Nosso propósito é cuidar de você. Somos especialistas em proteger famílias, carreiras e legados."',
      JSON.stringify(faixa.texto.slice(0, 80)))
    V('o "— Missão da Seu Legado Seguro" saiu', !faixa.temSpan && !faixa.texto.includes('Missão'), faixa.temSpan ? 'ainda ha <span>' : 'sem span')
    // A foto tem de ser SERVIDA PELO PROPRIO SITE. Antes vinha do Unsplash: um
    // engasgo de terceiro apagava o fundo da faixa em producao.
    V('foto da faixa e local (mesmo host)',
    !!faixa.url && faixa.url.startsWith(new URL(BASE).origin) && faixa.url.endsWith('/assets/faixa-familia.webp'), `${faixa.url}`)
    V('foto da faixa responde e decodifica', faixa.status === 200 && faixa.larg > 0, `http=${faixa.status} naturalWidth=${faixa.larg}`)

    // A propriedade travada e o PISO da WCAG AA (4.5:1), nao o numero medido:
    // congelar "7.63" transformaria qualquer melhora de contraste em vermelho.
    const ct = await contrasteDaFaixa(page)
    if (!ct || !ct.nGlifo) {
      console.error('INSTRUMENTO: mascara do texto da faixa saiu VAZIA')
      process.exit(3)
    }
    V('contraste AA do texto da faixa em 1440px', ct.razao >= 4.5,
      `${ct.razao.toFixed(2)}:1 sobre rgb(${ct.cor.join(',')}), ${ct.nGlifo}px de glifo`)
  }

  V('<em> da missao existe', destaques.missao !== null, destaques.missao ? `"${destaques.missao.txt}"` : 'ausente')
  if (destaques.missao) {
    V('<em> da missao: peso 600, italico', destaques.missao.fw === '600' && destaques.missao.fs === 'italic',
      `peso=${destaques.missao.fw} estilo=${destaques.missao.fs}`)
  }

  // ITALICO DE VERDADE, nao inclinacao sintetizada. Quando a face italica nao
  // chega, o navegador cisalha a romana e o texto FICA inclinado do mesmo
  // jeito — computed style diz "italic" nos dois casos, entao perguntar o
  // estilo e vacuo. O que separa e a LARGURA DE AVANCO: a face italica da
  // Montserrat tem metricas proprias, o cisalhamento reaproveita as da romana.
  const ital = await page.evaluate(async () => {
    const amostra = 'famílias, carreiras e legados'
    await document.fonts.load('300 40px Montserrat')
    await document.fonts.load('italic 300 40px Montserrat')
    const medir = estilo => {
      const el = document.createElement('span')
      el.textContent = amostra
      el.style.cssText = `position:absolute;left:-9999px;top:0;white-space:nowrap;font:${estilo} 300 40px Montserrat`
      document.body.appendChild(el)
      const w = el.getBoundingClientRect().width
      el.remove()
      return w
    }
    return { reta: medir('normal'), inclinada: medir('italic') }
  })
  V('a face italica da Montserrat carregou (nao e inclinacao sintetizada)',
    ital.reta > 0 && Math.abs(ital.inclinada - ital.reta) > 0.5,
    `reta ${ital.reta.toFixed(1)}px, italica ${ital.inclinada.toFixed(1)}px, diferenca ${(ital.inclinada - ital.reta).toFixed(1)}px`)

  // O tamanho da frase caiu: clamp(20px, 2.4vw, 32px). O que se trava sao os
  // LIMITES do clamp, nao o numero medido numa largura — e em 1440 o teto de
  // 32px e que manda, porque 2.4vw daria 34,6.
  const tamFaixa = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.faixa-parallax p')).fontSize))
  V('frase do proposito dentro do clamp 20-32px em 1440px', tamFaixa >= 20 && tamFaixa <= 32, `${tamFaixa}px`)

  // ---- 5. o unico italico que fica e o "dentre outras..." (Inter) ----
  const italicos = await page.evaluate(() => [...document.querySelectorAll('*')]
    .filter(el => getComputedStyle(el).fontStyle === 'italic')
    .map(el => ({ txt: (el.textContent || '').trim().slice(0, 30), ff: getComputedStyle(el).fontFamily,
      faixa: !!el.closest('.faixa-parallax') })))
  // Duas familias de italico sao permitidas, e so duas: o "dentre outras..." em
  // Inter, que ja existia, e a frase do proposito em Montserrat.
  const foraDaRegra = italicos.filter(i =>
    !(i.txt === 'dentre outras...' && /^["']?Inter/.test(i.ff)) &&
    !(i.faixa && /^["']?Montserrat/.test(i.ff)))
  V('italico so no "dentre outras..." (Inter) e na frase do proposito (Montserrat)',
    italicos.length > 0 && foraDaRegra.length === 0,
    `${italicos.length} italicos: ${JSON.stringify([...new Set(italicos.map(i => i.txt))])}` +
    (foraDaRegra.length ? ` | FORA DA REGRA ${JSON.stringify(foraDaRegra.slice(0, 2))}` : ''))

  // ---- 6. personas e PWA ----
  const personas = await page.evaluate(() => [...document.querySelectorAll('img[src*="persona-"]')]
    .map(i => ({ src: i.getAttribute('src'), nw: i.naturalWidth, nh: i.naturalHeight })))
  const N_PERSONAS = 4
  V(`${N_PERSONAS} personas no DOM`, personas.length === N_PERSONAS, `${personas.length}: ${personas.map(p => p.src.split('/').pop()).join(', ')}`)
  V('toda persona e WebP com alfa', personas.length > 0 && personas.every(p => p.src.endsWith('.webp')),
    personas.map(p => p.src.split('/').pop()).join(', '))
  V('toda persona carregou (naturalWidth > 0)', personas.length === N_PERSONAS && personas.every(p => p.nw > 0),
    personas.map(p => `${p.nw}x${p.nh}`).join(' | '))
  V('a persona CLT esta entre elas', personas.some(p => p.src.includes('persona-clt.webp')),
    personas.map(p => p.src.split('/').pop()).join(', '))

  // Enquadramento igual entre as quatro. Quem garante isso de verdade e o
  // personas.py, que mede o ROSTO e morre em exit 3 se a foto nova nao ficar na
  // mesma proporcao das outras. Aqui fica a metade barata e observavel: se uma
  // delas voltar com outro formato de quadro, ela renderiza em outra escala
  // dentro do cartao. O quadro do CLT chegou a sair 0,74 contra 1,02 das
  // outras, e era exatamente isso que aparecia como "pessoa menor".
  const aspectos = personas.filter(p => p.nh > 0).map(p => p.nw / p.nh)
  const mediana = [...aspectos].sort((a, b) => a - b)[Math.floor(aspectos.length / 2)]
  const desalinhadas = personas.filter(p => p.nh > 0 && Math.abs(p.nw / p.nh - mediana) / mediana > 0.05)
  V('as quatro personas no mesmo formato de quadro (±5%)',
    aspectos.length === N_PERSONAS && desalinhadas.length === 0,
    aspectos.map(r => r.toFixed(3)).join(' | ') +
    (desalinhadas.length ? ` | FORA ${JSON.stringify(desalinhadas.map(p => p.src.split('/').pop()))}` : ''))

  // Cartao solto numa ultima linha pela metade e o defeito que esta grade tem de
  // nao ter. A propriedade travada e "o numero de colunas DIVIDE o numero de
  // cartoes", em cada largura — nao um numero de colunas cravado.
  for (const larg of [1440, 1200, 1024, 900, 768, 390, 320]) {
    await page.setViewportSize({ width: larg, height: 900 })
    await page.waitForTimeout(260)
    const g = await page.evaluate(() => {
      const el = document.querySelector('.paraquem-grid')
      if (!el) return null
      const cols = getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length
      const cards = el.children.length
      const linhas = new Set([...el.children].map(c => Math.round(c.getBoundingClientRect().top)))
      const ultima = Math.max(...[...linhas]).toFixed(0)
      const naUltima = [...el.children].filter(c => Math.round(c.getBoundingClientRect().top) === Number(ultima)).length
      return { cols, cards, linhas: linhas.size, naUltima,
        rolagem: document.documentElement.scrollWidth <= document.documentElement.clientWidth }
    })
    if (!g) { console.error('INSTRUMENTO: .paraquem-grid nao existe'); process.exit(3) }
    V(`grade de "Para quem" sem cartao solto em ${larg}px`,
      g.cards % g.cols === 0 && g.naUltima === g.cols,
      `${g.cards} cartoes em ${g.cols} coluna(s), ${g.linhas} linha(s), ${g.naUltima} na ultima`)
    V(`sem rolagem lateral com 4 personas em ${larg}px`, g.rolagem === true, g.rolagem ? 'ok' : 'HORIZONTAL')
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.waitForTimeout(260)

  // o fundo da foto passou a ser CSS: se voltar a ser cor crua no JSX, morde
  const fundoFoto = await page.evaluate(() => {
    const cx = document.querySelector('#para-quem img[src*="persona-"]').parentElement
    return getComputedStyle(cx).backgroundColor
  })
  V('fundo da foto e var(--navy) = rgb(0, 58, 112)', fundoFoto === 'rgb(0, 58, 112)', fundoFoto)

  // ---- logos das seguradoras ----
  // loading="lazy" so busca quando a grade chega perto da viewport, entao e
  // preciso leva-la ate la e ESPERAR. A espera tem prazo e o erro e engolido de
  // proposito: se as imagens nao chegarem, a assercao abaixo e que reprova —
  // esperar pela propria condicao que se afirma, sem prazo, seria vacuidade.
  const grade = await page.$('.seguradoras-grid')
  if (grade) {
    await grade.scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForFunction(
      () => [...document.querySelectorAll('.seguradoras-grid img')].every(i => i.complete && i.naturalWidth > 0),
      null, { timeout: 15000 }).catch(() => {})
  }
  const seg = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.seguradoras-grid .seg-card')]
    return {
      cartoes: cards.length,
      imgs: cards.filter(c => c.querySelector('img')).map(c => {
        const i = c.querySelector('img')
        return { alt: i.alt, src: i.getAttribute('src'), nw: i.naturalWidth, nh: i.naturalHeight,
                 alt_larg: Math.round(i.getBoundingClientRect().width),
                 alt_alt: Math.round(i.getBoundingClientRect().height) }
      }),
      textos: cards.filter(c => !c.querySelector('img')).map(c => c.textContent.trim()),
    }
  })
  // Contagem CASADA em vez de numero fixo: o que importa e que todo cartao
  // tenha imagem. Numero cravado exigiria mexer no teste a cada parceira nova
  // e, pior, passaria verde se um cartao virasse texto e outro entrasse junto.
  V('ha cartoes de seguradora', seg.cartoes >= 12, `${seg.cartoes} cartoes`)
  V('todo cartao tem <img> (N cartoes == N imagens)', seg.cartoes === seg.imgs.length,
    `${seg.cartoes} cartoes / ${seg.imgs.length} imagens`)
  const semCarregar = seg.imgs.filter(i => !(i.nw > 0))
  V('todos os logos carregaram (naturalWidth > 0)', semCarregar.length === 0,
    semCarregar.length ? JSON.stringify(semCarregar.map(i => i.src)) : seg.imgs.map(i => i.nw).join(','))
  V('todo logo tem alt com o nome da marca', seg.imgs.every(i => i.alt && i.alt.length > 2),
    seg.imgs.map(i => i.alt).join(' · '))
  // SVG onde existe SVG. Duas marcas so publicam PNG transparente, e sao estas
  // duas — se outra virar bitmap, ou se um .jpg entrar, isto morde.
  // A lista e nominal: um .jpg novo, ou um SVG que virou bitmap, morde. A Omint
  // entra aqui porque o site dela nao publica SVG — o que veio foi PNG.
  const PNG_ACEITOS = ['qualicorp.png', 'seguros-unimed.png', 'omint.png']
  const bitmaps = seg.imgs.filter(i => !i.src.endsWith('.svg')).map(i => i.src.split('/').pop())
  V('formato: SVG, salvo os PNG conhecidos',
    bitmaps.every(b => PNG_ACEITOS.includes(b)) && bitmaps.length <= PNG_ACEITOS.length,
    `${seg.imgs.length - bitmaps.length} SVG + PNG: ${bitmaps.join(', ') || 'nenhum'}`)

  // ---- a Azos, no hover, tem de ficar VERDE ----
  // O arquivo dela vinha com fill="currentColor", e currentColor dentro de <img>
  // NAO herda a cor da pagina — renderizava preto. Os cartoes sao cinza por
  // padrao (filter: grayscale) e coloridos no hover, entao a prova e um PAR:
  // cinza antes, verde depois. So a segunda metade deixaria passar um logo que
  // ja fosse verde sem o hover funcionar.
  const corDominante = async (el) => {
    const png = (await el.screenshot()).toString('base64')
    return page.evaluate(async d => {
      const im = await new Promise((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/png;base64,' + d
      })
      const c = document.createElement('canvas')
      c.width = im.width; c.height = im.height
      const g = c.getContext('2d', { willReadFrequently: true })
      g.drawImage(im, 0, 0)
      const px = g.getImageData(0, 0, im.width, im.height).data
      let r = 0, vd = 0, b = 0, n = 0
      for (let i = 0; i < px.length; i += 4) {
        const mx = Math.max(px[i], px[i + 1], px[i + 2]), mn = Math.min(px[i], px[i + 1], px[i + 2])
        if (mx > 240 && mn > 240) continue          // fundo branco do cartao
        r += px[i]; vd += px[i + 1]; b += px[i + 2]; n++
      }
      return n ? { r: Math.round(r / n), g: Math.round(vd / n), b: Math.round(b / n), n } : null
    }, png)
  }
  const cartaoAzos = page.locator('.seguradoras-grid .seg-card').filter({ has: page.locator('img[alt="Azos"]') })
  V('cartao da Azos encontrado', await cartaoAzos.count() === 1, `${await cartaoAzos.count()}`)
  if (await cartaoAzos.count() === 1) {
    const imgAzos = cartaoAzos.locator('img')
    await cartaoAzos.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    await page.waitForTimeout(400)
    const antes = await corDominante(imgAzos)
    await cartaoAzos.hover()
    await page.waitForTimeout(700)
    const depois = await corDominante(imgAzos)
    V('logo da Azos e cinza sem hover', antes && Math.abs(antes.r - antes.g) <= 6 && Math.abs(antes.g - antes.b) <= 6,
      antes ? `rgb(${antes.r},${antes.g},${antes.b}) em ${antes.n}px` : 'sem pixels')
    V('logo da Azos fica VERDE no hover (G dominante)',
      depois && depois.g > depois.r + 20 && depois.g > depois.b + 20,
      depois ? `rgb(${depois.r},${depois.g},${depois.b}) em ${depois.n}px` : 'sem pixels')
    await page.mouse.move(0, 0)
  }
  // altura uniforme: nenhum passa do teto, e nenhum vira fiapo
  const alturas = seg.imgs.map(i => i.alt_alt)
  V('altura dos logos entre 14 e 42 px (teto uniforme)',
    alturas.every(h => h >= 14 && h <= 42), `min=${Math.min(...alturas)} max=${Math.max(...alturas)}`)
  // Nenhum cartao em texto: as doze tem logo. Um card que perca a imagem cai
  // para o ramo de texto e esta assercao morde.
  V('nenhum cartao em texto — todos tem logo', seg.textos.length === 0,
    seg.textos.length ? JSON.stringify(seg.textos) : '0 cartoes em texto')
  V('a Icatu esta entre os logos', seg.imgs.some(i => /icatu/i.test(i.alt)),
    seg.imgs.map(i => i.alt).join(' · '))
  V('NotreDame nao aparece mais na secao',
    !seg.textos.join('|').includes('NotreDame') && !seg.imgs.some(i => /notre/i.test(i.alt)),
    `${seg.cartoes} cartoes`)

  // O fetch tem de sair DE DENTRO da pagina: page.request nao passa por
  // page.route(), entao um impostor que derruba o manifest nao alcancaria a
  // medicao e o verde seria inalcancavel por qualquer falha real.
  const man = await page.evaluate(async url => {
    try {
      const r = await fetch(url)
      let j = null
      try { j = await r.json() } catch { /* corpo nao e JSON */ }
      return { status: r.status, json: j }
    } catch (e) { return { status: 0, json: null, erro: String(e) } }
  }, new URL('manifest.json', BASE).href)
  V('manifest.json responde 200', man.status === 200, `status=${man.status}${man.erro ? ' ' + man.erro : ''}`)
  V('manifest.json tem name e 2 icones', man.json?.name === 'Seu Legado Seguro' && man.json?.icons?.length === 2,
    man.json ? `name=${man.json.name} icons=${man.json.icons?.length}` : 'sem JSON')

  // O arquivo responder 200 nao prova que o navegador sabe dele: o manifest e os
  // icones eram publicados ha tempos e o index.html nunca os anunciava. Aqui se
  // afirma o ANUNCIO, no DOM, e que o href realmente resolve.
  const pwa = await page.evaluate(async () => {
    const ler = sel => document.querySelector(sel)
    const m = ler('link[rel="manifest"]')
    const t = ler('link[rel="apple-touch-icon"]')
    const c = ler('meta[name="theme-color"]')
    const carrega = src => new Promise(res => {
      const i = new Image(); i.onload = () => res(i.naturalWidth); i.onerror = () => res(0); i.src = src
    })
    return {
      manifest: m ? m.href : null,
      appleTouch: t ? t.href : null,
      appleTouchLarg: t ? await carrega(t.href) : 0,
      themeColor: c ? c.getAttribute('content') : null,
    }
  })
  V('<link rel="manifest"> anunciado no DOM', !!pwa.manifest && pwa.manifest.endsWith('/manifest.json'), `${pwa.manifest}`)
  V('<link rel="apple-touch-icon"> anunciado e carrega', pwa.appleTouchLarg > 0,
    `${pwa.appleTouch} -> ${pwa.appleTouchLarg}px`)
  V('<meta name="theme-color"> com o navy da marca', pwa.themeColor === '#003A70', `${pwa.themeColor}`)

  // ---- 6b. o "dentre outras..." e a variavel que nao existia ----
  // --gray-500 era usado em Produtos.jsx e nunca definido no :root: a declaracao
  // caia como invalida e a cor vinha por heranca, sem erro nenhum. Duas
  // assercoes, porque uma so nao pega: a existencia da variavel pega o
  // "undefined", e o contraste pega uma escolha ruim de cor.
  const cinza = await page.evaluate(() => {
    const resolver = el => {           // primeiro ancestral com fundo opaco
      for (let n = el; n; n = n.parentElement) {
        const c = getComputedStyle(n).backgroundColor
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c
      }
      return 'rgb(255, 255, 255)'
    }
    // ATENCAO: getComputedStyle devolve "rgba(255,255,255,0.6)" para o card navy.
    // Ler so os tres primeiros numeros compara BRANCO PURO contra o fundo e
    // devolve 11,42:1 onde o valor real e 5,10:1 — o verificador mentia a favor.
    // O alfa tem de ser composto sobre o fundo antes de medir.
    const canal = s => { const m = s.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 } }
    const compor = (frente, fundo) => {
      const f = canal(frente), b = canal(fundo)
      return { r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 }
    }
    const lin = v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
    const razao = (frente, fundo) => {
      const x = lum(compor(frente, fundo)), y = lum(canal(fundo))
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
    }
    return {
      definida: getComputedStyle(document.documentElement).getPropertyValue('--gray-500').trim(),
      itens: [...document.querySelectorAll('#produtos p')]
        .filter(p => p.textContent.trim() === 'dentre outras...')
        .map(p => {
          const cor = getComputedStyle(p).color, fundo = resolver(p)
          return { cor, fundo, contraste: +razao(cor, fundo).toFixed(2) }
        }),
    }
  })
  V('--gray-500 esta definido no :root', cinza.definida.length > 0, `"${cinza.definida}"`)
  const sobreBranco = cinza.itens.filter(i => i.fundo === 'rgb(255, 255, 255)')
  V('os "dentre outras..." de fundo branco usam --gray-500', sobreBranco.length === 3,
    `${sobreBranco.length} de ${cinza.itens.length}`)
  V('contraste do "dentre outras..." em fundo branco >= 4.5:1',
    sobreBranco.length > 0 && sobreBranco.every(i => i.contraste >= 4.5),
    sobreBranco.map(i => `${i.cor} sobre ${i.fundo} = ${i.contraste}:1`)[0] || 'nenhum')
  // e o card navy tambem: la a cor nao vem de --gray-500, vem de um branco com
  // alfa, e a composicao dava 4.00:1. Os DOIS ramos agora tem de passar em AA.
  const sobreNavy = cinza.itens.filter(i => i.fundo !== 'rgb(255, 255, 255)')
  V('contraste do "dentre outras..." no card navy >= 4.5:1',
    sobreNavy.length === 1 && sobreNavy.every(i => i.contraste >= 4.5),
    sobreNavy.map(i => `${i.cor} sobre ${i.fundo} = ${i.contraste}:1`)[0] || 'nenhum')

  // ---- 7. contatos ----
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp"]')].map(a => a.href))
  V('links de WhatsApp presentes', hrefs.length >= 10, `${hrefs.length} links`)
  const err = hrefs.filter(h => !h.includes(WA))
  V(`todo href de WhatsApp contem ${WA}`, err.length === 0, err.length ? JSON.stringify(err.slice(0, 2)) : `${hrefs.length}/${hrefs.length}`)
  V('nenhum href de WhatsApp com 9999', !hrefs.some(h => /9999/.test(h)), `${hrefs.length} conferidos`)

  const tels = await page.evaluate(() => [...document.querySelectorAll('a[href^="tel:"]')].map(a => a.getAttribute('href')))
  V(`link tel: ${TEL} no rodape`, tels.length >= 1 && tels.every(t => t === `tel:${TEL}`), JSON.stringify(tels))

  const corpo = await page.evaluate(() => document.body.innerText)
  V('telefone exibido "(71) 98101-8556"', corpo.includes('(71) 98101-8556'))
  V('SUSEP "242156562" exibido', corpo.includes('242156562'))
  V('nenhum "9999" no texto visivel', !/9999/.test(corpo), /9999/.test(corpo) ? JSON.stringify((corpo.match(/.{0,20}9999.{0,12}/) || [''])[0]) : '')
  V('nenhum "XXXX" no texto visivel', !/XXXX/.test(corpo))

  // ---- 8. o formulario, por gesto real ----
  // ⚠️ AQUI HAVIA DOIS, E O SEGUNDO SAIU COM A SECAO DE CONTATO. Saíram com ele
  // cinco assercoes: "botao do formulario de contato presente", "chamou
  // window.open", "URL usa wa.me", "URL preserva ?text=" e a confirmacao
  // "Mensagem enviada!". Todas afirmavam sobre um formulario que nao existe
  // mais; mante-las seria pedir que o site tivesse o que foi removido.
  //
  // E o bloco delas era `if (await form2.count() === 1) { ... }`: com o segundo
  // formulario sumindo por DEFEITO, quatro das cinco desapareceriam caladas e
  // so uma ficaria vermelha. Guarda dentro de `if` sobre a propria existencia
  // do alvo e vacuidade com outra roupa. As que ficam nao tem esse `if`.
  const form1 = page.getByRole('button', { name: 'Enviar pelo WhatsApp' })   // hero
  V('botao do formulario do hero presente', await form1.count() === 1, `${await form1.count()}`)

  const semContato = await page.evaluate(() => ({
    secao: !!document.getElementById('contato'),
    hrefs: [...document.querySelectorAll('a[href="#contato"]')].map(a => a.getAttribute('href')),
    forms: document.querySelectorAll('form').length,
    cotacao: !!document.getElementById('cotacao'),
    cotacaoNoHero: !!document.querySelector('#inicio #cotacao')
  }))
  V('nenhuma secao #contato no DOM', semContato.secao === false, `${semContato.secao}`)
  V('nenhum href="#contato" na pagina', semContato.hrefs.length === 0, JSON.stringify(semContato.hrefs))
  V('um unico formulario na pagina', semContato.forms === 1, `${semContato.forms} formulario(s)`)
  V('#cotacao e o formulario do hero', semContato.cotacao && semContato.cotacaoNoHero,
    `existe=${semContato.cotacao} dentro do hero=${semContato.cotacaoNoHero}`)

  if (await form1.count() === 1) {
    await page.fill('#inicio input[type="text"]', 'Teste Hero')
    await page.fill('#inicio input[type="tel"]', '(71) 98888-7777')
    await form1.click({ timeout: 8000 })
    await page.waitForTimeout(400)
    const ab = await page.evaluate(() => window.__abertos.slice())
    V('formulario do hero chamou window.open', ab.length === 1, `${ab.length} chamada(s)`)
    if (ab.length) {
      V(`URL do formulario do hero usa wa.me/${WA}`, ab[0].includes(`wa.me/${WA}`), ab[0].slice(0, 70) + '...')
      V('URL do formulario do hero preserva ?text= com o nome digitado', ab[0].includes('?text=') && /Teste%20Hero/.test(ab[0]))
    }
  }

  if (SHOTS) {
    await irPara(page, BASE)
    await page.evaluate(() => document.fonts.ready.then(() => 0))
    await varrerPagina(page)
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none !important;animation:none !important}' })
    for (const [nome, sel] of [['hero', '#inicio'], ['missao', '.faixa-parallax'], ['citacao', '#sobre'], ['rodape', 'body > div > footer']]) {
      const el = await page.$(sel); if (!el) continue
      await el.scrollIntoViewIfNeeded().catch(() => {})
      await page.waitForTimeout(250)
      await el.screenshot({ path: `${SHOTS}/1440-${nome}.png` })
    }
  }
  await ctx.close()
}

// ---------------- MOBILE ----------------
{
  const { ctx, page } = await abrir(390, 844)
  await irPara(page, BASE)
  await page.evaluate(() => document.fonts.ready.then(() => 0))
  await varrerPagina(page)

  // O que estava publicado transbordava 36px em qualquer largura estreita
  // (scrollWidth 426 em 320, 360 e 390). Agora a assercao e IGUALDADE, sem folga
  // herdada, e em TRES larguras: 390 era o requisito, mas o hero so aparecia em
  // 320 — largura unica teria deixado o defeito passar.
  const medirTransbordo = async () => page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const culpados = []
    for (const el of document.querySelectorAll('*')) {
      const b = el.getBoundingClientRect()
      if (b.width === 0) continue
      if (b.left + b.width + window.scrollX > vw + 1) {
        culpados.push(el.closest('.seguradoras-grid') ? 'seguradoras'
          : el.closest('.hero-grid') ? `hero:${el.tagName.toLowerCase()}`
          : `${el.tagName.toLowerCase()}:${(el.textContent || '').trim().slice(0, 20)}`)
      }
    }
    return { doc: document.documentElement.scrollWidth, vis: vw, culpados }
  })
  for (const larg of [320, 360, 390]) {
    await page.setViewportSize({ width: larg, height: 844 })
    await page.waitForTimeout(350)
    const o = await medirTransbordo()
    V(`sem rolagem horizontal em ${larg}px`, o.doc === o.vis, `scrollWidth=${o.doc} clientWidth=${o.vis}`)
    V(`nenhum elemento ultrapassa a borda em ${larg}px`, o.culpados.length === 0,
      o.culpados.length ? JSON.stringify([...new Set(o.culpados)].slice(0, 4)) : '0 elementos')
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(350)

  const h1 = await page.evaluate(() => {
    const el = document.querySelector('#inicio h1'); const r = el.getBoundingClientRect()
    const pai = el.parentElement.getBoundingClientRect(); const cs = getComputedStyle(el)
    return { larg: Math.round(r.width), pai: Math.round(pai.width), tam: cs.fontSize, peso: cs.fontWeight, linhas: Math.round(r.height / parseFloat(cs.lineHeight)) }
  })
  V('h1 do hero cabe na coluna em 390px', h1.larg <= h1.pai + 1,
    `h1=${h1.larg}px coluna=${h1.pai}px fontSize=${h1.tam} peso=${h1.peso} ~${h1.linhas} linhas`)

  const missao = await page.evaluate(() => {
    const el = document.querySelector('.faixa-parallax p'); const r = el.getBoundingClientRect()
    const pai = el.parentElement.getBoundingClientRect()
    return { larg: Math.round(r.width), pai: Math.round(pai.width), tam: getComputedStyle(el).fontSize }
  })
  V('bloco da missao cabe na caixa em 390px', missao.larg <= missao.pai + 1,
    `${missao.larg}px em ${missao.pai}px, fontSize=${missao.tam}`)

  // O celular tem background-attachment: scroll, entao o recorte da foto e OUTRO
  // — 1440 verde nao diz nada sobre 390.
  const ct390 = await contrasteDaFaixa(page)
  if (!ct390 || !ct390.nGlifo) {
    console.error('INSTRUMENTO: mascara do texto da faixa saiu VAZIA em 390px')
    process.exit(3)
  }
  V('contraste AA do texto da faixa em 390px', ct390.razao >= 4.5,
    `${ct390.razao.toFixed(2)}:1 sobre rgb(${ct390.cor.join(',')}), ${ct390.nGlifo}px de glifo`)

  const pil390 = await medirPilares(page)
  if (!pil390 || pil390.natural === undefined) { console.error('INSTRUMENTO: pilares nao mediveis em 390px'); process.exit(3) }
  V('rotulos dos pilares nao cortam nem sobrepoem a figura em 390px',
    pil390.cortados.length === 0 && pil390.sobrepostos.length === 0 && pil390.fora.length === 0,
    `cortados=${JSON.stringify(pil390.cortados)} sobrepostos=${JSON.stringify(pil390.sobrepostos)} fora=${JSON.stringify(pil390.fora)}`)
  V('cada rotulo do lado da sua peca em 390px',
    pil390.esqAEsquerda && pil390.dirADireita && pil390.baseAbaixo && pil390.baseCentrada,
    `esq=${pil390.esqAEsquerda} dir=${pil390.dirADireita} base=${pil390.baseAbaixo} centrada=${pil390.baseCentrada}`)

  const logoM = await medirLogoCabecalho(page)
  if (!logoM) { console.error('INSTRUMENTO: nao achei o logo do cabecalho em 390px'); process.exit(3) }
  V('logo do cabecalho sem deformar em 390px', Math.abs(logoM.prop - logoM.nat) / logoM.nat < 0.01,
    `renderizado ${logoM.prop.toFixed(3)} vs natural ${logoM.nat.toFixed(3)}`)
  V('logo do cabecalho cabe na barra em 390px', logoM.transborda === 0, `transborda ${logoM.transborda}px`)
  V('logo do cabecalho nao encosta no menu em 390px', logoM.folga === null || logoM.folga > 16,
    `${logoM.larg}x${logoM.alt}, folga ${logoM.folga}px`)

  // No celular o retrato vai para CIMA do texto e centraliza. Afirmar so o
  // desktop deixaria o empilhamento quebrar sem ninguem ver.
  const faixaCit390 = await page.$('.faixa-citacao')
  if (faixaCit390) {
    await faixaCit390.scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForFunction(
      () => { const i = document.querySelector('.citacao-foto'); return i && i.complete && i.naturalWidth > 0 },
      null, { timeout: 10000 }).catch(() => {})
  }
  const cit390 = await page.evaluate(() => {
    const f = document.querySelector('.faixa-citacao')
    if (!f) return null
    const img = f.querySelector('.citacao-foto'), q = f.querySelector('.citacao-texto')
    const ri = img.getBoundingClientRect(), rq = q.getBoundingClientRect()
    return { acima: Math.round(ri.bottom) <= Math.round(rq.top) + 2,
      lado: Math.round(ri.width),
      centrada: Math.abs((ri.left + ri.right) / 2 - (rq.left + rq.right) / 2) <= 4,
      nat: img.naturalWidth }
  })
  if (!cit390) { console.error('INSTRUMENTO: .faixa-citacao sumiu em 390px'); process.exit(3) }
  V('retrato acima do texto e centrado em 390px', cit390.acima && cit390.centrada && cit390.nat > 0,
    `acima=${cit390.acima} centrada=${cit390.centrada} ${cit390.lado}px nat=${cit390.nat}`)

  // ---- escala do celular ----
  const esc = await page.evaluate(() => {
    const px = v => Math.round(parseFloat(v) * 10) / 10
    const campos = [...document.querySelectorAll('input, select, textarea')]
      .map(e => ({ o: (e.placeholder || e.tagName).slice(0, 14), fs: px(getComputedStyle(e).fontSize) }))
    // Area de TOQUE, nao caixa do elemento. As bolinhas do carrossel medem 8x8
    // e crescem so a area, por ::after — um retangulo de 8px que responde a um
    // toque de 44px esta certo, e medir getBoundingClientRect diria que nao.
    const cai = e => {
      const r = e.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      if (cy < 0 || cy > innerHeight) return null   // fora da viewport: nao da para sondar
      const dentro = (x, y) => { const a = document.elementFromPoint(x, y); return !!a && (a === e || e.contains(a) || a.contains(e)) }
      // CRUZ, nao quadrado. O botao flutuante do WhatsApp e um CIRCULO de 56px:
      // os cantos de um quadrado de 44 caem a 29,7px do centro, fora do raio de
      // 28 — a sonda de cantos reprovava um alvo que o dedo acerta inteiro.
      // Dois pontos a 22px do centro, nos dois eixos, provam extensao >= 44px.
      const ok = dentro(cx, cy) && dentro(cx - 22, cy) && dentro(cx + 22, cy) &&
                 dentro(cx, cy - 22) && dentro(cx, cy + 22)
      return { ok, w: Math.round(r.width), h: Math.round(r.height),
        txt: (e.textContent || e.placeholder || e.getAttribute('aria-label') || '').trim().slice(0, 20),
        tag: e.tagName.toLowerCase() }
    }
    // O CSS tem scroll-behavior: smooth. Com ele, scrollIntoView anima e o
    // getBoundingClientRect logo depois le a posicao ANTIGA — a sonda caia fora
    // da viewport e 37 dos 40 alvos eram silenciosamente pulados. "3 alvos
    // conferidos" tem a mesma cara de "tudo certo".
    const rolagemAntes = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'auto'
    const alvos = []
    let candidatos = 0
    for (const e of document.querySelectorAll('a, button, input, select, textarea')) {
      const r = e.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      candidatos++
      e.scrollIntoView({ block: 'center' })
      const m = cai(e)
      if (m) alvos.push(m)
    }
    window.scrollTo(0, 0)
    document.documentElement.style.scrollBehavior = rolagemAntes
    const cs = getComputedStyle(document.body)
    return {
      body: px(cs.fontSize), zoom: cs.zoom, transform: cs.transform,
      viewport: document.querySelector('meta[name=viewport]')?.content || '',
      h1: px(getComputedStyle(document.querySelector('#inicio h1')).fontSize),
      h2: px(getComputedStyle(document.querySelector('#para-quem .section-title')).fontSize),
      h3: px(getComputedStyle(document.querySelector('.paraquem-card h3')).fontSize),
      // texto DENTRO de cartao, que tem piso proprio, mais baixo que o do corpo
      textoCard: [...document.querySelectorAll('.paraquem-card p, .dif-card p, #produtos p, #produtos li')]
        .map(e => px(getComputedStyle(e).fontSize)),
      eyebrows: [...document.querySelectorAll('.section-eyebrow')].map(e => px(getComputedStyle(e).fontSize)),
      campos, alvos, candidatos, pequenos: alvos.filter(a => !a.ok),
    }
  })
  // OS PISOS, NAO OS VALORES DA RODADA. A versao anterior desta linha exigia
  // "entre 15 e 16px" — o tamanho que o corpo tinha naquele dia. Na reducao
  // seguinte ela reprovou o conserto em vez do defeito, que e o caso 103: valor
  // medido virado em regra vira argumento CONTRA a proxima mudanca. O que nao
  // pode mudar e o piso; o tamanho acima dele e decisao de design.
  V('corpo >= 13px no celular', esc.body >= 13, `${esc.body}px (piso 13)`)
  V('texto de cartao >= 12px no celular',
    esc.textoCard.length > 0 && esc.textoCard.every(f => f >= 12),
    `${esc.textoCard.length} textos, menor ${Math.min(...esc.textoCard)}px (piso 12)`)
  V('eyebrow >= 9px no celular',
    esc.eyebrows.length > 0 && esc.eyebrows.every(f => f >= 9),
    `${esc.eyebrows.length} eyebrows, menor ${Math.min(...esc.eyebrows)}px (piso 9)`)
  // Encolher tudo por uma razao so nao garante hierarquia: basta um piso morder
  // num degrau e nao no de baixo para h3 passar por baixo do corpo.
  V('hierarquia h1 > h2 > h3 > corpo no celular',
    esc.h1 > esc.h2 && esc.h2 > esc.h3 && esc.h3 > esc.body,
    `h1=${esc.h1} h2=${esc.h2} h3=${esc.h3} corpo=${esc.body}`)
  V('h1 do hero <= 34px no celular', esc.h1 <= 34, `${esc.h1}px`)
  // 16px e o limiar do zoom automatico do iOS: abaixo disso o Safari aproxima a
  // pagina sozinho ao tocar no campo, e nao volta.
  V('todo campo de formulario >= 16px no celular', esc.campos.length > 0 && esc.campos.every(c => c.fs >= 16),
    esc.campos.map(c => `${c.o}=${c.fs}`).join(' '))
  // ⚠️ O PISO E RELATIVO, E ISSO E O CONSERTO DE UM PISO ABSOLUTO QUE ENVELHECEU.
  // Ele nasceu como "pelo menos 30 alvos", porque "0 alvos pequenos" sobre 3
  // conferidos e o mesmo texto verde de "0 sobre 40" — foi o que apareceu aqui
  // quando a sonda estava quebrada. Mas o 30 era a contagem daquele dia: ao
  // remover a secao de contato a pagina passou a ter 29 alvos e o piso reprovou
  // o conserto, nao um defeito. Numero do dia virado em regra, caso 103 de novo.
  // Agora o piso e a propria pagina: a sonda tem de alcancar quase tudo que
  // existe. Some um alvo do site, o piso acompanha; quebre a sonda, ela acusa.
  if (esc.candidatos < 12) {
    console.error(`INSTRUMENTO: so ${esc.candidatos} alvos existem no DOM; a pagina tem dezenas`)
    process.exit(3)
  }
  if (esc.alvos.length < esc.candidatos * 0.9) {
    console.error(`INSTRUMENTO: a sonda alcancou ${esc.alvos.length} de ${esc.candidatos} alvos do DOM`)
    process.exit(3)
  }
  V('todo alvo responde a um toque de 44x44', esc.pequenos.length === 0,
    `${esc.alvos.length} de ${esc.candidatos} alvos sondados` + (esc.pequenos.length ? ` | PEQUENOS: ${JSON.stringify(esc.pequenos.slice(0, 5))}` : ''))
  // A reducao e de TAMANHO, nao de escala: zoom e transform ampliam o pixel, o
  // texto fica borrado e quem quiser aproximar com os dedos nao consegue.
  V('sem zoom nem transform no corpo', (esc.zoom === '1' || esc.zoom === 'normal') && esc.transform === 'none',
    `zoom=${esc.zoom} transform=${esc.transform}`)
  V('meta viewport sem trava de escala',
    /width=device-width/.test(esc.viewport) && !/maximum-scale|user-scalable\s*=\s*no/.test(esc.viewport),
    esc.viewport)

  // Em 390px a grade do hero vira UMA coluna e o texto ocupa a largura inteira.
  // Com o veu horizontal de antes, o fim de cada linha caia sobre a parte clara
  // da foto: media em producao 2,04:1 e 2,02:1 em dois dos tres slides. Por isso
  // os TRES sao medidos aqui, e nao so um.
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  const heroMob = await contrasteDoHero(page)
  if (!heroMob || heroMob.some(h => !h.nG)) { console.error('INSTRUMENTO: mascara do texto do hero vazia em 390px'); process.exit(3) }
  if (heroMob.some(h => h.fracao > 0.25)) {
    console.error(`INSTRUMENTO: mascara do hero grande demais em 390px (${heroMob.map(h => (100*h.fracao).toFixed(0) + '%').join(', ')})`)
    process.exit(3)
  }
  heroMob.forEach((h, i) => V(`contraste AA do texto do hero, slide ${i + 1}, em 390px`, h.razao >= 4.5,
    `${h.razao.toFixed(2)}:1 sobre rgb(${h.cor.join(',')}), ${h.nG}px de glifo`))

  // ---- folga dos rotulos, nas cinco larguras ----
  // 12px e o piso: o deploy do triangulo caiu porque "CONFIANCA" renderizou 94px
  // no runner e 92 aqui. Encostar na borda e o mesmo defeito esperando a proxima
  // maquina.
  const FOLGA_MIN = 12
  for (const larg of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width: larg, height: 900 })
    await page.waitForTimeout(320)
    const m = await medirPilares(page)
    if (!m || m.folga === undefined) { console.error(`INSTRUMENTO: pilares nao mediveis em ${larg}px`); process.exit(3) }
    V(`rotulos com folga >= ${FOLGA_MIN}px da borda em ${larg}px`, m.folga >= FOLGA_MIN,
      `menor folga ${m.folga}px` + (m.cortados.length ? ` | CORTADOS ${JSON.stringify(m.cortados)}` : '') +
      (m.fora.length ? ` | FORA ${JSON.stringify(m.fora)}` : ''))
    V(`nenhum rotulo cortado em ${larg}px`, m.cortados.length === 0 && m.fora.length === 0,
      `cortados=${JSON.stringify(m.cortados)} fora=${JSON.stringify(m.fora)}`)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(320)

  if (SHOTS) {
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none !important;animation:none !important}' })
    for (const [nome, sel] of [['hero', '#inicio'], ['missao', '.faixa-parallax'], ['citacao', '#sobre'], ['rodape', 'body > div > footer']]) {
      const el = await page.$(sel); if (!el) continue
      await el.scrollIntoViewIfNeeded().catch(() => {})
      await page.waitForTimeout(250)
      await el.screenshot({ path: `${SHOTS}/390-${nome}.png` })
    }
  }
  await ctx.close()
}

// ---------------- A PREVIA DO LINK: TITULO E DESCRICAO ----------------
// O WhatsApp, o Google e o LinkedIn montam a previa com o <title> e a meta
// description. Nenhum dos dois tinha assercao nenhuma ate aqui: o texto que
// mais gente le antes de abrir o site era o unico sem guarda.
//
// E SAO DUAS PROPRIEDADES OPOSTAS, de proposito. O titulo saiu de "em Salvador"
// porque o atendimento e nacional; a cidade FICA na description e no JSON-LD,
// que e o que sustenta a busca local. Afirmar so "sem Salvador" deixaria alguem
// tirar a cidade de todo lugar e passar verde — e isso custaria a busca local
// sem nenhuma linha vermelha.
{
  const { ctx, page } = await abrir(1440, 900)
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 })
  const meta = await page.evaluate(() => {
    const m = s => document.querySelector(s)?.getAttribute('content') || ''
    let ld = null
    try { ld = JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent || 'null') } catch { ld = null }
    return {
      titulo: document.title,
      descricao: m('meta[name="description"]'),
      ldNome: ld?.name || null,
      ldCidade: ld?.address?.addressLocality || null,
      ldUrl: ld?.url || null
    }
  })
  const TITULO = 'Seu Legado Seguro | Corretora de Seguros'
  V('titulo da pagina exato', meta.titulo === TITULO, JSON.stringify(meta.titulo))
  V('titulo sem a cidade', !/salvador/i.test(meta.titulo), JSON.stringify(meta.titulo))
  V('description ainda cita a cidade', /salvador/i.test(meta.descricao),
    meta.descricao.slice(0, 72) + '...')
  V('JSON-LD ainda cita a cidade', meta.ldCidade === 'Salvador', `addressLocality=${meta.ldCidade}`)
  V('JSON-LD com nome e url coerentes', meta.ldNome === 'Seu Legado Seguro' && meta.ldUrl === 'https://seulegadoseguro.com.br',
    `name=${meta.ldNome} url=${meta.ldUrl}`)
  await ctx.close()
}

// ---------------- TODO CAMINHO PARA O FORMULARIO CHEGA NELE ----------------
// A secao de contato saiu e tres caminhos que levavam a ela passaram a apontar
// para o formulario do topo. "O href mudou" nao e a propriedade que interessa:
// o que interessa e que quem CLICA chega num formulario utilizavel.
//
// Por isso a assercao CLICA, e afirma tres coisas de uma vez — o cartao fica
// abaixo do header sticky (nao atras dele), esta dentro da janela, e o primeiro
// campo esta focado. Conferir so o scrollY diria "rolou" com o cartao escondido
// atras do header, que e exatamente o defeito que o scroll-margin-top evita.
{
  for (const W of [1440, 390]) {
    const { ctx, page } = await abrir(W, W < 500 ? 844 : 900)
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 })
    await page.evaluate(() => document.fonts.ready)
    await varrerPagina(page)

    // no celular o menu do topo fica atras do botao hamburguer; a lista de
    // caminhos e a que EXISTE naquela largura, e ela nunca pode estar vazia
    const caminhos = W >= 900
      ? [['menu do topo', 'header a[href="#cotacao"]'], ['botao da CTA', 'a.btn-outline-white[href="#cotacao"]'], ['rodape', 'footer a[href="#cotacao"]']]
      : [['botao da CTA', 'a.btn-outline-white[href="#cotacao"]'], ['rodape', 'footer a[href="#cotacao"]']]

    for (const [nome, sel] of caminhos) {
      const alvo = page.locator(sel).first()
      if (await alvo.count() === 0) {
        console.error(`INSTRUMENTO: nenhum link "${nome}" (${sel}) em ${W}px`)
        process.exit(3)
      }
      // sai de perto do formulario para o clique ter o que provar
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto'
        window.scrollTo(0, document.documentElement.scrollHeight)
      })
      await page.waitForTimeout(200)
      await alvo.click({ timeout: 8000 })
      await page.waitForTimeout(1200)
      const r = await page.evaluate(() => {
        const card = document.getElementById('cotacao')
        if (!card) return null
        const c = card.getBoundingClientRect()
        const h = document.querySelector('header').getBoundingClientRect()
        return {
          topo: Math.round(c.top), fundoDoHeader: Math.round(h.bottom),
          abaixoDoHeader: c.top >= h.bottom - 1,
          visivel: c.top < window.innerHeight && c.bottom > 0,
          focoDentro: card.contains(document.activeElement),
          foco: document.activeElement ? document.activeElement.tagName.toLowerCase() : 'nenhum'
        }
      })
      if (!r) { console.error(`INSTRUMENTO: #cotacao sumiu em ${W}px`); process.exit(3) }
      V(`"${nome}" leva ao formulario, abaixo do header, em ${W}px`,
        r.abaixoDoHeader && r.visivel,
        `topo do cartao ${r.topo}px, header termina em ${r.fundoDoHeader}px`)
      V(`"${nome}" foca o primeiro campo em ${W}px`, r.focoDentro,
        `foco em <${r.foco}>, dentro do formulario=${r.focoDentro}`)
    }
    await ctx.close()
  }
}

// ---------------- A VIZINHANCA DA FAIXA DA CITACAO ----------------
// Dois defeitos que sairam da MESMA causa — a faixa morava dentro de
// <section id="sobre">: o ultimo card encostava nela (0px em todas as larguras)
// e o padding-bottom da secao sobrava DEPOIS dela, branco, entre dois blocos
// navy. Nenhuma assercao olhava para a vizinhanca de um bloco de largura
// inteira, e por isso os dois foram ao ar.
//
// A SEGUNDA ASSERCAO LE PIXEL, nao geometria, e e escolha. Gap zero por
// geometria nao garante que nada branco seja PINTADO ali: uma margem que
// colapsa, uma borda, um ::after deixam o numero em 0 e a tira branca na tela.
// Quem viu o defeito foi o olho do Gabriel num print; o instrumento que o
// reproduz tem de olhar a mesma coisa que ele olhou.
{
  const PISO = 24
  for (const W of [390, 768, 1280, 1440]) {
    const { ctx, page } = await abrir(W, W < 500 ? 844 : 1024)
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 })
    await page.evaluate(() => document.fonts.ready)
    await varrerPagina(page)

    const m = await page.evaluate(() => {
      const faixa = document.querySelector('.faixa-citacao')
      if (!faixa) return null
      const cards = [...document.querySelectorAll('.dif-card')]
      if (!cards.length) return null
      const topo = e => e.getBoundingClientRect().top + window.scrollY
      const base = e => e.getBoundingClientRect().bottom + window.scrollY
      const ultimo = cards[cards.length - 1]
      const seguinte = faixa.nextElementSibling
      return {
        vao: Math.round(topo(faixa) - base(ultimo)),
        fimDaFaixa: Math.round(base(faixa)),
        vaoSeguinte: seguinte ? Math.round(topo(seguinte) - base(faixa)) : null,
        bgSeguinte: seguinte ? getComputedStyle(seguinte).backgroundColor : null
      }
    })
    if (!m) {
      console.error(`INSTRUMENTO: nao achei .faixa-citacao ou .dif-card em ${W}px`)
      process.exit(3)
    }

    V(`espaco entre o ultimo card e a faixa da citacao em ${W}px`, m.vao >= PISO,
      `${m.vao}px (piso ${PISO}px)`)

    // Tira de 12px a cavalo da borda de baixo da faixa, lida na tela. Rolar
    // primeiro porque o clip do screenshot e em coordenada de VIEWPORT.
    //
    // ⚠️ E DESLIGAR A ANIMACAO ANTES DE ROLAR. O html desta pagina tem
    // scroll-behavior: smooth, entao o scrollTo ANIMA: 250 ms depois o scrollY
    // ainda estava em 1920 de 8286 e o clip caia 6788px fora da viewport. E a
    // mesma armadilha que ja tinha cegado a sonda de toque, na mesma pagina.
    const dentro = await page.evaluate(y => {
      const antes = document.documentElement.style.scrollBehavior
      document.documentElement.style.scrollBehavior = 'auto'
      window.scrollTo(0, Math.max(0, y - Math.round(window.innerHeight / 2)))
      document.documentElement.style.scrollBehavior = antes
      return y - window.scrollY
    }, m.fimDaFaixa - 6)
    await page.waitForTimeout(150)
    // Aterrissou? Se nao, o clip sairia da imagem e o erro seria do PLAYWRIGHT,
    // nao uma reprovacao — instrumento quebrado tem de dizer que e instrumento.
    if (dentro < 0 || dentro + 12 > (W < 500 ? 844 : 1024)) {
      console.error(`INSTRUMENTO: a borda da faixa caiu em y=${dentro} da viewport em ${W}px; a rolagem nao chegou la`)
      process.exit(3)
    }
    const tira = await page.screenshot({ clip: { x: 0, y: dentro, width: W, height: 12 } })
    const claros = await page.evaluate(async ([b64, larg]) => {
      const img = new Image()
      await new Promise((ok, err) => { img.onload = ok; img.onerror = err; img.src = 'data:image/png;base64,' + b64 })
      const cv = document.createElement('canvas')
      cv.width = img.width; cv.height = img.height
      const ctx2 = cv.getContext('2d', { willReadFrequently: true })
      ctx2.drawImage(img, 0, 0)
      const { data, width, height } = ctx2.getImageData(0, 0, cv.width, cv.height)
      let n = 0, total = 0
      for (let i = 0; i < data.length; i += 4) {
        total++
        if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) n++
      }
      // Linha divisoria: uma FILEIRA inteira distinguivel do navy do fundo, sem
      // ser clara. Contar pixels soltos nao serve — texto, foto e borda tambem
      // sao "diferentes do navy". O que caracteriza a divisoria e atravessar a
      // largura toda.
      const NAVY = [0, 58, 112]
      const fileiras = []
      for (let y = 0; y < height; y++) {
        let dif = 0
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4
          const d = Math.max(Math.abs(data[i] - NAVY[0]), Math.abs(data[i + 1] - NAVY[1]), Math.abs(data[i + 2] - NAVY[2]))
          if (d > 20 && !(data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230)) dif++
        }
        if (dif >= width * 0.95) fileiras.push(y)
      }
      return { n, total, larg, width, height, fileiras }
    }, [tira.toString('base64'), W])
    if (claros.total === 0) {
      console.error(`INSTRUMENTO: a tira lida em ${W}px veio vazia`)
      process.exit(3)
    }
    V(`sem faixa branca entre a citacao e a secao seguinte em ${W}px`, claros.n === 0,
      `${claros.n} de ${claros.total} pixels claros na tira de ${claros.width}x${claros.height} | ` +
      `vao=${m.vaoSeguinte}px vizinho=${m.bgSeguinte}`)
    // O CONSERTO ANTERIOR CRIOU ESTE PROBLEMA. Tirar a tira branca fez a faixa
    // encostar na CTA, e as duas sao o mesmo navy: virou um bloco so, sem
    // comeco nem fim. Quem viu foi o Gabriel, na tela, antes de qualquer
    // assercao minha — "sem faixa branca" estava verde o tempo todo.
    //
    // A divisoria e lida em PIXEL, numa tira alta o bastante para conter os
    // dois respiros. Duas propriedades, e sao independentes: ela EXISTE (linha
    // dourada, centrada, 25-35% do container) e ela esta no MEIO (a tinta de
    // cima e a de baixo a menos de 4px de diferenca). Uma linha dourada torta
    // passaria na primeira e reprovaria na segunda.
    const linhaY = await page.evaluate(() => {
      const e = document.querySelector('.divisor-citacao span')
      return e ? Math.round(e.getBoundingClientRect().top + window.scrollY) : null
    })
    if (linhaY == null) { console.error(`INSTRUMENTO: .divisor-citacao span nao existe em ${W}px`); process.exit(3) }
    const ALTURA = 200
    const dentro2 = await page.evaluate(y => {
      const antes = document.documentElement.style.scrollBehavior
      document.documentElement.style.scrollBehavior = 'auto'
      window.scrollTo(0, Math.max(0, y - Math.round(window.innerHeight / 2)))
      document.documentElement.style.scrollBehavior = antes
      return y - window.scrollY
    }, linhaY - ALTURA / 2)
    await page.waitForTimeout(150)
    if (dentro2 < 0 || dentro2 + ALTURA > (W < 500 ? 844 : 1024)) {
      console.error(`INSTRUMENTO: a divisoria caiu em y=${dentro2} da viewport em ${W}px`)
      process.exit(3)
    }
    const faixaPng = await page.screenshot({ clip: { x: 0, y: dentro2, width: W, height: ALTURA } })
    const div = await page.evaluate(async ([b64]) => {
      const img = new Image()
      await new Promise((ok, err) => { img.onload = ok; img.onerror = err; img.src = 'data:image/png;base64,' + b64 })
      const cv = document.createElement('canvas')
      cv.width = img.width; cv.height = img.height
      const c2 = cv.getContext('2d', { willReadFrequently: true })
      c2.drawImage(img, 0, 0)
      const { data, width, height } = c2.getImageData(0, 0, cv.width, cv.height)
      const NAVY = [0, 58, 112]
      const dif = (x, y) => {
        const i = (y * width + x) * 4
        return Math.max(Math.abs(data[i] - NAVY[0]), Math.abs(data[i + 1] - NAVY[1]), Math.abs(data[i + 2] - NAVY[2]))
      }
      const cor = (x, y) => { const i = (y * width + x) * 4; return [data[i], data[i + 1], data[i + 2]] }
      // ⚠️ A FILEIRA E ACHADA PELA MAIOR CORRIDA CONTIGUA, nao pela contagem de
      // pixels da fileira. A primeira versao contava pixel "dourado" solto e
      // travou na ASSINATURA — "— GABRIEL VITAL" e dourada tambem, e some no
      // meio de uma tira de 200px. Glifo tem corrida de poucos pixels; regua
      // tem centenas. A contagem nao distinguia os dois; a contiguidade sim.
      //
      // E nao ha teste de "e dourado?" aqui, porque o meu estava errado: o
      // #C9A84C a 50% sobre o navy da (100,113,94), com VERDE maior que
      // vermelho. Quem afirma a cor e a assercao, com a cor MEDIDA no meio da
      // linha, e nao um palpite sobre canais.
      let melhor = { y: -1, n: 0, x0: 0, x1: 0 }
      for (let y = 0; y < height; y++) {
        let n = 0, ini = -1
        for (let x = 0; x <= width; x++) {
          if (x < width && dif(x, y) > 20) { if (ini < 0) ini = x; n = x - ini + 1 } else {
            if (ini >= 0 && n > melhor.n) melhor = { y, n, x0: ini, x1: x - 1 }
            ini = -1; n = 0
          }
        }
      }
      // tinta acima e abaixo: primeira fileira com qualquer coisa que nao seja navy
      let acima = -1, abaixo = -1
      for (let y = melhor.y - 2; y >= 0; y--) { if ([...Array(Math.ceil(width / 2))].some((_, k) => dif(k * 2, y) > 24)) { acima = melhor.y - y - 1; break } }
      for (let y = melhor.y + 2; y < height; y++) { if ([...Array(Math.ceil(width / 2))].some((_, k) => dif(k * 2, y) > 24)) { abaixo = y - melhor.y - 1; break } }
      return { ...melhor, width, height, acima, abaixo, centro: Math.round((melhor.x0 + melhor.x1) / 2),
        corLinha: cor(Math.round((melhor.x0 + melhor.x1) / 2), melhor.y) }
    }, [faixaPng.toString('base64')])

    const desvioCentro = Math.abs(div.centro - div.width / 2)
    // 30% do container, nao da tela: em 1440 o container tem 1160 e trava em
    // 360px, que da 25% da tela. A faixa aceita os dois regimes.
    const contLarg = await page.evaluate(() => {
      const c = document.querySelector('.faixa-citacao .container')
      return c ? Math.round(c.getBoundingClientRect().width) : null
    })
    const pctCont = +(div.n / contLarg * 100).toFixed(1)
    const [r0, g0, b0] = div.corLinha
    const douradaMesmo = r0 > 80 && r0 < 120 && g0 > 95 && g0 < 130 && b0 > 75 && b0 < 110
    V(`divisoria dourada centrada em ${W}px`,
      (pctCont >= 25 && pctCont <= 35 || div.n >= 355 && div.n <= 365) && desvioCentro <= 4 && douradaMesmo,
      `${div.n}px de ${contLarg} de container = ${pctCont}% | centro desviado ${desvioCentro}px | cor rgb(${div.corLinha.join(',')})`)
    V(`divisoria simetrica em ${W}px`,
      div.acima > 0 && div.abaixo > 0 && Math.abs(div.acima - div.abaixo) <= 4,
      `tinta acima ${div.acima}px, abaixo ${div.abaixo}px, diferenca ${Math.abs(div.acima - div.abaixo)}px (piso 4)`)

    await ctx.close()
  }
}

// ---------------- DESKTOP INTACTO, PIXEL A PIXEL ----------------
// A rodada da escala mexeu em tokens que o desktop tambem usa. "Nao mexi no
// desktop" nao e afirmacao que se faca por leitura de diff: os quatro primeiros
// vazamentos desta rodada passaram no meu olho e morreram AQUI — um token de
// 19px mapeado para o de 18, um padding de 32 virando 28, um seletor de icone
// largo demais que pegava um <svg> de 18px, e o cartao do hero.
//
// A referencia e o BUILD ANTERIOR, servido em ANTERIOR, capturado AGORA, neste
// mesmo navegador. Nao e arquivo no repositorio, e a diferenca importa: a
// primeira versao gravava os hashes em scripts/referencia/ e o CI reprovou com
// 693 de 2576 blocos "mudados" numa mudanca que nao tocou o desktop. Hash de
// pixel nao atravessa maquina — ver o cabecalho de referencia-desktop.mjs.
//
// So roda em 'real' e nos dois impostores de desktop. Nos outros o lado ATUAL
// sairia mutado e o ANTERIOR nao, e a guarda acusaria a mutacao do impostor
// como se fosse vazamento de desktop: vermelho verdadeiro pelo motivo errado.
//
// QUANDO O DESKTOP MUDAR DE PROPOSITO, esta guarda fica vermelha, e e para
// ficar. O jeito de passar por ela e ANTERIOR=nenhum naquela rodada, dito no
// commit — nao existe "regenerar a referencia", que era o caminho por onde a
// versao anterior desta guarda podia virar carimbo sem ninguem notar.
if (MODO === 'real' || MODO === 'impostor-desktop' || MODO === 'impostor-desktop-cor') {
  if (ANTERIOR === 'nenhum') {
    console.log('- desktop pixel a pixel: PULADO, sem build anterior (ANTERIOR=nenhum)')
  } else {
    for (const W of LARGURAS) {
      // o ANTERIOR nunca leva rota mutada: e ele que define o que "igual" quer
      // dizer. Mutar os dois lados faria o impostor-desktop virar no-op.
      let ref
      try {
        ref = await capturarReferencia(browser, ANTERIOR, W)
      } catch (e) {
        console.error(`INSTRUMENTO: o build anterior nao respondeu em ${ANTERIOR} (${e.message.split('\n')[0]})`)
        process.exit(3)
      }
      const ctx = await browser.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 1 })
      const page = await ctx.newPage()
      await page.addInitScript(() => {
        const orig = window.setInterval
        window.setInterval = (fn, t, ...r) => (t === 5000 ? 0 : orig(fn, t, ...r))
      })
      if (MODO !== 'real') await aplicarRotas(page)
      const png = await capturar(page, BASE)
      const agora = await assinar(page, png)
      const r = comparar(ref, agora)
      V(`desktop em ${W}px identico ao build anterior`, r.ok,
        r.ok ? `0 de ${r.total} blocos de 64px` : `${r.motivo}` +
          (r.diferentes.length ? ` | primeiros ${JSON.stringify(r.diferentes.slice(0, 4))}` : ''))
      await ctx.close()
    }
  }
}

// ---------------- CARROSSEL, COM O RELOGIO CORRENDO ----------------
// Todo o resto roda com o carrossel congelado, para a medicao de contraste ser
// determinista. A rotacao em si precisa de um bloco proprio, senao congelar
// vira desligar: a suite ficaria verde com o carrossel parado em producao.
{
  const { ctx, page } = await abrir(1440, 900, { congelarCarrossel: false })
  await irPara(page, BASE)
  await page.evaluate(() => document.fonts.ready.then(() => 0))
  await page.waitForTimeout(600)
  const ativo = () => page.evaluate(() => {
    const b = [...document.querySelectorAll('#inicio button[aria-label^="Slide"]')]
    return b.findIndex(x => Math.round(x.getBoundingClientRect().width) > 12)
  })
  const antes = await ativo()
  V('o hero tem 3 slides com botao proprio',
    (await page.locator('#inicio button[aria-label^="Slide"]').count()) === 3,
    `${await page.locator('#inicio button[aria-label^="Slide"]').count()} botoes`)
  V('o slide ativo e legivel pelo botao largo', antes >= 0, `indice ${antes}`)
  await page.waitForTimeout(7000)   // o intervalo e 5s
  const depois = await ativo()
  V('o carrossel troca de slide sozinho', depois >= 0 && depois !== antes,
    `slide ${antes} -> ${depois} em 7s`)
  await ctx.close()
}

await browser.close()
console.log(`\nmodo=${MODO}  placar: ${ok} ✓ / ${bad} ✗`)
process.exit(bad === 0 ? 0 : 1)
