// Product Modal functionality
class ProductModal {
    constructor() {
        this.modal = document.getElementById('productModal');
        this.closeBtn = document.getElementById('closeProductModal');
        this.currentProduct = null;
        this.currentImageIndex = 0;
        this.images = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
    }

    setupEventListeners() {
        // Close modal button
        this.closeBtn?.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Image navigation buttons
        document.getElementById('prevImage')?.addEventListener('click', () => {
            this.previousImage();
        });

        document.getElementById('nextImage')?.addEventListener('click', () => {
            this.nextImage();
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.modal?.classList.contains('active')) return;

            switch(e.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                    this.previousImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
            }
        });
    }

    openModal(productId) {
        const product = window.CAKES_DATA?.find(cake => cake.id === productId);
        if (!product) {
            console.error('Product not found:', productId, 'Available products:', window.CAKES_DATA?.length);
            return;
        }

        this.currentProduct = product;
        this.images = product.images || [product.image];
        this.currentImageIndex = 0;

        this.populateModal(product);
        this.updateGallery();
        
        this.modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        this.modal?.focus();
    }

    closeModal() {
        this.modal?.classList.remove('active');
        document.body.style.overflow = '';
        this.currentProduct = null;
        this.images = [];
        this.currentImageIndex = 0;
    }

    populateModal(product) {
        // Set title
        const titleElement = document.getElementById('modalProductTitle');
        if (titleElement) {
            titleElement.textContent = product.title;
        }

        // Set description
        const descElement = document.getElementById('modalProductDescription');
        if (descElement) {
            descElement.textContent = product.fullDescription || product.description;
        }

        // Set specifications
        document.getElementById('modalProductWeight').textContent = product.weight;
        document.getElementById('modalProductPrice').textContent = this.formatPrice(product.price);
        document.getElementById('modalProductCategory').textContent = window.CATEGORIES?.[product.category] || product.category;


    }



    updateGallery() {
        if (this.images.length === 0) return;

        // Update main image
        const mainImage = document.getElementById('modalMainImage');
        if (mainImage) {
            mainImage.src = this.images[this.currentImageIndex];
            mainImage.alt = this.currentProduct?.title || '';
        }

        // Update image counter
        document.getElementById('currentImageIndex').textContent = this.currentImageIndex + 1;
        document.getElementById('totalImages').textContent = this.images.length;

        // Update thumbnails
        this.updateThumbnails();

        // Show/hide navigation buttons
        this.updateNavigationButtons();
    }

    updateThumbnails() {
        const thumbnailsContainer = document.getElementById('galleryThumbnails');
        if (!thumbnailsContainer) return;

        thumbnailsContainer.innerHTML = this.images.map((image, index) => `
            <img src="${image}" 
                 alt="${this.currentProduct?.title || ''} ${index + 1}" 
                 class="thumbnail ${index === this.currentImageIndex ? 'active' : ''}"
                 onclick="window.productModal.setCurrentImage(${index})">
        `).join('');
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevImage');
        const nextBtn = document.getElementById('nextImage');

        if (this.images.length <= 1) {
            prevBtn?.style.setProperty('display', 'none');
            nextBtn?.style.setProperty('display', 'none');
        } else {
            prevBtn?.style.setProperty('display', 'flex');
            nextBtn?.style.setProperty('display', 'flex');
        }
    }

    setCurrentImage(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentImageIndex = index;
            this.updateGallery();
        }
    }

    previousImage() {
        if (this.images.length <= 1) return;
        
        this.currentImageIndex = this.currentImageIndex === 0 
            ? this.images.length - 1 
            : this.currentImageIndex - 1;
        this.updateGallery();
    }

    nextImage() {
        if (this.images.length <= 1) return;
        
        this.currentImageIndex = this.currentImageIndex === this.images.length - 1 
            ? 0 
            : this.currentImageIndex + 1;
        this.updateGallery();
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price) + ' руб.';
    }

    // Method to handle touch/swipe gestures for mobile
    setupTouchNavigation() {
        let startX = null;
        let startY = null;

        const gallery = document.querySelector('.gallery-main');
        if (!gallery) return;

        gallery.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        gallery.addEventListener('touchend', (e) => {
            if (startX === null || startY === null) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only trigger if horizontal swipe is more significant than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextImage(); // Swipe left - next image
                } else {
                    this.previousImage(); // Swipe right - previous image
                }
            }

            startX = null;
            startY = null;
        });
    }

    // Method for preloading images for better performance
    preloadImages() {
        if (!this.currentProduct || !this.images) return;

        this.images.forEach(imageSrc => {
            const img = new Image();
            img.src = imageSrc;
        });
    }
}

// Initialize product modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productModal = new ProductModal();
});
