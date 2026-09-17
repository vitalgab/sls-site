#!/usr/bin/env python3
"""Prepara a foto do Gabriel para a faixa da citacao.

Entrada:  gabriel 2.png   (843x1264, upload, NAO fica no repo)
Saida:    public/assets/gabriel.webp   (quadrado, fundo azul original)

Tres coisas acontecem aqui, nesta ordem:

  a) MARCA D'AGUA. A estrela de 4 pontas do Gemini esta sobre a manga do blazer,
     nao sobre o fundo — recortar nao resolveria. O metodo e o mesmo das
     personas, e o codigo tambem: `tirar_marca` vem de personas.py, importado, em
     vez de copiado. Nivel do inpaint + ALTA FREQUENCIA transplantada de um
     pedaco da MESMA peca de roupa. A conferencia tambem e a de la: o contraste
     da forma de estrela contra o anel em volta tem de CAIR pelo menos 75%.

  b) ENQUADRAMENTO. Quadrado, do topo da cabeca ate os ombros, rosto centrado.
     A linha dos ombros sai da silhueta: e a primeira linha em que a largura da
     pessoa passa de 1,6x a largura da cabeca. O centro horizontal sai da regiao
     de PELE (YCrCb), nao da silhueta — de bracos cruzados, a silhueta e mais
     larga de um lado e puxaria o rosto para fora do centro.

  c) O FUNDO FICA. Diferente das personas, aqui nao se recorta a pessoa: o azul
     original e o fundo do retrato, e a faixa e navy.

CONFERENCIAS, e elas podem matar o script (exit 3):
  - a estrela tem de APARECER no ponto indicado antes de ser tirada
  - o contraste dela tem de cair >= 75% depois
  - o recorte tem de caber na imagem e sair quadrado

Uso:  python3 scripts/gabriel.py [--verificar]
"""
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from personas import CONTRASTE_MIN_ANTES, QUEDA_MINIMA, contraste, tirar_marca  # noqa: E402

# O original nao fica no repo — 1,3 MB que so servem para reprocessar. Ele
# continua no historico; para trazer de volta:
#   git show c11035f:'gabriel 2.png' > 'gabriel 2.png'
FONTE = 'gabriel 2.png'
SAIDA = 'public/assets/gabriel.webp'
MARCA = (726, 1144)      # centro da estrela, medido no zoom
LADO_MIN = 480
MARGEM_TOPO = 0.06       # folga acima da cabeca, em fracao do lado
LADO_X_CABECA = 2.6      # o lado do quadrado, em larguras de cabeca
OMBRO_X_CABECA = 2.0     # so para CONFERIR: os ombros tem de cair dentro


def silhueta(bgr):
    """Mascara da pessoa, por distancia ao azul do fundo (amostrado nos cantos)."""
    h, w = bgr.shape[:2]
    cantos = np.concatenate([
        bgr[0:40, 0:40].reshape(-1, 3), bgr[0:40, w - 40:w].reshape(-1, 3),
        bgr[h - 40:h, 0:40].reshape(-1, 3), bgr[h - 40:h, w - 40:w].reshape(-1, 3),
    ]).astype(np.float32)
    fundo = np.median(cantos, axis=0)
    d = np.linalg.norm(bgr.astype(np.float32) - fundo, axis=2)
    m = (d > 42).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    if n < 2:
        return None, fundo
    maior = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return (lab == maior), fundo


