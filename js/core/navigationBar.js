navigationBar = function () {
  handleMenuBar();
  handleSideBar();

  if (!Boolean(isAppCore)) {
    hideSidebar();
  }

  refreshHamburgerIcon();
  // normalizeMnemonics();

  let sideBarCompany = document.getElementById("sideBarCompany");
  if (sideBarCompany) {
    sideBarCompany.textContent = getDataStorage("company", "session");
  }
};

/* --------------------------- MENU BAR --------------------------- */

handleMenuBar = function () {
  var menuBarObj = getLastMenuBar();
  if (menuBarObj != null) {
    menuBarObj.style.width = "auto";
    menuBarObj.style.height = "auto";

    // Cursor pointer sulle LABEL del menù
    var labels = menuBarObj.getElementsByTagName("LABEL");
    for (let i = 0; i < labels.length; i++) {
      if (labels[i].htmlFor !== "") {
        var elem = document.getElementById(labels[i].htmlFor);
        if (elem) elem.label = labels[i];
        if (elem.label.htmlFor.includes("S_")) {
          elem.label.style.cursor = "pointer";
          elem.label.style.width = "100%";
          elem.label.style.height = "100%";
        }
        elem.onclick = function () {
          pressKey("Enter");
        };
      }
    }

    // Nasconde i radio
    var inputs = menuBarObj.getElementsByTagName("input");
    for (let iInput = 0; iInput < inputs.length; iInput++) {
      var input = inputs[iInput];
      if (input.type === "radio") {
        input.style.left = "";
        input.style.top = "";
        input.classList.add("menuBarItemRadio");
      }
    }

    // Sposta i div e classi helper
    var divs = menuBarObj.getElementsByTagName("div");
    for (let iDiv = 0; iDiv < divs.length; iDiv++) {
      var div = divs[iDiv];
      div.style.width = "100%";
      div.style.left = "";
      div.style.top = "";
      div.style.height = "auto";
      div.style.position = "";

      if (div.className.includes("A3A")) {
        div.style.pointerEvents = "none";
        div.classList.add("label-pull-down-menu-disabled");
      } else {
        div.classList.add("label-pull-down-menu-sideBar");
      }

      var labelsTag = div.getElementsByTagName("label");
      for (let iLabel = 0; iLabel < labelsTag.length; iLabel++) {
        labelsTag[iLabel].classList.add("menuBarItemLink");
      }
    }
  }

  // Marca le voci navigabili per la sidebar
  var elements = document.getElementById("5250").getElementsByTagName("a");
  for (let iElement = 0; iElement < elements.length; iElement++) {
    var element = elements[iElement];
    var id = element.id;
    if (
      ((id.substr(0, 2) === "S_") && element.className.includes("menu-bar")) ||
      detectScreen(properties.mainProgramAppCoreId, "I9001LB")
    ) {
      if (Boolean(isAppCore)) {
        element.classList.add("sideBarItem");
      }
    }
  }
};

/* --------------------------- SIDEBAR --------------------------- */

handleSideBar = function () {
  const containerSideBar = document.getElementById("containerSideBar");
  const sideBarEl = document.getElementById("sideBar");

  if (Boolean(isSignon) || Boolean(isWindowAppCore)) {
    if (containerSideBar) {
      containerSideBar.style.display = "none";
      containerSideBar.style.maxWidth = "0";
    }
    if (sideBarEl) sideBarEl.classList.remove("active-nav");
  } else if (Boolean(isAppCore)) {
    if (containerSideBar) {
      containerSideBar.style.display = "flex";
      containerSideBar.style.flexDirection = "row";
      containerSideBar.style.maxWidth = "none";
    }
    sideBar(false);
    if (Boolean(isProgramAppCore)) {
      sideBar(true);
    }
    if (Boolean(isMenuAppCore)) {
      const ceo = document.getElementById("containerEmulatorOutside");
      if (ceo) ceo.style.marginTop = "0";
    }
  }
};

