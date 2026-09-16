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
| `mag-seguros.svg` | MAG Seguros | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ALogo_MAG_Seguros.svg)<br>arquivo: File:Logo MAG Seguros.svg | Public domain |
| `zurich.svg` | Zurich | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AZurich_Insurance_Group_logo.svg)<br>arquivo: File:Zurich Insurance Group logo.svg | Public domain |
| `tokio-marine.svg` | Tokio Marine | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ATokio_Marine_Logo.svg)<br>arquivo: File:Tokio Marine Logo.svg | Public domain |
| `allianz.svg` | Allianz | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AAllianz_logo.svg)<br>arquivo: File:Allianz logo.svg | Public domain |

## Observações por arquivo

- **`allianz.svg`** e **`unimed.svg`** trazem a caixa de fundo (azul e verde) porque é
  assim que a marca é apresentada oficialmente; o resto tem fundo transparente.

- **`azos.svg`** usa `fill="currentColor"`, como o site da Azos serve. O componente
  define a cor; em fundo claro o próprio site da Azos usa preto.

- **`tokio-marine.svg`** tem 232 kB porque o traçado do símbolo é detalhado. É servido
  com `loading="lazy"`, então não pesa no primeiro carregamento.


## Faltam dois, e o motivo

Estes continuam como **texto** em `src/components/Seguradoras.jsx`, não como imagem.
Nenhum logo foi inventado para eles.

| marca | o que aconteceu | o que resolve |
|---|---|---|
| **Icatu Seguros** | `icatuseguros.com.br`, `icatu.com.br` e `www.icatu.com.br` respondem **HTTP 403** pelo proxy de saída desta sessão, e o Wikimedia Commons não tem SVG da marca (a única ocorrência de "Icatu" lá é o brasão do município de Icatu, MA). | Gabriel baixar o SVG em https://www.icatuseguros.com.br e salvar como `icatu.svg`. |
| **NotreDame Intermédica** | não há SVG no Commons, e o site da própria marca (`gndi.com.br`) hoje serve o logo da **Hapvida** — as duas se fundiram e o cabeçalho diz "Logo Hapvida SP/RJ". | decidir se a marca ainda merece card próprio; se sim, Gabriel fornecer o arquivo e salvar como `notredame.svg`. |

_Levantado em 2026-09-16._
