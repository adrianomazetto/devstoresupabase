let infoShown = '';
let infoButtons = document.querySelectorAll('.top-button');
let orderArea = document.querySelector('.order-area');
let filtersArea = document.querySelector('.products .filters');
let productsGrid = document.getElementById('products-grid');
let loadingElement = document.getElementById('loading-products');
let productCount = document.querySelector('.product-qt span');
let products = [];
let filteredProducts = [];

// Inicializar carregamento de produtos quando a página carregar
document.addEventListener("DOMContentLoaded", async () => {
    await loadProducts();
    setupEventListeners();
    
    // Aplicar filtro de categoria da URL, se existir
    applyUrlCategoryFilter();
});

// Obter parâmetros da URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        categoria: params.get('categoria')
    };
}

// Aplicar filtro de categoria da URL
function applyUrlCategoryFilter() {
    const { categoria } = getUrlParams();
    
    if (categoria) {
        // Atualizar breadcrumb com a categoria atual
        updateBreadcrumb(categoria);
        
        // Filtrar produtos pela categoria
        filterByCategory(categoria);
    }
}

// Atualizar breadcrumb com a categoria atual
function updateBreadcrumb(categoria) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb) {
        const categoryNames = {
            'camisetas': 'Camisetas',
            'kits': 'Kits B7Web',
            'acessorios': 'Acessórios',
            'eletronicos': 'Eletrônicos'
        };
        
        breadcrumb.innerHTML = `Home > ${categoryNames[categoria] || 'Produtos'}`;
    }
}

// Filtrar produtos por categoria
function filterByCategory(categoria) {
    if (!categoria) {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => product.category === categoria);
    }
    
    updateProductCount();
    renderProducts();
}

// Carregar produtos do Supabase
async function loadProducts() {
    try {
        const { data, error } = await supabaseClient
            .from("products")
            .select("*")
            .order("name");

        if (error) {
            console.error("Erro ao carregar produtos:", error);
            loadingElement.textContent = "Erro ao carregar produtos. Tente novamente mais tarde.";
            return;
        }

        products = data;
        filteredProducts = [...products];
        
        // Atualizar contador de produtos
        updateProductCount();
        
        // Renderizar produtos
        renderProducts();
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        loadingElement.textContent = "Erro ao carregar produtos. Tente novamente mais tarde.";
    }
}

// Renderizar produtos na grid
function renderProducts() {
    // Limpar grid
    productsGrid.innerHTML = "";
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <h3>Nenhum produto encontrado</h3>
                <p>Tente ajustar os filtros ou volte mais tarde.</p>
            </div>
        `;
        return;
    }

    // Renderizar cada produto
    filteredProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
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
        `;
        productsGrid.appendChild(productItem);
    });
}

// Atualizar contador de produtos
function updateProductCount() {
    if (productCount) {
        productCount.textContent = filteredProducts.length;
    }
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Botões de informação (ordenar/filtrar)
    infoButtons.forEach((item) => {
        item.addEventListener('click', () => {
            let name = item.getAttribute('data-name');
            if (name === infoShown) {
                infoShown = '';
            } else {
                infoShown = name;
            }
            renderInfo();
        });
    });

    // Ordenação
    const orderSelect = document.getElementById('order');
    if (orderSelect) {
        orderSelect.addEventListener('change', () => {
            sortProducts(orderSelect.value);
        });
    }

    // Ícones de filtro
    let filterIcons = document.querySelectorAll('.filter-icon');
    filterIcons.forEach(item => {
        item.addEventListener('click', () => {
            let body = item.closest('.filter').querySelector('.filter-body');
            if (body.style.display === 'none') {
                body.style.display = 'block';
            } else {
                body.style.display = 'none';
            }
        });
    });

    // Checkboxes de filtro
    const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            applyFilters();
        });
    });
}

// Ordenar produtos
function sortProducts(orderType) {
    switch (orderType) {
        case 'price':
            filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'bestselling':
            // Aqui você poderia ordenar por um campo de vendas, se existir
            // Por enquanto, vamos manter a ordem original
            filteredProducts = [...filteredProducts];
            break;
        case 'alpha':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    renderProducts();
}

// Aplicar filtros
function applyFilters() {
    // Aqui você implementaria a lógica de filtros baseada nos checkboxes selecionados
    // Por enquanto, vamos apenas manter todos os produtos
    filteredProducts = [...products];
    updateProductCount();
    renderProducts();
}

// Exibir/ocultar áreas de ordenação e filtros
function renderInfo() {
    orderArea.style.display = 'none';
    filtersArea.style.display = 'none';

    switch (infoShown) {
        case 'order':
            orderArea.style.display = 'block';
            break;
        case 'filter':
            filtersArea.style.display = 'block';
            break;
    }
}