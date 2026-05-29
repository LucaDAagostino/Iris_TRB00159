body = function () {
    handleInputDiv();
    handleEmulator();
    handleEventListeners();
}

handleInputDiv = function () {
    preparedMenuInfo();

    let elements = document.getElementById("5250").querySelectorAll('div, input');
    elements.forEach((element, index) => {
        const tagElement = element.tagName.toLowerCase();

        if (element.id.startsWith("D_") || element.tabIndex === -1) {
            setReadOnly(element.id);
        }

        // Numero
        if (element.getAttribute('num') == "011" || (isSuccessBGNIDSPF && (element.getAttribute("fldisexpand") === "S"))) {
            if (isNumeric(element.fieldInfo.data)) {
                element.classList.add("numericField");
                if (element.length == 1) {
                    if (element.value.charAt(element.value.length - 1) == "0") {
                        element.value = null;

                    }
                } else {
                    if (element.value.charAt(element.value.length - 1) == "0" && element.value.charAt(element.value.length - 2) == " ") {
                        element.value = null;
                    }
                }
            }
        }

        // Data
        if (element.fieldInfo != null && element.fieldInfo.data == " 0/00/0000") {
            setFieldValue(element.id, '')
        }

        if (tagElement === 'input') {
            handleInput(element);
        } else if (tagElement === 'div') {
            handleDivLabel(element);
            handleDivSubfile(element);
            if (Boolean(isAppCore)) {
                preparedMenuInfoApplicativo(element);
            }
        }
    });
}

handleInput = function (input) {
    var subfile = getLastSubfile();

    // Subfile: sistema opzione
    if (subfile != null && input.maxLength == "2" && input.type == "text") {
        if (input.className.includes("combo-main-box")) {
            let parentNode = input.parentNode;
            if (parentNode != null && parentNode.className.includes("input")) {
                parentNode.classList.add("subfileOption");
                parentNode.style.height = convertPx.rem(parentNode.style.height, null, properties.defaultFontSize);
            }
        } else {
            if (input.getAttribute("fldName") == "VDSCT") {
                input.classList.add("subfileOption");
            } else if (input.getAttribute("name").includes("InputField")) {
                input.classList.add("subfileOption");
            }
        }
    }

    // Classe errore
    if (input.className.includes("A2D") || input.className.includes("A35")) {
        input.classList.add("errorInput");
        input.classList.add("is-invalid");
    }

    // Riduce dimensione
    if (Boolean(isAppCore) && input.maxLength > pui.multX) {
        input.style.maxWidth = (input.maxLength * (pui.multX - 2)) + "px";
    }

};

preparedMenuInfo = function () {
    menuInfoItems = [];

    let label = null;
    let value = null;
    let fullLabelAndValue = null;
    if (sysName != "") {
        label = '<div class="labelMenuInfoItems">Sistema</div>';
        value = '<div class="valueMenuInfoItems" > ' + sysName + '</div>';
        fullLabelAndValue = label.concat(value);
        menuInfoItems.push(fullLabelAndValue);
    }
    if (pui.appJob.user != "") {
        label = '<div class="labelMenuInfoItems">Utente</div>';
        value = '<div class="valueMenuInfoItems" > ' + pui.appJob.user + '</div>';
        fullLabelAndValue = label.concat(value);
        menuInfoItems.push(fullLabelAndValue);
    }
    if (pui.appJob.name != "") {
        label = '<div class="labelMenuInfoItems">Lavoro</div>';
        value = '<div class="valueMenuInfoItems" > ' + pui.appJob.name + '/' + pui.appJob.user + '/' + pui.appJob.number + '</div>';
        fullLabelAndValue = label.concat(value);
        menuInfoItems.push(fullLabelAndValue);
    }

    if (Boolean(isAppCore)) {
        let label = null;
        let value = null;
        let fullLabelAndValue = null;
        if (getDataStorage("environment", "session") != null && Boolean(isAppCore)) {
            label = '<div class="labelMenuInfoItems">Ambiente</div>';
            value = '<div class="valueMenuInfoItems" > ' + getDataStorage("environment", "session") + '</div>';
            fullLabelAndValue = label.concat(value);
            menuInfoItems.push(fullLabelAndValue);
        }
        if (getDataStorage("company", "session") != null) {
            label = '<div class="labelMenuInfoItems">Societa</div>';
            value = '<div class="valueMenuInfoItems" > ' + getDataStorage("company", "session") + '</div>';
            fullLabelAndValue = label.concat(value);
            menuInfoItems.push(fullLabelAndValue);
        }
    }
}

