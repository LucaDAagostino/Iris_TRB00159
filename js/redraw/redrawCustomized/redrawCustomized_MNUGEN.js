function redrawCustomized_MNUGEN() {
    setRedrawCustomized.On();

    const container5250 = document.getElementById("5250");
    if (!container5250) {
        return;
    }

    // Crea contenitore principale
    let containerCustom = document.getElementById("container5250Custom");
    const containerCustomMenu = document.createElement("div");

    containerCustomMenu.id = "container5250CustomMenu";
    containerCustom.appendChild(containerCustomMenu);

    // Inserisce dinamicamente il contenitore VANTA
    const canvasDiv = document.createElement("div");
    canvasDiv.id = "vantaCanvasContainer";
    canvasDiv.style.height = "300px";
    canvasDiv.style.width = "100%";
    canvasDiv.style.marginBottom = "2rem";
    containerCustomMenu.prepend(canvasDiv);

    // Attiva l’animazione
   vantaAnimationAdd("#containerEmulatorInside")

    const divs = container5250.getElementsByTagName("div");
    const options = [];

    for (let i = 0; i < divs.length; i++) {
        const div = divs[i];
        let text = div.textContent || "";

        text = text
            .replace(/\u00A0/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        // Match tipo: "1 -", "2 .", "90 -" ecc.
        const match = text.match(/^(\d+)\s*[.-]\s*$/);
        if (match) {
            const number = match[1];
            const next = divs[i + 1];
            if (next) {
                const label = next.textContent.replace(/\u00A0/g, " ").trim();
                options.push({
                    number,
                    label,
                    icon: null
                });
            }
        }
    }

    renderOptionTiles(options);

    const errorDiv = document.getElementById("D_24_2");

    if (errorDiv && errorDiv.textContent.trim() !== "") {
        alert("Errore: " + errorDiv.textContent.trim());
    }

    if (options && options.length) {
        const mainForm = document.querySelector('form[name="main"]');
        if (mainForm) {
            mainForm.style.display = "none";
        }
    }
}

function renderOptionTiles(options) {
    let container = document.getElementById("container5250CustomMenu");

    container.innerHTML = "";

    // Applica layout flex orizzontale
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.gap = "1rem";
    container.style.alignItems = "center";

    options.forEach(opt => {
        const testo = opt.label;
        const valore = opt.number;
        const tasto = null;
        const element = null; // campo su cui scrivere il valore

        const button = createButton(
            null,
            "btn-custom-dark d-flex align-items-center",
            tasto,
            testo,
            null,
            valore,
            element,
            opt.label
        );

        if (opt.icon) {
            const img = document.createElement("img");
            img.src = opt.icon;
            img.alt = opt.label;
            img.style.width = "32px";
            img.style.height = "32px";
            img.style.marginRight = "0.5rem";
            button.insertBefore(img, button.firstChild);
        }

        // Sovrascrive il click per garantire: set + Enter
        button.onclick = () => {
            setFieldValue(properties.idCommandLine, valore, true);
            pressKey("Enter");
        };

        container.appendChild(button);
    });
}


