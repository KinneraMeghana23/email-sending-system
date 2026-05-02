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

// 📁 STATIC FILES
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

// ================= EMAIL COUNT =================

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

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    if (!req.files || !req.files["file"]) {
      res.write(JSON.stringify({ error: "No Excel uploaded" }));
      return res.end();
    }

    const excelFile = req.files["file"][0];
    const attachments = req.files["attachments"] || [];

    const emails = cleanEmails(extractEmails(excelFile.path));

    let success = 0;
    let failed = 0;

    const emailAttachments = attachments.map(f => ({
      filename: f.originalname,
      path: f.path
    }));

    for (const email of emails) {

      let sent = false;

      try {
        sent = await Promise.race([
          sendEmail(
            email,
            req.body.subject,
            {
              message: req.body.message,
              registerLink: req.body.registerLink,
              whatsappLink: req.body.whatsappLink,
              whatsappGroupLink: req.body.whatsappGroupLink,
              youtubeLink: req.body.youtubeLink,
              attachmentName: attachments.map(f => f.originalname).join(", ")
            },
            emailAttachments
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 10000)
          )
        ]);

      } catch (err) {
        console.log("❌ Error for:", email, err.message);
        sent = false;
      }

      if (sent) {
        success++;
        logEvent({ email, status: "sent" });
      } else {
        failed++;
        logEvent({ email, status: "failed" });
      }

      // 🔄 Stream progress
      res.write(JSON.stringify({
        sent: success,
        failed: failed,
        total: emails.length
      }) + "\n");

      await new Promise(r => setTimeout(r, 50));
    }

    console.log("🎉 Completed all emails");

    fs.unlink(excelFile.path, () => {});
    attachments.forEach(f => fs.unlink(f.path, () => {}));

    res.end();

  } catch (err) {
    console.log("🔥 Critical error:", err);
    res.end(JSON.stringify({ error: "Server error" }));
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

app.get("/export-logs", (req, res) => {
  const data = fs.readFileSync("logs.json", "utf8");
  res.setHeader("Content-Disposition", "attachment; filename=logs.json");
  res.send(data);
});

// ================= START =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});