addIconSideBar = function (element, containerSideBarItem) {
  var sideBarItemIcon = document.createElement("i");
  var idsideBarItemIcon = "icon_" + element.id;
  const txt = element.textContent;

  if (txt === "Accedi") sideBarItemIcon.className = "fas fa-sign-in-alt";
  if (txt === "Salta") sideBarItemIcon.className = "fas fa-eject";
  if (txt === "Ricerche") sideBarItemIcon.className = "fas fa-search";
  if (txt === "Attività") sideBarItemIcon.className = "fas fa-edit";
  if (txt === "Componenti") sideBarItemIcon.className = "fab fa-buromobelexperte";
  if (txt === "Espandi") sideBarItemIcon.className = "fas fa-expand";
  if (txt === "Anagrafe" || txt === "Anagrafiche") sideBarItemIcon.className = "fa fa-users";
  if (txt === "Contratti") sideBarItemIcon.className = "fas fa-file-signature";
  if (txt === "SistGuida") sideBarItemIcon.className = "fas fa-cogs";
  if (txt === "Contabilità") sideBarItemIcon.className = "fas fa-cash-register";
  if (txt === "Varie") sideBarItemIcon.className = "fas fa-question-circle";
  if (txt === "Funzioni" || txt === "Funz.") sideBarItemIcon.className = "fas fa-tools";
  if (txt === "Sistema") sideBarItemIcon.className = "fa fa-cog";
  if (txt.includes("Sistemi") && txt.includes("Guida")) sideBarItemIcon.className = "fas fa-car";

  sideBarItemIcon.id = idsideBarItemIcon;
  sideBarItemIcon.classList.add("sideBarItemIcon", "align-self-center");
  containerSideBarItem.appendChild(sideBarItemIcon);
};

sideBar = function (forceSidebar) {
  const containerSideBar = document.getElementById("containerSideBar");
  if (!containerSideBar) return;

  if (!document.getElementById("sideBar") && !document.getElementById("sideBarButton")) {
    buildSidebar();
  }
  var sideBarEl = document.getElementById("sideBar");

  applyUserToSidebar();

  var sideBarButton = document.getElementById("sideBarButton");
  sideBarButton.classList.remove("hideSidebar");
  sideBarButton.classList.add("showSidebar");

  var sideBarItems = document.getElementById("sideBarItems");
  if (!Boolean(forceSidebar)) {
    sideBarItems.innerHTML = "";
  } else {
    document.getElementById("containerSideBarButton")?.classList.toggle("sideBarOpen");
  }

  var menuBarElements = document.getElementById("5250").getElementsByClassName("sideBarItem");
  var iLi = 0;

  // Sposto le <a> originali nel menu laterale
  for (let i = 0; i < menuBarElements.length; i++) {
    var menuBarElement = menuBarElements[i];

    var li = document.createElement("li");
    li.id = "sideBarItem_" + ++iLi;
    li.className = "sideBarItem";

    let containerSideBarItem = document.createElement("div");
    containerSideBarItem.id = "containerSideBarItem_" + iLi;
    containerSideBarItem.className = "containerSideBarItem";

    // addIconSideBar(menuBarElement, containerSideBarItem);

    menuBarElement.className = "sideBarItemLink nav-link";
    menuBarElement.style.position = "";
    menuBarElement.style.top = "";
    menuBarElement.style.left = "";

    // caret sempre visibile
    ensureCaret(menuBarElement);

    containerSideBarItem.append(menuBarElement);
    li.append(containerSideBarItem);
    sideBarItems.append(li);

    // perché sposto lo stesso nodo dall’HTMLCollection live
    i--;
  }

  const linksCount = document.querySelectorAll("#sideBarItems a").length;
  if (linksCount === 0 && !Boolean(forceSidebar)) {
    toogleHideSidebar();
  }
  if (linksCount > 0) {
    showSidebar();
  }

  const menuBar = getLastMenuBar();
  const outside = document.getElementById("containerEmulatorOutside");
  const insideBody = document.getElementById("containerEmulatorInsideBody");

  if (!sideBarIsActive()) {
    if (outside) {
      outside.style.transition = "opacity 150ms";
      outside.style.opacity = "1";
    }
  } else {
    if (insideBody) insideBody.style.visibility = "hidden";
    if (menuBar) {
      attachMenuBarToActiveItem(menuBar);
      if (outside) {
        outside.style.transition = "opacity 150ms";
        outside.style.opacity = "1";
      }
    }
  }

  sideBarButtonOnClick(forceSidebar);
  sideBarItemClick(); // bind click su voci padre
};

