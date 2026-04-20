# PLAN.md — PRD Inventra PNJ

Tanggal: 2026-04-20  
Status: Draft kerja yang siap dipakai sebagai acuan implementasi MVP

## 1. Ringkasan Produk

**Inventra PNJ** adalah aplikasi web inventory kelas untuk **Politeknik Negeri Jakarta** yang membantu pengelolaan barang inventaris kelas secara terpusat. Sistem ini dirancang untuk dua peran utama:

- **Mahasiswa**: melihat inventaris, mengajukan peminjaman, dan melaporkan kerusakan / kehilangan barang
- **Admin**: mengelola data inventaris, memproses approval peminjaman, memperbarui stok, serta menindaklanjuti laporan kerusakan

Aplikasi ini berfokus pada kebutuhan operasional nyata di lingkungan kampus: barang tercatat dengan rapi, status barang mudah dipantau, dan proses peminjaman tidak lagi dilakukan secara manual atau tercecer.

---

## 2. Problem Statement

Pengelolaan inventaris kelas biasanya menghadapi beberapa masalah:

1. **Data barang tidak terpusat**
   - informasi barang tersebar di catatan manual, file terpisah, atau hanya diketahui oleh admin tertentu
2. **Sulit mengetahui status barang secara real-time**
   - tidak jelas apakah barang tersedia, sedang dipinjam, rusak, atau habis
3. **Proses peminjaman tidak terdokumentasi dengan baik**
   - pengajuan dan persetujuan sering dilakukan melalui chat atau lisan tanpa jejak yang rapi
4. **Pelaporan kerusakan lambat atau tidak terdokumentasi**
   - mahasiswa kesulitan menyampaikan kondisi barang secara formal
5. **Sulit menyusun prioritas pengadaan dan perawatan**
   - admin tidak punya data aktivitas dan kondisi barang yang cukup rapi untuk pengambilan keputusan

---

## 3. Product Goals

### Goal utama
Membangun aplikasi web yang menjadi pusat pengelolaan inventaris kelas PNJ dengan fondasi CRUD yang kuat, ditambah workflow peminjaman dan pelaporan kerusakan.

### Goal spesifik
- menyediakan sistem **CRUD inventaris** yang jelas dan mudah dikelola
- menampilkan **status barang** secara transparan
- menyediakan alur **pengajuan peminjaman** oleh mahasiswa
- menyediakan alur **approval / rejection** oleh admin
- menyediakan alur **damage reporting** untuk barang rusak, hilang, atau tidak layak pakai
- membangun dasar data yang nantinya bisa berkembang ke dashboard, laporan, QR code, dan audit trail

---

## 4. Non-Goals (Untuk MVP)

Fitur berikut **tidak wajib** masuk versi awal:

- integrasi SSO kampus
- QR code scanning
- notifikasi email / WhatsApp otomatis
- analitik lanjutan dan forecasting
- multi kampus / multi institusi
- mobile app native
- integrasi procurement / pembelian barang

Fitur-fitur di atas bisa dimasukkan ke fase berikutnya setelah fondasi MVP stabil.

---

## 5. Persona Pengguna

### A. Mahasiswa
**Kebutuhan utama:**
- tahu barang apa yang tersedia
- bisa meminjam barang tanpa proses manual yang berantakan
- bisa melaporkan barang bermasalah

**Pain points:**
- tidak tahu ke mana harus mengajukan peminjaman
- tidak tahu apakah barang masih tersedia
- laporan kerusakan sering tidak tercatat resmi

### B. Admin
**Kebutuhan utama:**
- data inventaris rapi dan bisa diperbarui kapan saja
- proses approval mudah dilacak
- stok dan kondisi barang bisa dipantau
- ada riwayat aktivitas barang

**Pain points:**
- data barang tidak konsisten
- sulit melacak siapa yang meminjam barang
- laporan kerusakan tidak terdokumentasi baik

---

## 6. Scope MVP

### In Scope
- autentikasi dasar berbasis role: admin dan mahasiswa
- CRUD inventaris
- kategori inventaris campuran
- lokasi / kelas / ruangan
- status barang
- pengajuan peminjaman
- approval / rejection peminjaman
- damage reporting
- dashboard ringkas status inventaris
- riwayat aktivitas dasar

### Out of Scope
- QR code
- SSO kampus
- notifikasi real-time multi-channel
- dashboard analitik lanjutan
- audit lengkap tingkat enterprise

---

## 7. Fitur Inti yang Akan Dibangun

## 7.1 CRUD Inventaris
Fitur dasar untuk mengelola seluruh data barang.

### Admin dapat:
- menambahkan barang baru
- melihat daftar barang
- membuka detail barang
- mengedit nama, kategori, lokasi, jumlah, satuan, dan kondisi
- menghapus data barang yang tidak valid atau sudah tidak dipakai

