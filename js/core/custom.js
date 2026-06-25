// === Constants & globals ===
const TYPE_PROGRAM_APP_CORE = Object.freeze({ List: "L", Detail: "D", Window: "W" });
const APP_PREFIX = (properties?.nameAppCore || "Genie").toUpperCase() + "_"
const EXPORT_COUNT = 'exportCount';

var fn = {};
var skin = null;
var imageUrl = null;
var isSignon = false;
var isAppCore = false;
var isMenuAppCore = false;
var isMainMenuAppCore = false;
var isProgramAppCore = false;
var isWindowAppCore = false;
var typeProgramAppCore = null;
var isMenuSystem = false;
var isMenuSystemAppCore = false;
var isProgramAppCoreNewHeader = false;
var isInsideProgramAppCore = false;
var mainMenu = null;
var numberWindowAppCore = null;
var currentUsername = "";
var menuInfoItems = [];
var hideFKeyNames = false;
var row = null;
var offsetRow = null;
var column = null;
var breakpoint = null;
var arraySubfileOptions = [];
var backgroundImageRandom = false;
var lastProgramName = null;
var lastImageBackground = null;
var lastInsideHeaderTitleTextContent = null;
var idSideBarItemClick = null;
var lastButtonsFunctionKey = [];
var clickInRowSubfile = false;
var iEventListener = 0;
var showTypeLabel = null;
var lastContainerEmulatorOutside = null;
var userNameValidator = null;
var passwordValidator = null;
var isRedrawCustomized = false;
var isRedrawAdvanced = false;
var subfileStartRow = 0;
var subfileEndRow = 0;
var subfileStartMessage = 0;
var notificationMessage = properties.notificationMessage;
var duringNotificationMessage = false;
var disableNotificationMessage = false;
var partialNumberNotificationMessage = 0;
var totalNumberNotificationMessage = 0;
var messageRow = properties.messageRow;
let currentElementPosition = null;
let previousScreen = null;
let idMap = [];
let vantaEffect = null;

let arrayfirstLines = [];
let mapSubfile = null;
let currentPage = null;
let totalPages = null;
let isSuccessBGNIDSPF = false;


// === Lifecycle ===
function beforeLoad() {
    startLoader();

    detectEventListener();

    skin = pui.skin;
    imageUrl = '/profoundui/userdata/genie skins/' + skin + '/images/';

    pui["language"] = "it_IT";

    if (pui.genie.displaySize == 132) {
        row = 27
        column = 132
    } else {
        row = 24
        column = 80
    }

    mediaQueries();
    resetSideBar();
    resetWindow();
    resetEmulatorInside();
    vantaAnimationRemove();

}

function afterLoad() {
    forceScreen()

    stopLoader();

    pui["vertical button spacing"] = row;
    pui.genie.config.subfileStartLine = null;
    // pui.genie["include blank subfile columns"] = true;

    lastProgramName = getProgramName.name();

    if (properties.showPreviousScreen) {
        loadPreviousScreen();
    }

    setFontFamily();
    resizeArea();
    changeStyleElements();

    window.onresize = function () {
        mediaQueries();
        resizeArea();
    }

    if (properties.showPreviousScreen) {
        archiveCurrentScreen();
    }

    disableAutocomplete();
}

function customize() {
    initialize();
    login();
    prepareEnvironment();

    invokeWebService_BGNIATTR();
    navigationBar();
    if (isProgramAppCore || isWindowAppCore) {
        invokeWebService_BGNIDSPF();
    }
    setDetectSubfile();

    if (pui.genie.afterInit == null) {
        pui.genie.afterInit = function () {
            prepareEnvironmentAfterInit();
            header();
            body();
            footer();
            wrapTryCatch(redraw, { abort: false })();
            hideRemoveElements();
            setMainMenu();
            setupNotificationButton();
        }
    }
}

function forceScreen() {
    let containerEmulatorInsideBody = document.getElementById("containerEmulatorInsideBody");

    if (containerEmulatorInsideBody) {
        let cardSpoolFile = document.getElementById("cardSpoolFile")
        if (cardSpoolFile !== null) {
            containerEmulatorInsideBody.style.backgroundColor = "var(--bs-gray-200)";
        }
    }
}

