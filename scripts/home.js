/**
 * Home Page - Restructured
 * Initialize greeting, recent projects, and team members
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Home page initialized');
    
    // Check authentication first - FIXED VERSION
    requireAuth(); // Function dari auth.js
    
    // Get user info
    const user = getCurrentUser(); // Function dari auth.js
    console.log('Logged in user:', user);
    
    // Initialize home page features
    initializeGreeting();
    initializeRecentProjects();
    initializeTeamMembers();
});

/**
 * Initialize greeting with user data
 */
function initializeGreeting() {
    const greetingName = document.getElementById('greetingName');
    const greetingSubtext = document.getElementById('greetingSubtext');
    
    if (!greetingName || !greetingSubtext) return;
    
    // Get user from localStorage
    const user = getCurrentUser(); // Function dari auth.js
    
    if (user && user.email) {
        // Extract first name from email or use full email
        const firstName = user.full_name 
            ? user.full_name.split(' ')[0] 
            : user.email.split('@')[0];
        greetingName.textContent = firstName;
    } else {
        greetingName.textContent = 'Friend';
    }
    
    greetingSubtext.textContent = "Time to explore your data.";
}

/**
 * Initialize recent projects from API
 */
function initializeRecentProjects() {
    // Fetch user projects from API
    if (typeof apiGetUserProjects === 'function') {
        apiGetUserProjects()
            .then(projects => {
                // Transform API response to project format
                const recentProjects = projects.slice(0, 6).map((project, index) => ({
                    id: project.project_id || project.id || index + 1,
                    title: project.name || `Project ${index + 1}`,
                    description: project.description || 'Project data and analytics',
                    type: project.type || 'dashboard',
                    icon: getProjectIcon(project.type || 'dashboard'),
                    creator: project.owner_name || 'Team',
                    lastModified: formatTime(project.joined_at || new Date())
                }));
                
                renderRecentProjects(recentProjects);
            })
            .catch(error => {
                console.error('Error fetching projects:', error);
                // Fallback to sample data
                renderRecentProjectsSample();
            });
    } else {
        // Fallback to sample data
        renderRecentProjectsSample();
    }
}

/**
 * Render recent projects with sample data
 */
function renderRecentProjectsSample() {
    const sampleProjects = [
        {
            id: 1,
            title: 'Sales Dashboard Q4',
            description: 'Monthly sales performance and revenue analysis',
            type: 'dashboard',
            creator: 'You',
            lastModified: '2 hours ago',
            icon: 'bi-bar-chart-fill'
        },
        {
            id: 2,
            title: 'Customer Analytics',
            description: 'Customer behavior and engagement metrics',
            type: 'dashboard',
            creator: 'Jane Smith',
            lastModified: '1 day ago',
            icon: 'bi-people-fill'
        },
        {
            id: 3,
            title: 'Product Inventory',
            description: 'Stock levels and product performance tracking',
            type: 'database',
            creator: 'You',
            lastModified: '3 days ago',
            icon: 'bi-box-seam'
        },
        {
            id: 4,
            title: 'Marketing Metrics',
            description: 'Campaign performance and ROI analysis',
            type: 'dashboard',
            creator: 'Bob Johnson',
            lastModified: '5 days ago',
            icon: 'bi-graph-up'
        },
        {
            id: 5,
            title: 'Financial Report',
            description: 'Budget tracking and expense management',
            type: 'database',
            creator: 'You',
            lastModified: '1 week ago',
            icon: 'bi-cash-coin'
        }
    ];

    renderRecentProjects(sampleProjects);
}

/**
 * Render recent projects to grid
 */
