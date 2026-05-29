redrawBasic_I0401LB = function () {
    setRedrawCustomized.On();

    let url = null;
    
    let obj_I_9_15 = getObj("I_9_15");
    let obj_I_12_24 = getObj("I_12_24");
    let obj_I_13_24 = getObj("I_13_24");
    let obj_I_10_15 = getObj("I_10_15");

    let backgroundCursorUrl = '/profoundui/userdata/genie skins/' + skin + '/images/cursor/google.png';
    let searchStringGoogle = "";

    if (obj_I_12_24 != null && obj_I_12_24.value.trim() != "") {
        searchStringGoogle += encodeURIComponent(obj_I_12_24.value.trim());
    }

    if (obj_I_13_24 != null && obj_I_13_24.value.trim() != "") {
        searchStringGoogle += encodeURIComponent(obj_I_13_24.value.trim());
    }

    if (obj_I_9_15 != null && obj_I_9_15.value.trim() != "") {
        searchStringGoogle += encodeURIComponent(obj_I_9_15.value.trim());
    }

    if (obj_I_10_15 != null && obj_I_10_15.value.trim() != "") {
        searchStringGoogle += encodeURIComponent(obj_I_10_15.value.trim());
    }

    if (searchStringGoogle != null) {
        url = "https://www.google.it/search?q=" + searchStringGoogle + "&tbm=isch";

        if (obj_I_12_24.value != "") {
            obj_I_12_24.style.cursor = " url('" + backgroundCursorUrl + "') , auto";
            addEventUrl(obj_I_12_24, url);
        }

        if (obj_I_13_24.value != "") {
            obj_I_13_24.style.cursor = " url('" + backgroundCursorUrl + "') , auto";
            addEventUrl(obj_I_13_24, url);
        }

        if (obj_I_9_15.value != "") {
            obj_I_9_15.style.cursor = " url('" + backgroundCursorUrl + "') , auto";
            addEventUrl(obj_I_9_15, url);
        }

        if (obj_I_10_15.value != "") {
            obj_I_10_15.style.cursor = " url('" + backgroundCursorUrl + "') , auto";
            addEventUrl(obj_I_10_15, url);
        }
    }
}