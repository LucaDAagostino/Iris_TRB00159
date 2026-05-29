redrawBasic_I0644LB = function () {
    // setRedrawCustomized.On();

    var divs5250 = document.getElementById("5250").getElementsByTagName("div");
    for (let i = 0; i < divs5250.length; i++) {
        let div = divs5250[i];

        var parentNode1 = div.parentNode;
        if (parentNode1 != null) {
            let parentNode2 = parentNode1.parentNode;
            if (parentNode2.id.indexOf("subfile") != -1) {
    
                div.classList.add("subfileFieldMonospace_I0644LB");
                if (div.className.includes("A22")) {
                    if (searchString(div.textContent, "Partita")) {
                        parentNode1.classList.add("subfileTotaliDiPartita_I0644LB");
                    } else {
                        parentNode1.classList.add("subfileTotali_I0644LB");
                    }
                }
            }
        }
    
        if (div.id == "D_11_2" || div.id == "D_11_7" || div.id == "D_11_17" || div.id == "D_11_40" || div.id == "D_11_50" || div.id == "D_11_68") {
            div.id = div.id + "_I0644LB";
            div.classList.add("labelMonospace");
        }
    }
}