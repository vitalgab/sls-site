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
| `allianz.svg` | Allianz | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AAllianz_logo.svg)<br>arquivo: File:Allianz logo.svg | Public domain |

## Observações por arquivo

- **`allianz.svg`** e **`unimed.svg`** trazem a caixa de fundo (azul e verde) porque é
  assim que a marca é apresentada oficialmente; o resto tem fundo transparente.

- **`azos.svg`** usa `fill="currentColor"`, como o site da Azos serve. O componente
  define a cor; em fundo claro o próprio site da Azos usa preto.

- **`tokio-marine.svg`** tem 232 kB porque o traçado do símbolo é detalhado. É servido
  com `loading="lazy"`, então não pesa no primeiro carregamento.


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
