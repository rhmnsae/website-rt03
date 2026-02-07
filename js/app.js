// Main Application Logic for Website Rukun Tetangga RT03/RW16
// Using Supabase Database

// =============================================
// AUTHENTICATION
// =============================================

// Login credentials (in production, use proper authentication)
const AUTH_USERNAME = 'admin';
const AUTH_PASSWORD = 'bandung123';
const AUTH_STORAGE_KEY = 'rt03_auth_session';

// Check if user is logged in
let isLoggedIn = false;

function checkAuth() {
    const session = localStorage.getItem(AUTH_STORAGE_KEY);
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            // Check if session is valid (not expired - 30 days)
            const now = Date.now();
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            if (sessionData.timestamp && (now - sessionData.timestamp) < thirtyDays) {
                isLoggedIn = true;
                return true;
            }
        } catch (e) {
            console.error('Invalid session data');
        }
    }
    return false;
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginButton = document.getElementById('loginButton');
    const loginCard = document.querySelector('.login-card');

    // Disable button and show loading with CSS class
    loginButton.disabled = true;
    loginButton.classList.add('loading');

    // Simulate network delay for better UX
    setTimeout(() => {
        if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
            // Login successful
            isLoggedIn = true;

            if (rememberMe) {
                // Save session to localStorage
                const sessionData = {
                    username: username,
                    timestamp: Date.now()
                };
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
            }

            // Hide login screen with transition
            const loginScreen = document.getElementById('loginScreen');
            loginScreen.style.opacity = '0';
            loginScreen.style.transform = 'scale(1.05)';
            loginScreen.style.transition = 'all 0.4s ease';

            setTimeout(() => {
                loginScreen.classList.add('hidden');
                loginScreen.style.opacity = '';
                loginScreen.style.transform = '';
                loginScreen.style.transition = '';
            }, 400);

            showToast('Selamat datang, Admin!', 'success');

            // Load data
            initializeApp();
        } else {
            // Login failed
            showToast('Username atau password salah!', 'error');
            loginButton.disabled = false;
            loginButton.classList.remove('loading');

            // Shake animation on login card using CSS class
            loginCard.classList.add('shake');
            setTimeout(() => {
                loginCard.classList.remove('shake');
            }, 500);
        }
    }, 800);
}

function showLogoutConfirm() {
    // Close mobile menu first if open
    closeMobileMenu();
    openModal('logoutModal');
}

