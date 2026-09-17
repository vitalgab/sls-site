# Seu Legado Seguro — site institucional

Site estático em React + Vite, publicado em <https://vitalgab.github.io/sls-site/>.

## Deploy: só pela `main`

**Não existe deploy manual.** Empurrar na `main` dispara
`.github/workflows/deploy.yml`, que roda lint, build, o smoke e os impostores, e
só então publica o `dist` na branch `gh-pages`. Para republicar sem commit novo:
**Actions → Deploy → Run workflow**.

`npm run deploy` foi desarmado de propósito e só imprime essa regra.

Por que: em 14/07/2026 o site foi publicado a partir de uma cópia local que
nunca foi commitada. A `gh-pages` passou a servir um site que não saía de nenhum
commit da `main`, e o código-fonte se perdeu — precisou ser reconstruído a
partir do bundle minificado. Enquanto publicar for um comando que qualquer
máquina roda, isso se repete.

Se um deploy quebrar produção, o retorno é a branch `backup-gh-pages-20260714`,
que guarda o estado de 14/07/2026:

```bash
git push origin backup-gh-pages-20260714:gh-pages --force
```

## Rodar local

```bash
npm install
npm run dev      # http://localhost:5173/sls-site/  (o /sls-site/ é obrigatório)
```

O `base` do Vite é `/sls-site/`, para casar com o caminho do GitHub Pages. Sem
ele na URL, o dev server devolve 404.

## Testes

```bash
npm run build
mkdir -p .servir/sls-site && cp -r dist/. .servir/sls-site/
(cd .servir && python3 -m http.server 8099 --bind 127.0.0.1 &)

npm run anterior                         # constrói o commit anterior em :8098
npm run smoke                            # tem de sair 0
MODO=impostor-css npm run smoke          # tem de sair 1 — o impostor precisa morder

ANTERIOR=nenhum SMOKE_URL=https://vitalgab.github.io/sls-site/ npm run smoke
```

`npm run anterior` existe por causa da guarda de desktop, que compara a página
inteira **pixel a pixel** com o build do commit anterior em 1440 e 1280. A
referência é construída na hora, na mesma máquina, e não guardada em arquivo:
hash de pixel não atravessa máquina. A primeira versão gravava os hashes no
repositório e o runner do CI reprovou com 693 de 2576 blocos "mudados" numa
alteração que não tocou uma linha do desktop — as fontes carregam nos dois
lugares, o que difere é a rasterização. É o mesmo motivo pelo qual um deploy já
caiu por 2px de largura de rótulo.

No smoke de produção não existe par para comparar, e aí `ANTERIOR=nenhum`
**desliga a guarda imprimindo que desligou**. Guarda que se cala ao ser pulada é
guarda que ninguém percebe que parou.

`scripts/smoke.mjs` mede o site servido em 1440px e 390px: a Montserrat
realmente carregada, tipografia de display sem serifa e sem itálico, personas e
logos com `naturalWidth > 0`, contatos em todo `href`, os dois formulários
acionados por clique real, e nenhuma rolagem lateral.

Ele tem 26 modos impostores (`MODO=impostor-*`), e cada um muta o **artefato
servido** — a folha de estilo ou o bundle, interceptados na rede — e precisa
derrubar o smoke. O CI roda todos: se algum passar verde, o deploy para, porque
suíte que não sabe reprovar não prova nada. Modo desconhecido sai **3**, e
mutação que não acha alvo também, para "não mordeu" nunca se confundir com "não
rodou" — e o CI só aceita **exit 1** como mordida, porque aceitar o 3 era deixar
o próprio guardião cair na confusão que ele denuncia.

`scripts/paridade.mjs` compara o que está publicado com o build local, seção a
seção (innerText, computed styles, hrefs, imagens, dimensões e diff de pixels).
Foi o que provou a reconstrução do código-fonte perdido.

## Fotos e logos

- `assets-fonte/` — os JPGs originais das personas. **Não** são publicados.
- `scripts/personas.py` — reprocessa as fotos: tira a marca d'água, recorta a
  pessoa e exporta WebP com alfa em `public/assets/`. Dependências em
  `scripts/requirements-personas.txt`.
- `public/seguradoras/` — logos oficiais das parceiras. A procedência de cada
  arquivo está em [`FONTES.md`](public/seguradoras/FONTES.md). Nenhum logo foi
  redesenhado, vetorizado de memória ou gerado.

## Estrutura

```
index.html              entrada, meta tags e JSON-LD
src/contato.js          fonte única de WhatsApp, telefone e SUSEP
src/index.css           tokens da marca e tipografia de display
src/components/         uma seção por arquivo, na ordem em que aparecem
public/                 tudo que é servido como está
```