buildSidebar = function () {
  var sideBar = document.getElementById("sideBar");

  if (sideBar == null) {
    const container = document.getElementById("containerSideBar");
    if (!container) return;

    sideBar = document.createElement("div");
    sideBar.id = "sideBar";
    sideBar.className = "sideBar d-flex flex-column";

    const sideBarTop = document.createElement("div");
    sideBarTop.id = "sideBarTop";

    const sideBarTitle = document.createElement("div");
    sideBarTitle.id = "sideBarTitle";
    sideBarTitle.className = "sideBarTitle";

    const sideBarUserIcon = document.createElement("div");
    sideBarUserIcon.id = "sideBarUserIcon";

    const sideBarJob = document.createElement("div");
    sideBarJob.id = "sideBarJob";

    const sideBarJobUser = document.createElement("div");
    sideBarJobUser.id = "sideBarJobUser";

    sideBarJob.append(sideBarJobUser);
    sideBarTitle.append(sideBarUserIcon, sideBarJob);

    const ulSideBar = document.createElement("div");
    ulSideBar.id = "ulSideBar";

    const sideBarItems = document.createElement("ul");
    sideBarItems.id = "sideBarItems";
    sideBarItems.className = "sideBarItems nav flex-column text-white w-100";

    ulSideBar.append(sideBarItems);

    const sideBarBottom = document.createElement("div");
    sideBarBottom.id = "sideBarBottom";
    sideBarBottom.className = "sideBarBottom";

    sideBarTop.append(sideBarTitle, ulSideBar);
    sideBar.append(sideBarTop, sideBarBottom);

    const containerSideBarButton = document.createElement("div");
    containerSideBarButton.id = "containerSideBarButton";
    containerSideBarButton.className = "containerSideBarButton";

    const sideBarButton = document.createElement("button");
    sideBarButton.id = "sideBarButton";
    sideBarButton.className = "btn btn-primary hideSidebar";

    const iconHamburgerSidebar = document.createElement("i");
    iconHamburgerSidebar.id = "iconHamburgerSidebar";
    iconHamburgerSidebar.className = "fas fa-bars";

    const srOnly = document.createElement("span");
    srOnly.className = "sr-only";
    srOnly.textContent = "Toggle Menu";

    sideBarButton.append(iconHamburgerSidebar, srOnly);
    containerSideBarButton.append(sideBarButton);

    const sideBarBackButton = document.createElement("button");
    sideBarBackButton.id = "sideBarBackButton";
    sideBarBackButton.type = "button";
    sideBarBackButton.className = "btn btn-primary sideBarBackButton";
    sideBarBackButton.title = "Indietro";

    const sideBarBackIcon = document.createElement("i");
    sideBarBackIcon.className = "fas fa-arrow-left";

    sideBarBackButton.append(sideBarBackIcon);
    containerSideBarButton.append(sideBarBackButton);

    sideBarBackButton.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();

      const hasSubmenu = document.querySelector(".sideBarSubmenu");

      if (typeof pressKey === "function") {
        if (hasSubmenu) {
          pressKey("CF10");

          setTimeout(() => {
            pressKey("CF12");
          }, 150);
        } else {
          pressKey("CF12");
        }
      }
    };

    container.append(sideBar, containerSideBarButton);
    container.style.display = "flex";

    iconHamburgerEffect();
  }

  let currentDate = new Date();
  let sideBarBottom = document.getElementById("sideBarBottom");
  if (!sideBarBottom) return;

  let sideBarCompany = document.getElementById("sideBarCompany");
  if (!sideBarCompany) {
    sideBarCompany = document.createElement("div");
    sideBarCompany.id = "sideBarCompany";
    sideBarBottom.append(sideBarCompany);
  }
  sideBarCompany.textContent = getDataStorage("company", "session") || "";


  let sideBarToday = document.getElementById("sideBarToday");
  if (!sideBarToday) {
    sideBarToday = document.createElement("div");
    sideBarToday.id = "sideBarToday";
    sideBarBottom.append(sideBarToday);
  }

  let sideBarTodayIcon = document.getElementById("sideBarTodayIcon");
  if (!sideBarTodayIcon) {
    sideBarTodayIcon = document.createElement("i");
    sideBarTodayIcon.id = "sideBarTodayIcon";
    sideBarTodayIcon.className = "far fa-clock";
    sideBarToday.append(sideBarTodayIcon);
  }

  let sideBarTodayDate = document.getElementById("sideBarTodayDate");
  if (!sideBarTodayDate) {
    sideBarTodayDate = document.createElement("div");
    sideBarTodayDate.id = "sideBarTodayDate";
    sideBarTodayDate.style.paddingLeft = "0.5rem";
    sideBarToday.append(sideBarTodayDate);
  }

  sideBarTodayDate.textContent = currentDate.dateNow?.() || "";

  let sideBarTodayTime = document.getElementById("sideBarTodayTime");
  if (!sideBarTodayTime) {
    sideBarTodayTime = document.createElement("div");
    sideBarTodayTime.id = "sideBarTodayTime";
    sideBarTodayTime.style.marginLeft = "auto";
    sideBarToday.append(sideBarTodayTime);
  }

  sideBarTodayTime.textContent = currentDate.timeNow?.() || "";
};


