// Shared Authentication System for Modal Realism Calculator Suite
// This script provides universal authentication across all pages

// Global authentication state
let isLoggedIn = false;
let currentUser = null;

// Initialize authentication on page load
function initAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateAuthUI();
    }
}

function updateAuthUI() {
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const profileBtn = document.getElementById('profileBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (isLoggedIn && currentUser) {
        if (userInfo) userInfo.style.display = 'block';
        if (userName) userName.textContent = currentUser.name;
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (profileBtn) profileBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

function showAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'block';
        if (tab === 'register') {
            switchAuthTab('register');
        } else {
            switchAuthTab('login');
        }
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        clearAuthMessages();
    }
}

function switchAuthTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    const targetTab = document.querySelector(`[onclick="switchAuthTab('${tab}')"]`);
    if (targetTab) targetTab.classList.add('active');

    // Update tab content
    document.querySelectorAll('.auth-tab-content').forEach(c => c.classList.remove('active'));
    const tabElement = document.getElementById(tab + 'Tab');
    if (tabElement) tabElement.classList.add('active');
}

function modalLogin() {
    const email = document.getElementById('modalLoginEmail').value;
    const password = document.getElementById('modalLoginPassword').value;

    if (!email || !password) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[email] && users[email].password === password) {
        currentUser = users[email];
        isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        showAuthMessage('Login successful!', 'success');
        setTimeout(() => {
            closeAuthModal();
        }, 1500);
    } else {
        showAuthMessage('Invalid email or password', 'error');
    }
}

function modalRegister() {
    const name = document.getElementById('modalRegisterName').value;
    const email = document.getElementById('modalRegisterEmail').value;
    const password = document.getElementById('modalRegisterPassword').value;
    const confirmPassword = document.getElementById('modalConfirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[email]) {
        showAuthMessage('Email already registered', 'error');
        return;
    }

    users[email] = { name, email, password };
    localStorage.setItem('users', JSON.stringify(users));

    showAuthMessage('Registration successful! Please login.', 'success');
    setTimeout(() => {
        switchAuthTab('login');
        const loginEmail = document.getElementById('modalLoginEmail');
        if (loginEmail) loginEmail.value = email;
    }, 1500);
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
}

function showAuthMessage(message, type) {
    const messageDiv = document.getElementById('authMessage');
    if (messageDiv) {
        messageDiv.innerHTML = `<div class="${type}-message">${message}</div>`;
    }
}

function clearAuthMessages() {
    const messageDiv = document.getElementById('authMessage');
    if (messageDiv) {
        messageDiv.innerHTML = '';
    }
}

// Get current user info (for use in other scripts)
function getCurrentUser() {
    return currentUser;
}

function getAuthStatus() {
    return isLoggedIn;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
});
