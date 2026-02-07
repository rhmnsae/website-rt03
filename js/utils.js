// Utility Functions for Rukun Tetangga Website

// Format date to Indonesian format (DD/MM/YYYY)
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Calculate age from birth date
function calculateAge(birthDate) {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    // For babies, show in months
    if (age < 1) {
        let months = (today.getFullYear() - birth.getFullYear()) * 12;
        months -= birth.getMonth();
        months += today.getMonth();
        if (today.getDate() < birth.getDate()) months--;
        return `${Math.max(0, months)} bulan`;
    }

    return `${age} tahun`;
}

// Validate NIK (16 digits)
function validateNIK(nik) {
    const nikPattern = /^\d{16}$/;
    return nikPattern.test(nik);
}

// Search filter function
function searchFilter(items, searchTerm) {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
        item.nama.toLowerCase().includes(term) ||
        item.nik.includes(term) ||
        (item.alamat && item.alamat.toLowerCase().includes(term)) ||
        (item.namaSuami && item.namaSuami.toLowerCase().includes(term))
    );
}

// Export to XLSX (Excel) with professional styling
function exportToXLSX(data, filename, headers, titleInfo) {
    if (data.length === 0) {
        showToast('Tidak ada data untuk diekspor', 'warning');
        return;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Style definitions
    const styles = {
        // Title style - bold, centered, no background, size 15
        title: {
            font: { bold: true, sz: 15 },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } }
            }
        },
        // Subtitle style - bold, centered, no background, size 15
        subtitle: {
            font: { bold: true, sz: 15 },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } }
            }
        },
        // Info style - italic, centered
        info: {
            font: { italic: true, sz: 10, color: { rgb: "333333" } },
            fill: { fgColor: { rgb: "E8F5E9" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "A5D6A7" } },
                bottom: { style: "thin", color: { rgb: "A5D6A7" } },
                left: { style: "thin", color: { rgb: "A5D6A7" } },
                right: { style: "thin", color: { rgb: "A5D6A7" } }
            }
        },
        // Header style - bold, centered, green background
        header: {
            font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "388E3C" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "medium", color: { rgb: "1B5E20" } },
                bottom: { style: "medium", color: { rgb: "1B5E20" } },
                left: { style: "thin", color: { rgb: "1B5E20" } },
                right: { style: "thin", color: { rgb: "1B5E20" } }
            }
        },
        // Data style - normal with borders
        data: {
            font: { sz: 10 },
            alignment: { vertical: "center", wrapText: true },
            border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } }
            }
        },
        // Alternating row style
        dataAlt: {
            font: { sz: 10 },
            fill: { fgColor: { rgb: "F1F8E9" } },
            alignment: { vertical: "center", wrapText: true },
            border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } }
            }
        },
        // Footer/total style
        footer: {
            font: { bold: true, sz: 11, color: { rgb: "1B5E20" } },
            fill: { fgColor: { rgb: "C8E6C9" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "medium", color: { rgb: "1B5E20" } },
                bottom: { style: "medium", color: { rgb: "1B5E20" } },
                left: { style: "thin", color: { rgb: "1B5E20" } },
                right: { style: "thin", color: { rgb: "1B5E20" } }
            }
        }
    };

    // Prepare data with headers
    const wsData = [];

    // Add title rows (header information)
    wsData.push([titleInfo.title]);
    wsData.push([titleInfo.subtitle1]);
    wsData.push([titleInfo.subtitle2]);
    wsData.push([]); // Empty row
    wsData.push([`Tanggal Export: ${formatDate(new Date().toISOString())}`]);
    wsData.push([]); // Empty row

    // Add column headers
    wsData.push(headers);

    // Add data rows
    data.forEach(item => {
        const row = headers.map(header => {
            const key = headerKeyMap[header] || header.toLowerCase().replace(/ /g, '');
            return item[key] || '';
        });
        wsData.push(row);
    });

    // Add footer
    wsData.push([]); // Empty row
    wsData.push([`Total Data: ${data.length} orang`]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = headers.map((header) => {
        if (header === 'No') return { wch: 6 };
        if (header === 'NIK') return { wch: 20 };
        if (header.includes('Nama')) return { wch: 28 };
        if (header === 'Tanggal Lahir') return { wch: 16 };
        if (header === 'Alamat') return { wch: 40 };
        if (header === 'Keterangan') return { wch: 32 };
        return { wch: 18 };
    });
    ws['!cols'] = colWidths;

    // Set row heights
    ws['!rows'] = [
        { hpt: 30 }, // Title row
        { hpt: 22 }, // Subtitle 1
        { hpt: 22 }, // Subtitle 2
        { hpt: 10 }, // Empty row
        { hpt: 20 }, // Export date
        { hpt: 10 }, // Empty row
        { hpt: 25 }, // Headers
    ];

    // Merge cells for title (A1 to last column)
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Title
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }, // Subtitle 1
        { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }, // Subtitle 2
        { s: { r: 4, c: 0 }, e: { r: 4, c: headers.length - 1 } }, // Export date
        { s: { r: wsData.length - 1, c: 0 }, e: { r: wsData.length - 1, c: headers.length - 1 } }, // Total
    ];

    // Apply styles to cells
    const range = XLSX.utils.decode_range(ws['!ref']);

    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };

            // Apply styles based on row
            if (R === 0) {
                // Title row
                ws[cellAddress].s = styles.title;
            } else if (R >= 1 && R <= 2) {
                // Subtitle rows
                ws[cellAddress].s = styles.subtitle;
            } else if (R === 4) {
                // Export date row
                ws[cellAddress].s = styles.info;
            } else if (R === 6) {
                // Column headers row
                ws[cellAddress].s = styles.header;
            } else if (R === wsData.length - 1) {
                // Footer/total row
                ws[cellAddress].s = styles.footer;
            } else if (R > 6 && R < wsData.length - 2) {
                // Data rows - alternating colors
                ws[cellAddress].s = (R % 2 === 0) ? styles.data : styles.dataAlt;
            }
        }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Generate and download
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Header to key mapping
const headerKeyMap = {
    'No': 'no',
    'NIK': 'nik',
    'Nama': 'nama',
    'Nama Ibu Menyusui': 'nama',
    'Nama Ibu Hamil': 'nama',
    'Nama Balita': 'nama',
    'Tanggal Lahir': 'tanggalLahir',
    'Alamat': 'alamat',
    'Nama Suami': 'namaSuami',
    'Keterangan': 'keterangan'
};

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toast.className = `toast show ${type}`;
    toastMessage.textContent = message;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Confirm dialog
function confirmDialog(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmYes = document.getElementById('confirmYes');
        const confirmNo = document.getElementById('confirmNo');

        confirmMessage.textContent = message;
        modal.classList.add('show');

        const handleYes = () => {
            modal.classList.remove('show');
            cleanup();
            resolve(true);
        };

        const handleNo = () => {
            modal.classList.remove('show');
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            confirmYes.removeEventListener('click', handleYes);
            confirmNo.removeEventListener('click', handleNo);
        };

        confirmYes.addEventListener('click', handleYes);
        confirmNo.addEventListener('click', handleNo);
    });
}

// Truncate text
function truncateText(text, maxLength = 30) {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
