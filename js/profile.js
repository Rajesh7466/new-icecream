document.addEventListener('DOMContentLoaded', function() {
    // Get user data from sessionStorage
    const userDataJson = sessionStorage.getItem('userData');
    
    if (!userDataJson) {
        console.error('No user data found');
        return;
    }
    
    // Parse user data
    const userData = JSON.parse(userDataJson);
    console.log('User data:', userData);
    
    // Store addresses in a variable for manipulation
    window.userAddresses = userData.adresses || [];
    
    // Update Profile Information Section
    updateProfileInfo(userData);
    
    // Update Address Book Section
    updateAddresses(window.userAddresses);
    
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).style.display = 'block';
        });
    });
    
    // Show profile section by default
    document.getElementById('profile').style.display = 'block';
});

function updateProfileInfo(userData) {
    // Update sidebar profile info
    const profileName = document.querySelector('.profile-info h4');
    const profileSubtitle = document.querySelector('.profile-info p');
    
    if (profileName) profileName.textContent = userData.username || 'User';
    if (profileSubtitle) profileSubtitle.textContent = userData.mobile || 'Member';
    
    // Update profile information section
    const infoItems = document.querySelectorAll('.info-item');
    
    if (infoItems.length >= 4) {
        // Update Full Name
        infoItems[0].querySelector('span:last-child').textContent = userData.username || 'N/A';
        
        // Update Email
        infoItems[1].querySelector('span:last-child').textContent = userData.emailId || 'N/A';
        
        // Update Phone
        infoItems[2].querySelector('span:last-child').textContent = userData.mobile || 'N/A';
        
        // Update Member Since
        infoItems[3].querySelector('span:last-child').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
}

function updateAddresses(addresses) {
    const addressGrid = document.querySelector('.address-grid');
    
    if (!addressGrid) {
        return;
    }
    
    // Clear existing addresses
    addressGrid.innerHTML = '';
    
    // Add address cards from data
    addresses.forEach((address, index) => {
        const isDefault = index === 0;
        const addressType = ['Home', 'Work', 'Other'][index] || `Address ${index + 1}`;
        
        const addressCard = document.createElement('div');
        addressCard.className = `address-card ${isDefault ? 'address-default' : ''}`;
        addressCard.style.cursor = 'pointer';
        
        addressCard.innerHTML = `
            <div class="address-actions">
                <button class="address-action edit-btn" data-id="${address.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="address-action delete-btn" data-id="${address.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <h6>${addressType} ${isDefault ? '<span class="default-badge">Default</span>' : ''}</h6>
            <p class="text-size-16">
                ${address.houseNo || ''} ${address.street || ''}<br>
                ${address.city || ''}, ${address.state || address.postalCode || ''}<br>
                ${address.country || ''}
            </p>
        `;
        
        // Click handler to view address details
        addressCard.addEventListener('click', function(e) {
            if (!e.target.closest('.address-action')) {
                showAddressModal(address, addressType, isDefault);
            }
        });
        
        // Delete button handler
        const deleteBtn = addressCard.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteAddress(address.id);
        });
        
        // Edit button handler
        const editBtn = addressCard.querySelector('.edit-btn');
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showEditAddressModal(address, addressType, isDefault);
        });
        
        addressGrid.appendChild(addressCard);
    });
}

