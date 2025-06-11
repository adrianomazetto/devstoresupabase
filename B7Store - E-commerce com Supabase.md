# B7Store - E-commerce com Supabase

## Visão Geral

O B7Store é um projeto de e-commerce completo desenvolvido com HTML, CSS e JavaScript vanilla, integrado com Supabase como backend. O sistema oferece funcionalidades completas de loja virtual, incluindo catálogo de produtos, carrinho de compras, sistema de autenticação, administração de produtos e integração com WhatsApp para finalização de pedidos.

## Características Principais

### Frontend
- **Tecnologias**: HTML5, CSS3, JavaScript ES6+
- **Design**: Responsivo e moderno
- **Compatibilidade**: Desktop e mobile
- **Performance**: Otimizado para carregamento rápido

### Backend
- **Plataforma**: Supabase (PostgreSQL + Auth + Storage)
- **Autenticação**: Sistema completo de login/cadastro
- **Banco de Dados**: PostgreSQL com Row Level Security (RLS)
- **APIs**: RESTful através do Supabase Client

### Funcionalidades Implementadas

#### 1. Sistema de Autenticação
O sistema de autenticação foi implementado utilizando o Supabase Auth, oferecendo:

- **Cadastro de usuários** com validação de email
- **Login seguro** com criptografia
- **Gerenciamento de sessões** automático
- **Proteção de rotas** para áreas administrativas
- **Logout** com limpeza de sessão

#### 2. Catálogo de Produtos
O catálogo permite a visualização organizada dos produtos:

- **Listagem de produtos** com imagens e preços
- **Detalhes do produto** em página dedicada
- **Categorização** por tipo de produto
- **Busca** por nome ou categoria
- **Imagens responsivas** com fallback

#### 3. Carrinho de Compras
Sistema completo de carrinho com persistência:

- **Adição de produtos** com feedback visual
- **Alteração de quantidades** em tempo real
- **Remoção de itens** individual
- **Cálculo automático** de totais
- **Persistência** entre sessões
- **Contador visual** no header
- **Integração** com banco de dados para usuários logados

#### 4. Administração de Produtos
Painel administrativo completo para gerenciamento:

- **Listagem** de todos os produtos
- **Adição** de novos produtos
- **Edição** de produtos existentes
- **Exclusão** com confirmação
- **Upload** de imagens via URL
- **Categorização** automática
- **Controle de acesso** apenas para usuários autenticados

#### 5. Integração com WhatsApp
Sistema de finalização de pedidos via WhatsApp:

- **Geração automática** de mensagem do pedido
- **Formatação profissional** com detalhes completos
- **Cálculo de totais** automático
- **Informações de contato** da loja
- **Abertura direta** do WhatsApp Web/App

## Estrutura do Banco de Dados

