        // Elements
        const csvFileInput = document.getElementById('csvFileInput');
        const welcomeSection = document.getElementById('welcomeSection');
        const loadingSection = document.getElementById('loadingSection');
        const tableSection = document.getElementById('tableSection');
        const backBtn = document.getElementById('backBtn');
        const helpToggle = document.getElementById('helpToggle');
        const helpContent = document.getElementById('helpContent');
        const closeModal = document.getElementById('closeModal'); 

// 1. Saat "Cara menggunakannya" diklik, TAMPILKAN modal
helpToggle.addEventListener('click', () => {
    helpContent.classList.add('show');
});

// 2. Saat tombol 'X' (closeModal) diklik, SEMBUNYIKAN modal
closeModal.addEventListener('click', () => {
    helpContent.classList.remove('show');
});

// 3. Saat backdrop (area luar modal) diklik, SEMBUNYIKAN modal
document.addEventListener('click', (e) => {
    // Jika yang diklik adalah 'helpContent' (backdrop gelap)
    if (e.target === helpContent) {
        helpContent.classList.remove('show');
    }
});

        // Handle CSV file upload
        csvFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Show loading
            loadingSection.classList.add('show');
            welcomeSection.classList.add('hide');

            // Parse CSV
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        // TODO: Send to backend API
                        await sendToBackend(results.data, file.name);
                        
                        // Display table
                        displayTable(results.data);
                        
                        // Hide loading, show table
                        setTimeout(() => {
                            loadingSection.classList.remove('show');
                            tableSection.classList.add('show');
                        }, 1000);
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Terjadi kesalahan saat memproses file CSV');
                        loadingSection.classList.remove('show');
                        welcomeSection.classList.remove('hide');
                    }
                },
                error: (error) => {
                    console.error('Parse error:', error);
                    alert('Gagal membaca file CSV');
                    loadingSection.classList.remove('show');
                    welcomeSection.classList.remove('hide');
                }
            });
        });

        // Send to backend (placeholder)
        async function sendToBackend(data, filename) {
            // TODO: Replace with your actual API endpoint
            const API_URL = 'http://localhost:3000/api/upload-csv';
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filename: filename,
                        data: data
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to upload CSV');
                }

                const result = await response.json();
                console.log('Upload success:', result);
                return result;
            } catch (error) {
                console.error('API Error:', error);
                // For development: continue anyway
                console.log('Continuing with local display...');
            }
        }

        // Display table
        function displayTable(data) {
            if (data.length === 0) return;

            const tableHead = document.getElementById('tableHead');
            const tableBody = document.getElementById('tableBody');

            // Clear existing content
            tableHead.innerHTML = '';
            tableBody.innerHTML = '';

            // Create header
            const headers = Object.keys(data[0]);
            const headerRow = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            tableHead.appendChild(headerRow);

            // Create body rows
            data.forEach(row => {
                const tr = document.createElement('tr');
                headers.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = row[header] || '';
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        }

        // Back button Indah suaranya meminta ku tuk kenbali
        backBtn.addEventListener('click', () => {
            tableSection.classList.remove('show');
            welcomeSection.classList.remove('hide');
            csvFileInput.value = ''; // Reset file input
        });

        // Sidebar navigation
// Sidebar navigation - FIXED VERSION
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        // Hanya prevent default untuk link yang tidak punya href valid
        const href = this.getAttribute('href');
        const dataPage = this.getAttribute('data-page');
        
        // Jika link adalah "#" atau tidak punya href, prevent default
        if (!href || href === '#' || href.startsWith('javascript')) {
            e.preventDefault();
        }
        
        // Update active class
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Handle page navigation
        const page = this.getAttribute('data-page');
        if (page === 'home') {
            tableSection.classList.remove('show');
            welcomeSection.classList.remove('hide');
        }
        
        // Jika link menuju halaman lain (seperti guide.html), biarkan browser navigate
        // Browser akan otomatis navigate ke href tanpa perlu kita handle
    });
});

        // Burger menu toggle
        document.querySelector('.burger-menu').addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('active');
        });
        
// Highlight sidebar berdasarkan halaman aktif
        document.addEventListener('DOMContentLoaded', function() {
        const currentPage = window.location.pathname.split('/').pop() || 'guide.html';
        
        document.querySelectorAll('.nav-item').forEach(item => {
            const itemHref = item.getAttribute('href');
            if (itemHref === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });