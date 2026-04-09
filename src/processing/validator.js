function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanEmails(list) {
  const unique = new Set();
  return list.filter(email => {
    email = email.trim();
    if (isValidEmail(email) && !unique.has(email)) {
      unique.add(email);
      return true;
    }
    return false;
  });
}

module.exports = { cleanEmails };