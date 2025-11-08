// ═══════════════════════════════════════════════════════════════
// Cart Badge Update - Global for all pages
// ═══════════════════════════════════════════════════════════════

async function updateCartBadge() {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        const cartBadge = document.querySelector('.cart.icon span');
        if (cartBadge) {
            cartBadge.textContent = '0';
        }
        return;
    }

    const email = getUserEmail();

    try {
        const response = await makeApiCall(API_CONFIG.ENDPOINTS.GET_CART(email), 'GET', null, true);

        if (response && response.ok) {
            const cartData = await response.json();
            
            // Update cart badge
            const cartBadge = document.querySelector('.cart.icon span');
            if (cartBadge) {
                cartBadge.textContent = cartData.totalItems || 0;
                
                // Animate badge
                cartBadge.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    cartBadge.style.transform = 'scale(1)';
                }, 300);
            }
        }
    } catch (error) {
        console.error('Error updating cart badge:', error);
    }
}

// Update cart badge on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
});

console.log('Cart badge script loaded');