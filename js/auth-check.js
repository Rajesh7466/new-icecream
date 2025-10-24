// js/auth-check.js
document.addEventListener("DOMContentLoaded", function() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const authToken = localStorage.getItem("authToken");
    
    // Get current page name
    const currentPage = window.location.pathname.split('/').pop();
    
    // DON'T redirect if we're already on login or register page
    if (currentPage === "login.html" || currentPage === "register.html") {
        console.log("Already on login/register page");  
        return;
    }
    
    // For ALL other pages (including index.html), check authentication
    if (!isLoggedIn || !authToken) {
        console.log("Authentication failed. Redirecting to login.html");
        console.log("isLoggedIn:", isLoggedIn, "authToken:", authToken);
        window.location.href = "login.html";
    } else {
        console.log("Authentication check passed. User is logged in.");
    }
});