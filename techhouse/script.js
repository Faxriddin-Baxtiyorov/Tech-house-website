// Tech House - Main JavaScript File

// Cart Management
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.classList.toggle('active', count > 0);
    });
}

// Wishlist Management
function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function updateWishlistCount() {
    const wishlist = getWishlist();
    const count = wishlist.length;
    document.querySelectorAll('.wishlist-count').forEach(el => {
        el.textContent = count;
        el.classList.toggle('active', count > 0);
    });
}

function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === productId);
}

function addToWishlist(productId, productName, productPrice, productImage) {
    let wishlist = getWishlist();
    
    // Check if already in wishlist
    if (isInWishlist(productId)) {
        if (typeof showNotification === 'function') {
            showNotification('Product already in wishlist');
        }
        return;
    }
    
    const numericPrice = parseFloat(productPrice.replace(/[^0-9.]/g, ''));
    
    wishlist.push({
        id: productId,
        name: productName,
        price: productPrice,
        numericPrice: numericPrice,
        image: productImage
    });
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    updateWishlistButtons();
    
    if (typeof showNotification === 'function') {
        showNotification('Added to wishlist');
    }
}

function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    updateWishlistButtons();
    
    // Reload wishlist page if we're on it
    if (typeof loadWishlistItems === 'function') {
        loadWishlistItems();
    }
    
    if (typeof showNotification === 'function') {
        showNotification('Removed from wishlist');
    }
}

function toggleWishlist(productId, productName, productPrice, productImage) {
    if (isInWishlist(productId)) {
        removeFromWishlist(productId);
    } else {
        addToWishlist(productId, productName, productPrice, productImage);
    }
}

function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const card = btn.closest('.product-card, article');
        if (card) {
            const productId = card.getAttribute('data-product-id');
            if (productId && isInWishlist(productId)) {
                btn.classList.add('active');
                btn.setAttribute('aria-label', 'Remove from wishlist');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-label', 'Add to wishlist');
            }
        }
    });
}

function isUserLoggedIn() {
    try {
        const user = localStorage.getItem('user');
        if (!user) return false;
        const userData = JSON.parse(user);
        return userData && (userData.name || userData.email);
    } catch (e) {
        return false;
    }
}

// Update header based on login status
function updateHeaderLoginStatus() {
    const loginBtn = document.getElementById('login-btn');
    const profileBtn = document.getElementById('profile-btn');
    const isLoggedIn = isUserLoggedIn();
    
    if (loginBtn) {
        loginBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
    }
    if (profileBtn) {
        profileBtn.style.display = isLoggedIn ? 'inline-flex' : 'none';
    }
    
    // Also handle pages without IDs
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        const existingLogin = headerActions.querySelector('a[href="login.html"]:not(#login-btn)');
        const existingProfile = headerActions.querySelector('a[href="profile.html"]:not(#profile-btn)');
        
        if (isLoggedIn) {
            if (existingLogin) existingLogin.style.display = 'none';
            if (existingProfile) existingProfile.style.display = 'inline-flex';
        } else {
            if (existingProfile) existingProfile.style.display = 'none';
            if (existingLogin) existingLogin.style.display = 'inline-flex';
        }
    }
}

function addToCart(productId, productName, productPrice, productImage) {
    try {
        // Get current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Extract numeric price
        const numericPrice = parseFloat(productPrice.replace(/[^0-9.]/g, '')) || 0;
        
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                numericPrice: numericPrice,
                image: productImage || '',
                quantity: 1
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Show notification
        if (typeof showNotification === 'function') {
            showNotification(`${productName} added to cart!`);
        } else {
            console.log(`${productName} added to cart!`);
        }
        
        // Reload cart if on basket page
        if (window.location.pathname.includes('basket.html') && typeof loadCartItems === 'function') {
            loadCartItems();
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding product to cart. Please try again.');
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (window.location.pathname.includes('basket.html') && typeof loadCartItems === 'function') {
        loadCartItems();
    }
}

function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            if (window.location.pathname.includes('basket.html') && typeof loadCartItems === 'function') {
                loadCartItems();
            }
        }
    }
}

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility function to escape HTML
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search Functionality
function initSearch() {
    const searchInputs = document.querySelectorAll('#search-input, #search-input-catalog, .search-box input');
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            performSearch(query);
        });
        
        // Also search on Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.toLowerCase().trim();
                performSearch(query);
            }
        });
        
        // Clear search on Escape
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                performSearch('');
            }
        });
    });
}

