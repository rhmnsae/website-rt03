// Main Application Logic for Website Rukun Tetangga RT03/RW16

// Current active tab
let currentTab = 'dashboard';
let editingId = null;
let editingType = null;

// Initialize app - see bottom of file for DOMContentLoaded handler

// =============================================
// NAVIGATION
// =============================================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);

            // Close mobile menu
            closeMobileMenu();
        });
    });
}

function switchTab(tabName) {
    currentTab = tabName;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName)?.classList.add('active');

    // Update header
    updateHeader(tabName);
}

function updateHeader(tab) {
    const headerTitle = document.querySelector('.header-title h1');
    const headerSubtitle = document.querySelector('.header-title p');

    const titles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Ringkasan data penerima program makanan bergizi' },
        'ibu-menyusui': { title: 'Data Ibu Menyusui', subtitle: 'Kelola data ibu menyusui penerima bantuan' },
        'ibu-hamil': { title: 'Data Ibu Hamil', subtitle: 'Kelola data ibu hamil penerima bantuan' },
        'balita': { title: 'Data Balita', subtitle: 'Kelola data balita penerima bantuan' }
    };

    if (titles[tab]) {
        headerTitle.textContent = titles[tab].title;
        headerSubtitle.textContent = titles[tab].subtitle;
    }
}

// =============================================
// MOBILE MENU
// =============================================

function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const menuOverlay = document.getElementById('menuOverlay');

    menuToggle?.addEventListener('click', toggleMobileMenu);
    menuOverlay?.addEventListener('click', closeMobileMenu);
}

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('menuOverlay');
    const menuToggle = document.getElementById('menuToggle');

    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
    menuToggle?.classList.toggle('active');

    // Prevent body scroll when menu is open
    if (sidebar.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('menuOverlay');
    const menuToggle = document.getElementById('menuToggle');

    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    menuToggle?.classList.remove('active');
    document.body.style.overflow = '';
}

// =============================================
// DASHBOARD
// =============================================

function updateDashboard() {
    const stats = getStatistics();

    document.getElementById('countIbuMenyusui').textContent = stats.ibuMenyusui;
    document.getElementById('countIbuHamil').textContent = stats.ibuHamil;
    document.getElementById('countBalita').textContent = stats.balita;
    document.getElementById('countTotal').textContent = stats.total;

    // Update nav badges
    document.querySelector('[data-tab="ibu-menyusui"] .nav-badge').textContent = stats.ibuMenyusui;
    document.querySelector('[data-tab="ibu-hamil"] .nav-badge').textContent = stats.ibuHamil;
    document.querySelector('[data-tab="balita"] .nav-badge').textContent = stats.balita;
}

// =============================================
// MODALS
// =============================================

function initializeModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                closeModal(modal.id);
            }
        });
    });

    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Form submissions
    document.getElementById('formIbuMenyusui')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('formIbuHamil')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('formBalita')?.addEventListener('submit', handleFormSubmit);
}

function openModal(modalId) {
    document.getElementById(modalId)?.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('show');
    document.body.style.overflow = '';

    // Reset form
    const modal = document.getElementById(modalId);
    const form = modal?.querySelector('form');
    if (form) {
        form.reset();
        editingId = null;
        editingType = null;
    }
}

// =============================================
// FORM HANDLING
// =============================================

function openAddModal(type) {
    editingId = null;
    editingType = type;

    const modalIds = {
        'ibu-menyusui': 'modalIbuMenyusui',
        'ibu-hamil': 'modalIbuHamil',
        'balita': 'modalBalita'
    };

    const titles = {
        'ibu-menyusui': 'Tambah Data Ibu Menyusui',
        'ibu-hamil': 'Tambah Data Ibu Hamil',
        'balita': 'Tambah Data Balita'
    };

    const modalId = modalIds[type];
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.querySelector('.modal-header h3').innerHTML = `<i class="fas fa-plus-circle"></i> ${titles[type]}`;
        openModal(modalId);
    }
}

