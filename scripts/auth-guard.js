/**
 * AUTH GUARD - Universal Authentication Check
 * Load this FIRST in every protected page
 * Auto-redirect to login if not authenticated
 */

(function() {
    'use strict';

    const AUTH_TOKEN_KEY = 'authToken';
    const USER_KEY = 'user';
    const PROJECT_ID_KEY = 'currentProjectId';
    const LOGIN_PAGE = '../auth/auth.html';

    /**
     * Check if user has valid token
     */
    function hasToken() {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        return !!token && token !== 'null' && token !== 'undefined';
    }

    /**
     * Get auth token
     */
    function getToken() {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }

    /**
     * Get current user
     */
    function getCurrentUser() {
        try {
            const userStr = localStorage.getItem(USER_KEY);
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Clear auth data and redirect to login
     */
    function redirectToLogin(reason = 'Authentication required') {
        console.log('Redirecting to login:', reason);
        
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        
        const currentPath = window.location.pathname + window.location.search;
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        
        window.location.href = LOGIN_PAGE;
    }

    /**
     * Ensure user has a default project
     */
    async function ensureDefaultProject() {
        const existingProjectId = localStorage.getItem(PROJECT_ID_KEY);
        
        if (existingProjectId) {
            console.log('✅ Project ID found:', existingProjectId);
            return existingProjectId;
        }

        console.log('⚠️ No project ID found, creating default project...');

        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/projects/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: 'My Workspace',
                    description: 'Default workspace'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create project');
            }

            const data = await response.json();
            const projectId = data.project.id;
            
            localStorage.setItem(PROJECT_ID_KEY, projectId);
            console.log('✅ Default project created:', projectId);
            
            return projectId;
        } catch (error) {
            console.error('❌ Error creating project:', error);
            // Set default to 1 as fallback
            localStorage.setItem(PROJECT_ID_KEY, '1');
            return '1';
        }
    }

    /**
     * Initialize auth guard
     */
    async function initAuthGuard() {
        console.log('🔐 Auth Guard: Checking authentication...');

        if (!hasToken()) {
            console.log('❌ No token found');
            redirectToLogin('No token found');
            return;
        }

        const token = getToken();
        const user = getCurrentUser();

        console.log('✅ Token found:', token.substring(0, 20) + '...');
        console.log('👤 User:', user ? user.full_name || user.name : 'Unknown');

        console.log('✅ Authentication OK');

        await ensureDefaultProject();
    }

    /**
     * Public API for other scripts
     */
    window.AuthGuard = {
        isAuthenticated: hasToken,
        getToken: getToken,
        getCurrentUser: getCurrentUser,
        logout: function() {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(PROJECT_ID_KEY);
            window.location.href = LOGIN_PAGE;
        },
        getProjectId: function() {
            return localStorage.getItem(PROJECT_ID_KEY) || '1';
        }
    };

    // Auto-run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthGuard);
    } else {
        initAuthGuard();
    }

})();