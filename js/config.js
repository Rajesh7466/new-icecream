// ═══════════════════════════════════════════════════════════════
// API Configuration and Common Functions
// ═══════════════════════════════════════════════════════════════

const API_CONFIG = {
    BASE_URL: 'https://spring-security-6eii.onrender.com', // Change this to your backend URL
    ENDPOINTS: {
        // Cart endpoints
        ADD_TO_CART: (email) => `/cart/add/${email}`,
        GET_CART: (email) => `/cart/${email}`,
        UPDATE_CART: (cartItemId, email) => `/cart/update/${cartItemId}/${email}`,
        REMOVE_FROM_CART: (cartItemId, email) => `/cart/item/${cartItemId}/${email}`,
        CLEAR_CART: (email) => `/cart/clear/${email}`,
        
        // Order endpoints
        PLACE_ORDER: (email) => `/order/place/${email}`,
        ORDER_HISTORY: (email) => `/order/history/${email}`,
        ORDER_DETAILS: (orderId, email) => `/order/${orderId}/${email}`,
        CANCEL_ORDER: (orderId, email) => `/order/cancel/${orderId}/${email}`,
        
        // Product endpoints
        GET_PRODUCTS: '/public/products',
        GET_PRODUCT: (id) => `/public/products/${id}`
    }
};

// ═══════════════════════════════════════════════════════════════
// Authentication Helper Functions
// ═══════════════════════════════════════════════════════════════

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function getUserEmail() {
    return localStorage.getItem('userEmail');
}

function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' && getAuthToken() !== null;
}

function requireLogin() {
    if (!isUserLoggedIn()) {
        alert('Please login to continue');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken()
    };
}

// ═══════════════════════════════════════════════════════════════
// API Call Helper Functions
// ═══════════════════════════════════════════════════════════════

async function makeApiCall(url, method = 'GET', body = null, requireAuth = true) {
    const options = {
        method: method,
        headers: requireAuth ? getAuthHeaders() : {
            'Content-Type': 'application/json'
        }
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(API_CONFIG.BASE_URL + url, options);

        // Handle 401 Unauthorized
        if (response.status === 401) {
            alert('Session expired. Please login again.');
            localStorage.clear();
            window.location.href = 'login.html';
            return null;
        }

        return response;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════
// UI Helper Functions
// ═══════════════════════════════════════════════════════════════

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Loading...</p></div>';
    }
}

function showMessage(message, type = 'success') {
    // Create alert div
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function formatPrice(price) {
    return '₹' + parseFloat(price).toFixed(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ═══════════════════════════════════════════════════════════════
// Loading Spinner
// ═══════════════════════════════════════════════════════════════

function showLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    spinner.style.cssText = 'background: rgba(0,0,0,0.5); z-index: 10000;';
    spinner.innerHTML = '<div class="spinner-border text-light" style="width: 3rem; height: 3rem;"></div>';
    document.body.appendChild(spinner);
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.remove();
    }
}

// ═══════════════════════════════════════════════════════════════
// Export for use in other files
// ═══════════════════════════════════════════════════════════════

console.log('Config.js loaded successfully');