preparedMenuInfoApplicativo = function (div) {
    let label = null;
    let value = null;
    let fullLabelAndValue = null;

    if (Boolean(isMenuAppCore)) {
        if (div.id == getMenuAppCore.id()) {
            label = '<div class="labelMenuInfoItems">Menu' + '</div>';
            value = '<div class="valueMenuInfoItems" > ' + div.textContent + '</div>';
            fullLabelAndValue = label.concat(value);
            menuInfoItems.push(fullLabelAndValue);
        } else if (div.id == getProgramNameInitial.id()) {
            label = '<div class="labelMenuInfoItems">Programma' + '</div>';
            value = '<div class="valueMenuInfoItems" > ' + div.textContent + '</div>';
            fullLabelAndValue = label.concat(value);
            menuInfoItems.push(fullLabelAndValue);
        }
    } else if (Boolean(isProgramAppCore) || Boolean(isWindowAppCore)) {
        if (div.id == getProgramName.id()) {
            label = '<div class="labelMenuInfoItems">Programma</div>';
            value = '<div class="valueMenuInfoItems" > ' + div.textContent + '</div>';
            fullLabelAndValue = label.concat(value);
            menuInfoItems.push(fullLabelAndValue);

            label = '<div class="labelMenuInfoItems">Funzione applicativa</div>';
            value = '<div class="valueMenuInfoItems" > ' + getApplicationFunction.name() + '</div>';
            fullLabelAndValue = label.concat(value);
            menuInfoItems.push(fullLabelAndValue);

            label = '<div class="labelMenuInfoItems">Funzione selettiva</div>';
            value = '<div class="valueMenuInfoItems" > ' + getSelectionFunction.name() + '</div>';
            fullLabelAndValue = label.concat(value);
            menuInfoItems.push(fullLabelAndValue);
        }

    } else if (Boolean(isMenuSystemAppCore)) {
        if (div.id == getMenuSystem.id()) {
            label = '<div class="labelMenuInfoItems">Menu</div>';
            value = '<div class="valueMenuInfoItems" > ' + div.textContent + '</div>';
            fullLabelAndValue = label.concat(value);
            menuInfoItems.push(fullLabelAndValue);
        }
    }
}

handleDivLabel = function (div) {
    if (Boolean(isAppCore) && (Boolean(isProgramAppCore) || Boolean(isWindowAppCore))) {
        if (div.className.includes("A20")) {

            div.classList.add("labelField");

            if (div.getAttribute('fldname') === 'TEXT') {
                div.classList.add("textField");
            }

            let regex = null;
            if (div.textContent.endsWith('.') || div.textContent.endsWith('. ')) {
                regex = /\s\./g;
                if (div.textContent.search(regex) > 0) {
                    div.textContent = div.textContent.substr(0, div.textContent.search(regex));
                    div.textContent = div.textContent.endsWith(' ') ? div.textContent.substr(0, div.textContent.length - 1) : div.textContent;
                }
            }

            if (div.textContent.endsWith(':') || div.textContent.endsWith(': ')) {
                regex = /\s\:/g;
                if (div.textContent.search(regex) > 0) {
                    div.textContent = div.textContent.substr(0, div.textContent.search(regex));
                    div.textContent = div.textContent.endsWith(' ') ? div.textContent.substr(0, div.textContent.length - 1) : div.textContent;
                }
            }
        }
    }
}

