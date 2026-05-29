var searchParams = new URLSearchParams(location.search);
var skin = searchParams.get('skin');

setWorkStationId();

function setWorkStationId() {
  const workstationIdType = properties.workstationIdType;
  if (!workstationIdType || workstationIdType === "*NONE") return;

  const config = (skin == null) ? getGenieConfig("global") : getGenieConfig("skin");
  if (!config || config.connectionType !== "V") return;

  const url = new URL(window.location.href);
  const params = url.searchParams;

  const fixWorkstnid = params.has("fixWorkstnid");

  const randomPrefix = String(properties.workstationIdTypeRandomPrefix || "").trim();
  const randomPrefixUpper = randomPrefix.toUpperCase();

  const buildRandomWorkstnId = (prefix) => {
    const p = String(prefix || "");
    const maxLen = 10;
    const randLen = Math.max(0, maxLen - p.length);
    return p + randomString(randLen);
  };

  const setSuffixIfNeeded = (id) => {
    if (!params.has("suffixid") && String(id).length !== 10) {
      params.set("suffixid", "1");
    }
  };

  // =========================
  // CASO RANDOM
  // =========================
  if (workstationIdType === "*RANDOM") {
    const existing = String(params.get("workstnid") || "").trim();
    const existingUpper = existing.toUpperCase();
    const hasWorkstnid = existing.length > 0;

    // OVERRIDE: se fixWorkstnid è presente e workstnid esiste → NON ricalcolo
    if (fixWorkstnid && hasWorkstnid) {
      return;
    }

    const hasCorrectPrefix =
      !randomPrefixUpper || existingUpper.startsWith(randomPrefixUpper);

    // ricalcolo SOLO se:
    // - workstnid non esiste
    // - oppure prefisso errato
    if (!hasWorkstnid || !hasCorrectPrefix) {
      const newId = buildRandomWorkstnId(randomPrefix);

      // ANTI-LOOP
      if (newId === existing) return;

      params.set("workstnid", newId);
      setSuffixIfNeeded(newId);

      // pulisco il flag per evitare URL persistiti
      params.delete("fixWorkstnid");

      window.location.href = url.toString();
    }
    return;
  }

  // =========================
  // ALTRI TIPI 
  // =========================
  if (!params.has("workstnid")) {
    let workstationId = "NCLGNIDFT";

    switch (workstationIdType) {
      case "*USER": {
        const user = params.get("user");
        if (user) workstationId = user;
        break;
      }
      case "*RANDOM":
        workstationId = buildRandomWorkstnId(randomPrefix);
        break;
    }

    params.set("workstnid", workstationId);
    setSuffixIfNeeded(workstationId);
    window.location.href = url.toString();
  }
}

function getGenieConfig(typeConfig) {
    let response = null;
    let o = new XMLHttpRequest;
    let body = 'type=genie_config_' + typeConfig + '&skin=' + skin;
    o.method = "POST";
    o.url = location.origin + '/profoundui/PUI0009115.pgm';
    o.async = false;
    o.suppressAlert = true;
    o.open(o.method, o.url, o.async);
    try {
        o.send(body);
        if (o.status = 200) {
            response = JSON.parse(o.response);
        } else {
            alert("Impossibile caricare configurazione globale (" + o.status + " " + o.statusText);
        }
    } catch (error) {
        alert("Impossibile caricare configurazione globale" + error);
    }
    return response;
}


function randomString(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
