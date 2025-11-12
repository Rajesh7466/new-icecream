// ═══════════════════════════════════════════════════════════════
// Shop Page - Add to Cart Functionality
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    console.log('Shop.js loaded');
    
    // Initialize all "Add to Cart" buttons
    initializeAddToCartButtons();
});

function initializeAddToCartButtons() {
    // Find all cart buttons - adjust selector based on your HTML
    const cartButtons = document.querySelectorAll('a[href="cart.html"]');
    
    cartButtons.forEach(button => {
        // Replace link with button that calls addToCart
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product details from parent elements
            const productBox = this.closest('.classic-box, .seller-box');
            if (!productBox) {
                console.error('Product box not found');
                return;
            }
            
            const productName = productBox.querySelector('h6')?.textContent || 'Unknown Product';
            const priceElement = productBox.querySelector('.dollar .counter');
            const priceDecimal = productBox.querySelector('.dollar span:last-child');
            const productImage = productBox.querySelector('img')?.src || '';
            
            let productPrice = 0;
            if (priceElement && priceDecimal) {
                productPrice = parseFloat(priceElement.textContent + priceDecimal.textContent.replace('.', ''));
            }
            
            // For now, we'll use a default product ID (you'll need to add data-product-id to HTML)
            const productId = productBox.dataset.productId || getProductIdFromName(productName);
            
            // Default quantity is 1
            const quantity = 1;
            
            addToCart(productId, productName, productPrice, productImage, quantity);
        });
    });
}

// Helper function to get product ID from name (temporary solution)
function getProductIdFromName(productName) {
    const productMap = {
        'Classic Vanilla Ice Cream': 1,
        'Chocolate Brownie Sundae': 2,
        'Strawberry Shortcake': 3,
        'Mint Chocolate Chip Cone': 4,
        'Strawberry Sundae': 5,
        'Chocolate Chip Cookie Cone': 6,
        'Rocky Road Sundae': 7,
        'Peach Melba Sundae': 8
    };
    
    return productMap[productName] || 1;
}

async function addToCart(productId, productName, productPrice, productImage, quantity) {
    console.log('Adding to cart:', { productId, productName, productPrice, quantity });
    
    // Check if user is logged in
    if (!requireLogin()) {
        return;
    }
    
    const email = getUserEmail();
    
    // Prepare request data
    const requestData = {
        productId: parseInt(productId),
        quantity: parseInt(quantity)
    };
    
    try {
        showLoadingSpinner();
        
        const response = await makeApiCall(
            API_CONFIG.ENDPOINTS.ADD_TO_CART(email),
            'POST',
            requestData,
            true
        );
        
        hideLoadingSpinner();
        
        if (response && response.ok) {
            const message = await response.text();
            showMessage(`${productName} added to cart successfully!`, 'success');
            
            // Update cart badge
            updateCartBadge();
            
            // Optional: Animate the cart icon
            animateCartIcon();
        } else {
            const errorMessage = await response.text();
            showMessage(errorMessage || 'Failed to add to cart', 'danger');
            // alert("please login first then add to cart");
            // localStorage.clear();
            // window.location.replace('login.html');
        }
    } catch (error) {
        hideLoadingSpinner();
        console.error('Error adding to cart:', error);
        showMessage('Network error. Please try again.', 'danger');
    }
}

function animateCartIcon() {
    const cartIcon = document.querySelector('.cart.icon');
    if (cartIcon) {
        cartIcon.style.animation = 'bounce 0.5s ease';
        setTimeout(() => {
            cartIcon.style.animation = '';
        }, 500);
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

console.log('Shop.js initialized');