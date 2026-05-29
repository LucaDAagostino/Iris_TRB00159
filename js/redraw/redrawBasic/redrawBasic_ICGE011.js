redrawCustomized_ICGE011 = function () {
    // setRedrawCustomized.On();

    var divs5250 = document.getElementById("5250").getElementsByTagName("div");
    for (let i = 0; i < divs5250.length; i++) {
        let div = divs5250[i];

        var parentNode1 = div.parentNode;
        if (parentNode1 != null) {
            let parentNode2 = parentNode1.parentNode;
            if (parentNode2.id.indexOf("subfile") != -1) {
                div.classList.add("subfileFieldMonospace_ICGE011");
                if (div.className.includes("A22")) {
                    if (searchString(div.textContent, "Sld. Tot:")) {
                        parentNode1.classList.add("subfileTotali_ICGE011");
                    }
                }
            }
        }
    
        if (div.id == "D_9_2" || div.id == "D_9_6" || div.id == "D_9_10" || div.id == "D_9_16" || div.id == "D_9_28" || div.id == "D_9_45" || div.id == "D_9_60" || div.id == "D_9_77") {
            div.id = div.id + "_ICGE011";
            div.classList.add("labelMonospace"); 
        }
     
    }
}