function openEditModal(type, id) {
    editingId = id;
    editingType = type;

    let item;
    let modalId;
    let title;

    switch (type) {
        case 'ibu-menyusui':
            item = getIbuMenyusui().find(i => i.id === id);
            modalId = 'modalIbuMenyusui';
            title = 'Edit Data Ibu Menyusui';
            if (item) {
                document.getElementById('imNik').value = item.nik;
                document.getElementById('imNama').value = item.nama;
                document.getElementById('imTanggalLahir').value = formatDateForInput(item.tanggalLahir);
                document.getElementById('imAlamat').value = item.alamat;
                document.getElementById('imNamaSuami').value = item.namaSuami;
                document.getElementById('imKeterangan').value = item.keterangan;
            }
            break;
        case 'ibu-hamil':
            item = getIbuHamil().find(i => i.id === id);
            modalId = 'modalIbuHamil';
            title = 'Edit Data Ibu Hamil';
            if (item) {
                document.getElementById('ihNik').value = item.nik;
                document.getElementById('ihNama').value = item.nama;
                document.getElementById('ihTanggalLahir').value = formatDateForInput(item.tanggalLahir);
                document.getElementById('ihAlamat').value = item.alamat;
                document.getElementById('ihNamaSuami').value = item.namaSuami;
                document.getElementById('ihKeterangan').value = item.keterangan;
            }
            break;
        case 'balita':
            item = getBalita().find(i => i.id === id);
            modalId = 'modalBalita';
            title = 'Edit Data Balita';
            if (item) {
                document.getElementById('bNik').value = item.nik;
                document.getElementById('bNama').value = item.nama;
                document.getElementById('bTanggalLahir').value = formatDateForInput(item.tanggalLahir);
                document.getElementById('bAlamat').value = item.alamat;
                document.getElementById('bKeterangan').value = item.keterangan;
            }
            break;
    }

    if (modalId) {
        const modal = document.getElementById(modalId);
        modal.querySelector('.modal-header h3').innerHTML = `<i class="fas fa-edit"></i> ${title}`;
        openModal(modalId);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formId = form.id;

    let data, type;

    switch (formId) {
        case 'formIbuMenyusui':
            type = 'ibu-menyusui';
            data = {
                nik: document.getElementById('imNik').value.trim(),
                nama: document.getElementById('imNama').value.trim(),
                tanggalLahir: document.getElementById('imTanggalLahir').value,
                alamat: document.getElementById('imAlamat').value.trim(),
                namaSuami: document.getElementById('imNamaSuami').value.trim(),
                keterangan: document.getElementById('imKeterangan').value.trim()
            };
            break;
        case 'formIbuHamil':
            type = 'ibu-hamil';
            data = {
                nik: document.getElementById('ihNik').value.trim(),
                nama: document.getElementById('ihNama').value.trim(),
                tanggalLahir: document.getElementById('ihTanggalLahir').value,
                alamat: document.getElementById('ihAlamat').value.trim(),
                namaSuami: document.getElementById('ihNamaSuami').value.trim(),
                keterangan: document.getElementById('ihKeterangan').value.trim()
            };
            break;
        case 'formBalita':
            type = 'balita';
            data = {
                nik: document.getElementById('bNik').value.trim(),
                nama: document.getElementById('bNama').value.trim(),
                tanggalLahir: document.getElementById('bTanggalLahir').value,
                alamat: document.getElementById('bAlamat').value.trim(),
                keterangan: document.getElementById('bKeterangan').value.trim()
            };
            break;
    }

    // Validate NIK
    if (!validateNIK(data.nik)) {
        showToast('NIK harus 16 digit angka', 'error');
        return;
    }

    // Save data
    try {
        if (editingId) {
            // Update
            switch (type) {
                case 'ibu-menyusui':
                    updateIbuMenyusui(editingId, data);
                    break;
                case 'ibu-hamil':
                    updateIbuHamil(editingId, data);
                    break;
                case 'balita':
                    updateBalita(editingId, data);
                    break;
            }
            showToast('Data berhasil diperbarui', 'success');
        } else {
            // Add new
            switch (type) {
                case 'ibu-menyusui':
                    addIbuMenyusui(data);
                    break;
                case 'ibu-hamil':
                    addIbuHamil(data);
                    break;
                case 'balita':
                    addBalita(data);
                    break;
            }
            showToast('Data berhasil ditambahkan', 'success');
        }

        // Close modal and refresh
        closeModal(`modal${type === 'ibu-menyusui' ? 'IbuMenyusui' : type === 'ibu-hamil' ? 'IbuHamil' : 'Balita'}`);
        renderAllTables();
        updateDashboard();

    } catch (error) {
        showToast('Terjadi kesalahan saat menyimpan data', 'error');
        console.error(error);
    }
}

// =============================================
// DELETE HANDLING
// =============================================

async function deleteItem(type, id) {
    const confirmed = await confirmDialog('Apakah Anda yakin ingin menghapus data ini?');

    if (confirmed) {
        try {
            switch (type) {
                case 'ibu-menyusui':
                    deleteIbuMenyusui(id);
                    break;
                case 'ibu-hamil':
                    deleteIbuHamil(id);
                    break;
                case 'balita':
                    deleteBalita(id);
                    break;
            }

            showToast('Data berhasil dihapus', 'success');
            renderAllTables();
            updateDashboard();

        } catch (error) {
            showToast('Terjadi kesalahan saat menghapus data', 'error');
            console.error(error);
        }
    }
}

// =============================================
// SEARCH
// =============================================

function initializeSearch() {
    const searchInputs = document.querySelectorAll('.search-box input');

    searchInputs.forEach(input => {
        input.addEventListener('input', debounce((e) => {
            const type = input.dataset.type;
            const searchTerm = e.target.value;

            switch (type) {
                case 'ibu-menyusui':
                    renderTableIbuMenyusui(searchTerm);
                    break;
                case 'ibu-hamil':
                    renderTableIbuHamil(searchTerm);
                    break;
                case 'balita':
                    renderTableBalita(searchTerm);
                    break;
            }
        }, 300));
    });
}

// =============================================
// TABLE RENDERING
// =============================================

function renderAllTables() {
    renderTableIbuMenyusui();
    renderTableIbuHamil();
    renderTableBalita();
}

function renderTableIbuMenyusui(searchTerm = '') {
    const tbody = document.getElementById('tableIbuMenyusui');
    if (!tbody) return;

    const allData = getIbuMenyusui();
    const data = searchFilter(allData, searchTerm);

    if (data.length === 0) {
        const isSearching = searchTerm && searchTerm.trim() !== '';
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas ${isSearching ? 'fa-search' : 'fa-inbox'}"></i>
                    <p>${isSearching ? `Data tidak ditemukan untuk "${searchTerm}"` : 'Belum ada data ibu menyusui'}</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td data-label="No">${item.no}</td>
            <td data-label="NIK">${item.nik}</td>
            <td data-label="Nama">${item.nama}</td>
            <td data-label="Tanggal Lahir">${formatDate(item.tanggalLahir)}</td>
            <td data-label="Alamat">${truncateText(item.alamat, 25)}</td>
            <td data-label="Nama Suami">${item.namaSuami}</td>
            <td data-label="Keterangan">${truncateText(item.keterangan, 20)}</td>
            <td data-label="Aksi" class="actions">
                <button class="btn btn-secondary btn-sm" onclick="openEditModal('ibu-menyusui', '${item.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('ibu-menyusui', '${item.id}')" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderTableIbuHamil(searchTerm = '') {
    const tbody = document.getElementById('tableIbuHamil');
    if (!tbody) return;

    const allData = getIbuHamil();
    const data = searchFilter(allData, searchTerm);

    if (data.length === 0) {
        const isSearching = searchTerm && searchTerm.trim() !== '';
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas ${isSearching ? 'fa-search' : 'fa-inbox'}"></i>
                    <p>${isSearching ? `Data tidak ditemukan untuk "${searchTerm}"` : 'Belum ada data ibu hamil'}</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td data-label="No">${item.no}</td>
            <td data-label="NIK">${item.nik}</td>
            <td data-label="Nama">${item.nama}</td>
            <td data-label="Tanggal Lahir">${formatDate(item.tanggalLahir)}</td>
            <td data-label="Alamat">${truncateText(item.alamat, 25)}</td>
            <td data-label="Nama Suami">${item.namaSuami}</td>
            <td data-label="Keterangan">${truncateText(item.keterangan, 20)}</td>
            <td data-label="Aksi" class="actions">
                <button class="btn btn-secondary btn-sm" onclick="openEditModal('ibu-hamil', '${item.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('ibu-hamil', '${item.id}')" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderTableBalita(searchTerm = '') {
    const tbody = document.getElementById('tableBalita');
    if (!tbody) return;

    const allData = getBalita();
    const data = searchFilter(allData, searchTerm);

    if (data.length === 0) {
        const isSearching = searchTerm && searchTerm.trim() !== '';
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas ${isSearching ? 'fa-search' : 'fa-inbox'}"></i>
                    <p>${isSearching ? `Data tidak ditemukan untuk "${searchTerm}"` : 'Belum ada data balita'}</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td data-label="No">${item.no}</td>
            <td data-label="NIK">${item.nik}</td>
            <td data-label="Nama">${item.nama}</td>
            <td data-label="Tanggal Lahir">${formatDate(item.tanggalLahir)} (${calculateAge(item.tanggalLahir)})</td>
            <td data-label="Alamat">${truncateText(item.alamat, 25)}</td>
            <td data-label="Keterangan">${truncateText(item.keterangan, 20)}</td>
            <td data-label="Aksi" class="actions">
                <button class="btn btn-secondary btn-sm" onclick="openEditModal('balita', '${item.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('balita', '${item.id}')" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// =============================================
// EXPORT
// =============================================

// Export title information for the header in Excel files
const exportTitleInfo = {
    'ibu-menyusui': {
        title: 'DATA IBU MENYUSUI PENERIMA PROGRAM MAKANAN BERGIZI GRATIS',
        subtitle1: 'POSYANDU MELATI 16 KELURAHAN MANGGAHANG KECAMATAN BALEENDAH KABUPATEN BANDUNG',
        subtitle2: 'SATUAN PELAYANAN PEMENUHAN GIZI (SPPG) MANGGAHANG 05',
        subtitle3: 'RT 03 / RW 016 KAMPUNG SINDANGSARI'
    },
    'ibu-hamil': {
        title: 'DATA IBU HAMIL PENERIMA PROGRAM MAKANAN BERGIZI GRATIS',
        subtitle1: 'POSYANDU MELATI 16 KELURAHAN MANGGAHANG KECAMATAN BALEENDAH KABUPATEN BANDUNG',
        subtitle2: 'SATUAN PELAYANAN PEMENUHAN GIZI (SPPG) MANGGAHANG 05',
        subtitle3: 'RT 03 / RW 016 KAMPUNG SINDANGSARI'
    },
    'balita': {
        title: 'DATA BALITA PENERIMA PROGRAM MAKANAN BERGIZI GRATIS',
        subtitle1: 'POSYANDU MELATI 16 KELURAHAN MANGGAHANG KECAMATAN BALEENDAH KABUPATEN BANDUNG',
        subtitle2: 'SATUAN PELAYANAN PEMENUHAN GIZI (SPPG) MANGGAHANG 05',
        subtitle3: 'RT 03 / RW 016 KAMPUNG SINDANGSARI'
    }
};

function exportData(type) {
    let data, filename, headers;

    switch (type) {
        case 'ibu-menyusui':
            data = getIbuMenyusui();
            filename = 'Data_Ibu_Menyusui_RT03_RW16';
            headers = ['No', 'NIK', 'Nama Ibu Menyusui', 'Tanggal Lahir', 'Alamat', 'Nama Suami', 'Keterangan'];
            break;
        case 'ibu-hamil':
            data = getIbuHamil();
            filename = 'Data_Ibu_Hamil_RT03_RW16';
            headers = ['No', 'NIK', 'Nama Ibu Hamil', 'Tanggal Lahir', 'Alamat', 'Nama Suami', 'Keterangan'];
            break;
        case 'balita':
            data = getBalita();
            filename = 'Data_Balita_RT03_RW16';
            headers = ['No', 'NIK', 'Nama Balita', 'Tanggal Lahir', 'Alamat', 'Keterangan'];
            break;
        default:
            return;
    }

    // Format dates for export
    data = data.map(item => ({
        ...item,
        tanggalLahir: formatDate(item.tanggalLahir)
    }));

    // Export to XLSX with title info
    exportToXLSX(data, filename, headers, exportTitleInfo[type]);
    showToast('Data berhasil diekspor ke Excel (.xlsx)', 'success');
}

// =============================================
// SUBMENU TOGGLE
// =============================================

function toggleSubMenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    const parent = submenu.previousElementSibling;

    submenu.classList.toggle('show');
    parent.classList.toggle('expanded');
}

// Auto-expand submenu if a child is active
function initializeSubmenu() {
    const mbgSubmenu = document.getElementById('mbg-submenu');
    const mbgParent = document.getElementById('navMBG');

    // Check if any child tab is active on load
    const activeChild = mbgSubmenu?.querySelector('.nav-item.active');
    if (activeChild) {
        mbgSubmenu.classList.add('show');
        mbgParent?.classList.add('expanded');
    }
}

// Update the DOMContentLoaded to include submenu initialization
const originalDOMContentLoaded = document.addEventListener;
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeMobileMenu();
    initializeModals();
    initializeSearch();
    updateDashboard();
    renderAllTables();
    initializeSubmenu();

    // Auto-expand MBG submenu on page load
    const mbgSubmenu = document.getElementById('mbg-submenu');
    const mbgParent = document.getElementById('navMBG');
    if (mbgSubmenu && mbgParent) {
        mbgSubmenu.classList.add('show');
        mbgParent.classList.add('expanded');
    }
});

