# Panificação Capricho

Website institucional bilíngue (Português/Inglês) da Panificação Capricho, em São Miguel dos Campos, Alagoas.

## Tecnologias

- React + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui project conventions
- lucide-react e Motion
- GitHub Actions para compilar e publicar no GitHub Pages

## Desenvolvimento local

```bash
npm install
npm run dev
```

Verifique a compilação com:

```bash
npm run build
```

## Contatos oficiais configurados

- Instagram: https://www.instagram.com/panificacaocapricho/
- Unidade Centro: +55 82 99329-2147
- Unidade Paraíso: +55 82 98819-8072

Os contatos ficam centralizados em `src/lib/site-config.ts`.

## Ativar o site público

1. Abra https://github.com/nickebel/panificacao-capricho/settings/pages
2. Em **Build and deployment**, escolha **GitHub Actions** como fonte.
3. Depois, abra a aba **Actions** e verifique ou execute novamente o workflow “Deploy Panificacao Capricho to GitHub Pages”.

O workflow já está preparado para compilar a branch `main` e publicar o diretório `dist`. O código compila, mas o primeiro deploy depende dessa ativação do Pages nas configurações do repositório.

Endereço esperado após a publicação: https://nickebel.github.io/panificacao-capricho/
