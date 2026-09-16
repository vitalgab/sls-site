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
  'impostor-missao', 'impostor-persona', 'impostor-manifest', 'impostor-logo']
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
  // derruba UM logo: o teste tem de acusar o que faltou, nao so contar quantos ha
  if (MODO === 'impostor-logo') await page.route(/seguradoras\/unimed\.svg/, r => r.abort())
  if (MODO === 'impostor-manifest') await page.route(/manifest\.json/, r => r.fulfill({ status: 404, body: '' }))
  if (MODO === 'impostor-css') {
    await page.route(/\.css(\?|$)/, async r => {
      let t = await (await r.fetch()).text()
      t = mutar(t, '"Montserrat", "Inter", sans-serif', 'Georgia, serif', 'token --font-display')
      t = mutar(t, 'font-style:normal', 'font-style:italic', 'font-style dos titulos')
      await r.fulfill({ body: t, contentType: 'text/css' })
    })
  }
  if (['impostor-wa', 'impostor-em', 'impostor-missao'].includes(MODO)) {
    await page.route(/\.js(\?|$)/, async r => {
      let t = await (await r.fetch()).text()
      if (MODO === 'impostor-wa') {
        t = mutar(t, '5571981018556', '5571999999999', 'numero do WhatsApp')
        t = mutar(t, '(71) 98101-8556', '(71) 9 9999-9999', 'telefone exibido')
        t = mutar(t, '242156562', 'XXXXXXXXXX', 'SUSEP')
      } else if (MODO === 'impostor-em') {
        t = mutar(t, 'fontStyle:`normal`,fontWeight:700', 'fontStyle:`italic`,fontWeight:400', 'destaque do hero')
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
  V('13 cartoes de seguradora', seg.cartoes === 13, `${seg.cartoes}`)
  V('11 logos como <img>', seg.imgs.length === 11, `${seg.imgs.length} imagens`)
  const semCarregar = seg.imgs.filter(i => !(i.nw > 0))
  V('todos os logos carregaram (naturalWidth > 0)', semCarregar.length === 0,
    semCarregar.length ? JSON.stringify(semCarregar.map(i => i.src)) : seg.imgs.map(i => i.nw).join(','))
  V('todo logo tem alt com o nome da marca', seg.imgs.every(i => i.alt && i.alt.length > 2),
    seg.imgs.map(i => i.alt).join(' · '))
  V('logos com SVG (nao bitmap)', seg.imgs.every(i => i.src.endsWith('.svg')), `${seg.imgs.length}/11`)
  // altura uniforme: nenhum passa do teto, e nenhum vira fiapo
  const alturas = seg.imgs.map(i => i.alt_alt)
  V('altura dos logos entre 14 e 42 px (teto uniforme)',
    alturas.every(h => h >= 14 && h <= 42), `min=${Math.min(...alturas)} max=${Math.max(...alturas)}`)
  V('Icatu e NotreDame seguem como texto (logo oficial nao obtido)',
    seg.textos.length === 2 && seg.textos.join('|').includes('Icatu') && seg.textos.join('|').includes('NotreDame'),
    JSON.stringify(seg.textos))

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
