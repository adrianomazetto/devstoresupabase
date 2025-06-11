# Guia de Configuração do Supabase para B7Store

## Passo a Passo Detalhado

### 1. Criação do Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub, Google ou email
4. No dashboard, clique em "New Project"
5. Preencha os dados:
   - **Name**: B7Store
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
6. Clique em "Create new project"
7. Aguarde a criação (pode levar alguns minutos)

### 2. Configuração das Tabelas

No painel do Supabase, vá para **SQL Editor** e execute os seguintes comandos:

#### Tabela de Produtos
```sql
-- Criar tabela de produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, image_url, category) VALUES
('Camiseta Node JS - Preta', 'Camiseta confortável para desenvolvedores Node.js', 59.99, 'assets/images/products/camiseta-html.png', 'camisetas'),
('Camiseta React - Azul', 'Camiseta oficial React com design moderno', 64.99, 'assets/images/products/camiseta-css.png', 'camisetas'),
('Kit B7Web Completo', 'Kit completo com materiais do curso B7Web', 199.99, 'assets/images/products/kit-b7web.png', 'kits'),
('Mouse Gamer RGB', 'Mouse gamer com iluminação RGB e alta precisão', 89.99, 'assets/images/products/mouse-gamer.png', 'eletronicos'),
('Caneca Programador', 'Caneca temática para desenvolvedores', 29.99, 'assets/images/products/caneca.png', 'acessorios');
```

#### Tabela de Usuários
```sql
-- Criar tabela de usuários (vinculada ao auth do Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Função para criar usuário automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Tabela do Carrinho
```sql
-- Criar tabela do carrinho
CREATE TABLE cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);
```

### 3. Configuração do Row Level Security (RLS)

#### Para a tabela Products
```sql
-- Habilitar RLS na tabela products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (todos podem ver produtos)
CREATE POLICY "Enable read access for all users" ON products
FOR SELECT USING (true);

-- Política para inserção (apenas usuários autenticados)
CREATE POLICY "Enable insert for authenticated users only" ON products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (apenas usuários autenticados)
CREATE POLICY "Enable update for authenticated users only" ON products
FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão (apenas usuários autenticados)
CREATE POLICY "Enable delete for authenticated users only" ON products
FOR DELETE USING (auth.role() = 'authenticated');
```

#### Para a tabela Users
```sql
-- Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para leitura (usuário pode ver apenas seus próprios dados)
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Política para inserção (sistema pode criar usuários)
CREATE POLICY "Enable insert for system" ON users
FOR INSERT WITH CHECK (true);

-- Política para atualização (usuário pode atualizar apenas seus dados)
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- Política para exclusão (usuário pode excluir apenas seus dados)
CREATE POLICY "Users can delete own profile" ON users
FOR DELETE USING (auth.uid() = id);
```

#### Para a tabela Cart
```sql
-- Habilitar RLS na tabela cart
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Política para leitura (usuário vê apenas seu carrinho)
CREATE POLICY "Users can view own cart" ON cart
FOR SELECT USING (auth.uid() = user_id);

-- Política para inserção (usuário pode adicionar ao seu carrinho)
CREATE POLICY "Users can insert into own cart" ON cart
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualização (usuário pode atualizar seu carrinho)
CREATE POLICY "Users can update own cart" ON cart
FOR UPDATE USING (auth.uid() = user_id);

-- Política para exclusão (usuário pode remover de seu carrinho)
CREATE POLICY "Users can delete from own cart" ON cart
FOR DELETE USING (auth.uid() = user_id);
```

### 4. Configuração de Autenticação

1. No painel do Supabase, vá para **Authentication > Settings**
2. Configure as seguintes opções:

#### Site URL
- **Site URL**: `http://localhost:3000` (desenvolvimento) ou sua URL de produção
- **Additional Redirect URLs**: Adicione outras URLs se necessário

#### Email Templates
Personalize os templates de email se desejar:
- **Confirm signup**
- **Reset password**
- **Magic link**

#### Providers
Configure provedores adicionais se necessário:
- Google
- GitHub
- Facebook
- Etc.

### 5. Obtenção das Credenciais

1. No painel do Supabase, vá para **Settings > API**
2. Copie as seguintes informações:
   - **Project URL**: `https://[seu-projeto].supabase.co`
   - **anon public key**: Chave pública para uso no frontend

### 6. Configuração no Frontend

Edite o arquivo `assets/js/supabase.js`:

```javascript
// Configuração do Supabase
const SUPABASE_URL = 'https://[seu-projeto].supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';

// Inicializar cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 7. Configurações Avançadas

#### Configuração de CORS
Se necessário, configure CORS em **Settings > API > CORS**:
- Adicione seus domínios permitidos
- Configure headers necessários

#### Configuração de Rate Limiting
Em **Settings > API > Rate Limiting**:
- Configure limites por IP
- Configure limites por usuário autenticado

#### Configuração de Webhooks
Para integrações futuras, configure webhooks em **Settings > Webhooks**

### 8. Backup e Monitoramento

#### Backup Automático
- O Supabase faz backup automático
- Configure backup adicional se necessário

#### Monitoramento
- Use o dashboard para monitorar:
  - Uso de API
  - Número de usuários
  - Performance do banco
  - Logs de erro

### 9. Testes de Configuração

Para testar se tudo está funcionando:

1. **Teste de Conexão**:
   ```javascript
   console.log('Supabase conectado:', supabaseClient);
   ```

2. **Teste de Leitura**:
   ```javascript
   const { data, error } = await supabaseClient
     .from('products')
     .select('*');
   console.log('Produtos:', data);
   ```

3. **Teste de Autenticação**:
   - Tente fazer cadastro
   - Tente fazer login
   - Verifique se as políticas RLS estão funcionando

### 10. Solução de Problemas Comuns

#### Erro de CORS
- Verifique se a URL está configurada corretamente
- Adicione a URL nas configurações de CORS

#### RLS Negando Acesso
- Verifique se as políticas estão corretas
- Teste com usuário autenticado
- Verifique se o `auth.uid()` está retornando valor

#### Erro de Conexão
- Verifique se as credenciais estão corretas
- Verifique se o projeto está ativo
- Teste a conectividade de rede

### 11. Configuração para Produção

Quando for para produção:

1. **Atualize a Site URL** para sua URL de produção
2. **Configure domínio personalizado** se necessário
3. **Revise as políticas de segurança**
4. **Configure monitoramento** adequado
5. **Teste todas as funcionalidades** em produção

---

Este guia garante que o Supabase esteja configurado corretamente para o projeto B7Store, com todas as funcionalidades de segurança e performance necessárias.

