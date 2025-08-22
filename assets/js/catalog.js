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

    updateFilterButtons() {
        // Обновляем обработчики для существующих кнопок
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.setupFilterButtons();
        
        // Показываем/скрываем кнопки на основе доступных категорий
        this.filterButtons.forEach(button => {
            const category = button.dataset.category;
            if (category === 'all') {
                button.style.display = 'block'; // Всегда показываем "Все товары"
                return;
            }
            
            // Проверяем есть ли товары в этой категории
            const hasProducts = window.CAKES_DATA && window.CAKES_DATA.some(product => product.category === category);
            button.style.display = hasProducts ? 'block' : 'none';
        });
    }

    filterProducts(category) {
        this.currentCategory = category;
        this.renderFilteredProducts(category);
    }

    renderFilteredProducts(category) {
        if (!this.productsGrid) return;

        // Проверяем что данные загружены
        if (!window.CAKES_DATA || window.CAKES_DATA.length === 0) {
            this.productsGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">Загрузка товаров...</p>';
            return;
        }

        // Фильтруем товары
        let filteredProducts;
        if (category === 'all') {
            filteredProducts = window.CAKES_DATA;
        } else {
            filteredProducts = window.CAKES_DATA.filter(cake => cake.category === category);
        }

        // Очищаем сетку и добавляем отфильтрованные товары
        this.productsGrid.innerHTML = '';

        if (filteredProducts.length === 0) {
            this.productsGrid.innerHTML = `
                <div class="no-results">
                    <h3>Товары не найдены</h3>
                    <p>В этой категории пока нет товаров</p>
                </div>
            `;
            return;
        }

        filteredProducts.forEach(cake => {
            const productCard = this.createProductCard(cake);
            this.productsGrid.appendChild(productCard);
        });
    }

    renderProducts() {
        // Используем текущую категорию для фильтрации
        this.renderFilteredProducts(this.currentCategory);
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
        if (!window.CAKES_DATA || window.CAKES_DATA.length === 0) {
            this.productsGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">Данные еще загружаются...</p>';
            return;
        }

        const filteredCakes = window.CAKES_DATA.filter(cake => 
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
    
    // Listen for data updates from API
    window.addEventListener('dataLoaded', (event) => {
        console.log('Data updated, re-rendering products...');
        // Update global references
        window.CAKES_DATA = event.detail.products;
        window.CATEGORIES = event.detail.categories;
        
        // Re-render products with new data
        window.catalogManager.renderProducts();
        
        // Update filter buttons with new categories
        window.catalogManager.updateFilterButtons();
    });
});
