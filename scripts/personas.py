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

# `marca` diz se AQUELA foto carrega a estrela do Gemini, e a afirmacao e
# verificada nos DOIS sentidos: com True o script exige achar a estrela, com
# False exige NAO achar. "Nao tem marca" nunca e premissa — e medicao.
#
# A foto do CLT veio por upload em public/assets/persona-clt-original.jpeg e e
# apagada do repo no mesmo commit que publica o .webp. Para reprocessar:
#   git show baae5ad:public/assets/persona-clt-original.jpeg > assets-fonte/persona-clt.jpeg
FOTOS = [
    {'nome': 'persona-medico', 'src': FONTE + '/persona-medico.jpg', 'marca': True},
    {'nome': 'persona-advogado', 'src': FONTE + '/persona-advogado.jpg', 'marca': True},
    {'nome': 'persona-rc-profissional', 'src': FONTE + '/persona-rc-profissional.jpg', 'marca': True},
    {'nome': 'persona-clt', 'src': DESTINO + '/persona-clt-original.jpeg', 'marca': False,
     'enquadrar': True,
     'restaurar': 'git show baae5ad:public/assets/persona-clt-original.jpeg'
                  ' > public/assets/persona-clt-original.jpeg'},
]

OFFSET_MARCA = (120, 104)   # do canto inferior direito, no gerador de 1224px
# A foto do CLT saiu de outro gerador, 2048x2048. O carimbo podia ter vindo no
# mesmo OFFSET absoluto ou na mesma posicao PROPORCIONAL — os dois sao medidos.
TAM_GERADOR_ANTIGO = (1224, 1203)
# O cartao mostra a foto com no maximo ~300px de altura. As tres primeiras ja
# vinham em 1224; a do CLT veio em 2048 e sairia com 354 kB para nada. Reduzir so
# quem passa do teto mantem as tres antigas byte a byte iguais — foi assim que
# conferi que a reestruturacao deste script nao mudou o resultado delas.
MAX_LADO = 1224

# `enquadrar` corta o VAZIO das laterais. As tres primeiras ja vinham com a
# pessoa ocupando a largura toda; na do CLT ela ocupa 68% do quadro, e com
# object-fit: contain quem manda no tamanho e a LARGURA do cartao — o quadro
# vazio encolheria a pessoa. Sobra a mesma margem relativa das outras (~3%).
MARGEM_ENQUADRE = 0.03
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


def pontos_candidatos(w, h):
    """Onde a estrela pode estar: offset absoluto do gerador antigo e a mesma
    posicao em PROPORCAO, para o caso de a foto ter vindo em outra escala."""
    aw, ah = TAM_GERADOR_ANTIGO
    pts = [(w - OFFSET_MARCA[0], h - OFFSET_MARCA[1])]
    prop = (int(round(w * (1 - OFFSET_MARCA[0] / aw))), int(round(h * (1 - OFFSET_MARCA[1] / ah))))
    if prop != pts[0]:
        pts.append(prop)
    return [(x, y) for x, y in pts if 90 <= x < w - 90 and 90 <= y < h - 90]


def acusa_estrela(im, pontos):
    """(acusou, medidas). Mesmo detector das fotos marcadas, usado ao contrario."""
    med = [(x, y, contraste(im, x, y)) for x, y in pontos]
    return any(c >= CONTRASTE_MIN_ANTES for _, _, c in med), med


