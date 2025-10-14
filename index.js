// index.js
const express = require("express");
const { scrapeGiftData } = require("./scrapeGiftData");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cache data agar tidak terlalu sering memanggil API
const cache = new Map();

// Fungsi untuk update data streamer tertentu
async function updateGiftData(uuid_streamer) {
  try {
    const data = await scrapeGiftData(uuid_streamer);
    cache.set(uuid_streamer, {
      data,
      lastUpdate: new Date.toLocaleTimeString("id-ID"),
    });
    console.log(`[${new Date().toLocaleTimeString()}] Data untuk ${uuid_streamer} diperbarui`);
  } catch (error) {
    console.error(`Gagal update data untuk ${uuid_streamer}:`, error.message);
  }
}

// Endpoint utama
app.get("/", (req, res) => {
  res.json({
    status: "API berjalan 🚀",
    contoh_endpoint: "/gift=UUID_STREAMER",
  });
});

// Endpoint dengan format /gift=UUID
app.get("/gift=:uuid", async (req, res) => {
  const uuid_streamer = req.params.uuid;

  if (!uuid_streamer) {
    return res.status(400).json({ error: "UUID streamer diperlukan." });
  }

  // Cek apakah sudah ada di cache
  const cached = cache.get(uuid_streamer);
  if (cached && Date.now() - cached.lastUpdate.getTime() < 5000) {
    // Kalau data masih baru (<5 detik), kirim dari cache
    return res.json({
      lastUpdate: cached.lastUpdate,
      data: cached.data,
      cached: true,
    });
  }

  // Kalau belum ada atau sudah lama, ambil ulang
  try {
    const data = await scrapeGiftData(uuid_streamer);
    cache.set(uuid_streamer, {
      data,
      lastUpdate: new Date(),
    });
    res.json({
      lastUpdate: new Date(),
      data,
      cached: false,
    });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data gift", message: error.message });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
