// Gerenciador da Administração de Produtos
class ProductAdmin {
    constructor() {
        this.products = [];
        this.currentProduct = null;
        this.init();
    }

    async init() {
        // Verificar se o usuário está logado
        if (!auth.isLoggedIn()) {
            this.showMessage('Você precisa estar logado para acessar a administração.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        await this.loadProducts();
        this.setupEventListeners();
    }

    async loadProducts() {
        try {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .order('name');

            if (error) {
                throw error;
            }

            this.products = data || [];
            this.renderProducts();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            this.showMessage('Erro ao carregar produtos: ' + error.message, 'error');
        }
    }

    renderProducts() {
        const container = document.getElementById('products-container');
        
        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <h3>Nenhum produto cadastrado</h3>
                    <p>Clique em "Adicionar Produto" para começar.</p>
                </div>
            `;
            return;
        }

        let html = `
            <table class="products-table">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Categoria</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.products.forEach(product => {
            html += `
                <tr>
                    <td>
                        <img src="${product.image_url || 'assets/images/products/default.png'}" 
                             alt="${product.name}" class="product-image" 
                             onerror="this.src='assets/images/products/default.png'">
                    </td>
                    <td>
                        <strong>${product.name}</strong>
                        ${product.description ? `<br><small style="color: #666;">${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</small>` : ''}
                    </td>
                    <td>R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</td>
                    <td>${this.getCategoryName(product.category)}</td>
                    <td>
                        <div class="product-actions">
                            <button class="btn-secondary" onclick="productAdmin.editProduct('${product.id}')">
                                Editar
                            </button>
                            <button class="btn-danger" onclick="productAdmin.deleteProduct('${product.id}', '${product.name}')">
                                Excluir
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    getCategoryName(category) {
        const categories = {
            'camisetas': 'Camisetas',
            'kits': 'Kits B7Web',
            'acessorios': 'Acessórios',
            'eletronicos': 'Eletrônicos'
        };
        return categories[category] || category;
    }

    setupEventListeners() {
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            image_url: formData.get('image_url'),
            category: formData.get('category')
        };

        const productId = document.getElementById('product-id').value;
        const saveBtn = document.getElementById('save-btn');
        
        // Desabilitar botão durante o salvamento
        saveBtn.disabled = true;
        saveBtn.textContent = 'Salvando...';

        try {
            if (productId) {
                // Atualizar produto existente
                await this.updateProduct(productId, productData);
            } else {
                // Criar novo produto
                await this.createProduct(productData);
            }
            
            this.closeProductModal();
            await this.loadProducts();
            this.showMessage(
                productId ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!', 
                'success'
            );
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            this.showMessage('Erro ao salvar produto: ' + error.message, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Salvar';
        }
    }

    async createProduct(productData) {
        const { data, error } = await supabaseClient
            .from('products')
            .insert([productData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async updateProduct(productId, productData) {
        const { data, error } = await supabaseClient
            .from('products')
            .update(productData)
            .eq('id', productId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async deleteProduct(productId, productName) {
        if (!confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
            return;
        }

        try {
            const { error } = await supabaseClient
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) {
                throw error;
            }

            await this.loadProducts();
            this.showMessage('Produto excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            this.showMessage('Erro ao excluir produto: ' + error.message, 'error');
        }
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showMessage('Produto não encontrado!', 'error');
            return;
        }

        this.currentProduct = product;
        
        // Preencher formulário
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-image').value = product.image_url || '';
        document.getElementById('product-category').value = product.category || 'camisetas';
        
        // Alterar título do modal
        document.getElementById('modal-title').textContent = 'Editar Produto';
        
        this.openProductModal();
    }

    openProductModal() {
        document.getElementById('productModal').style.display = 'block';
    }

    closeProductModal() {
        document.getElementById('productModal').style.display = 'none';
        document.getElementById('productForm').reset();
        document.getElementById('product-id').value = '';
        document.getElementById('modal-title').textContent = 'Adicionar Produto';
        this.currentProduct = null;
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        const className = type === 'error' ? 'error-message' : 'success-message';
        
        container.innerHTML = `<div class="${className}">${message}</div>`;
        
        // Remover mensagem após 5 segundos
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

// Funções globais para os botões
function openProductModal() {
    productAdmin.openProductModal();
}

function closeProductModal() {
    productAdmin.closeProductModal();
}

// Instância global do admin
let productAdmin;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar o auth estar pronto
    const checkAuth = setInterval(() => {
        if (typeof auth !== 'undefined' && auth.currentUser !== undefined) {
            clearInterval(checkAuth);
            productAdmin = new ProductAdmin();
        }
    }, 100);
});

// Fechar modal ao clicar fora dele
window.addEventListener('click', function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeProductModal();
    }
});

// Exportar para uso global
window.productAdmin = productAdmin;

