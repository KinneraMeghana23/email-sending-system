function formatMessage(type, message) {
  if (type === "announcement") return `📢 ${message}`;
  if (type === "meeting") return `📅 ${message}`;
  if (type === "holiday") return `🎉 ${message}`;
  return message;
}

module.exports = { formatMessage };