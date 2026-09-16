# Procedência dos logos das seguradoras

Todos os arquivos deste diretório são o logo **oficial** da marca, baixado da fonte
indicada abaixo. Nenhum foi redesenhado, vetorizado de memória ou gerado por IA.
As cores são as do arquivo de origem.

Para conferir ou atualizar qualquer um: abra a URL de origem e baixe de novo.

| arquivo | marca | origem | licença informada na origem |
|---|---|---|---|
| `porto-seguro.svg` | Porto Seguro | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3APorto_2022.svg)<br>arquivo: File:Porto 2022.svg | Public domain |
| `sulamerica.svg` | SulAmérica | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ALogotipo_da_SulAm%C3%A9rica.svg)<br>arquivo: File:Logotipo da SulAmérica.svg | Public domain |
| `bradesco.svg` | Bradesco Seguros | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ALogotipo_do_Bradesco_Seguros.svg)<br>arquivo: File:Logotipo do Bradesco Seguros.svg | Public domain |
| `amil.svg` | Amil | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AAmil_logo.svg)<br>arquivo: File:Amil logo.svg | Public domain |
| `unimed.svg` | Unimed | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ALogotipo_da_Unimed_%282022%29.svg)<br>arquivo: File:Logotipo da Unimed (2022).svg | Public domain |
| `hapvida.svg` | Hapvida | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ALogotipo_da_Hapvida.svg)<br>arquivo: File:Logotipo da Hapvida.svg | Public domain |
| `azos.svg` | Azos | wordmark do cabeçalho de https://azos.com.br/ (SVG embutido na página, `viewBox 0 0 100 20`) | logo da própria empresa |
| `icatu.svg` | Icatu Seguros | https://portal.icatuseguros.com.br/assets/icons/logo_icatuseguros_horizontal.svg<br>o domínio é bloqueado pelo proxy desta sessão, então o arquivo foi extraído no navegador do Gabriel | logo da própria empresa |
| `mag-seguros.svg` | MAG Seguros | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ALogo_MAG_Seguros.svg)<br>arquivo: File:Logo MAG Seguros.svg | Public domain |
| `zurich.svg` | Zurich | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AZurich_Insurance_Group_logo.svg)<br>arquivo: File:Zurich Insurance Group logo.svg | Public domain |
| `tokio-marine.svg` | Tokio Marine | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ATokio_Marine_Logo.svg)<br>arquivo: File:Tokio Marine Logo.svg | Public domain |
| `seguros-unimed.png` | Seguros Unimed | https://midias.segurosunimed.com.br/content/logo.png<br>declarado como `logo` no JSON-LD de segurosunimed.com.br | logo da própria empresa |
| `mapfre.svg` | Mapfre | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ALogo_Mapfre_2026.svg)<br>arquivo: File:Logo Mapfre 2026.svg | Public domain |
| `qualicorp.png` | Qualicorp | https://www.qualicorp.com.br/wp-content/uploads/2024/10/logoQuali.png<br>não há SVG no site; PNG transparente 263x96 | logo da própria empresa |
| `fairfax.svg` | Fairfax BR Seguros | [www.fairfax.com.br](https://www.fairfax.com.br/)<br>SVG embutido no cabeçalho da página inicial | © Fairfax BR Seguros, uso como marca de parceira |
| `coris.svg` | Coris Seguro Viagem | https://www.coris.com.br/icons/logo-footer.svg | logo da própria empresa |
| `ademicon.svg` | Ademicon | https://www.ademicon.com.br/api/media/file/ademicon.svg | logo da própria empresa |
| `allianz.svg` | Allianz | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AAllianz_logo.svg)<br>arquivo: File:Allianz logo.svg | Public domain |

## Observações por arquivo

- **`allianz.svg`** e **`unimed.svg`** trazem a caixa de fundo (azul e verde) porque é
  assim que a marca é apresentada oficialmente; o resto tem fundo transparente.

- **`azos.svg`** usa `fill="currentColor"`, como o site da Azos serve. O componente
  define a cor; em fundo claro o próprio site da Azos usa preto.

- **`coris.svg`** é o arquivo do **rodapé** do site deles, não o do cabeçalho. O
  do cabeçalho é a versão negativa (texto branco) e sumiria no cartão branco; o
  do rodapé é a positiva, com `#01192A` e `#00D647`.

- **`seguros-unimed.png`** e **`qualicorp.png`** são PNG porque as duas marcas
  não publicam SVG. Os dois têm fundo transparente.

- **`tokio-marine.svg`** tem 232 kB porque o traçado do símbolo é detalhado. É servido
  com `loading="lazy"`, então não pesa no primeiro carregamento.


## Duas parceiras ficaram de fora, e por quê

Não têm card na seção. **Nenhum logo foi inventado nem substituído por texto**
para elas — parceira ausente é melhor que marca errada.