def main():
    verificar = '--verificar' in sys.argv
    sc = os.environ.get('SC', '/tmp')
    # CONTROLE NEGATIVO do detector de "sem marca". Dizer que uma foto nao tem
    # estrela so vale se o mesmo detector souber ACUSAR uma que tem. Sem isto,
    # bastaria o detector estar quebrado para toda foto passar como limpa.
    if any(not f['marca'] for f in FOTOS):
        cobaia = next(f for f in FOTOS if f['marca'])
        im_c = cv2.imread(cobaia['src'])
        if im_c is None:
            print('INSTRUMENTO: nao abriu a cobaia ' + cobaia['src'], file=sys.stderr)
            sys.exit(3)
        hc, wc = im_c.shape[:2]
        acusou, med = acusa_estrela(im_c, pontos_candidatos(wc, hc))
        if not acusou:
            print('INSTRUMENTO: o detector NAO acusou %s, que tem marca — o veredito '
                  '"sem marca" das outras nao vale nada: %s'
                  % (cobaia['nome'], ', '.join('(%d,%d)=%.2f' % m for m in med)), file=sys.stderr)
            sys.exit(3)
        print('controle: o detector acusa %s (com marca): %s'
              % (cobaia['nome'], ', '.join('(%d,%d)=%.2f' % m for m in med)))

    sess = new_session('u2net')
    os.makedirs(DESTINO, exist_ok=True)
    falhou = False
    for foto in FOTOS:
        nome, src = foto['nome'], foto['src']
        im = cv2.imread(src)
        if im is None:
            print('INSTRUMENTO: nao abriu ' + src, file=sys.stderr)
            if foto.get('restaurar'):
                print('  o original nao fica no repo. Para trazer de volta:\n    '
                      + foto['restaurar'], file=sys.stderr)
            sys.exit(3)
        h, w = im.shape[:2]
        pontos = pontos_candidatos(w, h)
        cx, cy = pontos[0]

        if foto['marca']:
            antes = contraste(im, cx, cy)
            if antes < CONTRASTE_MIN_ANTES:
                print('INSTRUMENTO: sem assinatura de estrela em (%d,%d) de %s (contraste %.2f < %.2f)'
                      % (cx, cy, nome, antes, CONTRASTE_MIN_ANTES), file=sys.stderr)
                sys.exit(3)
            limpo, doador = tirar_marca(im, cx, cy)
            depois = contraste(limpo, cx, cy)
            ok = abs(depois) <= (1 - QUEDA_MINIMA) * antes
            falhou = falhou or not ok
            relato = ('marca (%d,%d) contraste %6.2f -> %5.2f (queda %3.0f%%) | doador %s'
                      % (cx, cy, antes, depois, 100 * (1 - abs(depois) / antes), doador))
        else:
            # Declarada SEM marca: o script tem de PROVAR isso, nao aceitar.
            acusou, medidas = acusa_estrela(im, pontos)
            if acusou:
                print('INSTRUMENTO: %s foi declarada sem marca e o detector ACUSOU: %s'
                      % (nome, ', '.join('(%d,%d)=%.2f' % m for m in medidas)), file=sys.stderr)
                sys.exit(3)
            limpo, ok = im, True
            relato = ('sem marca, conferido em %d ponto(s): %s (limite %.2f)'
                      % (len(medidas), ', '.join('(%d,%d)=%.2f' % m for m in medidas), CONTRASTE_MIN_ANTES))

        rgba = np.asarray(remove(
            cv2.cvtColor(limpo, cv2.COLOR_BGR2RGB), session=sess,
            alpha_matting=True, alpha_matting_foreground_threshold=250,
            alpha_matting_background_threshold=15, alpha_matting_erode_size=8))
        alpha = rgba[..., 3]
        bgr = descontaminar(cv2.cvtColor(rgba[..., :3], cv2.COLOR_RGB2BGR), alpha)

        rgba_final = np.dstack([bgr, alpha])
        if foto.get('enquadrar'):
            xs = np.where((alpha > 128).any(axis=0))[0]
            if xs.size == 0:
                print('INSTRUMENTO: %s ficou sem pixel opaco — nada a enquadrar' % nome, file=sys.stderr)
                sys.exit(3)
            m = int(round(MARGEM_ENQUADRE * rgba_final.shape[1]))
            x0, x1 = max(0, int(xs.min()) - m), min(rgba_final.shape[1], int(xs.max()) + 1 + m)
            relato += ' | enquadrado x[%d..%d] de %d' % (x0, x1, rgba_final.shape[1])
            rgba_final = rgba_final[:, x0:x1]
        if max(rgba_final.shape[:2]) > MAX_LADO:
            e = MAX_LADO / max(rgba_final.shape[:2])
            rgba_final = cv2.resize(rgba_final, (int(round(rgba_final.shape[1] * e)),
                                                 int(round(rgba_final.shape[0] * e))),
                                    interpolation=cv2.INTER_AREA)
        saida = os.path.join(DESTINO, nome + '.webp')
        cv2.imwrite(saida, rgba_final, [cv2.IMWRITE_WEBP_QUALITY, 92])
        print('%s %-26s %s | alfa %d%% opaco / %d%% vazio | %d kB'
              % ('✓' if ok else '✗', nome, relato,
                 100 * int((alpha > 200).sum()) // (w * h),
                 100 * int((alpha < 8).sum()) // (w * h), os.path.getsize(saida) // 1024))

        if verificar:
            z = lambda img: cv2.resize(img[cy - 100:cy + 100, cx - 100:cx + 100], (600, 600),
                                       interpolation=cv2.INTER_NEAREST)
            cv2.imwrite('%s/ver-%s-marca.png' % (sc, nome), np.hstack([z(im), z(limpo)]))
            rgba_out = np.dstack([bgr, alpha])
            # ANTES x DEPOIS da franja do cabelo, que e onde a auréola azul
            # aparece: o depois vai COMPOSTO sobre o navy do cartao, porque e
            # assim que a foto e vista. Sobre xadrez a auréola some da vista.
            op = alpha > 128
            if op.any():
                ys, xs = np.where(op)
                topo = ys.min()
                faixa = (ys > topo + 40) & (ys < topo + int(0.42 * (ys.max() - topo)))
                if faixa.any():
                    for lado, xq in [('esq', xs[faixa].min()), ('dir', xs[faixa].max())]:
                        yq = int(np.median(ys[faixa]))
                        x0, y0 = max(0, int(xq) - 110), max(0, yq - 110)
                        antes_z = im[y0:y0 + 220, x0:x0 + 220]
                        a_ = (alpha[y0:y0 + 220, x0:x0 + 220] / 255.0)[..., None]
                        navy = np.full_like(antes_z, 0, np.float32)
                        navy[:] = (112, 58, 0)   # BGR do --navy #003A70
                        dep = bgr[y0:y0 + 220, x0:x0 + 220] * a_ + navy * (1 - a_)
                        z2 = lambda img: cv2.resize(np.clip(img, 0, 255).astype(np.uint8), (560, 560),
                                                    interpolation=cv2.INTER_NEAREST)
                        cv2.imwrite('%s/ver-%s-cabelo-%s.png' % (sc, nome, lado),
                                    np.hstack([z2(antes_z), z2(dep)]))
            for canto, (qx, qy) in [('sup-esq', (0, 0)), ('sup-dir', (w - 200, 0))]:
                cv2.imwrite('%s/ver-%s-canto-%s.png' % (sc, nome, canto),
                            cv2.resize(rgba_out[qy:qy + 200, qx:qx + 200], (500, 500),
                                       interpolation=cv2.INTER_NEAREST))
    sys.exit(1 if falhou else 0)


if __name__ == '__main__':
    main()
