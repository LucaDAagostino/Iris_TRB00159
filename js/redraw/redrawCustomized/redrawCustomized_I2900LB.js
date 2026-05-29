redrawCustomized_I2900LB = function () {
    setRedrawCustomized.On();

    let divs5250 = document.getElementById("5250").getElementsByTagName("div");
    let div5250Custom = document.getElementById("container5250Custom")
    let objectId = null;
    let object = null;

    // Rimuove il logo AppCore
    let rowFrom = 4;
    let rowTo = 10;
    for (let row = rowFrom; row <= rowTo; row++) {
        divs5250 = $('[id^=D_' + row + '_]');
        for (let i = 0; i < divs5250.length; i++) {
            let div = divs5250[i];
            div.remove();
        }
    }

    let container5250_I2900LB = createDiv("container5250_I2900LB", "container gx-0 gy-0");
    let currentImage = imageUrl + 'preventivo/Preventivo_1.jpg';
    container5250_I2900LB.style.backgroundImage = " url('" + currentImage + "') ";
    div5250Custom.appendChild(container5250_I2900LB);

    // let titolo = createLabel(null, "h2", "Preventivo", "titleCustom");
    // container5250_I2900LB.appendChild(titolo);

    /* Inserimento */
    object = getObjectByName('I2900LB00V_I2900LB01R_VDINSPRV');

    if(object) {
        let buttonDiv = createDiv("div5250_I2900LB_Inserimento", 'container text-end mt-4 mb-4');
        container5250_I2900LB.appendChild(buttonDiv);

        let button = createButton(null, "btn-primary btn-xl mt-2 mb-2", "F6", "Calcola preventivo", "fa fa-thin fa-calculator", ">", object.id, null);
        button.style.fontStyle = "1.5rem !important";
        button.style.height = "4rem !important";
        button.style.width = "10rem !important";
        buttonDiv.appendChild(button);
    }

  
    /* Toogle */
    let container5250_I2900LB_Toogle = createDiv("container5250_I2900LB_Toogle", "container");

    let row5250_I2900LB_Toogle_1 = createRow("row5250_I2900LB_Toogle_1", "no-gutters");

    object = getObjectByName('I2900LB00V_I2900LB01R_VDSELPRV');
    if(object) {
        let buttonDiv = createDiv(null, "col col-md-auto");
        let button = createButton(null, "btn-custom mt-2 mb-2", null, "Ricerca", "fa fa-search", null, null, null);
        button.style.width = "15rem"
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", "#container5250_I2900LB_Ricerca")
        button.setAttribute("aria-expanded", "false")
        button.setAttribute("aria-controls", "container5250_I2900LB_Ricerca")
        buttonDiv.appendChild(button);
        row5250_I2900LB_Toogle_1.appendChild(buttonDiv);
    }

    object = getObjectByName('I2900LB00V_I2900LB01R_VDSNDNOT');
    if(object) {
        let buttonDiv = createDiv(null, "col");
        let button = createButton(null, "btn-custom mt-2 mb-2", null, "Note", "fa-regular fa-note-sticky", null, null, null);
        button.style.width = "15rem"
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", "#container5250_I2900LB_GstNota")
        button.setAttribute("aria-expanded", "false")
        button.setAttribute("aria-controls", "container5250_I2900LB_GstNota")
        buttonDiv.appendChild(button);
        row5250_I2900LB_Toogle_1.appendChild(buttonDiv);
    }

    object = getObjectByName('I2900LB00V_I2900LB01R_VDAPPDER');
    if(object) {
        let buttonDiv = createDiv(null, "col col-md-auto");
        let button = createButton(null, "btn-custom mt-2 mb-2", "F6", "Approvazione deroghe", 'fa fa-solid fa-hammer', '>', object.id, null);
        buttonDiv.appendChild(button);
        row5250_I2900LB_Toogle_1.appendChild(buttonDiv);
    }
    
    container5250_I2900LB_Toogle.appendChild(row5250_I2900LB_Toogle_1);
    container5250_I2900LB.appendChild(container5250_I2900LB_Toogle);

    /* Ricerca Preventivo */
    let container5250_I2900LB_Ricerca = createDiv("container5250_I2900LB_Ricerca", "container collapse");
    let titoloRicerca = createSectionTitle("Ricerca preventivo");
    container5250_I2900LB_Ricerca.appendChild(titoloRicerca);

    let row5250_I2900LB_Ricerca_1 = createRow("row5250_I2900LB_Ricerca_1", "justify-content-start align-items-center gy-2 gx-4");
    let row5250_I2900LB_Ricerca_2 = createRow("row5250_I2900LB_Ricerca_2", "justify-content-start align-items-center gy-2 gx-4");
    let row5250_I2900LB_Ricerca_3 = createRow("row5250_I2900LB_Ricerca_3", "justify-content-start align-items-center gy-2 gx-4");

    object = getObjectByName('I2900LB00V_I2900LB01R_ANEMIPVO');
    if(object) {
        let element = createFloatingLabel(object.id, "Anno preventivo", "col-2");
        row5250_I2900LB_Ricerca_1.appendChild(element)
    }

    object = getObjectByName('I2900LB00V_I2900LB01R_NRPVO');
    if(object) {
        let element = createFloatingLabel(object.id, "Numero preventivo", "col-6");
        row5250_I2900LB_Ricerca_1.appendChild(element)
    }

    object = getObjectByName('I2900LB00V_I2900LB01R_NRCTRLOC');
    if(object) {
        let element = createFloatingLabel(object.id, "Numero contratto", "col-2");
        row5250_I2900LB_Ricerca_2.appendChild(element)
    }

    object = getObjectByName('I2900LB00V_I2900LB01R_VDSELPRV');
    if(object) {
        let buttonDiv = document.createElement('div');
        buttonDiv.style.display = "flex";
        buttonDiv.style.flexDirection = 'column'
        buttonDiv.classList = "col text-center";

        let button = createButton(null, "btn-custom mt-2 mb-2", "F6", "Ricerca avanzata", "fa fa-binoculars", ">", object.id, null);
        buttonDiv.appendChild(button);
        row5250_I2900LB_Ricerca_3.appendChild(buttonDiv);
    }

    container5250_I2900LB_Ricerca.appendChild(row5250_I2900LB_Ricerca_1);
    container5250_I2900LB_Ricerca.appendChild(row5250_I2900LB_Ricerca_2);
    container5250_I2900LB_Ricerca.appendChild(row5250_I2900LB_Ricerca_3);
    container5250_I2900LB.appendChild(container5250_I2900LB_Ricerca);
    
    /* Gestione nota*/
    let container5250_I2900LB_GstNota = createDiv("container5250_I2900LB_GstNota", "container collapse");
    
    let titoloGstNota = createSectionTitle("Note di preventivo");
    container5250_I2900LB_GstNota.appendChild(titoloGstNota);
    
    let row5250_I2900LB_GstNota_1 = createRow("row5250_I2900LB_GstNota_1", "justify-content-between no-gutters");

    object = getObjectByName('I2900LB00V_I2900LB01R_VDSNDNOT');
    if(object) {
        let buttonDiv = document.createElement('div');
        buttonDiv.classList = "col";

        let button = createButton(null, "btn-custom mt-2 mb-2", "F6", "Invia", "fa fa-solid fa-paper-plane", ">", object.id, null);
        buttonDiv.appendChild(button);
        row5250_I2900LB_GstNota_1.appendChild(buttonDiv);
    }

    object = getObjectByName('I2900LB00V_I2900LB01R_VDSPENOT');
    if(object) {
        let buttonDiv = document.createElement('div');
        buttonDiv.classList = "col col-md-auto";
        
        let button = createButton(null, "btn-custom mt-2 mb-2", "F6", "Inviate", "fa fa-regular fa-rectangle-list", ">", object.id, null);
        buttonDiv.appendChild(button);
        row5250_I2900LB_GstNota_1.appendChild(buttonDiv);
    }

    object = getObjectByName('I2900LB00V_I2900LB01R_VDSNDNOT');
    if(object) {
        let buttonDiv = document.createElement('div');
        buttonDiv.classList = "col col-md-auto";
        
        let button = createButton(null, "btn-custom mt-2 mb-2", "F6", "Da ricevere", "fa-solid fa-list-check", ">", object.id, null);
        buttonDiv.appendChild(button);
        row5250_I2900LB_GstNota_1.appendChild(buttonDiv);
    }

    object = getObjectByName('I2900LB00V_I2900LB01R_VDELNTRI');
    if(object) {
        let buttonDiv = document.createElement('div');
        buttonDiv.classList = "col col-md-auto";
        
        let button = createButton(null, "btn-custom mt-2 mb-2", "F6", "Ricevute", "fa fa-solid fa-list", ">", object.id, null);
        row5250_I2900LB_GstNota_1.appendChild(buttonDiv);
        buttonDiv.appendChild(button);
    }

    container5250_I2900LB_GstNota.appendChild(row5250_I2900LB_GstNota_1);
    container5250_I2900LB.appendChild(container5250_I2900LB_GstNota);


    /* Altro */
    let container5250_I2900LB_Altro = createDiv("container5250_I2900LB_Altro", null);
    container5250_I2900LB.appendChild(container5250_I2900LB_Altro);

    /* Nasconde elementi non considerati */
    clearContainer(document.getElementsByName('container5250'))
}