/**
 * Paridade entre o que esta PUBLICADO (gh-pages d737d7c) e o build local.
 *
 * Usada para provar que a reconstrucao da fonte perdida bate com o que esta no
 * ar, secao a secao: innerText, computed styles, hrefs, imagens carregadas,
 * dimensoes e diff de pixels (decodificado dentro do proprio Chromium, sem
 * dependencia externa).
 *
 *   # publicado em :8101, build local em :8102
 *   LARGURA=1440 node scripts/paridade.mjs
 *   MODO=impostor-texto node scripts/paridade.mjs    # controle negativo
 *
 * Exit: 0 tudo igual | 1 divergiu | 3 modo desconhecido (instrumento).
 *
 * ATENCAO: rodar isto DEPOIS de aplicar Montserrat/contatos da vermelho de
 * proposito — a paridade so vale contra o commit da reconstrucao (e8b865f).
 */
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
import fs from 'node:fs'

const AR = 'http://127.0.0.1:8101/sls-site/'
const NOVO = 'http://127.0.0.1:8102/sls-site/'
const SHOTS = process.env.SHOTS_DIR
const LARG = Number(process.env.LARGURA || 1440)
const MODO = process.env.MODO || 'real'   // real | impostor-texto | impostor-estilo
if (!['real', 'impostor-texto', 'impostor-estilo'].includes(MODO)) { console.error(`modo desconhecido: ${MODO}`); process.exit(3) }

// Secoes na ordem em que aparecem. sel = seletor; idx = indice quando o seletor casa varios.
const SECOES = [
  { nome: 'hero',         sel: '#inicio' },
  { nome: 'para-quem',    sel: '#para-quem' },
  { nome: 'produtos',     sel: '#produtos' },
  { nome: 'seguradoras',  sel: 'body > div > section', idx: 3 },
  { nome: 'missao',       sel: '.faixa-parallax' },
  { nome: 'por-que',      sel: '#sobre' },
  { nome: 'cta',          sel: 'body > div > section', idx: 5 },
  { nome: 'contato',      sel: '#contato' },
  { nome: 'rodape',       sel: 'body > div > footer' },
]

// Piso de conteudo por secao: seletor que casa o elemento errado (um <footer>
// de citacao no lugar do rodape da pagina) casa nos DOIS lados e passaria como
// "igual". O piso transforma isso em vermelho.
const PISO = { hero: 300, 'para-quem': 600, produtos: 1200, seguradoras: 200,
  missao: 80, 'por-que': 1200, cta: 200, contato: 250, rodape: 250 }

const ESTILOS = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'color', 'backgroundColor',
  'letterSpacing', 'lineHeight', 'textAlign', 'paddingTop', 'paddingBottom', 'borderRadius', 'display']

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

