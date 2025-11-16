/**
 * Dashboard Page Logic
 * Menangani list, create, view, dan edit dashboard seperti Metabase
 */

// ====================================
// STATE & VARIABLES
// ====================================

let currentUser = null;
let userDashboards = [];
let currentDashboard = null;
let currentViewingDashboardId = null;

// ====================================
// LIFECYCLE & INITIALIZATION
// ====================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication
        if (!isAuthenticated()) {
            window.location.href = '../html/auth.html';
            return;
        }

        // Load sidebar
        loadSidebar();

        // Load user profile and dashboards
        await initializePage();

        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
});

/**
 * Initialize dashboard page
 */
async function initializePage() {
    try {
        // Fetch user profile
        currentUser = await apiGetUserProfile();

        // Fetch user's dashboards
        await loadUserDashboards();

        // If we have dashboards, show them. Otherwise show empty state
        if (userDashboards.length === 0) {
            document.getElementById('emptyState').classList.remove('hidden-page');
            document.getElementById('dashboardsGrid').innerHTML = '';
        } else {
            document.getElementById('emptyState').classList.add('hidden-page');
            renderDashboardCards();
        }
    } catch (error) {
        console.error('Error initializing page:', error);
        // Fallback to sample data
        loadSampleDashboards();
    }
}

/**
 * Load user dashboards from API
 */
async function loadUserDashboards() {
    try {
        const projects = await apiGetUserProjects();
        
        if (Array.isArray(projects)) {
            userDashboards = projects.map(project => ({
                id: project.id || project.project_id,
                name: project.name,
                description: project.description || '',
                owner: project.owner_id || currentUser.id,
                ownerName: project.owner_name || currentUser.name,
                database: project.database || 'Database',
                createdAt: project.created_at || new Date().toISOString(),
                type: project.type || 'dashboard'
            }));
        } else {
            userDashboards = [];
        }
    } catch (error) {
        console.error('Error loading dashboards:', error);
        userDashboards = [];
    }
}

/**
 * Load sample dashboards (fallback)
 */
function loadSampleDashboards() {
    userDashboards = [
        {
            id: 1,
            name: 'Sales Performance',
            description: 'Monthly sales metrics and trends across regions',
            owner: currentUser?.id || 1,
            ownerName: currentUser?.name || 'You',
            database: 'Sales Database',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'dashboard'
        },
        {
            id: 2,
            name: 'Customer Analytics',
            description: 'Customer behavior, retention, and satisfaction metrics',
            owner: 2,
            ownerName: 'Jane Smith',
            database: 'Customer Database',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'dashboard'
        },
        {
            id: 3,
            name: 'Financial Overview',
            description: 'Revenue, expenses, and profitability analysis',
            owner: currentUser?.id || 1,
            ownerName: currentUser?.name || 'You',
            database: 'Finance Database',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'dashboard'
        }
    ];
    renderDashboardCards();
}

// ====================================
// RENDER FUNCTIONS
// ====================================

/**
 * Render dashboard cards to grid
 */
function renderDashboardCards() {
    const grid = document.getElementById('dashboardsGrid');
    grid.innerHTML = '';

    userDashboards.forEach(dashboard => {
        const card = createDashboardCard(dashboard);
        grid.appendChild(card);
    });
}

/**
 * Create a dashboard card element
 */
