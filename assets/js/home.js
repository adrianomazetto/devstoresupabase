// BANNER
let banners = document.querySelectorAll(".banner-area a");
let counters = document.querySelectorAll(".banner-counter-item");
let currentBanner = 0;
let bannerInterval;

counters.forEach((item, key) => {
    item.addEventListener("click", () => {
        currentBanner = key;
        showBanner(key);
        restartBannerTimer();
    });
});

restartBannerTimer();

function showBanner(n) {
    for (let banner of banners) {
        banner.classList.remove("active");
    }
    for (let counter of counters) {
        counter.classList.remove("active");
    }

    banners[n].classList.add("active");
    counters[n].classList.add("active");
}

function restartBannerTimer() {
    clearInterval(bannerInterval);
    bannerInterval = setInterval(nextBanner, 2000);
}

function nextBanner() {
    if (currentBanner + 1 >= banners.length) {
        currentBanner = 0;
    } else {
        currentBanner++;
    }

    showBanner(currentBanner);
}

// PRODUTOS
async function loadProducts() {
    console.log("Iniciando carregamento de produtos...");
    try {
        // Verificar se o supabaseClient está disponível
        if (!supabaseClient) {
            console.error("ERRO: supabaseClient não está definido!");
            document.querySelectorAll(".products-area").forEach(area => {
                area.innerHTML = `<div class="error">Erro: Cliente Supabase não inicializado</div>`;
            });
            return;
        }
        
        console.log("Fazendo requisição ao Supabase...");
        const { data, error } = await supabaseClient
            .from("products")
            .select("*")
            .order("name");

        if (error) {
            console.error("Erro ao carregar produtos:", error);
            document.querySelectorAll(".products-area").forEach(area => {
                area.innerHTML = `<div class="error">Erro ao carregar produtos: ${error.message}</div>`;
            });
            return;
        }

        console.log("Produtos recebidos do Supabase:", data);
        console.log("Quantidade de produtos:", data ? data.length : 0);
        
        renderProducts(data || []);
    } catch (err) {
        console.error("Erro inesperado ao carregar produtos:", err);
        document.querySelectorAll(".products-area").forEach(area => {
            area.innerHTML = `<div class="error">Erro inesperado: ${err.message}</div>`;
        });
    }
}

function renderProducts(products) {
    console.log("Iniciando renderização de produtos...");
    const productsAreaMostViewed = document.querySelector(".product-list:nth-of-type(1) .products-area");
    const productsAreaBestSellers = document.querySelector(".product-list:nth-of-type(2) .products-area");

    if (!productsAreaMostViewed || !productsAreaBestSellers) {
        console.error("ERRO: Elementos da área de produtos não encontrados!");
        return;
    }

    console.log("Limpando áreas de produtos...");
    productsAreaMostViewed.innerHTML = "";
    productsAreaBestSellers.innerHTML = "";

    if (!products || products.length === 0) {
        console.log("Nenhum produto encontrado para exibir");
        productsAreaMostViewed.innerHTML = 
            `<div class="no-products">
                <h3>Nenhum produto cadastrado</h3>
                <p>Cadastre produtos na página de administração para que apareçam aqui.</p>
            </div>`;
        productsAreaBestSellers.innerHTML = 
            `<div class="no-products">
                <h3>Nenhum produto cadastrado</h3>
                <p>Cadastre produtos na página de administração para que apareçam aqui.</p>
            </div>`;
        return;
    }

    // Limitar a 4 produtos para cada seção
    console.log("Limitando a 4 produtos por seção...");
    const mostViewedProducts = products.slice(0, 4);
    const bestSellerProducts = products.slice(0, 4); // Poderia ser uma ordenação diferente se tivesse dados de vendas
    
    console.log("Produtos mais vistos:", mostViewedProducts);
    console.log("Produtos mais vendidos:", bestSellerProducts);

    // Renderizar produtos mais vistos (limitado a 4)
    console.log("Renderizando produtos mais vistos...");
    mostViewedProducts.forEach((product, index) => {
        console.log(`Renderizando produto mais visto #${index + 1}:`, product);
        try {
            if (!product || !product.id || !product.name || product.price === undefined) {
                console.error(`Produto inválido #${index}:`, product);
                return;
            }
            
            const productItem = `
                <div class="product-item">
                    <a href="product.html?id=${product.id}">
                        <div class="product-photo">
                            <img src="${product.image_url || 'assets/images/products/default.png'}" alt="${product.name}" />
                        </div>
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</div>
                        <div class="product-info">Pagamento via PIX</div>
                    </a>
                    <div class="product-fav">
                        <img src="assets/images/ui/heart-3-line.png" alt="" />
                    </div>
                </div>
            `;
            productsAreaMostViewed.innerHTML += productItem;
            console.log(`Produto mais visto #${index + 1} renderizado com sucesso`);
        } catch (err) {
            console.error(`Erro ao renderizar produto mais visto #${index}:`, err);
        }
    });
    
    // Renderizar produtos mais vendidos (limitado a 4)
    console.log("Renderizando produtos mais vendidos...");
    bestSellerProducts.forEach((product, index) => {
        console.log(`Renderizando produto mais vendido #${index + 1}:`, product);
        try {
            if (!product || !product.id || !product.name || product.price === undefined) {
                console.error(`Produto inválido #${index}:`, product);
                return;
            }
            
            const productItem = `
                <div class="product-item">
                    <a href="product.html?id=${product.id}">
                        <div class="product-photo">
                            <img src="${product.image_url || 'assets/images/products/default.png'}" alt="${product.name}" />
                        </div>
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</div>
                        <div class="product-info">Pagamento via PIX</div>
                    </a>
                    <div class="product-fav">
                        <img src="assets/images/ui/heart-3-line.png" alt="" />
                    </div>
                </div>
            `;
            productsAreaBestSellers.innerHTML += productItem;
            console.log(`Produto mais vendido #${index + 1} renderizado com sucesso`);
        } catch (err) {
            console.error(`Erro ao renderizar produto mais vendido #${index}:`, err);
        }
    });
}

// Inicializar carregamento de produtos quando a página carregar
document.addEventListener("DOMContentLoaded", loadProducts);