### Data minimum barang:
- kode barang / ID
- nama barang
- kategori
- lokasi / ruang / kelas
- jumlah
- satuan
- kondisi barang
- status ketersediaan
- deskripsi singkat (opsional)

### Acceptance criteria:
- admin dapat melakukan create, read, update, delete data barang
- perubahan data tersimpan dan muncul di daftar inventaris
- item dapat difilter minimal berdasarkan kategori, lokasi, dan status

---

## 7.2 Kategori Inventaris Campuran
Aplikasi harus mendukung inventaris campuran dalam satu sistem.

### Jenis inventaris yang didukung:
- **Peralatan kelas / lab**: proyektor, speaker, kabel, adaptor, alat praktikum
- **Furniture / aset ruangan**: kursi, meja, lemari, papan tulis
- **Barang habis pakai**: spidol, tinta, kertas, baterai

### Acceptance criteria:
- sistem dapat membedakan kategori barang
- setiap item wajib punya kategori
- kategori tampil di daftar, detail, dan filter

---

## 7.3 Pengajuan Peminjaman Barang
Mahasiswa dapat mengajukan peminjaman barang yang tersedia.

### Alur mahasiswa:
1. membuka daftar inventaris
2. memilih barang yang tersedia
3. mengisi form pengajuan peminjaman
4. mengirim permintaan
5. melihat status pengajuan

### Data pengajuan:
- ID pengajuan
- barang yang dipinjam
- jumlah
- nama peminjam / identitas user
- tujuan peminjaman
- tanggal pinjam
- tanggal rencana kembali
- catatan tambahan
- status pengajuan

### Status pengajuan:
- menunggu
- disetujui
- ditolak
- selesai / dikembalikan

### Acceptance criteria:
- mahasiswa hanya bisa mengajukan barang yang tersedia
- admin bisa melihat daftar pengajuan
- status pengajuan berubah sesuai aksi admin
- riwayat pengajuan dapat dilihat kembali

---

## 7.4 Approval / Rejection oleh Admin
Admin harus bisa memproses pengajuan pinjam secara cepat dan terdokumentasi.

### Admin dapat:
- melihat daftar seluruh permintaan
- membuka detail pengajuan
- menyetujui permintaan
- menolak permintaan
- memberi catatan keputusan
- menandai barang sebagai selesai / dikembalikan

### Acceptance criteria:
- pengajuan yang disetujui mengurangi ketersediaan barang sesuai aturan stok
- pengajuan yang ditolak tetap tersimpan di riwayat
- keputusan admin tercatat dengan jelas

---

## 7.5 Pelaporan Kerusakan
Mahasiswa dapat melaporkan barang yang rusak, hilang, atau tidak layak pakai.

### Alur mahasiswa:
1. memilih barang dari inventaris
2. membuka form laporan kerusakan
3. mengisi deskripsi masalah
4. mengirim laporan

### Data laporan:
- ID laporan
- barang terkait
- pelapor
- jenis masalah
- deskripsi
- tanggal laporan
- status tindak lanjut

### Status laporan:
- baru
- ditinjau
- diproses
- selesai

### Acceptance criteria:
- laporan tersimpan dan bisa dilihat admin
- admin bisa memperbarui status tindak lanjut
- kondisi barang dapat disinkronkan dengan laporan bila diperlukan

---

## 7.6 Dashboard Ringkas
Dashboard dipakai terutama oleh admin untuk monitoring cepat.

### Informasi minimum dashboard:
- total barang
- total barang tersedia
- total barang sedang dipinjam
- total barang rusak
- total barang habis / tidak tersedia
- jumlah pengajuan menunggu approval
- jumlah laporan kerusakan aktif

### Acceptance criteria:
- dashboard menampilkan ringkasan data utama tanpa perlu membuka tiap modul
- angka dashboard konsisten dengan data inventaris dan workflow

---

## 8. Role & Permission Matrix

| Fitur | Mahasiswa | Admin |
|---|---|---|
| Lihat daftar inventaris | Ya | Ya |
| Lihat detail barang | Ya | Ya |
| Tambah barang | Tidak | Ya |
| Edit barang | Tidak | Ya |
| Hapus barang | Tidak | Ya |
| Ajukan peminjaman | Ya | Ya (opsional/manual) |
| Approve / reject peminjaman | Tidak | Ya |
| Lihat riwayat pengajuan sendiri | Ya | Ya |
| Buat laporan kerusakan | Ya | Ya |
| Update status laporan | Tidak | Ya |
| Lihat dashboard admin | Tidak | Ya |

---

## 9. Entitas Data Awal

### 9.1 User
- id
- nama
- email / identifier
- role (`admin` / `mahasiswa`)
- created_at

### 9.2 Category
- id
- nama_kategori
- deskripsi

### 9.3 Location
- id
- nama_ruang / kelas
- keterangan