function renderRecentProjects(projects) {
    const grid = document.getElementById('recentItemsGrid');
    
    if (!grid) {
        console.error('Recent items grid not found');
        return;
    }
    
    if (projects.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="bi bi-inbox"></i></div>
                <h3>No recent projects</h3>
                <p>Create a new dashboard or database to get started</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = projects.map(project => `
        <div class="item-card" onclick="handleProjectClick('${project.id}', '${project.type}')">
            <div class="item-header">
                <div class="item-icon"><i class="bi ${project.icon}"></i></div>
                <span class="item-badge">${project.type}</span>
            </div>
            <h3 class="item-title">${escapeHtml(project.title)}</h3>
            <p class="item-description">${escapeHtml(project.description)}</p>
            <div class="item-meta">
                <div class="item-time">
                    <i class="bi bi-clock"></i>
                    <span>${project.lastModified}</span>
                </div>
                <span class="item-creator">by ${escapeHtml(project.creator)}</span>
            </div>
        </div>
    `).join('');

    // Update meta info
    const sectionMeta = document.getElementById('projectsCount');
    if (sectionMeta) {
        sectionMeta.textContent = `${projects.length} project${projects.length !== 1 ? 's' : ''}`;
    }
}

/**
 * Initialize team members
 */
function initializeTeamMembers() {
    // Sample members data - In production, this would come from API
    const members = [
        { id: 1, name: 'John Doe', role: 'Admin', initials: 'JD' },
        { id: 2, name: 'Jane Smith', role: 'Member', initials: 'JS' },
        { id: 3, name: 'Bob Johnson', role: 'Member', initials: 'BJ' },
        { id: 4, name: 'Alice Brown', role: 'Member', initials: 'AB' },
        { id: 5, name: 'Charlie Wilson', role: 'Member', initials: 'CW' },
        { id: 6, name: 'Diana Prince', role: 'Member', initials: 'DP' },
        { id: 7, name: 'Edward Norton', role: 'Member', initials: 'EN' },
        { id: 8, name: 'Fiona Green', role: 'Member', initials: 'FG' },
    ];

    renderTeamMembers(members);
}

/**
 * Render team members list
 */
function renderTeamMembers(members) {
    const membersList = document.getElementById('membersList');
    const membersCount = document.getElementById('membersCount');
    
    if (!membersList) {
        console.error('Members list not found');
        return;
    }

    if (membersCount) {
        membersCount.textContent = members.length;
    }

    membersList.innerHTML = members.map(member => `
        <div class="member-item" onclick="handleMemberClick('${member.id}')">
            <div class="member-avatar">${member.initials}</div>
            <div class="member-info">
                <div class="member-name">${escapeHtml(member.name)}</div>
                <div class="member-role">${escapeHtml(member.role)}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Handle project card click
 */
function handleProjectClick(projectId, projectType) {
    console.log(`Clicked ${projectType} with ID: ${projectId}`);
    
    // In production: navigate to dashboard or database page
    if (projectType === 'dashboard') {
        // window.location.href = `dashboard.html?id=${projectId}`;
        alert(`Opening ${projectType} ${projectId}...\n\nThis will navigate to the dashboard view.`);
    } else if (projectType === 'database') {
        // window.location.href = `database.html?id=${projectId}`;
        alert(`Opening ${projectType} ${projectId}...\n\nThis will navigate to the database view.`);
    } else {
        alert(`Opening ${projectType} ${projectId}...`);
    }
}

/**
 * Handle member click
 */
function handleMemberClick(memberId) {
    console.log(`Clicked member with ID: ${memberId}`);
    alert(`Member profile feature coming soon!\nMember ID: ${memberId}`);
}

/**
 * Handle add team button click
 */
function handleAddTeamClick() {
    console.log('Add team clicked');
    alert('Create or join a team feature coming soon! 🚀\n\nYou will be able to:\n- Create new teams\n- Invite members\n- Join existing teams');
}

/**
 * Get appropriate icon for project type
 */
function getProjectIcon(type) {
    const icons = {
        'dashboard': 'bi-bar-chart-fill',
        'database': 'bi-database-fill',
        'dataset': 'bi-box-seam',
        'report': 'bi-graph-up',
        'analysis': 'bi-cash-coin'
    };
    return icons[type] || 'bi-folder-fill';
}

/**
 * Format time for display
 */
function formatTime(date) {
    if (!date) return 'Unknown';
    
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}