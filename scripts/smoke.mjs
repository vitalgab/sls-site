/**
 * Smoke dinamico do site institucional.
 *
 *   node scripts/smoke.mjs                      # modo real
 *   MODO=impostor-css node scripts/smoke.mjs    # controle negativo
 *
 * Variaveis: SMOKE_URL (padrao http://127.0.0.1:8099/sls-site/), SHOTS_DIR, MODO.
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

const BASE = process.env.SMOKE_URL || 'http://127.0.0.1:8099/sls-site/'
const SHOTS = process.env.SHOTS_DIR || null
const WA = '5571981018556'
const TEL = '+5571981018556'
const MODO = process.env.MODO || 'real'

const MODOS = ['real', 'impostor-css', 'impostor-rede', 'impostor-wa', 'impostor-em',
  'impostor-missao', 'impostor-persona', 'impostor-manifest', 'impostor-logo',
  'impostor-gray', 'impostor-pwa', 'impostor-azos', 'impostor-faixa',
  'impostor-overlay']
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

async function abrir (w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.addInitScript(() => { window.__abertos = []; window.open = u => { window.__abertos.push(String(u)); return null } })

  if (MODO === 'impostor-rede') await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort())
  if (MODO === 'impostor-persona') await page.route(/persona-.*\.(jpg|webp)/, r => r.abort())
  // derruba a foto da faixa: o fundo some e so sobra o gradiente
  if (MODO === 'impostor-faixa') await page.route(/faixa-familia\.webp/, r => r.abort())
  // derruba UM logo: o teste tem de acusar o que faltou, nao so contar quantos ha
  if (MODO === 'impostor-logo') await page.route(/seguradoras\/unimed\.svg/, r => r.abort())
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
  if (MODO === 'impostor-pwa') {
    await page.route(u => u.href === BASE || u.href === BASE + 'index.html', async r => {
      let t = await (await r.fetch()).text()
      t = mutar(t, '<link rel="apple-touch-icon" href="/sls-site/icons/apple-touch-icon.png" />', '', 'link apple-touch-icon')
      t = mutar(t, '<link rel="manifest" href="/sls-site/manifest.json" />', '', 'link manifest')
      t = mutar(t, '<meta name="theme-color" content="#003A70" />', '', 'meta theme-color')
      await r.fulfill({ body: t, contentType: 'text/html' })
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
  if (['impostor-wa', 'impostor-em', 'impostor-missao', 'impostor-overlay'].includes(MODO)) {
    await page.route(/\.js(\?|$)/, async r => {
      let t = await (await r.fetch()).text()
      if (MODO === 'impostor-wa') {
        t = mutar(t, '5571981018556', '5571999999999', 'numero do WhatsApp')
        t = mutar(t, '(71) 98101-8556', '(71) 9 9999-9999', 'telefone exibido')
        t = mutar(t, '242156562', 'XXXXXXXXXX', 'SUSEP')
      } else if (MODO === 'impostor-em') {
        t = mutar(t, 'fontStyle:`normal`,fontWeight:700', 'fontStyle:`italic`,fontWeight:400', 'destaque do hero')
      } else if (MODO === 'impostor-overlay') {
        t = mutar(t, 'linear-gradient(0deg, rgba(0,15,40,0.82) 0%, rgba(0,15,40,0.65) 100%)',
          'linear-gradient(0deg, rgba(0,15,40,0) 0%, rgba(0,15,40,0) 100%)', 'overlay da faixa')
      } else {
        t = mutar(t, 'fontWeight:700,fontStyle:`normal`', 'fontWeight:400,fontStyle:`italic`', 'destaque da missao')
      }
      await r.fulfill({ body: t, contentType: 'text/javascript' })
    })
  }
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
    return { tag: el.tagName.toLowerCase(), txt: (el.textContent || '').trim().slice(0, 34), ff: cs.fontFamily, fs: cs.fontStyle, fw: cs.fontWeight }
  }))
  V('titulos/citacao/missao presentes no DOM', tit.length >= 20, `${tit.length} elementos`)
  const foraFam = tit.filter(t => !/^["']?Montserrat/i.test(t.ff.trim()))
  const foraEst = tit.filter(t => t.fs !== 'normal')
  V('fontFamily comeca com Montserrat', foraFam.length === 0, foraFam.length ? JSON.stringify(foraFam.slice(0, 2)) : `${tit.length}/${tit.length}`)
  V('fontStyle normal', foraEst.length === 0, foraEst.length ? JSON.stringify(foraEst.slice(0, 2)) : `${tit.length}/${tit.length}`)

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
    const svgTexts = document.querySelectorAll('#sobre svg text').length
    return { varridos: alvos.length, ruins, svgTexts }
  })
  V('varredura cobriu a arvore', sweep.varridos > 300, `${sweep.varridos} elementos`)
  V('varredura alcancou os rotulos do monograma (SVG)', sweep.svgTexts >= 5, `${sweep.svgTexts} <text> em #sobre`)
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
    V('texto novo da faixa', faixa.texto === 'Nosso propósito é cuidar do nosso cliente. Somos especialistas em proteger famílias, carreiras e legados.',
      JSON.stringify(faixa.texto.slice(0, 80)))
    V('o "— Missão da Seu Legado Seguro" saiu', !faixa.temSpan && !faixa.texto.includes('Missão'), faixa.temSpan ? 'ainda ha <span>' : 'sem span')
    // A foto tem de ser SERVIDA PELO PROPRIO SITE. Antes vinha do Unsplash: um
    // engasgo de terceiro apagava o fundo da faixa em producao.
    V('foto da faixa e local (mesmo host)', !!faixa.url && faixa.url.includes('/sls-site/assets/faixa-familia.webp'), `${faixa.url}`)
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
    V('<em> da missao: peso 700, sem inclinacao', destaques.missao.fw === '700' && destaques.missao.fs === 'normal',
      `peso=${destaques.missao.fw} estilo=${destaques.missao.fs}`)
  }

  // ---- 5. o unico italico que fica e o "dentre outras..." (Inter) ----
  const italicos = await page.evaluate(() => [...document.querySelectorAll('*')]
    .filter(el => getComputedStyle(el).fontStyle === 'italic')
    .map(el => ({ txt: (el.textContent || '').trim().slice(0, 30), ff: getComputedStyle(el).fontFamily })))
  V('todo italico remanescente e "dentre outras..." em Inter',
    italicos.length > 0 && italicos.every(i => i.txt === 'dentre outras...' && /^["']?Inter/.test(i.ff)),
    `${italicos.length} elementos italicos: ${JSON.stringify([...new Set(italicos.map(i => i.txt))])}`)

  // ---- 6. personas e PWA ----
  const personas = await page.evaluate(() => [...document.querySelectorAll('img[src*="persona-"]')]
    .map(i => ({ src: i.getAttribute('src'), nw: i.naturalWidth, nh: i.naturalHeight })))
  V('tres personas no DOM', personas.length === 3, `${personas.length}: ${personas.map(p => p.src.split('/').pop()).join(', ')}`)
  V('as tres personas sao WebP com alfa', personas.every(p => p.src.endsWith('.webp')),
    personas.map(p => p.src.split('/').pop()).join(', '))
  V('as tres personas carregaram (naturalWidth > 0)', personas.length === 3 && personas.every(p => p.nw > 0),
    personas.map(p => `${p.nw}x${p.nh}`).join(' | '))

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
  const PNG_ACEITOS = ['qualicorp.png', 'seguros-unimed.png']
  const bitmaps = seg.imgs.filter(i => !i.src.endsWith('.svg')).map(i => i.src.split('/').pop())
  V('formato: SVG, salvo os dois PNG conhecidos',
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
  V('<link rel="manifest"> anunciado no DOM', !!pwa.manifest && pwa.manifest.endsWith('/sls-site/manifest.json'), `${pwa.manifest}`)
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

  // ---- 8. os DOIS formularios, por gesto real ----
  const form1 = page.getByRole('button', { name: 'Enviar pelo WhatsApp' })   // hero
  const form2 = page.getByRole('button', { name: 'Enviar via WhatsApp' })    // contato
  V('botao do formulario do hero presente', await form1.count() === 1, `${await form1.count()}`)
  V('botao do formulario de contato presente', await form2.count() === 1, `${await form2.count()}`)

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
  if (await form2.count() === 1) {
    await page.evaluate(() => { window.__abertos.length = 0 })
    await page.fill('#contato input[type="text"]', 'Teste Contato')
    await page.fill('#contato input[type="tel"]', '(71) 97777-6666')
    await form2.click({ timeout: 8000 })
    await page.waitForTimeout(400)
    const ab = await page.evaluate(() => window.__abertos.slice())
    V('formulario de contato chamou window.open', ab.length === 1, `${ab.length} chamada(s)`)
    if (ab.length) {
      V(`URL do formulario de contato usa wa.me/${WA}`, ab[0].includes(`wa.me/${WA}`), ab[0].slice(0, 70) + '...')
      V('URL do formulario de contato preserva ?text=', ab[0].includes('?text=') && /Teste%20Contato/.test(ab[0]))
    }
    V('confirmacao "Mensagem enviada!" apareceu', (await page.getByText('Mensagem enviada!').count()) > 0)
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

await browser.close()
console.log(`\nmodo=${MODO}  placar: ${ok} ✓ / ${bad} ✗`)
process.exit(bad === 0 ? 0 : 1)
