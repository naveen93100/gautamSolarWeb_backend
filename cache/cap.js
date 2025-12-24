function toCaps(text) {
  if (!text) return "";
  const str = String(text).toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
  //  return text? String(text).toLocaleUpperCase():"";
}

module.exports = { toCaps };