iconHamburgerEffect = function () {
  const icon = document.getElementById("iconHamburgerSidebar");
  if (!icon) return;

  setHamburgerIconDefault();

  if (icon._hambHandlers) {
    icon.removeEventListener("mouseover", icon._hambHandlers.over);
    icon.removeEventListener("mouseout", icon._hambHandlers.out);
  }

  const onMouseOver = () => {
    icon.classList.add("fas");
    icon.classList.remove("fa-home", "fa-bars", "fa-arrow-left", "fa-arrow-right");
    icon.classList.add(sideBarIsActive() ? "fa-arrow-left" : "fa-arrow-right");
  };
  const onMouseOut = () => setHamburgerIconDefault();

  icon.addEventListener("mouseover", onMouseOver);
  icon.addEventListener("mouseout", onMouseOut);
  icon._hambHandlers = { over: onMouseOver, out: onMouseOut };
};

toogleHideSidebar = function () {
  var sideBarButton = document.getElementById("sideBarButton");
  let sideBar = document.getElementById("sideBar");
  if (sideBar != null) {
    sideBar.classList.remove("active-nav");
    let containerSideBarButton = document.getElementById("containerSideBarButton");
    containerSideBarButton.classList.remove("sideBarOpen");
    sideBarButton.classList.remove("showSidebar");
    sideBarButton.classList.add("hideSidebar");
  } else {
    buildSidebar();
    sideBarButton = document.getElementById("sideBarButton");
    sideBarButton.classList.add("hideSidebar");
  }
};

showSidebar = function () {
  let sideBar = document.getElementById("sideBar");
  let containerSideBarButton = document.getElementById("containerSideBarButton");
  sideBar.classList.add("active-nav");
  containerSideBarButton.classList.add("sideBarOpen");
};