handleDivSubfile = function (div) {
    var parentNode1 = div.parentNode;
    if (parentNode1 != null) {
        var parentNode2 = parentNode1.parentNode;
        if (parentNode2.id.indexOf("subfile") != -1) {
            div.classList.add("subfileField");
        }
    }
}

handleEmulator = function () {
    let containerEmulatorOutside = document.getElementById("containerEmulatorOutside");
    let containerEmulatorInside = document.getElementById("containerEmulatorInside");
    let containerEmulatorInsideBody = document.getElementById("containerEmulatorInsideBody");
    let containerEmulatorInsideFooter = document.getElementById("containerEmulatorInsideFooter");
    containerEmulatorInsideFooter.style.display = "none";

    if (Boolean(isSignon)) {
        containerEmulatorInside.style.borderRadius = "0";
    } else {
        containerEmulatorInside.style.borderRadius = convertPx.rem("8px");
    }

    handleBackgroundImage(containerEmulatorInside);

    if (!Boolean(isSignon)) {
        containerEmulatorInsideBody.style.removeProperty('padding-left');
        containerEmulatorInside.style.removeProperty('border');
        containerEmulatorOutside.style.pointerEvents = "revert";
        containerEmulatorInside.style.backgroundColor = "var(--bs-background-color-lighter)";

        if (Boolean(isProgramAppCore)) {
            if (!isWindowAppCore) {
                containerEmulatorInsideFooter.style.display = "flex";
            }
            if (sideBarIsActive()) {
                containerEmulatorOutside.style.pointerEvents = "none";
                containerEmulatorInsideFooter.style.display = "none";
            }
        }
        handlecontainerHeaderRight();
        handleInsideHeader();
    }

}


handleEventListeners = function () {
    iEventListener = 0;
    document.body.addEventListener("click", function (e) {
        var target = e.target;
        var parent = e.target.parentNode;

        if (searchString(target.classList.value, "spoolFile")) {
            $("#ulFunctionKey").css("display", "none");
        }

        if (iEventListener == 0) {
            var menuBarObj = getLastMenuBar();
            if (menuBarObj != null && parent != null) {
                if (
                    parent.parentNode != null &&
                    menuBarObj.id != target.parentNode.parentNode.id &&
                    target.parentNode.parentNode.id != "containerSideBar" &&
                    target.parentNode.parentNode.id != "ulMenuInfoItems"
                ) {
                    iEventListener++;
                    pressKey("Enter");
                }
            }


            if (!Boolean(properties.redraw) && (Boolean(isProgramAppCore) || Boolean(isWindowAppCore))) {
                let text = "";
                if (target.getAttribute("fldisexpand") == "1" || target.getAttribute("fldislist") == "1") {
                    if (target.tagName == "DIV") {
                        text = target.textContent;
                    } else {
                        text = target.value;
                    }

                    if (text == "") {
                        if (target.getAttribute("fldislist") == "1") {
                            pressKey("F4");
                        }
                    } else {
                        if (target.getAttribute("fldisexpand") == "1") {
                            pressKey("F6");
                        }
                    }
                }
            }
        }
    });
}

handleElementClick = function () {
    document.body.addEventListener("click", function (e) {
        var element = e.target;

        var text = null;
        if (element.tagName == 'DIV') {
            text = element.textContent;
        } else {
            text = element.value;
        }
        element.style.backgroundColor = "gray"

        if (text == "") {
            if (element.getAttribute("fldislist") == "1") {
                element.focus();
                pressKey("F4");
            }
        } else {
            if (element.getAttribute("fldisexpand") == "1") {
                element.focus();
                element.style.backgroundColor = "red"
                pressKey("F6");
            }
        }
    });
}

removePreviousWindow = function (currentWindow) {
    do {
        let windowPrevious = getCurrentWindow(currentWindow);
        if (windowPrevious != null) {
            windowPrevious.windowObject.remove();
        }
    }
    while (getCurrentWindow(currentWindow) != null);
}



