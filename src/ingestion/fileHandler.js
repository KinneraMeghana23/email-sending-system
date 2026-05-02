const xlsx = require("xlsx");

function extractEmails(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = xlsx.utils.sheet_to_json(sheet);

  console.log("📊 Extracted rows:", data);

  const emails = data
    .map(row => row["email id"] || row["email"] || row["Email"] || row["Email ID"])
    .filter(Boolean);

  console.log("📬 Extracted emails:", emails);

  return emails;
}

module.exports = { extractEmails };