function performLogout() {
    // Clear session
    localStorage.removeItem(AUTH_STORAGE_KEY);
    isLoggedIn = false;

    // Close modal
    closeModal('logoutModal');

    // Show login screen
    document.getElementById('loginScreen').classList.remove('hidden');

    // Clear form and reset button state
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';

    // Reset login button to normal state
    const loginButton = document.getElementById('loginButton');
    loginButton.disabled = false;
    loginButton.classList.remove('loading');

    showToast('Anda telah keluar dari sistem', 'info');
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const toggleIcon = document.getElementById('passwordToggleIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Current active tab
let currentTab = 'dashboard';
let editingId = null;
let editingType = null;

// Data cache for editing
let dataCache = {
    'ibu-menyusui': [],
    'ibu-hamil': [],
    'balita': []
};

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

async function updateDashboard() {
    const stats = await getStatistics();

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

async function openEditModal(type, id) {
    editingId = id;
    editingType = type;

    let item;
    let modalId;
    let title;

    // Find item from cache
    switch (type) {
        case 'ibu-menyusui':
            item = dataCache['ibu-menyusui'].find(i => i.id === id);
            modalId = 'modalIbuMenyusui';
            title = 'Edit Data Ibu Menyusui';
            if (item) {
                document.getElementById('imNik').value = item.nik;
                document.getElementById('imNama').value = item.nama;
                document.getElementById('imTanggalLahir').value = formatDateForInput(item.tanggalLahir);
                document.getElementById('imAlamat').value = item.alamat;
                document.getElementById('imNamaSuami').value = item.namaSuami;
                document.getElementById('imKeterangan').value = item.keterangan || '';
            }
            break;
        case 'ibu-hamil':
            item = dataCache['ibu-hamil'].find(i => i.id === id);
            modalId = 'modalIbuHamil';
            title = 'Edit Data Ibu Hamil';
            if (item) {
                document.getElementById('ihNik').value = item.nik;
                document.getElementById('ihNama').value = item.nama;
                document.getElementById('ihTanggalLahir').value = formatDateForInput(item.tanggalLahir);
                document.getElementById('ihAlamat').value = item.alamat;
                document.getElementById('ihNamaSuami').value = item.namaSuami;
                document.getElementById('ihKeterangan').value = item.keterangan || '';
            }
            break;
        case 'balita':
            item = dataCache['balita'].find(i => i.id === id);
            modalId = 'modalBalita';
            title = 'Edit Data Balita';
            if (item) {
                document.getElementById('bNik').value = item.nik;
                document.getElementById('bNama').value = item.nama;
                document.getElementById('bTanggalLahir').value = formatDateForInput(item.tanggalLahir);
                document.getElementById('bAlamat').value = item.alamat;
                document.getElementById('bKeterangan').value = item.keterangan || '';
            }
            break;
    }

    if (modalId) {
        const modal = document.getElementById(modalId);
        modal.querySelector('.modal-header h3').innerHTML = `<i class="fas fa-edit"></i> ${title}`;
        openModal(modalId);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formId = form.id;
    const submitButton = form.querySelector('button[type="submit"]');

    // Disable submit button to prevent double submission
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

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
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save"></i> Simpan';
        return;
    }

    // Save data
    try {
        if (editingId) {
            // Update
            switch (type) {
                case 'ibu-menyusui':
                    await updateIbuMenyusui(editingId, data);
                    break;
                case 'ibu-hamil':
                    await updateIbuHamil(editingId, data);
                    break;
                case 'balita':
                    await updateBalita(editingId, data);
                    break;
            }
            showToast('Data berhasil diperbarui', 'success');
        } else {
            // Add new
            switch (type) {
                case 'ibu-menyusui':
                    await addIbuMenyusui(data);
                    break;
                case 'ibu-hamil':
                    await addIbuHamil(data);
                    break;
                case 'balita':
                    await addBalita(data);
                    break;
            }
            showToast('Data berhasil ditambahkan', 'success');
        }

        // Close modal and refresh
        closeModal(`modal${type === 'ibu-menyusui' ? 'IbuMenyusui' : type === 'ibu-hamil' ? 'IbuHamil' : 'Balita'}`);
        await renderAllTables();
        await updateDashboard();

    } catch (error) {
        showToast('Terjadi kesalahan saat menyimpan data: ' + error.message, 'error');
        console.error(error);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save"></i> Simpan';
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
                    await deleteIbuMenyusui(id);
                    break;
                case 'ibu-hamil':
                    await deleteIbuHamil(id);
                    break;
                case 'balita':
                    await deleteBalita(id);
                    break;
            }

            showToast('Data berhasil dihapus', 'success');
            await renderAllTables();
            await updateDashboard();

        } catch (error) {
            showToast('Terjadi kesalahan saat menghapus data: ' + error.message, 'error');
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
        input.addEventListener('input', debounce(async (e) => {
            const type = input.dataset.type;
            const searchTerm = e.target.value;

            switch (type) {
                case 'ibu-menyusui':
                    await renderTableIbuMenyusui(searchTerm);
                    break;
                case 'ibu-hamil':
                    await renderTableIbuHamil(searchTerm);
                    break;
                case 'balita':
                    await renderTableBalita(searchTerm);
                    break;
            }
        }, 300));
    });
}

// =============================================
// TABLE RENDERING
// =============================================

async function renderAllTables() {
    await Promise.all([
        renderTableIbuMenyusui(),
        renderTableIbuHamil(),
        renderTableBalita()
    ]);
}

async function renderTableIbuMenyusui(searchTerm = '') {
    const tbody = document.getElementById('tableIbuMenyusui');
    if (!tbody) return;

    // Show loading state
    if (!searchTerm) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Memuat data...</p>
                </td>
            </tr>
        `;
    }

    try {
        const allData = await getIbuMenyusui();
        dataCache['ibu-menyusui'] = allData; // Cache for editing
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
                <td data-label="Keterangan">${truncateText(item.keterangan || '', 20)}</td>
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
    } catch (error) {
        console.error('Error rendering ibu menyusui table:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal memuat data. Periksa koneksi internet Anda.</p>
                </td>
            </tr>
        `;
    }
}

