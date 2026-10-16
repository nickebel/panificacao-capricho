# Configuração do catálogo administrativo — Panificação Capricho

O site usa Supabase para guardar os produtos, autenticar os responsáveis e hospedar as fotos. O catálogo público não mostra exemplos: exibe apenas os produtos publicados no banco.

## 1. Criar o projeto

Crie um projeto em https://supabase.com/dashboard. Copie o endereço do projeto e a chave pública (publishable key ou anon key) nas configurações de API.

**Nunca use uma chave service_role ou secret no site, HTML ou GitHub.** O navegador só deve receber a chave pública; as permissões são protegidas pelas regras RLS.

## 2. Criar tabelas, regras e armazenamento

No Supabase, abra SQL Editor, crie uma consulta, copie todo o arquivo supabase/setup.sql deste repositório e execute. Ele cria a tabela de produtos, a lista de administradores autorizados, as regras de acesso e o bucket de fotos.

## 3. Criar a conta do responsável

Em Authentication → Users → Add user, crie a conta do responsável com e-mail e senha segura. O painel do site não possui cadastro aberto.

Na lista de usuários, copie o UUID dessa conta. No SQL Editor execute, trocando o valor pelo UUID real:

    insert into public.catalog_admins (user_id) values ('UUID-DO-USUARIO-AQUI');

Repita apenas para cada pessoa autorizada. Ter login no Supabase não basta: o usuário também precisa estar em catalog_admins.

## 4. Conectar o site

Abra supabase-config.js no repositório e troque os dois valores vazios:
- url: URL do projeto Supabase, por exemplo https://seu-projeto.supabase.co.
- anonKey: chave pública (publishable/anon) do projeto.

Salve o arquivo. Não adicione uma chave secreta nem service_role.

## 5. Configurar URLs de autenticação

Em Authentication → URL Configuration, defina Site URL como:

    https://nickebel.github.io/panificacao-capricho/

Adicione o redirect URL:

    https://nickebel.github.io/panificacao-capricho/admin.html

## 6. Acessar e cadastrar produtos

Quando o GitHub Pages publicar as alterações, acesse:

    https://nickebel.github.io/panificacao-capricho/admin.html

Entre com a conta criada e autorizada. Cadastre nome, descrição e categoria em português e use o botão “Traduzir para inglês” para preencher os campos em inglês. O formulário também tenta traduzir os campos em inglês que estejam vazios ao clicar em salvar. Revise as sugestões antes de salvar; nomes de alimentos e expressões regionais podem precisar de ajustes. Envie foto real (até 5 MB) ou informe um link HTTPS, e adicione preço se quiser.

- Publicado no site: desmarque para manter o produto em rascunho, invisível ao público.
- Disponível para pedidos: desmarque para mostrar como indisponível e bloquear o botão de adicionar ao carrinho.
- Preço: deixe vazio se não quiser mostrar valor. O site não inventa preços.
- Tradução: usa o serviço externo MyMemory Translation sem chave de API. O texto em português dos campos traduzidos é enviado a esse serviço; a disponibilidade e os limites dependem do provedor.

As alterações ficam salvas no banco e aparecem no catálogo. O carrinho não exige cadastro de clientes e envia o pedido pelo WhatsApp somente depois de a pessoa revisar e tocar em enviar.

## Segurança

Visitantes só podem ler os produtos publicados. Somente usuários em public.catalog_admins podem criar, editar ou excluir itens. As fotos são públicas para leitura para que o site consiga mostrá-las; apenas administradores autorizados podem fazer upload, atualizar ou excluir objetos.

Até conectar o projeto e executar o SQL, o site indica que o catálogo não está conectado e não mostra os produtos de exemplo.
