// Gerenciador do Carrinho de Compras
class Cart {
    constructor() {
        this.items = [];
        this.init();
    }

    async init() {
        // Carregar itens do carrinho do Supabase se o usuário estiver logado
        if (auth && auth.isLoggedIn()) {
            await this.loadCartFromDatabase();
        } else {
            // Carregar do localStorage se não estiver logado
            this.loadCartFromLocalStorage();
        }
        this.updateCartUI();
    }

    async loadCartFromDatabase() {
        try {
            const { data, error } = await supabaseClient
                .from('cart')
                .select(`
                    id,
                    quantity,
                    products (
                        id,
                        name,
                        price,
                        image_url
                    )
                `)
                .eq('user_id', auth.getCurrentUser().id);

            if (error) {
                console.error('Erro ao carregar carrinho:', error);
                return;
            }

            this.items = data.map(item => ({
                cartId: item.id,
                productId: item.products.id,
                name: item.products.name,
                price: item.products.price,
                image: item.products.image_url,
                quantity: item.quantity
            }));
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
        }
    }

    loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('b7store_cart');
        if (savedCart) {
            try {
                this.items = JSON.parse(savedCart);
            } catch (error) {
                console.error('Erro ao carregar carrinho do localStorage:', error);
                this.items = [];
            }
        }
    }

    saveCartToLocalStorage() {
        localStorage.setItem('b7store_cart', JSON.stringify(this.items));
    }

    async addItem(product) {
        const existingItem = this.items.find(item => item.productId === product.id);
        
        if (existingItem) {
            // Se o produto já existe, aumenta a quantidade
            await this.updateQuantity(product.id, existingItem.quantity + 1);
        } else {
            // Adiciona novo produto
            const newItem = {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image_url,
                quantity: 1
            };

            if (auth && auth.isLoggedIn()) {
                // Salvar no banco de dados
                try {
                    const { data, error } = await supabaseClient
                        .from('cart')
                        .insert({
                            user_id: auth.getCurrentUser().id,
                            product_id: product.id,
                            quantity: 1
                        })
                        .select()
                        .single();

                    if (error) {
                        throw error;
                    }

                    newItem.cartId = data.id;
                } catch (error) {
                    console.error('Erro ao adicionar item ao carrinho:', error);
                    return false;
                }
            }

            this.items.push(newItem);
            this.saveCartToLocalStorage();
        }

        this.updateCartUI();
        this.showAddToCartMessage(product.name);
        return true;
    }

    async removeItem(productId) {
        const itemIndex = this.items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) return false;

        const item = this.items[itemIndex];

        if (auth && auth.isLoggedIn() && item.cartId) {
            // Remover do banco de dados
            try {
                const { error } = await supabaseClient
                    .from('cart')
                    .delete()
                    .eq('id', item.cartId);

                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error('Erro ao remover item do carrinho:', error);
                return false;
            }
        }

        this.items.splice(itemIndex, 1);
        this.saveCartToLocalStorage();
        this.updateCartUI();
        return true;
    }

    async updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            return await this.removeItem(productId);
        }

        const item = this.items.find(item => item.productId === productId);
        if (!item) return false;

        if (auth && auth.isLoggedIn() && item.cartId) {
            // Atualizar no banco de dados
            try {
                const { error } = await supabaseClient
                    .from('cart')
                    .update({ quantity: newQuantity })
                    .eq('id', item.cartId);

                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error('Erro ao atualizar quantidade:', error);
                return false;
            }
        }

        item.quantity = newQuantity;
        this.saveCartToLocalStorage();
        this.updateCartUI();
        return true;
    }

    async clearCart() {
        if (auth && auth.isLoggedIn()) {
            // Limpar do banco de dados
            try {
                const { error } = await supabaseClient
                    .from('cart')
                    .delete()
                    .eq('user_id', auth.getCurrentUser().id);

                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error('Erro ao limpar carrinho:', error);
                return false;
            }
        }

        this.items = [];
        this.saveCartToLocalStorage();
        this.updateCartUI();
        return true;
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartUI() {
        // Atualizar contador no header
        this.updateCartCounter();
        // Atualizar página de checkout se estiver aberta
        this.updateCheckoutPage();
    }

    updateCartCounter() {
        const cartIcon = document.querySelector('a[href="checkout.html"], a[href="checkout"]');
        if (cartIcon) {
            const count = this.getItemCount();
            
            // Remover contador existente
            const existingCounter = cartIcon.querySelector('.cart-counter');
            if (existingCounter) {
                existingCounter.remove();
            }

            // Adicionar novo contador se houver itens
            if (count > 0) {
                const counter = document.createElement('span');
                counter.className = 'cart-counter';
                counter.textContent = count;
                counter.style.cssText = `
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #ff4444;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                `;
                cartIcon.style.position = 'relative';
                cartIcon.appendChild(counter);
            }
        }
    }

    updateCheckoutPage() {
        const checkoutContainer = document.getElementById('checkout-items');
        const checkoutTotal = document.getElementById('checkout-total');
        const cartTitle = document.querySelector('.checkout-title');

        if (checkoutContainer) {
            if (this.items.length === 0) {
                checkoutContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
                if (checkoutTotal) checkoutTotal.textContent = 'R$ 0,00';
                if (cartTitle) cartTitle.textContent = `Sua sacola de compras ( 0 itens )`;
                return;
            }

            // Atualizar título do carrinho
            if (cartTitle) {
                cartTitle.textContent = `Sua sacola de compras ( ${this.getItemCount()} itens )`;
            }

            let html = '';
            this.items.forEach(item => {
                html += `
                    <div class="checkout-item" data-product-id="${item.productId}">
                        <div class="item-image">
                            <img src="${item.image || 'assets/images/products/default.png'}" alt="${item.name}" />
                        </div>
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p class="item-price">R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div class="item-quantity">
                            <button class="qty-btn" onclick="cart.updateQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn" onclick="cart.updateQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                        </div>
                        <div class="item-total">
                            R$ ${(parseFloat(item.price) * item.quantity).toFixed(2).replace('.', ',')}
                        </div>
                        <button class="remove-btn" onclick="cart.removeItem('${item.productId}')">
                            <img src="assets/images/ui/trash.png" alt="Remover" />
                        </button>
                    </div>
                `;
            });

            checkoutContainer.innerHTML = html;

            if (checkoutTotal) {
                checkoutTotal.textContent = `R$ ${this.getTotal().toFixed(2).replace('.', ',')}`;
            }
        }
    }

    showAddToCartMessage(productName) {
        // Remover mensagem existente se houver
        const existingMessage = document.querySelector('.cart-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Criar nova mensagem
        const message = document.createElement('div');
        message.className = 'cart-message';
        message.textContent = 'Produto adicionado ao carrinho!';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(message);

        // Remover mensagem após 3 segundos
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }

    // Método para ser chamado pelo product.js
    async addProduct(product) {
        return await this.addItem(product);
    }
}

// Inicializar carrinho quando a página carregar
let cart;
document.addEventListener('DOMContentLoaded', async function() {
    // Aguardar o auth estar pronto se existir
    if (typeof auth !== 'undefined' && auth.loadUser) {
        await auth.loadUser();
    }
    cart = new Cart();
});

