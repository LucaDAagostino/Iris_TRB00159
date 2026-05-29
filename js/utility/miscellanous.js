function createElement(tag) {
  // default: <div> se non specificato
  return document.createElement(tag || "div");
}

function setBackground(el, cssVar) {
  if (el) el.style.backgroundColor = `var(${cssVar})`;
}

function setIconColor(id, cssVar) {
  const icon = document.getElementById(id);
  if (icon) icon.style.color = `var(${cssVar})`;
}