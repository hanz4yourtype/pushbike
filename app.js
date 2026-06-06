/**
 * IMPLEMENTASI DATA MASTER BERDASARKAN CLASS DIAGRAM
 * Entitas Terkait: OrangTuaWali, Pendaftaran, Pendaftar, Sekretaris, Laporan
 */

const USERS = {
  ortu: { pass: 'ortu123', role: 'ortu', nama: 'Budi Santoso', noHp: '081234567890' },
  sekretaris: { pass: 'sek123', role: 'sekretaris', nama: 'Dewi Rahayu', noHp: '089876543210' }
};

let currentRole = 'ortu';
let currentUser = null;
let deleteTargetId = null;

// Mocking Database berdasarkan struktur properti Class Diagram
let pendaftar = [
  { id: 'PD-001', namaAnak: 'Arjuna Pratama', tglLahir: '2020-03-12', jk: 'Laki-laki', namaOrtu: 'Budi Santoso', noHp: '081234567890', alamat: 'Klaim Pekalongan Barat', status: 'Aktif', tglDaftar: '2026-01-10' },
  { id: 'PD-002', namaAnak: 'Siti Rahayu', tglLahir: '2021-07-22', jk: 'Perempuan', namaOrtu: 'Ahmad Fauzi', noHp: '082345678901', alamat: 'Kraton Kidul, Kota Pekalongan', status: 'Aktif', tglDaftar: '2026-01-14' },
  { id: 'PD-003', namaAnak: 'Dimas Kurniawan', tglLahir: '2020-01-05', jk: 'Laki-laki', namaOrtu: 'Rini Wulandari', noHp: '083456789012', alamat: 'Kedungwuni, Kab. Pekalongan', status: 'Aktif', tglDaftar: '2026-01-15' },
  { id: 'PD-004', namaAnak: 'Lestari Dewi', tglLahir: '2021-11-30', jk: 'Perempuan', namaOrtu: 'Eko Prasetyo', noHp: '084567890123', alamat: 'Noyontaan, Pekalongan Timur', status: 'Pending', tglDaftar: '2026-01-18' }
];

let lastFormData = null;
let idCounter = 5;

function setRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach((tab) => {
    const isOrtuTab = tab.textContent.includes('Orang Tua');
    tab.classList.toggle('active', (isOrtuTab && role === 'ortu') || (!isOrtuTab && role === 'sekretaris'));
  });
}

function doLogin() {
  const userInp = document.getElementById('inp-user').value.trim();
  const passInp = document.getElementById('inp-pass').value.trim();
  const banner = document.getElementById('login-banner');
  
  const account = USERS[userInp];
  if (!account || account.pass !== passInp || account.role !== currentRole) {
    banner.classList.add('show');
    return;
  }
  
  banner.classList.remove('show');
  currentUser = { ...account, username: userInp };
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  setupApp();
}

function setupApp() {
  const role = currentUser.role;
  document.getElementById('top-name').textContent = currentUser.nama;
  
  const initials = currentUser.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  document.getElementById('top-avatar').textContent = initials;
  document.getElementById('prof-avatar').textContent = initials;
  document.getElementById('prof-name').textContent = currentUser.nama;
  document.getElementById('prof-role').textContent = role === 'ortu' ? 'Orang Tua / Wali' : 'Sekretaris Club';
  
  document.getElementById('prof-inp-nama').value = currentUser.nama;
  document.getElementById('prof-inp-user').value = currentUser.username;
  document.getElementById('prof-inp-hp').value = currentUser.noHp || '';

  const menus = role === 'ortu' ? [
    { icon: 'ti-home', label: 'Beranda', page: 'beranda-ortu' },
    { icon: 'ti-clipboard-list', label: 'Daftar Online', page: 'daftar' },
    { icon: 'ti-printer', label: 'Cetak Formulir', page: 'cetak' },
    { icon: 'ti-user', label: 'Profil', page: 'profil' }
  ] : [
    { icon: 'ti-home', label: 'Beranda', page: 'beranda-sek' },
    { icon: 'ti-database', label: 'Kelola Data', page: 'kelola' },
    { icon: 'ti-chart-bar', label: 'Laporan', page: 'laporan' },
    { icon: 'ti-user', label: 'Profil', page: 'profil' }
  ];

  document.getElementById('sidebar-role').textContent = role === 'ortu' ? 'Orang Tua' : 'Sekretaris';
  const navMenu = document.getElementById('nav-menu');
  navMenu.innerHTML = menus.map(m => `
    <div class="nav-item" onclick="navigate('${m.page}','${m.label}')">
      <i class="ti ${m.icon}" aria-hidden="true"></i>${m.label}
    </div>
  `).join('');
  
  navigate(menus[0].page, menus[0].label);
}

