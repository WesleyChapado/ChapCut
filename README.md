# ChapCut

Ferramenta web para dividir PDFs automaticamente com base na comparação de layout entre páginas. Todo o processamento acontece **100% no navegador** — seus arquivos nunca saem do seu computador.

## O que faz

O ChapCut permite que você:

1. Faça upload de um PDF
2. Escolha uma **página modelo** cujo layout representa o ponto de divisão
3. Divida o documento em vários PDFs menores
4. Baixe tudo compactado em um arquivo `resultado.zip`

A comparação usa a **estrutura visual** da página (distribuição de blocos, margens e bordas), não o texto exato. Isso funciona com capas, separadores, folhas de rosto ou qualquer página com layout repetido.

## Como funciona

```
Upload → Selecionar página modelo → Dividir → Download ZIP

Documento 000.pdf  →  páginas antes do 1º match de layout
Documento 001.pdf  →  do 1º match até antes do próximo
Documento 002.pdf  →  e assim por diante...
```

## Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) — leitura e renderização
- [pdf-lib](https://pdf-lib.js.org/) — criação dos PDFs divididos
- [JSZip](https://stuk.github.io/jszip/) — compactação do ZIP

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

## Scripts

| Comando        | Descrição                    |
|----------------|------------------------------|
| `pnpm dev`     | Servidor de desenvolvimento  |
| `pnpm build`   | Build de produção            |
| `pnpm preview` | Preview do build             |
| `pnpm lint`    | Lint com Oxlint              |

## Privacidade

Nenhum dado é enviado para servidor. O PDF é lido, processado e exportado inteiramente no cliente.

## Licença

Projeto privado.
