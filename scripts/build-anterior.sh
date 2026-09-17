#!/usr/bin/env bash
# Constroi o commit ANTERIOR num worktree e serve em 127.0.0.1:8098, no mesmo
# caminho da producao. E a referencia do diff de desktop do smoke.
#
# Por que construir de novo em vez de guardar hashes no repositorio: hash de
# pixel nao atravessa maquina. A rasterizacao de fonte do runner do CI difere da
# desta caixa o bastante para "mudar" 693 de 2576 blocos numa alteracao que nao
# tocou o desktop. Os dois lados tem de nascer no mesmo lugar.
set -euo pipefail

REF="${1:-HEAD~1}"
DIR=.anterior

git rev-parse --verify "$REF^{commit}" > /dev/null

rm -rf "$DIR" .servir-anterior
git worktree prune
git worktree add --detach "$DIR" "$REF" > /dev/null
echo "build anterior: $(git -C "$DIR" rev-parse --short HEAD) ($REF)"

# node_modules por link so vale se as dependencias forem as MESMAS. Se o lock
# mudou entre os dois commits, o link serviria a arvore errada em silencio.
if git diff --quiet "$REF" HEAD -- package.json package-lock.json; then
  ln -s "$PWD/node_modules" "$DIR/node_modules"
else
  echo "package-lock mudou entre $REF e HEAD: npm ci no worktree"
  (cd "$DIR" && npm ci --silent)
fi

(cd "$DIR" && npx vite build --logLevel warn)

# ⚠️ A BASE VEM DO COMMIT ANTERIOR, NAO DA ATUAL. Na troca de '/sls-site/' para
# '/' os dois lados da comparacao tem base DIFERENTE: o build de tras so
# funciona servido no caminho dele. Assumir a base da arvore de hoje quebraria a
# guarda de desktop por CAMINHO — e um vermelho desses se le como regressao de
# pixel, que e a leitura errada.
BASE_ANT=$(grep -o "base: *'[^']*'" "$DIR/vite.config.js" | sed "s/.*'\(.*\)'/\1/")
BASE_ANT=${BASE_ANT:-/}
SUB=${BASE_ANT#/}; SUB=${SUB%/}
if [ -n "$SUB" ]; then
  mkdir -p ".servir-anterior/$SUB"
  cp -r "$DIR/dist/." ".servir-anterior/$SUB/"
else
  mkdir -p .servir-anterior
  cp -r "$DIR/dist/." .servir-anterior/
fi
URL="http://127.0.0.1:8098${BASE_ANT}"
(cd .servir-anterior && nohup python3 -m http.server 8098 --bind 127.0.0.1 > /tmp/http-anterior.log 2>&1 < /dev/null &)

for _ in $(seq 1 40); do
  if curl -sf -o /dev/null "$URL"; then
    echo "anterior de pé em $URL (base do commit: $BASE_ANT)"
    [ -n "${GITHUB_OUTPUT:-}" ] && echo "url=$URL" >> "$GITHUB_OUTPUT"
    exit 0
  fi
  sleep 1
done
echo "o servidor do build anterior não respondeu em 40s"
cat /tmp/http-anterior.log
exit 1
