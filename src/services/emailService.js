const { Resend } = require("resend");
const { buildEmailTemplate } = require("./templateBuilder");
const fs = require("fs");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, data, attachments) {
  try {
    console.log("➡️ Sending via Resend to:", to);

    // 🔥 Convert attachments to base64 (REQUIRED for Resend)
    const formattedAttachments = attachments?.map(file => ({
      filename: file.filename,
      content: fs.readFileSync(file.path).toString("base64")
    }));

    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // default working sender
      to: to,
      subject: subject,
      html: buildEmailTemplate(data),
      attachments: formattedAttachments
    });

    // ❗ IMPORTANT: Check for API error properly
    if (response.error) {
      console.log("❌ EMAIL ERROR:", response.error.message);
      return false;
    }

    console.log("✅ SUCCESS:", response);

    return true;

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error.message);
    return false;
  }
}

module.exports = { sendEmail };