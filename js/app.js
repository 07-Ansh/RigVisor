const CATEGORIES = [
    { id: 'cpu', name: 'CPU', icon: 'fa-microchip', file: 'cpus.json' },
    { id: 'motherboard', name: 'Motherboard', icon: 'fa-server', file: 'motherboards.json' },
    { id: 'gpu', name: 'Graphics Card', icon: 'fa-gamepad', file: 'gpus.json' },
    { id: 'ram', name: 'Memory', icon: 'fa-memory', file: 'ram.json' },
    { id: 'storage', name: 'Storage', icon: 'fa-hdd', file: 'storage.json' },
    { id: 'psu', name: 'Power Supply', icon: 'fa-plug', file: 'psu.json' },
    { id: 'case', name: 'Case', icon: 'fa-box', file: 'cases.json' },
    { id: 'cooler', name: 'CPU Cooler', icon: 'fa-fan', file: 'cooler.json' },
    { id: 'monitor', name: 'Monitor', icon: 'fa-desktop', file: 'monitor.json' },
    { id: 'keyboard', name: 'Keyboard', icon: 'fa-keyboard', file: 'keyboard.json' },
    { id: 'mouse', name: 'Mouse', icon: 'fa-mouse', file: 'mouse.json' },
    { id: 'headphones', name: 'Headphones', icon: 'fa-headphones', file: 'headphones.json' }
];
const CURRENCY_SYMBOL = '₹';
const websiteData = {
    computerParts: {},
    currentCategory: null,
    build: {},
    cart: []
};
window.websiteData = websiteData;
async function startWebsite() {
    loadCart();
    updateCartBadge();
    await loadAllData();
    displayCategories();
    setupEventListeners();
    setupAccordion();
    const urlParams = new URLSearchParams(window.location.search);
    const prebuildId = urlParams.get('prebuild');
    if (prebuildId) {
        await loadPrebuildFromUrl(prebuildId);
    }
    refreshBuildDisplay();
}
async function loadAllData() {
    await Promise.all(
        CATEGORIES.map(async (category) => {
            try {
                const response = await fetch(`data/${category.file}`);
                if (!response.ok) throw new Error(`Failed to load ${category.file}`);
                websiteData.computerParts[category.id] = await response.json();
            } catch (error) {
                console.error(error);
                websiteData.computerParts[category.id] = [];
            }
        })
    );
}
function displayCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;
    grid.innerHTML = CATEGORIES.map(({ id, icon, name }) => `
        <div class="category-box" data-category="${id}">
            <i class="fa-solid ${icon}"></i>
            <div class="category-name">${name}</div>
        </div>
    `).join('');
    grid.addEventListener('click', (e) => {
        const card = e.target.closest('.category-box');
        if (card) openPartSelector(card.dataset.category);
    });
}
function setupEventListeners() {
    document.querySelector('.close-modal')
        ?.addEventListener('click', closePartSelector);
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        document.querySelector('.menu-links').classList.toggle('mobile-open');
    });
    document.getElementById('search-parts')
        ?.addEventListener('input', (e) => renderPartsList(e.target.value));
    document.getElementById('sort-parts')
        ?.addEventListener('change', () => renderPartsList());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePartSelector();
    });
    document.getElementById('selected-parts')?.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-part');
        if (removeBtn) {
            removeFromBuild(removeBtn.dataset.category);
        }
    });
    document.getElementById('parts-list')?.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-part-button');
        if (addBtn) {
            addToBuild(addBtn.dataset.id);
        }
    });
    document.getElementById('reset-build')?.addEventListener('click', resetBuild);
    document.getElementById('export-build')?.addEventListener('click', exportBuild);
    document.getElementById('add-build-to-cart')?.addEventListener('click', addBuildToCart);
}
function setupAccordion() {
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(acc => {
        acc.addEventListener('click', function () {
            const item = this.parentElement;
            item.classList.toggle('active');
            const content = this.nextElementSibling;
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });
}
function addToBuild(partId) {
    const categoryId = websiteData.currentCategory;
    const part = websiteData.computerParts[categoryId].find(p => p.id === partId);
    if (part) {
        websiteData.build[categoryId] = part;
        refreshBuildDisplay();
        closePartSelector();
    }
}
function removeFromBuild(categoryId) {
    delete websiteData.build[categoryId];
    refreshBuildDisplay();
}
async function loadPrebuildFromUrl(id) {
    try {
        const response = await fetch('data/prebuilds.json');
        if (!response.ok) throw new Error('Failed to load prebuilds');
        const prebuilds = await response.json();
        const build = prebuilds.find(p => p.id === id);
        if (build && build.specs) {
            for (const [category, partId] of Object.entries(build.specs)) {
                const parts = websiteData.computerParts[category];
                if (parts) {
                    const part = parts.find(p => p.id === partId);
                    if (part) {
                        websiteData.build[category] = part;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading prebuild:', error);
    }
}
function resetBuild() {
    if (Object.keys(websiteData.build).length === 0) return;
    if (confirm('Are you sure you want to reset your build? All selected parts will be cleared.')) {
        websiteData.build = {};
        refreshBuildDisplay();
    }
}
function exportBuild() {
    const buildKeys = Object.keys(websiteData.build);
    if (buildKeys.length === 0) {
        alert('Your build is empty! Select some parts before exporting.');
        return;
    }
    let exportText = "RigVisor - Custom PC Build\n";
    exportText += "================================\n\n";
    let totalPrice = 0;
    CATEGORIES.forEach(cat => {
        const part = websiteData.build[cat.id];
        if (part) {
            exportText += `[${cat.name}]\n`;
            exportText += `${part.name}\n`;
            exportText += `Price: ${formatPrice(part.price)}\n`;
            exportText += `Specs: ${formatSpecs(part)}\n\n`;
            totalPrice += (part.price || 0);
        }
    });
    exportText += "================================\n";
    exportText += `Total Price: ${formatPrice(totalPrice)}\n`;
    exportText += "================================\n";
    exportText += `Generated on: ${new Date().toLocaleString()}\n`;
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rigvisor-build.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function refreshBuildDisplay() {
    const container = document.getElementById('selected-parts');
    const priceEl = document.getElementById('total-price');
    const statusEl = document.getElementById('compatibility-status');
    if (!container) return;
    const selectedCategories = CATEGORIES.filter(cat => websiteData.build[cat.id]);
    if (selectedCategories.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 20px;">No parts selected yet.</p>`;
    } else {
        container.innerHTML = selectedCategories.map(cat => {
            const part = websiteData.build[cat.id];
            return `
                <div class="selected-part-item">
                    <div class="selected-part-header">
                        <span class="selected-part-category">${cat.name}</span>
                        <button class="remove-part" data-category="${cat.id}"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <div class="selected-part-name">${part.name}</div>
                    <div class="selected-part-price">${formatPrice(part.price)}</div>
                </div>
            `;
        }).join('');
    }
    const total = Object.values(websiteData.build).reduce((sum, part) => sum + (part.price || 0), 0);
    if (priceEl) priceEl.innerText = formatPrice(total);
    statusEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> Compatible`;
    calculatePerformance();
    document.querySelectorAll('.category-box').forEach(card => {
        const categoryId = card.dataset.category;
        if (websiteData.build[categoryId]) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}
function getCompatibleParts(category, parts) {
    const build = websiteData.build;
    return parts.filter(part => {
        if (category === 'cpu' && build.motherboard) {
            return part.socket === build.motherboard.socket;
        }
        if (category === 'motherboard' && build.cpu) {
            return part.socket === build.cpu.socket;
        }
        if (category === 'ram' && build.motherboard) {
            return part.type === build.motherboard.ram_type;
        }
        if (category === 'motherboard' && build.ram) {
            return part.ram_type === build.ram.type;
        }
        if (category === 'case' && build.motherboard) {
            return isFormFactorCompatible(part.form_factor, build.motherboard.form_factor);
        }
        if (category === 'motherboard' && build.case) {
            return isFormFactorCompatible(build.case.form_factor, part.form_factor);
        }
        if (category === 'gpu' && build.case && build.case.max_gpu_length) {
            return (part.length || 0) <= build.case.max_gpu_length;
        }
        if (category === 'case' && build.gpu && part.max_gpu_length) {
            return (build.gpu.length || 0) <= part.max_gpu_length;
        }
        return true;
    });
}
function isFormFactorCompatible(caseFF, boardFF) {
    if (!caseFF || !boardFF) return true;
    const caseLower = caseFF.toLowerCase();
    const boardLower = boardFF.toLowerCase();
    if (caseLower.includes('eatx') || caseLower.includes('full tower')) return true;
    if (caseLower.includes('atx mid') || caseLower === 'atx') {
        return ['atx', 'micro', 'mini'].some(f => boardLower.includes(f));
    }
    if (caseLower.includes('micro')) {
        return boardLower.includes('micro') || boardLower.includes('mini');
    }
    if (caseLower.includes('mini')) {
        return boardLower.includes('mini');
    }
    return true;
}
function calculatePerformance() {
    const build = websiteData.build;
    let cpuScore = 0;
    let gpuScore = 0;
    let ramScore = 0;
    if (build.cpu) {
        const cores = build.cpu.cores || 4;
        const clock = build.cpu.boost_clock || 3.5;
        cpuScore = (cores * 5) + (clock * 15);
    }
    if (build.gpu) {
        const vram = build.gpu.vram || 2;
        const price = build.gpu.price || 5000;
        gpuScore = (vram * 15) + (price / 500);
    }
    if (build.ram) {
        const capacity = build.ram.capacity || 8;
        const speed = build.ram.speed || 2400;
        ramScore = (capacity * 3) + (speed / 100);
    }
    const MAX_CPU_SCORE = 200;
    const MAX_GPU_SCORE = 400;
    const MAX_RAM_SCORE = 150;
    const normCpu = Math.min(cpuScore / MAX_CPU_SCORE, 1);
    const normGpu = Math.min(gpuScore / MAX_GPU_SCORE, 1);
    const normRam = Math.min(ramScore / MAX_RAM_SCORE, 1);
    let gamingScore = (normCpu * 0.25) + (normGpu * 0.65) + (normRam * 0.10);
    let workstationScore = (normCpu * 0.50) + (normGpu * 0.20) + (normRam * 0.30);
    const gamingPct = Math.round(gamingScore * 100);
    const workstationPct = Math.round(workstationScore * 100);
    updateScoreUI('gaming', gamingPct);
    updateScoreUI('workstation', workstationPct);
}
function updateScoreUI(type, score) {
    const bar = document.getElementById(`score-${type}`);
    const val = document.getElementById(`score-${type}-val`);
    if (bar) bar.style.width = `${score}%`;
    if (val) val.innerText = `${score}%`;
    if (bar) {
        bar.style.backgroundColor = score > 75 ? '#2ecc71' : score > 40 ? '#f1c40f' : '#e74c3c';
    }
}
function openPartSelector(categoryId) {
    websiteData.currentCategory = categoryId;
    const modal = document.getElementById('part-selector-modal');
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category || !modal) return;
    document.getElementById('modal-title').innerText = `Select ${category.name}`;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('active'), 10);
    renderPartsList();
}
function closePartSelector() {
    const modal = document.getElementById('part-selector-modal');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => modal.classList.add('hidden'), 300);
}
function renderPartsList(query = '') {
    const listContainer = document.getElementById('parts-list');
    if (!listContainer) return;
    let parts = websiteData.computerParts[websiteData.currentCategory] || [];
    parts = getCompatibleParts(websiteData.currentCategory, parts);
    const sortMode = document.getElementById('sort-parts')?.value;
    parts = parts.filter(part =>
        part.name.toLowerCase().includes(query.toLowerCase())
    );
    if (sortMode === 'price-asc') parts.sort((a, b) => a.price - b.price);
    if (sortMode === 'price-desc') parts.sort((a, b) => b.price - a.price);
    listContainer.innerHTML = parts.map(part => `
        <div class="part-item">
            <div class="part-info">
                <div class="part-name">${part.name}</div>
                <div class="part-specs">${formatSpecs(part)}</div>
                <div class="part-price">${formatPrice(part.price)}</div>
            </div>
            <button class="button blue-button button-sm add-part-button" data-id="${part.id}" style="margin-left: 1rem;">Add</button>
        </div>
    `).join('');
}
function formatSpecs(part) {
    const specs = [];
    if (part.socket) specs.push(part.socket);
    if (part.form_factor) specs.push(part.form_factor);
    if (part.speed) specs.push(`${part.speed} MHz`);
    if (part.capacity) specs.push(`${part.capacity} GB`);
    if (part.core_count) specs.push(`${part.core_count} Cores`);
    if (part.wattage) specs.push(`${part.wattage}W`);
    if (part.vram) specs.push(`${part.vram} GB VRAM`);
    return specs.join(' • ');
}
function formatPrice(price) {
    if (price == null) return 'N/A';
    return `${CURRENCY_SYMBOL}${Number(price).toLocaleString('en-IN')}`;
}

function updatePCImage() {
    const pcImage = document.querySelector('.main-section-visual img');
    if (pcImage) {
        if (document.body.classList.contains('dark-mode')) {
            pcImage.src = 'assets/Main-image/pc4.jpeg';
        } else {
            pcImage.src = 'assets/Main-image/pc-light.jpeg';
        }
    }
}

(function () {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
})();
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');

    
    updatePCImage();

    if (document.body.classList.contains('dark-mode')) {
    }
    themeToggle?.addEventListener('click', () => {
        
        themeToggle.classList.add('ripple-effect');
        setTimeout(() => {
            themeToggle.classList.remove('ripple-effect');
        }, 600);

        
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 500);

        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }

        
        updatePCImage();
    });
});
function loadCart() {
    const savedCart = localStorage.getItem('rigvisor_cart');
    if (savedCart) {
        try {
            websiteData.cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Failed to parse cart', e);
            websiteData.cart = [];
        }
    }
}
function saveCart() {
    localStorage.setItem('rigvisor_cart', JSON.stringify(websiteData.cart));
    updateCartBadge();
}
function addToCart(part) {
    websiteData.cart.push(part);
    saveCart();
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.style.transform = 'scale(1.5)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }
    alert(`${part.name} added to cart!`);
}
function removeFromCart(index) {
    websiteData.cart.splice(index, 1);
    saveCart();
}
function updateCartBadge() {
    const badges = document.querySelectorAll('#cart-badge');
    const count = websiteData.cart.length;
    badges.forEach(badge => {
        badge.innerText = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    });
}
function addBuildToCart() {
    const buildParts = Object.values(websiteData.build);
    if (buildParts.length === 0) {
        alert('Your build is empty! Select some parts first.');
        return;
    }
    if (confirm(`Add ${buildParts.length} items to your cart?`)) {
        buildParts.forEach(part => {
            websiteData.cart.push(part);
        });
        saveCart();
        alert('All parts added to cart!');
        window.location.href = 'cart.html';
    }
}
startWebsite();