function showAddressModal(address, addressType, isDefault) {
    const modal = document.createElement('div');
    modal.className = 'address-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${addressType} Address</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-info-item">
                    <span class="modal-label">House No:</span>
                    <span>${address.houseNo || 'N/A'}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">Street:</span>
                    <span>${address.street || 'N/A'}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">City:</span>
                    <span>${address.city || 'N/A'}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">State:</span>
                    <span>${address.state || 'N/A'}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">Postal Code:</span>
                    <span>${address.postalCode || 'N/A'}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">Country:</span>
                    <span>${address.country || 'N/A'}</span>
                </div>
                ${isDefault ? '<p style="color: var(--e-global-color-accent); font-weight: 600; margin-top: 15px;">✓ Default Address</p>' : ''}
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-secondary close-modal">Close</button>
            </div>
        </div>
    `;
    
    // Add styles
    addModalStyles();
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        modal.remove();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function showEditAddressModal(address, addressType, isDefault) {
    const modal = document.createElement('div');
    modal.className = 'address-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit ${addressType} Address</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editAddressForm">
                    <div class="form-group-modal">
                        <label>House No:</label>
                        <input type="text" name="houseNo" value="${address.houseNo || ''}" required>
                    </div>
                    <div class="form-group-modal">
                        <label>Street:</label>
                        <input type="text" name="street" value="${address.street || ''}" required>
                    </div>
                    <div class="form-group-modal">
                        <label>City:</label>
                        <input type="text" name="city" value="${address.city || ''}" required>
                    </div>
                    <div class="form-group-modal">
                        <label>State:</label>
                        <input type="text" name="state" value="${address.state || ''}">
                    </div>
                    <div class="form-group-modal">
                        <label>Postal Code:</label>
                        <input type="text" name="postalCode" value="${address.postalCode || ''}" required>
                    </div>
                    <div class="form-group-modal">
                        <label>Country:</label>
                        <input type="text" name="country" value="${address.country || ''}" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-secondary close-modal">Cancel</button>
                <button class="modal-btn save-address-btn">Save Changes</button>
            </div>
        </div>
    `;
    
    // Add styles
    addModalStyles();
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        modal.remove();
    });
    
    const saveBtn = modal.querySelector('.save-address-btn');
    saveBtn.addEventListener('click', function() {
        const form = modal.querySelector('#editAddressForm');
        const formData = new FormData(form);
        
        // Update address in memory
        const index = window.userAddresses.findIndex(a => a.id === address.id);
        if (index !== -1) {
            window.userAddresses[index] = {
                ...window.userAddresses[index],
                houseNo: formData.get('houseNo'),
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                postalCode: formData.get('postalCode'),
                country: formData.get('country')
            };
            
            // Update display
            updateAddresses(window.userAddresses);
            modal.remove();
            alert('Address updated successfully!');
        }
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function showAddAddressModal() {
    const modal = document.createElement('div');
    modal.className = 'address-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Address</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addAddressForm">
                    <div class="form-group-modal">
                        <label>House No:</label>
                        <input type="text" name="houseNo" placeholder="Enter house number" required>
                    </div>
                    <div class="form-group-modal">
                        <label>Street:</label>
                        <input type="text" name="street" placeholder="Enter street" required>
                    </div>
                    <div class="form-group-modal">
                        <label>City:</label>
                        <input type="text" name="city" placeholder="Enter city" required>
                    </div>
                    <div class="form-group-modal">
                        <label>State:</label>
                        <input type="text" name="state" placeholder="Enter state (optional)">
                    </div>
                    <div class="form-group-modal">
                        <label>Postal Code:</label>
                        <input type="text" name="postalCode" placeholder="Enter postal code" required>
                    </div>
                    <div class="form-group-modal">
                        <label>Country:</label>
                        <input type="text" name="country" placeholder="Enter country" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-secondary close-modal">Cancel</button>
                <button class="modal-btn add-address-btn">Add Address</button>
            </div>
        </div>
    `;
    
    // Add styles
    addModalStyles();
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        modal.remove();
    });
    
    const addBtn = modal.querySelector('.add-address-btn');
    addBtn.addEventListener('click', function() {
        const form = modal.querySelector('#addAddressForm');
        const formData = new FormData(form);
        
        // Create new address
        const newAddress = {
            id: Math.max(...window.userAddresses.map(a => a.id), 0) + 1,
            houseNo: formData.get('houseNo'),
            street: formData.get('street'),
            city: formData.get('city'),
            state: formData.get('state'),
            postalCode: formData.get('postalCode'),
            country: formData.get('country')
        };
        
        window.userAddresses.push(newAddress);
        updateAddresses(window.userAddresses);
        modal.remove();
        alert('Address added successfully!');
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function deleteAddress(addressId) {
    if (confirm('Are you sure you want to delete this address?')) {
        window.userAddresses = window.userAddresses.filter(a => a.id !== addressId);
        updateAddresses(window.userAddresses);
        alert('Address deleted successfully!');
    }
}

function addModalStyles() {
    // Check if styles already added
    if (document.getElementById('modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .address-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 1px solid #e5e5e5;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #0f0200;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #646464;
        }
        
        .close-modal:hover {
            color: #f83d8e;
        }
        
        .modal-body {
            padding: 25px;
        }
        
        .modal-info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e5e5;
        }
        
        .modal-label {
            font-weight: 600;
            color: #0f0200;
        }
        
        .form-group-modal {
            margin-bottom: 15px;
        }
        
        .form-group-modal label {
            display: block;
            font-weight: 600;
            color: #0f0200;
            margin-bottom: 8px;
        }
        
        .form-group-modal input {
            width: 100%;
            padding: 12px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            font-size: 16px;
            font-family: "Archivo", sans-serif;
        }
        
        .form-group-modal input:focus {
            outline: none;
            border-color: #f83d8e;
            box-shadow: 0 0 0 3px rgba(248, 61, 142, 0.2);
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 20px 25px;
            border-top: 1px solid #e5e5e5;
        }
        
        .modal-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .modal-btn:not(.modal-btn-secondary) {
            background-color: #f83d8e;
            color: white;
        }
        
        .modal-btn:not(.modal-btn-secondary):hover {
            background-color: #0f0200;
        }
        
        .modal-btn-secondary {
            background-color: #f6f3f9;
            color: #0f0200;
        }
        
        .modal-btn-secondary:hover {
            background-color: #e5e5e5;
        }
    `;
    
    document.head.appendChild(style);
}

// Set up "Add New Address" button
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const addAddressBtn = document.querySelector('[data-add-address]') || 
            Array.from(document.querySelectorAll('.all_button')).find(btn => btn.textContent.includes('Add New Address'));
        
        if (addAddressBtn) {
            addAddressBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showAddAddressModal();
            });
        }
    }, 100);
});