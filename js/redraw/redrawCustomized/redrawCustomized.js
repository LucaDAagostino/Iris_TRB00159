redrawCustomized = function () {
    setRedrawCustomized.Off();

    let videoName = getProgramName?.name?.();



    const customRedrawMap = {
        I2900LB: redrawCustomized_I2900LB,
        I2935LB: redrawCustomized_I2935LB,
        RSCNMSG: redrawCustomized_RSCNMSG,
        R0002LB: redrawCustomized_RSCNMSG
    };

    if (customRedrawMap[videoName]) {
        redrawCustomizedBasic();
        customRedrawMap[videoName]();
    }

    if (!isRedrawCustomized) {
        videoName = null;
        const menuElement = document.getElementById(properties.idVideo);
        if (menuElement) {
            videoName = menuElement.textContent?.trim();
        }
        switch (videoName) {
            case 'MNUGEN':
                redrawCustomized_MNUGEN()
                break;
            case 'CHGENV00MP':
                redrawCustomized_CHGENV()
                break;
            default:
                break;
        }
    }

    if (!isRedrawCustomized) {
        document.getElementById("container5250Custom").remove();
    }
}

var setRedrawCustomized = {
    On: function () {
        getObj('5250').classList.add('isCustomized');
        isRedrawCustomized = true;
    },
    Off: function () {
        getObj('5250').classList.remove('isCustomized');
        isRedrawCustomized = false;
    }
}


redrawCustomizedBasic = function () {
    let fields = retrieveAllFields.rowColMap();

    let lastFieldRow = null;
    let iColumn = 0;
    let setNewContainer = true;
    let iField = 0;

    let isColumnFix = false;
    if (!Number.isNaN(properties.redrawGridColumn)) {
        if (properties.redrawGridColumn < 12) {
            isColumnFix = true;
        }
    }

    let containerElement = document.getElementById("5250");

    for (const [key, value] of fields) {
        let fieldRow = Number(key.substring(0, key.indexOf("_")));
        let fieldValue = value;

        iField++;
        fieldValue.classList.add("col");
        fieldValue.style.top = null;
        fieldValue.style.bottom = null;
        fieldValue.style.left = null;
        fieldValue.style.right = null;
        fieldValue.style.position = null;

        if (fieldValue.style.maxWidth == null || fieldValue.style.maxWidth == "") {
            fieldValue.style.maxWidth = fieldValue.style.width;
        }

        fieldValue.style.width = null;

        if (Boolean(isColumnFix)) {
            if (iField > properties.redrawGridColumn) {
                setNewContainer = true;
            }
        }

        if (lastFieldRow != fieldRow) {
            setNewContainer = true;
        }

        if (Boolean(setNewContainer)) {
            setNewContainer = false;
            iField = 1;

            if (lastFieldRow != fieldRow) {
                iColumn = 0;
            }

            let elementId = null;
            if (Boolean(isColumnFix)) {
                elementId = fieldRow + "_" + ++iColumn;
            } else {
                elementId = fieldRow;
            }

            containerElement = document.createElement("div");
            containerElement.id = "container5250_" + elementId;
            containerElement.className = "container5250"
            containerElement.setAttribute("name", "container5250");

            var rowElement = document.createElement("div");
            rowElement.id = "row5250_" + elementId;
            rowElement.className = "row justify-content-start align-items-center gy-2 gx-4";
            rowElement.setAttribute("name", "row5250");

            lastFieldRow = fieldRow;
        }

        if (containerElement != null) {
            rowElement.append(fieldValue);
            containerElement.append(rowElement);
            document.getElementById("5250").append(containerElement);
        }
    }
}