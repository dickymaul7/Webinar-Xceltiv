/**
 * ========================================================================
 * WEBINAR XCELTIV LEARNING - GOOGLE APPS SCRIPT BACKEND
 * ========================================================================
 * 
 * CARA MENGGUNAKAN:
 * 1. Buka Google Sheets baru di https://sheets.google.com
 * 2. Beri nama spreadsheet, contoh: "Data Pendaftar Webinar AI Marketing Xceltiv"
 * 3. Klik menu: Extensions (Ekstensi) > Apps Script
 * 4. Hapus semua kode default di Apps Script editor, lalu paste SELURUH kode di bawah ini.
 * 5. Klik icon Save (Simpan).
 * 6. Klik tombol "Deploy" (Terapkan) di pojok kanan atas > "New deployment" (Penerapan baru).
 * 7. Pilih tipe: "Web app" (Aplikasi Web).
 * 8. Konfigurasi:
 *    - Description: "Webinar Registration Webhook"
 *    - Execute as: "Me" (Email Google Anda)
 *    - Who has access: "Anyone" (Siapa saja / Anonim) -> PENTING agar form website bisa kirim data!
 * 9. Klik "Deploy", izinkan akses permissions Google Akun Anda.
 * 10. Copy URL Web App yang berakhiran `/exec`.
 * 11. Buka file `app.js` di landing page Anda, lalu ganti nilai `GOOGLE_SCRIPT_WEBAPP_URL` dengan URL tersebut.
 */

function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = [
    "Timestamp", 
    "Nama Lengkap", 
    "Email", 
    "No. WhatsApp", 
    "Bukti Share (File/Link)", 
    "Status Verifikasi"
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0052cc");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Pastikan header sudah ada jika sheet baru
    if (sheet.getLastRow() === 0) {
      setupSheet();
    }
    
    var data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }
    
    var timestamp = new Date();
    var formattedDate = Utilities.formatDate(timestamp, "GMT+7", "yyyy-MM-dd HH:mm:ss");
    
    var nama = data.nama || "-";
    var email = data.email || "-";
    var whatsapp = data.whatsapp || "-";
    var proof = data.proofUrl || data.proofName || "Terlampir";
    
    // Jika ada Base64 File yang diunggah, simpan file ke Google Drive (opsional)
    if (data.fileBase64 && data.fileName) {
      try {
        var folderName = "Bukti_Pendaftaran_Webinar_Xceltiv";
        var folders = DriveApp.getFoldersByName(folderName);
        var targetFolder;
        if (folders.hasNext()) {
          targetFolder = folders.next();
        } else {
          targetFolder = DriveApp.createFolder(folderName);
        }
        
        var contentType = data.fileType || "image/png";
        var decodedData = Utilities.base64Decode(data.fileBase64.split(",")[1] || data.fileBase64);
        var blob = Utilities.newBlob(decodedData, contentType, nama.replace(/\s+/g, '_') + "_" + data.fileName);
        var file = targetFolder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        proof = file.getUrl();
      } catch (uploadErr) {
        proof = "Gagal upload Drive: " + uploadErr.toString();
      }
    }
    
    // Tambahkan baris data
    sheet.appendRow([
      formattedDate,
      nama,
      email,
      whatsapp,
      proof,
      "Terdaftar (Belum Verifikasi)"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Data pendaftaran berhasil direkap ke Google Spreadsheet!",
      timestamp: formattedDate
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Xceltiv Webinar Google Apps Script Endpoint"
  })).setMimeType(ContentService.MimeType.JSON);
}