function createDashboardCard(dashboard) {
    const card = document.createElement('div');
    card.className = 'dashboard-card';
    card.dataset.dashboardId = dashboard.id;

    // Format dates
    const createdDate = new Date(dashboard.createdAt);
    const timeAgo = formatTimeAgo(createdDate);
    const initials = generateInitials(dashboard.ownerName);

    const isOwner = currentUser && dashboard.owner === currentUser.id;

    card.innerHTML = `
        <div class="dashboard-card-header">
            <div class="dashboard-card-icon">
                <i class="bi bi-graph-up"></i>
            </div>
            <button class="dashboard-card-menu" data-dashboard-id="${dashboard.id}">
                <i class="bi bi-three-dots-vertical"></i>
            </button>
        </div>
        <h3 class="dashboard-card-title">${escapeHtml(dashboard.name)}</h3>
        ${dashboard.description ? `<p class="dashboard-card-description">${escapeHtml(dashboard.description)}</p>` : ''}
        <div class="dashboard-card-meta">
            <div class="dashboard-card-owner">
                <div class="dashboard-card-avatar">${initials}</div>
                <span>${escapeHtml(dashboard.ownerName)}</span>
            </div>
            <span class="dashboard-card-date">${timeAgo}</span>
        </div>
    `;

    // Add click handler to open dashboard
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.dashboard-card-menu')) {
            openDashboardView(dashboard.id);
        }
    });

    // Add menu handler
    const menuBtn = card.querySelector('.dashboard-card-menu');
    menuBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        showDashboardMenu(e, dashboard, isOwner);
    });

    return card;
}

/**
 * Show dashboard context menu
 */
function showDashboardMenu(e, dashboard, isOwner) {
    // TODO: Implement context menu (delete, share, duplicate, etc)
    console.log('Menu for dashboard:', dashboard);
}

/**
 * Format time ago (e.g., "2 days ago")
 */
function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(diff / 604800000);
    const months = Math.floor(diff / 2592000000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return 'Long ago';
}

/**
 * Generate initials from name
 */
function generateInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ====================================
// DASHBOARD VIEW/OPEN
// ====================================

/**
 * Open dashboard view page
 */
function openDashboardView(dashboardId) {
    const dashboard = userDashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
        console.error('Dashboard not found:', dashboardId);
        return;
    }

    currentViewingDashboardId = dashboardId;
    currentDashboard = dashboard;

    // Update view page with dashboard data
    updateDashboardViewPage(dashboard);

    // Switch to view page
    document.getElementById('dashboardListPage').classList.add('hidden-page');
    document.getElementById('dashboardViewPage').classList.remove('hidden-page');

    // Scroll to top
    window.scrollTo(0, 0);
}

/**
 * Update dashboard view page with data
 */
function updateDashboardViewPage(dashboard) {
    document.getElementById('dashboardViewTitle').textContent = dashboard.name;
    
    const descElement = document.getElementById('dashboardViewDescription');
    if (dashboard.description) {
        descElement.textContent = dashboard.description;
        descElement.style.display = 'block';
    } else {
        descElement.style.display = 'none';
    }

    document.getElementById('dashboardViewOwner').textContent = `Owner: ${dashboard.ownerName}`;
    document.getElementById('dashboardViewCreated').textContent = `Created ${formatTimeAgo(dashboard.createdAt)}`;

    // Show/hide edit button based on ownership
    const editBtn = document.getElementById('editDashboardBtn');
    const editBtnContent = document.getElementById('editDashboardBtnContent');
    const isOwner = currentUser && dashboard.owner === currentUser.id;
    
    editBtn.style.display = isOwner ? 'flex' : 'none';
    editBtnContent.style.display = isOwner ? 'block' : 'none';
}

/**
 * Go back to dashboard list
 */
function backToDashboardsList() {
    document.getElementById('dashboardViewPage').classList.add('hidden-page');
    document.getElementById('dashboardListPage').classList.remove('hidden-page');
    currentViewingDashboardId = null;
    currentDashboard = null;
    window.scrollTo(0, 0);
}

// ====================================
// CREATE DASHBOARD MODAL
// ====================================

/**
 * Open create dashboard modal
 */
function openCreateDashboardModal() {
    const modal = document.getElementById('createDashboardModal');
    modal.classList.add('active');
    
    // Reset form
    document.getElementById('dashboardForm').reset();
    
    // Load databases (CSV uploads) into dropdown
    loadDatabasesIntoDropdown();
}

/**
 * Close create dashboard modal
 */
