# Panificação Capricho

Website institucional bilíngue (Português/Inglês) da Panificação Capricho, em São Miguel dos Campos, Alagoas.

## Tecnologias

- React + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui project conventions
- lucide-react e Motion para ícones e movimento
- GitHub Actions para publicar no GitHub Pages

## Desenvolvimento local

```bash
npm install
npm run dev
```

Para compilar e verificar o projeto:

```bash
npm run build
```

## Contatos configurados

- Instagram: https://www.instagram.com/panificacaocapricho/
- Unidade Centro: +55 82 99329-2147
- Unidade Paraíso: +55 82 98819-8072

Os dados editáveis ficam centralizados em `src/lib/site-config.ts`.

## Publicação

O workflow `.github/workflows/deploy.yml` compila o site após atualizações na branch `main` e publica o diretório `dist` no GitHub Pages. Endereço esperado: https://nickebel.github.io/panificacao-capricho/