async function renderTableIbuHamil(searchTerm = '') {
    const tbody = document.getElementById('tableIbuHamil');
    if (!tbody) return;

    // Show loading state
    if (!searchTerm) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Memuat data...</p>
                </td>
            </tr>
        `;
    }

    try {
        const allData = await getIbuHamil();
        dataCache['ibu-hamil'] = allData; // Cache for editing
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
                <td data-label="Keterangan">${truncateText(item.keterangan || '', 20)}</td>
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
    } catch (error) {
        console.error('Error rendering ibu hamil table:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal memuat data. Periksa koneksi internet Anda.</p>
                </td>
            </tr>
        `;
    }
}

async function renderTableBalita(searchTerm = '') {
    const tbody = document.getElementById('tableBalita');
    if (!tbody) return;

    // Show loading state
    if (!searchTerm) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Memuat data...</p>
                </td>
            </tr>
        `;
    }

    try {
        const allData = await getBalita();
        dataCache['balita'] = allData; // Cache for editing
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
                <td data-label="Tanggal Lahir">${formatDate(item.tanggalLahir)}</td>
                <td data-label="Alamat">${truncateText(item.alamat, 25)}</td>
                <td data-label="Keterangan">${truncateText(item.keterangan || '', 20)}</td>
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
    } catch (error) {
        console.error('Error rendering balita table:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal memuat data. Periksa koneksi internet Anda.</p>
                </td>
            </tr>
        `;
    }
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

