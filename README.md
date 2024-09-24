# blog-app

Este é um aplicativo de blog construído com **Node.js**, **Express**, **MongoDB**, e **Handlebars** como template engine. Ele permite que os usuários leiam postagens, explorem categorias e que o administrador adicione, edite e exclua postagens e categorias. O projeto inclui um sistema de autenticação para a parte administrativa.

## Acesse o Projeto

<a href="https://gabrielgrm.com/blog-app" target="_blank">gabrielgrm.com/blog-app</a>

## Funcionalidades

- **Leitura de Postagens**: Os usuários podem visualizar e navegar por diferentes postagens no blog.
- **Categorias**: Postagens estão organizadas por categorias, facilitando a navegação.
- **Registro e Login**: Qualquer usuário pode se registrar e fazer login no sistema.
- **Painel Administrativo (Acesso Restrito)**: Apenas administradores podem acessar as rotas `/admin/categorias` e `/admin/postagens` para gerenciar o conteúdo do blog.

## Painel Administrativo

A parte administrativa é acessível apenas para usuários autenticados com permissões de administrador. Atualmente, você pode testar o painel usando as seguintes credenciais:

- **Email**: `admin@admin.com`
- **Senha**: `admin`

### Funcionalidades do Admin:

- **Gerenciar Postagens**: Criar, editar e excluir postagens. `/admin/postagens`
- **Gerenciar Categorias**: Criar, editar e excluir categorias.  `/admin/categorias`

## Tecnologias Utilizadas

- **Node.js**: Plataforma de servidor utilizada para construir a aplicação.
- **Express.js**: Framework web para gerenciar rotas e middlewares.
- **MongoDB**: Banco de dados para armazenar usuários, postagens e categorias.
- **Mongoose**: ODM (Object Data Modeling) para gerenciar interações com o MongoDB.
- **Express Handlebars**: Template engine para renderizar as views.
- **Passport.js**: Utilizado para autenticação de usuários.
- **Connect Flash**: Utilizado para exibir mensagens de erro e sucesso na interface.
- **bcrypt.js**: Utilizado para fazer o hash de senhas, garantindo que as senhas dos usuários sejam armazenadas de forma segura no banco de dados.