function closeCreateDashboardModal() {
    const modal = document.getElementById('createDashboardModal');
    modal.classList.remove('active');
}

/**
 * Load databases/CSV files into dropdown
 */
async function loadDatabasesIntoDropdown() {
    const select = document.getElementById('databaseSelect');
    const currentOptions = select.innerHTML;
    
    try {
        // Fetch available CSV uploads (databases)
        // For now, we'll add some sample databases
        const databases = [
            { id: 1, name: 'Sales Data' },
            { id: 2, name: 'Customer Database' },
            { id: 3, name: 'Financial Records' },
            { id: 4, name: 'Inventory' }
        ];

        select.innerHTML = '<option value="">-- Select a database --</option>';
        databases.forEach(db => {
            const option = document.createElement('option');
            option.value = db.id;
            option.textContent = db.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading databases:', error);
        // Keep existing options
    }
}

/**
 * Handle dashboard form submission
 */
async function handleCreateDashboard(e) {
    e.preventDefault();

    const name = document.getElementById('dashboardName').value.trim();
    const database = document.getElementById('databaseSelect').value;
    const description = document.getElementById('databaseDescription').value.trim();

    // Validation
    if (!name) {
        alert('Please enter dashboard name');
        return;
    }
    if (!database) {
        alert('Please select a database');
        return;
    }

    try {
        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Creating...</span>';

        // Call API to create dashboard
        const newDashboard = await apiCreateProject({
            name: name,
            description: description,
            type: 'dashboard',
            database: database
        });
        // Add to local list

        userDashboards.push({
            id: newDashboard.id || Date.now(),
            name: newDashboard.name,
            description: newDashboard.description,
            owner: currentUser.id,
            ownerName: currentUser.name,
            database: database,
            createdAt: new Date().toISOString(),
            type: 'dashboard'
        });

        // Close modal
        closeCreateDashboardModal();

        // Refresh UI
        if (userDashboards.length === 1) {
            document.getElementById('emptyState').classList.add('hidden-page');
        }
        renderDashboardCards();

        // Show success notification
        showNotification('Dashboard created successfully!', 'success');

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Optionally open the new dashboard
        setTimeout(() => {
            openDashboardView(newDashboard.id || userDashboards[userDashboards.length - 1].id);
        }, 500);
    } catch (error) {
        console.error('Error creating dashboard:', error);
        alert('Failed to create dashboard: ' + error.message);
        
        // Reset button
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-plus-lg"></i> <span>Create</span>';
    }
}

// ====================================
// NOTIFICATIONS & UI
// ====================================

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ====================================
// EVENT LISTENERS
// ====================================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Create dashboard buttons
    document.getElementById('createDashboardBtn')?.addEventListener('click', openCreateDashboardModal);
    document.getElementById('createDashboardBtnEmpty')?.addEventListener('click', openCreateDashboardModal);

    // Modal actions
    document.getElementById('closeModalBtn')?.addEventListener('click', closeCreateDashboardModal);
    document.getElementById('cancelBtn')?.addEventListener('click', closeCreateDashboardModal);
    document.getElementById('dashboardForm')?.addEventListener('submit', handleCreateDashboard);

    // Dashboard view actions
    document.getElementById('backToDashboardsBtn')?.addEventListener('click', backToDashboardsList);
    document.getElementById('editDashboardBtn')?.addEventListener('click', () => {
        alert('Edit dashboard feature coming soon!');
    });
    document.getElementById('editDashboardBtnContent')?.addEventListener('click', () => {
        alert('Edit dashboard feature coming soon!');
    });

    // Close modal on overlay click
    document.getElementById('createDashboardModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'createDashboardModal') {
            closeCreateDashboardModal();
        }
    });
}

/**
 * Load sidebar navigation
 */
function loadSidebar() {
    // This should be called from sidebar.js
    if (typeof window.initSidebar === 'function') {
        window.initSidebar();
    }
}
