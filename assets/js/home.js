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
    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("name");

    if (error) {
        console.error("Erro ao carregar produtos:", error);
        return;
    }

    renderProducts(data);
}

function renderProducts(products) {
    const productLists = document.querySelectorAll(".product-list .products-area");
    
    if (productLists.length < 2) {
        console.error("Não foi possível encontrar as seções de produtos");
        return;
    }

    const productsAreaMostViewed = productLists[0];
    const productsAreaBestSellers = productLists[1];

    productsAreaMostViewed.innerHTML = "";
    productsAreaBestSellers.innerHTML = "";

    if (products.length === 0) {
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

    products.forEach(product => {
        const productItem = `
            <div class="product-item">
                <a href="product.html?id=${product.id}">
                    <div class="product-photo">
                        <img src="${product.image_url || 'assets/images/products/default.png'}" alt="${product.name}" />
                    </div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                    <div class="product-info">Pagamento via PIX</div>
                </a>
                <div class="product-fav">
                    <img src="assets/images/ui/heart-3-line.png" alt="" />
                </div>
            </div>
        `;
        productsAreaMostViewed.innerHTML += productItem;
        productsAreaBestSellers.innerHTML += productItem;
    });
}


// Inicializar carregamento de produtos quando a página carregar
document.addEventListener("DOMContentLoaded", loadProducts);
