'use strict';

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { buildEmailTemplate } = require("./templateBuilder");

// 🌏 SES Client (Mumbai region)
const sesClient = new SESClient({
  region: process.env.AWS_REGION, // ap-south-1
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function sendEmail(to, subject, data, attachments = []) {
  try {
    console.log("➡️ Sending via SES to:", to);

    // 🧾 Convert HTML template
    const htmlBody = buildEmailTemplate(data);

    const params = {
      Source: process.env.EMAIL, // verified sender
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: "UTF-8",
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    console.log("✅ SES SUCCESS:", response.MessageId);

    return true;

  } catch (error) {
    console.log("❌ SES ERROR:", error.message);
    return false;
  }
}

module.exports = { sendEmail };