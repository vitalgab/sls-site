/**
 * Golden master do DESKTOP: a prova de que uma mudanca de mobile nao vazou.
 *
 *   node scripts/referencia-desktop.mjs                 # compara 8098 com 8099
 *   ANTERIOR=... ATUAL=... node scripts/referencia-desktop.mjs
 *
 * Nao guarda o PNG. Compara o SHA-256 de cada bloco de 64x64 da captura de
 * pagina inteira dos DOIS builds. Bloco diferente <=> pelo menos um pixel
 * diferente, entao "zero blocos" e exatamente "0% de pixels diferentes".
 *
 * O PNG e decodificado DENTRO da pagina, com canvas, e o hash sai do
 * crypto.subtle do proprio navegador — sem dependencia nova para isso.
 *
 * ⚠️ A REFERENCIA E CAPTURADA NA HORA, DO BUILD ANTERIOR, NA MESMA MAQUINA.
 * A primeira versao disto gravava os hashes num arquivo do repositorio, e o
 * arquivo reprovou no runner do CI: 693 dos 2576 blocos de 1440px "mudaram"
 * numa mudanca que nao tocou uma linha do desktop. As fontes CARREGAM nos dois
 * lugares (conferido: Montserrat e Inter respondem 200 e entram em
 * document.fonts) — o que difere e a RASTERIZACAO, e ela difere por maquina.
 * Era o mesmo defeito do run 12, que reprovou por ~2px de largura de rotulo.
 *
 * Hash de pixel so compara dentro da MESMA maquina. Gravar a referencia em
 * arquivo e pedir que ela atravesse maquinas e transformar a guarda em loteria:
 * ou ela reprova sempre no CI, ou alguem afrouxa o limiar ate ela nao reprovar
 * nunca. Capturar os dois lados no mesmo navegador, no mesmo minuto, remove a
 * variavel em vez de tolera-la.
 */
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'

export const LARGURAS = [1440, 1280]
export const BLOCO = 64

export async function capturar (page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(async () => {
    const h = window.innerHeight
    for (let y = 0; y < document.body.scrollHeight; y += h) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 200)) }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(2000)
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.waitForTimeout(300)
  return await page.screenshot({ fullPage: true })
}

/** Decodifica o PNG na propria pagina e devolve um hash por bloco. */
export async function assinar (page, png, bloco = BLOCO) {
  return await page.evaluate(async ([b64, B]) => {
    const img = new Image()
    await new Promise((ok, err) => { img.onload = ok; img.onerror = err; img.src = 'data:image/png;base64,' + b64 })
    const cv = document.createElement('canvas')
    cv.width = img.width; cv.height = img.height
    const ctx = cv.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)
    const { data, width, height } = ctx.getImageData(0, 0, cv.width, cv.height)
    const cols = Math.ceil(width / B), linhas = Math.ceil(height / B)
    const hex = buf => [...new Uint8Array(buf)].slice(0, 6).map(x => x.toString(16).padStart(2, '0')).join('')
    const blocos = []
    for (let by = 0; by < linhas; by++) {
      for (let bx = 0; bx < cols; bx++) {
        const y1 = Math.min((by + 1) * B, height), x1 = Math.min((bx + 1) * B, width)
        const largura = x1 - bx * B
        const pedaco = new Uint8Array((y1 - by * B) * largura * 4)
        let o = 0
        for (let y = by * B; y < y1; y++) {
          pedaco.set(data.subarray((y * width + bx * B) * 4, (y * width + x1) * 4), o)
          o += largura * 4
        }
        blocos.push(hex(await crypto.subtle.digest('SHA-256', pedaco)))
      }
    }
    return { width, height, bloco: B, cols, linhas, blocos }
  }, [png.toString('base64'), bloco])
}

export function comparar (ref, agora) {
  if (ref.width !== agora.width || ref.height !== agora.height) {
    return { ok: false, motivo: `dimensao mudou: ${ref.width}x${ref.height} -> ${agora.width}x${agora.height}`, diferentes: [] }
  }
  const dif = []
  for (let i = 0; i < ref.blocos.length; i++) {
    if (ref.blocos[i] !== agora.blocos[i]) dif.push({ x: (i % ref.cols) * ref.bloco, y: Math.floor(i / ref.cols) * ref.bloco })
  }
  return { ok: dif.length === 0, diferentes: dif, total: ref.blocos.length,
    motivo: dif.length ? `${dif.length} de ${ref.blocos.length} blocos mudaram` : '' }
}

export function opcoesNavegador () {
  const o = {}
  const CH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
  const CA = '/root/.ccr/agent-proxy-ca.crt'
  if (existsSync(CH)) o.executablePath = CH
  if (existsSync(CA)) o.args = ['--ignore-certificate-errors-spki-list=KnP1OnzHv/y42eRQmbGwoYTHcSJF448m6CU5mdngwKk=,PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0=']
  return o
}

export async function capturarReferencia (browser, url, W) {
  const c = await browser.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 1 })
  const p = await c.newPage()
  await p.addInitScript(() => { const o = window.setInterval; window.setInterval = (f, t, ...r) => (t === 5000 ? 0 : o(f, t, ...r)) })
  const png = await capturar(p, url)
  const a = await assinar(p, png)
  await c.close()
  return a
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const ANTERIOR = process.env.ANTERIOR || 'http://127.0.0.1:8098/'
  const ATUAL = process.env.ATUAL || 'http://127.0.0.1:8099/'
  const b = await chromium.launch(opcoesNavegador())
  let falhou = 0
  for (const W of LARGURAS) {
    const ref = await capturarReferencia(b, ANTERIOR, W)
    const agora = await capturarReferencia(b, ATUAL, W)
    const r = comparar(ref, agora)
    console.log(`${W}px: ${r.ok ? 'IDENTICO' : r.motivo}` +
      (r.ok ? ` (0 de ${r.total} blocos de ${BLOCO}px)` : ` | primeiros ${JSON.stringify(r.diferentes.slice(0, 4))}`))
    if (!r.ok) falhou++
  }
  await b.close()
  process.exit(falhou ? 1 : 0)
}
