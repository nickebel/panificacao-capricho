# Panificação Capricho

Site institucional bilíngue (Português/Inglês) da Panificação Capricho, em São Miguel dos Campos, Alagoas.

## O que está no projeto

- Página inicial responsiva, com seletor Português/Inglês, sabores e cards das duas unidades.
- Instagram oficial: https://www.instagram.com/panificacaocapricho/
- WhatsApp Centro: +55 82 99329-2147
- WhatsApp Paraíso: +55 82 98819-8072
- Cores de marca em creme, bege e marrom.
- Código React + TypeScript em `src/`, componente de movimento em `src/components/ui/testimonials-columns-1.tsx`, Vite e Tailwind CSS v4.

## Publicação

O GitHub Pages está configurado para publicar a página raiz da branch `main` com o builder padrão do Pages. Por esse motivo, `index.html` é uma página autônoma que funciona diretamente no Pages, sem tentar executar JSX/TSX de desenvolvimento no navegador.

Após alterações em `main`, o workflow automático **pages build and deployment** gera e publica a página. O workflow **Validate Panificacao Capricho** confere o build e os tipos do projeto.

URL: https://nickebel.github.io/panificacao-capricho/

## Desenvolvimento local

```bash
npm install
npm run dev
npm run build
```

Os contatos são centralizados em `src/lib/site-config.ts`. A página pública tem os números e perfil oficial do Instagram atualizados diretamente no HTML.


## Fotos e identidade visual

O site usa a marca em vetor em `assets/logo-capricho.svg`, baseada na logo oficial enviada pelo proprietário. As fotografias de produtos são imagens ilustrativas do Pexels, entregues em tamanhos maiores pelo CDN para melhorar a nitidez.

Fontes das fotografias:
- Tapioca: https://www.pexels.com/photo/hot-coffee-in-yellow-ceramic-mug-beside-a-plate-of-white-bread-with-filling-5860731/
- Cubos de tapioca (banner): https://www.pexels.com/photo/food-on-brown-surface-3324431/
- Cuscuz brasileiro: https://www.pexels.com/photo/traditional-cuscuz-paulista-dish-on-ornate-plate-34314361/
- Café da manhã: https://www.pexels.com/photo/bread-butter-and-buns-9304020/
- Pães: https://www.pexels.com/photo/freshly-baked-buns-at-the-bakery-display-17301617/

As imagens são servidas pelo CDN do Pexels. A disponibilização no site depende de conexão com a internet e do serviço de imagens do provedor.


## Cuscuz nordestino e logo oficial

- **Logo:** `assets/logo-capricho.png` é o arquivo original fornecido pelo proprietário, incorporado sem redesenho, recorte, alteração de cor ou remoção do fundo.
- **Foto do cuscuz nordestino:** [Cuscuz nordestino.jpg](https://commons.wikimedia.org/wiki/File:Cuscuz_nordestino.jpg), de André Koehne, foto original com 2.992 × 2.992 px. Licença Creative Commons Atribuição-CompartilhaIgual 4.0 (CC BY-SA 4.0). O arquivo é servido diretamente do Wikimedia Commons: https://upload.wikimedia.org/wikipedia/commons/3/3f/Cuscuz_nordestino.jpg