def centro_do_rosto(bgr, pessoa):
    """x mediano da maior regiao de pele da metade de cima."""
    h, w = bgr.shape[:2]
    ycc = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
    Cr, Cb = ycc[..., 1], ycc[..., 2]
    pele = ((Cr >= 133) & (Cr <= 175) & (Cb >= 77) & (Cb <= 130) & pessoa).astype(np.uint8)
    pele = cv2.morphologyEx(pele, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    pele = cv2.morphologyEx(pele, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    n, lab, stats, cent = cv2.connectedComponentsWithStats(pele, 8)
    cand = [i for i in range(1, n) if cent[i][1] < h * 0.55]
    if not cand:
        return None
    i = max(cand, key=lambda k: stats[k, cv2.CC_STAT_AREA])
    return float(cent[i][0])


def enquadrar(bgr):
    """(x0, y0, lado) do quadrado: topo da cabeca ate os ombros, rosto no centro.

    O lado sai de uma RAZAO com a largura da cabeca, nao de varrer a silhueta
    procurando os ombros. Tentei varrer primeiro: o limiar que da o enquadramento
    certo cai bem no trecho em que a silhueta cresce mais depressa — entre 2,4x e
    2,8x da cabeca a linha encontrada pula de y=610 para y=771. Constante posta
    num trecho instavel e constante que a proxima foto desmente.

    A varredura fica, mas so como CONFERENCIA: os ombros tem de cair dentro do
    quadrado escolhido.
    """
    h, w = bgr.shape[:2]
    pessoa, _ = silhueta(bgr)
    if pessoa is None:
        print('INSTRUMENTO: nao achei a pessoa contra o fundo', file=sys.stderr)
        sys.exit(3)
    ys, _ = np.where(pessoa)
    topo = int(ys.min())
    larguras = np.array([int(pessoa[y].sum()) for y in range(topo, h)])
    cabeca = float(np.median(larguras[int(0.05 * len(larguras)):int(0.18 * len(larguras))]))
    ombro = next((topo + i for i, v in enumerate(larguras) if v >= OMBRO_X_CABECA * cabeca), None)
    if ombro is None:
        print('INSTRUMENTO: nao achei a linha dos ombros', file=sys.stderr)
        sys.exit(3)
    cx = centro_do_rosto(bgr, pessoa)
    if cx is None:
        print('INSTRUMENTO: nao achei o rosto', file=sys.stderr)
        sys.exit(3)
    lado = int(round(LADO_X_CABECA * cabeca))
    y0 = int(round(topo - MARGEM_TOPO * lado))
    x0 = int(round(cx - lado / 2))
    # encostar nas bordas em vez de sair delas: mover e melhor do que encolher,
    # porque encolher mudaria o enquadramento pedido
    x0 = max(0, min(x0, w - lado)); y0 = max(0, min(y0, h - lado))
    if lado > min(w, h):
        print('INSTRUMENTO: o quadrado (%d) nao cabe em %dx%d' % (lado, w, h), file=sys.stderr)
        sys.exit(3)
    if not (y0 < ombro < y0 + lado):
        print('INSTRUMENTO: os ombros (y=%d) ficaram fora do quadrado y[%d..%d]'
              % (ombro, y0, y0 + lado), file=sys.stderr)
        sys.exit(3)
    if not (x0 < cx < x0 + lado):
        print('INSTRUMENTO: o rosto (x=%.0f) ficou fora do quadrado x[%d..%d]'
              % (cx, x0, x0 + lado), file=sys.stderr)
        sys.exit(3)
    return x0, y0, lado, topo, ombro, cabeca, cx


def main():
    verificar = '--verificar' in sys.argv
    sc = os.environ.get('SC', '/tmp')
    im = cv2.imread(FONTE)
    if im is None:
        print('INSTRUMENTO: nao abriu ' + FONTE, file=sys.stderr)
        print("  o original nao fica no repo. Para trazer de volta:\n"
              "    git show c11035f:'gabriel 2.png' > 'gabriel 2.png'", file=sys.stderr)
        sys.exit(3)
    cx, cy = MARCA

    antes = contraste(im, cx, cy)
    if antes < CONTRASTE_MIN_ANTES:
        print('INSTRUMENTO: sem assinatura de estrela em (%d,%d) (contraste %.2f < %.2f)'
              % (cx, cy, antes, CONTRASTE_MIN_ANTES), file=sys.stderr)
        sys.exit(3)
    limpo, doador = tirar_marca(im, cx, cy)
    depois = contraste(limpo, cx, cy)
    ok = abs(depois) <= (1 - QUEDA_MINIMA) * antes

    x0, y0, lado, topo, ombro, cabeca, rosto_x = enquadrar(limpo)
    quad = limpo[y0:y0 + lado, x0:x0 + lado]
    if quad.shape[0] != quad.shape[1]:
        print('INSTRUMENTO: recorte saiu %dx%d, nao quadrado' % quad.shape[:2], file=sys.stderr)
        sys.exit(3)
    if lado < LADO_MIN:
        print('INSTRUMENTO: lado %d < %d' % (lado, LADO_MIN), file=sys.stderr)
        sys.exit(3)

    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    cv2.imwrite(SAIDA, quad, [cv2.IMWRITE_WEBP_QUALITY, 90])
    print('%s marca (%d,%d) contraste %6.2f -> %5.2f (queda %3.0f%%) | doador %s'
          % ('✓' if ok else '✗', cx, cy, antes, depois, 100 * (1 - abs(depois) / antes), doador))
    print('  cabeca %.0fpx, topo y=%d, ombros y=%d, rosto x=%.0f' % (cabeca, topo, ombro, rosto_x))
    print('  quadrado %dx%d em x[%d..%d] y[%d..%d] | %d kB'
          % (lado, lado, x0, x0 + lado, y0, y0 + lado, os.path.getsize(SAIDA) // 1024))

    if verificar:
        z = lambda img: cv2.resize(img[cy - 90:cy + 90, cx - 90:cx + 90], (540, 540),
                                   interpolation=cv2.INTER_NEAREST)
        cv2.imwrite('%s/gab-marca-antes-depois.png' % sc, np.hstack([z(im), z(limpo)]))
        cv2.imwrite('%s/gab-quadrado.png' % sc, quad)
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
