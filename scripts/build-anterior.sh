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

mkdir -p .servir-anterior/sls-site
cp -r "$DIR/dist/." .servir-anterior/sls-site/
(cd .servir-anterior && nohup python3 -m http.server 8098 --bind 127.0.0.1 > /tmp/http-anterior.log 2>&1 < /dev/null &)

for _ in $(seq 1 40); do
  if curl -sf -o /dev/null http://127.0.0.1:8098/sls-site/; then
    echo "anterior de pé em http://127.0.0.1:8098/sls-site/"; exit 0
  fi
  sleep 1
done
echo "o servidor do build anterior não respondeu em 40s"
cat /tmp/http-anterior.log
exit 1