initialize = function () {
    currentUsername = pui.appJob.user;
    sysName = pui.appJob.sysName;
    messageRow = properties.messageRow;
    pui.genie.config.detectSubfile = true;

    subfileStartRow = 0;
    subfileEndRow = 0;
    offsetRow = 0;

    if (pui.appJob.name === "") {
        let url = new URL(window.location.href);
        let params = new URLSearchParams(url.search);
        pui.appJob.name = params.get('workstnid');
    }

    if (getDataStorage("showConsoleLog", "local") !== null) {
        properties.showConsoleLog = getDataStorage("showConsoleLog", "local") === "true";
    }
}

changeStyleElements = function () {
    let elements = document.getElementById("containerMain").getElementsByTagName("div");
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        convertPx.elementStyle(element)
    }

    elements = document.getElementById("containerMain").getElementsByTagName("input");
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        convertPx.elementStyle(element)
    }

    elements = document.getElementById("containerMain").getElementsByTagName("iframe");
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        convertPx.elementAttributeNames(element)

        // Forzatura: iframe con rem inline riconosciuti come px nel CSS degli attributi
        element.style.width = "inherit"
        element.style.height = "inherit"
    }
}

// === jQuery-free rewrite ===
hideRemoveElements = function () {
    let divs = document.getElementById("5250").getElementsByTagName("div");
    for (let i = 0; i < divs.length; i++) {
        let div = divs[i];

        if (Boolean(isMenuAppCore)) {
            if (div.getAttribute("empty") == "true") {
                div.remove();
                i--;
            }
        }

        if (Boolean(isSignon)) {
            let textContent = div.textContent.trim();

            if (div.id == "D_" + row + "_1" && compareStrings(textContent, 'Accesso negato ai non autorizzati')) {
                div.remove();
                i--;
            }

            if (div.id == "D_" + row + "_47" && compareStrings(textContent, 'Access denied if not authorized')) {
                div.remove();
                i--;
            }
        }
    }

    if (Boolean(isMainMenuAppCore)) {
        let nameAppCore = properties.nameAppCore;

        let rowFrom = 4;
        let rowTo = 11;

        if (nameAppCore === "NSIL") {
            rowTo = 20;
        }

        // Rimuove il logo AppCore
        for (let r = rowFrom; r <= rowTo; r++) {
            document.querySelectorAll('[id^=D_' + r + '_]').forEach(el => el.remove());
        }
    }

    if (Boolean(isMenuAppCore || isMainMenuAppCore)) {
        // Definisce rowFrom e rowTo
        let rowFrom = 3;
        let rowTo = 3;

        for (let r = rowFrom; r <= rowTo; r++) {
            document.querySelectorAll('[id^=D_' + r + '_]:not(.label-pull-down-menu)')
                .forEach(el => { el.style.display = "none"; });
        }

        rowFrom = 18;
        rowTo = 20;
        for (let r = rowFrom; r <= rowTo; r++) {
            document.querySelectorAll('[id^=D_' + r + '_]:not(.label-pull-down-menu)')
                .forEach(el => el.remove());
        }
    }

    var rowTempA = row - 1;
    divs = document.querySelectorAll('[id^=D_' + rowTempA + '_]');
    divs.forEach(div => {
        if (div.textContent.trim() === "") {
            div.remove();
        }
    });

    var rowTempB = row - 2;
    divs = document.querySelectorAll('[id^=D_' + rowTempB + '_]');
    divs.forEach(div => {
        if (div.textContent.trim() === "") {
            div.remove();
        }
    });

    // Rimuove tutti gli elementi con classe .delMe
    document.querySelectorAll('.delMe').forEach(el => el.remove());
}

resetWindow = function () {
    let containerWindow = document.getElementById("containerWindow");
    if (containerWindow !== null) {
        let containerWindowElements = containerWindow.getElementsByTagName("div");
        for (let i = 0; i < containerWindowElements.length; i++) {
            let containerWindowElement = containerWindowElements[i];
            if (containerWindowElement.id.includes("window")) {
                // $("#"+id).remove() -> vanilla:
                containerWindowElement.remove();
            }
        }
    }
}