async function exportData(type, format = 'excel') {
    let data, filename, headers;

    showToast(`Mengambil data untuk ekspor ${format.toUpperCase()}...`, 'info');

    try {
        switch (type) {
            case 'ibu-menyusui':
                data = await getIbuMenyusui();
                filename = 'Data_Ibu_Menyusui_RT03_RW16';
                headers = ['No', 'NIK', 'Nama Ibu Menyusui', 'Tanggal Lahir', 'Alamat', 'Nama Suami', 'Keterangan'];
                break;
            case 'ibu-hamil':
                data = await getIbuHamil();
                filename = 'Data_Ibu_Hamil_RT03_RW16';
                headers = ['No', 'NIK', 'Nama Ibu Hamil', 'Tanggal Lahir', 'Alamat', 'Nama Suami', 'Keterangan'];
                break;
            case 'balita':
                data = await getBalita();
                filename = 'Data_Balita_RT03_RW16';
                headers = ['No', 'NIK', 'Nama Balita', 'Tanggal Lahir', 'Alamat', 'Keterangan'];
                break;
            default:
                return;
        }

        if (data.length === 0) {
            showToast('Tidak ada data untuk diekspor', 'warning');
            return;
        }

        // Format dates for export
        data = data.map(item => ({
            ...item,
            tanggalLahir: formatDate(item.tanggalLahir)
        }));

        if (format === 'pdf') {
            // Export to PDF
            exportToPDF(data, filename, headers, exportTitleInfo[type], type);
            showToast('Data berhasil diekspor ke PDF', 'success');
        } else {
            // Export to XLSX with title info
            exportToXLSX(data, filename, headers, exportTitleInfo[type]);
            showToast('Data berhasil diekspor ke Excel (.xlsx)', 'success');
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Gagal mengekspor data: ' + error.message, 'error');
    }
}

// Export to PDF using jsPDF
function exportToPDF(data, filename, headers, titleInfo, type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Colors
    const primaryColor = [27, 94, 32]; // Green
    const headerBgColor = [46, 125, 50];
    const textColor = [33, 33, 33];

    // Header Background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(titleInfo.title, pageWidth / 2, 12, { align: 'center' });

    // Subtitles
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(titleInfo.subtitle1, pageWidth / 2, 19, { align: 'center' });
    doc.text(titleInfo.subtitle2, pageWidth / 2, 24, { align: 'center' });
    doc.text(titleInfo.subtitle3, pageWidth / 2, 29, { align: 'center' });

    // Prepare table data
    let tableData = [];
    if (type === 'balita') {
        tableData = data.map(item => [
            item.no,
            item.nik,
            item.nama,
            item.tanggalLahir,
            item.alamat,
            item.keterangan || '-'
        ]);
    } else {
        tableData = data.map(item => [
            item.no,
            item.nik,
            item.nama,
            item.tanggalLahir,
            item.alamat,
            item.namaSuami,
            item.keterangan || '-'
        ]);
    }

    // Column widths based on type
    let columnStyles = {};
    if (type === 'balita') {
        columnStyles = {
            0: { cellWidth: 12 },  // No
            1: { cellWidth: 40 },  // NIK
            2: { cellWidth: 50 },  // Nama
            3: { cellWidth: 30 },  // Tanggal Lahir
            4: { cellWidth: 80 },  // Alamat
            5: { cellWidth: 'auto' }  // Keterangan
        };
    } else {
        columnStyles = {
            0: { cellWidth: 10 },  // No
            1: { cellWidth: 35 },  // NIK
            2: { cellWidth: 40 },  // Nama
            3: { cellWidth: 25 },  // Tanggal Lahir
            4: { cellWidth: 55 },  // Alamat
            5: { cellWidth: 35 },  // Nama Suami
            6: { cellWidth: 'auto' }  // Keterangan
        };
    }

    // Generate table
    doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 40,
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 8,
            cellPadding: 3,
            textColor: textColor,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: headerBgColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [245, 250, 245]
        },
        columnStyles: columnStyles,
        didDrawPage: function (data) {
            // Footer on each page
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            const date = new Date().toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            doc.text(`Dicetak pada: ${date}`, margin, pageHeight - 10);
            doc.text(`Halaman ${doc.internal.getNumberOfPages()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        }
    });

    // Summary at end
    const finalY = doc.lastAutoTable.finalY + 10;
    if (finalY < pageHeight - 30) {
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Data: ${data.length} orang`, margin, finalY);
    }

    // Save PDF
    doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
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

// =============================================
// INITIALIZATION
// =============================================

async function initializeApp() {
    // Auto-expand MBG submenu on page load
    const mbgSubmenu = document.getElementById('mbg-submenu');
    const mbgParent = document.getElementById('navMBG');
    if (mbgSubmenu && mbgParent) {
        mbgSubmenu.classList.add('show');
        mbgParent.classList.add('expanded');
    }

    // Load data from Supabase
    await updateDashboard();
    await renderAllTables();

    console.log('✅ Website terhubung ke Supabase database');
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI components first
    initializeNavigation();
    initializeMobileMenu();
    initializeModals();
    initializeSearch();
    initializeSubmenu();

    // Create login particles animation
    createLoginParticles();

    // Check if user is already logged in
    if (checkAuth()) {
        // Hide login screen and load app
        document.getElementById('loginScreen').classList.add('hidden');
        await initializeApp();
    } else {
        // Show login screen
        document.getElementById('loginScreen').classList.remove('hidden');
    }
});

// =============================================
// LOGIN PARTICLES ANIMATION
// =============================================

function createLoginParticles() {
    const particlesContainer = document.getElementById('loginParticles');
    if (!particlesContainer) return;

    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'login-particle';

        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';

        // Random size
        const size = 4 + Math.random() * 8;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        // Random animation delay
        particle.style.animationDelay = (Math.random() * 10) + 's';

        // Random animation duration
        particle.style.animationDuration = (10 + Math.random() * 15) + 's';

        particlesContainer.appendChild(particle);
    }
}
