// auth.js - Auth utility functions

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Check if user is logged in (has valid token)
 * @returns {boolean}
 */
function isLoggedIn() {
    return !!localStorage.getItem('authToken');
}

/**
 * Get current user data from localStorage
 * @returns {object|null}
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get auth token
 * @returns {string|null}
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '../auth/auth.html';
}

/**
 * Make authenticated API call
 * @param {string} endpoint - API endpoint path (e.g., '/api/projects')
 * @param {object} options - Fetch options
 * @returns {Promise}
 */
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        // If unauthorized, logout user
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        
        return { status: response.status, data };
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '../auth/auth.html';
    }
}
