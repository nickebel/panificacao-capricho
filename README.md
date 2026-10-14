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
