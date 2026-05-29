// === Background color ===
bodyColorDefault = function () {
  document.body.style.backgroundColor = "var(--bs-background-color)";
};

bodyColorDarker = function () {
  document.body.style.backgroundColor = "var(--bs-background-color-darker)";
};

mediaQueries = function () {
  let multX = null;
  let multY = null;

  const root = document.documentElement;
  const breakpoint = getComputedStyle(root)
    .getPropertyValue('--bs-breakpoint')
    .replace(/"/g, '')
    .trim();

  let htmlSize = '16px';

  // Default multX - multY
  //if (pui.genie.displaySize == 132) {pui.multX = 6; pui.multY = 20;} else {pui.multX = 8; pui.multY = 23;}


  switch (breakpoint) {
    case 'desktopUltra':
      htmlSize = '14px';
      if (pui.genie.displaySize == 132) { multX = 14; multY = 30; }
      else { multX = 17; multY = 32; }
      break;
    case 'desktop4K':
      htmlSize = '13px';
      if (pui.genie.displaySize == 132) { multX = 11; multY = 29; }
      else { multX = 16; multY = 31; }
      break;
    case 'desktop3XL':
      htmlSize = '12px';
      if (pui.genie.displaySize == 132) { multX = 10; multY = 28; }
      else { multX = 14; multY = 29; }
      break;
    case 'desktop2XL':
      htmlSize = '11px';
      if (pui.genie.displaySize == 132) { multX = 10; multY = 25; }
      else { multX = 13; multY = 27; }
      break;
    case 'desktopXL':
      htmlSize = '11px';
      if (pui.genie.displaySize == 132) { multX = 10; multY = 24 }
      else { multX = 12; multY = 25; }
      break;
    case 'desktop':
      htmlSize = '10px';
      if (pui.genie.displaySize == 132) { multX = 9; multY = 22; }
      else { multX = 11; multY = 24; }
      break;
    default:
      htmlSize = '10px';
      if (pui.genie.displaySize == 132) { multX = 9; multY = 22; }
      else { multX = 11; multY = 24; }
  }

  root.style.fontSize = htmlSize;
  root.style.setProperty('--bs-html-font-size', htmlSize);

  consoleLog.debug("Breakpoint: " + breakpoint + " Display size: " + pui.genie.displaySize + " Font size: " + htmlSize + " MultX: " + multX + " MultY: " + multY)

  pui.multX = multX;
  pui.multY = multY;

  const bp = breakpoint || getCurrentBreakpoint();
  const storageKey = getFontStorageKeyForBreakpoint(bp);
  const savedFont = getDataStorage(storageKey, "local");

  let fontToApply;
  if (savedFont != null && savedFont !== "") {
    const n = parseFloat(savedFont);
    fontToApply = !isNaN(n) ? n : parseFloat(htmlSize);
  } else {
    fontToApply = parseFloat(htmlSize);
  }

  if (!isNaN(fontToApply)) {
    applyRootFontSize(fontToApply, bp);
  }

  const div5250 = document.getElementById("5250");
  if (div5250) div5250.style.height = (row * pui.multY) + "px";
};

// === Font family ===
setFontFamily = function () {
  let div5250 = getObj("5250");
  if (div5250 != null) {
    if (isSignon || (isAppCore && (isMenuSystemAppCore || isMenuAppCore || isProgramAppCore || isWindowAppCore))) {
      div5250.style.fontFamily = "var(--bs-font-sans-serif)";
    } else {
      div5250.style.fontFamily = "var(--bs-font-monospace)";
    }
  }
};

// === Conversion helpers ===
var convertPx = {
  vh: function (px) {
    const n = parseFloat(px) || 0;
    const wh = window.innerHeight || document.documentElement.clientHeight;
    return ((n * 100) / (wh || 1)) + "vh";
  },

  vw: function (px) {
    const n = parseFloat(px) || 0;
    const ww = window.innerWidth || document.documentElement.clientWidth;
    return ((n * 100) / (ww || 1)) + "vw";
  },

  rem: function (px, elem, pxFix) {
    const n = parseFloat(px) || 0;
    let basePx;

    if (pxFix != null) {
      basePx = parseFloat(pxFix) || 16;
    } else {
      const target = elem || document.documentElement; // <html>
      const fs = getComputedStyle(target).fontSize;    // es "16px"
      basePx = parseFloat(fs) || 16;
    }
    return (n / basePx) + "rem";
  },

  elementAttributeNames: function (element) {
    if (!element) return;
    for (const name of element.getAttributeNames()) {
      const value = element.getAttribute(name);
      if (value && value.includes("px")) {
        const newValue = value.replace(/(-?\d+(\.\d+)?)px/g, (_, num) => convertPx.rem(num));
        if (newValue !== value) element.setAttribute(name, newValue);
      }
    }
  },

  elementStyle: function (element) {
    if (!element) return;
    const styleText = element.getAttribute("style");
    if (!styleText) return;

    const newText = styleText.replace(/(:\s*)(-?\d+(\.\d+)?)px/gi,
      (m, p1, num) => p1 + convertPx.rem(num));
    if (newText !== styleText) element.setAttribute("style", newText);
  }
};
