const xlsx = require("xlsx");

function extractEmails(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  return data.map(row => row.email).filter(Boolean);
}

module.exports = { extractEmails };