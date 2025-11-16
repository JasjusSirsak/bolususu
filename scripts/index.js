// =====================================================
// CSV UPLOADER - DIRECT TO DATABASE
// =====================================================

const csvFileInput = document.getElementById('csvFileInput');
const welcomeSection = document.getElementById('welcomeSection');
const loadingSection = document.getElementById('loadingSection');
const tableSection = document.getElementById('tableSection');
const backBtn = document.getElementById('backBtn');
const helpToggle = document.getElementById('helpToggle');
const helpContent = document.getElementById('helpContent');
const rowCountBadge = document.getElementById('rowCountBadge');

// Config
const API_URL = 'http://localhost:3000';

// =====================================================
// INITIALIZE
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Insight CSV Uploader - Ready!');
    
    // Check auth
    checkAuth();
    
    // Init features
    initializeHelpModal();
    initializeFileUpload();
    initializeBackButton();
});

// =====================================================
// CHECK AUTHENTICATION
// =====================================================
function checkAuth() {
    const token = getAuthToken();
    
    if (!token) {
        console.warn('⚠️ No token found. Redirecting to login...');
        window.location.href = '../auth/auth.html';
        return false;
    }
    
    console.log('✅ Token found');
    return true;
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function getProjectId() {
    return localStorage.getItem('currentProjectId') || '1';
}

// =====================================================
// FILE UPLOAD
// =====================================================
function initializeFileUpload() {
    if (!csvFileInput) {
        console.error('❌ CSV input not found');
        return;
    }

    csvFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('⚠️ Harap upload file CSV!');
            csvFileInput.value = '';
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('⚠️ File terlalu besar! Max 10MB');
            csvFileInput.value = '';
            return;
        }

        console.log('📄 Processing:', file.name, '-', (file.size / 1024).toFixed(2), 'KB');
        showLoading('Parsing CSV...');

        // Parse CSV with PapaParse
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false,
            complete: (results) => {
                handleParsed(results.data, file.name);
            },
            error: (error) => {
                console.error('❌ Parse error:', error);
                alert('❌ Gagal parse CSV: ' + error.message);
                resetToWelcome();
            }
        });
    });
}

// =====================================================
// HANDLE PARSED DATA - SEND TO API
// =====================================================
async function handleParsed(data, filename) {
    if (!data || data.length === 0) {
        alert('❌ File CSV kosong!');
        resetToWelcome();
        return;
    }

    console.log('✅ Parsed:', data.length, 'rows');
    showLoading('Uploading to database...');

    try {
        // Get auth data
        const token = getAuthToken();
        const projectId = getProjectId();

        if (!token) {
            throw new Error('Not authenticated. Please login.');
        }

        console.log('📤 Uploading to project:', projectId);

        // Send to API
        const response = await fetch(`${API_URL}/api/projects/${projectId}/upload-csv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                filename: filename,
                data: data,
                primaryKeys: [] // Empty for now
            })
        });

        // Handle response
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Upload failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Upload success:', result);

        // Display result
        hideLoading();
        
        // Extract data from response
        let displayData = data;
        if (result.data && result.data.rows) {
            displayData = result.data.rows.map(r => r.row_data || r.row || r);
        }
        
        displayTable(displayData);
        alert('✅ CSV berhasil diupload ke database!');

    } catch (error) {
        console.error('❌ Upload failed:', error);
        hideLoading();
        
        // Show user-friendly error
        let errorMsg = 'Gagal upload CSV: ';
        if (error.message.includes('Failed to fetch')) {
            errorMsg += 'Server tidak dapat dihubungi. Pastikan backend running.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
            errorMsg += 'Sesi login expired. Silakan login ulang.';
            setTimeout(() => window.location.href = '../auth/auth.html', 2000);
        } else {
            errorMsg += error.message;
        }
        
        alert('❌ ' + errorMsg);
        
        // Fallback: display data locally
        console.log('📊 Displaying data locally as fallback...');
        displayTable(data);
    }
}

// =====================================================
// DISPLAY TABLE
// =====================================================
function displayTable(data) {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');

    if (!tableHead || !tableBody) {
        console.error('❌ Table elements not found');
        return;
    }

    // Handle different data formats
    let displayData = data;
    
    // If data has nested structure, flatten it
    if (data.length > 0) {
        if (data[0].row_data) {
            displayData = data.map(item => item.row_data);
        } else if (data[0].row) {
            displayData = data.map(item => item.row);
        }
    }

    if (displayData.length === 0) {
        tableHead.innerHTML = '<tr><th>No Data</th></tr>';
        tableBody.innerHTML = '<tr><td>File CSV kosong</td></tr>';
        if (rowCountBadge) rowCountBadge.textContent = '0 rows';
        return;
    }

    // Clear existing content
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // Update row count
    if (rowCountBadge) {
        rowCountBadge.textContent = `${displayData.length} rows`;
    }

    // Get column names
    const columns = Object.keys(displayData[0]);
    console.log('📊 Displaying table with columns:', columns.join(', '));

    // Create header row
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        th.title = col;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // Create body rows
    displayData.forEach(row => {
        const tr = document.createElement('tr');
        
        columns.forEach(col => {
            const td = document.createElement('td');
            const value = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
            td.textContent = value;
            
            // Add tooltip for long text
            if (value.length > 50) {
                td.title = value;
                td.classList.add('long-text');
            }
            
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });

    // Show table section
    tableSection.classList.add('show');
    
    console.log('✅ Table displayed successfully:', displayData.length, 'rows');
}

// =====================================================
// BACK BUTTON
// =====================================================
function initializeBackButton() {
    if (!backBtn) return;
    
    backBtn.addEventListener('click', () => {
        returnToWelcome();
    });
}

function returnToWelcome() {
    tableSection.classList.remove('show');
    setTimeout(() => {
        welcomeSection.classList.remove('hide');
        if (csvFileInput) csvFileInput.value = '';
    }, 300);
}

// =====================================================
// HELP MODAL
// =====================================================
function initializeHelpModal() {
    if (!helpToggle || !helpContent) return;

    helpToggle.addEventListener('click', (e) => {
        e.preventDefault();
        helpContent.classList.add('show');
    });

    helpContent.addEventListener('click', (e) => {
        if (e.target === helpContent) {
            helpContent.classList.remove('show');
        }
    });

    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            helpContent.classList.remove('show');
        });
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && helpContent.classList.contains('show')) {
            helpContent.classList.remove('show');
        }
    });
}

// =====================================================
// LOADING STATES
// =====================================================
function showLoading(message = 'Processing...') {
    if (loadingSection) {
        const loadingText = loadingSection.querySelector('.loading-text');
        if (loadingText) loadingText.textContent = message;
        
        loadingSection.classList.add('show');
        if (welcomeSection) welcomeSection.classList.add('hide');
    }
}

function hideLoading() {
    if (loadingSection) {
        loadingSection.classList.remove('show');
    }
}

function resetToWelcome() {
    hideLoading();
    if (tableSection) tableSection.classList.remove('show');
    if (welcomeSection) welcomeSection.classList.remove('hide');
    if (csvFileInput) csvFileInput.value = '';
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// =====================================================
// APP INFO
// =====================================================
console.log('%c🚀 Insight CSV Uploader', 'color: #cc6600; font-size: 18px; font-weight: bold');
console.log('%cDirect API Mode', 'color: #333; font-size: 12px');
console.log('%cAPI: ' + API_URL, 'color: #666; font-size: 11px');
console.log('%cReady! 📊', 'color: #cc6600; font-size: 14px');