var getProgramName = {
    id: function () {
        const fields = retrieveAllFields.structuredList();
        if (!fields || fields.length === 0) return null;

        let filteredFields;

        if (isWindowAppCore) {
            const currentWindow = getCurrentWindow();
            if (!currentWindow || !currentWindow.windowObject) return null;

            const containerId = currentWindow.windowObject.id;
            const container = document.getElementById(containerId);
            if (!container) return null;

            // Filtra i campi sulla riga 1 all’interno della finestra corrente
            filteredFields = fields.filter(f => f.row === 1 && container.contains(document.getElementById(f.id)));
        } else {
            // Caso standard: tutti i campi riga 1 dentro #5250
            const container = document.getElementById("5250");
            filteredFields = fields.filter(f => f.row === 1 && container.contains(document.getElementById(f.id)));
        }

        if (!filteredFields || filteredFields.length === 0) return null;

        // Prendi quello con la colonna massima
        const lastField = filteredFields.reduce((max, curr) => curr.col > max.col ? curr : max);

        return lastField?.id || null;
    },
    object: function () {
        return document.getElementById(this.id());
    },
    name: function () {
        let element = this.object();
        if (element != null) {
            return element.textContent.trim();
        }
    }
}

var getProgramTitle = {
    id: function () {
        let elements = null;
        if (isWindowAppCore) {
            const currentWindow = getCurrentWindow();
            if (currentWindow && currentWindow.windowObject && currentWindow.windowObject.id) {
                const container = document.getElementById(currentWindow.windowObject.id);
                if (container) {
                    elements = container.querySelectorAll('[id^=D_1_]');
                }
            }
        } else {
            elements = document.getElementById("5250").querySelectorAll('[id^=D_1_]');
        }
        if (elements === null) {
            return null;
        }
        let i = isMenuSystemAppCore || (getProgramName.name() === "I9104LB") ? 2 : 1;
        if (elements.length >= i) {
            let element = elements[i];
            if (element != null && element.id != null) {
                return element.id;
            }
            return null;
        }
    },
    object: function () {
        return document.getElementById(this.id());
    },
    name: function () {
        let element = this.object();
        if (element != null) {
            if (element?.hasAttribute("fldtext")) {
                return element.getAttribute("fldtext") || null;
            }
            return element.textContent.trim();
        }
    }
}

var getApplicationFunction = {
    id: function () {
        let elements = null;
        if (isWindowAppCore) {
            const currentWindow = getCurrentWindow();
            if (currentWindow && currentWindow.windowObject && currentWindow.windowObject.id) {
                const container = document.getElementById(currentWindow.windowObject.id);
                if (container) {
                    elements = container.querySelectorAll('[id^=D_1_]');
                }
            }
        } else {
            elements = document.getElementById("5250").querySelectorAll('[id^=D_1_]');
        }
        if (elements === null) {
            return null;
        }

        let i = 0;
        if (getProgramName.name() == "I9104LB") {
            i = 1;
        }
        if (elements.length > i) {
            let element = elements[i];
            if (element != null && element.id != null) {
                return element.id;
            }
            return null;
        }
    },
    object: function () {
        return document.getElementById(this.id());
    },
    name: function () {
        let element = this.object();
        if (element != null) {
            if (getProgramName.name() == "I9104LB") {
                return element.textContent;
            }
            if ((isWindowAppCore)) {
                return element.textContent.substring(0, 3).trim();
            }
            return element.textContent.substring(3, 6).trim();
        }
    },
    description: function () {
        let description = null;
        switch (this.name()) {
            case 'RIC':
                description = 'Ricerca';
                break;
            case 'INS':
                description = 'Inserimento';
                break;
            case 'VAR':
                description = 'Variazione';
                break;
            case 'ANN':
                description = 'Annullamento';
                break;
            case 'CAN':
                description = 'Cancellazione';
                break;
            case 'ATT':
                description = 'Attivazione';
                break;
            case 'DUP':
                description = 'Duplicazione';
                break;
            case 'STA':
                description = 'Stampa';
                break;
            case 'SEL':
                description = 'Selezione';
                break;
            case 'MLT':
                description = 'Multiselezione';
                break;
            case 'VIS':
                description = 'Visualizzazione';
                break;
            case 'DLB':
                description = 'Delibera';
                break;
            case 'STP':
                description = 'Stipula';
                break;
        }
        return description;
    }
}

var getSelectionFunction = {
    id: function () {
        if (!Boolean(isProgramAppCoreNewHeader) || (getProgramName.name() === "I9104LB")) {
            return null;
        } else {
            let elements = null;
            if (isWindowAppCore) {
                const currentWindow = getCurrentWindow();
                if (currentWindow && currentWindow.windowObject && currentWindow.windowObject.id) {
                    const container = document.getElementById(currentWindow.windowObject.id);
                    if (container) {
                        elements = container.querySelectorAll('[id^=D_1_]');
                    }
                }
            } else {
                elements = document.getElementById("5250").querySelectorAll('[id^=D_1_]');
            }
            if (elements === null) {
                return null;
            }

            if (elements.length > 0) {
                let element = elements[0];
                if (element != null && element.id != null) {
                    return element.id;
                }
                return null;
            }
        }
    },
    object: function () {
        return document.getElementById(this.id());
    },
    name: function () {
        let element = this.object();
        if (element != null) {
            if ((isWindowAppCore)) {
                return element.textContent.substring(3).trim();
            }
            return element.textContent.substring(6).trim();
        }
    }
}

var getProgramNameInitial = {
    id: function () {
        return properties.mainProgramAppCoreId;
    },
    object: function () {
        return document.getElementById(this.id());
    },
    name: function () {
        let element = this.object();
        if (element != null) {
            return element.textContent.trim();
        }
    }
}

var getMenuAppCore = {
    id: function () {
        return "D_3_2";
    },
    object: function () {
        return document.getElementById(this.id());
    },
    name: function () {
        let element = this.object();
        if (element != null) {
            return element.textContent.trim();
        }
    }
}

var getMenuSystem = {
    id: function () {
        return "D_1_2";
    },
    object: function () {
        return document.getElementById(this.id());
    },
    name: function () {
        let element = this.object();
        if (element != null) {
            return element.textContent.trim();
        }
    }
}


var getUrl = {
    host: function () {
        return location.hostname;
    },
    port: function () {
        return location.port;
    },
    isReverseProxy: function () {
        const port = this.port();
        return !port || port === '80' || port === '443';
    },
    isAppCore: function () {
        const params = this.params();
        return params?.macro?.includes(properties.macroAppCore) || false;
    },
    pathname: function () {
        return location.pathname;
    },
    origin: function () {
        return location.origin;
    },
    href: function () {
        return location.href;
    },
    protocol: function () {
        return location.protocol;
    },
    isHttps: function () {
        return location.protocol === 'https:';
    },
    params: function () {
        return Object.fromEntries(new URLSearchParams(location.search));
    },
    param: function (param) {
        return new URLSearchParams(location.search).get(param);
    }
};