handleBackgroundImage = function (containerEmulatorInside) {
    if (Boolean(isSignon)) {
        containerEmulatorInside.style.backgroundColor = "rgb(254 254 254 / 96%)";
        containerEmulatorInside.style.backgroundImage = "none";
        containerEmulatorInside.style.border = "0";
        containerEmulatorInsideBody.style.paddingLeft = "0";
    } else {
        if (Boolean(isAppCore) && Boolean(isMainMenuAppCore)) {
            if (!Boolean(backgroundImageRandom)) {
                handleBackgroundImageSet(containerEmulatorInside);
            } else {
                setBackgroundImage(lastImageBackground, false, containerEmulatorInside);
            }
        } else {
            handleBackgroundImageSet(containerEmulatorInside);
        }
        if (properties.backgroundImageInterval == null) {
            properties.backgroundImageInterval = setInterval(function () {
                handleBackgroundImageSet(containerEmulatorInside);
            }, properties.backgroundImagesTimeRefresh);
        }
    }
}

handleInsideHeader = function () {
    hideInsideHeader();

    if (Boolean(isProgramAppCore)) {
        populateInsideHeaderAppCore();
        createStyleContainerEmulatorInsideFooter();
    } else {
        if (Boolean(isMenuSystemAppCore)) {
            populateInsideHeaderSystem();
        }
    }
}

resetBackgroundImage = function () {
    if (properties.backgroundImageInterval != null) {
        clearTimeout(properties.backgroundImageInterval);
    }
}

handleBackgroundImageSet = function (containerEmulatorInside) {
    if (Boolean(isAppCore)) {
        if (Boolean(isMainMenuAppCore)) {
            handleBackgroundRandom(containerEmulatorInside);
            backgroundImageRandom = true;
        } else {
            if (Boolean(isInsideProgramAppCore) && sideBarIsActive()) {
                if (lastImageBackground == null) {
                    handleBackgroundRandom(containerEmulatorInside);
                    backgroundImageRandom = true;
                }
                setBackgroundImage(lastImageBackground, true, containerEmulatorInside);
            } else if (Boolean(isMenuAppCore) && !isWindowAppCore) {
                if (lastImageBackground == null) {
                    handleBackgroundRandom(containerEmulatorInside);
                    backgroundImageRandom = true;
                }
                setBackgroundImage(lastImageBackground, false, containerEmulatorInside);
            } else if (Boolean(isMenuAppCore) || isWindowAppCore) {
                if (lastImageBackground == null) {
                    handleBackgroundRandom(containerEmulatorInside);
                    backgroundImageRandom = true;
                }
                setBackgroundImage(lastImageBackground, true, containerEmulatorInside);
            } else {
                handleBackgroundDefault(containerEmulatorInside);
            }
        }
    } else {
        handleBackgroundDefault(containerEmulatorInside);
        backgroundImageRandom = false;
    }
}

hideInsideHeader = function () {
    if (Boolean(isAppCore)) {
        let divHeader = $('[id^=D_1_]');
        for (let i = 0; i < divHeader.length; i++) {
            if (divHeader[i].id.indexOf("_W") == -1) {
                if (Boolean(isMenuAppCore) || isWindowAppCore) {
                    divHeader[i].style.visibility = "hidden";
                }
            }
        }
    }
}

populateInsideHeaderAppCore = function () {
    if (Boolean(isAppCore)) {
        let divHeader = $('[id^=D_1_]');
        for (let i = 0; i < divHeader.length; i++) {
            if (divHeader[i].id.indexOf("_W") == -1) {
                if (Boolean(isProgramAppCore)) {
                    divHeader[i].classList.add("rowHeader");
                    divHeader[i].style.visibility = "hidden";
                    divHeader[i].style.color = "var(--bs-dark)";
                    if (i == 0) {
                        divHeader[i].style.textAlign = "left";
                    } else {
                        if (i == divHeader.length - 1) {
                            divHeader[i].style.textAlign = "right";
                        } else {
                            divHeader[i].style.textAlign = "center";
                        }
                    }
                    divHeader[i].textContent = divHeader[i].textContent.trim();
                }
            }
        }

        if (Boolean(isProgramAppCore) && (!sideBarIsActive())) {
            setIinsideHeaderTitle();
        }
    }
}