function performSearch(query) {
    // Get all product cards on the page
    const productCards = document.querySelectorAll('.product-card, article[data-product-id]');
    
    if (!query || query.length === 0) {
        // Show all products if search is empty
        productCards.forEach(card => {
            card.style.display = '';
        });
        return;
    }
    
    let hasResults = false;
    
    productCards.forEach(card => {
        // Get product information
        const productName = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
        const productCategory = card.querySelector('.product-category')?.textContent.toLowerCase() || '';
        const productDescription = card.querySelector('.product-description')?.textContent.toLowerCase() || '';
        
        // Check if query matches any field
        const matches = productName.includes(query) || 
                       productCategory.includes(query) || 
                       productDescription.includes(query);
        
        if (matches) {
            card.style.display = '';
            hasResults = true;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show "No results" message if needed
    showSearchResults(query, hasResults);
}

function showSearchResults(query, hasResults) {
    // Remove existing no-results message
    const existingMessage = document.querySelector('.search-no-results');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (!query || query.length === 0) {
        return;
    }
    
    if (hasResults) {
        return;
    }
    
    // Find products grid container or section
    const productsGrid = document.querySelector('.products-grid');
    const productsSection = document.querySelector('.trending-products, .discount-products, section');
    const container = productsGrid || productsSection;
    
    if (!container) {
        return;
    }
    
    // Create no results message
    const noResultsDiv = document.createElement('div');
    noResultsDiv.className = 'search-no-results';
    noResultsDiv.style.cssText = 'text-align: center; padding: 3rem 1rem; color: #6b7280; grid-column: 1 / -1;';
    noResultsDiv.innerHTML = `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem; opacity: 0.5;">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>
        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #1f2937;">No products found</h3>
        <p style="font-size: 0.875rem;">We couldn't find any products matching "<strong>${escapeHTML(query)}</strong>"</p>
        <p style="font-size: 0.875rem; margin-top: 0.5rem;">Try searching with different keywords or browse our catalog.</p>
    `;
    
    // Insert after products grid or at the end of the section
    if (productsGrid && productsGrid.parentElement) {
        productsGrid.parentElement.appendChild(noResultsDiv);
    } else if (container) {
        container.appendChild(noResultsDiv);
    }
}

// Category Filter
function initCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.textContent.trim();
            filterProducts(category);
        });
    });
}

function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        const productCategory = product.querySelector('.product-category').textContent.trim();
        if (category === 'All' || productCategory === category) {
            product.style.display = '';
        } else {
            product.style.display = 'none';
        }
    });
}

// Advanced Filters
function initAdvancedFilters() {
    const priceFilter = document.getElementById('price-filter');
    const sizeFilter = document.getElementById('size-filter');
    const qualityFilter = document.getElementById('quality-filter');
    
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    if (sizeFilter) {
        sizeFilter.addEventListener('change', applyFilters);
    }
    if (qualityFilter) {
        qualityFilter.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    const price = document.getElementById('price-filter')?.value;
    const size = document.getElementById('size-filter')?.value;
    const quality = document.getElementById('quality-filter')?.value;
    
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        let show = true;
        const priceText = product.querySelector('.product-price')?.textContent || '';
        const priceValue = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        
        if (price && priceValue) {
            const [min, max] = price.split('-').map(p => parseFloat(p));
            if (priceValue < min || (max && priceValue > max)) {
                show = false;
            }
        }
        
        if (show) {
            product.style.display = '';
        } else {
            product.style.display = 'none';
        }
    });
}