### 9.4 Item
- id
- kode_barang
- nama_barang
- category_id
- location_id
- jumlah
- satuan
- kondisi
- status
- deskripsi
- created_at
- updated_at

### 9.5 BorrowRequest
- id
- item_id
- user_id
- jumlah
- tujuan
- tanggal_pinjam
- tanggal_kembali_rencana
- status
- catatan_user
- catatan_admin
- approved_by
- approved_at
- created_at

### 9.6 DamageReport
- id
- item_id
- user_id
- jenis_masalah
- deskripsi
- status
- tindak_lanjut
- created_at
- updated_at

---

## 10. Status dan Aturan Dasar

### Status item
- tersedia
- dipinjam
- rusak
- habis
- tidak tersedia

### Aturan dasar bisnis
- barang tidak bisa dipinjam bila status bukan `tersedia`
- jumlah barang yang diajukan tidak boleh melebihi stok yang tersedia
- pengajuan peminjaman selalu masuk ke status `menunggu`
- hanya admin yang bisa mengubah status approval
- laporan kerusakan tidak menghapus riwayat item
- item tetap harus bisa ditelusuri walaupun pernah rusak atau pernah dipinjam

---

## 11. Halaman / Modul Aplikasi

### Untuk semua user
- Login
- Daftar inventaris
- Detail barang

### Untuk mahasiswa
- Form pengajuan peminjaman
- Riwayat peminjaman saya
- Form laporan kerusakan
- Riwayat laporan saya

### Untuk admin
- Dashboard admin
- Manajemen inventaris
- Manajemen kategori
- Manajemen lokasi
- Approval peminjaman
- Manajemen laporan kerusakan

---

## 12. User Flow Ringkas

### Flow A — Melihat inventaris
1. user login
2. user membuka daftar inventaris
3. user filter berdasarkan kategori / lokasi / status
4. user membuka detail barang

### Flow B — Mengajukan peminjaman
1. mahasiswa memilih barang
2. mahasiswa mengisi form peminjaman
3. sistem menyimpan pengajuan dengan status `menunggu`
4. admin meninjau permintaan
5. admin menyetujui / menolak
6. mahasiswa melihat hasilnya di riwayat pengajuan

### Flow C — Melaporkan kerusakan
1. mahasiswa membuka detail barang
2. mahasiswa mengirim laporan kerusakan
3. admin meninjau laporan
4. admin memperbarui status dan kondisi barang

---

## 13. Success Metrics MVP

Metrik awal yang bisa dipakai setelah sistem berjalan:

- seluruh inventaris inti kelas sudah tercatat di sistem
- admin dapat memproses pengajuan pinjam tanpa chat manual
- laporan kerusakan tercatat dan memiliki status tindak lanjut
- waktu pencarian data barang lebih cepat dibanding proses manual
- tidak ada pengajuan pinjam tanpa riwayat status

---

## 14. Prioritas Implementasi

### Phase 1 — Fondasi
- autentikasi dasar
- role admin / mahasiswa
- CRUD item
- CRUD kategori
- CRUD lokasi

### Phase 2 — Workflow utama
- pengajuan peminjaman
- approval / rejection
- pelaporan kerusakan
- update kondisi dan status barang

### Phase 3 — Monitoring
- dashboard ringkas
- riwayat aktivitas
- filter dan pencarian

### Phase 4 — Pengembangan lanjut
- QR code
- laporan berkala
- SSO kampus
- audit trail lengkap

---

## 15. Risiko dan Perhatian

- kebutuhan riil tiap jurusan / kelas bisa berbeda, jadi kategori dan lokasi harus fleksibel
- aturan stok untuk barang habis pakai perlu diperlakukan berbeda dari aset tetap
- approval peminjaman harus sederhana agar tidak membebani admin
- perlu dipastikan status item dan status peminjaman tidak saling bertentangan
- screenshot dan struktur teknis repo saat ini masih belum selaras dengan arah produk baru

---

## 16. Rekomendasi Output Implementasi Berikutnya

Jika PLAN.md ini dipakai sebagai dasar kerja, maka langkah implementasi berikutnya sebaiknya:

1. memilih stack frontend + backend
2. merancang schema database awal
3. membuat wireframe halaman utama
4. scaffold aplikasi web
5. membangun modul inventaris terlebih dahulu sebelum workflow peminjaman

---

## 17. Ringkasan Singkat

**Inventra PNJ** adalah aplikasi web inventory kelas untuk PNJ dengan fokus MVP pada:
- **CRUD inventaris**
- **pengajuan peminjaman oleh mahasiswa**
- **approval / rejection oleh admin**
- **pelaporan kerusakan**
- **dashboard status inventaris**

Dokumen ini dimaksudkan sebagai acuan produk awal sebelum masuk ke perencanaan teknis yang lebih detail.