setIinsideHeaderTitle = function () {
    let insideHeaderTitle = document.getElementById("insideHeaderTitle");
    insideHeaderTitle.classList.add("headerTitle");
    insideHeaderTitle.style.visibility = "visible";
    insideHeaderTitle.textContent = getProgramTitle.name();

    if (insideHeaderTitle.textContent == "") {
        insideHeaderTitle.textContent = lastInsideHeaderTitleTextContent;
    } else {
        lastInsideHeaderTitleTextContent = insideHeaderTitle.textContent;
    }

    let containerEmulatorInsideHeader = document.getElementById("containerEmulatorInsideHeader");
    containerEmulatorInsideHeader.style.display = "flex";
}

createStyleContainerEmulatorInsideFooter = function () {
    let containerEmulatorInsideFooter = document.getElementById("containerEmulatorInsideFooter");
    let containerEmulatorInsideFooterText = document.getElementById("containerEmulatorInsideFooterText");
    let containerEmulatorInsideHeader = document.getElementById("containerEmulatorInsideHeader");

    let text = getApplicationFunction.description();

    if (text != null) {
        // Svuota il contenitore footer
        containerEmulatorInsideFooter.innerHTML = "";

        // Crea elemento testo se non esiste
        if (!containerEmulatorInsideFooterText) {
            containerEmulatorInsideFooterText = document.createElement("div");
            containerEmulatorInsideFooterText.id = "containerEmulatorInsideFooterText";
            containerEmulatorInsideFooterText.classList.add("containerEmulatorInsideFooterText")
            containerEmulatorInsideFooter.appendChild(containerEmulatorInsideFooterText);
        }

        // Aggiungi sempre le classi richieste
        containerEmulatorInsideFooterText.classList.add("badge", "bg-light", "text-gray");

        // Inserisci il testo
        containerEmulatorInsideFooterText.textContent = text;

        // Allinea il testo al centro
        containerEmulatorInsideFooterText.style.textAlign = "center";

        // Applica stili in base al testo
        switch (text) {
            case "Variazione":
                containerEmulatorInsideFooter.className = "containerEmulatorInsideFooter funzioneApplicativa containerEmulatorInsideFooterVariazione";
                containerEmulatorInsideHeader.classList.add("containerEmulatorInsideHeaderVariazione");
                break;
            case "Annullamento":
            case "Cancellazione":
                containerEmulatorInsideFooter.className = "containerEmulatorInsideFooter funzioneApplicativa containerEmulatorInsideFooterAnnullamentoCancellazione";
                containerEmulatorInsideHeader.classList.add("containerEmulatorInsideHeaderAnnullamentoCancellazione");
                break;
            case "Inserimento":
                containerEmulatorInsideFooter.className = "containerEmulatorInsideFooter funzioneApplicativa containerEmulatorInsideFooterInserimento";
                containerEmulatorInsideHeader.classList.add("containerEmulatorInsideHeaderInserimento");
                break;
            default:
                containerEmulatorInsideFooter.className = "containerEmulatorInsideFooter funzioneApplicativa";

                containerEmulatorInsideHeader.className = "containerEmulatorInsideHeader";
                break;
        }
    }
};

populateInsideHeaderSystem = function () {
    let divHeader = $('[id^=D_1_]');
    for (let i = 0; i < divHeader.length; i++) {
        if (divHeader[i].id.indexOf("_W") == -1) {
            divHeader[i].classList.add("rowHeader");
            divHeader[i].style.visibility = "hidden";
            divHeader[i].style.color = "var(--bs-dark)";
            if (i == 0) {
                divHeader[i].style.textAlign = "left";
            } else {
                if (i == divHeader.length - 1) {
                    divHeader[i].style.textAlign = "right";
                } else {
                    divHeader[i].style.textAlign = "center";
                }
            }
            divHeader[i].textContent = divHeader[i].textContent.trim();
        }
    }
    setIinsideHeaderTitle();
}

