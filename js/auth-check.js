// js/auth-check.js
document.addEventListener("DOMContentLoaded", function() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const authToken = sessionStorage.getItem("authToken");

    // Only redirect if BOTH isLoggedIn is not "true" AND authToken is missing/null.
    // This provides a more robust check.
    if (isLoggedIn !== "true" || !authToken) {
        // Get the current page filename to avoid redirect loops if we're already on login/register
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage !== "login.html" && currentPage !== "register.html") {
            console.log("Authentication check failed. Redirecting to login.html.");
            console.log("isLoggedIn:", isLoggedIn, "authToken:", authToken); // For debugging
            window.location.href = "login.html";
        }
    } else {
        console.log("Authentication check passed. User is logged in.");
    }
});