// Store Locations Map
const storeLocations = [
    {
        id: 1,
        name: 'Main Showroom - London',
        address: '123 Tech Lane, London, E1 4PX',
        phone: '020 7123 4567',
        hours: 'Mon-Sat: 9:00 AM - 8:00 PM, Sun: 10:00 AM - 6:00 PM',
        lat: 51.5074,
        lng: -0.1278
    },
    {
        id: 2,
        name: 'Birmingham Branch',
        address: '456 Appliance Avenue, Birmingham, B1 2AB',
        phone: '0121 234 5678',
        hours: 'Mon-Sat: 9:00 AM - 7:00 PM, Sun: 11:00 AM - 5:00 PM',
        lat: 52.4862,
        lng: -1.8904
    },
    {
        id: 3,
        name: 'Manchester Store',
        address: '789 Home Street, Manchester, M1 3CD',
        phone: '0161 234 5678',
        hours: 'Mon-Sat: 9:00 AM - 7:00 PM, Sun: 11:00 AM - 5:00 PM',
        lat: 53.4808,
        lng: -2.2426
    },
    {
        id: 4,
        name: 'Leeds Showroom',
        address: '321 Electronics Road, Leeds, LS1 4AB',
        phone: '0113 234 5678',
        hours: 'Mon-Sat: 9:00 AM - 7:00 PM, Sun: 11:00 AM - 5:00 PM',
        lat: 53.8008,
        lng: -1.5491
    },
    {
        id: 5,
        name: 'Bristol Outlet',
        address: '654 Tech Boulevard, Bristol, BS1 5XY',
        phone: '0117 234 5678',
        hours: 'Mon-Sat: 9:00 AM - 7:00 PM, Sun: 11:00 AM - 5:00 PM',
        lat: 51.4545,
        lng: -2.5879
    }
];

function initStoreLocations() {
    const storesContainer = document.getElementById('store-locations');
    if (storesContainer) {
        storesContainer.innerHTML = storeLocations.map(store => `
            <div class="card store-card">
                <div class="store-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                </div>
                <div class="store-content">
                    <h4>${store.name}</h4>
                    <p class="store-address">${store.address}</p>
                    <div class="store-hours">
                        <p><strong>Phone:</strong> ${store.phone}</p>
                        <p>${store.hours}</p>
                    </div>
                    <button class="btn btn-secondary" onclick="showStoreOnMap(${store.id})" style="margin-top: 1rem; width: 100%;">View on Map</button>
                </div>
            </div>
        `).join('');
    }
}

function showStoreOnMap(storeId) {
    const store = storeLocations.find(s => s.id === storeId);
    if (store) {
        // In a real implementation, this would open a map with the location
        alert(`Opening map for ${store.name}\n${store.address}`);
    }
}

// Product Image Gallery
function initProductGallery() {
    const mainImage = document.querySelector('.product-detail-image img');
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const newSrc = thumb.getAttribute('data-full-image');
            if (mainImage && newSrc) {
                mainImage.src = newSrc;
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            }
        });
    });
}

// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
}

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (isValid) {
                showNotification('Form submitted successfully!');
                form.reset();
            } else {
                showNotification('Please fill in all required fields');
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateWishlistCount();
    updateWishlistButtons();
    updateHeaderLoginStatus();
    initMobileMenu();
    initSearch();
    initCategoryFilter();
    initAdvancedFilters();
    initStoreLocations();
    initProductGallery();
    initFAQ();
    
    // Add to cart buttons - use event delegation for better performance
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const card = btn.closest('.product-card, article, div.product-card');
        if (!card) {
            console.error('Product card not found');
            return;
        }
        
        const name = card.querySelector('.product-name')?.textContent.trim() || 'Product';
        const price = card.querySelector('.product-price')?.textContent.trim() || '£0.00';
        const imageEl = card.querySelector('.product-image img, img');
        const image = imageEl?.src || imageEl?.getAttribute('src') || '';
        const productId = card.getAttribute('data-product-id') || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        if (productId && name && price) {
            addToCart(productId, name, price, image);
        } else {
            console.error('Missing product data:', { productId, name, price });
        }
    });
    
    
    // Wishlist buttons - using event delegation like cart buttons
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.wishlist-btn');
        if (!btn) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const card = btn.closest('.product-card, article');
        if (!card) return;
        
        const productId = card.getAttribute('data-product-id');
        const name = card.querySelector('.product-name')?.textContent.trim() || 'Product';
        const price = card.querySelector('.product-price')?.textContent.trim() || '£0.00';
        const imageEl = card.querySelector('.product-image img, img');
        const image = imageEl?.src || imageEl?.getAttribute('src') || '';
        
        if (productId && name && price) {
            console.log('Wishlist clicked for:', name);
            toggleWishlist(productId, name, price, image);
        }
    });
    
    // Quantity controls
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isIncrease = btn.textContent === '+';
            const item = btn.closest('.cart-item');
            const productId = item?.getAttribute('data-product-id');
            if (productId) {
                updateQuantity(productId, isIncrease ? 1 : -1);
            }
        });
    });
});