sideBarButtonOnClick = function (forceSidebar) {
  const sideBarButton = document.getElementById("sideBarButton");
  if (!sideBarButton) return;

  sideBarButton.onclick = function () {
    let menuBar = getLastMenuBar();

    // (il vecchio codice usava #sidebar: correzione su #sideBar)
    const sb = document.getElementById("sideBar");
    if (sb) {
      if (Boolean(sideBarIsActive())) {
        sb.style.marginLeft = `-${sb.offsetWidth}px`;
      } else {
        sb.style.marginLeft = "";
      }
    }

    const linksCount = document.querySelectorAll("#sideBarItems a").length;

    if (menuBar == null) {
      if (Boolean(forceSidebar)) {
        if (Boolean(isProgramAppCore)) {
          isInsideProgramAppCore = true;
        }
        pressKey("CF10");
        toogleShowSidebar();
      } else {
        if (linksCount !== 0) {
          toogleShowSidebar();
        } else {
          toogleHideSidebar();
        }
      }
    } else {
      if (Boolean(isProgramAppCore)) {
        isInsideProgramAppCore = true;
      }
      pressKey("CF10");
      const outside = document.getElementById("containerEmulatorOutside");
      if (outside) {
        outside.style.transition = "opacity 150ms";
        outside.style.opacity = Boolean(isMenuAppCore) ? "1" : "0.1";
      }
    }
  };
};

toogleShowSidebar = function () {
  let sideBar = document.getElementById("sideBar");
  let containerSideBarButton = document.getElementById("containerSideBarButton");
  sideBar.classList.toggle("active-nav");
  containerSideBarButton.classList.toggle("sideBarOpen");
};

hideSidebar = function () {
  let sideBar = document.getElementById("sideBar");
  if (sideBar != null) {
    const container = document.getElementById("containerSideBar");
    if (container) container.innerHTML = "";
  }
};

resetSideBar = function () {
  let containerSideBar = document.getElementById("containerSideBar");
  if (!containerSideBar) return;
  const divs = containerSideBar.getElementsByTagName("div");
  // copia l’HTMLCollection in array perché rimuoviamo mentre iteriamo
  [...divs].forEach((el) => {
    if (el.id && el.id.includes("window")) el.remove();
  });
};

sideBarIsActive = function () {
  var sideBar = document.getElementById("sideBar");
  return !!(sideBar && sideBar.className.includes("active-nav"));
};

/* --------------------- Slide anim --------------------- */

function slideOpen(holder) {
  if (!holder) return;
  holder.style.display = "block";
  holder.style.height = "0px";
  holder.style.opacity = "0";
  holder.style.marginTop = "0";
  holder.offsetHeight; // reflow
  const h = holder.scrollHeight;
  holder.style.height = h + "px";
  holder.style.opacity = "1";
  const done = (e) => {
    if (e.propertyName === "height") {
      holder.style.height = "auto";
      holder.removeEventListener("transitionend", done);
    }
  };
  holder.addEventListener("transitionend", done);
}

function slideClose(holder) {
  if (!holder) return;
  const h = holder.scrollHeight;
  holder.style.height = h + "px";
  holder.offsetHeight;
  holder.style.height = "0px";
  holder.style.opacity = "0";
  holder.style.marginTop = "0";
}

/* ---------------------- Caret helper ---------------------- */

function ensureCaret(linkEl) {
  if (!linkEl) return;
  if (!linkEl.querySelector(".caret")) {
    linkEl.insertAdjacentHTML(
      "afterbegin",
      '<svg class="caret" viewBox="0 0 12 12" aria-hidden="true">' +
      '<path d="M6 9L1 4h10L6 9z" fill="currentColor"></path>' +
      "</svg>"
    );
  }
}

/* ---------------------- Attach menù (sottomenu) ---------------------- */

