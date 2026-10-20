# Landing page Step4u (estática)

Versão da landing de apresentação em HTML, CSS e JavaScript puros, sem framework
e sem etapa de build. O conteúdo e o visual são os mesmos da landing do app
(`frontend/src/screens/LandingScreen.js`), mas o HTML já sai pronto do servidor:
buscadores, LLMs e prévias de link (WhatsApp, LinkedIn) leem tudo sem executar
JavaScript.

## Estrutura

```
landing/
├── index.html               página (SEO, Open Graph, JSON-LD, conteúdo)
├── 404.html                 página de erro (noindex)
├── robots.txt               libera buscadores e crawlers de IA
├── sitemap.xml
├── llms.txt                 resumo da Step4u em Markdown para LLMs
├── site.webmanifest
├── favicon.ico
├── staticwebapp.config.json cache, headers de segurança e 404 (Azure Static Web Apps)
└── assets/
    ├── css/styles.css       estilos da página
    ├── css/fonts.css        @font-face apontando para os WOFF2 (uso em servidor)
    ├── css/fonts-inline.css @font-face com as fontes embutidas (uso em file://)
    ├── js/main.js           header, menu mobile, brilho do mouse e formulário
    ├── fonts/               Gibson 700 (títulos) e Open Sans 400/700 (texto) em WOFF2, só latim (~13–16 KB cada)
    └── img/                 logos SVG, grafismo de degraus, ícones e imagem de compartilhamento
```

## Antes de publicar

1. **Domínio.** Troque `step4u.example` pelo domínio real em todos os arquivos
   (`index.html`, `robots.txt`, `sitemap.xml`, `llms.txt`). As URLs do app usam
   `app.step4u.example`; ajuste para onde o app estiver publicado.
2. **Páginas legais.** O rodapé aponta para `/termos-de-uso` e
   `/politica-de-privacidade`. Publique essas páginas ou ajuste os links.
3. **Envio do formulário de análise prévia.** Ainda não existe rota pública de
   leads: o JS valida o LinkedIn e o arquivo e leva ao cadastro. Quando houver
   endpoint, troque o `TODO` em `assets/js/main.js` por um `fetch` com
   `FormData` (os campos não têm `name` de propósito, para nenhum dado pessoal
   ir na URL).
4. **Fotos.** As áreas de imagem de "O problema" e "Pilares" mostram o grafismo
   de degraus. Para trocar por foto, substitua o `<img>` dentro de
   `.media-slot` mantendo `width`, `height`, `alt`, `loading="lazy"` e
   `decoding="async"` (de preferência em AVIF/WebP).
5. **Números e depoimentos.** Os dados estruturados não marcam avaliações nem
   depoimentos como `Review`/`AggregateRating`. Só acrescente essa marcação se
   os números forem auditáveis; o Google penaliza avaliações sem base.

## Publicação

Qualquer hospedagem estática serve (Azure Static Web Apps, Blob Storage + CDN,
Netlify, Cloudflare Pages, Nginx). Para manter a nota do PageSpeed:

- **Compressão** Brotli ou gzip para HTML, CSS, JS, SVG, TXT e XML. O Azure
  Static Web Apps já comprime automaticamente.
- **Cache longo** em `/assets/*` (já configurado em `staticwebapp.config.json`).
  Ao alterar `styles.css` ou `main.js`, aumente o `?v=1` nas referências do
  `index.html` para invalidar o cache.
- **HTTPS** com HTTP/2 ou HTTP/3.

## Abrir sem servidor

A página é independente: dá para abrir o `index.html` direto do disco (duplo
clique) e ela carrega completa, sem erros. Todos os caminhos são relativos, então
também funciona dentro de qualquer subpasta de um servidor.

O navegador bloqueia arquivos de fonte e o manifesto em `file://`. Por isso um
script curto no `<head>` escolhe:

- **servidor (http/https):** pré-carrega os WOFF2, usa `fonts.css` e o manifesto;
- **arquivo local (file://):** usa `fonts-inline.css`, com as fontes embutidas.

Os ~40 KB da versão embutida só são baixados no modo arquivo local, sem afetar o
PageSpeed em produção.

Para testar como servidor:

```bash
python -m http.server 8090 --directory landing
```

## Resultado de referência (Lighthouse 12, servidor local sem compressão)

| | Performance | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Desktop | 100 | 100 | 100 | 100 |
| Mobile | 94 a 100 | 100 | 100 | 100 |

Mobile: LCP 1,4–1,5 s, CLS 0 (a nota de performance oscila entre rodadas). Parte do tempo de bloqueio medido veio de uma extensão
do navegador da máquina de teste, que não afeta visitantes. Com compressão e
cache em produção, os alertas restantes do relatório desaparecem.

## O que foi feito para SEO e LLMs

- HTML semântico: um `h1`, `h2` por seção, `header`/`nav`/`main`/`footer`,
  listas, `figure`/`blockquote` nos depoimentos e `details`/`summary` no FAQ.
- Links reais (`<a href>`) em navegação, CTAs e rodapé; nenhum conteúdo depende
  de JavaScript para aparecer.
- `lang="pt-BR"`, título e descrição no tamanho exibido pelo Google, canonical,
  `robots`, Open Graph e Twitter Card com imagem 1200×630.
- JSON-LD com `Organization`, `WebSite`, `WebPage`, `Service` (catálogo com os
  planos e preços) e `FAQPage`.
- `llms.txt` e `robots.txt` liberando os crawlers de IA (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended etc.).
- Acessibilidade: link "Pular para o conteúdo", foco visível, contraste AA,
  `aria-*` no menu e no formulário, `prefers-reduced-motion` desliga as
  animações.

## Performance

- Sem framework: ~5 KB de JS (carregado com `defer`) e ~21 KB de CSS sem
  compressão.
- Fontes auto-hospedadas, recortadas para latim, com `preload` e
  `font-display: swap`. Fallback em Arial com `size-adjust`/`ascent-override`
  nas medidas da Gibson e da Open Sans, para a troca de fonte não deslocar o layout.
- As pastas `fonts/Gibson` e `fonts/Open_Sans` são os arquivos originais; a página
  usa só os recortes `gibson-700`, `opensans-400` e `opensans-700`. Para gerar de novo:
  `python -m fontTools.subset <fonte.ttf> --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122" --flavor=woff2`.
- Ícones em um sprite SVG inline, grafismo do hero em SVG inline e imagens
  abaixo da dobra com `loading="lazy"`.
- Brilho do hero com `radial-gradient` em vez de `filter: blur()` (bem mais
  barato de pintar no celular).
- Todas as imagens têm `width`/`height` (CLS 0).