// Basket Page Functions
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="margin: 0 auto 1.5rem;">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <h3 style="font-weight: 700; margin-bottom: 0.5rem; color: #1f2937;">Your cart is empty</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Add some products to get started!</p>
                <a href="catalog.html" class="btn btn-primary">Browse Products</a>
            </div>
        `;
        if (cartTotalAmount) cartTotalAmount.textContent = '£0.00';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    let total = 0;
    cartItemsContainer.innerHTML = cart.map((item) => {
        const price = item.numericPrice || parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
        const itemTotal = price * item.quantity;
        total += itemTotal;
        
        const escapedId = escapeHtml(item.id);
        const escapedName = escapeHtml(item.name);
        const escapedPrice = escapeHtml(item.price);
        const escapedImage = escapeHtml(item.image || 'https://via.placeholder.com/100');
        const safeId = escapedId.replace(/'/g, "\\'");
        
        return `
            <div class="cart-item" data-product-id="${escapedId}">
                <img src="${escapedImage}" alt="${escapedName}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/100'">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${escapedName}</h4>
                    <p class="cart-item-price">${escapedPrice} each</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity('${safeId}', -1)">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity('${safeId}', 1)">+</button>
                </div>
                <div class="cart-item-total">£${itemTotal.toFixed(2)}</div>
                <button class="remove-item-btn" onclick="removeCartItem('${safeId}')" aria-label="Remove item" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem; margin-left: 1rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
    
    if (cartTotalAmount) cartTotalAmount.textContent = `£${total.toFixed(2)}`;
    if (checkoutBtn) checkoutBtn.style.display = cart.length > 0 ? 'inline-flex' : 'none';
    updateCartCount();
}

function updateCartQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
        
        if (item.quantity <= 0) {
            showNotification('Item removed from cart');
        } else {
            showNotification(`Quantity updated to ${item.quantity}`);
        }
    }
}

function removeCartItem(productId) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart.find(item => item.id === productId);
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
        showNotification(item ? `${item.name} removed from cart` : 'Item removed');
    }
}

// Checkout Page Functions
function initCheckoutPage() {
    const deliveryOptions = document.querySelectorAll('.delivery-option');
    const storeSelection = document.getElementById('store-selection');
    const deliveryDetails = document.getElementById('delivery-details');
    
    if (deliveryOptions.length > 0 && storeSelection && deliveryDetails) {
        deliveryOptions.forEach(option => {
            option.addEventListener('click', () => {
                deliveryOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const deliveryType = option.dataset.delivery;
                if (deliveryType === 'store') {
                    storeSelection.style.display = 'block';
                    deliveryDetails.style.display = 'none';
                    const storeLocation = document.getElementById('store-location');
                    const deliveryAddress = document.getElementById('delivery-address');
                    if (storeLocation) storeLocation.required = true;
                    if (deliveryAddress) deliveryAddress.required = false;
                } else {
                    storeSelection.style.display = 'none';
                    deliveryDetails.style.display = 'block';
                    const storeLocation = document.getElementById('store-location');
                    const deliveryAddress = document.getElementById('delivery-address');
                    if (storeLocation) storeLocation.required = false;
                    if (deliveryAddress) deliveryAddress.required = true;
                }
            });
        });
    }
}

function completeOrder() {
    const activeOption = document.querySelector('.delivery-option.active');
    if (!activeOption) {
        alert('Please select a delivery method');
        return;
    }
    
    const deliveryType = activeOption.dataset.delivery;
    if (deliveryType === 'store') {
        const storeLocation = document.getElementById('store-location');
        if (!storeLocation || !storeLocation.value) {
            alert('Please select a store location');
            return;
        }
    } else {
        const deliveryAddress = document.getElementById('delivery-address');
        if (!deliveryAddress || !deliveryAddress.value) {
            alert('Please enter a delivery address');
            return;
        }
    }
    
    // Clear cart after successful order
    localStorage.removeItem('cart');
    updateCartCount();
    
    showNotification('Order placed successfully!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Initialize basket page on load
if (window.location.pathname.includes('basket.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadCartItems();
    });
}

// Initialize checkout page on load
if (window.location.pathname.includes('checkout.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        initCheckoutPage();
    });
}

// Products Database
const productsDatabase = {
    '1': {
        id: '1',
        name: 'SmartChef Pro Oven',
        category: 'Kitchen',
        price: '£899.99',
        oldPrice: '£1,199.99',
        image: 'https://api.cabinet.smart-market.uz/uploads/images/ff8081816dae8b8ecb70f9af',
        description: 'AI-powered convection oven with recipe assistance and remote monitoring. Features advanced cooking algorithms, precise temperature control, and smart connectivity for the ultimate cooking experience. Perfect for both home chefs and culinary professionals.',
        rating: 4,
        reviews: 128,
        specs: {
            'Capacity': '70L',
            'Power': '3000W',
            'Warranty': '2 Years',
            'Energy Rating': 'A+++'
        },
        features: [
            'AI-powered recipe recommendations',
            'Remote monitoring via smartphone app',
            'Precise temperature control (±1°C)',
            'Multi-level convection system',
            'Self-cleaning function',
            'Energy-efficient design'
        ],
        thumbnails: [
            'https://api.cabinet.smart-market.uz/uploads/images/ff8081816dae8b8ecb70f9af',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=800&fit=crop'
        ]
    },
    '2': {
        id: '2',
        name: 'UltraClean Pro Vacuum',
        category: 'Cleaning',
        price: '£349.99',
        oldPrice: null,
        image: 'https://www.gutterprovac.com/cdn/shop/files/ccp60-3.webp?v=1758774790',
        description: 'Cordless robot vacuum with smart dust detection and self-cleaning technology. Features advanced navigation, multiple cleaning modes, and app control for effortless home maintenance.',
        rating: 5,
        reviews: 89,
        specs: {
            'Battery Life': '120 minutes',
            'Dust Capacity': '0.6L',
            'Warranty': '2 Years',
            'Noise Level': '55dB'
        },
        features: [
            'Smart dust detection technology',
            'Self-cleaning brush system',
            'App-controlled navigation',
            'Multiple cleaning modes',
            'Auto-docking and charging',
            'HEPA filtration system'
        ],
        thumbnails: [
            'https://www.gutterprovac.com/cdn/shop/files/ccp60-3.webp?v=1758774790',
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop'
        ]
    },
    '3': {
        id: '3',
        name: 'AirPure Climate Station',
        category: 'Heating & Cooling',
        price: '£449.99',
        oldPrice: null,
        image: 'https://www.bresser.com/media/3f/03/67/1701971857/7003700_M_1_v0523.jpg?ts=1763163658',
        description: 'Smart air purifier with real-time pollution monitoring and voice control. Features HEPA-13 filtration, air quality sensors, and smart home integration for optimal indoor air quality.',
        rating: 4,
        reviews: 156,
        specs: {
            'Coverage Area': '50m²',
            'CADR': '350 m³/h',
            'Warranty': '2 Years',
            'Noise Level': '25-55dB'
        },
        features: [
            'Real-time air quality monitoring',
            'HEPA-13 filtration system',
            'Voice control integration',
            'Smart home compatible',
            'Auto mode with sensors',
            'Energy-efficient operation'
        ],
        thumbnails: [
            'https://www.bresser.com/media/3f/03/67/1701971857/7003700_M_1_v0523.jpg?ts=1763163658',
            'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop'
        ]
    },
    '4': {
        id: '4',
        name: 'PressoPro Espresso Machine',
        category: 'Kitchen',
        price: '£599.99',
        oldPrice: '£799.99',
        image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop',
        description: 'Professional espresso machine with automatic milk frothing function. Features dual boiler system, PID temperature control, and programmable settings for barista-quality coffee at home.',
        rating: 5,
        reviews: 203,
        specs: {
            'Boiler Type': 'Dual Boiler',
            'Pressure': '15 Bar',
            'Warranty': '2 Years',
            'Water Tank': '2.5L'
        },
        features: [
            'Automatic milk frothing',
            'Dual boiler system',
            'PID temperature control',
            'Programmable settings',
            'Professional steam wand',
            'Pre-infusion technology'
        ],
        thumbnails: [
            'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop'
        ]
    },
    '5': {
        id: '5',
        name: 'MixMaster Pro Stand Mixer',
        category: 'Kitchen',
        price: '£299.99',
        oldPrice: '£399.99',
        image: 'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=400&h=400&fit=crop',
        description: 'Professional stand mixer with 10-speed control and multiple attachments. Perfect for baking enthusiasts, featuring powerful motor and versatile accessories for all your culinary needs.',
        rating: 4,
        reviews: 167,
        specs: {
            'Power': '1000W',
            'Bowl Capacity': '5.5L',
            'Warranty': '2 Years',
            'Speed Settings': '10'
        },
        features: [
            '10-speed control system',
            'Multiple attachments included',
            'Powerful 1000W motor',
            'Large 5.5L bowl capacity',
            'Planetary mixing action',
            'Durable construction'
        ],
        thumbnails: [
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=800&fit=crop'
        ]
    },
    '6': {
        id: '6',
        name: 'WaveTech Microwave',
        category: 'Kitchen',
        price: '£174.99',
        oldPrice: '£249.99',
        image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop',
        description: 'Smart microwave with sensor cooking and convection technology. Features auto-cook programs, defrost function, and energy-efficient design for modern kitchens.',
        rating: 4,
        reviews: 142,
        specs: {
            'Capacity': '25L',
            'Power': '900W',
            'Warranty': '2 Years',
            'Cooking Modes': '10'
        },
        features: [
            'Sensor cooking technology',
            'Convection cooking mode',
            'Auto-cook programs',
            'Defrost function',
            'Child safety lock',
            'Energy-efficient design'
        ],
        thumbnails: [
            'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=800&fit=crop'
        ]
    },
    '7': {
        id: '7',
        name: 'SteamClean Pro',
        category: 'Cleaning',
        price: '£159.99',
        oldPrice: '£199.99',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
        description: 'High-pressure steam cleaner for deep sanitization and cleaning without chemicals. Features adjustable steam pressure, multiple attachments, and eco-friendly operation.',
        rating: 5,
        reviews: 98,
        specs: {
            'Pressure': '4.5 Bar',
            'Tank Capacity': '1.5L',
            'Warranty': '2 Years',
            'Heat-up Time': '2 minutes'
        },
        features: [
            'High-pressure steam cleaning',
            'Chemical-free sanitization',
            'Multiple cleaning attachments',
            'Adjustable steam pressure',
            'Eco-friendly operation',
            'Quick heat-up time'
        ],
        thumbnails: [
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop'
        ]
    },
    '8': {
        id: '8',
        name: 'TrimPro Electric Trimmer',
        category: 'Personal Care',
        price: '£67.99',
        oldPrice: '£79.99',
        image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop',
        description: 'Cordless electric trimmer with multiple length settings and waterproof design. Perfect for precise grooming with self-sharpening blades and long battery life.',
        rating: 4,
        reviews: 234,
        specs: {
            'Battery Life': '90 minutes',
            'Charge Time': '2 hours',
            'Warranty': '2 Years',
            'Length Settings': '9'
        },
        features: [
            'Cordless operation',
            'Waterproof design',
            'Multiple length settings',
            'Self-sharpening blades',
            'Long battery life',
            'Precision trimming'
        ],
        thumbnails: [
            'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop'
        ]
    },
    '9': {
        id: '9',
        name: 'ChillMaster Refrigerator',
        category: 'Kitchen',
        price: '£1,299.99',
        oldPrice: '£1,499.99',
        image: 'https://olcha.uz/image/original/products/MX3YDhmpd2Hw1ClfsjAmuZkKpLMBodpEluWv6PILrnUpWNuIOfjoGGVAX4AQ.jpg',
        description: 'French door smart refrigerator with built-in camera and mobile app control. Features advanced cooling technology, energy efficiency, and smart connectivity for modern homes.',
        rating: 5,
        reviews: 189,
        specs: {
            'Capacity': '600L',
            'Energy Rating': 'A+++',
            'Warranty': '2 Years',
            'Door Type': 'French Door'
        },
        features: [
            'Built-in camera system',
            'Mobile app control',
            'Advanced cooling technology',
            'Energy-efficient design',
            'Smart connectivity',
            'Spacious storage'
        ],
        thumbnails: [
            'https://olcha.uz/image/original/products/MX3YDhmpd2Hw1ClfsjAmuZkKpLMBodpEluWv6PILrnUpWNuIOfjoGGVAX4AQ.jpg',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop'
        ]
    },
    '10': {
        id: '10',
        name: 'WashMax Pro Washing Machine',
        category: 'Cleaning',
        price: '£639.99',
        oldPrice: '£799.99',
        image: 'https://assets.chakana.uz/product/main_image/mobile/67232b00933db.png',
        description: 'Front-loading washing machine with steam cleaning and quick wash options. Features large capacity, energy efficiency, and multiple wash programs for all fabric types.',
        rating: 4,
        reviews: 176,
        specs: {
            'Capacity': '10kg',
            'Energy Rating': 'A+++',
            'Warranty': '2 Years',
            'Wash Programs': '16'
        },
        features: [
            'Steam cleaning technology',
            'Quick wash option',
            'Large 10kg capacity',
            'Multiple wash programs',
            'Energy-efficient design',
            'Quiet operation'
        ],
        thumbnails: [
            'https://assets.chakana.uz/product/main_image/mobile/67232b00933db.png',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop'
        ]
    },
    'smartchef-pro-oven': {
        id: 'smartchef-pro-oven',
        name: 'SmartChef Pro Oven',
        category: 'Kitchen',
        price: '£899.99',
        oldPrice: '£1,199.99',
        image: 'https://api.cabinet.smart-market.uz/uploads/images/ff8081816dae8b8ecb70f9af',
        description: 'AI-powered convection oven with recipe assistance and remote monitoring. Features advanced cooking algorithms, precise temperature control, and smart connectivity for the ultimate cooking experience. Perfect for both home chefs and culinary professionals.',
        rating: 4,
        reviews: 128,
        specs: {
            'Capacity': '70L',
            'Power': '3000W',
            'Warranty': '2 Years',
            'Energy Rating': 'A+++'
        },
        features: [
            'AI-powered recipe recommendations',
            'Remote monitoring via smartphone app',
            'Precise temperature control (±1°C)',
            'Multi-level convection system',
            'Self-cleaning function',
            'Energy-efficient design'
        ],
        thumbnails: [
            'https://api.cabinet.smart-market.uz/uploads/images/ff8081816dae8b8ecb70f9af',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=800&fit=crop'
        ]
    },
    'ultraclean-pro-vacuum': {
        id: 'ultraclean-pro-vacuum',
        name: 'UltraClean Pro Vacuum',
        category: 'Cleaning',
        price: '£349.99',
        oldPrice: null,
        image: 'https://www.gutterprovac.com/cdn/shop/files/ccp60-3.webp?v=1758774790',
        description: 'Cordless robot vacuum with smart dust detection and self-cleaning technology. Features advanced navigation, multiple cleaning modes, and app control for effortless home maintenance.',
        rating: 5,
        reviews: 89,
        specs: {
            'Battery Life': '120 minutes',
            'Dust Capacity': '0.6L',
            'Warranty': '2 Years',
            'Noise Level': '55dB'
        },
        features: [
            'Smart dust detection technology',
            'Self-cleaning brush system',
            'App-controlled navigation',
            'Multiple cleaning modes',
            'Auto-docking and charging',
            'HEPA filtration system'
        ],
        thumbnails: [
            'https://www.gutterprovac.com/cdn/shop/files/ccp60-3.webp?v=1758774790',
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop'
        ]
    },
    'airpure-climate-station': {
        id: 'airpure-climate-station',
        name: 'AirPure Climate Station',
        category: 'Heating & Cooling',
        price: '£449.99',
        oldPrice: null,
        image: 'https://www.bresser.com/media/3f/03/67/1701971857/7003700_M_1_v0523.jpg?ts=1763163658',
        description: 'Smart air purifier with real-time pollution monitoring and voice control. Features HEPA-13 filtration, air quality sensors, and smart home integration for optimal indoor air quality.',
        rating: 4,
        reviews: 156,
        specs: {
            'Coverage Area': '50m²',
            'CADR': '350 m³/h',
            'Warranty': '2 Years',
            'Noise Level': '25-55dB'
        },
        features: [
            'Real-time air quality monitoring',
            'HEPA-13 filtration system',
            'Voice control integration',
            'Smart home compatible',
            'Auto mode with sensors',
            'Energy-efficient operation'
        ],
        thumbnails: [
            'https://www.bresser.com/media/3f/03/67/1701971857/7003700_M_1_v0523.jpg?ts=1763163658',
            'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop'
        ]
    },
    'pressopro-espresso-machine': {
        id: 'pressopro-espresso-machine',
        name: 'PressoPro Espresso Machine',
        category: 'Kitchen',
        price: '£599.99',
        oldPrice: '£799.99',
        image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop',
        description: 'Professional espresso machine with automatic milk frothing function. Features dual boiler system, PID temperature control, and programmable settings for barista-quality coffee at home.',
        rating: 5,
        reviews: 203,
        specs: {
            'Boiler Type': 'Dual Boiler',
            'Pressure': '15 Bar',
            'Warranty': '2 Years',
            'Water Tank': '2.5L'
        },
        features: [
            'Automatic milk frothing',
            'Dual boiler system',
            'PID temperature control',
            'Programmable settings',
            'Professional steam wand',
            'Pre-infusion technology'
        ],
        thumbnails: [
            'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556912173-46e1c8c42622?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop'
        ]
    }
};

