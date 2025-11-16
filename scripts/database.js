// Elements
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    loadDatabaseContent();
});

function initializeSidebar() {
    const navItems = document.querySelectorAll('.nav-item');
    const burgerMenu = document.querySelector('.burger-menu');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');

    if (navItems.length === 0) {
        console.warn('No nav items found');
        return;
    }

    // Add hover effect for sidebar
    sidebar.addEventListener('mouseenter', () => {
        container.classList.add('sidebar-hovered');
    });

    sidebar.addEventListener('mouseleave', () => {
        container.classList.remove('sidebar-hovered');
    });

    // Navigation item clicks
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Update active class
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Burger menu toggle
    if (burgerMenu && sidebar) {
        burgerMenu.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

function loadDatabaseContent() {
    // Load database content here
    fetchDatabaseEntries();
}

async function fetchDatabaseEntries() {
    try {
        const response = await fetch('http://localhost:3000/api/list-csv');
        if (!response.ok) {
            throw new Error('Failed to fetch database entries');
        }
        const data = await response.json();
        displayDatabaseEntries(data);
    } catch (error) {
        console.error('Error fetching database entries:', error);
        displayError('Failed to load database entries. Please try again later.');
    }
}

function displayDatabaseEntries(entries) {
    const databaseContent = document.getElementById('databaseContent');
    if (!entries || entries.length === 0) {
        databaseContent.innerHTML = `
            <div class="no-data">
                <i class="bi bi-inbox"></i>
                <p>No CSV files found in database</p>
                <a href="index.html" class="upload-btn">
                    <i class="bi bi-upload"></i> Upload New CSV
                </a>
            </div>
        `;
        return;
    }

    const entriesHTML = entries.map(entry => `
        <div class="database-entry">
            <div class="entry-info">
                <i class="bi bi-file-earmark-text"></i>
                <div class="entry-details">
                    <h3>${entry.filename}</h3>
                    <p>Uploaded: ${new Date(entry.uploadDate).toLocaleDateString()}</p>
                    <p>${entry.rowCount} rows</p>
                </div>
            </div>
            <div class="entry-actions">
                <button class="view-btn" onclick="viewEntry('${entry.id}')">
                    <i class="bi bi-eye"></i> View
                </button>
                <button class="delete-btn" onclick="deleteEntry('${entry.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    databaseContent.innerHTML = `
        <div class="database-header">
            <h2>Database Entries</h2>
            <a href="index.html" class="upload-btn">
                <i class="bi bi-upload"></i> Upload New CSV
            </a>
        </div>
        <div class="database-entries">
            ${entriesHTML}
        </div>
    `;
}

function displayError(message) {
    const databaseContent = document.getElementById('databaseContent');
    databaseContent.innerHTML = `
        <div class="error-message">
            <i class="bi bi-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

async function viewEntry(id) {
    // Implement view functionality
    window.location.href = `view-entry.html?id=${id}`;
}

async function deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/delete-csv/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete entry');
        }

        // Refresh the list
        fetchDatabaseEntries();
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
    }
}