// Admin Panel Application
class AdminApp {
    constructor() {
        this.isAuthenticated = false;
        this.currentSection = 'products';
        this.data = { products: [], categories: [] };
        this.currentProduct = null;
        this.currentCategory = null;
        this.selectedPhotos = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    }

    setupEventListeners() {
        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        document.getElementById('passwordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Product Modal
        document.getElementById('addProductBtn').addEventListener('click', () => this.openProductModal());
        document.getElementById('closeProductModal').addEventListener('click', () => this.closeProductModal());
        document.getElementById('cancelProduct').addEventListener('click', () => this.closeProductModal());
        document.getElementById('productForm').addEventListener('submit', (e) => this.saveProduct(e));

        // Category Modal  
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.openCategoryModal());
        document.getElementById('closeCategoryModal').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('cancelCategory').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('categoryForm').addEventListener('submit', (e) => this.saveCategory(e));

        // Photo Upload
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('photoInput').click();
        });
        document.getElementById('photoInput').addEventListener('change', (e) => this.handlePhotoUpload(e));

        // Confirm Modal
        document.getElementById('closeConfirmModal').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('cancelConfirm').addEventListener('click', () => this.closeConfirmModal());

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // Authentication
    checkAuthentication() {
        const isAuth = sessionStorage.getItem('adminAuth') === 'true';
        if (isAuth) {
            this.isAuthenticated = true;
            this.showAdminPanel();
        } else {
            this.showLoginScreen();
        }
    }

    login() {
        const password = document.getElementById('passwordInput').value;
        const correctPassword = '12341';

        if (password === correctPassword) {
            this.isAuthenticated = true;
            sessionStorage.setItem('adminAuth', 'true');
            this.showAdminPanel();
            document.getElementById('errorMessage').style.display = 'none';
        } else {
            document.getElementById('errorMessage').style.display = 'block';
            document.getElementById('passwordInput').value = '';
        }
    }

    logout() {
        this.isAuthenticated = false;
        sessionStorage.removeItem('adminAuth');
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }

    showAdminPanel() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        this.loadData();
    }

    // Data Management
    async loadData() {
        console.log('Loading data from PHP API...');
        
        try {
            const response = await fetch('api.php');
            console.log('API response:', response.status, response.ok);
            
            if (response.ok) {
                this.data = await response.json();
                console.log('Data loaded from API:', this.data);
            } else {
                throw new Error(`API returned ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading data from API:', error);
            console.log('API not available, using fallback data');
            this.loadFallbackData();
        }
        
        console.log('Final data:', this.data);
        this.renderCurrentSection();
        this.updateCategoryOptions();
    }

    // Fallback data for when JSON cannot be loaded (local file limitations)
    loadFallbackData() {
        this.data = {
            categories: [
                {
                    id: 'chocolate',
                    name: 'Шоколадные',
                    description: 'Торты на основе шоколада и какао',
                    created: '2024-01-01T00:00:00.000Z',
                    color: '#8B4513'
                },
                {
                    id: 'fruit',
                    name: 'Фруктовые',
                    description: 'Легкие торты с фруктами и ягодами',
                    created: '2024-01-01T00:00:00.000Z',
                    color: '#FF6347'
                },
                {
                    id: 'cheesecake',
                    name: 'Чизкейки',
                    description: 'Нежные творожные торты',
                    created: '2024-01-01T00:00:00.000Z',
                    color: '#FFD700'
                },
                {
                    id: 'wedding',
                    name: 'Свадебные',
                    description: 'Торты для свадебных торжеств',
                    created: '2024-01-01T00:00:00.000Z',
                    color: '#FF69B4'
                },
                {
                    id: 'children',
                    name: 'Детские',
                    description: 'Яркие торты для детских праздников',
                    created: '2024-01-01T00:00:00.000Z',
                    color: '#32CD32'
                }
            ],
            products: [
                {
                    id: 1,
                    title: 'Шоколадный рай',
                    description: 'Роскошный многослойный торт, созданный из лучших сортов бельгийского шоколада. Каждый корж пропитан ароматным шоколадным сиропом, а между слоями располагается нежнейший крем на основе натурального какао. Украшен свежими ягодами и шоколадными завитками.',
                    price: 2500,
                    category: 'chocolate',
                    weight: '1.5 кг',
                    serves: '8-10 человек',
                    photos: ['cake-1-1.jpg', 'cake-1-2.jpg', 'cake-1-3.jpg'],
                    created: '2024-01-01T00:00:00.000Z',
                    updated: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 2,
                    title: 'Фруктовый восторг',
                    description: 'Воздушный бисквитный торт с тропическим муссом из маракуйи. Каждый слой наполнен ароматом экзотических фруктов, а нежная текстура мусса создает неповторимое вкусовое ощущение. Декорирован свежими фруктами и съедобными цветами.',
                    price: 2200,
                    category: 'fruit',
                    weight: '1.2 кг',
                    serves: '6-8 человек',
                    photos: ['cake-2-1.jpg', 'cake-2-2.jpg', 'cake-2-3.jpg'],
                    created: '2024-01-01T00:00:00.000Z',
                    updated: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 3,
                    title: 'Классический чизкейк',
                    description: 'Традиционный американский чизкейк на хрустящей основе из печенья Орео. Нежнейшая творожная начинка из сливочного сыра Philadelphia создает идеальный баланс кислинки и сладости. Подается с домашним ягодным соусом.',
                    price: 1800,
                    category: 'cheesecake',
                    weight: '1 кг',
                    serves: '6-8 человек',
                    photos: ['cake-3-1.jpg', 'cake-3-2.jpg', 'cake-3-3.jpg'],
                    created: '2024-01-01T00:00:00.000Z',
                    updated: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 4,
                    title: 'Красный бархат',
                    description: 'Знаменитый американский торт Red Velvet с характерным красным цветом и бархатистой текстурой. Нежные коржи сочетаются с классическим кремчизом, а украшения из белого шоколада придают торту элегантный вид.',
                    price: 2800,
                    category: 'chocolate',
                    weight: '1.5 кг',
                    serves: '8-10 человек',
                    photos: ['cake-4-1.jpg', 'cake-4-2.jpg', 'cake-4-3.jpg'],
                    created: '2024-01-01T00:00:00.000Z',
                    updated: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 5,
                    title: 'Свадебный трёхъярусный',
                    description: 'Роскошный трехъярусный свадебный торт, созданный для самого важного дня в жизни. Каждый ярус выполнен в классическом стиле с утонченными розами из крема и жемчужными бусинами. Внутри - нежные ванильные коржи с клубничной начинкой.',
                    price: 8500,
                    category: 'wedding',
                    weight: '4 кг',
                    serves: '30-40 человек',
                    photos: ['cake-5-1.jpg', 'cake-5-2.jpg', 'cake-5-3.jpg'],
                    created: '2024-01-01T00:00:00.000Z',
                    updated: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 6,
                    title: 'Детский единорог',
                    description: 'Волшебный торт для детского праздника в стиле единорога. Яркие слои крема всех цветов радуги, съедобный рог из белого шоколада и мерцающая посыпка создают настоящую сказку. Внутри - ванильный бисквит с клубничной начинкой.',
                    price: 3200,
                    category: 'children',
                    weight: '2 кг',
                    serves: '12-15 человек',
                    photos: ['cake-6-1.jpg', 'cake-6-2.jpg', 'cake-6-3.jpg'],
                    created: '2024-01-01T00:00:00.000Z',
                    updated: '2024-01-01T00:00:00.000Z'
                }
            ]
        };
    }

    async saveData() {
        try {
            console.log('Saving data to PHP API...');
            
            const response = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log('Data saved successfully:', result);
                this.showNotification('Данные сохранены успешно!', 'success');
                
                // Обновляем основной сайт если он открыт в другой вкладке
                if (window.opener && window.opener.dataManager) {
                    window.opener.dataManager.loadData();
                }
                
                return true;
            } else {
                throw new Error(result.error || 'Ошибка сохранения');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification(`Ошибка сохранения: ${error.message}`, 'error');
            return false;
        }
    }

    // UI Management
    switchSection(section) {
        this.currentSection = section;
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });
        
        // Update sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.style.display = sec.id === section + 'Section' ? 'block' : 'none';
        });
        
        this.renderCurrentSection();
    }

    renderCurrentSection() {
        if (this.currentSection === 'products') {
            this.renderProducts();
        } else if (this.currentSection === 'categories') {
            this.renderCategories();
        }
    }

    renderProducts() {
        const container = document.getElementById('productsList');
        
        if (this.data.products.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Пока нет товаров. Добавьте первый товар!</p>';
            return;
        }
        
        container.innerHTML = this.data.products.map(product => {
            const category = this.data.categories.find(cat => cat.id === product.category);
            const categoryName = category ? category.name : product.category;
            
            return `
                <div class="product-item">
                    <div class="item-header">
                        <h3 class="item-title">${product.title}</h3>
                        <div class="item-actions">
                            <button class="edit-btn" onclick="adminApp.editProduct(${product.id})">✏️ Редактировать</button>
                            <button class="delete-btn" onclick="adminApp.confirmDeleteProduct(${product.id})">🗑️ Удалить</button>
                        </div>
                    </div>
                    <div class="item-info">
                        <div class="info-item">
                            <span class="info-label">Категория:</span>
                            <span>${categoryName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Цена:</span>
                            <span>${product.price} ₽</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Вес:</span>
                            <span>${product.weight || 'Не указан'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Порций:</span>
                            <span>${product.serves || 'Не указано'}</span>
                        </div>
                    </div>
                    <p style="margin: 1rem 0; color: #6b7280;">${product.description}</p>
                    ${product.photos && product.photos.length > 0 ? `
                        <div class="product-photos">
                            ${product.photos.slice(0, 4).map(photo => 
                                `<img src="data/photos/${photo}" alt="Фото товара" class="photo-thumb" 
                                     onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=60&h=60&fit=crop'">`
                            ).join('')}
                            ${product.photos.length > 4 ? `<span style="color: #6b7280;">+${product.photos.length - 4} фото</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    renderCategories() {
        const container = document.getElementById('categoriesList');
        
        if (this.data.categories.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Пока нет категорий. Добавьте первую категорию!</p>';
            return;
        }
        
        container.innerHTML = this.data.categories.map(category => {
            const productsCount = this.data.products.filter(p => p.category === category.id).length;
            
            return `
                <div class="category-item">
                    <div class="item-header">
                        <h3 class="item-title" style="color: ${category.color || '#374151'}">${category.name}</h3>
                        <div class="item-actions">
                            <button class="edit-btn" onclick="adminApp.editCategory('${category.id}')">✏️ Редактировать</button>
                            <button class="delete-btn" onclick="adminApp.confirmDeleteCategory('${category.id}')">🗑️ Удалить</button>
                        </div>
                    </div>
                    <div class="item-info">
                        <div class="info-item">
                            <span class="info-label">ID:</span>
                            <span>${category.id}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Товаров:</span>
                            <span>${productsCount}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Цвет:</span>
                            <span style="background: ${category.color}; width: 20px; height: 20px; border-radius: 3px; display: inline-block; vertical-align: middle;"></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Создана:</span>
                            <span>${new Date(category.created).toLocaleDateString()}</span>
                        </div>
                    </div>
                    ${category.description ? `<p style="margin: 1rem 0; color: #6b7280;">${category.description}</p>` : ''}
                </div>
            `;
        }).join('');
    }

    updateCategoryOptions() {
        const select = document.getElementById('productCategory');
        select.innerHTML = '<option value="">Выберите категорию</option>';
        
        this.data.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Modal Management
    openProductModal(product = null) {
        this.currentProduct = product;
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        
        if (product) {
            title.textContent = 'Редактировать товар';
            this.populateProductForm(product);
        } else {
            title.textContent = 'Добавить товар';
            document.getElementById('productForm').reset();
            this.selectedPhotos = [];
            this.updatePhotoPreview();
        }
        
        modal.classList.add('active');
    }

    closeProductModal() {
        document.getElementById('productModal').classList.remove('active');
        this.currentProduct = null;
        this.selectedPhotos = [];
    }

    openCategoryModal(category = null) {
        this.currentCategory = category;
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        
        if (category) {
            title.textContent = 'Редактировать категорию';
            this.populateCategoryForm(category);
        } else {
            title.textContent = 'Добавить категорию';
            document.getElementById('categoryForm').reset();
        }
        
        modal.classList.add('active');
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('active');
        this.currentCategory = null;
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('active');
    }

    // Products CRUD
    populateProductForm(product) {
        document.getElementById('productTitle').value = product.title;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productWeight').value = product.weight || '';
        document.getElementById('productServes').value = product.serves || '';
        
        // Handle photos
        this.selectedPhotos = product.photos ? [...product.photos] : [];
        this.updatePhotoPreview();
    }

    async saveProduct(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('productTitle').value,
            description: document.getElementById('productDescription').value,
            price: parseInt(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            weight: document.getElementById('productWeight').value,
            serves: document.getElementById('productServes').value,
            photos: this.selectedPhotos
        };

        if (this.currentProduct) {
            // Edit existing product
            const index = this.data.products.findIndex(p => p.id === this.currentProduct.id);
            if (index !== -1) {
                this.data.products[index] = {
                    ...this.currentProduct,
                    ...formData,
                    updated: new Date().toISOString()
                };
            }
        } else {
            // Add new product
            const newProduct = {
                id: this.generateId(),
                ...formData,
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            };
            this.data.products.push(newProduct);
        }

        const saved = await this.saveData();
        if (saved) {
            this.closeProductModal();
            this.renderProducts();
        }
    }

    editProduct(productId) {
        const product = this.data.products.find(p => p.id === productId);
        if (product) {
            this.openProductModal(product);
        }
    }

    confirmDeleteProduct(productId) {
        const product = this.data.products.find(p => p.id === productId);
        if (product) {
            document.getElementById('confirmMessage').textContent = 
                `Вы уверены, что хотите удалить товар "${product.title}"?`;
            document.getElementById('confirmModal').classList.add('active');
            
            const confirmBtn = document.getElementById('confirmDelete');
            confirmBtn.onclick = () => this.deleteProduct(productId);
        }
    }

    async deleteProduct(productId) {
        this.data.products = this.data.products.filter(p => p.id !== productId);
        
        const saved = await this.saveData();
        if (saved) {
            this.closeConfirmModal();
            this.renderProducts();
        }
    }

    // Categories CRUD
    populateCategoryForm(category) {
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryColor').value = category.color || '#FF6B6B';
    }

    async saveCategory(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value,
            color: document.getElementById('categoryColor').value
        };

        if (this.currentCategory) {
            // Edit existing category
            const index = this.data.categories.findIndex(c => c.id === this.currentCategory.id);
            if (index !== -1) {
                this.data.categories[index] = {
                    ...this.currentCategory,
                    ...formData
                };
            }
        } else {
            // Add new category
            const newCategory = {
                id: 'custom-' + Date.now(),
                ...formData,
                created: new Date().toISOString()
            };
            this.data.categories.push(newCategory);
        }

        const saved = await this.saveData();
        if (saved) {
            this.closeCategoryModal();
            this.renderCategories();
            this.updateCategoryOptions();
        }
    }

    editCategory(categoryId) {
        const category = this.data.categories.find(c => c.id === categoryId);
        if (category) {
            this.openCategoryModal(category);
        }
    }

    confirmDeleteCategory(categoryId) {
        const category = this.data.categories.find(c => c.id === categoryId);
        const productsCount = this.data.products.filter(p => p.category === categoryId).length;
        
        if (category) {
            let message = `Вы уверены, что хотите удалить категорию "${category.name}"?`;
            if (productsCount > 0) {
                message += ` В этой категории ${productsCount} товаров. Они будут удалены вместе с категорией.`;
            }
            
            document.getElementById('confirmMessage').textContent = message;
            document.getElementById('confirmModal').classList.add('active');
            
            const confirmBtn = document.getElementById('confirmDelete');
            confirmBtn.onclick = () => this.deleteCategory(categoryId);
        }
    }

    async deleteCategory(categoryId) {
        // Remove category
        this.data.categories = this.data.categories.filter(c => c.id !== categoryId);
        
        // Remove products in this category
        this.data.products = this.data.products.filter(p => p.category !== categoryId);
        
        const saved = await this.saveData();
        if (saved) {
            this.closeConfirmModal();
            this.renderCategories();
            this.renderProducts();
            this.updateCategoryOptions();
        }
    }

    // Photo Management
    async handlePhotoUpload(e) {
        const files = Array.from(e.target.files);
        
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    // Показываем индикатор загрузки
                    this.showLoadingForPhoto(file.name);
                    
                    // Пробуем загрузить на сервер через API
                    const uploadedPhoto = await this.uploadPhotoToServer(file);
                    
                    if (uploadedPhoto) {
                        // Успешная загрузка на сервер
                        this.selectedPhotos.push(uploadedPhoto.filename);
                        console.log('Photo uploaded to server:', uploadedPhoto);
                    }
                } catch (error) {
                    console.error('Photo upload error:', error);
                    this.showNotification(`Ошибка загрузки ${file.name}: ${error.message}`, 'error');
                }
            }
        }
        
        this.updatePhotoPreview();
        // Clear the input
        e.target.value = '';
    }

    async uploadPhotoToServer(file) {
        try {
            const formData = new FormData();
            formData.append('photo', file);
            
            const response = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'X-Action': 'upload'
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                return result;
            } else {
                throw new Error(result.error || 'Ошибка загрузки на сервер');
            }
        } catch (error) {
            console.warn('Server upload failed:', error);
            throw error;
        }
    }



    showLoadingForPhoto(filename) {
        // Можно добавить индикатор загрузки в UI
        console.log(`Uploading ${filename}...`);
    }

    updatePhotoPreview() {
        const container = document.getElementById('photoPreview');
        
        container.innerHTML = this.selectedPhotos.map((photo, index) => {
            // Try server path first, then localStorage, then fallback
            const photoSrc = this.getPhotoUrl(photo);
            
            return `
                <div class="photo-preview-item">
                    <img src="${photoSrc}" alt="Фото ${index + 1}" class="photo-preview-img" 
                         onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&h=120&fit=crop'">
                    <button type="button" class="photo-remove-btn" onclick="adminApp.removePhoto(${index})">×</button>
                    ${index === 0 ? '<div style="position: absolute; bottom: 0; left: 0; background: #10b981; color: white; font-size: 0.75rem; padding: 0.25rem;">Главное</div>' : ''}
                </div>
            `;
        }).join('');
    }

    getPhotoUrl(photoName) {
        // Используем серверный путь через Python API
        return `/data/photos/${photoName}`;
    }

    async removePhoto(index) {
        const photoName = this.selectedPhotos[index];
        
        try {
            // Удаляем с сервера
            await this.deletePhotoFromServer(photoName);
            console.log('Photo deleted from server:', photoName);
            
            // Удаляем из списка
            this.selectedPhotos.splice(index, 1);
            
            this.updatePhotoPreview();
            this.showNotification('Фото удалено', 'success');
        } catch (error) {
            console.error('Failed to delete photo:', error);
            this.showNotification(`Ошибка удаления фото: ${error.message}`, 'error');
        }
    }

    async deletePhotoFromServer(photoName) {
        try {
            const response = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Action': 'delete_photo'
                },
                body: JSON.stringify({ filename: photoName })
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Ошибка удаления с сервера');
            }
            
            return true;
        } catch (error) {
            console.warn('Server delete failed:', error);
            throw error;
        }
    }

    // Utility
    generateId() {
        return Math.max(...this.data.products.map(p => p.id || 0)) + 1;
    }
}

// Initialize admin app
const adminApp = new AdminApp();

// Expose methods for onclick handlers
window.adminApp = adminApp;
