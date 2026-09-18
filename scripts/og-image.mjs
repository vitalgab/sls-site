/**
 * Gera public/assets/og-image.png, 1200x630 — o cartao que o WhatsApp, o
 * LinkedIn e o Facebook mostram quando alguem manda o link.
 *
 *   node scripts/og-image.mjs
 *
 * ⚠️ RENDERIZADO NO NAVEGADOR, NAO DESENHADO COM PIL, e a escolha e de marca:
 * assim a tipografia e a Montserrat de verdade, a mesma que o site carrega, com
 * o mesmo peso e o mesmo tracking. Compor com fonte de sistema daria um cartao
 * parecido com o site — e parecido, numa marca, e errado.
 *
 * O logo entra pela TINTA, nao pelo arquivo: o PNG tem 3125x1875 com a marca
 * ocupando 2917x443 no meio: centrar o arquivo deixaria a marca fora do centro
 * optico. Recorte medido pelo canal alfa.
 */
import { chromium } from 'playwright'
import { writeFileSync, readFileSync } from 'node:fs'
import { opcoesNavegador } from './referencia-desktop.mjs'

const MARGEM = 72          // piso do briefing e 60; 72 da folga a mais
const logo64 = readFileSync('/tmp/logo-tinta.png').toString('base64')

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;600&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px}
  body{
    background:#003A70; color:#fff;
    font-family:'Montserrat',sans-serif;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:${MARGEM}px; gap:44px; text-align:center;
  }
  img{width:620px; height:auto; display:block}
  p{font-weight:300; font-size:40px; line-height:1.35; max-width:900px}
  span{
    font-weight:600; font-size:23px; letter-spacing:3.2px;
    text-transform:uppercase; color:#C9A84C;
  }
  hr{width:120px; height:1px; border:0; background:rgba(201,168,76,.5)}
</style></head><body>
  <img src="data:image/png;base64,${logo64}" alt="">
  <p>Corretora de seguros para quem<br>constrói um legado</p>
  <hr>
  <span>seulegadoseguro.com.br</span>
</body></html>`

const b = await chromium.launch(opcoesNavegador())
const c = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const p = await c.newPage()
await p.setContent(html, { waitUntil: 'networkidle' })
await p.evaluate(() => document.fonts.ready)
await p.waitForTimeout(400)
writeFileSync('public/assets/og-image.png', await p.screenshot())
await b.close()
console.log('public/assets/og-image.png gravado')
