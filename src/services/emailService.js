const { Resend } = require("resend");
const { buildEmailTemplate } = require("./templateBuilder");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, data, attachments) {
  try {
    console.log("➡️ Sending via Resend to:", to);

    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // default working sender
      to: to,
      subject: subject,
      html: buildEmailTemplate(data),
      attachments: attachments?.map(file => ({
        filename: file.filename,
        path: file.path
      }))
    });

    console.log("✅ SUCCESS:", response);

    return true;

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error.message);
    return false;
  }
}

module.exports = { sendEmail };