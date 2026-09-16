#!/usr/bin/env python3
"""Prepara as fotos das personas para o site.

Entrada:  assets-fonte/persona-*.jpg    (originais, NAO publicados)
Saida:    public/assets/persona-*.webp  (recortadas e transparentes, publicadas)

Tres defeitos na origem (fotos geradas, 1224x~1203):
  1. cantos superiores brancos — a foto ja vinha com o arredondamento queimado
  2. o azul do fundo da foto nao e o azul do cartao, entao parece imagem colada
  3. marca d'agua do Gemini (estrela de 4 pontas) SOBRE a roupa da pessoa

Ordem do que e feito:

  a) MARCA D'AGUA. Ela esta sobre a pessoa, entao tirar o fundo nao resolve.
     A posicao e FIXA: o gerador carimba em (w-120, h-104). Tentei achar por
     casamento de padrao e por pico de residuo; as duas erraram na foto do
     medico, porque jaleco branco faz qualquer dobra ter residuo alto.
     Medi a marca antes de escolher como remove-la: o desvio padrao da alta
     frequencia cai de 13,9 para 8,9 (advogado), 11,9 para 3,0 (RC) e 3,0 para
     0,3 (medico) dentro dela. Isso e alfa de 0,36 / 0,75 / 0,90 — ou seja, a
     trama por baixo foi destruida, nao apenas clareada, e NAO da para recuperar
     invertendo a composicao. cv2.inpaint e o FSR do xphoto tiram a estrela mas
     deixam uma mancha lisa onde havia trama, visivel em zoom.
     O que funciona: nivel do inpaint + ALTA FREQUENCIA transplantada de um
     pedaco da MESMA peca de roupa, escolhido por ter trama forte e nivel
     parecido. A borda e uma pena gaussiana, e fora dela o pixel original fica
     intacto.

  b) RECORTE da pessoa com rembg/u2net.

  c) DESCONTAMINACAO da franja. Pixel de borda e mistura de pessoa com o azul do
     fundo; sem desfazer a mistura sobra auréola azul quando o fundo do cartao
     muda. Estima-se a cor do fundo local e resolve-se F = (C - (1-a)B)/a.

  d) WebP com alfa. O fundo passa a ser CSS, no cartao, na cor da marca.

CONFERENCIA, e ela pode matar o script:
  - ANTES: a estrela tem de aparecer no ponto fixo (contraste minimo). Se nao
    aparecer, a mascara esta no lugar errado e sai exit 3 — melhor morrer do que
    entregar foto marcada.
  - DEPOIS: o contraste tem de cair abaixo do limite.

Uso:  python3 scripts/personas.py [--verificar]
"""
import sys, os
import numpy as np
import cv2
from rembg import remove, new_session

FONTE, DESTINO = 'assets-fonte', 'public/assets'
FOTOS = ['persona-medico', 'persona-advogado', 'persona-rc-profissional']

OFFSET_MARCA = (120, 104)   # do canto inferior direito
TAM_ESTRELA = 100           # folgado: a estrela mede ~56px
RAIO_OBRA = 66              # janela reconstruida
CONTRASTE_MIN_ANTES = 2.0   # abaixo disso a mascara nao esta sobre a marca
# O DEPOIS e relativo de proposito. Limite absoluto mede a coisa errada: naquele
# ponto a roupa tem sombreado proprio, entao mesmo com a estrela totalmente fora
# sobra contraste (3,4 no advogado, -5,3 no RC — o segundo ate negativo). O que
# prova que a marca saiu e a QUEDA da assinatura, nao um numero bonito.
QUEDA_MINIMA = 0.75         # |depois| tem de ser <= 25% do antes


def molde_estrela(tam, k=2.6):
    """Estrela de 4 pontas de lados concavos: |x|^(1/k) + |y|^(1/k) <= 1."""
    r = tam // 2
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1].astype(np.float32)
    with np.errstate(invalid='ignore'):
        d = np.power(np.abs(xx) / r, 1.0 / k) + np.power(np.abs(yy) / r, 1.0 / k)
    return np.nan_to_num(d <= 1.0).astype(np.float32)


def contraste(im, cx, cy, tam=56):
    """Quanto a forma de estrela se destaca do anel em volta, em brilho."""
    j = im[cy - 80:cy + 80, cx - 80:cx + 80].astype(np.float32).mean(axis=2)
    nuc = np.zeros(j.shape, np.float32)
    t = molde_estrela(tam)
    r = t.shape[0] // 2
    nuc[80 - r:80 - r + t.shape[0], 80 - r:80 - r + t.shape[1]] = t
    nuc = cv2.erode(nuc, np.ones((7, 7), np.uint8))
    anel = cv2.dilate(nuc, np.ones((37, 37), np.uint8)) - cv2.dilate(nuc, np.ones((17, 17), np.uint8))
    return float(j[nuc > 0].mean() - j[anel > 0].mean())


