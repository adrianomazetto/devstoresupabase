// Gerenciador da Página de Produto
class ProductPage {
    constructor() {
        this.currentProduct = null;
        this.init();
    }

    async init() {
        // Obter ID do produto da URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("id");

        if (!productId) {
            this.showError("Produto não encontrado");
            return;
        }

        // Carregar dados do produto
        await this.loadProduct(productId);
        
        // Configurar eventos
        this.setupEvents();
    }

    async loadProduct(productId) {
        try {
            const { data, error } = await supabaseClient
                .from("products")
                .select("*")
                .eq("id", productId)
                .single();

            if (error) {
                console.error("Erro ao carregar produto:", error);
                this.showError("Erro ao carregar produto");
                return;
            }

            if (!data) {
                this.showError("Produto não encontrado");
                return;
            }

            this.currentProduct = data;
            this.renderProduct(data);

        } catch (error) {
            console.error("Erro ao carregar produto:", error);
            this.showError("Erro ao carregar produto");
        }
    }

    renderProduct(product) {
        // Atualizar imagem do produto
        const productImage = document.querySelector(".photo img");
        if (productImage) {
            productImage.src = product.image_url || "assets/images/products/default.png";
            productImage.alt = product.name;
        }

        // Atualizar nome do produto
        const productName = document.querySelector(".info .name");
        if (productName) {
            productName.textContent = product.name;
        }

        // Atualizar preço
        const priceElement = document.querySelector(".info .price-to");
        if (priceElement) {
            priceElement.textContent = `R$ ${product.price.toFixed(2).replace(".", ",")}`;
        }

        // Atualizar descrição
        const descriptionElement = document.querySelector(".desc-body");
        if (descriptionElement) {
            descriptionElement.textContent = product.description || "Descrição não disponível.";
        }

        // Atualizar breadcrumb
        const breadcrumb = document.querySelector(".breadcrumb");
        if (breadcrumb) {
            breadcrumb.textContent = `Home > ${product.category || "Produtos"} > ${product.name}`;
        }

        // Atualizar título da página
        document.title = `${product.name} - B7Store`;
    }

    setupEvents() {
        // Evento para adicionar ao carrinho
        const addToCartBtn = document.getElementById("add-to-cart-btn");
        if (addToCartBtn) {
            addToCartBtn.addEventListener("click", () => {
                this.addToCart();
            });
        }

        // Evento para adicionar aos favoritos
        const favoriteBtn = document.querySelector(`.buttons .btn-icon img[src*="heart-3-line.png"]`);
        if (favoriteBtn && this.currentProduct) {
            const favoriteContainer = favoriteBtn.parentElement;
            
            // Verificar se o produto já está nos favoritos e atualizar visual
            this.updateFavoriteButton();
            
            // Adicionar evento de clique
            favoriteContainer.addEventListener("click", async () => {
                await this.toggleFavorite();
            });
        }

        // Evento para área de descrição (manter funcionalidade existente)
        const descButton = document.querySelector(".desc-header .btn-icon");
        const descBody = document.querySelector(".desc-body");
        
        if (descButton && descBody) {
            descButton.addEventListener("click", () => {
                if (descBody.style.display === "none") {
                    descBody.style.display = "block";
                } else {
                    descBody.style.display = "none";
                }
            });
        }
    }

    async updateFavoriteButton() {
        const favoriteBtn = document.querySelector(`.buttons .btn-icon img[src*="heart-3-line.png"]`);
        if (favoriteBtn && this.currentProduct) {
            const isFavorite = await checkIfFavorite(this.currentProduct.id);
            const favoriteContainer = favoriteBtn.parentElement;
            
            if (isFavorite) {
                favoriteContainer.classList.add("favorite");
            } else {
                favoriteContainer.classList.remove("favorite");
            }
        }
    }

    async toggleFavorite() {
        if (!this.currentProduct) return;
        
        const favoriteBtn = document.querySelector(`.buttons .btn-icon img[src*="heart-3-line.png"]`);
        const favoriteContainer = favoriteBtn.parentElement;
        
        try {
            const result = await toggleFavorite(this.currentProduct.id, favoriteContainer);
            
            if (result.success) {
                this.showMessage(result.message, "success");
                
                // Adicionar classe de animação
                favoriteContainer.classList.add("pulse");
                setTimeout(() => {
                    favoriteContainer.classList.remove("pulse");
                }, 500);
            } else {
                this.showMessage(result.message, "error");
                if (result.redirectToLogin) {
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                }
            }
        } catch (error) {
            console.error("Erro ao alternar favorito:", error);
            this.showMessage("Erro ao processar favorito", "error");
        } 
    }

    async addToCart() {
        if (!this.currentProduct) {
            this.showMessage("Produto não encontrado", "error");
            return;
        }

        try {
            // Verificar se o usuário está logado
            if (!auth.isLoggedIn()) {
                // Para usuários não logados, usar localStorage
                this.addToLocalCart();
                this.showMessage("Produto adicionado ao carrinho!", "success");
                this.updateCartCounter();
                return;
            }

            // Para usuários logados, salvar no banco de dados
            const { data: existingItem, error: selectError } = await supabaseClient
                .from("cart")
                .select("*")
                .eq("user_id", auth.currentUser.id)
                .eq("product_id", this.currentProduct.id)
                .single();

            if (selectError && selectError.code !== "PGRST116") {
                console.error("Erro ao verificar carrinho:", selectError);
                this.showMessage("Erro ao adicionar produto ao carrinho", "error");
                return;
            }

            if (existingItem) {
                // Produto já existe no carrinho, incrementar quantidade
                const { error: updateError } = await supabaseClient
                    .from("cart")
                    .update({ quantity: existingItem.quantity + 1 })
                    .eq("id", existingItem.id);

                if (updateError) {
                    console.error("Erro ao atualizar carrinho:", updateError);
                    this.showMessage("Erro ao adicionar produto ao carrinho", "error");
                    return;
                }
            } else {
                // Produto não existe no carrinho, adicionar novo
                const { error: insertError } = await supabaseClient
                    .from("cart")
                    .insert({
                        user_id: auth.currentUser.id,
                        product_id: this.currentProduct.id,
                        quantity: 1
                    });

                if (insertError) {
                    console.error("Erro ao adicionar ao carrinho:", insertError);
                    this.showMessage("Erro ao adicionar produto ao carrinho", "error");
                    return;
                }
            }

            this.showMessage("Produto adicionado ao carrinho!", "success");
            this.updateCartCounter();

        } catch (error) {
            console.error("Erro ao adicionar ao carrinho:", error);
            this.showMessage("Erro ao adicionar produto ao carrinho", "error");
        }
    }

    addToLocalCart() {
        // Para usuários não logados, usar localStorage
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");
        
        const existingItemIndex = cart.findIndex(item => item.id === this.currentProduct.id);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
                id: this.currentProduct.id,
                name: this.currentProduct.name,
                price: this.currentProduct.price,
                image_url: this.currentProduct.image_url,
                quantity: 1
            });
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    updateCartCounter() {
        // Atualizar contador do carrinho no header
        if (typeof updateCartCounter === "function") {
            updateCartCounter();
        }
    }

    showMessage(message, type = "info") {
        // Criar elemento de mensagem
        const messageDiv = document.createElement("div");
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            ${type === "success" ? "background-color: #4CAF50;" : "background-color: #f44336;"}
        `;

        document.body.appendChild(messageDiv);

        // Remover mensagem após 3 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    showError(message) {
        // Redirecionar para página inicial em caso de erro
        this.showMessage(message, "error");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    }
}

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", function() {
    new ProductPage();
});