async function medir (url, mutar) {
  const ctx = await browser.newContext({ viewport: { width: LARG, height: 1000 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready.then(() => 0))
  // congela carrossel, transicoes e parallax para a comparacao ser deterministica
  await page.addStyleTag({ content: `*,*::before,*::after{transition:none !important;animation:none !important}
    .faixa-parallax{background-attachment:scroll !important}` })
  await page.evaluate(() => {
    const dots = document.querySelectorAll('#inicio button[aria-label^="Slide"]')
    if (dots[0]) dots[0].click()
  })
  // percorre a pagina inteira para disparar o loading="lazy" das personas:
  // sem isso a 3a imagem mede naturalWidth 0 em 390px e a checagem vira vacua.
  await page.evaluate(async () => {
    const passo = window.innerHeight
    for (let y = 0; y < document.body.scrollHeight; y += passo) {
      window.scrollTo(0, y)
      await new Promise(r => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(900)
  if (mutar) await page.evaluate(mutar)

  const dados = await page.evaluate(({ SECOES, ESTILOS }) => {
    const out = {}
    for (const s of SECOES) {
      const els = [...document.querySelectorAll(s.sel)]
      const el = s.idx === undefined ? els[0] : els[s.idx]
      if (!el) { out[s.nome] = null; continue }
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      const estilos = {}
      for (const k of ESTILOS) estilos[k] = cs[k]
      // estilos dos titulos/paragrafos-chave de dentro da secao
      const filhos = [...el.querySelectorAll('h1, h2, h3, h4, blockquote, .section-eyebrow, .btn-primary')]
        .slice(0, 8).map(f => {
          const fcs = getComputedStyle(f)
          return {
            tag: f.tagName.toLowerCase(),
            txt: (f.textContent || '').trim().slice(0, 40),
            ff: fcs.fontFamily, fs: fcs.fontSize, fw: fcs.fontWeight, st: fcs.fontStyle, cor: fcs.color,
          }
        })
      out[s.nome] = {
        texto: el.innerText,
        largura: Math.round(r.width),
        altura: Math.round(r.height),
        estilos,
        filhos,
        links: [...el.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
        imgs: [...el.querySelectorAll('img')].map(i => ({ src: i.getAttribute('src'), nw: i.naturalWidth })),
      }
    }
    out.__global = {
      titulo: document.title,
      nElementos: document.querySelectorAll('*').length,
      nSections: document.querySelectorAll('section').length,
      nLinks: document.querySelectorAll('a[href]').length,
    }
    return out
  }, { SECOES, ESTILOS })

  const shots = {}
  for (const s of SECOES) {
    const els = await page.$$(s.sel)
    const el = s.idx === undefined ? els[0] : els[s.idx]
    if (!el) continue
    await el.scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForTimeout(150)
    shots[s.nome] = (await el.screenshot()).toString('base64')
  }
  return { ctx, page, dados, shots }
}

const mutacoes = {
  'impostor-texto': () => {
    const h = document.querySelector('#sobre h2')
    if (!h) throw new Error('alvo do impostor-texto ausente')
    h.textContent = h.textContent + ' (alterado)'
  },
  'impostor-estilo': () => {
    const b = document.querySelector('#sobre blockquote')
    if (!b) throw new Error('alvo do impostor-estilo ausente')
    b.style.setProperty('font-size', '31px', 'important')
  },
}

const a = await medir(AR, null)
const b = await medir(NOVO, mutacoes[MODO] || null)

// --- comparador de pixels: decodifica os dois PNGs dentro do proprio Chromium ---
const cmpCtx = await browser.newContext()
const cmpPage = await cmpCtx.newPage()
await cmpPage.setContent('<body></body>')
async function pixelDiff (p1, p2) {
  return cmpPage.evaluate(async ([d1, d2]) => {
    const carregar = src => new Promise((res, rej) => {
      const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'data:image/png;base64,' + src
    })
    const [i1, i2] = await Promise.all([carregar(d1), carregar(d2)])
    if (i1.width !== i2.width || i1.height !== i2.height) {
      return { dim: `${i1.width}x${i1.height} vs ${i2.width}x${i2.height}`, pct: null, total: 0, difs: 0 }
    }
    const desenhar = im => {
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0)
      return g.getImageData(0, 0, im.width, im.height).data
    }
    const [A, B] = [desenhar(i1), desenhar(i2)]
    let difs = 0, maxD = 0
    for (let i = 0; i < A.length; i += 4) {
      const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]))
      if (d > 8) difs++
      if (d > maxD) maxD = d
    }
    const total = A.length / 4
    return { dim: `${i1.width}x${i1.height}`, pct: (100 * difs / total), total, difs, maxD }
  }, [p1, p2])
}

let ok = 0, bad = 0
const V = (n, c, d = '') => {
  if (c) { ok++; console.log(`✓ ${n}${d ? ' — ' + d : ''}`) }
  else { bad++; console.log(`✗ ${n}${d ? ' — ' + d : ''}`) }
}

console.log(`\n### PARIDADE ${LARG}px  (modo=${MODO})`)
console.log(`global no ar : ${JSON.stringify(a.dados.__global)}`)
console.log(`global recons: ${JSON.stringify(b.dados.__global)}\n`)
V('nº de elementos no DOM bate', a.dados.__global.nElementos === b.dados.__global.nElementos,
  `${a.dados.__global.nElementos} vs ${b.dados.__global.nElementos}`)
V('nº de <a href> bate', a.dados.__global.nLinks === b.dados.__global.nLinks,
  `${a.dados.__global.nLinks} vs ${b.dados.__global.nLinks}`)

const linhas = []
for (const s of SECOES) {
  const A = a.dados[s.nome], B = b.dados[s.nome]
  if (!A || !B) { V(`secao ${s.nome} existe nos dois`, false, `ar=${!!A} novo=${!!B}`); continue }
  const txtIgual = A.texto === B.texto
  const estIgual = JSON.stringify(A.estilos) === JSON.stringify(B.estilos)
  const filIgual = JSON.stringify(A.filhos) === JSON.stringify(B.filhos)
  const linkIgual = JSON.stringify(A.links) === JSON.stringify(B.links)
  const imgIgual = JSON.stringify(A.imgs.map(i => i.nw)) === JSON.stringify(B.imgs.map(i => i.nw))
  const dimIgual = A.largura === B.largura && Math.abs(A.altura - B.altura) <= 1
  const px = (a.shots[s.nome] && b.shots[s.nome]) ? await pixelDiff(a.shots[s.nome], b.shots[s.nome]) : null

  V(`[${s.nome}] innerText identico`, txtIgual, txtIgual ? `${A.texto.length} chars` : primeiraDif(A.texto, B.texto))
  V(`[${s.nome}] computed styles da secao`, estIgual, estIgual ? `${ESTILOS.length} props` : difEstilos(A.estilos, B.estilos))
  V(`[${s.nome}] estilos de titulos/botoes`, filIgual, filIgual ? `${A.filhos.length} elementos` : difFilhos(A.filhos, B.filhos))
  V(`[${s.nome}] hrefs`, linkIgual, `${A.links.length} links`)
  V(`[${s.nome}] imagens carregadas (naturalWidth)`, imgIgual && A.imgs.every(i => i.nw > 0),
    A.imgs.length ? A.imgs.map(i => i.nw).join(',') + ' vs ' + B.imgs.map(i => i.nw).join(',') : 'sem <img>')
  V(`[${s.nome}] dimensoes`, dimIgual, `${A.largura}x${A.altura} vs ${B.largura}x${B.altura}`)
  V(`[${s.nome}] seletor pegou a secao inteira`, A.texto.length >= PISO[s.nome],
    `${A.texto.length} chars (piso ${PISO[s.nome]})`)
  if (px) V(`[${s.nome}] pixels`, px.pct !== null && px.pct < 0.5,
    px.pct === null ? `dimensoes diferentes: ${px.dim}` : `${px.pct.toFixed(4)}% difs (${px.difs}/${px.total}) maxDelta=${px.maxD} ${px.dim}`)
  linhas.push({ secao: s.nome, texto: txtIgual, estilos: estIgual, titulos: filIgual, hrefs: linkIgual, dim: `${A.largura}x${A.altura}`, pxPct: px && px.pct !== null ? +px.pct.toFixed(4) : 'n/a' })

  if (SHOTS) {
    fs.writeFileSync(`${SHOTS}/${LARG}-${s.nome}-NO-AR.png`, Buffer.from(a.shots[s.nome], 'base64'))
    fs.writeFileSync(`${SHOTS}/${LARG}-${s.nome}-RECONSTRUIDO.png`, Buffer.from(b.shots[s.nome], 'base64'))
  }
}

function primeiraDif (x, y) {
  let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++
  return `divergem no char ${i}: ...${JSON.stringify(x.slice(i - 20, i + 30))} vs ...${JSON.stringify(y.slice(i - 20, i + 30))}`
}
function difEstilos (x, y) { return Object.keys(x).filter(k => x[k] !== y[k]).map(k => `${k}: ${x[k]} vs ${y[k]}`).join(' | ') }
function difFilhos (x, y) {
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if (JSON.stringify(x[i]) !== JSON.stringify(y[i])) return `elem ${i}: ${JSON.stringify(x[i])} vs ${JSON.stringify(y[i])}`
  }
  return ''
}

console.log('\n| secao | texto | estilos | titulos | hrefs | dimensoes | % pixels difs |')
console.log('|---|---|---|---|---|---|---|')
for (const l of linhas) {
  console.log(`| ${l.secao} | ${l.texto ? 'igual' : 'DIFERE'} | ${l.estilos ? 'igual' : 'DIFERE'} | ${l.titulos ? 'igual' : 'DIFERE'} | ${l.hrefs ? 'igual' : 'DIFERE'} | ${l.dim} | ${l.pxPct} |`)
}
await browser.close()
console.log(`\nmodo=${MODO} largura=${LARG}  placar: ${ok} ✓ / ${bad} ✗`)
process.exit(bad === 0 ? 0 : 1)