resizeArea = function () {
    let div5250 = getObj("5250");
    if (div5250 != null && div5250.style.width != "100%") {
        div5250.style.position = "relative";
        div5250.style.left = "";
        div5250.style.width = "100%";
    }

    let heightContainerHeader = null;
    const elHeader = document.getElementById("containerHeader");
    const elFooter = document.getElementById("containerFooter");
    if (Boolean(isSignon)) {
        heightContainerHeader = (elHeader ? elHeader.offsetHeight : 0) + "px";
    } else {
        const hH = elHeader ? elHeader.offsetHeight : 0;
        const hF = elFooter ? elFooter.offsetHeight : 0;
        heightContainerHeader = (hH + hF - 1) + "px";
    }

    let heightContainerMain = "calc(100% - " + heightContainerHeader + ")";
    const containerMain = document.getElementById("containerMain");
    if (containerMain) containerMain.style.height = heightContainerMain;

    let containerEmulatorInside = document.getElementById("containerEmulatorInside");
    containerEmulatorInside.style.width = null;
    containerEmulatorInside.style.marginLeft = null;
    containerEmulatorInside.style.height = null;

    if (Boolean(isProgramAppCore)) {
        if (Boolean(isRedrawCustomized)) {
            let containerSideBar = document.getElementById("containerSideBar");
            if (containerSideBar) containerSideBar.style.display = 'none';

            let containerBypass = document.getElementById("container5250_RSCNMSG");
            if (!containerBypass) {
                if (containerEmulatorInside) {
                    containerEmulatorInside.style.width = "70%";
                    containerEmulatorInside.style.height = "100%";
                    containerEmulatorInside.style.marginLeft = "15.5%";
                }
            }

            let containerEmulatorInsideHeader = document.getElementById("containerEmulatorInsideHeader");
            if (containerEmulatorInsideHeader) containerEmulatorInsideHeader.style.display = "none";

            let containerEmulatorInsideFooter = document.getElementById("containerEmulatorInsideFooter");
            if (containerEmulatorInsideFooter) containerEmulatorInsideFooter.style.display = "none";
        } else {
            // let containerEmulatorInsideBody = document.getElementById("containerEmulatorInsideBody");
            // containerEmulatorInsideBody.style.paddingLeft = "9vw";
            // containerEmulatorInsideBody.style.paddingRight = "9vw";
        }
    }
    // Non necessario perchè gestito con flex
    //resizeEmulatorInsideFooter();
}

resizeEmulatorInsideFooter = function () {
    let topEmulatorInsideFooter = 0;
    const footer = document.getElementById("containerEmulatorInsideFooter");
    const emulator = document.getElementById("containerEmulatorInside");
    const header = document.getElementById("containerEmulatorInsideHeader");
    const body = document.getElementById("containerEmulatorInsideBody");

    if (!footer || !emulator) return;

    footer.style.top = topEmulatorInsideFooter + "px";

    let overflowEmulatorInside =
        Math.ceil(emulator.scrollHeight) - Math.ceil(emulator.offsetHeight);
    let overEmulatorInsideBody = false;

    if ((Math.ceil(emulator.offsetHeight) - (footer ? footer.offsetHeight : 0)) <
        ((header ? Math.ceil(header.offsetHeight) : 0) + (body ? body.offsetHeight : 0))) {
        overEmulatorInsideBody = true;
    }

    if (overflowEmulatorInside != 0) {
        topEmulatorInsideFooter = emulator.scrollHeight + (footer ? footer.offsetHeight : 0);
    } else {
        if (overEmulatorInsideBody) {
            topEmulatorInsideFooter = emulator.scrollHeight;
        } else {
            topEmulatorInsideFooter = emulator.scrollHeight - (footer ? footer.offsetHeight : 0);
        }
    }
    footer.style.top = topEmulatorInsideFooter + "px";
}