### Tabela `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela `cart`
```sql
CREATE TABLE cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Configuração do Supabase

### 1. Criação do Projeto
Para configurar o Supabase para este projeto:

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto
5. Aguarde a criação do banco de dados

### 2. Configuração das Tabelas
Execute os scripts SQL fornecidos na seção "Estrutura do Banco de Dados" no SQL Editor do Supabase.

### 3. Configuração do RLS (Row Level Security)
Configure as políticas de segurança conforme documentado no projeto.

### 4. Obtenção das Credenciais
No painel do Supabase, vá em Settings > API e copie:
- Project URL
- anon public key

### 5. Configuração no Frontend
Atualize o arquivo `assets/js/supabase.js` com suas credenciais:

```javascript
const SUPABASE_URL = 'sua-url-aqui';
const SUPABASE_ANON_KEY = 'sua-chave-aqui';
```

## Estrutura de Arquivos

```
cnp_9_projeto_final/
├── index.html              # Página principal
├── login.html              # Página de login
├── register.html           # Página de cadastro
├── product.html            # Página de produto
├── checkout.html           # Página do carrinho
├── admin.html              # Administração
├── assets/
│   ├── css/
│   │   ├── global.css      # Estilos globais
│   │   ├── header.css      # Estilos do header
│   │   ├── footer.css      # Estilos do footer
│   │   └── checkout.css    # Estilos do checkout
│   ├── js/
│   │   ├── supabase.js     # Configuração do Supabase
│   │   ├── auth.js         # Sistema de autenticação
│   │   ├── cart.js         # Gerenciamento do carrinho
│   │   ├── admin.js        # Administração de produtos
│   │   ├── whatsapp.js     # Integração WhatsApp
│   │   ├── header.js       # Funcionalidades do header
│   │   └── footer.js       # Funcionalidades do footer
│   └── images/             # Imagens do projeto
└── README.md               # Documentação
```

## Guia de Instalação

### Pré-requisitos
- Navegador web moderno
- Conta no Supabase
- Servidor web local (opcional para desenvolvimento)

### Passos de Instalação

1. **Clone ou baixe o projeto**
   ```bash
   git clone [url-do-repositorio]
   cd cnp_9_projeto_final
   ```

2. **Configure o Supabase**
   - Siga as instruções da seção "Configuração do Supabase"
   - Atualize as credenciais em `assets/js/supabase.js`

3. **Configure o WhatsApp**
   - Edite o arquivo `assets/js/whatsapp.js`
   - Atualize o número do WhatsApp da loja:
   ```javascript
   this.phoneNumber = '5511999999999'; // Seu número aqui
   ```

4. **Teste o projeto**
   - Abra `index.html` em um navegador
   - Ou use um servidor local como Live Server

### Configuração para Produção

Para usar em produção, considere:

1. **Hospedagem**: Use serviços como Netlify, Vercel ou GitHub Pages
2. **Domínio personalizado**: Configure um domínio próprio
3. **SSL**: Certifique-se de que o site use HTTPS
4. **Otimização**: Minifique CSS e JavaScript
5. **SEO**: Adicione meta tags apropriadas

## APIs e Integrações

### Supabase Client
O projeto utiliza o Supabase JavaScript Client para:

- **Autenticação**: `supabase.auth`
- **Banco de dados**: `supabase.from()`
- **Tempo real**: Atualizações automáticas
- **Storage**: Para futuras implementações de upload

### WhatsApp API
Integração via WhatsApp Web API:

- **URL Format**: `https://wa.me/[number]?text=[message]`
- **Encoding**: UTF-8 para caracteres especiais
- **Compatibilidade**: Desktop e mobile

## Funcionalidades Futuras

### Melhorias Planejadas

1. **Upload de Imagens**
   - Integração com Supabase Storage
   - Redimensionamento automático
   - Múltiplas imagens por produto

2. **Sistema de Pagamento**
   - Integração com PIX
   - Gateway de pagamento
   - Confirmação automática

3. **Gestão de Pedidos**
   - Status de pedidos
   - Histórico de compras
   - Notificações por email

4. **Relatórios**
   - Dashboard de vendas
   - Produtos mais vendidos
   - Análise de clientes

5. **SEO e Performance**
   - Meta tags dinâmicas
   - Lazy loading de imagens
   - Service Workers para cache

## Segurança

### Medidas Implementadas

1. **Row Level Security (RLS)**
   - Proteção a nível de banco de dados
   - Políticas específicas por tabela
   - Isolamento de dados por usuário

2. **Validação Frontend**
   - Sanitização de inputs
   - Validação de formulários
   - Prevenção de XSS

3. **Autenticação Segura**
   - Tokens JWT
   - Sessões com expiração
   - Logout automático

### Recomendações Adicionais

1. **HTTPS obrigatório** em produção
2. **Validação backend** adicional
3. **Rate limiting** para APIs
4. **Monitoramento** de segurança
5. **Backup regular** dos dados

## Suporte e Manutenção

### Logs e Debugging

Para debug, verifique:
1. Console do navegador para erros JavaScript
2. Network tab para requisições falhadas
3. Logs do Supabase no dashboard
4. Validação de políticas RLS

### Problemas Comuns

1. **Erro de CORS**: Verifique as configurações do Supabase
2. **RLS negando acesso**: Revise as políticas de segurança
3. **Carrinho não persistindo**: Verifique autenticação do usuário
4. **WhatsApp não abrindo**: Teste o formato da URL

### Contato e Suporte

Para suporte técnico:
- Documentação do Supabase: [docs.supabase.com](https://docs.supabase.com)
- Comunidade: Discord do Supabase
- Issues: GitHub do projeto

## Conclusão

O B7Store representa uma implementação completa de e-commerce moderno, utilizando tecnologias atuais e práticas recomendadas de desenvolvimento. A integração com Supabase oferece escalabilidade e segurança, enquanto a interface em JavaScript vanilla garante performance e compatibilidade.

O projeto está pronto para uso em produção, com todas as funcionalidades essenciais implementadas e testadas. As funcionalidades futuras planejadas permitirão expansão gradual conforme as necessidades do negócio.

---

**Desenvolvido por**: Manus AI  
**Data**: Junho 2025  
**Versão**: 1.0.0

