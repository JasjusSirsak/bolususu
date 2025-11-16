/**
 * API Client Utility
 * Centralized functions untuk semua API calls
 * Handles authentication, error handling, dan request/response formatting
 */

// --- PASTIKAN CUMA ADA SATU KONSTAN INI DI SELURUH PROJECT LO ---
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Get stored JWT token dari localStorage
 */
function getAuthToken() {
    return localStorage.getItem('authToken'); // Pastikan key-nya 'authToken' sesuai yang lo pake saat login
}

/**
 * Set JWT token ke localStorage
 */
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

/**
 * Remove JWT token dari localStorage
 */
function removeAuthToken() {
    localStorage.removeItem('authToken');
}

/**
 * Generic API request function dengan authentication
 */
async function apiRequest(endpoint, options = {}) {
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

        if (response.status === 401) {
            console.log('Token expired or invalid');
            removeAuthToken();
            window.location.href = '../html/auth.html';
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// ==================== AUTHENTICATION ====================

async function apiLogin(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }

    setAuthToken(data.token);
    return data;
}

async function apiRegister(full_name, email, password) { // Ganti 'name' jadi 'full_name' biar sama kayak backend
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
    }

    return data;
}

function apiLogout() {
    removeAuthToken();
    window.location.href = '../html/auth.html';
}

// ==================== USER PROFILE & PREFERENCES ====================

// HANYA SATU FUNGSI INI YANG DIPAKE
async function apiGetUserProfile() {
    const data = await apiRequest('/user/profile', { method: 'GET' });
    return data.user || data;
}

async function apiUpdateUserProfile(updates) {
    const data = await apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
    return data.user || data;
}

async function apiGetUserPreferences() {
    try {
        const data = await apiRequest('/user/preferences', { method: 'GET' });
        return data.preferences || data;
    } catch (error) {
        console.error('Get Preferences Error:', error);
        return {}; // Return empty object jika endpoint tidak ada
    }
}

async function apiUpdateUserPreferences(preferences) {
    const data = await apiRequest('/user/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences)
    });
    return data.preferences || data;
}

// ==================== PROJECTS ====================

async function apiGetUserProjects() {
    const data = await apiRequest('/user/projects', { method: 'GET' });
    return data.data || data; // Backend lo ngembaliin `data.data`
}

async function apiCreateProject(projectData) {
    const data = await apiRequest('/projects/create', {
        method: 'POST',
        body: JSON.stringify(projectData)
    });
    return data.project || data;
}

async function apiGetTeamMembers() {
    try {
        const data = await apiRequest('/team/members', { method: 'GET' });
        return data.members || data;
    } catch (error) {
        console.error('Get Team Members Error:', error);
        return [];
    }
}

// ==================== HELPERS ====================

function isAuthenticated() {
    return !!getAuthToken();
}

function formatUserData(userData) {
    return {
        id: userData.id || '',
        name: userData.name || userData.full_name || 'User', // Handle 'name' atau 'full_name'
        email: userData.email || '',
        role: userData.role || 'Member',
        avatar: generateInitials(userData.name || userData.full_name || 'U'),
        joinDate: formatDate(userData.created_at || new Date()),
        ...userData
    };
}

function generateInitials(name) {
    return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function formatDate(date) {
    if (!date) return 'Unknown';
    const d = new Date(date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
}