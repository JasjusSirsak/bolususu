/**
 * Header Component
 */

class Header {
    constructor() {
        this.init();
    }

    init() {
        this.loadHeader();
        this.initializeHeader();
    }

    loadHeader() {
        const headerHtml = `
            <header class="app-header">

                <div class="header-left"></div>

                <div class="header-center">
                    <div class="search-container">
                        <i class="bi bi-search search-icon"></i>
                        <input 
                            type="text" 
                            class="search-input" 
                            id="globalSearch"
                            placeholder="Search dashboards, databases, or anything..."
                            autocomplete="off"
                        />
                        <button class="search-clear" id="searchClear" type="button">
                            <i class="bi bi-x-circle-fill"></i>
                        </button>
                    </div>
                </div>

                <div class="header-right">
                    <div class="burger-menu" id="burgerMenu">
                        <i class="bi bi-list"></i>
                    </div>

                    <button class="settings-btn" id="settingsBtn">
                        <i class="bi bi-gear-fill"></i>
                    </button>

                    <div class="user-profile-btn" id="userProfileBtn">
                        <div class="user-avatar" id="headerUserAvatar">--</div>
                        <div class="user-info">
                            <div class="user-name" id="headerUserName">Loading...</div>
                            <div class="user-role" id="headerUserRole">---</div>
                        </div>
                    </div>
                </div>

            </header>

            <div class="profile-modal" id="profileModal">
                <div class="profile-modal-content">
                    <div class="profile-header">
                        <button class="profile-close-btn" id="profileCloseBtn">
                            <i class="bi bi-x-lg"></i>
                        </button>
                        <div class="profile-avatar-large" id="profileAvatarLarge">--</div>
                        <h2 class="profile-name" id="profileName">Loading...</h2>
                        <p class="profile-email" id="profileEmail">---</p>
                    </div>

                    <div class="profile-body">
                        <div class="profile-field">
                            <label class="profile-field-label">Role</label>
                            <div class="profile-field-value">
                                <i class="bi bi-shield-check"></i>
                                <span id="profileRoleBadge">---</span>
                            </div>
                        </div>

                        <div class="profile-field">
                            <label class="profile-field-label">Member Since</label>
                            <div class="profile-field-value">
                                <i class="bi bi-calendar3"></i>
                                <span id="profileJoinDate">---</span>
                            </div>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button class="profile-btn profile-btn-secondary" id="profileEditBtn">
                            <i class="bi bi-pencil-square"></i> Edit Profile
                        </button>
                        <button class="profile-btn profile-btn-secondary" id="profileLogoutBtn">
                            <i class="bi bi-box-arrow-right"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('afterbegin', headerHtml);
    }

    initializeHeader() {
        this.initializeSearch();
        this.initializeSettings();
        this.initializeUserProfile();
        this.initializeBurgerMenu();
    }

    /* ---------------- SEARCH ---------------- */

    initializeSearch() {
        const searchInput = document.getElementById('globalSearch');
        const searchClear = document.getElementById('searchClear');

        if (!searchInput) return;

        searchInput.addEventListener('input', () => {
            searchClear.style.display = searchInput.value.trim()
                ? 'block'
                : 'none';
        });

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.style.display = 'none';
                searchInput.focus();
            });
        }

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch(searchInput.value.trim());
        });
    }

    performSearch(query) {
        if (!query) return;
        alert(`Search soon: ${query}`);
    }

    /* ---------------- SETTINGS ---------------- */

    initializeSettings() {
        const settingsBtn = document.getElementById('settingsBtn');
        if (!settingsBtn) return;

        settingsBtn.addEventListener('click', () => {
            window.location.href = '../html/settings.html';
        });
    }

    /* ---------------- USER PROFILE ---------------- */

    initializeUserProfile() {
        this.updateUserProfile();

        const userProfileBtn = document.getElementById('userProfileBtn');
        const profileModal = document.getElementById('profileModal');
        const profileCloseBtn = document.getElementById('profileCloseBtn');
        const profileEditBtn = document.getElementById('profileEditBtn');
        const profileLogoutBtn = document.getElementById('profileLogoutBtn');

        if (userProfileBtn) {
            userProfileBtn.addEventListener('click', () => this.openProfileModal());
        }
        if (profileCloseBtn) {
            profileCloseBtn.addEventListener('click', () => this.closeProfileModal());
        }
        if (profileModal) {
            profileModal.addEventListener('click', (e) => {
                if (e.target === profileModal) this.closeProfileModal();
            });
        }
        if (profileEditBtn) {
            profileEditBtn.addEventListener('click', () => {
                window.location.href = '../html/settings.html';
            });
        }
        if (profileLogoutBtn) {
            profileLogoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    /** Fetch langsung ke API */
    async updateUserProfile() {
        try {
            const user = await apiGetUserProfile(); // FROM DATABASE
            console.log("API User:", user);

            this.setUserData(user);
        } catch (err) {
            console.error("Error fetch user:", err);
        }
    }

    /* ---------------- SET DATA ---------------- */

    setUserData(user) {
        const name = user.full_name || user.name || 'Unknown User';
        const avatar = this.generateInitials(name);
        const email = user.email || '-';
        const role = user.role || 'Member';
        const joinDate = this.formatDate(user.created_at || user.joinDate);

        // HEADER SET
        document.getElementById('headerUserAvatar').textContent = avatar;
        document.getElementById('headerUserName').textContent = name;
        document.getElementById('headerUserRole').textContent = role;

        // MODAL SET
        document.getElementById('profileAvatarLarge').textContent = avatar;
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileEmail').textContent = email;
        document.getElementById('profileRoleBadge').textContent = role;
        document.getElementById('profileJoinDate').textContent = joinDate;
    }

    /* ---------------- OTHER UTILS ---------------- */

    openProfileModal() {
        document.getElementById('profileModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeProfileModal() {
        document.getElementById('profileModal').classList.remove('show');
        document.body.style.overflow = '';
    }

    handleLogout() {
        if (typeof logout === 'function') logout();
        else {
            localStorage.clear();
            window.location.href = '../auth/auth.html';
        }
    }

    initializeBurgerMenu() {
        const burgerMenu = document.getElementById('burgerMenu');
        const sidebar = document.querySelector('.sidebar');

        if (burgerMenu && sidebar) {
            burgerMenu.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
    }

    generateInitials(name) {
        return name
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Header();
});
