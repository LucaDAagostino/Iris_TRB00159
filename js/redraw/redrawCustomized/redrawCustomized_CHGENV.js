function redrawCustomized_CHGENV() {
  setRedrawCustomized.On();

  const container5250 = document.getElementById("5250");
  const containerCustom = document.getElementById("container5250Custom");

  if (!container5250 || !containerCustom) return;

  const oldMenu = document.getElementById("container5250CustomMenu");
  if (oldMenu) oldMenu.remove();

  const containerCustomMenu = document.createElement("div");
  containerCustomMenu.id = "container5250CustomMenu";
  containerCustom.appendChild(containerCustomMenu);

  const canvasDiv = document.createElement("div");
  canvasDiv.id = "vantaCanvasContainer";
  canvasDiv.style.height = "0";
  canvasDiv.style.width = "100%";
  canvasDiv.style.marginBottom = "2rem";
  containerCustomMenu.appendChild(canvasDiv);

  vantaAnimationAdd("#containerEmulatorInside");

  const result = extractCHGENVOptions(container5250);

  renderCHGENVSelectedLabel(
    containerCustomMenu,
    result.selectedLabel || "Nessun ambiente selezionato"
  );

  const optionsContainer = document.createElement("div");
  optionsContainer.id = "container5250CustomMenuOptions";
  containerCustomMenu.appendChild(optionsContainer);

  renderCHGENVOptionTiles(result.options);

  if (result.options.length || result.selectedLabel) {
    const mainForm = container5250.querySelector('form[name="main"]');
    if (mainForm) mainForm.style.display = "none";
  }
}

