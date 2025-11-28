let shopState = {
    currentProducts: [], 
    currentPage: 1,
    itemsPerPage: 12
};
document.addEventListener('DOMContentLoaded', () => {
    initShop();
});
async function initShop() {
    let attempts = 0;
    while (Object.keys(websiteData.computerParts).length === 0 && attempts < 20) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }
    renderShopCategories();
    updateCurrentProducts(getAllProducts());
    setupShopEventListeners();
}
function updateCurrentProducts(products) {
    shopState.currentProducts = products;
    shopState.currentPage = 1;
    renderPage();
}
function getAllProducts() {
    let allProducts = [];
    CATEGORIES.forEach(cat => {
        const parts = websiteData.computerParts[cat.id] || [];
        parts.forEach(p => p._categoryName = cat.name);
        allProducts = allProducts.concat(parts);
    });
    return allProducts;
}
function renderShopCategories() {
    const list = document.getElementById('shop-categories');
    if (!list) return;
    let html = `
        <li class="category-item active" data-category="all">
            <i class="fa-solid fa-layer-group"></i> All Products
        </li>
    `;
    html += CATEGORIES.map(cat => `
        <li class="category-item" data-category="${cat.id}">
            <i class="fa-solid ${cat.icon}"></i> ${cat.name}
        </li>
    `).join('');
    list.innerHTML = html;
}
function renderPage() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    const { currentProducts, currentPage, itemsPerPage } = shopState;
    const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = currentProducts.slice(start, end);
    if (pageItems.length === 0) {
        grid.innerHTML = '<div class="no-results">No products found.</div>';
    } else {
        grid.innerHTML = pageItems.map(part => createProductCardHTML(part)).join('');
    }
    renderPaginationControls(totalPages);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function createProductCardHTML(part) {
    const imagePath = part.image ? `assets/Product-images/${part.image}` : 'assets/placeholder.png';
    return `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${imagePath}" alt="${part.name}" class="product-image" onerror="this.src='assets/placeholder.png'">
            </div>
            <div class="product-info">
                <div class="product-category">${part._categoryName || 'Component'}</div>
                <h3 class="product-name">${part.name}</h3>
                <div class="product-specs">${formatSpecsShort(part)}</div>
                <div class="product-footer">
                    <div class="product-price">${formatPrice(part.price)}</div>
                    <button class="button transparent-button button-sm" onclick='addToCart(${JSON.stringify(part).replace(/'/g, "&#39;")})'>Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}
function renderPaginationControls(totalPages) {
    const existingNav = document.querySelector('.pagination-nav');
    if (existingNav) existingNav.remove();
    if (totalPages <= 1) return;
    const nav = document.createElement('nav');
    nav.className = 'pagination-nav';
    let html = '';
    html += `<button class="page-button prev" ${shopState.currentPage === 1 ? 'disabled' : ''} data-page="${shopState.currentPage - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
    const maxVisible = 7;
    let startPage = 1;
    let endPage = totalPages;
    if (totalPages > maxVisible) {
        if (shopState.currentPage <= 4) {
            endPage = maxVisible;
        } else if (shopState.currentPage >= totalPages - 3) {
            startPage = totalPages - maxVisible + 1;
        } else {
            startPage = shopState.currentPage - 3;
            endPage = shopState.currentPage + 3;
        }
    }
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-button ${i === shopState.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="page-button next" ${shopState.currentPage === totalPages ? 'disabled' : ''} data-page="${shopState.currentPage + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
    nav.innerHTML = html;
    const container = document.querySelector('.shop-content');
    container.appendChild(nav);
    nav.addEventListener('click', (e) => {
        const button = e.target.closest('.page-button');
        if (!button || button.disabled) return;
        const newPage = parseInt(button.dataset.page);
        if (newPage >= 1 && newPage <= totalPages) {
            shopState.currentPage = newPage;
            renderPage();
        }
    });
}
function formatSpecsShort(part) {
    if (window.formatSpecs) return window.formatSpecs(part);
    return '';
}
function setupShopEventListeners() {
    document.getElementById('shop-categories')?.addEventListener('click', (e) => {
        const item = e.target.closest('.category-item');
        if (!item) return;
        document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        const categoryId = item.dataset.category;
        const title = document.getElementById('category-title');
        let products = [];
        if (categoryId === 'all') {
            title.innerText = 'All Products';
            products = getAllProducts();
        } else {
            const catConfig = CATEGORIES.find(c => c.id === categoryId);
            title.innerText = catConfig.name;
            products = websiteData.computerParts[categoryId] || [];
            products.forEach(p => p._categoryName = catConfig.name);
        }
        document.getElementById('shop-search').value = '';
        document.getElementById('shop-sort').value = 'default';
        updateCurrentProducts(products);
    });
    document.getElementById('shop-search')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        applyFilters(query, document.getElementById('shop-sort').value);
    });
    document.getElementById('shop-sort')?.addEventListener('change', (e) => {
        const query = document.getElementById('shop-search').value.toLowerCase();
        applyFilters(query, e.target.value);
    });
}
function applyFilters(searchQuery, sortMode) {
    const activeCat = document.querySelector('.category-item.active')?.dataset.category || 'all';
    let products = [];
    if (activeCat === 'all') {
        products = getAllProducts();
    } else {
        const catConfig = CATEGORIES.find(c => c.id === activeCat);
        products = websiteData.computerParts[activeCat] || [];
        products.forEach(p => p._categoryName = catConfig.name);
    }
    if (searchQuery) {
        products = products.filter(p => p.name.toLowerCase().includes(searchQuery));
    }
    if (sortMode === 'price-asc') products.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortMode === 'price-desc') products.sort((a, b) => (b.price || 0) - (a.price || 0));
    updateCurrentProducts(products);
}