| marca | site oficial | o que aconteceu |
|---|---|---|
| **Omint** | https://www.omint.com.br/ | responde **HTTP 403** (`Access Denied`, Akamai). O 403 é do WAF do próprio site, **não** do proxy desta sessão. `omint.com.ar` responde 200 mas devolve só um stub de 312 bytes, sem nenhum asset de logo. |
| **Akad Seguros** | https://www.akadseguros.com.br/ | responde **HTTP 403**, também do WAF do site. Atenção: `akad.com.br` responde 200 e **é outra empresa** — "AKAD \| Plotters, Impressoras de Crachás e Cartões PVC". O logo de lá seria a marca errada. |

Para incluir: abrir o site no navegador, salvar o SVG (ou PNG transparente) do
cabeçalho como `omint.svg` / `akad.svg` aqui, e acrescentar o card em
`src/components/Seguradoras.jsx`. O smoke afirma **N cartões == N imagens**,
então card sem imagem reprova sozinho.

## Sobre o `icatu.svg`, que veio por outro caminho

O domínio da Icatu responde **HTTP 403** pelo proxy de saída, e o Wikimedia
Commons não tem SVG da marca — a única ocorrência de "Icatu" lá é o brasão do
município de Icatu, MA. O arquivo foi então extraído do original no navegador do
Gabriel e transportado pelo chat.

Transporte por chat corrompe, e corrompeu: **cinco números chegaram com um zero
a mais** à direita. O conteúdo foi conferido por **SHA-256** dos atributos `d`
de todos os `<path>`, na ordem, unidos por `|`:

```
192c2a5f9f3d5ed3e21ea61b4a7e4fb9b3d8dd8fc8e22d1cbefb40c693b611d5
```

O hash do original certifica o arquivo que está aqui. Para reconferir:

```bash
python3 -c "
import re,hashlib
s=open('public/seguradoras/icatu.svg').read()
print(hashlib.sha256('|'.join(re.findall(r'<path\b[^>]*?\bd=\"([^\"]*)\"',s)).encode()).hexdigest())"
```

## Marca removida da lista

**NotreDame Intermédica** tinha card próprio e saiu. A marca foi incorporada pela
Hapvida, que já aparece aqui, e o site da NotreDame (`gndi.com.br`) hoje serve o
logo da Hapvida — o `alt` do cabeçalho de lá diz "Logo Hapvida SP/RJ".

_Levantado em 2026-09-16._

### O logo da Fairfax veio do cabeçalho, e o cabeçalho é SVG embutido

Não há arquivo para baixar: a marca está inline no HTML de
`https://www.fairfax.com.br/`, com as cores em classes do Tailwind e todo
`fill="currentColor"`. Dentro de um `<img>`, `currentColor` não herda cor
nenhuma — o SVG é um documento próprio — então as classes foram resolvidas
contra a folha do site e as cores gravadas no arquivo:

- `.fill-neutral-black{fill:#000}` → os chevrons `»` e a linha "A FAIRFAX
  Company", 12 paths
- `.fill-current` com o contêiner em `!text-[#012AFF]` → o "FF" e a palavra
  "Seguros", 9 paths

Os 21 `d=` foram copiados sem tocar. SHA-256 deles, unidos por `|`, na ordem:

    124dcd60f4acef1b86bfed8253d7be557049589ac5f55d10ac08bf9965cc57c7

O que estava aqui antes era o wordmark da **Fairfax Financial Holdings**, a
holding canadense, tirado do Wikimedia. A parceira é a **Fairfax BR Seguros**,
e a marca dela é outra.

## Akad e Omint — os dois que faltavam

Os domínios das duas respondem **HTTP 403** ao proxy desta sessão. Não é o
proxy: é o WAF dos próprios sites, e já era assim quando a seção foi montada.
Os arquivos vieram do Gabriel, que os abriu no navegador dele.

| arquivo | o que é | origem declarada | conferência feita aqui |
|---|---|---|---|
| `akad.svg` | logo Akad Seguros | cabeçalho de `akadseguros.com.br`, SVG embutido | `viewBox="0 0 181 76"`, um único `fill="#E8266B"` (a cor renderizada lá), **zero** `currentColor`, zero `<script>`, zero `href` externo, zero `<image>`, zero `<foreignObject>`, zero handler `on*` |
| `omint.png` | logo Omint | `omint.com.br` | 6 cores nos pixels opacos, e as **duas** primeiras cobrem 99,99% — `rgb(0,36,117)` e `rgb(127,145,186)`. Borda com alfa parcial = 1,38% da tinta |

Sobre a Omint: o arquivo que chegou tem 4096x4096 com a tinta em 2874x786. A URL
oficial do briefing
(`/wp-content/themes/OmintPortal360/assets/images/login/logo.png`) continua em
403, então **não deu para comparar com o original byte a byte**. O que dá para
afirmar é o que a medição mostra: duas cores chapadas, borda de 1,4% e arestas
limpas — assinatura de exportação de vetor, não de redesenho nem de upscale por
IA, que deixariam dezenas de cores na transição. O arquivo aqui foi recortado na
tinta e reduzido para 900x246, 35 kB; nada foi redesenhado.
