import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

const SITE = 'https://seulegadoseguro.com.br/'

/**
 * sitemap.xml gerado no BUILD, e nao guardado em public/.
 *
 * ⚠️ O lastmod sai do ULTIMO COMMIT QUE TOCOU O CONTEUDO (src, index.html,
 * public), nao da hora do build. Um lastmod que muda a cada build mente: diz
 * "mudou" para um rebuild que nao mudou nada, e crawler que leva bolo algumas
 * vezes para de olhar o campo. Assinar uma data significa que a data significa
 * alguma coisa.
 *
 * E por isso ele NAO fica em public/: la seria um arquivo estatico com data
 * escrita a mao, que envelhece calada. Data escrita e data que mente amanha.
 *
 * ⚠️ AS ANCORAS FICAM DE FORA, e e escolha, nao esquecimento. #para-quem e
 * #produtos nao sao URLs para buscador: o fragmento nem chega ao servidor, e o
 * Google descarta fragmento em sitemap. Lista-las nao traria nenhuma pagina a
 * mais para o indice — traria cinco linhas de ruido afirmando paginas que nao
 * existem. O site e UMA pagina, e o sitemap diz isso.
 */
function sitemap () {
  return {
    name: 'sitemap',
    apply: 'build',
    generateBundle () {
      let data
      try {
        data = execSync('git log -1 --format=%cI -- src index.html public', { encoding: 'utf8' }).trim()
      } catch { data = '' }
      const lastmod = (data || new Date().toISOString()).slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sitemap()],
  base: '/',
})