prepareEnvironment = function () {
    hideFKeyNames = pui.genie.config.hideFKeyNames;

    showFunctionKeyClassic = true;

    const storedShowTypeLabel = getDataStorage("showTypeLabel", "local");
    if (storedShowTypeLabel === null) {
        setDataStorage("showTypeLabel", properties.typeLabel, "local");
    } else {
        showTypeLabel = storedShowTypeLabel;
    }

    const partialMaxNumberNotificationMessage = parseInt(properties.partialMaxNumberNotificationMessage, 10);

    if (lastProgramName !== getProgramName.name() || !duringNotificationMessage || disableNotificationMessage) {
        resetMessage();
        currentElementPosition = null;
    }
    if (partialNumberNotificationMessage >= partialMaxNumberNotificationMessage) {
        clearMessage();
        currentElementPosition = null;
    }

    // $("#containerEmulatorInsideHeader").attr("style","display: none") -> vanilla:
    const hdr = document.getElementById("containerEmulatorInsideHeader");
    const bdy = document.getElementById("containerEmulatorInsideBody");
    const ftr = document.getElementById("containerEmulatorInsideFooter");
    if (hdr) hdr.setAttribute("style", "display: none");
    if (bdy) bdy.setAttribute("style", "display: flex");
    if (ftr) ftr.setAttribute("style", "display: none");

    isMainMenuAppCore = false;
    isMenuAppCore = false;

    if (getLastMenuBar() != null) {
        isMenuAppCore = true;
    } else {
        if (getCurrentWindow() == null) {
            if (detectScreen(properties.mainMenuAppCoreId, properties.mainMenuAppCore) || detectScreen(properties.mainProgramAppCoreId, properties.mainProgramAppCore) || detectScreen(getProgramName.id(), properties.mainProgramAppCore) || (detectScreen(properties.mainAppCoreTag01Id, properties.mainAppCoreTag01) && detectScreen(properties.mainAppCoreTag02Id, properties.mainAppCoreTag02))) {
                isAppCore = true;
                isMenuAppCore = true;
                if (detectScreen(properties.mainMenuAppCoreId, properties.mainMenuAppCore)) {
                    isMainMenuAppCore = true;
                }
            } else {
                if (getDataStorage("mainMenu", "session") != null && getDataStorage("mainMenu", "session") != "") {
                    if (detectScreen(properties.mainMenuId, getDataStorage("mainMenu", "session"))) {
                        isAppCore = false;
                        isMenuAppCore = false;
                        isMainMenuAppCore = false;
                    }
                }
            }
        }
    }

    if (!isAppCore && getUrl.isAppCore()) {
        isAppCore = true;
    }

    //destroyLocalStorage();
    if (Boolean(isSignon)) {
        clearDataStorage("session")
    } else {
        if (!Boolean(isAppCore) || isMainMenuAppCore) {
            removeDataStorage("codeEnvironment", "session")
             removeDataStorage("prefixWs", "session")
            removeDataStorage("company", "session")
            removeDataStorage("environment", "session")
        }
    }

    if (Boolean(isMainMenuAppCore) && getLastMenuBar() == null) {
        if (getDataStorage("company", "session") == null) {
            const el = document.getElementById(properties.mainAppCoreTag01Value);
            setDataStorage("company", el ? el.textContent : "", "session");
        }
        if (!properties.invokeWs_BGNIATTR) {
            if (getDataStorage("environment", "session") == null) {
                const el2 = document.getElementById(properties.mainAppCoreTag02Value);
                setDataStorage("environment", el2 ? el2.textContent : "", "session");
            }
        }
    }

    isMenuSystem = false;
    isMenuSystemAppCore = false;
    let elements = document.querySelectorAll("[id^=D_][id$='_2']");
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        if (element.textContent == "===>") {
            isMenuSystem = true;
        }
        if (element.id == properties.mainMenuId) {
            let text = element.textContent;
            if (text.startsWith("GNI")) {
                isMenuSystemAppCore = true;
            }
        }
    }

    isProgramAppCore = false;
    isWindowAppCore = false;
    typeProgramAppCore = null;

    if (Boolean(isAppCore) && !Boolean(isMenuAppCore) && !Boolean(isMenuSystem) && !Boolean(isMenuSystemAppCore)) {
        let currentWindow = getCurrentWindow();
        if (currentWindow === null) {
            isProgramAppCore = true;
        } else {
            numberWindowAppCore = currentWindow.index;
            isWindowAppCore = true;
        }
    }

    isProgramAppCoreNewHeader = false;
    if (Boolean(isProgramAppCore) || Boolean(isWindowAppCore)) {
        if (Boolean(properties.invokeWs_BGNIDSPF) && isSuccessBGNIDSPF) {
            isProgramAppCoreNewHeader = true;
        }
    }
}

