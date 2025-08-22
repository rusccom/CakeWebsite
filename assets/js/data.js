// Data manager for loading products and categories from JSON
class DataManager {
    constructor() {
        this.data = null;
        this.products = [];
        this.categories = {};
    }

    async loadData() {
        try {
            // Загружаем данные через PHP API
            const response = await fetch('api.php');
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            
            this.data = await response.json();
            console.log('Data loaded from PHP API:', this.data.products?.length || 0, 'products');
        } catch (error) {
            console.error('PHP API failed:', error.message);
            console.error('Убедитесь что файл api.php доступен на сервере');
            this.loadFallbackData();
            return false;
        }
        
        // Process loaded data
        this.products = this.data.products || [];
        
        // Convert categories array to object for backward compatibility
        this.categories = {};
        this.categories.all = "Все торты";
        
        if (this.data.categories) {
            this.data.categories.forEach(cat => {
                this.categories[cat.id] = cat.name;
            });
        }
        
        // Convert products data for backward compatibility with existing code
        this.products = this.products.map(product => ({
            ...product,
            image: product.photos && product.photos.length > 0 
                ? `data/photos/${product.photos[0]}` 
                : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
            images: product.photos 
                ? product.photos.map(photo => `data/photos/${photo}`)
                : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop'],
            fullDescription: product.description // Use single description field
        }));
        
        return true;
    }

    loadFallbackData() {
        // Original hardcoded data as fallback (simplified)
        this.products = [
            {
                id: 1,
                title: "Шоколадный рай",
                description: "Многослойный шоколадный торт с кремом из бельгийского шоколада и ягодами",
                price: 2500,
                category: "chocolate",
                image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
                images: [
                    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&h=500&fit=crop"
                ],
                weight: "1.5 кг",
                serves: "8-10 человек",
                fullDescription: "Роскошный многослойный торт, созданный из лучших сортов бельгийского шоколада."
            },
            {
                id: 2,
                title: "Фруктовый восторг", 
                description: "Легкий бисквит с муссом из маракуйи и свежими фруктами",
                price: 2200,
                category: "fruit",
                image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
                images: [
                    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&h=500&fit=crop"
                ],
                weight: "1.2 кг",
                serves: "6-8 человек",
                fullDescription: "Воздушный бисквитный торт с тропическим муссом из маракуйи."
            }
        ];

        this.categories = {
            all: "Все торты",
            chocolate: "Шоколадные",
            fruit: "Фруктовые",
            cheesecake: "Чизкейки",
            wedding: "Свадебные",
            children: "Детские"
        };
    }

    getProducts() {
        return this.products;
    }

    getCategories() {
        return this.categories;
    }

    getProductById(id) {
        return this.products.find(product => product.id === parseInt(id));
    }

    getProductsByCategory(categoryId) {
        if (categoryId === 'all') {
            return this.products;
        }
        return this.products.filter(product => product.category === categoryId);
    }
}

// Initialize data manager
const dataManager = new DataManager();

// Load data on page load and export for global access
let CAKES_DATA = [];
let CATEGORIES = { all: "Все торты" };

// Initialize with fallback data first
dataManager.loadFallbackData();
CAKES_DATA = dataManager.getProducts();
CATEGORIES = dataManager.getCategories();

// Try to load from JSON, fallback gracefully if not available
dataManager.loadData().then(() => {
    CAKES_DATA = dataManager.getProducts();
    CATEGORIES = dataManager.getCategories();
    
    // Update global references
    window.CAKES_DATA = CAKES_DATA;
    window.CATEGORIES = CATEGORIES;
    
    // Trigger update for any existing components
    if (window.catalogManager) {
        window.catalogManager.renderProducts();
    }
    
    // Custom event for components that need to know when data is loaded
    window.dispatchEvent(new CustomEvent('dataLoaded', { 
        detail: { products: CAKES_DATA, categories: CATEGORIES }
    }));
});

// Export for backward compatibility and admin access
window.CAKES_DATA = CAKES_DATA;
window.CATEGORIES = CATEGORIES;
window.dataManager = dataManager;