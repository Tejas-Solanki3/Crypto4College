// This file could handle overall initialization and page-specific logic loading.
// For this multi-page approach, most initialization is done in <script> tags on each page.

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Run general auth check first
    if (!path.endsWith('index.html') && path !== '/') {
        if (!checkLogin()) { // from auth.js
            return; // Stop further execution if not logged in and redirecting
        }
    }
    
    // User greeting for logged-in pages
    const greetingElement = document.getElementById('user-greeting');
    if(greetingElement && getCurrentUser()){
        displayUserGreeting(); // from ui.js
    }

    // Page-specific initializations
    if (path.endsWith('dashboard.html')) {
        loadDashboardData(); // from wallet.js or a dedicated dashboard.js
    } else if (path.endsWith('wallet.html')) {
        setupWalletPage(); // from ui.js
    } else if (path.endsWith('fees.html')) {
        setupFeesPage(); // from ui.js
    } else if (path.endsWith('events.html')) {
        setupEventsPage(); // from ui.js
    } else if (path.endsWith('admin.html')) {
        // Admin specific setup is handled within admin.js directly after auth check
    }

    // Add logout button functionality if present (might be in header on multiple pages)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && getCurrentUser()) { // Ensure user is logged in to show/use logout
        logoutBtn.addEventListener('click', logout); // from auth.js
    } else if (logoutBtn) {
        logoutBtn.style.display = 'none'; // Hide logout if not logged in
    }
});