function attachMenuBarToActiveItem(menuBar) {
  if (!menuBar) return;

  // lavora in flow
  menuBar.removeAttribute("style");
  menuBar.classList.add("menu-bar-pulldown-sideBar");

  // Cerco prima nella variabile globale (se siamo nella stessa sessione JS)
  let containerId = (typeof idSideBarItemClick === "string" && idSideBarItemClick)
    ? idSideBarItemClick
    : null;

  // Se vuota, recupero dal storage usando la TUA API
  if (!containerId) {
    containerId = getDataStorage("navBar_lastClickedId", "session");
  }

  // Trovo il contenitore (LI) padre
  var parentContainer = containerId ? document.getElementById(containerId) : null;
  var parentLi = parentContainer
    ? parentContainer.closest("li")
    : document.querySelector("#sideBarItems li"); // Fallback al primo elemento


  if (!parentLi) return;

  // caret sulla voce padre
  ensureCaret(parentContainer?.querySelector(".sideBarItemLink"));

  // contenitore submenu sotto la voce
  var holder = parentLi.querySelector(".sideBarSubmenu");
  if (!holder) {
    holder = document.createElement("div");
    holder.className = "sideBarSubmenu";
    parentLi.appendChild(holder);
  }

  // TOGGLE: se già aperto e il menù è proprio questo, chiudi
  if (parentLi.classList.contains("open") && holder.contains(menuBar)) {
    slideClose(holder);
    parentLi.classList.remove("open");
    return;
  }

  // chiudi altri sottomenu aperti
  document.querySelectorAll("#sideBarItems li.open").forEach((li) => {
    if (li !== parentLi) {
      li.classList.remove("open");
      const h = li.querySelector(".sideBarSubmenu");
      if (h) slideClose(h);
    }
  });

  // collega il menù a questa voce e apri
  holder.appendChild(menuBar);
  pruneMenuBarItems(menuBar);
  parentLi.classList.add("open");
  holder.style.height = "0px";
  requestAnimationFrame(() => slideOpen(holder));
}

/* --------- Click: voce padre -> genera window1 e aggancia --------- */
sideBarItemClick = function () {
  const anchors = document.querySelectorAll("#sideBarItems a");

  anchors.forEach((a) => {
    // Rimuove l’eventuale handler precedente
    if (a._navpatchHandler) {
      a.removeEventListener("click", a._navpatchHandler);
    }

    // Crea il nuovo handler
    a._navpatchHandler = function (e) {
      const parent = a.parentElement;
      const clickedId = parent ? parent.id : "";

      if (clickedId) {
        setDataStorage("navBar_lastClickedId", clickedId, "session");
        idSideBarItemClick = clickedId;
      }
    };

    // Aggiunge l’handler
    a.addEventListener("click", a._navpatchHandler);
  });
};



