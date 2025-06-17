// Gerenciador de Favoritos
class Favorites {
    constructor() {
        this.favorites = [];
        this.init();
    }

    async init() {
        // Carregar favoritos se o usuário estiver logado
        if (auth && auth.isLoggedIn()) {
            await this.loadFavorites();
            this.setupEventListeners();
        } else {
            // Adicionar listener para quando o usuário fizer login
            document.addEventListener('authStateChanged', async () => {
                if (auth && auth.isLoggedIn()) {
                    await this.loadFavorites();
                    this.setupEventListeners();
                }
            });
        }
    }

    async loadFavorites() {
        try {
            if (!auth.isLoggedIn()) {
                console.log('Usuário não está logado. Não é possível carregar favoritos.');
                return;
            }

            const { data, error } = await supabaseClient
                .from('favorites')
                .select('product_id')
                .eq('user_id', auth.getCurrentUser().id);

            if (error) {
                console.error('Erro ao carregar favoritos:', error);
                return;
            }

            this.favorites = data ? data.map(item => item.product_id) : [];
            console.log('Favoritos carregados:', this.favorites);
            
            // Atualizar ícones de coração na página
            this.updateHeartIcons();
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
        }
    }

    setupEventListeners() {
        // Adicionar evento de clique nos corações
        document.addEventListener('click', async (e) => {
            const target = e.target;
            
            // Verificar se o clique foi em um coração
            if (target.closest('.product-fav')) {
                e.preventDefault();
                
                // Verificar se o usuário está logado
                if (!auth.isLoggedIn()) {
                    alert('Você precisa estar logado para adicionar produtos aos favoritos.');
                    window.location.href = 'login.html';
                    return;
                }
                
                const productItem = target.closest('.product-item');
                if (!productItem) return;
                
                // Obter ID do produto do link
                const productLink = productItem.querySelector('a');
                if (!productLink) return;
                
                const productUrl = new URL(productLink.href, window.location.origin);
                const productId = productUrl.searchParams.get('id');
                
                if (!productId) {
                    console.error('ID do produto não encontrado');
                    return;
                }
                
                // Toggle favorito
                await this.toggleFavorite(productId);
                
                // Atualizar ícone do coração
                this.updateProductHeartIcon(productItem, productId);
            }
        });
    }

    async toggleFavorite(productId) {
        try {
            const isFavorite = this.favorites.includes(productId);
            
            if (isFavorite) {
                // Remover dos favoritos
                const { error } = await supabaseClient
                    .from('favorites')
                    .delete()
                    .eq('user_id', auth.getCurrentUser().id)
                    .eq('product_id', productId);
                
                if (error) {
                    console.error('Erro ao remover favorito:', error);
                    return;
                }
                
                this.favorites = this.favorites.filter(id => id !== productId);
                console.log('Produto removido dos favoritos:', productId);
            } else {
                // Adicionar aos favoritos
                const { error } = await supabaseClient
                    .from('favorites')
                    .insert({
                        user_id: auth.getCurrentUser().id,
                        product_id: productId
                    });
                
                if (error) {
                    console.error('Erro ao adicionar favorito:', error);
                    return;
                }
                
                this.favorites.push(productId);
                console.log('Produto adicionado aos favoritos:', productId);
            }
        } catch (error) {
            console.error('Erro ao alternar favorito:', error);
        }
    }

    updateHeartIcons() {
        // Atualizar todos os ícones de coração na página
        const productItems = document.querySelectorAll('.product-item');
        
        productItems.forEach(item => {
            const productLink = item.querySelector('a');
            if (!productLink) return;
            
            const productUrl = new URL(productLink.href, window.location.origin);
            const productId = productUrl.searchParams.get('id');
            
            if (!productId) return;
            
            this.updateProductHeartIcon(item, productId);
        });
    }

    updateProductHeartIcon(productItem, productId) {
        const heartIcon = productItem.querySelector('.product-fav img');
        if (!heartIcon) return;
        
        const isFavorite = this.favorites.includes(productId);
        
        if (isFavorite) {
            // Coração preenchido (vermelho)
            heartIcon.src = 'assets/images/ui/heart-3-fill.png';
            heartIcon.classList.add('favorite');
        } else {
            // Coração vazio (normal)
            heartIcon.src = 'assets/images/ui/heart-3-line.png';
            heartIcon.classList.remove('favorite');
        }
    }

    isFavorite(productId) {
        return this.favorites.includes(productId);
    }

    getFavorites() {
        return this.favorites;
    }
}

// Instância global de favoritos
const favorites = new Favorites();

// Exportar para uso global
window.favorites = favorites;
