// Main application functionality
class CakeShopApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupLazyLoading();
    }

    setupSmoothScrolling() {
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        // Create mobile menu toggle if screen is small
        if (window.innerWidth <= 768) {
            this.createMobileMenu();
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.createMobileMenu();
            } else {
                this.removeMobileMenu();
            }
        });
    }

    createMobileMenu() {
        const header = document.querySelector('.header-content');
        if (!header || header.querySelector('.mobile-menu-toggle')) return;

        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.innerHTML = '☰';
        toggle.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--primary-color);
            cursor: pointer;
            display: block;
            order: 3;
        `;

        const nav = header.querySelector('.nav');
        toggle.addEventListener('click', () => {
            nav.classList.toggle('mobile-open');
        });

        header.appendChild(toggle);

        // Add mobile styles to nav
        nav.style.cssText += `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            box-shadow: var(--shadow);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;

        nav.querySelector('.nav-list').style.cssText += `
            flex-direction: column;
            padding: 1rem;
            gap: 1rem;
        `;

        // Add mobile-open class styles
        const style = document.createElement('style');
        style.textContent = `
            .nav.mobile-open {
                transform: translateY(0) !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
        `;
        document.head.appendChild(style);
    }

    removeMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.nav');
        
        if (toggle) toggle.remove();
        if (nav) {
            nav.style.cssText = '';
            nav.classList.remove('mobile-open');
            nav.querySelector('.nav-list').style.cssText = '';
        }
    }

    setupScrollEffects() {
        // Add scroll effect to header
        let lastScrollY = 0;
        const header = document.querySelector('.header');

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'white';
                header.style.backdropFilter = 'none';
            }

            // Hide header on scroll down, show on scroll up
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
        });
    }

    setupLazyLoading() {
        // Simple lazy loading for images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            // Observe all images with data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Add animation classes for better UX
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate
    const elementsToAnimate = [
        '.product-card',
        '.contact-item',
        '.about-content',
        '.section-title'
    ];

    elementsToAnimate.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.cssText += `
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            `;
            observer.observe(el);
        });
    });

    // Add animate-in styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// Performance optimization
function optimizePerformance() {
    // Debounce scroll events
    let scrollTimeout;
    const originalScrollHandler = window.onscroll;
    
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            if (originalScrollHandler) originalScrollHandler();
        }, 10);
    }, { passive: true });
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CakeShopApp();
    addScrollAnimations();
    optimizePerformance();
    
    // Show loading complete
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// Add loading styles
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    body:not(.loaded) {
        overflow: hidden;
    }
    
    body:not(.loaded)::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fafbfc;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    body:not(.loaded)::after {
        content: '🎂';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        z-index: 10000;
        animation: bounce 1s ease-in-out infinite alternate;
    }
    
    @keyframes bounce {
        from { transform: translate(-50%, -50%) scale(1); }
        to { transform: translate(-50%, -50%) scale(1.1); }
    }
`;
document.head.appendChild(loadingStyle);
