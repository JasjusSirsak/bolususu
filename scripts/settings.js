/**
 * Settings Page JavaScript
 * Handles form interactions and settings management with API integration
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings page initialized');
    
    // Check authentication first
    if (!isAuthenticated()) {
        window.location.href = '../html/auth.html';
        return;
    }
    
    // Initialize sidebar
    const sidebar = new SidebarManager();
    sidebar.loadSidebar();
    sidebar.setActivePage('settings');
    
    // Initialize user profile dan load settings
    loadUserSettingsFromAPI();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize toggle switches
    initializeToggleSwitches();
});

/**
 * Load user settings dari API
 */
function loadUserSettingsFromAPI() {
    // Load user profile
    apiGetUserProfile()
        .then(user => {
            // Update form fields dengan user data
            const nameInput = document.querySelector('input[value="Ariel Design"]');
            const emailInput = document.querySelector('input[value="ariel@insight.com"]');
            
            if (nameInput) nameInput.value = user.name;
            if (emailInput) emailInput.value = user.email;
            
            // Initialize user profile untuk modal
            initializeUserProfile();
        })
        .catch(error => {
            console.error('Error loading user profile:', error);
        });
    
    // Load user preferences
    apiGetUserPreferences()
        .then(preferences => {
            // Set toggle switches berdasarkan preferences
            const darkModeToggle = document.querySelector('input[type="checkbox"]');
            const emailNotifToggle = document.querySelectorAll('input[type="checkbox"]')[1];
            const desktopNotifToggle = document.querySelectorAll('input[type="checkbox"]')[2];
            
            if (darkModeToggle) darkModeToggle.checked = preferences.dark_mode || false;
            if (emailNotifToggle) emailNotifToggle.checked = preferences.email_notifications !== false;
            if (desktopNotifToggle) desktopNotifToggle.checked = preferences.desktop_notifications !== false;
            
            // Set language & timezone dropdowns
            const langSelect = document.querySelectorAll('.form-select')[0];
            const tzSelect = document.querySelectorAll('.form-select')[1];
            
            if (langSelect) langSelect.value = preferences.language || 'en';
            if (tzSelect) tzSelect.value = preferences.timezone || 'utc-7';
        })
        .catch(error => {
            console.warn('Error loading preferences (using defaults):', error);
        });
}

/**
 * Initialize form handlers
 */
function initializeFormHandlers() {
    const forms = document.querySelectorAll('.settings-form');
    
    forms.forEach((form, index) => {
        const saveBtn = form.querySelector('.btn-primary');
        if (saveBtn) {
            // First form adalah account settings
            if (index === 0) {
                saveBtn.addEventListener('click', handleSaveAccountSettings);
            }
        }
    });
    
    // Handle security buttons
    const securityButtons = document.querySelectorAll('.security-item .btn-secondary');
    securityButtons.forEach(btn => {
        btn.addEventListener('click', handleSecurityAction);
    });
    
    // Handle danger zone button
    const dangerBtn = document.querySelector('.danger-item .btn-danger');
    if (dangerBtn) {
        dangerBtn.addEventListener('click', handleDeleteAccount);
    }
}

/**
 * Initialize toggle switches dengan auto-save
 */
function initializeToggleSwitches() {
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    
    toggleSwitches.forEach((toggle, index) => {
        toggle.addEventListener('change', function() {
            const label = this.closest('.form-group-toggle').querySelector('.toggle-title').textContent;
            const status = this.checked ? 'enabled' : 'disabled';
            console.log(`${label} ${status}`);
            
            // Save preference ke API otomatis
            savePreferenceToAPI(index, label, this.checked);
        });
    });
}

/**
 * Save preference ke API otomatis saat toggle berubah
 */
function savePreferenceToAPI(index, label, value) {
    // Map toggle index ke preference name
    const preferenceMap = {
        0: 'dark_mode',
        1: 'email_notifications',
        2: 'desktop_notifications'
    };
    
    const preferenceName = preferenceMap[index];
    
    // Build preferences object
    const preferences = {};
    preferences[preferenceName] = value;
    
    // Save ke API
    apiUpdateUserPreferences(preferences)
        .then(result => {
            showNotification(`✓ ${label} ${value ? 'enabled' : 'disabled'}`, 'success');
        })
        .catch(error => {
            console.error('Error saving preference:', error);
            showNotification(`Error saving ${label}`, 'error');
        });
}

/**
 * Handle save account settings button click
 */