function navigate(page, label) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById('page-' + page);
  if (targetPage) targetPage.classList.add('active');
  
  document.getElementById('page-title').textContent = label;
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.textContent.trim() === label);
  });

  // Pemanggilan Method Pengendali Aksi Berdasarkan Use Case
  if (page === 'kelola') renderTable();
  if (page === 'beranda-sek') renderSekBeranda();
  if (page === 'laporan') renderLaporan();
  if (page === 'cetak') renderCetak();
}

// OrangTua.drawio.png Flow Alur: Input -> Validasi Kelengkapan -> Simpan Database
function submitDaftar() {
  const nama = document.getElementById('f-namaAnak').value.trim();
  const tgl = document.getElementById('f-tglLahir').value;
  const jk = document.getElementById('f-jk').value;
  const ortu = document.getElementById('f-namaOrtu').value.trim();
  const hp = document.getElementById('f-noHp').value.trim();
  const alamat = document.getElementById('f-alamat').value.trim();

  // Validasi Kelengkapan Berkas
  if (!nama || !tgl || !jk || !ortu || !hp || !alamat) {
    alert('Sistem Menolak: Seluruh field input formulir pendaftaran wajib diisi lengkap!');
    return;
  }

  const generatedId = 'PD-00' + idCounter++;
  const entry = {
    id: generatedId,
    namaAnak: nama,
    tglLahir: tgl,
    jk: jk,
    namaOrtu: ortu,
    noHp: hp,
    alamat: alamat,
    status: 'Pending',
    tglDaftar: new Date().toISOString().split('T')[0]
  };

  pendaftar.push(entry);
  lastFormData = entry;
  
  document.getElementById('banner-daftar').classList.add('show');
  document.getElementById('stat-status-num').textContent = pendaftar.filter(p => p.namaOrtu === ortu).length;
  
  setTimeout(() => document.getElementById('banner-daftar').classList.remove('show'), 4000);
}

