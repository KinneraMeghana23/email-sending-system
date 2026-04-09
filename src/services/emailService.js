const nodemailer = require("nodemailer");
const { buildEmailTemplate } = require("./templateBuilder");

// 🔥 FIXED SMTP CONFIG (NO MORE TIMEOUT ISSUES)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // IMPORTANT: false for port 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds max
  greetingTimeout: 10000,
  socketTimeout: 10000
});

async function sendEmail(to, subject, data, attachments) {
  try {
    console.log("➡️ Attempting to send to:", to);

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html: buildEmailTemplate(data),
      attachments
    });

    console.log("✅ SUCCESS:", info.response);

    return true;

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error.message);

    return false;
  }
}

module.exports = { sendEmail };