function handleSaveAccountSettings(e) {
    e.preventDefault();
    
    const inputs = document.querySelectorAll('.settings-form')[0].querySelectorAll('.form-input');
    
    // Gather form data
    const updates = {
        name: inputs[0].value,
        email: inputs[1].value,
        phone: inputs[2].value,
        department: inputs[3].value
    };
    
    // Validate
    if (!updates.name || !updates.email) {
        showNotification('Name and email are required', 'error');
        return;
    }
    
    console.log('Saving account settings:', updates);
    
    // Send to API
    apiUpdateUserProfile(updates)
        .then(result => {
            showNotification('✓ Account settings saved successfully!', 'success');
        })
        .catch(error => {
            console.error('Error saving settings:', error);
            showNotification('Error saving settings: ' + error.message, 'error');
        });
}

/**
 * Handle save settings button click (old function - keep for compatibility)
 */
function handleSaveSettings(e) {
    e.preventDefault();
    
    const form = e.target.closest('.settings-form');
    const inputs = form.querySelectorAll('.form-input, .form-select');
    
    const settingsData = {};
    inputs.forEach(input => {
        const label = input.previousElementSibling?.textContent || 'unknown';
        settingsData[label] = input.value;
    });
    
    console.log('Saving settings:', settingsData);
    
    // Show success message
    showNotification('✓ Settings saved successfully!', 'success');
    
    // Here you would send to API
    // fetch('/api/settings', { method: 'POST', body: JSON.stringify(settingsData) })
}

/**
 * Handle security action buttons
 */
function handleSecurityAction(e) {
    const action = e.target.closest('button').textContent.trim();
    
    switch(action) {
        case 'Change Password':
            showNotification('Password change form coming soon!', 'info');
            break;
        case 'Enable 2FA':
            showNotification('Two-factor authentication setup coming soon!', 'info');
            break;
        case 'View Sessions':
            showNotification('Active sessions view coming soon!', 'info');
            break;
        default:
            console.log('Unknown security action:', action);
    }
}

/**
 * Handle delete account
 */
function handleDeleteAccount(e) {
    e.preventDefault();
    
    const confirmed = confirm(
        'Are you absolutely sure? This action cannot be undone.\n\n' +
        'Type "DELETE" to confirm account deletion.'
    );
    
    if (confirmed) {
        const confirmText = prompt('Type "DELETE" to confirm:');
        if (confirmText === 'DELETE') {
            console.log('Account deletion initiated');
            showNotification('Account deletion in progress...', 'warning');
            
            // Here you would send delete request to API
            // fetch('/api/account/delete', { method: 'DELETE' })
            //     .then(() => window.location.href = '../html/auth.html')
        } else {
            showNotification('Account deletion cancelled', 'info');
        }
    }
}

/**
 * Save user preference to localStorage
 */
function saveUserPreference(key, value) {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    preferences[key] = value;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    
    // Apply saved preferences to form
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        const label = toggle.closest('.form-group-toggle').querySelector('.toggle-title').textContent;
        if (preferences.hasOwnProperty(label)) {
            toggle.checked = preferences[label];
        }
    });
}

/**
 * Initialize user profile section
 */
function initializeUserProfile() {
    // Sample user data - replace with actual user data from API/session
    const userData = {
        name: 'Ariel Design',
        email: 'ariel@insight.com',
        role: 'Admin',
        avatar: 'AD',
        joinDate: 'November 12, 2025'
    };

    // Update form fields with user data if needed
    // This is optional as the HTML already has default values
    
    // Initialize profile modal handlers
    const profileElement = document.querySelector('.settings-header');
    if (profileElement) {
        // Add click handler for potential future use
        console.log('Settings header initialized with user:', userData.name);
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Handle user profile click
 */
function handleProfileClick() {
    console.log('User profile clicked');
    openProfileModal();
}

/**
 * Open profile modal
 */
function openProfileModal() {
    const profileModal = document.getElementById('profileModal');
    const userData = {
        name: 'Ariel Design',
        email: 'ariel@insight.com',
        role: 'Admin',
        avatar: 'AD',
        joinDate: 'November 12, 2025'
    };

    // Populate profile modal with user data
    document.getElementById('profileAvatarLarge').textContent = userData.avatar;
    document.getElementById('profileName').textContent = userData.name;
    document.getElementById('profileEmail').textContent = userData.email;
    document.getElementById('profileRoleBadge').textContent = userData.role;
    document.getElementById('profileJoinDate').textContent = userData.joinDate;

    // Show modal
    profileModal.classList.add('show');
}

/**
 * Close profile modal
 */
function closeProfileModal() {
    const profileModal = document.getElementById('profileModal');
    profileModal.classList.remove('show');
}

// Close modal when clicking outside the modal content
document.addEventListener('click', function(event) {
    const profileModal = document.getElementById('profileModal');
    const profileContent = document.querySelector('.profile-modal-content');
    
    if (profileModal && profileContent && event.target === profileModal) {
        closeProfileModal();
    }
});

// Load saved preferences on page load
window.addEventListener('load', function() {
    loadUserPreferences();
});