function resetDaftar() {
  ['f-namaAnak', 'f-tglLahir', 'f-namaOrtu', 'f-noHp', 'f-alamat'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function renderCetak() {
  const data = lastFormData || pendaftar[0];
  if (!data) return;
  document.getElementById('fp-id').textContent = data.id;
  document.getElementById('fp-nama').textContent = data.namaAnak;
  document.getElementById('fp-tgl').textContent = data.tglLahir;
  document.getElementById('fp-jk').textContent = data.jk;
  document.getElementById('fp-ortu').textContent = data.namaOrtu;
  document.getElementById('fp-hp').textContent = data.noHp;
  document.getElementById('fp-alamat').textContent = data.alamat;
  
  const statusEl = document.getElementById('fp-status');
  statusEl.textContent = 'Status: ' + data.status;
  statusEl.className = 'status-badge status-' + data.status.toLowerCase();
}

function renderSekBeranda() {
  document.getElementById('sek-total').textContent = pendaftar.length;
  document.getElementById('sek-pending').textContent = pendaftar.filter(p => p.status === 'Pending').length;
  document.getElementById('sek-aktif').textContent = pendaftar.filter(p => p.status === 'Aktif').length;

  const tbody = document.getElementById('sek-recent-table');
  const logs = [...pendaftar].reverse().slice(0, 4);
  tbody.innerHTML = logs.map(p => `
    <tr>
      <td>${p.namaAnak}</td>
      <td>${p.namaOrtu}</td>
      <td>${p.tglDaftar}</td>
      <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
    </tr>
  `).join('');
}

// KelolaDataPendaftaran.drawio.png: Ambil -> Cari/Filter -> Tampilkan -> Update / Delete
function renderTable() {
  const query = (document.getElementById('search-inp').value || '').toLowerCase();
  const filtered = pendaftar.filter(p => p.namaAnak.toLowerCase().includes(query) || p.id.toLowerCase().includes(query));
  
  document.getElementById('count-badge').textContent = filtered.length + ' Entitas ditemukan';
  const tbody = document.getElementById('data-table');
  
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--muted)">Tidak ada data pendaftaran ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><code>${p.id}</code></td>
      <td style="font-weight:600">${p.namaAnak}</td>
      <td>${p.jk}</td>
      <td>${p.namaOrtu}</td>
      <td>${p.noHp}</td>
      <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
      <td>
        <div class="action-btns">
          ${p.status === 'Pending' ? `<button class="btn-sm btn-approve" onclick="approveItem('${p.id}')" title="Verifikasi Langsung"><i class="ti ti-check"></i></button>` : ''}
          <button class="btn-sm btn-edit" onclick="openEdit('${p.id}')" title="Ubah Berkas"><i class="ti ti-edit"></i></button>
          <button class="btn-sm btn-del" onclick="openDel('${p.id}')" title="Hapus Permanen"><i class="ti ti-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function approveItem(id) {
  const item = pendaftar.find(x => x.id === id);
  if (item) {
    item.status = 'Aktif';
    renderTable();
  }
}

function openEdit(id) {
  const target = pendaftar.find(x => x.id === id);
  if (!target) return;
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-nama').value = target.namaAnak;
  document.getElementById('edit-ortu').value = target.namaOrtu;
  document.getElementById('edit-hp').value = target.noHp;
  document.getElementById('edit-status').value = target.status;
  document.getElementById('edit-modal').classList.add('show');
}

function saveEdit() {
  const id = document.getElementById('edit-id').value;
  const target = pendaftar.find(x => x.id === id);
  if (target) {
    target.namaAnak = document.getElementById('edit-nama').value.trim();
    target.namaOrtu = document.getElementById('edit-ortu').value.trim();
    target.noHp = document.getElementById('edit-hp').value.trim();
    target.status = document.getElementById('edit-status').value;
  }
  closeModal();
  renderTable();
}

function closeModal() { document.getElementById('edit-modal').classList.remove('show'); }

function openDel(id) {
  const target = pendaftar.find(x => x.id === id);
  if (!target) return;
  deleteTargetId = id;
  document.getElementById('del-nama').textContent = target.namaAnak;
  document.getElementById('del-modal').classList.add('show');
}

function closeDelModal() {
  document.getElementById('del-modal').classList.remove('show');
  deleteTargetId = null;
}

function confirmDelete() {
  if (deleteTargetId) {
    pendaftar = pendaftar.filter(p => p.id !== deleteTargetId);
  }
  closeDelModal();
  renderTable();
}

// Mengacu pada Class Diagram: Komponen Objek Laporan
function renderLaporan() {
  const totalPendaftar = pendaftar.length;
  const aktifCount = pendaftar.filter(p => p.status === 'Aktif').length;
  const pendingCount = pendaftar.filter(p => p.status === 'Pending').length;

  document.getElementById('report-summary').innerHTML = `
    <div class="stat-card"><div class="s-num">${totalPendaftar}</div><div class="s-label">Total Berkas Masuk</div></div>
    <div class="stat-card"><div class="s-num">${aktifCount}</div><div class="s-label">Valid (Aktif)</div></div>
    <div class="stat-card"><div class="s-num">${pendingCount}</div><div class="s-label">Pending Berkas</div></div>
  `;

  const tbody = document.getElementById('laporan-table');
  tbody.innerHTML = pendaftar.map(p => `
    <tr>
      <td><code>${p.id}</code></td>
      <td>${p.namaAnak}</td>
      <td>${p.tglLahir}</td>
      <td>${p.namaOrtu}</td>
      <td>${p.noHp}</td>
      <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
    </tr>
  `).join('');
}

function generatePDF() {
  alert('Sistem Laporan: Berkas laporan pendaftaran periode tahun 2026 berhasil digenerate dan diunduh ke sistem lokal!');
}

// =========================================================================
// PERBAIKAN DI SINI: Fungsi Pembaruan Profil Pengguna secara Real-Time
// =========================================================================
function saveProfil() {
  const namaBaru = document.getElementById('prof-inp-nama').value.trim();
  const hpBaru = document.getElementById('prof-inp-hp').value.trim();

  if (!namaBaru) {
    alert('Sistem Menolak: Nama profil tidak boleh dikosongkan!');
    return;
  }

  // 1. Perbarui state data user saat ini
  currentUser.nama = namaBaru;
  currentUser.noHp = hpBaru;
  
  if (USERS[currentUser.username]) {
    USERS[currentUser.username].nama = namaBaru;
    USERS[currentUser.username].noHp = hpBaru;
  }

  // 2. Buat inisial huruf baru (Kapital)
  const initials = namaBaru.split(' ').filter(n => n).map(n => n[0]).slice(0, 2).join('').toUpperCase();

  // 3. Update Nama (Metode ID)
  if (document.getElementById('top-name')) document.getElementById('top-name').textContent = namaBaru;
  if (document.getElementById('prof-name')) document.getElementById('prof-name').textContent = namaBaru;
  
  // 4. Update Avatar (Metode ID)
  if (document.getElementById('top-avatar')) document.getElementById('top-avatar').textContent = initials;
  if (document.getElementById('prof-avatar')) document.getElementById('prof-avatar').textContent = initials;

  // 5. CADANGAN AMAN (Metode Class Selector): Jika ID di atas tidak ditemukan, baris ini akan memaksa perubahan
  const elTopName = document.querySelector('.topbar .user-badge span');
  const elTopAvatar = document.querySelector('.topbar .avatar');
  const elProfName = document.querySelector('.profile-hero .profile-name');
  const elProfAvatar = document.querySelector('.profile-hero .profile-avatar');

  if (elTopName) elTopName.textContent = namaBaru;
  if (elTopAvatar) elTopAvatar.textContent = initials;
  if (elProfName) elProfName.textContent = namaBaru;
  if (elProfAvatar) elProfAvatar.textContent = initials;

  alert('Profil Pengguna Berhasil Diperbarui!');
}

function doLogout() {
  currentUser = null;
  lastFormData = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('inp-user').value = '';
  document.getElementById('inp-pass').value = '';
}