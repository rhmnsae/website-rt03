// Storage Manager for Rukun Tetangga Website
// Handles localStorage operations for all data modules

const StorageKeys = {
    IBU_MENYUSUI: 'rt03_ibu_menyusui',
    IBU_HAMIL: 'rt03_ibu_hamil',
    BALITA: 'rt03_balita'
};

// Generate unique ID
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Generic storage operations
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Renumber items (update 'no' field)
function renumberItems(items) {
    return items.map((item, index) => ({
        ...item,
        no: index + 1
    }));
}

// =====================
// IBU MENYUSUI OPERATIONS
// =====================
function getIbuMenyusui() {
    return getData(StorageKeys.IBU_MENYUSUI);
}

function addIbuMenyusui(data) {
    const items = getIbuMenyusui();
    const newItem = {
        id: generateId(),
        no: items.length + 1,
        nik: data.nik,
        nama: data.nama,
        tanggalLahir: data.tanggalLahir,
        alamat: data.alamat,
        namaSuami: data.namaSuami,
        keterangan: data.keterangan || '',
        createdAt: new Date().toISOString()
    };
    items.push(newItem);
    saveData(StorageKeys.IBU_MENYUSUI, items);
    return newItem;
}

function updateIbuMenyusui(id, data) {
    let items = getIbuMenyusui();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items[index] = {
            ...items[index],
            nik: data.nik,
            nama: data.nama,
            tanggalLahir: data.tanggalLahir,
            alamat: data.alamat,
            namaSuami: data.namaSuami,
            keterangan: data.keterangan || '',
            updatedAt: new Date().toISOString()
        };
        saveData(StorageKeys.IBU_MENYUSUI, items);
        return items[index];
    }
    return null;
}

function deleteIbuMenyusui(id) {
    let items = getIbuMenyusui();
    items = items.filter(item => item.id !== id);
    items = renumberItems(items);
    saveData(StorageKeys.IBU_MENYUSUI, items);
}

// =====================
// IBU HAMIL OPERATIONS
// =====================
function getIbuHamil() {
    return getData(StorageKeys.IBU_HAMIL);
}

function addIbuHamil(data) {
    const items = getIbuHamil();
    const newItem = {
        id: generateId(),
        no: items.length + 1,
        nik: data.nik,
        nama: data.nama,
        tanggalLahir: data.tanggalLahir,
        alamat: data.alamat,
        namaSuami: data.namaSuami,
        keterangan: data.keterangan || '',
        createdAt: new Date().toISOString()
    };
    items.push(newItem);
    saveData(StorageKeys.IBU_HAMIL, items);
    return newItem;
}

function updateIbuHamil(id, data) {
    let items = getIbuHamil();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items[index] = {
            ...items[index],
            nik: data.nik,
            nama: data.nama,
            tanggalLahir: data.tanggalLahir,
            alamat: data.alamat,
            namaSuami: data.namaSuami,
            keterangan: data.keterangan || '',
            updatedAt: new Date().toISOString()
        };
        saveData(StorageKeys.IBU_HAMIL, items);
        return items[index];
    }
    return null;
}

function deleteIbuHamil(id) {
    let items = getIbuHamil();
    items = items.filter(item => item.id !== id);
    items = renumberItems(items);
    saveData(StorageKeys.IBU_HAMIL, items);
}

// =====================
// BALITA OPERATIONS
// =====================
function getBalita() {
    return getData(StorageKeys.BALITA);
}

function addBalita(data) {
    const items = getBalita();
    const newItem = {
        id: generateId(),
        no: items.length + 1,
        nik: data.nik,
        nama: data.nama,
        tanggalLahir: data.tanggalLahir,
        alamat: data.alamat,
        keterangan: data.keterangan || '',
        createdAt: new Date().toISOString()
    };
    items.push(newItem);
    saveData(StorageKeys.BALITA, items);
    return newItem;
}

function updateBalita(id, data) {
    let items = getBalita();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items[index] = {
            ...items[index],
            nik: data.nik,
            nama: data.nama,
            tanggalLahir: data.tanggalLahir,
            alamat: data.alamat,
            keterangan: data.keterangan || '',
            updatedAt: new Date().toISOString()
        };
        saveData(StorageKeys.BALITA, items);
        return items[index];
    }
    return null;
}

function deleteBalita(id) {
    let items = getBalita();
    items = items.filter(item => item.id !== id);
    items = renumberItems(items);
    saveData(StorageKeys.BALITA, items);
}

// =====================
// STATISTICS
// =====================
function getStatistics() {
    return {
        ibuMenyusui: getIbuMenyusui().length,
        ibuHamil: getIbuHamil().length,
        balita: getBalita().length,
        total: getIbuMenyusui().length + getIbuHamil().length + getBalita().length
    };
}
