/**
 * Webinar Xceltiv Landing Page - Interactive Scripts & Spreadsheet Webhook Handler
 */

// KONFIGURASI GOOGLE APPS SCRIPT WEB APP
// Ganti URL di bawah ini dengan Deployment URL Google Apps Script Anda (berakhiran /exec)
const GOOGLE_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwWTUuRoCe49QuGHc5wqmGqn9a7agxlk6BwbAQfvtlsS8JRpz7CfCGbQAS8_vh0_Ssy/exec";

// Link Grup WhatsApp Peserta (Auto redirect setelah sukses mendaftar)
const WHATSAPP_COMMUNITY_LINK = "https://chat.whatsapp.com/FTgfsGswteVF0sNZMc3SK4";

document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initModal();
  initFormHandler();
});

// 1. Countdown Timer ke 29 Oktober 2026 19:30 WIB
function initCountdown() {
  const targetDate = new Date("2026-10-29T19:30:00+07:00").getTime();

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      document.getElementById("days").innerText = "00";
      document.getElementById("hours").innerText = "00";
      document.getElementById("minutes").innerText = "00";
      document.getElementById("seconds").innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = String(days).padStart(2, '0');
    document.getElementById("hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
    document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// 2. Modal Controller
function initModal() {
  const modal = document.getElementById("registerModal");
  const openBtns = document.querySelectorAll(".js-open-modal");
  const closeBtn = document.getElementById("closeModalBtn");

  openBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

// 3. Form Submission & Google Sheets Sync
function initFormHandler() {
  const form = document.getElementById("registrationForm");
  const fileInput = document.getElementById("proofFileInput");
  const dropzone = document.getElementById("uploadDropzone");
  const filePreview = document.getElementById("filePreview");
  const submitBtn = document.getElementById("submitBtn");
  const formContent = document.getElementById("formContent");
  const successState = document.getElementById("successState");

  let base64File = "";
  let fileName = "";
  let fileType = "";

  // Dropzone file select
  dropzone.addEventListener("click", () => fileInput.click());
  
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    handleSelectedFile(file);
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--primary-blue)";
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "#cbd5e1";
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "#cbd5e1";
    if (e.dataTransfer.files.length > 0) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  });

  function handleSelectedFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB!");
      return;
    }
    fileName = file.name;
    fileType = file.type;
    filePreview.innerHTML = `📄 <strong>${fileName}</strong> (${(file.size / 1024).toFixed(1)} KB)`;

    const reader = new FileReader();
    reader.onload = function(evt) {
      base64File = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Submit Handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nama = document.getElementById("inputNama").value.trim();
    const email = document.getElementById("inputEmail").value.trim();
    const whatsapp = document.getElementById("inputWA").value.trim();
    const proofLink = document.getElementById("inputProofLink").value.trim();

    if (!nama || !email || !whatsapp) {
      alert("Mohon lengkapi Nama, Email, dan Nomor WhatsApp!");
      return;
    }

    if (!base64File && !proofLink) {
      alert("Mohon unggah screenshot atau masukkan link bukti share ke 3 grup/status WA!");
      return;
    }

    // Set Loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>⏳ Menyimpan data pendaftaran...</span>`;

    const payload = {
      nama: nama,
      email: email,
      whatsapp: whatsapp,
      proofUrl: proofLink || "(Screenshot Terlampir)",
      fileName: fileName,
      fileType: fileType,
      fileBase64: base64File,
      timestamp: new Date().toISOString()
    };

    try {
      // Simpan juga ke localStorage sebagai cadangan offline
      const localData = JSON.parse(localStorage.getItem("xceltiv_webinar_registrations") || "[]");
      localData.push({
        nama, email, whatsapp, proof: proofLink || fileName, date: new Date().toLocaleString()
      });
      localStorage.setItem("xceltiv_webinar_registrations", JSON.stringify(localData));

      // Kirim ke Google Apps Script Webhook
      if (GOOGLE_SCRIPT_WEBAPP_URL && !GOOGLE_SCRIPT_WEBAPP_URL.includes("SAMPLE_URL")) {
        await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
          method: "POST",
          mode: "no-cors", // Standar untuk Apps Script CORS
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }

      // Tampilkan layar sukses
      formContent.style.display = "none";
      successState.style.display = "block";
      document.getElementById("registeredName").innerText = nama;

    } catch (err) {
      console.error("Gagal mengirim data:", err);
      // Tetap alihkan ke sukses karena data tersimpan lokal
      formContent.style.display = "none";
      successState.style.display = "block";
      document.getElementById("registeredName").innerText = nama;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // Action button join WA group
  const joinWaBtn = document.getElementById("joinWaGroupBtn");
  if (joinWaBtn) {
    joinWaBtn.href = WHATSAPP_COMMUNITY_LINK;
  }
}
