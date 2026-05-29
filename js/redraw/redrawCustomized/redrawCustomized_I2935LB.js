redrawCustomized_I2935LB = function () {
    setRedrawCustomized.On();

    let div5250Custom = document.getElementById("container5250Custom")
    let numberProgressBar = 0
    let itemPhase = null;
    let itemPhaseActive = null;
    let itemColor = null;
    let itemColorActive = null;
    let timelineItemIdActive = null;

    let container5250_I2935LB = createDiv("container5250_I2935LB", "container gx-0 gy-0");
    div5250Custom.appendChild(container5250_I2935LB);

    /* NavbarPhase */
    handleNavbarPhase();

    /* Header */
    handleHeader();

    /* ProgressBar */
    handleProgressBar();

    /* Timeline */
    handleTimeline();

    /* Last operation*/
    updateProgressBar();
    updateNavbarPhase();

    /* Bottone back to top */
    handleBackToTop();

    /* Nasconde elementi non considerati */
    clearContainer(document.getElementsByName('container5250'))

    function handleBackToTop() {
        let buttonBackToTop = createButton("buttonBackToTop", "btn btn-danger btn-floating btn-lg mt-2 mb-2", null, null, "fas fa-arrow-up", null, null, null);
        buttonBackToTop.setAttribute("data-bs-toggle", "backtotop");
        container5250_I2935LB.appendChild(buttonBackToTop);
        buttonBackToTop.addEventListener("click", function (e) {
            containerMain = document.getElementById("containerMain");
            if (containerMain) {
                containerMain.scrollTop = 0;
            }
        });
    };

    function handleNavbarPhase() {
        let container5250_I2935LB_NavbarPhase = document.createElement('nav');
        container5250_I2935LB_NavbarPhase.id = "container5250_I2935LB_NavbarPhase";
        container5250_I2935LB_NavbarPhase.className = "navbar navbar-light bg-light mt-2 mb-2";
        container5250_I2935LB.appendChild(container5250_I2935LB_NavbarPhase);

        let navbarPhaseLink = document.createElement('a');
        navbarPhaseLink.id = "navbarPhaseLink"
        container5250_I2935LB_NavbarPhase.appendChild(navbarPhaseLink);
        navbarPhaseLink.href = "#";
        navbarPhaseLink.className = "navbar-brand";

        let navbarPhaseList = document.createElement('ul');
        navbarPhaseList.id = "navbarPhaseList";
        container5250_I2935LB_NavbarPhase.appendChild(navbarPhaseList);
        navbarPhaseList.className = "nav nav-pills";

        let navbarPhaseListItem = document.createElement('li');
        navbarPhaseListItem.id = "navbarPhaseListItem";
        navbarPhaseList.appendChild(navbarPhaseListItem);
        navbarPhaseListItem.className = "nav-item dropdown";

        let navbarPhaseListItemLink = document.createElement('a');
        navbarPhaseListItemLink.id = "navbarPhaseListItemLink"; 
        navbarPhaseListItem.appendChild(navbarPhaseListItemLink);
        navbarPhaseListItemLink.className = "nav-link dropdown-toggle";
        navbarPhaseListItemLink.setAttribute("data-bs-toggle", "dropdown");
        navbarPhaseListItemLink.href = "#";
        navbarPhaseListItemLink.setAttribute("data-bs-toggle", "dropdown");
        navbarPhaseListItemLink.setAttribute("role", "button");
        navbarPhaseListItemLink.setAttribute("aria-expanded", "false");
        navbarPhaseListItemLink.innerText = "Fase";
        navbarPhaseListItemLink.textAlign = "end";

        let navbarPhaseDropdownList = document.createElement('ul');
        navbarPhaseDropdownList.id = "navbarPhaseDropdownList";
        navbarPhaseListItem.appendChild(navbarPhaseDropdownList);
        navbarPhaseDropdownList.className = "dropdown-menu";
    }

    function handleHeader() {
        let container5250_I2935LB_Header = createDiv("container5250_I2935LB_Header", null);
        div5250Custom.appendChild(container5250_I2935LB_Header);

        container5250_I2935LB_Header.appendChild(createLabel(null, "h1", "Avanzamento contratto", "text-center mt-2 mb-3"));

        let row5250_I2935LB_Header_1 = createRow("row5250_I2935LB_Header_1", "row5250_I2935LB_Header justify-content-start align-items-center gy-2 gx-4");
        let row5250_I2935LB_Header_2 = createRow("row5250_I2935LB_Header_2", "row5250_I2935LB_Header justify-content-start align-items-center gy-2 gx-4");
        let row5250_I2935LB_Header_3 = createRow("row5250_I2935LB_Header_3", "row5250_I2935LB_Header justify-content-start align-items-center gy-2 gx-4");
        container5250_I2935LB_Header.appendChild(row5250_I2935LB_Header_1);
        container5250_I2935LB_Header.appendChild(row5250_I2935LB_Header_2);
        container5250_I2935LB_Header.appendChild(row5250_I2935LB_Header_3);
        container5250_I2935LB.appendChild(container5250_I2935LB_Header);

        object = getObjectByName('I2935LB00V_I2935LB01D_DSCMCLI');
        if (object) {
            let element = createFloatingLabel(object.id, "Cliente", "col-6 col-I2935LB-Header");
            row5250_I2935LB_Header_1.appendChild(element)
        }

        object = getObjectByName('I2935LB00V_I2935LB01D_DSNOMPRD');
        if (object) {
            let element = createFloatingLabel(object.id, "Prodotto", "col-6 col-I2935LB-Header");
            row5250_I2935LB_Header_1.appendChild(element)
        }

        object = getObjectByName('I2935LB00V_I2935LB01D_DSCMPRE');
        if (object) {
            let element = createFloatingLabel(object.id, "Presentatore", "col-6 col-I2935LB-Header");
            row5250_I2935LB_Header_2.appendChild(element)
        }

        object = getObjectByName('I2935LB00V_I2935LB01D_CDRAPBAN');
        if (object) {
            let element = createFloatingLabel(object.id, "Rapporto", "col-6 col-I2935LB-Header");
            row5250_I2935LB_Header_2.appendChild(element)
        }

        object = getObjectByName('I2935LB00V_I2935LB01R_ANEMIPVO');
        if (object) {
            objectAdd = getObjectByName('I2935LB00V_I2935LB01R_NRPVO');
            if (objectAdd) {
                object.textContent = object.textContent + " - " + objectAdd.textContent;
            }
            let element = createFloatingLabel(object.id, "Preventivo", "col-6 col-I2935LB-Header");
            row5250_I2935LB_Header_3.appendChild(element)
        }

        object = getObjectByName('I2935LB00V_I2935LB01R_NRCTRLOC');
        if (object) {
            let element = createFloatingLabel(object.id, "Contratto", "col-6 col-I2935LB-Header");
            row5250_I2935LB_Header_3.appendChild(element)
        }
    }

    function handleProgressBar() {
        let container5250_I2935LB_ProgressBar = createDiv("container5250_I2935LB_progressBar", "progressBarContainer");
        container5250_I2935LB_ProgressBar.id = "container5250_I2935LB_ProgressBar";
        let div5250_I2935LB_ProgressBar = createDiv("div5250_I2935LB_progressBar", "progress-bar");
        div5250_I2935LB_ProgressBar.id = "div5250_I2935LB_ProgressBar";
        container5250_I2935LB_ProgressBar.appendChild(div5250_I2935LB_ProgressBar)
        container5250_I2935LB.appendChild(container5250_I2935LB_ProgressBar);
    }

    function handleTimeline() {
        let container5250_I2935LB_Timeline = createDiv("container5250_I2935LB_Timeline", "timelineContainer");
        container5250_I2935LB.appendChild(container5250_I2935LB_Timeline);

        container5250_I2935LB_Timeline.setAttribute("data-bs-spy", "scroll");
        container5250_I2935LB_Timeline.setAttribute("data-bs-offset", "0");
        container5250_I2935LB_Timeline.setAttribute("data-bs-target", "#container5250_I2935LB_NavbarPhase");
        container5250_I2935LB_Timeline.classList.add("scrollspy-example");
        container5250_I2935LB_Timeline.tabIndex = "0";

        let timelineList = createList("div5250_I2935LB_TimelineList", "timelineList");
        container5250_I2935LB_Timeline.appendChild(timelineList);

        let timelineItem = null;

        timelineItem = appendList(null, "timelineItem timelineItemDummy", null, "div5250_I2935LB_TimelineList");
        timelineList.appendChild(timelineItem);

        timelineItem = appendList(null, "timelineItem timelineItemDummy", null, "div5250_I2935LB_TimelineList");
        timelineList.appendChild(timelineItem);

        /* Timeline | Preventivo */
        itemPhase = "Preventivo";
        itemColor = "#41516C"
        timelineItem = appendTimelineItem("Preventivo", "timelineItem", itemPhase, null, "--accent-color:" + itemColor);
        appendNavbarPhaseDropdownItem(null, null, timelineItem);

        timelineItemIdActive = timelineItem.id;
        let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase");
        timelineItemPhase[0].classList.add("timelineItemPhaseActive");
        numberProgressBar++;
        itemPhaseActive = itemPhase;
        itemColorActive = itemColor;


        object = getObjectByName('I2935LB00V_I2935LB01R_VDPVVIS');
        if (object) {
            appendTimelineItemButton(timelineItem, object, "Visualizza", "fa fa-regular fa-eye", null);
        }

        object = getObj('D_4_44');
        if (object != null && object.textContent == 'Varia') {
            object = getObj('I_4_50');
            if (object) {
                appendTimelineItemButton(timelineItem, object, "Varia", "fa fa-regular fa-pen-to-square", null);
            }
        }

        object = getObj('D_4_44');
        if (object != null && object.textContent == 'Copia') {
            object = getObj('I_4_50');
            if (object) {
                appendTimelineItemButton(timelineItem, object, "Copia", "fa fa-regular fa-copy", null);
            }
        }

        object = getObjectByName('I2935LB00V_I2935LB01R_VDPVPRT');
        if (object) {
            appendTimelineItemButton(timelineItem, object, "Stampa", "fa fa-solid fa-print", null);
        }

        object = getObjectByName('I2935LB00V_I2935LB01R_VDSPENOT');
        if (object) {
            appendTimelineItemButton(timelineItem, object, "Note", "fa fa-regular fa-note-sticky", null);
        }

        object = getObjectByName('I2935LB00V_I2935LB01R_VDDERPVO');
        if (object) {
            appendTimelineItemButton(timelineItem, object, "Deroghe", "fa fa-solid fa-hammer", null);
        }

        /* Timeline | Contratto */
        itemPhase = "Contratto";
        itemColor = "#00acc1"
        timelineItem = appendTimelineItem("Contratto", "timelineItem timelineItemDisable", itemPhase, null, "--accent-color:" + itemColor);
        appendNavbarPhaseDropdownItem(null, null, timelineItem);
        
        let enableItemContratto = Boolean(getObjectByName('I2935LB00V_I2935LB01R_VDINCTR'));
        if (enableItemContratto) {
            timelineItemIdActive = timelineItem.id;
            numberProgressBar++;
            itemPhaseActive = itemPhase;
            itemColorActive = itemColor;


            timelineItem.classList.remove("timelineItemDisable");
            let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
            timelineItemPhase[0].classList.add("timelineItemPhaseActive");

            object = getObjectByName('I2935LB00V_I2935LB01R_VDINCTR');
            if (object) {
                let label = getObj('D_5_27');
                let popover = getObjectByName('I2935LB00V_I2935LB01R_VDDSCTR').textContent;
                appendTimelineItemButton(timelineItem, object, label.textContent, null, popover);
            }
        }

        /* Timeline | Completamento contratto */
        itemPhase = "Completamento contratto";
        itemColor = "#E24A68"
        timelineItem = appendTimelineItem("CompletamentoContratto", "timelineItem timelineItemDisable", itemPhase, null, "--accent-color:" + itemColor);
        appendNavbarPhaseDropdownItem(null, null, timelineItem);

        let CompletamentoContratto = Boolean(getObjectByName('I2935LB00V_I2935LB01R_VDINCOMP'));
        if (CompletamentoContratto) {
            timelineItemIdActive = timelineItem.id;
            numberProgressBar++;
            itemPhaseActive = itemPhase;
            itemColorActive = itemColor;


            timelineItem.classList.remove("timelineItemDisable");
            let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
            timelineItemPhase[0].classList.add("timelineItemPhaseActive");

            object = getObjectByName('I2935LB00V_I2935LB01R_VDDETBEN');
            if (object) {
                appendTimelineItemButton(timelineItem, object, "Beni", null, null);
            }

            object = getObjectByName('I2935LB00V_I2935LB01R_VDINGAR');
            if (object) {
                let popover = getObjectByName('I2935LB00V_I2935LB01R_VDGAR').textContent + ' - ' + getObjectByName('I2935LB00V_I2935LB01R_VDDSGAR').textContent;
                appendTimelineItemButton(timelineItem, object, "Garanzie", null, popover);
            }

            object = getObjectByName('I2935LB00V_I2935LB01R_VDINCOMP');
            if (object) {
                let popover = getObjectByName('I2935LB00V_I2935LB01R_VDCOMP').textContent + ' - ' + getObjectByName('I2935LB00V_I2935LB01R_VDDSCOMP').textContent;
                appendTimelineItemButton(timelineItem, object, "Completamento", null, popover);
            }

            object = getObjectByName('I2935LB00V_I2935LB01R_VDINSTHF');
            if (object) {
                appendTimelineItemButton(timelineItem, object, "Riepilogo", null, null);
            }

            object = getObjectByName('I2935LB00V_I2935LB01R_VDANNCTR');
            if (object) {
                appendTimelineItemButton(timelineItem, object, "Annullamento", null, null);
            }
        }

        /* Timeline | Fine caricamento contratto */
        itemPhase = "Fine caricamento contratto";
        itemColor = "#1B5F8C"
        timelineItem = appendTimelineItem("FineCaricamentoContratto", "timelineItem timelineItemDisable", itemPhase, null, "--accent-color:" + itemColor);
        appendNavbarPhaseDropdownItem(null, null, timelineItem);

        let enableItemFineCaricamentoContratto = Boolean(getObjectByName('I2935LB00V_I2935LB01R_VDINGHF'));
        if (enableItemFineCaricamentoContratto) {
            timelineItemIdActive = timelineItem.id;
            numberProgressBar++;
            itemPhaseActive = itemPhase;
            itemColorActive = itemColor;


            timelineItem.classList.remove("timelineItemDisable");
            let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
            timelineItemPhase[0].classList.add("timelineItemPhaseActive");

            object = getObjectByName('I2935LB00V_I2935LB01R_VDINGHF');
            if (object) {
                let label = getObjectByName('I2935LB00V_I2935LB01R_VDGESTHF');
                appendTimelineItemButton(timelineItem, object, label.textContent, null, null);
            }

            object = getObjectByName('I2935LB00V_I2935LB01R_VARFIRM');
            if (object) {
                let popover = "Variazione firmatari";
                appendTimelineItemButton(timelineItem, object, "Firmatari", null, popover);
            }

            object = getObjectByName('I2935LB00V_I2935LB01R_VARTEL');
            if (object) {
                let popover = "Variazione recapiti telefonici";
                appendTimelineItemButton(timelineItem, object, "Targa", null, popover);
            }

            object = getObjectByName('I2935LB00V_I2935LB01R_VARBAN');
            if (object) {
                let popover = "Variazione adddebito";
                appendTimelineItemButton(timelineItem, object, "Addebito", null, popover);
            }
        }

        /* Timeline | Istruttoria */
        itemPhase = "Istruttoria";
        itemColor = "#4CADAD"
        timelineItem = appendTimelineItem("Istruttoria", "timelineItem timelineItemDisable", itemPhase, null, "--accent-color:" + itemColor);
        appendNavbarPhaseDropdownItem(null, null, timelineItem);

        let enableItemIstruttoria = Boolean(getObj('D_10_3'));
        if (enableItemIstruttoria) {
            timelineItemIdActive = timelineItem.id;
            numberProgressBar++;
            itemPhaseActive = itemPhase;
            itemColorActive = itemColor;


            timelineItem.classList.remove("timelineItemDisable");
            let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
            timelineItemPhase[0].classList.add("timelineItemPhaseActive");

            object = getObj('D_10_3');
            if (object) {
                let popover = getObj('D_10_18').textContent + " - " + getObj('D_10_32').textContent;
                let timelineItemButton = appendTimelineItemButton(timelineItem, object, "Istruttoria clienti", null, popover);
                if (!getObjectByName('I2935LB00V_I2935LB01R_VDINICLI')) {
                    timelineItemButton.disabled = "true";
                    timelineItemButton.classList.add("timelineItemButtonDisabled");
                };
            }

            object = getObj('D_11_3');
            if (object) {
                let popover = getObj('D_11_18').textContent + " - " + getObj('D_11_32').textContent;
                let timelineItemButton = appendTimelineItemButton(timelineItem, object, "Istruttoria beni", null, popover);
                if (!getObjectByName('I2935LB00V_I2935LB01R_VDINIBEN')) {
                    timelineItemButton.disabled = "true";
                    timelineItemButton.classList.add("timelineItemButtonDisabled");
                };
            }

            object = getObj('D_12_3');
            if (object) {
                let popover = getObj('D_12_18').textContent + " - " + getObj('D_12_32').textContent;
                let timelineItemButton = appendTimelineItemButton(timelineItem, object, "Istruttoria commerciale", null, popover);
                if (!getObjectByName('I2935LB00V_I2935LB01R_VDINIAGE')) {
                    timelineItemButton.disabled = "true";
                    timelineItemButton.classList.add("timelineItemButtonDisabled");
                };
            }

            object = getObj('D_13_3');
            if (object) {
                let popover = getObj('D_13_18').textContent + " - " + getObj('D_13_32').textContent;
                let timelineItemButton = appendTimelineItemButton(timelineItem, object, "Istruttoria fidi", null, popover);
                if (!getObjectByName('I2935LB00V_I2935LB01R_VDINIFID')) {
                    timelineItemButton.disabled = "true";
                    timelineItemButton.classList.add("timelineItemButtonDisabled");
                };
            }
        }

        /* Timeline | Delibera */
        itemPhase = "Delibera";
        itemColor = "#86977B"
        timelineItem = appendTimelineItem("Delibera", "timelineItem timelineItemDisable", itemPhase, null, "--accent-color:" + itemColor);
        appendNavbarPhaseDropdownItem(null, null, timelineItem);

        let enableItemDelibera = Boolean(getObjectByName('I2935LB00V_I2935LB01R_VDINDEL'));
        if (enableItemDelibera) {
            timelineItemIdActive = timelineItem.id;
            numberProgressBar++;
            itemPhaseActive = itemPhase;
            itemColorActive = itemColor;


            timelineItem.classList.remove("timelineItemDisable");
            let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
            timelineItemPhase[0].classList.add("timelineItemPhaseActive");

            object = getObjectByName('I2935LB00V_I2935LB01R_VDINDEL');
            if (object) {
                let popover = getObjectByName('I2935LB00V_I2935LB01R_VDDEL').textContent;
                timelineItemButton = appendTimelineItemButton(timelineItem, object, "Delibera", null, popover);
            }
        }

        /* Timeline | Emissione contratto */
        itemPhase = "Emissione contratto";
        itemColor = "#B295BF"
        timelineItem = appendTimelineItem("EmissioneContratto", "timelineItem timelineItemDisable", itemPhase, null, "--accent-color:" + itemColor);
        appendNavbarPhaseDropdownItem(null, null, timelineItem);

        let enableItemEmissioneContratto = Boolean(getObjectByName('I2935LB00V_I2935LB01R_VDINSTPDEL'));
        if (enableItemEmissioneContratto) {
            timelineItemIdActive = timelineItem.id;
            numberProgressBar++;
            itemPhaseActive = itemPhase;
            itemColorActive = itemColor;

            timelineItem.classList.remove("timelineItemDisable");
            let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
            timelineItemPhase[0].classList.add("timelineItemPhaseActive");

            object = getObjectByName('I2935LB00V_I2935LB01R_VDINSTPDEL');
            if (object) {
                timelineItemButton = appendTimelineItemButton(timelineItem, object, "Stampa contratto", null, null);
            }
        }


        /* Timeline | Stipula */
        itemPhase = "Stipula";
        itemColor = "#E3876B"
        timelineItem = appendTimelineItem("Stipula", "timelineItem timelineItemDisable", itemPhase, null, "--accent-color:" + itemColor);
        appendNavbarPhaseDropdownItem(null, null, timelineItem);

        let enableItemStipula = Boolean(getObjectByName('I2935LB00V_I2935LB01R_VDINSTP'));
        if (enableItemStipula) {
            timelineItemIdActive = timelineItem.id;
            numberProgressBar++;
            itemPhaseActive = itemPhase;
            itemColorActive = itemColor;


            timelineItem.classList.remove("timelineItemDisable");
            let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
            timelineItemPhase[0].classList.add("timelineItemPhaseActive");

            object = getObjectByName('I2935LB00V_I2935LB01R_VDINSTP');
            if (object) {
                popover = getObjectByName('I2935LB00V_I2935LB01R_VDSTP').textContent;
                timelineItemButton = appendTimelineItemButton(timelineItem, object, "Stipula", null, popover);
            }

            object = getObjectByName('I2935LB00V_I2935LB01R_VDANNSTP')
            if (object) {
                popover = getObj('D_19_32').textContent;
                timelineItemButton = appendTimelineItemButton(timelineItem, object, "Annullamento", null, popover);
            }
        }

        /* Timeline | Messa a reddito */
        itemPhase = "Messa a reddito";
        itemColor = "#70A1B5"
        timelineItem = appendTimelineItem("MessaAReddito", "timelineItem timelineItemDisable", itemPhase, null, "--accent-color:" + itemColor);
        appendNavbarPhaseDropdownItem(null, null, timelineItem);

        let enableItemMessaAReddito = Boolean(getObjectByName('I2935LB00V_I2935LB01R_VDINMESRED'));
        if (enableItemMessaAReddito) {
            timelineItemIdActive = timelineItem.id;
            numberProgressBar++;
            itemPhaseActive = itemPhase;
            itemColorActive = itemColor;


            timelineItem.classList.remove("timelineItemDisable");
            let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
            timelineItemPhase[0].classList.add("timelineItemPhaseActive");

            object = getObjectByName('I2935LB00V_I2935LB01R_VDINMESRED');
            if (object) {
                popover = getObjectByName('I2935LB00V_I2935LB01R_VDMRED').textContent
                appendTimelineItemButton(timelineItem, object, "Messa a reddito", null, popover);
            }

            object = getObjectByName('I2935LB00V_I2935LB01R_VDANNMAR');
            if (object) {
                appendTimelineItemButton(timelineItem, object, "Annullamento", null, null);
            }
        }

        /* Timeline | Pagamenti e incassi */
        itemPhase = "Pagamenti ed incassi";
        itemColor = "#70A1B5"
        timelineItem = appendTimelineItem("PagamentiEdIincassi", "timelineItem timelineItemDisable", itemPhase, null, "--accent-color:" + itemColor);
        appendNavbarPhaseDropdownItem(null, null, timelineItem);

        let enableItemPagamentiEdIincassi = Boolean(getObjectByName('I2935LB00V_I2935LB01R_VDINLIQ'));
        if (enableItemPagamentiEdIincassi) {
            timelineItemIdActive = timelineItem.id;
            numberProgressBar++;
            itemPhaseActive = itemPhase;
            itemColorActive = itemColor;


            timelineItem.classList.remove("timelineItemDisable");
            let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
            timelineItemPhase[0].classList.add("timelineItemPhaseActive");

            object = getObjectByName('I2935LB00V_I2935LB01R_VDINLIQ');
            if (object) {
                appendTimelineItemButton(timelineItem, object, "Liquidazione", null, null);
            }
        }

        /* Abilita fasi forzatamente */
        if ((!enableItemFineCaricamentoContratto) && (enableItemIstruttoria)) {
            let timelineItem = document.getElementById("timelineItemFineCaricamentoContratto");
            if (timelineItem) {
                numberProgressBar++;
                enableItemFineCaricamentoContratto = Boolean(true);
                timelineItem.classList.remove("timelineItemDisable");
                let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
                timelineItemPhase[0].classList.add("timelineItemPhaseActive");
            }
        }

        if ((!enableItemEmissioneContratto) && (enableItemStipula)) {
            let timelineItem = document.getElementById("timelineItemEmissioneContratto");
            if (timelineItem) {
                numberProgressBar++;
                enableItemEmissioneContratto = Boolean(true);
                timelineItem.classList.remove("timelineItemDisable");
                let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
                timelineItemPhase[0].classList.add("timelineItemPhaseActive");
            }
        }
    }

    function updateProgressBar() {
        let percentProgressBar = numberProgressBar * 10 + "%";
        let div5250_I2935LB_ProgressBar = document.getElementById("div5250_I2935LB_ProgressBar");
        div5250_I2935LB_ProgressBar.style.width = percentProgressBar;
        div5250_I2935LB_ProgressBar.style.backgroundColor = itemColorActive;

        div5250_I2935LB_ProgressBar.innerText = " " + percentProgressBar + " " + itemPhaseActive;
        div5250_I2935LB_ProgressBar.setAttribute("aria-valuenow", percentProgressBar);
        div5250_I2935LB_ProgressBar.setAttribute("aria-valuemin", "0");
        div5250_I2935LB_ProgressBar.setAttribute("aria-valuemax", "100");
        div5250_I2935LB_ProgressBar.setAttribute("role", "progressbar");

        div5250_I2935LB_ProgressBar.style.cursor = "pointer";
        div5250_I2935LB_ProgressBar.onclick = function (e) {
            document.getElementById(timelineItemIdActive).scrollIntoView();
        }
    };

    function updateNavbarPhase() {
        let navbarPhaseDropdownList = document.getElementById("navbarPhaseDropdownList");
        if (navbarPhaseDropdownList) {
            navbarPhaseDropdownItems = navbarPhaseDropdownList.getElementsByTagName("a");
            for (let i = 0; i < navbarPhaseDropdownItems.length; i++) {
                let navbarPhaseDropdownItem = navbarPhaseDropdownItems[i];

                if (navbarPhaseDropdownItem.getAttribute("timelineItemId") == timelineItemIdActive) {
                    navbarPhaseDropdownItem.classList.add("navbarPhaseDropdownItemActive")
                } else {
                    let timelineItem = document.getElementById(navbarPhaseDropdownItem.getAttribute("timelineItemId"))
                    if (timelineItem && timelineItem.classList.contains('timelineItemDisable')) {
                        navbarPhaseDropdownItem.classList.add("navbarPhaseDropdownItemDisabled")
                    }
                }
            }
        }
    }

    function appendTimelineItem(itemId, itemClass, itemPhase, itemDescription, itemStyle) {
        let timelineList = document.getElementById("div5250_I2935LB_TimelineList");
        let timelineItem = null;

        timelineItem = appendList("timelineItem" + itemId, itemClass, null, "div5250_I2935LB_TimelineList");

        timelineItem.appendChild(createDiv("timelineItem" + itemId + "Phase", "timelineItemPhase", itemPhase));
        timelineItem.appendChild(createDiv("timelineItem" + itemId + "Description", "timelineItemDescription", itemDescription));
        timelineItem.appendChild(createRow("timelineItem" + itemId + "Row", "timelineItemRow d-flex flex-row justify-content-between no-gutters"));
        timelineItem.setAttribute("style", itemStyle);
        timelineList.appendChild(timelineItem);

        return timelineItem;
    }

    function appendTimelineItemButton(timelineItem, object, testo, icona, popover) {
        if (!object) return null;
        if (!timelineItem) return null;

        let timelineItemButtonDiv = document.createElement('div');
        timelineItemButtonDiv.classList = "col col-md-auto";

        let timelineItemButton = createButton(null, "btn-custom mt-2 mb-2 timelineItemButton", "F6", testo, icona, ">", object.id, popover);

        timelineItemButtonDiv.appendChild(timelineItemButton);

        let timelineItemRow = document.getElementById(timelineItem.id + "Row")
        timelineItemRow.appendChild(timelineItemButtonDiv);

        return timelineItemButton
    }

    function appendNavbarPhaseDropdownItem(id, classe, timelineItem) {
        if (!timelineItem) return null;

        let navbarPhaseDropdownList = document.getElementById("navbarPhaseDropdownList");
        if (!navbarPhaseDropdownList) return null;

        let timelineItemPhase = timelineItem.getElementsByClassName("timelineItemPhase")
        if (!timelineItemPhase) return null;

        let navbarPhaseDropdownItem = document.createElement('li');
        navbarPhaseDropdownList.appendChild(navbarPhaseDropdownItem);

        if (id) navbarPhaseDropdownItem.id = id;
        if (classe) navbarPhaseDropdownItem.className = classe;

        let navbarPhaseDropdownItemLink = document.createElement('a');
        navbarPhaseDropdownItem.appendChild(navbarPhaseDropdownItemLink);

        navbarPhaseDropdownItemLink.setAttribute("timelineItemId", timelineItem.id)
        navbarPhaseDropdownItemLink.className = "dropdown-item";
        navbarPhaseDropdownItemLink.href = "#" + timelineItem.id;
        navbarPhaseDropdownItemLink.innerText = timelineItemPhase[0].textContent;
        navbarPhaseDropdownItemLink.style.width = "auto";
        navbarPhaseDropdownItemLink.style.minWidth = "15rem";
        navbarPhaseDropdownItemLink.style.textAlign = "end";

        return navbarPhaseDropdownItem
    }
}

