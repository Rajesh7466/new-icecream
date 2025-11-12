// ═══════════════════════════════════════════════════════════════
// Checkout Page - Place Order
// ═══════════════════════════════════════════════════════════════

let checkoutCart = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout.js loaded');
    
    // Check if user is logged in
    if (!requireLogin()) {
        return;
    }
    
    // Load cart data for order summary
    loadCheckoutCart();
    
    // Setup form submission
    setupCheckoutForm();
    
    // Pre-fill user details if available
    prefillUserDetails();
});

async function loadCheckoutCart() {
    // Try to get cart from sessionStorage first
    const storedCart = sessionStorage.getItem('checkoutCart');
    
    if (storedCart) {
        checkoutCart = JSON.parse(storedCart);
        displayOrderSummary(checkoutCart);
    } else {
        // Fetch from API
        const email = getUserEmail();
        
        try {
            const response = await makeApiCall(
                API_CONFIG.ENDPOINTS.GET_CART(email),
                'GET',
                null,
                true
            );
            
            if (response && response.ok) {
                checkoutCart = await response.json();
                
                if (!checkoutCart.items || checkoutCart.items.length === 0) {
                    alert('Your cart is empty!');
                    window.location.href = 'shop.html';
                    return;
                }
                
                displayOrderSummary(checkoutCart);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            showMessage('Failed to load cart', 'danger');
        }
    }
}

function displayOrderSummary(cart) {
    const summaryContainer = document.querySelector('.list-items');

    if (!summaryContainer) {
        console.error('Order summary container not found');
        return;
    }

    summaryContainer.innerHTML = '';

    cart.items.forEach(item => {
        const itemHTML = `
            <div class="each-item" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee; padding: 10px 0;">
                <div class="product-items">
                    <span class="heading">${item.quantity} x ${item.productName}</span>
                    <p class="text-size-14 mb-0">Price: ${formatPrice(item.productPrice)} each</p>
                </div>
                <div class="product-actions" style="display: flex; align-items: center; gap: 10px;">
                    <span class="dollar">${formatPrice(item.subtotal)}</span>
                    <button class="delete-btn" data-id="${item.cartItemId}" style="background: none; border: none; color: #f83d8e; cursor: pointer; font-size: 18px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        summaryContainer.innerHTML += itemHTML;
    });

    const shipping = 20.00;
    const grandTotal = cart.totalAmount + shipping;

    const totalHTML = `
        <div class="each-item" style="border-top: 2px solid #ddd; padding-top: 15px; margin-top: 15px;">
            <div class="product-items"><span class="heading">Subtotal</span></div>
            <div class="product-prices"><span class="dollar">${formatPrice(cart.totalAmount)}</span></div>
        </div>
        <div class="each-item"><div class="product-items"><span class="heading">Shipping</span></div>
            <div class="product-prices"><span class="dollar">${formatPrice(shipping)}</span></div>
        </div>
        <div class="each-item" style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <div class="product-items"><span class="heading" style="font-size: 20px; font-weight: 700;">Grand Total</span></div>
            <div class="product-prices"><span class="dollar total-price" style="font-size: 24px; font-weight: 700; color: #f83d8e;">${formatPrice(grandTotal)}</span></div>
        </div>
    `;
    summaryContainer.innerHTML += totalHTML;

    // Attach delete button listeners
    setupDeleteButtons();
}


function prefillUserDetails() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        
        // Pre-fill email if field exists
        const emailField = document.getElementById('email');
        if (emailField && user.emailId) {
            emailField.value = user.emailId;
        }
        
        // Pre-fill name if field exists
        const fnameField = document.getElementById('fname');
        if (fnameField && user.username) {
            const names = user.username.split(' ');
            fnameField.value = names[0] || '';
            
            const lnameField = document.getElementById('lname');
            if (lnameField && names.length > 1) {
                lnameField.value = names.slice(1).join(' ');
            }
        }
    }
}

function setupCheckoutForm() {
    const form = document.getElementById('contactpage');
    const submitBtn = document.getElementById('submit');
    
    if (!form) {
        console.error('Checkout form not found');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Check if Cash on Delivery is selected
        const cashCheckbox = document.getElementById('cash');
        if (!cashCheckbox || !cashCheckbox.checked) {
            alert('Please select "Cash on Delivery" as payment method.');
            return;
        }
        
        // Get form data
        const formData = new FormData(form);
        
        // Build delivery address
        const deliveryAddress = buildDeliveryAddress(formData);
        
        // Prepare order request
        const orderRequest = {
            deliveryAddress: deliveryAddress,
            paymentType: 'Cash on Delivery',
            specialInstructions: '' // You can add a field for this if needed
        };
        
        // Place order
        await placeOrder(orderRequest);
    });
}

function buildDeliveryAddress(formData) {
    const fname = formData.get('fname') || '';
    const lname = formData.get('lname') || '';
    const email = formData.get('email') || '';
    const state = formData.get('state') || document.querySelector('select[class="form-control"]')?.value || '';
    const city = formData.get('city') || document.querySelectorAll('select[class="form-control"]')[1]?.value || '';
    const code = formData.get('code') || '';
    
    return `${fname} ${lname}, ${email}, ${city}, ${state}, ${code}, India`;
}


// delete fuction button code start
function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const cartItemId = e.currentTarget.getAttribute('data-id');
            const email = getUserEmail();

            if (!confirm('Remove this item from your cart?')) return;

            try {
                const response = await makeApiCall(
                    API_CONFIG.ENDPOINTS.REMOVE_FROM_CART(cartItemId, email),
                    'DELETE',
                    null,
                    true
                );

                if (response && response.ok) {
                    showMessage('Item removed from cart', 'success');
                    loadCheckoutCart(); // Refresh the list
                    updateCartBadge(); // Update cart count
                } else {
                    showMessage('Failed to remove item', 'danger');
                }
            } catch (error) {
                console.error('Error removing item:', error);
                showMessage('Network error while removing item', 'danger');
            }
        });
    });
}

// delete fuction button code end


async function placeOrder(orderRequest) {
    const email = getUserEmail();
    
    try {
        showLoadingSpinner();
        
        console.log('Placing order:', orderRequest);
        
        const response = await makeApiCall(
            API_CONFIG.ENDPOINTS.PLACE_ORDER(email),
            'POST',
            orderRequest,
            true
        );
        
        hideLoadingSpinner();
        
        if (response && response.status === 201) {
            const orderData = await response.json();
            console.log('Order placed successfully:', orderData);

             // ADD THESE CONSOLE LOGS
                 console.log('===== ORDER RESPONSE =====');
                 console.log('Full response:', orderData);
                 console.log('Order ID:', orderData.orderId);
                 console.log('Order ID type:', typeof orderData.orderId);
                 console.log('==========================');
            
            // Store order data for confirmation page
            sessionStorage.setItem('lastOrder', JSON.stringify(orderData));
            sessionStorage.removeItem('checkoutCart');
            
            // Show success message
            showMessage('Order placed successfully!', 'success');
            
            // Update cart badge
            updateCartBadge();
            
            // Redirect to order confirmation page
            setTimeout(() => {
                window.location.href = 'order-confirmation.html?orderId=' + orderData.orderId;
            }, 1500);
            
        } else {
            const errorText = await response.text();
            console.error('Order placement failed:', errorText);
            showMessage('Failed to place order: ' + errorText, 'danger');
        }
        
    } catch (error) {
        hideLoadingSpinner();
        console.error('Error placing order:', error);
        showMessage('Network error. Please try again.', 'danger');
    }
}

console.log('Checkout.js initialized');