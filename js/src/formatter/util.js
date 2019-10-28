export function getSrToken(components) {
  return `%%sr%%${components.join('%%')}%%`
}

export function escapeString(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function escapeHtml(unsafe) {
  return unsafe
    .replace(RegExp('\u0026', 'g'), "&amp;")
    .replace(RegExp('\u003c', 'g'), "&lt;")
    .replace(RegExp('\u003e', 'g'), "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function treatNewlines(text) {
  return text
    .replace(RegExp('</div><div>', 'g'), '<br>')
    .replace(RegExp('<div>', 'g'), '<br>')
}
