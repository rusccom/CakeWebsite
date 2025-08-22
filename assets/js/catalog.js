// Catalog functionality
class CatalogManager {
    constructor() {
        this.currentCategory = 'all';
        this.productsGrid = document.getElementById('productsGrid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.init();
    }

    init() {
        this.setupFilterButtons();
        this.renderProducts();
    }

    setupFilterButtons() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterProducts(category);
                this.updateActiveFilter(e.target);
            });
        });
    }

    updateActiveFilter(activeButton) {
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    filterProducts(category) {
        this.currentCategory = category;
        const productCards = this.productsGrid.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            if (category === 'all' || cardCategory === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    renderProducts() {
        if (!this.productsGrid) return;

        this.productsGrid.innerHTML = '';

        CAKES_DATA.forEach(cake => {
            const productCard = this.createProductCard(cake);
            this.productsGrid.appendChild(productCard);
        });
    }

    createProductCard(cake) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.category = cake.category;
        card.style.cursor = 'pointer';
        
        // Get main image (first from images array or fallback to image property)
        const mainImage = cake.images && cake.images.length > 0 ? cake.images[0] : cake.image;
        
        card.innerHTML = `
            <img src="${mainImage}" alt="${cake.title}" class="product-image" loading="lazy">
            <div class="product-info">
                <h3 class="product-title">${cake.title}</h3>
                <p class="product-description">${cake.description}</p>
                <div class="product-details">
                    <span class="weight">${cake.weight}</span>
                    <span class="serves">${cake.serves}</span>
                </div>
                <div class="product-price">${this.formatPrice(cake.price)}</div>
                <div class="product-view-hint">
                    <span class="hint-text">Подробнее</span>
                </div>
            </div>
        `;

        // Add click event to open modal
        card.addEventListener('click', () => {
            if (window.productModal) {
                window.productModal.openModal(cake.id);
            }
        });

        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });

        return card;
    }



    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    // Method for searching products
    searchProducts(searchTerm) {
        const filteredCakes = CAKES_DATA.filter(cake => 
            cake.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cake.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.productsGrid.innerHTML = '';
        filteredCakes.forEach(cake => {
            const productCard = this.createProductCard(cake);
            this.productsGrid.appendChild(productCard);
        });

        // If no results found
        if (filteredCakes.length === 0) {
            this.productsGrid.innerHTML = `
                <div class="no-results">
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить поисковый запрос</p>
                </div>
            `;
        }
    }
}

// Initialize catalog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.catalogManager = new CatalogManager();
});
