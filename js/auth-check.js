// js/auth-check.js
document.addEventListener("DOMContentLoaded", function() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const authToken = localStorage.getItem("authToken");
    
    // Get current page name
    const currentPage = window.location.pathname.split('/').pop();
    
    // DON'T redirect if we're already on login, register, or index page
    if (currentPage === "login.html" || currentPage === "register.html" || currentPage === "index.html") {
        console.log("On public page or auth page");  
        return;
    }
    
    // For protected pages, check authentication
    if (!isLoggedIn || !authToken) {
        console.log("Authentication failed. Redirecting to login.html");
        console.log("isLoggedIn:", isLoggedIn, "authToken:", authToken);
        window.location.href = "login.html";
    } else {
        console.log("Authentication check passed. User is logged in.");
    }
});