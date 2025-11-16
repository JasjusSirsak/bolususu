/**
 * LAYOUT JAVASCRIPT
 * Handle sidebar behavior and responsive layout
 */

class DashboardLayout {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.getElementById('mainContent');
        this.burgerMenu = document.getElementById('burgerMenu');
        this.isSidebarExpanded = false;
        
        this.init();
    }

    init() {
        // Sidebar hover behavior
        this.sidebar.addEventListener('mouseenter', () => {
            this.expandSidebar();
        });

        this.sidebar.addEventListener('mouseleave', () => {
            if (!this.isSidebarExpanded) {
                this.collapseSidebar();
            }
        });

        // Mobile menu toggle
        if (this.burgerMenu) {
            this.burgerMenu.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !this.sidebar.contains(e.target) && 
                e.target !== this.burgerMenu) {
                this.closeMobileSidebar();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        this.handleResize();
    }

    expandSidebar() {
        this.sidebar.classList.add('expanded');
        this.mainContent.classList.add('sidebar-expanded');
        this.isSidebarExpanded = true;
    }

    collapseSidebar() {
        this.sidebar.classList.remove('expanded');
        this.mainContent.classList.remove('sidebar-expanded');
        this.isSidebarExpanded = false;
    }

    toggleMobileSidebar() {
        this.sidebar.classList.toggle('mobile-active');
    }

    closeMobileSidebar() {
        this.sidebar.classList.remove('mobile-active');
    }

    handleResize() {
        if (window.innerWidth > 768) {
            this.closeMobileSidebar();
            // Reset to default state on desktop
            if (!this.isSidebarExpanded) {
                this.collapseSidebar();
            }
        } else {
            // On mobile, ensure sidebar is collapsed
            this.collapseSidebar();
        }
    }
}

// Initialize layout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardLayout();
});