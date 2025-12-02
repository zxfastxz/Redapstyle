// server.js
const express = require("express");
const cors = require("cors");
const { authenticator } = require("otplib");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// =============================
// 🌐 BACKEND TOTP (SEU CÓDIGO)
// =============================
const FIXED_SECRET = "JBSWY3DPEHPK3PXP";

app.post("/api/validate-totp", (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ valid: false, error: "Token ausente" });
  }
  const valid = authenticator.check(token, FIXED_SECRET);
  res.json({ valid });
});

// ========================================
// 🌐 SERVIR FRONTEND (React + Vite Build)
// ========================================
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ========================================
// 🔥 START SERVER (Render usa PORT ambiente)
// ========================================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