prepareEnvironmentAfterInit = function () {
    // 1) Tipo schermata
    if (typeProgramAppCore === null) {
        if (Boolean(isWindowAppCore)) {
            typeProgramAppCore = TYPE_PROGRAM_APP_CORE.Window;
        }
    }
    if (typeProgramAppCore === null) {
        if (isProgramAppCore) {
            if (getLastSubfile() != null) {
                typeProgramAppCore = TYPE_PROGRAM_APP_CORE.List;
            } else {
                typeProgramAppCore = TYPE_PROGRAM_APP_CORE.Detail;
            }
        }
    }

    // 2) Calcola start dinamico: (max fmttype=4) + 1
    const rowOffset = Math.max(0, Number(offsetRow ?? 0));
    const maxFmtRow = getMaxRowByFmtTypeDOM(4);
    const startFromRow = Math.max(0, (maxFmtRow ?? -1) + 1);

    // 3) Trova subfile (prima strutturale, poi fallback testuale >= startFromRow)
    if (subfileStartRow === 0) {
        let result = detectSubfileFromRow(
            undefined,          // maxRows
            undefined,          // maxColumns
            rowOffset,          // rowOffset
            1,                  // minMatches
            startFromRow        // startRow
        );

        if (!result?.subfile) {
            const t = detectSubfileFromTextLines();
            if (t?.subfile && t.subfile.start >= startFromRow) {
                result = t;
            }
        }

        if (result?.subfile) {
            const s = result.subfile.start;
            const e = result.subfile.end;

            if (Number.isFinite(s) && Number.isFinite(e) && s <= e) {
                subfileStartRow = Math.max(0, s);
                subfileEndRow = Math.max(0, e);
            } else {
                // niente subfile valida trovata
                subfileStartRow = 0;
                subfileEndRow = 0;
            }
        }
    }

    if (subfileEndRow === 0) {
        subfileEndRow = calculateSubfileEnd();
    }

    if (subfileStartRow === 0 && (offsetRow === 0 || offsetRow == null) && subfileEndRow !== 0) {
        const s = calculateSubfileStartByEnd();
        subfileStartRow = Math.max(startFromRow, s);
    }
};

setDetectSubfile = function () {
    if (properties.redraw && isSuccessBGNIDSPF) {
        pui.genie.config.detectSubfile = false;
    } else {
        pui.genie.config.detectSubfile = true;
    }
}

function setMainMenu() {
    if (getDataStorage("mainMenu", "session") === null) {
        let elem = document.getElementById("D_24_2");
        if (elem) {
            let text = elem.textContent.replace(/\s+/g, " ").trim();
            if (text.toUpperCase().includes("COPYRIGHT IBM")) {
                let e2 = document.getElementById(properties.mainMenuId);
                if (e2) {
                    setDataStorage("mainMenu", e2.textContent, "session")
                }
            }
        }
    }

    if (getDataStorage("mainMenu", "session") === null) {
        let elem = document.getElementById("D_19_2");
        if (elem) {
            let text = elem.textContent.replace(/\s+/g, " ").trim();
            if (text.toUpperCase().includes("Scelta o comando")) {
                let e2 = document.getElementById(properties.mainMenuId);
                if (e2) {
                    setDataStorage("mainMenu", e2.textContent, "session")
                }
            }
        }
    }
}

function disableAutocomplete() {
    document.querySelectorAll('input, textarea').forEach(el => {
        el.setAttribute('autocomplete', 'off');
    });
}

function removeAllSideBarContainers() {
    const items = document.querySelectorAll('div[id^="containerSideBarItem_"]');
    items.forEach(el => el.remove());
}