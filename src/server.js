'use strict';

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { extractEmails } = require("./ingestion/fileHandler");
const { cleanEmails } = require("./processing/validator");
const { sendEmail } = require("./services/emailService");
const { logEvent } = require("./logging/logger");

const app = express();
const upload = multer({ dest: "src/uploads/" });

// 🔥 BODY PARSER
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔐 SESSION
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false
}));

// 📁 STATIC
app.use("/public", express.static(path.join(__dirname, "public")));

// ================= LOGIN =================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

app.post("/login", (req, res) => {
  if (
    req.body.username === process.env.LOGIN_USER &&
    req.body.password === process.env.LOGIN_PASS
  ) {
    req.session.user = true;
    return res.redirect("/dashboard");
  }

  res.send("Invalid login");
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// ================= COUNT EMAILS =================

app.post("/count-emails", upload.single("file"), (req, res) => {
  if (!req.file) return res.json({ total: 0 });

  const emails = extractEmails(req.file.path);
  fs.unlink(req.file.path, () => {});

  res.json({ total: emails.length });
});

// ================= SEND EMAIL =================

const multiUpload = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "attachments", maxCount: 10 }
]);

app.post("/send-bulk-live", multiUpload, async (req, res) => {
  try {
    if (!req.files || !req.files["file"]) {
      return res.json({ error: "No Excel uploaded" });
    }

    const excelFile = req.files["file"][0];
    const attachments = req.files["attachments"] || [];

    const emails = cleanEmails(extractEmails(excelFile.path));

    let success = 0;
    let failed = 0;

    console.log("📬 Total emails to send:", emails.length);

    for (const email of emails) {
      console.log("➡️ Sending to:", email);

      const sent = await sendEmail(
        email,
        req.body.subject,
        {
          message: req.body.message,
          registerLink: req.body.registerLink,
          whatsappLink: req.body.whatsappLink,
          whatsappGroupLink: req.body.whatsappGroupLink,
          youtubeLink: req.body.youtubeLink,
        }
      );

      if (sent) {
        success++;
        logEvent({ email, status: "sent" });
      } else {
        failed++;
        logEvent({ email, status: "failed" });
      }
    }

    console.log("🎉 Completed all emails");

    // cleanup
    fs.unlink(excelFile.path, () => {});
    attachments.forEach(f => fs.unlink(f.path, () => {}));

    res.json({
      message: "Emails processed",
      success,
      failed,
      total: emails.length
    });

  } catch (err) {
    console.log("🔥 Critical error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= LOGS =================

app.get("/logs", (req, res) => {
  try {
    const data = fs.readFileSync("logs.json", "utf8");
    res.json(JSON.parse(data || "[]"));
  } catch {
    res.json([]);
  }
});

// ================= START =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});