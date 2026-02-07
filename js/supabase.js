// Supabase Configuration for Website Rukun Tetangga RT03/RW16

// Supabase credentials
const SUPABASE_URL = 'https://uqsyeucgposyqujbebaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxc3lldWNncG9zeXF1amJlYmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MjMyOTksImV4cCI6MjA4NTk5OTI5OX0.iKn_jp15MQHBIYOfkCJJlH6MD3nVLJN3GNfXuhRt3jQ';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================================
// IBU MENYUSUI FUNCTIONS
// =============================================

async function getIbuMenyusui() {
    try {
        const { data, error } = await supabase
            .from('ibu_menyusui')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Add row numbers
        return data.map((item, index) => ({
            ...item,
            no: index + 1,
            tanggalLahir: item.tanggal_lahir,
            namaSuami: item.nama_suami
        }));
    } catch (error) {
        console.error('Error fetching ibu menyusui:', error);
        showToast('Gagal mengambil data ibu menyusui', 'error');
        return [];
    }
}

async function addIbuMenyusui(data) {
    try {
        const { error } = await supabase
            .from('ibu_menyusui')
            .insert({
                nik: data.nik,
                nama: data.nama,
                tanggal_lahir: data.tanggalLahir,
                alamat: data.alamat,
                nama_suami: data.namaSuami,
                keterangan: data.keterangan
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error adding ibu menyusui:', error);
        throw error;
    }
}

async function updateIbuMenyusui(id, data) {
    try {
        const { error } = await supabase
            .from('ibu_menyusui')
            .update({
                nik: data.nik,
                nama: data.nama,
                tanggal_lahir: data.tanggalLahir,
                alamat: data.alamat,
                nama_suami: data.namaSuami,
                keterangan: data.keterangan
            })
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating ibu menyusui:', error);
        throw error;
    }
}

async function deleteIbuMenyusui(id) {
    try {
        const { error } = await supabase
            .from('ibu_menyusui')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting ibu menyusui:', error);
        throw error;
    }
}

// =============================================
// IBU HAMIL FUNCTIONS
// =============================================

async function getIbuHamil() {
    try {
        const { data, error } = await supabase
            .from('ibu_hamil')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map((item, index) => ({
            ...item,
            no: index + 1,
            tanggalLahir: item.tanggal_lahir,
            namaSuami: item.nama_suami
        }));
    } catch (error) {
        console.error('Error fetching ibu hamil:', error);
        showToast('Gagal mengambil data ibu hamil', 'error');
        return [];
    }
}

async function addIbuHamil(data) {
    try {
        const { error } = await supabase
            .from('ibu_hamil')
            .insert({
                nik: data.nik,
                nama: data.nama,
                tanggal_lahir: data.tanggalLahir,
                alamat: data.alamat,
                nama_suami: data.namaSuami,
                keterangan: data.keterangan
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error adding ibu hamil:', error);
        throw error;
    }
}

async function updateIbuHamil(id, data) {
    try {
        const { error } = await supabase
            .from('ibu_hamil')
            .update({
                nik: data.nik,
                nama: data.nama,
                tanggal_lahir: data.tanggalLahir,
                alamat: data.alamat,
                nama_suami: data.namaSuami,
                keterangan: data.keterangan
            })
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating ibu hamil:', error);
        throw error;
    }
}

async function deleteIbuHamil(id) {
    try {
        const { error } = await supabase
            .from('ibu_hamil')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting ibu hamil:', error);
        throw error;
    }
}

// =============================================
// BALITA FUNCTIONS
// =============================================

async function getBalita() {
    try {
        const { data, error } = await supabase
            .from('balita')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map((item, index) => ({
            ...item,
            no: index + 1,
            tanggalLahir: item.tanggal_lahir
        }));
    } catch (error) {
        console.error('Error fetching balita:', error);
        showToast('Gagal mengambil data balita', 'error');
        return [];
    }
}

async function addBalita(data) {
    try {
        const { error } = await supabase
            .from('balita')
            .insert({
                nik: data.nik,
                nama: data.nama,
                tanggal_lahir: data.tanggalLahir,
                alamat: data.alamat,
                keterangan: data.keterangan
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error adding balita:', error);
        throw error;
    }
}

async function updateBalita(id, data) {
    try {
        const { error } = await supabase
            .from('balita')
            .update({
                nik: data.nik,
                nama: data.nama,
                tanggal_lahir: data.tanggalLahir,
                alamat: data.alamat,
                keterangan: data.keterangan
            })
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating balita:', error);
        throw error;
    }
}

async function deleteBalita(id) {
    try {
        const { error } = await supabase
            .from('balita')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting balita:', error);
        throw error;
    }
}

// =============================================
// STATISTICS FUNCTION
// =============================================

async function getStatistics() {
    try {
        const [ibuMenyusui, ibuHamil, balita] = await Promise.all([
            supabase.from('ibu_menyusui').select('id', { count: 'exact', head: true }),
            supabase.from('ibu_hamil').select('id', { count: 'exact', head: true }),
            supabase.from('balita').select('id', { count: 'exact', head: true })
        ]);

        const countIM = ibuMenyusui.count || 0;
        const countIH = ibuHamil.count || 0;
        const countB = balita.count || 0;

        return {
            ibuMenyusui: countIM,
            ibuHamil: countIH,
            balita: countB,
            total: countIM + countIH + countB
        };
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return {
            ibuMenyusui: 0,
            ibuHamil: 0,
            balita: 0,
            total: 0
        };
    }
}
