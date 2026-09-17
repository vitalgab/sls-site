/**
 * Auditoria de escala: tipografia, espaco, pecas, campos e alvos de toque em
 * 390, 360, 768 e 1440, dos DOIS builds — o de :8098 (anterior) e o de :8099.
 *
 *   npm run anterior && SAIDA=/tmp/auditoria.json node scripts/auditoria-escala.mjs
 *
 * Os dois lados saem do MESMO instrumento de proposito. Medir o "antes" com um
 * script e o "depois" com outro produz uma tabela que compara os scripts, e a
 * diferenca entre dois seletores parece diferenca entre dois builds.
 *
 * ⚠️ SELETOR QUE NAO ACHA NADA DEVOLVE null DOS DOIS LADOS, e null == null vira
 * "nao mudou" numa tabela de diff. Por isso o consumidor tem de listar os campos
 * nulos antes de ler a tabela: nesta rodada o seletor do botao flutuante do
 * WhatsApp era um desses, e a linha dele nao mediu nada — nao e que ele nao
 * mudou. Quem afirma sobre alvo de toque e a sonda do smoke, que CLICA.
 */
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { opcoesNavegador } from './referencia-desktop.mjs'

const URLS = { antes: 'http://127.0.0.1:8098/sls-site/', depois: 'http://127.0.0.1:8099/sls-site/' }
const LARGS = [390, 360, 768, 1440]

const medir = () => {
  const fs = s => { const e = document.querySelector(s); return e ? +getComputedStyle(e).fontSize.replace('px', '') : null }
  const cx = s => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null }
  const px = v => (v == null ? null : +String(v).replace('px', ''))
  const cardPad = s => { const c = cx(s); return c ? `${px(c.paddingTop)}/${px(c.paddingLeft)}` : null }
  const dim = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}` }

  const secoes = [...document.querySelectorAll('section, .faixa-parallax, .faixa-citacao')].map(e => {
    const c = getComputedStyle(e)
    return { id: e.id || e.className.split(' ')[0] || 'section', alt: Math.round(e.getBoundingClientRect().height), padT: px(c.paddingTop), padB: px(c.paddingBottom) }
  })
  const gap = s => { const c = cx(s); return c ? px(c.rowGap) : null }

  return {
    escala: {
      zoomBody: getComputedStyle(document.body).zoom,
      transformBody: getComputedStyle(document.body).transform,
      viewport: document.querySelector('meta[name=viewport]')?.content
    },
    fonte: {
      body: fs('body'),
      h1: fs('#inicio h1'),
      heroP: fs('#inicio .hero-grid p'),
      h2: fs('#para-quem .section-title'),
      sub: fs('#para-quem .section-sub'),
      eyebrow: fs('.section-eyebrow'),
      h3card: fs('.paraquem-card h3'),
      pCard: fs('.paraquem-card p'),
      h4dif: fs('.dif-card h4') ?? fs('.dif-card h3'),
      pDif: fs('.dif-card p'),
      citacao: fs('.citacao-texto'),
      assinatura: fs('.citacao-assinatura'),
      faixaProp: fs('.faixa-parallax p') ?? fs('.faixa-parallax span'),
      botao: fs('#inicio .btn-primary'),
      rotuloPilar: fs('.pilar-rotulo'),
      produtoH3: fs('#produtos h3'),
      rodape: fs('footer a')
    },
    espaco: {
      secoes,
      gapParaQuem: gap('.paraquem-grid'),
      gapDif: gap('.diferenciais-grid'),
      container: (() => { const c = cx('#para-quem .container'); return c ? `${px(c.paddingLeft)}/${px(c.paddingRight)}` : null })(),
      cardDif: cardPad('.dif-card'),
      cardForm: cardPad('.hero-form-card'),
      cardParaQuemBase: (() => { const c = cx('.paraquem-card > div:last-child'); return c ? `${px(c.paddingTop)}/${px(c.paddingLeft)}/${px(c.paddingBottom)}` : null })()
    },
    pecas: {
      header: Math.round(document.querySelector('header').getBoundingClientRect().height),
      logo: dim('header img'),
      iconeParaQuem: dim('.paraquem-card svg'),
      iconeDif: dim('.dif-card svg'),
      iconeProduto: dim('#produtos svg'),
      fotoPersona: dim('.paraquem-card img'),
      fotoCitacao: dim('.citacao-foto'),
      triangulo: dim('.pilares-img'),
      whatsFlutuante: dim('a[aria-label*="WhatsApp" i]')
    },
    pagina: {
      scrollHeight: document.documentElement.scrollHeight,
      telas: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(1),
      rolagemLateral: document.documentElement.scrollWidth > window.innerWidth
    },
    campos: [...document.querySelectorAll('input, select, textarea')]
      .map(e => ({ tag: e.tagName.toLowerCase(), fs: +getComputedStyle(e).fontSize.replace('px', ''), alt: Math.round(e.getBoundingClientRect().height) })),
    alvosCaixa: [...document.querySelectorAll('a, button, input, select, textarea')]
      .filter(e => e.getBoundingClientRect().width > 0)
      .map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), rot: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 18), w: Math.round(r.width), h: Math.round(r.height) } })
      .filter(a => a.w < 44 || a.h < 44)
  }
}

const b = await chromium.launch(opcoesNavegador())
const saida = {}
for (const [lado, url] of Object.entries(URLS)) {
  saida[lado] = {}
  for (const W of LARGS) {
    const c = await b.newContext({ viewport: { width: W, height: W < 500 ? 844 : 1024 }, deviceScaleFactor: 1 })
    const p = await c.newPage()
    await p.addInitScript(() => { const o = window.setInterval; window.setInterval = (f, t, ...r) => (t === 5000 ? 0 : o(f, t, ...r)) })
    await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    await p.evaluate(() => document.fonts.ready)
    await p.evaluate(async () => { const h = innerHeight; for (let y = 0; y < document.body.scrollHeight; y += h) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) } scrollTo(0, 0) })
    await p.waitForTimeout(800)
    saida[lado][W] = await p.evaluate(medir)
    await c.close()
  }
}
await b.close()
writeFileSync(process.env.SAIDA || '/tmp/auditoria.json', JSON.stringify(saida, null, 1))
console.log('gravado')
