// /backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 5000;

// Konfigurasi Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// Middleware
app.use(cors());
app.use(express.json());

// Tes Rute Dasar
app.get("/", (req, res) => {
  res.json({ message: "Server Backend CafeGo Berjalan!" });
});

// Tes Koneksi Database (Mengambil Data Menu)
app.get("/api/menus", async (req, res) => {
  try {
    const { data, error } = await supabase.from("menus").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Menyalakan Server
app.listen(port, () => {
  console.log(`Backend CafeGo berjalan di http://localhost:${port}`);
});
