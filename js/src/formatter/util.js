export const escapeString = function(str) {
  return str.replace(/[/\\^$*+?.()|[\]{}]/gu, '\\$&')
}

export const escapeHtml = function(unsafe) {
  return unsafe
    .replace(/\u0026/gu, '&amp;')
    .replace(/\u003c/gu, '&lt;')
    .replace(/\u003e/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#039;')
}

export const treatNewlines = function(text) {
  return text
    .replace(/<\/div><div>/gu, '<br>')
    .replace(/<div>/gu, '<br>')
}
