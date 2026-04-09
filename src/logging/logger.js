const fs = require("fs");

function logEvent(data) {
  let logs = [];

  try {
    if (fs.existsSync("logs.json")) {
      const content = fs.readFileSync("logs.json", "utf8");
      if (content.trim()) logs = JSON.parse(content);
    }
  } catch {
    logs = [];
  }

  logs.push({ ...data, time: new Date().toISOString() });

  fs.writeFileSync("logs.json", JSON.stringify(logs, null, 2));
}

module.exports = { logEvent };