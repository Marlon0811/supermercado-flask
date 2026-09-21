SUPERMERCADO BOA COMPRA - RENDER + BANCO DE DADOS

O projeto agora possui:
- HTML
- CSS
- JavaScript
- DOM
- Python
- Flask
- Listas e dicionários
- Cadastro
- Login
- Senhas armazenadas com hash
- Sessão de usuário
- Banco PostgreSQL
- Pedidos por usuário
- Histórico de pedidos

ESTRUTURA

app.py
templates/
  index.html
  cadastro.html
  login.html
  pedidos.html
static/
  style.css
  script.js
  auth.js
requirements.txt
render.yaml

DEPLOY

Opção recomendada:
1. Crie um repositório no GitHub.
2. Coloque o conteúdo desta pasta no repositório.
3. No Render, use New -> Blueprint.
4. Selecione o repositório.
5. O render.yaml configura o Web Service e o banco PostgreSQL.
6. Faça o deploy.

IMPORTANTE

O banco PostgreSQL é usado quando DATABASE_URL está configurada.
Localmente, se DATABASE_URL não existir, o projeto usa SQLite em supermercado.db.

NUNCA coloque uma senha real ou SECRET_KEY fixa no GitHub.
O render.yaml pede ao Render para gerar SECRET_KEY automaticamente.

FUNCIONALIDADES

1. Usuário cria uma conta.
2. A senha é transformada em hash antes de ser armazenada.
3. Usuário faz login.
4. A sessão identifica o usuário.
5. Usuário adiciona produtos ao carrinho.
6. Usuário finaliza o pedido.
7. O pedido é salvo no banco.
8. Os itens do pedido são salvos.
9. Em "Meus pedidos", o usuário vê seu histórico.

OBSERVAÇÃO

Para um projeto escolar, este sistema demonstra claramente frontend,
backend, autenticação, banco de dados, listas, dicionários e CRUD básico.
Para uso comercial real, ainda seriam necessários recursos adicionais
como validação mais completa, proteção CSRF, recuperação de senha,
confirmação de e-mail, controle de estoque e pagamentos seguros.
