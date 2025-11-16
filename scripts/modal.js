// =================================================== 
// PRIMARY KEY SELECTION MODAL
// =================================================== 
let currentData = null;
let currentFileName = null;
const pkModal = document.getElementById('pkModal');
const pkColumnList = document.getElementById('pkColumnList');
const previewTable = document.getElementById('previewTable');
const pkConfirm = document.getElementById('pkConfirm');
const pkCancel = document.getElementById('pkCancel');

// Show modal with column selection
function showPrimaryKeyModal(data, filename) {
    currentData = data;
    currentFileName = filename;
    const headers = Object.keys(data[0]);
    
    // Create column checkboxes
    pkColumnList.innerHTML = headers.map((header, index) => `
        <div class="column-item" data-column="${header}">
            <input type="checkbox" id="col_${index}" value="${header}" 
                   ${index === 0 ? 'checked' : ''}>
            <label for="col_${index}">${header}</label>
        </div>
    `).join('');

    // Create preview table (first 5 rows)
    updatePreviewTable(headers, data.slice(0, 5));

    // Show modal
    pkModal.classList.add('show');

    // Add event listeners
    setupModalEventListeners();
}

// Update preview table with selected data
function updatePreviewTable(headers, previewData) {
    const tableHtml = `
        <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
            ${previewData.map(row => `
                <tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>
            `).join('')}
        </tbody>
    `;
    previewTable.innerHTML = tableHtml;
}

// Handle column selection changes
function setupModalEventListeners() {
    // Column item click
    pkColumnList.addEventListener('click', (e) => {
        const columnItem = e.target.closest('.column-item');
        if (!columnItem) return;

        const checkbox = columnItem.querySelector('input[type="checkbox"]');
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
        }
        
        columnItem.classList.toggle('selected', checkbox.checked);
    });

    // Cancel button
    pkCancel.addEventListener('click', () => {
        pkModal.classList.remove('show');
        resetToWelcome();
    });

    // Confirm button
    pkConfirm.addEventListener('click', async () => {
        const selectedColumns = Array.from(pkColumnList.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);

        if (selectedColumns.length === 0) {
            alert('⚠️ Harap pilih minimal satu kolom sebagai primary key!');
            return;
        }

        try {
            // Show loading
            pkModal.classList.remove('show');
            loadingSection.classList.add('show');

            // Upload with selected primary keys
            const uploadResult = await sendToBackend(currentData, currentFileName, selectedColumns);
            console.log('✅ Upload successful with primary keys:', selectedColumns);

            // Display the saved rows
            const rowsToDisplay = uploadResult.success && uploadResult.data.rows
                ? uploadResult.data.rows.map(r => r.row)
                : currentData;

            displayTable(rowsToDisplay);

            // Show table section
            loadingSection.classList.remove('show');
            tableSection.classList.add('show');

        } catch (error) {
            console.error('Error uploading CSV:', error);
            alert('❌ ' + (error.message || 'Gagal mengupload CSV'));
            resetToWelcome();
        }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pkModal.classList.contains('show')) {
            pkModal.classList.remove('show');
            resetToWelcome();
        }
    });

    // Close on backdrop click
    pkModal.addEventListener('click', (e) => {
        if (e.target === pkModal) {
            pkModal.classList.remove('show');
            resetToWelcome();
        }
    });
}