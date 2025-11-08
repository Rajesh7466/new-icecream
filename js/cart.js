// ═══════════════════════════════════════════════════════════════
// Cart Page - Display and Manage Cart Items
// ═══════════════════════════════════════════════════════════════

let cartData = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart.js loaded');
    
    // Check if user is logged in
    if (!requireLogin()) {
        return;
    }
    
    // Load cart items
    loadCart();
    
    // Setup continue shopping button
    setupContinueShopping();
    
    // Setup proceed to checkout button
    setupProceedToCheckout();
});

async function loadCart() {
    const email = getUserEmail();
    
    try {
        showLoadingSpinner();
        
        const response = await makeApiCall(
            API_CONFIG.ENDPOINTS.GET_CART(email),
            'GET',
            null,
            true
        );
        
        hideLoadingSpinner();
        
        if (response && response.ok) {
            cartData = await response.json();
            console.log('Cart data:', cartData);
            displayCart(cartData);
        } else {
            showMessage('Failed to load cart', 'danger');
        }
    } catch (error) {
        hideLoadingSpinner();
        console.error('Error loading cart:', error);
        showMessage('Network error. Please try again.', 'danger');
    }
}

function displayCart(cart) {
    const cartContainer = document.querySelector('.shopping-cart-info');
    const itemCountElement = document.querySelector('.heading span:last-child');
    const subtotalElement = document.querySelector('.detail ul li:first-child .dollar');
    const grandTotalElement = document.querySelector('.all-total .total .dollar');
    
    if (!cartContainer) {
        console.error('Cart container not found');
        return;
    }
    
    // Clear existing cart items
    cartContainer.innerHTML = '';
    
    // Check if cart is empty
    if (!cart.items || cart.items.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-5x text-muted mb-3"></i>
                <h4>Your cart is empty</h4>
                <p>Add some delicious ice cream to get started!</p>
                <a href="shop.html" class="all_button mt-3">Start Shopping</a>
            </div>
        `;
        
        // Update counts
        if (itemCountElement) itemCountElement.textContent = '(0 Items)';
        if (subtotalElement) subtotalElement.textContent = '₹0.00';
        if (grandTotalElement) grandTotalElement.textContent = '₹0.00';
        
        return;
    }
    
    // Display each cart item
    cart.items.forEach(item => {
        const cartItemHTML = `
            <div class="product d-sm-flex d-block align-items-center" data-cart-item-id="${item.cartItemId}">
                <div class="product-details">
                    <div class="product-image">
                        <figure class="mb-0">
                            <img src="${item.productImage || 'assets/images/default-product.png'}" alt="${item.productName}" class="img-fluid">
                        </figure>
                    </div>
                    <div class="product-content">
                        <span class="product-title">${item.productName}</span>
                        <span class="product-color text">ID: <span>${item.productId}</span></span>
                    </div>
                </div>
                <div class="product-price"><span>${formatPrice(item.productPrice)}</span></div>
                <div class="product-quantity d-flex">
                    <div class="product-qty-details">
                        <button class="value-button decrease-button" onclick="updateQuantity(${item.cartItemId}, ${item.quantity - 1})" title="Decrease">-</button>
                        <div class="number">${item.quantity}</div>
                        <button class="value-button increase-button" onclick="updateQuantity(${item.cartItemId}, ${item.quantity + 1})" title="Increase">+</button>
                    </div>
                </div>
                <div class="product-line-price"><span>${formatPrice(item.subtotal)}</span></div>
                <div class="product-removal">
                    <button class="remove-product" onclick="removeFromCart(${item.cartItemId})"><i class="fas fa-times"></i></button>
                </div>
            </div>
        `;
        
        cartContainer.innerHTML += cartItemHTML;
    });
    
    // Update totals
    const shipping = 20.00; // Fixed shipping cost
    const grandTotal = cart.totalAmount + shipping;
    
    if (itemCountElement) itemCountElement.textContent = `(${cart.totalItems} Items)`;
    if (subtotalElement) subtotalElement.textContent = formatPrice(cart.totalAmount);
    if (grandTotalElement) grandTotalElement.textContent = formatPrice(grandTotal);
}

async function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) {
        if (confirm('Remove this item from cart?')) {
            removeFromCart(cartItemId);
        }
        return;
    }
    
    const email = getUserEmail();
    
    try {
        showLoadingSpinner();
        
        const response = await makeApiCall(
            API_CONFIG.ENDPOINTS.UPDATE_CART(cartItemId, email),
            'PUT',
            { quantity: newQuantity },
            true
        );
        
        hideLoadingSpinner();
        
        if (response && response.ok) {
            const updatedCart = await response.json();
            cartData = updatedCart;
            displayCart(updatedCart);
            updateCartBadge();
            showMessage('Quantity updated', 'success');
        } else {
            const error = await response.text();
            showMessage(error || 'Failed to update quantity', 'danger');
        }
    } catch (error) {
        hideLoadingSpinner();
        console.error('Error updating quantity:', error);
        showMessage('Network error. Please try again.', 'danger');
    }
}

async function removeFromCart(cartItemId) {
    if (!confirm('Are you sure you want to remove this item?')) {
        return;
    }
    
    const email = getUserEmail();
    
    try {
        showLoadingSpinner();
        
        const response = await makeApiCall(
            API_CONFIG.ENDPOINTS.REMOVE_FROM_CART(cartItemId, email),
            'DELETE',
            null,
            true
        );
        
        hideLoadingSpinner();
        
        if (response && response.ok) {
            showMessage('Item removed from cart', 'success');
            loadCart(); // Reload cart
            updateCartBadge();
        } else {
            showMessage('Failed to remove item', 'danger');
        }
    } catch (error) {
        hideLoadingSpinner();
        console.error('Error removing item:', error);
        showMessage('Network error. Please try again.', 'danger');
    }
}

function setupContinueShopping() {
    const continueBtn = document.querySelector('.buttun-shopping a');
    if (continueBtn) {
        continueBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'shop.html';
        });
    }
}

function setupProceedToCheckout() {
    const checkoutBtn = document.querySelector('.all_button');
    if (checkoutBtn && checkoutBtn.textContent.includes('checkout')) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!cartData || !cartData.items || cartData.items.length === 0) {
                showMessage('Your cart is empty', 'warning');
                return;
            }
            
            // Store cart data for checkout page
            sessionStorage.setItem('checkoutCart', JSON.stringify(cartData));
            window.location.href = 'checkout.html';
        });
    }
}

console.log('Cart.js initialized');