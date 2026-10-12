# Panduan Setup Landing Page Webinar Xceltiv & Integrasi Google Sheets

Selamat! Berkas Landing Page pendaftaran webinar Anda telah berhasil dibuat.

Folder Proyek: `C:\Users\Hype\.gemini\antigravity\scratch\webinar-xceltiv-landingpage\`

---

## 📁 Struktur Berkas Proyek

```
webinar-xceltiv-landingpage/
├── index.html                  # Halaman Landing Page utama (5W+1H, Hero, Materi, Benefit, Modal Form)
├── styles.css                  # Desain CSS modern & responsif (tema warna resmi Xceltiv)
├── app.js                      # Interaktivitas (Countdown timer, Modal popup, Submit & Sync Google Sheets)
├── assets/
│   ├── logo_exact.png          # Logo Xceltiv asli dari poster (tanpa perubahan sama sekali)
│   └── poster.png              # Aset poster asli webinar
└── google-apps-script/
    └── Code.gs                 # Script Google Apps Script untuk merekap data ke Google Sheets otomatis
```

---

## 🚀 Cara Menghubungkan Form Website ke Google Spreadsheet

Untuk merekap seluruh data pendaftar (Nama, Email, WhatsApp, Bukti Share File/Drive) secara otomatis ke Google Sheets, ikuti langkah mudah berikut:

### 1. Buat Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.google.com).
2. Buat spreadsheet baru dan beri nama, misalnya: **"Rekap Pendaftar Webinar AI Marketing Xceltiv"**.

### 2. Pasang Google Apps Script
1. Di Google Sheets, klik menu **Extensions (Ekstensi)** > **Apps Script**.
2. Hapus seluruh isi default editor, lalu salin dan tempelkan kode yang ada pada berkas:
   `google-apps-script/Code.gs`
3. Klik icon **Save (Simpan)**.

### 3. Deploy sebagai Web App
1. Klik tombol **Deploy (Terapkan)** di pojok kanan atas > **New deployment (Penerapan baru)**.
2. Klik ikon gerigi (Select type) > pilih **Web app**.
3. Atur konfigurasi:
   - **Description**: `Webinar Registration Sync`
   - **Execute as**: `Me` (Email akun Google Anda)
   - **Who has access**: `Anyone` *(PENTING: Pilih "Anyone" / Siapa saja agar form pendaftar di web bisa mengirim data tanpa perlu login Google)*.
4. Klik **Deploy**.
5. Berikan izin otorisasi akses (*Review Permissions* > Pilih Akun > *Advanced* > *Go to ... (unsafe)* > *Allow*).
6. Salin **Web App URL** yang diberikan (berakhiran `/exec`).

### 4. Masukkan URL ke `app.js`
1. Buka berkas `app.js`.
2. Ganti nilai variabel `GOOGLE_SCRIPT_WEBAPP_URL`:
   ```javascript
   const GOOGLE_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
3. Anda juga dapat mengubah `WHATSAPP_COMMUNITY_LINK` dengan tautan grup WhatsApp webinar Anda yang sebenarnya.

---

## 🌐 Cara Menjalankan Landing Page
Cukup buka berkas `index.html` langsung di browser Anda (Google Chrome, Edge, Firefox, dll) atau jalankan menggunakan live server / hosting web (seperti Netlify, Vercel, GitHub Pages, cPanel).
