const nodemailer = require("nodemailer");
const { buildEmailTemplate } = require("./templateBuilder");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

async function sendEmail(to, subject, data, attachments) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html: buildEmailTemplate(data),
      attachments
    });

    console.log("📧 SUCCESS:", info.response);

    return true;

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error.message);

    return false;
  }
}

module.exports = { sendEmail };