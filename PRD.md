# Product Requirements Document (PRD) - Memoire
**Interactive Wedding Memory Wall - SaaS Platform**

---

## 1. Ringkasan Eksekutif & Visi Produk

**Memoire** adalah platform SaaS *Interactive Live Wedding Memory Wall* yang dirancang untuk mengabadikan momen pernikahan secara real-time. Dengan konsep yang mirip dengan **SatuAlbum.id** (pemimpin pasar lokal di Indonesia), Memoire memungkinkan para tamu undangan untuk dengan mudah mengambil foto melalui perangkat seluler mereka, menerapkan bingkai/tema estetis, menulis ucapan selamat, dan langsung memproyeksikannya ke layar panggung (*Memory Wall*) di venue pernikahan secara instan.

Visi utama Memoire adalah mendominasi pasar ini dengan memberikan **User Experience (UX) yang jauh lebih mulus**, **interaksi real-time tanpa latensi**, serta **fitur kecerdasan buatan (AI) terintegrasi** yang unik (seperti moderasi gambar otomatis dan peningkatan teks ucapan digital bertenaga Google Gemini).

---

## 2. Perbandingan Komprehensif: Memoire vs. SatuAlbum.id

Berikut adalah analisis komparatif detail untuk memetakan kekuatan SatuAlbum.id dan bagaimana Memoire membedakan diri sebagai produk yang lebih unggul (*Market Disruptor*):

| Kategori Fitur | SatuAlbum.id (Kondisi Pasar Saat Ini) | Memoire (Format Target & Keunggulan) |
| :--- | :--- | :--- |
| **UX Pengumpulan Foto** | Menggunakan web-page biasa. Tamu memindai QR code beralih ke browser untuk memilih foto dari galeri atau menjepret kamera bawaan sistem OS. | **Mulus & Teroptimasi**: Halaman web adaptif Next.js 15 dengan integrasi kamera native berkecepatan tinggi, pilihan filter bingkai secara live-preview, dan UX sekelas Native App tanpa instalasi. |
| **Proyeksi Layar (Live Wall)** | Slide-show grid sederhana dengan transisi standar. Seringkali membutuhkan refresh manual jika koneksi internet di lokasi wedding tidak stabil. | **Smooth Animation, GPU-Accelerated**: Menggunakan transisi Framer Motion gantung yang sangat halus, animasi pop-up highlight berdurasi 6 detik dengan efek sinematis untuk foto yang baru masuk, serta auto-recovery koneksi. |
| **Custom Bingkai & Tema** | Memilih dari koleksi template statis yang telah ditentukan sebelumnya oleh penyedia layanan. | **AI & Interactive Frame Customizer**: Mendukung pilihan tema dinamis (Polaroid, Minimal, Rustic, Dark) dan memberikan kemampuan bagi admin / *wedding organizer* untuk mengunggah aset bingkai PNG transparan kustom. |
| **Sistem Moderasi** | Manual moderasi oleh admin melalui dashboard admin. Foto tidak akan muncul sebelum diklik "Setujui". | **Hybrid Auto-Moderation (AI + Manual)**: Menggunakan **Gemini Vision API** di backend untuk mendeteksi secara otomatis konten sensitif (NSFW), kecerahan buruk, foto blur, atau duplikasi, yang secara drastis mengurangi beban tugas crew Wedding Organizer di lapangan. |
| **Fitur AI Tambahan** | Belum memiliki integrasi AI untuk interaksi tamu undangan. | **Wedding Assist AI**: <br>1. *Wishes Polisher*: AI merapikan ucapan selamat yang buru-buru ditulis tamu menjadi ucapan manis/puitis.<br>2. *AI Morph Filter*: Mengubah foto tamu menjadi gaya lukisan cat air, karikatur, atau coretan pensil polaroid estetis. |
| **Model Bisnis SaaS**| Pembayaran per-event dengan durasi aktif bervariasi. | **SaaS Multi-tenant**: Skema subskripsi Wedding Organizer (B2B) atau paket mandiri per-event (B2C) dengan self-service dashboard instan untuk membuat URL event unik (contoh: `memoire.id/event/[eventId]`). |

---

## 3. Rekomendasi Strategis & Spesifikasi Detail (Fase Selanjutnya)

Berdasarkan analisis kompetitif di atas, berikut adalah 5 pilar rekomendasi utama untuk diimplementasikan ke dalam pengembangan aplikasi Memoire selanjutnya:

### 3.1. Moderasi Otomatis Bertenaga AI (Gemini Vision API)
*   **Masalah**: Di acara pernikahan nyata, foto konyol, tidak sopan (NSFW), atau foto buram yang terkirim oleh tamu dapat merusak suasana khidmat jika langsung diproyeksikan tanpa sengaja.
*   **Solusi**: Terapkan filter otomatis menggunakan Gemini 2.5 Flash pada endpoint `/api/photos` upload.
*   **Alur Kerja**:
    1. Tamu mengunggah foto.
    2. Backend mengirimkan base64 foto ke Gemini API meminta kategorisasi keamanan (`safe_for_wedding: boolean`, `blur_level: number`).
    3. Jika lolos filter aman, foto masuk ke status `approved` secara otomatis dan tayang dalam waktu kurang dari 2 detik.
    4. Jika mencurigakan, foto dimasukkan ke tab `pending_moderation` di Dashboard Admin untuk ditinjau manual oleh Wedding Organizer.

### 3.2. Wishes & Greetings Enhancer (Gemini Pro / Flash Text)
*   **Masalah**: Tamu sering kali bingung menulis ucapan selamat yang menyentuh, sehingga hanya menulis ucapan singkat seperti *"HBD"* atau *"Samawa ya"*.
*   **Solusi**: Tombol **"Bantu Saya Menulis dengan AI"** di halaman `/capture`.
*   **Alur Kerja**: Tamu memasukkan kata kunci singkat (contoh: *"bahagia terus, langgeng sampai tua"*) dan memilih nuansa ucapan (Formal, Kasual, Puitis, atau Jenaka). AI akan mengubahnya menjadi ucapan pernikahan 2-3 kalimat yang sangat indah sebelum disubmit.

### 3.3. Offline & Low-Bandwidth Resilience
*   **Masalah**: Sinyal internet di gedung pernikahan sering kali sangat buruk atau tidak stabil karena banyaknya jumlah manusia di ruangan tertutup.
*   **Solusi**:
    *   **Client Offline Cache**: Menggunakan `IndexedDB` atau localStorage pada kamera capture di perangkat tamu. Jika pengunggahan gagal karena jaringan terputus, foto dideferensi dan diunggah ulang secara otomatis begitu koneksi internet terdeteksi pulih.
    *   **Web-Socket / SSE Polling Optimisasi**: Jika menggunakan long-polling, kirimkan ukuran muatan data (*payload size*) sekecil mungkin (gunakan thumbnail resolusi 600px untuk proyeksi, bukan gambar mentah berukuran besar).

### 3.4. Dynamic Interactive Presentation (Main Projection Wall)
*   **Masalah**: Tampilan slideshow monoton membuat tamu bosan melihat ke arah layar.
*   **Solusi**:
    *   **Live Highlight Pop-Up**: Ketika ada foto baru yang disetujui, grid utama akan meredup secara halus (*dim*), dan foto baru tersebut akan muncul di tengah layar dalam bingkai Polaroid ukuran besar selama 6-8 detik, disertai dengan teks ucapan selamat tamu yang bergulir indah di bagian bawah sebelum menyelinap masuk ke dalam tata letak grid utama secara mulus.
    *   **Background Ambience Audio**: Efek suara kustom opsional saat highlight muncul untuk menarik perhatian tamu di lokasi.

### 3.5. Guest Download & Digital Guestbook QR
*   **Masalah**: Pengantin kesulitan mengumpulkan kenangan digital dari tamu-tamu mereka setelah acara selesai.
*   **Solusi**:
    *   Halaman dashboard khusus bagi pasangan pengantin untuk mengunduh seluruh album foto dalam satu file ZIP.
    *   Pembuatan buku tamu digital (*Digital Guestbook*) berisikan tanda kepengarangan ucapan yang dapat dicetak sebagai PDF estetis berukuran siap cetak album fisik.

---

## 4. Rencana Kerja Arsitektur Teknis

Untuk merealisasikan rekomendasi di atas, Memoire akan mengadopsi arsitektur full-stack modern berikut:

-   **Frontend & Serverless Backend**: Next.js 15 (App Router) dengan Tailwind CSS v4 & Framer Motion untuk presisi visual tinggi.
-   **Database & Real-time Sync**: Firebase Firestore (menggunakan implementasi SDK server-side untuk menyimpan metadata, url foto, nama tamu, ucapan, tema pilihan, dan koordinat layout).
-   **Pemeriksaan AI**: Rute API Server-Side dengan `@google/genai` terintegrasi dengan Gemini model terbaik untuk validasi gambar real-time.
-   **Keamanan & Cloud Storage**: Firebase Storage untuk penanganan berkas gambar beresolusi tinggi yang teroptimasi, dilengkapi pengamanan file token.

---

Dengan dokumen kebutuhan produk (PRD) ini serta perbandingan SatuAlbum.id yang matang, peta arah pengembangan Memoire siap digunakan oleh tim produk untuk beralih dari fase MVP saat ini menuju produk komersial berskala SaaS nasional yang siap meluncur di pasar pernikahan Indonesia!
