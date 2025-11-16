class Sidebar {
    constructor() {
        this.init();
    }

    init() {
        // Load sidebar content
        this.loadSidebar();
        
        // Initialize sidebar functionality
        this.initializeSidebar();
        
        // Set active menu based on current page
        this.setActiveMenu();
    }

    loadSidebar() {
        const sidebarHtml = `
            <nav class="sidebar">
                <!-- Sidebar Branding - Space Theme -->
                <div class="sidebar-brand">
                    <div class="brand-icon">
                        <i class="bi bi-stars"></i>
                    </div>
                    <span class="brand-text">Insight</span>
                </div>

                <div class="sidebar-divider"></div>

                <!-- Navigation Items -->
                <a href="../html/home.html" class="nav-item" data-page="home">
                    <i class="nav-icon bi bi-house-door-fill"></i>
                    <span class="nav-text">Home</span>
                </a>
                
                <a href="../html/dashboard.html" class="nav-item" data-page="dashboard">
                    <i class="nav-icon bi bi-bar-chart-line-fill"></i>
                    <span class="nav-text">Dashboard</span>
                </a>
                
                <a href="../html/database.html" class="nav-item" data-page="database">
                    <i class="nav-icon bi bi-database-fill"></i>
                    <span class="nav-text">Database</span>
                </a>
                
                <a href="../html/index.html" class="nav-item" data-page="build">
                    <i class="nav-icon bi bi-hammer"></i>
                    <span class="nav-text">Build</span>
                </a>
                
                <a href="../html/crew.html" class="nav-item" data-page="crew">
                    <i class="nav-icon bi bi-people-fill"></i>
                    <span class="nav-text">Crew</span>
                </a>
            </nav>
        `;

        // Insert sidebar at the start of body
        document.body.insertAdjacentHTML('afterbegin', sidebarHtml);
    }

    initializeSidebar() {
        const sidebar = document.querySelector('.sidebar');

        if (!sidebar) return;

        // Add hover effect for sidebar expansion
        sidebar.addEventListener('mouseenter', () => {
            document.body.classList.add('sidebar-expanded');
        });

        sidebar.addEventListener('mouseleave', () => {
            document.body.classList.remove('sidebar-expanded');
        });

        // Close sidebar when clicking nav item on mobile
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    setActiveMenu() {
        // Get current page from URL
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'home';

        // Remove all active classes
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Set active class based on current page
        const activeItem = document.querySelector(`.nav-item[data-page="${currentPage}"]`);
        
        if (activeItem) {
            activeItem.classList.add('active');
        } else {
            // Fallback to home if no match
            const homeItem = document.querySelector(`.nav-item[data-page="home"]`);
            if (homeItem) {
                homeItem.classList.add('active');
            }
        }
    }

    // Public method to manually set active menu
    setActive(pageName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const item = document.querySelector(`.nav-item[data-page="${pageName}"]`);
        if (item) {
            item.classList.add('active');
        }
    }

    // Public method to toggle sidebar (for mobile)
    toggle() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }
}

// Initialize sidebar when DOM is loaded anjir gua mau mati aja deh bangsat
document.addEventListener('DOMContentLoaded', () => {
    window.sidebar = new Sidebar();
});