function extractCHGENVOptions(container5250) {
  const anchors = container5250.querySelectorAll(
    'a[href^="JavaScript:pressKey"], a[href^="javascript:pressKey"]'
  );

  const options = [];

  anchors.forEach(anchor => {
    const href = anchor.getAttribute("href") || "";

    const keyMatch = href.match(/pressKey\(['"]([^'"]+)['"]\)/i);
    if (!keyMatch) return;

    const key = keyMatch[1];

    const parentText = (anchor.parentElement?.textContent || anchor.textContent || "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const match = parentText.match(/^(\d+)\.\s*(.*)$/);
    if (!match) return;

    options.push({
      number: match[1],
      label: match[2],
      key,
      icon: null
    });
  });

  options.sort((a, b) => Number(a.number) - Number(b.number));

  return {
    options,
    selectedLabel: extractCHGENVSelectedLabel(container5250)
  };
}

function extractCHGENVSelectedLabel(container5250) {
  const divs = container5250.querySelectorAll('form[name="main"] > div');

  for (const div of divs) {
    const text = (div.textContent || "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const match = text.match(/\*\*\.\s*(.*)$/);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "";
}

function renderCHGENVSelectedLabel(container, selectedLabel) {
  const selectedBox = document.createElement("div");
  selectedBox.id = "chgenvSelectedLabel";

  selectedBox.innerHTML = `
    <span class="chgenv-selected-title">
      Ambiente selezionato
    </span>

    <span class="chgenv-selected-value">
      ${escapeHtmlCHGENV(selectedLabel)}
    </span>
  `;

  container.appendChild(selectedBox);
}


// >>> @Start v1.0.6
// Funzioni per identificare le lingue, creare le bandiere SVG
// e renderizzare le schede. Non richiedono immagini esterne.

function getCHGENVLanguage(label) {
  const normalized = String(label || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/\b(inglese|english)\b/.test(normalized)) {
    return {
      id: "inglese",
      name: "English"
    };
  }

  if (/\b(spagnolo|espanol|spanish)\b/.test(normalized)) {
    return {
      id: "spagnolo",
      name: "Español"
    };
  }

  if (/\b(italiano|italian)\b/.test(normalized)) {
    return {
      id: "italiano",
      name: "Italiano"
    };
  }

  return null;
}

function getCHGENVLanguageFlagSVG(languageId) {
  const flags = {
    italiano: `
      <svg viewBox="0 0 60 36"
           xmlns="http://www.w3.org/2000/svg"
           aria-hidden="true"
           focusable="false">
        <rect width="20" height="36" fill="#009246"/>
        <rect x="20" width="20" height="36" fill="#FFFFFF"/>
        <rect x="40" width="20" height="36" fill="#CE2B37"/>
      </svg>
    `,

    inglese: `
      <svg viewBox="0 0 60 36"
           xmlns="http://www.w3.org/2000/svg"
           aria-hidden="true"
           focusable="false">
        <rect width="60" height="36" fill="#012169"/>
        <path d="M0 0L60 36M60 0L0 36"
              stroke="white"
              stroke-width="8"/>
        <path d="M0 0L60 36M60 0L0 36"
              stroke="#C8102E"
              stroke-width="3"/>
        <path d="M30 0V36M0 18H60"
              stroke="white"
              stroke-width="12"/>
        <path d="M30 0V36M0 18H60"
              stroke="#C8102E"
              stroke-width="6"/>
      </svg>
    `,

    spagnolo: `
      <svg viewBox="0 0 60 36"
           xmlns="http://www.w3.org/2000/svg"
           aria-hidden="true"
           focusable="false">
        <rect width="60" height="36" fill="#AA151B"/>
        <rect y="9" width="60" height="18" fill="#F1BF00"/>
        <g transform="translate(17 18)">
          <rect x="-3" y="-6"
                width="6"
                height="11"
                rx="1"
                fill="#AA151B"/>
          <rect x="-4" y="-7"
                width="8"
                height="2"
                fill="#AA151B"/>
          <rect x="-2" y="-4"
                width="4"
                height="6"
                fill="#F1BF00"/>
          <path d="M-5 5H5"
                stroke="#AA151B"
                stroke-width="1.5"/>
        </g>
      </svg>
    `
  };

  return flags[languageId] || "";
}

function renderCHGENVLanguageCards(languageOptions) {
  const section = document.createElement("section");
  section.className = "chgenv-language-section";

  const heading = document.createElement("h2");
  heading.className = "chgenv-language-heading";
  heading.textContent = "Lingua / Language / Idioma";

  const status = document.createElement("div");
  status.className = "chgenv-language-status";
  status.setAttribute("aria-live", "polite");

  const cards = document.createElement("div");
  cards.className = "chgenv-language-cards";

  // Legge la lingua salvata prima del redraw.
  const previouslySelected = getCHGENVSelectedLanguage();

  const languageOrder = {
    italiano: 1,
    inglese: 2,
    spagnolo: 3
  };



  const orderedLanguageOptions = [...languageOptions].sort(
    (a, b) =>
      (languageOrder[a.language.id] || 99) -
      (languageOrder[b.language.id] || 99)
  );

  const languageTitles = {
    italiano: "Lingua",
    inglese: "Language",
    spagnolo: "Idioma"
  };

  heading.textContent = orderedLanguageOptions
    .map(opt => languageTitles[opt.language.id])
    .filter(Boolean)
    .join(" / ");

  // Questo è il ciclo a cui mi riferivo:
  // crea una scheda per ogni lingua disponibile.
  orderedLanguageOptions.forEach(opt => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "chgenv-language-card";
    card.title = opt.label;
    card.setAttribute("aria-label", `Seleziona ${opt.language.name}`);
    card.setAttribute("aria-pressed", "false");

    const flag = document.createElement("span");
    flag.className = "chgenv-language-flag";
    flag.setAttribute("aria-hidden", "true");
    flag.innerHTML = getCHGENVLanguageFlagSVG(opt.language.id);

    const name = document.createElement("span");
    name.className = "chgenv-language-name";
    name.textContent = opt.language.name;

    card.appendChild(flag);
    card.appendChild(name);

    // Ripristina l'evidenziazione della lingua salvata.
    if (opt.language.id === previouslySelected) {
      card.classList.add("chgenv-language-card-selected");
      card.setAttribute("aria-pressed", "true");
      status.textContent = `Lingua selezionata: ${opt.language.name}`;
    }

    card.onclick = () => {
      saveCHGENVSelectedLanguage(opt.language.id);

      cards.querySelectorAll(".chgenv-language-card").forEach(item => {
        item.classList.remove("chgenv-language-card-selected");
        item.setAttribute("aria-pressed", "false");
      });

      card.classList.add("chgenv-language-card-selected");
      card.setAttribute("aria-pressed", "true");
      status.textContent = `Lingua selezionata: ${opt.language.name}`;

      pressKey(opt.key);
    };

    cards.appendChild(card);
  });

  if (!status.textContent) {
    status.textContent = "Seleziona una lingua";
  }

  section.appendChild(heading);
  section.appendChild(status);
  section.appendChild(cards);

  return section;
}
// <<< @END v1.0.6


function renderCHGENVOptionTiles(options) {
  const container = document.getElementById("container5250CustomMenuOptions");
  if (!container) return;

  container.innerHTML = "";

  const columnsWrapper = document.createElement("div");
  columnsWrapper.className = "chgenv-columns-wrapper";
  container.appendChild(columnsWrapper);

  let logoutButton = null;
  let mainButton = null;
  let specialButton = null;

  const decadeColumns = new Map();

  // >>> @Start v1.0.6
  // Raccoglie le opzioni lingua per renderizzarle come schede.
  const languageOptions = [];
  // <<< @END v1.0.6

  options.forEach(opt => {
    const label = opt.label || "";
    const number = opt.number;
    const upperLabel = label.toUpperCase();

    const isLogout =
      upperLabel.includes("SCOLLEGAMENTO") ||
      upperLabel.includes("LOGOUT") ||
      upperLabel.includes("USCITA");

    const isMain =
      upperLabel.includes("MENU PRINCIPALE") ||
      upperLabel.includes("MENU INIZIALE");

    const isSpecial =
      upperLabel.includes("PROCEDURA NSIL");

    if (isLogout) {
      logoutButton = opt;
      return;
    }

    if (isMain) {
      mainButton = opt;
      return;
    }

    if (isSpecial) {
      specialButton = opt;
      return;
    }

    // >>> @Start v1.0.6
    // Riconosce le lingue e le esclude dai normali pulsanti.
    const language = getCHGENVLanguage(label);

    if (language) {
      languageOptions.push({
        ...opt,
        language
      });
      return;
    }
    // <<< @END v1.0.6

    const parsedNumber = parseInt(number, 10);
    if (Number.isNaN(parsedNumber)) return;

    const decade = Math.floor(parsedNumber / 10);

    if (!decadeColumns.has(decade)) {
      const col = document.createElement("div");
      col.className = "chgenv-decade-column";

      const title = document.createElement("div");
      title.className = "chgenv-decade-title";
      title.textContent = getCHGENVGroupTitle(options, decade);

      col.appendChild(title);
      decadeColumns.set(decade, col);
      columnsWrapper.appendChild(col);
    }

    const currentColumn = decadeColumns.get(decade);

    const button = createButton(
      null,
      "btn-custom-dark d-flex align-items-center",
      null,
      label,
      null,
      number,
      null,
      label
    );

    button.onclick = () => {
      pressKey(opt.key);
    };

    currentColumn.appendChild(button);
  });

  // >>> @Start v1.0.6
  // Inserisce le schede lingua prima dei gruppi numerati.
  if (languageOptions.length) {
    const languageSection =
      renderCHGENVLanguageCards(languageOptions);

    container.insertBefore(languageSection, columnsWrapper);
  }
  // <<< @END v1.0.6

  if (specialButton) {
    const topWrapper = document.createElement("div");
    topWrapper.className = "chgenv-top-wrapper";

    const button = createButton(
      null,
      "btn btn-success d-flex align-items-center gap-3 chgenv-btn-special",
      null,
      "",
      null,
      specialButton.number,
      null,
      specialButton.label
    );

    button.innerHTML = "";

    const icon = document.createElement("i");
    icon.className = "bi bi-window-stack";

    const span = document.createElement("span");
    span.textContent = specialButton.label || "Procedura";

    button.appendChild(icon);
    button.appendChild(span);

    button.onclick = () => {
      pressKey(specialButton.key);
    };

    topWrapper.appendChild(button);
    container.prepend(topWrapper);
  }

  if (mainButton || logoutButton) {
    const bottomRow = document.createElement("div");
    bottomRow.className = "chgenv-bottom-row";

    if (mainButton) {
      const mainBtn = createButton(
        null,
        "btn btn-primary d-flex align-items-center gap-2 chgenv-main-btn",
        null,
        "Menu principale",
        null,
        mainButton.number,
        null,
        mainButton.label
      );

      mainBtn.innerHTML = "";

      const icon = document.createElement("i");
      icon.className = "bi bi-house-door-fill";

      const span = document.createElement("span");
      span.textContent = "Menu principale";

      mainBtn.appendChild(icon);
      mainBtn.appendChild(span);

      mainBtn.onclick = () => {
        pressKey(mainButton.key);
      };

      bottomRow.appendChild(mainBtn);
    }

    if (logoutButton) {
      const logoutBtn = createButton(
        null,
        "btn btn-danger d-flex align-items-center gap-2 chgenv-logout-btn",
        null,
        "Scollegamento",
        null,
        logoutButton.number,
        null,
        logoutButton.label
      );

      logoutBtn.innerHTML = "";

      const icon = document.createElement("i");
      icon.className = "bi bi-box-arrow-right";

      const span = document.createElement("span");
      span.textContent = "Scollegamento";

      logoutBtn.appendChild(icon);
      logoutBtn.appendChild(span);

      logoutBtn.onclick = () => {
        pressKey(logoutButton.key);
      };

      bottomRow.appendChild(logoutBtn);
    }

    container.appendChild(bottomRow);
  }
}

function getCHGENVGroupTitle(options, decade) {
  const labels = options
    .filter(opt => {
      const n = parseInt(opt.number, 10);
      return !Number.isNaN(n) && Math.floor(n / 10) === decade;
    })
    .map(opt => opt.label || "")
    .filter(Boolean);

  if (!labels.length) return `Gruppo ${decade}`;

  const cleanedLabels = labels.map(label =>
    label
      .replace(/\bAmbiente\b/gi, "")
      .replace(/\bProduzione\b/gi, "")
      .replace(/\bCollaudo\b/gi, "")
      .replace(/\bbatch\b/gi, "")
      .replace(/\btest\b/gi, "")
      .replace(/\s+/g, " ")
      .trim()
  );

  const common = getCommonCHGENVText(cleanedLabels);

  return common || cleanedLabels[0] || `Gruppo ${decade}`;
}


// >>> @Start v1.0.6
function saveCHGENVSelectedLanguage(languageId) {
  setDataStorage("chgenvSelectedLanguage", languageId, "session");
}

function getCHGENVSelectedLanguage() {
  return getDataStorage("chgenvSelectedLanguage", "session") || "";
}
// <<< @END v1.0.6

function getCommonCHGENVText(labels) {
  if (!labels.length) return "";

  const wordLists = labels.map(label =>
    label
      .split(" ")
      .map(w => w.trim())
      .filter(Boolean)
  );

  let commonWords = wordLists[0];

  for (let i = 1; i < wordLists.length; i++) {
    commonWords = commonWords.filter(word =>
      wordLists[i].some(w => w.toUpperCase() === word.toUpperCase())
    );
  }

  const result = commonWords.join(" ").trim();

  if (result.length >= 2) return result;

  return labels[0] || "";
}

function escapeHtmlCHGENV(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}