removeArrayElement = function (arrayElement, index) {
    menuInfoItems.splice($.inArray(arrayElement, index), 1);
}

createLabelDropDown = function (ulMenuInfoItems, label) {
    let elementOptionLabel = document.createElement("li");
    elementOptionLabel.textContent = label;
    elementOptionLabel.style.fontWeight = "bold";
    elementOptionLabel.classList.add("dropdown-item");
    elementOptionLabel.style.width = "auto";
    ulMenuInfoItems.append(elementOptionLabel);
}

createDropDownDriver = function (ulMenuInfoItems) {
    let element = document.createElement("li");
    element.innerHTML = '<div class="dropdown-divider"></div>';
    ulMenuInfoItems.append(element);
}



buildSwitchLabel = function () {
    let switchLabel = document.getElementById("componentSwitchLabel");
    if (switchLabel == null) {
        let containerSwitchLabel = document.createElement("div");
        containerSwitchLabel.setAttribute("id", "containerSwitchLabel");
        containerSwitchLabel.classList.add("containerSwitchLabel");
        switchLabel =
            '<div id="componentSwitchLabel" class="form-check form-check-inline">' +
            '<input id="optionSwtichLabel1" class="form-check-input optionSwitchLabel" type="radio" name="optionSwitchLabel" onclick="execSwitchLabel()" value="outLabel"/>' +
            '<label class="form-check-label" style="padding-left: 0.25rem for="optionSwtichLabel1">A</label>' +
            '</div>' +
            '<div id="componentSwitchLabel" class="form-check form-check-inline">' +
            '<input id="optionSwtichLabel2" class="form-check-input optionSwitchLabel" type="radio" name="optionSwitchLabel" onclick="execSwitchLabel()" value="middleLabel"/>' +
            '<label class="form-check-label" style="padding-left: 0.25rem for="optionSwtichLabel2">B</label>' +
            '</div>' +
            '<div id="componentSwitchLabel" class="form-check form-check-inline">' +
            '<input id="optionSwtichLabel3" class="form-check-input optionSwitchLabel" type="radio" name="optionSwitchLabel" onclick="execSwitchLabel()" value="insideLabel"/>' +
            '<label class="form-check-label" style="padding-left: 0.25rem for="optionSwtichLabel3">C</label>' +
            '</div>'
    }
    return switchLabel;
}

handleBackgroundRandom = function (containerEmulatorInside) {
    let backgroundImageUrl = imageUrl + 'wallpaper/';
    let currentImage = backgroundImageUrl + properties.backgroundImages[Math.floor(Math.random() * properties.backgroundImages.length)];
    lastImageBackground = currentImage;

    setBackgroundImage(currentImage, false, containerEmulatorInside);
}

setBackgroundImage = function (currentImage, opacity, containerEmulatorInside) {

    if (Boolean(opacity)) {
        containerEmulatorInside.style.background = "linear-gradient(rgba(195, 195, 195, 0.9), rgba(195, 195, 195, 0.9)), url('" + currentImage + "') ";

    } else {
        containerEmulatorInside.style.background = " url('" + currentImage + "') ";
    }

    containerEmulatorInside.style.backgroundSize = "cover";
    containerEmulatorInside.style.backgroundRepeat = "no-repeat";
    containerEmulatorInside.style.backgroundPosition = "center center";
}

handleBackgroundDefault = function (containerEmulatorInside) {
    containerEmulatorInside.style.backgroundColor = "var(--bs-background-color-lighter)";
    containerEmulatorInside.style.backgroundImage = "none";
    containerEmulatorInside.style.border = "0";
}