/* piccolo polling per attendere il menù */
function waitForMenuBar(timeoutMs = 600, intervalMs = 40) {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      const mb = (typeof getLastMenuBar === "function") ? getLastMenuBar() : document.getElementById("window1");
      if (mb) return resolve(mb);
      if (performance.now() - start >= timeoutMs) return resolve(null);
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

/* ---- caret clickable (come prima) ---- */
document.addEventListener(
  "click",
  function (e) {
    const caret = e.target.closest && e.target.closest(".sideBarItemLink .caret");
    if (caret) {
      const a = caret.closest("a");
      if (a) {
        e.preventDefault();
        a.click();
      }
    }
  },
  true
);

/* ---------------------- Utility user / icona hamburger ---------------------- */

function getUserFromSessionOrFallback() {
  const userName = getDataStorage("userName", "session");
  const userSurname = getDataStorage("userSurname", "session");
  const userFallback =
    typeof pui !== "undefined" && pui.appJob && pui.appJob.user ? pui.appJob.user : "";

  const displayName =
    userName && userSurname ? `${userName} ${userSurname}` : userFallback;
  const initials =
    userName && userSurname
      ? (userName.charAt(0) + userSurname.charAt(0)).toUpperCase()
      : userFallback
        ? userFallback.charAt(0).toUpperCase()
        : "";

  return { displayName, initials };
}

function applyUserToSidebar() {
  const { displayName, initials } = getUserFromSessionOrFallback();
  const sideBarTitle = document.getElementById("sideBarTitle");
  if (!sideBarTitle) return;

  let sideBarUserIcon = document.getElementById("sideBarUserIcon");
  if (!sideBarUserIcon) {
    sideBarUserIcon = document.createElement("div");
    sideBarUserIcon.id = "sideBarUserIcon";
    sideBarTitle.append(sideBarUserIcon);
  }
  if (initials) sideBarUserIcon.setAttribute("data-initials", initials);

  let sideBarJob = document.getElementById("sideBarJob");
  if (!sideBarJob) {
    sideBarJob = document.createElement("div");
    sideBarJob.id = "sideBarJob";
    sideBarTitle.append(sideBarJob);
  }

  let sideBarJobUser = document.getElementById("sideBarJobUser");
  if (!sideBarJobUser) {
    sideBarJobUser = document.createElement("div");
    sideBarJobUser.id = "sideBarJobUser";
    sideBarJob.append(sideBarJobUser);
  }
  if (displayName) sideBarJobUser.textContent = displayName;
}

function computeIsInMainMenu() {
  return Boolean(typeof isMainMenuAppCore !== "undefined" && isMainMenuAppCore);
}

function setHamburgerIconDefault() {
  const icon = document.getElementById("iconHamburgerSidebar");
  if (!icon) return;
  const fa = computeIsInMainMenu() ? "fa-home" : "fa-bars";
  icon.classList.add("fas");
  icon.classList.remove("fa-home", "fa-bars", "fa-arrow-left", "fa-arrow-right");
  icon.classList.add(fa);
}

function refreshHamburgerIcon() {
  setHamburgerIconDefault();
}

/* ---------------------- (opzionale) mnemonics ---------------------- */

function normalizeMnemonics(root) {
  const scope = root || document;
  scope.querySelectorAll("span.mnemonic").forEach((el) => {
    const letter = el.textContent;
    const next = el.nextSibling;
    let rest = "";
    if (next && next.nodeType === Node.TEXT_NODE) {
      rest = next.textContent;
      next.remove();
    }
    const span = document.createElement("span");
    span.textContent = letter + rest;
    el.replaceWith(span);
  });
}

// Rimuove dal menuBar le righe non valorizzate:
// - div.label-pull-down-menu-disabled
// - div.label-pull-down-menu con testo vuoto (solo spazi/nbsp)
// Rimuove anche il relativo <input id="..."> referenziato dalla <label for="...">
function pruneMenuBarItems(menuBarRoot) {
  if (!menuBarRoot) return;

  const cssEscape = (id) =>
    (window.CSS && CSS.escape) ? CSS.escape(id) : id.replace(/([ #;?%&,.+*~':"!^$[\]()=>|\/@])/g, '\\$1');

  const rows = menuBarRoot.querySelectorAll('.label-pull-down-menu');
  rows.forEach(div => {
    const isDisabled = div.classList.contains('label-pull-down-menu-disabled');
    const text = (div.textContent || '').replace(/\u00a0/g, ' ').trim();

    if (isDisabled || text.length === 0) {
      const lab = div.querySelector('label[for]');
      if (lab) {
        const forId = lab.getAttribute('for');
        if (forId) {
          const inp = menuBarRoot.querySelector(`input#${cssEscape(forId)}`);
          if (inp) inp.remove();
        }
      } else {
        // fallback: se l'HTML è input + div, rimuovi l'input precedente
        const prev = div.previousElementSibling;
        if (prev && prev.tagName === 'INPUT') prev.remove();
      }
      // rimuovi la riga del menu
      div.remove();
    }
  });
}


// Gestione toggle delle voci sidebar (quelle con la freccia)
document.addEventListener('click', function (e) {
  const link = e.target.closest('#sideBarItems .sideBarItemLink');
  if (!link) return; // click non sulla sidebar principale

  const li = link.closest('.sideBarItem');
  if (!li) return;

  const submenu = li.querySelector('.sideBarSubmenu');
  // se non ha submenu, non facciamo nulla (lasciamo il comportamento standard)
  if (!submenu) return;

  // era aperta PRIMA del click?
  const wasOpen = li.classList.contains('open');

  // Se la voce cliccata era già aperta → la chiudo e RIMUOVO il suo submenu
  if (wasOpen) {
    li.classList.remove('open');
    submenu.remove(); // via proprio dal DOM

    // blocco gli handler originali che altrimenti potrebbero fare altro (F10 ecc.)
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // Se era chiusa → lasciamo che il codice originale la apra / ricrei il submenu
}, true); // capture=true: intercettiamo prima degli altri handler