// Load product detail page
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || urlParams.get('product');
    
    if (!productId) {
        console.error('Product ID not found in URL');
        return;
    }
    
    const product = productsDatabase[productId];
    
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    // Update page title
    document.title = `${product.name} - TechHouse`;
    
    // Update main image
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = product.image;
        mainImage.alt = product.name;
    }
    
    // Update thumbnails
    const thumbnailsContainer = document.querySelector('.product-thumbnails');
    if (thumbnailsContainer && product.thumbnails) {
        thumbnailsContainer.innerHTML = '';
        product.thumbnails.forEach((thumb, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = 'product-thumbnail' + (index === 0 ? ' active' : '');
            thumbnail.src = thumb;
            thumbnail.alt = `${product.name} view ${index + 1}`;
            thumbnail.setAttribute('data-full-image', thumb);
            thumbnail.addEventListener('click', () => {
                if (mainImage) {
                    mainImage.src = thumb;
                }
                document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
            });
            thumbnailsContainer.appendChild(thumbnail);
        });
    }
    
    // Update product header
    const header = document.querySelector('.product-detail-header');
    if (header) {
        const badge = header.querySelector('.badge');
        const title = header.querySelector('h1');
        const rating = header.querySelector('.product-rating');
        
        if (badge) badge.textContent = product.category;
        if (title) title.textContent = product.name;
        
        if (rating) {
            const stars = rating.querySelectorAll('svg');
            stars.forEach((star, index) => {
                if (index < product.rating) {
                    star.setAttribute('fill', 'currentColor');
                } else {
                    star.setAttribute('fill', 'none');
                }
            });
            const reviewsSpan = rating.querySelector('span');
            if (reviewsSpan) {
                reviewsSpan.textContent = `(${product.reviews} reviews)`;
            }
        }
    }
    
    // Update description
    const description = document.querySelector('.product-detail-description');
    if (description) {
        description.textContent = product.description;
    }
    
    // Update price
    const priceElement = document.querySelector('.product-detail-price');
    if (priceElement) {
        if (product.oldPrice) {
            priceElement.innerHTML = `
                <span style="font-size: 2rem; font-weight: 700; color: #1f2937;">${product.price}</span>
                <span style="text-decoration: line-through; color: #9ca3af; font-size: 1.25rem; margin-left: 0.5rem;">${product.oldPrice}</span>
            `;
        } else {
            priceElement.textContent = product.price;
        }
    }
    
    // Update specifications
    const specsGrid = document.querySelector('.specs-grid');
    if (specsGrid && product.specs) {
        specsGrid.innerHTML = '';
        Object.entries(product.specs).forEach(([key, value]) => {
            const keySpan = document.createElement('span');
            keySpan.textContent = key;
            const valueSpan = document.createElement('span');
            valueSpan.textContent = value;
            specsGrid.appendChild(keySpan);
            specsGrid.appendChild(valueSpan);
        });
    }
    
    // Update features
    const featuresList = document.querySelector('.features-list');
    if (featuresList && product.features) {
        featuresList.innerHTML = '';
        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                ${feature}
            `;
            featuresList.appendChild(li);
        });
    }
}

// Initialize product detail page
if (window.location.pathname.includes('product-detail.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadProductDetail();
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (mobileMenuToggle && mobileNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close menu when clicking outside
    if (mobileNav) {
        mobileNav.addEventListener('click', (e) => {
            if (e.target === mobileNav) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Close menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Mobile search functionality
    const mobileSearchInput = document.getElementById('mobile-search-input');
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                // Redirect to catalog with search
                window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
            }
        });
        
        mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query.length > 0) {
                    window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }
}


// Export functions for use in HTML
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.showStoreOnMap = showStoreOnMap;
window.loadCartItems = loadCartItems;
window.updateCartQuantity = updateCartQuantity;
window.removeCartItem = removeCartItem;
window.completeOrder = completeOrder;
window.isUserLoggedIn = isUserLoggedIn;
window.updateHeaderLoginStatus = updateHeaderLoginStatus;
window.addToWishlist = addToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.toggleWishlist = toggleWishlist;
window.loadProductDetail = loadProductDetail;
window.showNotification = showNotification;
window.updateCartCount = updateCartCount;
window.updateWishlistCount = updateWishlistCount;