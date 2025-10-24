document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Validate inputs
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        // Prepare login data
        const loginData = {
            emailId: email,
            password: password
        };
        
        // Get submit button
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        try {
            // Show loading state
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitButton.disabled = true;
            
            console.log('Sending login request...', loginData);
            
            // Make API call to backend
            const response = await fetch('http://localhost:8081/public/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            console.log('Response status:', response.status);
            console.log('All Response Headers:');
            for (let [key, value] of response.headers.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            // Try to get the token from Authorization header
            const token = response.headers.get('Authorization');
            console.log('Token received:', token);
            
            // Check if response is successful (status 200-299)
            if (response.ok) {
                // Get response body as JSON
                const userData = await response.json();
                console.log('Response body:', userData);
                
                console.log('Login successful! Redirecting...');
                
                // Store complete user data
                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('userEmail', email);
                localStorage.setItem('isLoggedIn', 'true');
                
                // Store token if available
                if (token) {
                    localStorage.setItem('authToken', token);
                    console.log('Token saved successfully!');
                } else {
                    console.warn('No token received in Authorization header');
                }
                
                // Optional: Store in localStorage if "Remember me" is checked
                const rememberMe = document.getElementById('remember-me').checked;
                if (rememberMe) {
                    localStorage.setItem('userData', JSON.stringify(userData));
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('isLoggedIn', 'true');
                    if (token) {
                        localStorage.setItem('authToken', token);
                    }
                }
                
                // Show success message
                alert('Login successful! Redirecting to home page...');
                
                // Force redirect using replace (prevents back button)
                window.location.replace('index.html');
                
            } else {
                // Handle error responses
                const responseText = await response.text();
                console.error('Login failed with status:', response.status);
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                if (response.status === 401) {
                    alert('Invalid credentials. Please check your email and password.');
                } else {
                    alert('Login failed: ' + responseText);
                }
            }
            
        } catch (error) {
            // Handle network errors
            console.error('Login error:', error);
            alert('Network error: ' + error.message + '. Please check your connection and try again.');
            
            // Reset button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
    
    // Optional: Check if user is already logged in
   // At the bottom of login.js, REPLACE the existing check with:
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
const authToken = localStorage.getItem('authToken');

if (isLoggedIn && authToken) {
    console.log('User already logged in, redirecting...');
    window.location.href = 'index.html';
}
});