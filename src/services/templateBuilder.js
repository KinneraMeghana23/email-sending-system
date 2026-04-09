'use strict';

function buildEmailTemplate({
  message,
  registerLink,
  whatsappLink,
  whatsappGroupLink,
  youtubeLink,
  attachmentName
}) {

  return `
  <div style="font-family:Arial; max-width:650px; margin:auto; padding:20px;">

    <h2 style="text-align:center;">
      🚀 Master AI, ML & Gen-AI in Just 1 Week!
    </h2>

    <img src="https://via.placeholder.com/600x250" 
         style="width:100%; border-radius:10px;">

    <p>${message.replace(/\n/g,"<br>")}</p>

    <div style="background:#f3f4f6;padding:10px;border-radius:8px;">
      📅 Date: 13 April 2026<br>
      ⏰ Time: 6:00 PM – 7:30 PM<br>
      📍 Mode: YouTube Live<br>
      💰 Training: FREE
    </div>

    <h3>🔗 Important Links</h3>

    <a href="${registerLink}" 
    style="background:#6c63ff;color:white;padding:10px;border-radius:5px;display:inline-block;">
    Register Now</a><br><br>

    <a href="${whatsappGroupLink}" 
    style="background:#25D366;color:white;padding:10px;border-radius:5px;display:inline-block;">
    Join WhatsApp Group</a><br><br>

    <p>
      📢 <a href="${whatsappLink}">Channel</a><br>
      📺 <a href="${youtubeLink}">YouTube</a>
    </p>

    <hr>

    <h4>📎 Attachments</h4>
    <p>${attachmentName}</p>

    <h3 style="text-align:center;color:#6c63ff;">
      ⚡ Limited Seats — Register Now!
    </h3>

  </div>
  `;
}

module.exports = { buildEmailTemplate };