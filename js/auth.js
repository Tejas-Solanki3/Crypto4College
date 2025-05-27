// --- LocalStorage Keys ---
const USERS_KEY = 'crypto4college_users';
const LOGGED_IN_USER_KEY = 'crypto4college_loggedInUser';
const ADMIN_USERNAME = 'admin'; // Predefined admin

// --- Initial Data (for demo purposes) ---
function initializeDefaultAdmin() {
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    if (!users.find(user => user.username === ADMIN_USERNAME)) {
        users.push({
            username: ADMIN_USERNAME,
            password: 'adminpassword', // In a real app, HASH THIS!
            email: 'admin@college.edu',
            is_admin: true,
            balance: 1000000 // Admin has a lot of CC to distribute initially
        });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
}
initializeDefaultAdmin();


// --- DOM Elements (for index.html) ---
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');

if (loginForm) { // Ensure these elements exist on the current page
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('signup-btn').addEventListener('click', handleSignup);
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
}

// --- Authentication Functions ---
function handleSignup() {
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value; // NEVER store plaintext in real app
    const email = document.getElementById('signup-email').value.trim();

    if (!username || !password || !email) {
        alert('Please fill in all fields.');
        return;
    }

    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    if (users.find(user => user.username === username)) {
        alert('Username already exists.');
        return;
    }

    // "Wallet Creation" - a new user object
    const newUser = {
        username: username,
        password: password, // Store hashed password in real app
        email: email,
        balance: 100, // Initial "airdrop" of CollegeCoin
        is_admin: false,
        id: `user_${Date.now()}` // Simple unique ID
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    alert('Signup successful! Please login.');
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
}

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user = users.find(u => u.username === username && u.password === password); // Compare hashed in real app

    if (user) {
        localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
        alert('Login successful!');
        if (user.is_admin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    } else {
        alert('Invalid username or password.');
    }
}

function logout() {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
    window.location.href = 'index.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(LOGGED_IN_USER_KEY));
}

function checkLogin() {
    const user = getCurrentUser();
    if (!user) {
        // If not on index.html and not logged in, redirect
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
             window.location.href = 'index.html';
        }
        return false;
    }
    // Attach logout to button if it exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    return true;
}

// Global check on pages that require login
if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', () => {
        checkLogin();
    });
}
