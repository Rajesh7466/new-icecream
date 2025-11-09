// ═══════════════════════════════════════════════════════════════
// Order Confirmation Page
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    console.log('Order confirmation page loaded');
    
    // Check if user is logged in
    if (!requireLogin()) {
        return;
    }
    
    // Load order details
    loadOrderDetails();
});

async function loadOrderDetails() {
    // Try to get order from sessionStorage first
    const storedOrder = sessionStorage.getItem('lastOrder');
    
    if (storedOrder) {
        const orderData = JSON.parse(storedOrder);
        displayOrderDetails(orderData);
        return;
    }
    
    // Or get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
        alert('No order found!');
        // window.location.href = 'index.html';
         window.location.href = 'order-confirmation.html';
        return;
    }
    
    // Fetch order details from API
    const email = getUserEmail();
    
    try {
        showLoadingSpinner();
        
        const response = await makeApiCall(
            API_CONFIG.ENDPOINTS.ORDER_DETAILS(orderId, email),
            'GET',
            null,
            true
        );
        
        hideLoadingSpinner();
        
        if (response && response.ok) {
            const orderData = await response.json();
            displayOrderDetails(orderData);
        } else {
            showMessage('Failed to load order details', 'danger');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    } catch (error) {
        hideLoadingSpinner();
        console.error('Error loading order:', error);
        showMessage('Network error', 'danger');
    }
}

function displayOrderDetails(order) {
    const container = document.getElementById('orderDetailsContainer');
    
    if (!container) {
        console.error('Order details container not found');
        return;
    }
    
    // Calculate estimated delivery date (7 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    
    const detailsHTML = `
        <h5 class="mb-3">Order Details</h5>
        
        <div class="order-item">
            <strong>Order ID:</strong>
            <span>#${order.orderId}</span>
        </div>
        
        <div class="order-item">
            <strong>Order Date:</strong>
            <span>${formatDate(order.orderDate)}</span>
        </div>
        
        <div class="order-item">
            <strong>Status:</strong>
            <span class="badge bg-warning">${order.status}</span>
        </div>
        
        <div class="order-item">
            <strong>Payment Method:</strong>
            <span>${order.paymentType}</span>
        </div>
        
        <div class="order-item">
            <strong>Delivery Address:</strong>
            <span>${order.deliveryAddress}</span>
        </div>
        
        <div class="order-item">
            <strong>Estimated Delivery:</strong>
            <span>${deliveryDate.toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</span>
        </div>
        
        <hr class="my-3">
        
        <h6 class="mb-3">Order Items:</h6>
        ${order.items.map(item => `
            <div class="order-item">
                <div>
                    <strong>${item.productName}</strong>
                    <br>
                    <small class="text-muted">Quantity: ${item.quantity} × ${formatPrice(item.price)}</small>
                </div>
                <span>${formatPrice(item.subtotal)}</span>
            </div>
        `).join('')}
        
        <hr class="my-3">
        
        <div class="order-item">
            <strong style="font-size: 18px;">Total Amount:</strong>
            <strong style="font-size: 18px; color: #f83d8e;">${formatPrice(order.totalAmount)}</strong>
        </div>
    `;
    
    container.innerHTML = detailsHTML;
}

console.log('Order confirmation script loaded');