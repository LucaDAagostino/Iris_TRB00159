window.screenshotAsImage = function () {
  screenshot.asImage();
};

window.screenshot = {
  // Cattura in un <div id="screenshot"> nascosto, ritorna il canvas
  asElement: async function (element) {
    element = element || document.body;

    // rimuove eventuale cattura precedente
    const old = document.getElementById("screenshot");
    if (old) old.remove();

    const host = document.getElementById("containerMain") || document.body;
    const screenshotDiv = document.createElement("div");
    screenshotDiv.id = "screenshot";
    screenshotDiv.className = "screenshot";
    screenshotDiv.style.display = "none";
    host.appendChild(screenshotDiv);

    try {
      const canvas = await html2canvas(element, {
        logging: false,
        useCORS: true,         // serve CORS sugli asset esterni
        allowTaint: false,
        backgroundColor: "#fff",
        scale: Math.max(1, window.devicePixelRatio),
        windowWidth:  document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      screenshotDiv.appendChild(canvas);
      return canvas;
    } catch (err) {
      consoleLog.error("screenshot.asElement failed: " + err);
      return null;
    }
  },

  // Apre una finestra e mostra l'immagine con Download + Copia PNG
  asImage: async function (element) {
    element = element || document.body;

    // apri subito la finestra (evita blocco popup)
    const params = "height=600,width=900,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=yes";
    const win = window.open("about:blank", "screenshot", params);

    try {
      const canvas = await html2canvas(element, {
        logging: false,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#fff",
        scale: Math.max(1, window.devicePixelRatio),
        windowWidth:  document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      canvas.toBlob(function (blob) {
        if (!blob) {
          if (win) win.close();
          return;
        }

        const doc = win ? win.document : document;
        const url = URL.createObjectURL(blob);

        doc.title = "Screenshot";
        const wrap = doc.createElement("div");
        wrap.style.cssText = "font-family: system-ui,Segoe UI,Roboto,Arial; padding: 12px;";

        // Bottoni azione
        const actions = doc.createElement("div");
        actions.style.cssText = "display:flex; gap:8px; align-items:center; margin-bottom:10px;";

        const a = doc.createElement("a");
        a.textContent = "Scarica PNG";
        a.download = "screenshot.png";
        a.href = url;
        a.style.cssText = "display:inline-block; padding:6px 10px; border:1px solid #ccc; border-radius:8px; text-decoration:none; color:#000;";

        const copyBtn = doc.createElement("button");
        copyBtn.textContent = "Copia PNG negli appunti";
        copyBtn.style.cssText = "padding:6px 10px; border:1px solid #ccc; border-radius:8px; background:#fff; cursor:pointer;";

        const supported = !!(navigator.clipboard && window.ClipboardItem) && window.isSecureContext;
        if (!supported) {
          copyBtn.disabled = true;
          copyBtn.title = "Richiede HTTPS e supporto Clipboard API";
        } else {
          copyBtn.onclick = async () => {
            try {
              await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
              copyBtn.textContent = "Copiato ✔";
              setTimeout(() => (copyBtn.textContent = "Copia PNG negli appunti"), 1500);
            } catch (e) {
              alert("Copia non riuscita. Prova a scaricare il PNG.");
            }
          };
        }

        actions.appendChild(a);
        actions.appendChild(copyBtn);

        // Immagine
        const img = doc.createElement("img");
        img.src = url;
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";

        wrap.appendChild(actions);
        wrap.appendChild(img);
        doc.body.appendChild(wrap);

        // libera URL al close
        if (win) {
          win.addEventListener("beforeunload", () => URL.revokeObjectURL(url));
        } else {
          // se per qualche motivo stai usando doc corrente
          window.addEventListener("beforeunload", () => URL.revokeObjectURL(url));
        }
      }, "image/png");
    } catch (err) {
     consoleLog.error("screenshot.asImage failed: " + err);
      if (win) win.close();
    }
  },

  // Copia direttamente negli appunti (senza aprire finestre)
  copyToClipboard: async function (element) {
    element = element || document.body;

    if (!(navigator.clipboard && window.ClipboardItem) || !window.isSecureContext) {
      throw new Error("La copia PNG richiede HTTPS e supporto Clipboard API.");
    }

    const canvas = await html2canvas(element, {
      logging: false,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#fff",
      scale: Math.max(1, window.devicePixelRatio),
      windowWidth:  document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error("Impossibile creare il PNG"));
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          resolve(true);
        } catch (e) {
          reject(e);
        }
      }, "image/png");
    });
  },
};