def tirar_marca(im, cx, cy):
    h, w = im.shape[:2]
    R = RAIO_OBRA
    mask = np.zeros((h, w), np.uint8)
    t = (molde_estrela(TAM_ESTRELA) * 255).astype(np.uint8)
    r = t.shape[0] // 2
    mask[cy - r:cy - r + t.shape[0], cx - r:cx - r + t.shape[1]] = t
    mask = cv2.dilate(mask, np.ones((13, 13), np.uint8))
    base = cv2.inpaint(im, mask, 16, cv2.INPAINT_TELEA).astype(np.float32)

    alvo = base[cy - R:cy + R, cx - R:cx + R]
    melhor = None
    for dy in (-200, -160, 160, 200):
        for dx in (-220, -180, 180, 220):
            py, px = cy + dy, cx + dx
            if py - R < 0 or py + R > h or px - R < 0 or px + R > w:
                continue
            if mask[py - R:py + R, px - R:px + R].any():
                continue
            d = im[py - R:py + R, px - R:px + R].astype(np.float32)
            hf = d - cv2.blur(d, (9, 9))
            nota = hf.std() - 0.25 * abs(d.mean() - alvo.mean())
            if melhor is None or nota > melhor[0]:
                melhor = (nota, py, px, hf)
    if melhor is None:
        print('INSTRUMENTO: nenhum doador de textura disponivel', file=sys.stderr)
        sys.exit(3)
    _, py, px, hf = melhor

    pena = cv2.GaussianBlur((mask[cy - R:cy + R, cx - R:cx + R] / 255.0).astype(np.float32), (0, 0), 6)[..., None]
    janela = im[cy - R:cy + R, cx - R:cx + R].astype(np.float32)
    novo = janela * (1 - pena) + (base[cy - R:cy + R, cx - R:cx + R] + hf) * pena
    out = im.copy()
    out[cy - R:cy + R, cx - R:cx + R] = np.clip(novo, 0, 255).astype(np.uint8)
    return out, (px, py)


def descontaminar(bgr, alpha):
    """Desfaz a mistura com o fundo na franja: F = (C - (1-a)B)/a.

    B vem de um borrao da propria imagem restrito ao fundo puro (a==0), entao
    acompanha o degrade em vez de assumir cor chapada.
    """
    a = (alpha.astype(np.float32) / 255.0)[..., None]
    fundo = (alpha < 8).astype(np.float32)
    if fundo.sum() < 1000:
        return bgr
    soma = cv2.blur(bgr.astype(np.float32) * fundo[..., None], (121, 121))
    peso = cv2.blur(fundo, (121, 121))[..., None]
    B = soma / np.maximum(peso, 1e-4)
    C = bgr.astype(np.float32)
    F = np.where(a > 0.02, (C - (1 - a) * B) / np.maximum(a, 0.02), C)
    franja = ((alpha > 0) & (alpha < 250))[..., None]   # miolo opaco fica intacto
    return np.where(franja, np.clip(F, 0, 255), C).astype(np.uint8)


def main():
    verificar = '--verificar' in sys.argv
    sc = os.environ.get('SC', '/tmp')
    sess = new_session('u2net')
    os.makedirs(DESTINO, exist_ok=True)
    falhou = False
    for nome in FOTOS:
        src = os.path.join(FONTE, nome + '.jpg')
        im = cv2.imread(src)
        if im is None:
            print('INSTRUMENTO: nao abriu ' + src, file=sys.stderr)
            sys.exit(3)
        h, w = im.shape[:2]
        cx, cy = w - OFFSET_MARCA[0], h - OFFSET_MARCA[1]

        antes = contraste(im, cx, cy)
        if antes < CONTRASTE_MIN_ANTES:
            print('INSTRUMENTO: sem assinatura de estrela em (%d,%d) de %s (contraste %.2f < %.2f)'
                  % (cx, cy, nome, antes, CONTRASTE_MIN_ANTES), file=sys.stderr)
            sys.exit(3)

        limpo, doador = tirar_marca(im, cx, cy)
        depois = contraste(limpo, cx, cy)
        ok = abs(depois) <= (1 - QUEDA_MINIMA) * antes
        falhou = falhou or not ok

        rgba = np.asarray(remove(
            cv2.cvtColor(limpo, cv2.COLOR_BGR2RGB), session=sess,
            alpha_matting=True, alpha_matting_foreground_threshold=250,
            alpha_matting_background_threshold=15, alpha_matting_erode_size=8))
        alpha = rgba[..., 3]
        bgr = descontaminar(cv2.cvtColor(rgba[..., :3], cv2.COLOR_RGB2BGR), alpha)

        saida = os.path.join(DESTINO, nome + '.webp')
        cv2.imwrite(saida, np.dstack([bgr, alpha]), [cv2.IMWRITE_WEBP_QUALITY, 92])
        print('%s %-26s marca (%d,%d) contraste %6.2f -> %5.2f (queda %3.0f%%) | doador %s | alfa %d%% opaco / %d%% vazio | %d kB'
              % ('✓' if ok else '✗', nome, cx, cy, antes, depois,
                 100 * (1 - abs(depois) / antes), doador,
                 100 * int((alpha > 200).sum()) // (w * h),
                 100 * int((alpha < 8).sum()) // (w * h), os.path.getsize(saida) // 1024))

        if verificar:
            z = lambda img: cv2.resize(img[cy - 100:cy + 100, cx - 100:cx + 100], (600, 600),
                                       interpolation=cv2.INTER_NEAREST)
            cv2.imwrite('%s/ver-%s-marca.png' % (sc, nome), np.hstack([z(im), z(limpo)]))
            rgba_out = np.dstack([bgr, alpha])
            for canto, (qx, qy) in [('sup-esq', (0, 0)), ('sup-dir', (w - 200, 0))]:
                cv2.imwrite('%s/ver-%s-canto-%s.png' % (sc, nome, canto),
                            cv2.resize(rgba_out[qy:qy + 200, qx:qx + 200], (500, 500),
                                       interpolation=cv2.INTER_NEAREST))
    sys.exit(1 if falhou else 0)


if __name__ == '__main__':
    main()
