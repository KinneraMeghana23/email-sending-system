const nodemailer = require("nodemailer");
const { buildEmailTemplate } = require("./templateBuilder");
const fs = require("fs");

// 🔥 Gmail SMTP transporter (stable config)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

async function sendEmail(to, subject, data, attachments) {
  try {
    console.log("➡️ Sending via Nodemailer to:", to);

    // 📎 Attachments (local files allowed in Nodemailer)
    const formattedAttachments = attachments?.map(file => ({
      filename: file.filename,
      path: file.path
    }));

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: to,
      subject: subject,
      html: buildEmailTemplate(data),
      attachments: formattedAttachments
    });

    console.log("✅ SUCCESS:", info.response);

    return true;

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error.message);
    return false;
  }
}

module.exports = { sendEmail };