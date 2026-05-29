handleJsonView = function () {
    if (pui.savedJSON != null) {
        var json = pui.savedJSON;

        if (typeof JSON === "object" && typeof JSON.parse === "function" && typeof JSON.stringify === "function")
            try {
                var containermodalFixed = document.getElementById("containerJsonView");

                if (containermodalFixed == null) {
                    containermodalFixed = document.createElement("div");
                    containermodalFixed.id = "containerJsonView";
                    containermodalFixed.className = "modalFixed";
                    containermodalFixed.classList.add("modal");
                    containermodalFixed.style.display = "block";

                    var jsonView = document.createElement("div");
                    jsonView.id = "jsonView";
                    jsonView.className = "modalFixed-content";
                    jsonView.classList.add("modal-content");

                    containermodalFixed.append(jsonView);

                    document.getElementById("containerMain").append(containermodalFixed);
                } else {
                    containermodalFixed.style.display = "block";
                }

                $("#jsonView").empty();
                $("#jsonView").JSONView(json, { collapsed: true, nl2br: true, recursive_collapser: true });

                $("#containerFunctionKey").css("visibility", "hidden");

                window.onclick = function (event) {
                    if (event.target.id != "" && event.target.id == "containerJsonView") {
                        containermodalFixed.style.display = "none";
                        $("#containerFunctionKey").css("visibility", "visible");
                    }
                };
            } catch (error) {
                alert("Error json view: " + error);
            }
    }
};