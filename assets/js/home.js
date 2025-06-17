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
    
    // Selecionar todas as áreas de produtos
    const productAreas = document.querySelectorAll(".products-area");
    console.log("Áreas de produtos encontradas:", productAreas.length);
    
    // Verificar se encontrou pelo menos duas áreas
    if (productAreas.length < 2) {
        console.error("ERRO: Não foram encontradas áreas suficientes para produtos!");
        return;
    }
    
    // Usar as duas primeiras áreas encontradas
    const productsAreaMostViewed = productAreas[0];
    const productsAreaBestSellers = productAreas[1];
    
    console.log("Área de produtos mais vistos:", productsAreaMostViewed);
    console.log("Área de produtos mais vendidos:", productsAreaBestSellers);

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

    // Limitar a 4 produtos para cada seção com diferenciação
    console.log("Limitando a 4 produtos por seção com diferenciação...");
    
    // Para produtos mais vistos: ordenar por nome (ordem alfabética)
    const mostViewedProducts = [...products]
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 4);
    
    // Para produtos mais vendidos: ordenar por preço (do menor para o maior)
    const bestSellerProducts = [...products]
        .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        .slice(0, 4);
    
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


