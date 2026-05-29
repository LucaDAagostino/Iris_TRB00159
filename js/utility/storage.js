function normalizeTypeStorage(type) {
    const t = (type || "session").toLowerCase();
    if (t === "local" || t === "session" || t === "cookie") return t;
    consoleLog.error("Invalid type. Use: 'local', 'session' or 'cookie'.");
    return null;
}

function prefixDataStorage(key) {
    return APP_PREFIX + key;
}

function setCookieDataStorage(name, value, minutes = 60) {
  const expires = new Date();
  expires.setTime(expires.getTime() + minutes * 60 * 1000); // 60 minuti

  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ` +
    `expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`;
}

function getCookieDataStorage(name) {
    const encName = encodeURIComponent(name) + "=";
    const parts = document.cookie.split("; ");
    for (const c of parts) {
        if (c.startsWith(encName)) {
            const raw = c.substring(encName.length); // può contenere '='
            return decodeURIComponent(raw);
        }
    }
    return null;
}

function removeCookieDataStorage(name) {
    const past = "Thu, 01 Jan 1970 00:00:00 GMT";
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
        `${encodeURIComponent(name)}=; expires=${past}; path=/; SameSite=Lax${secure}`;
}

// --- API: set/get/remove/clear ---
function setDataStorage(key, value, type = "session") {
    const t = normalizeTypeStorage(type); if (!t) return;
    const fullKey = prefixDataStorage(key);

    try {
        if (t === "local") {
            localStorage.setItem(fullKey, value);
        } else if (t === "session") {
            sessionStorage.setItem(fullKey, value);
        } else {
            setCookieDataStorage(fullKey, value);
        }
        consoleLog.debug(`Save ${t} storage: ${fullKey}`);
    } catch (err) {
        consoleLog.error(`Error saving ${t} storage: ${err?.message || err}`);
    }
}

function getDataStorage(key, type = "session") {
    const t = normalizeTypeStorage(type); if (!t) return null;
    const fullKey = prefixDataStorage(key);

    if (t === "local") {
        return localStorage.getItem(fullKey);
    } else if (t === "session") {
        return sessionStorage.getItem(fullKey);
    } else {
        return getCookieDataStorage(fullKey);
    }
}

function removeDataStorage(key, type = "session") {
    const t = normalizeTypeStorage(type); if (!t) return;
    const fullKey = prefixDataStorage(key);

    if (t === "local") {
        localStorage.removeItem(fullKey);
    } else if (t === "session") {
        sessionStorage.removeItem(fullKey);
    } else {
        removeCookieDataStorage(fullKey);
    }
    consoleLog.debug(`Remove ${t} storage: ${fullKey}`);
}

function clearDataStorageByPrefix(type = "local") {
    const t = normalizeTypeStorage(type); if (!t) return;

    if (t === "local") {
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith(APP_PREFIX)) localStorage.removeItem(k);
        });
        consoleLog.debug(`Clear ${t} storage (prefixed only)`);
    } else if (t === "session") {
        Object.keys(sessionStorage).forEach(k => {
            if (k.startsWith(APP_PREFIX)) sessionStorage.removeItem(k);
        });
        consoleLog.debug(`Clear ${t} storage (prefixed only)`);
    } else {
        document.cookie.split("; ").forEach(c => {
            const key = decodeURIComponent(c.split("=")[0] || "");
            if (key.startsWith(APP_PREFIX)) removeCookieDataStorage(key);
        });
        consoleLog.debug(`Clear ${t} storage (prefixed only)`);
    }
}

function clearDataStorage(type = "local") {
    const t = normalizeTypeStorage(type); if (!t) return;

    if (t === "local") {
        localStorage.clear();
    } else if (t === "session") {
        sessionStorage.clear();
    } else {
        document.cookie.split("; ").forEach(c => {
            const key = decodeURIComponent(c.split("=")[0] || "");
            removeCookieDataStorage(key);
        });
    }
    consoleLog.debug(`Clear ${t} storage (ALL keys)`);
}

// --- Reset SOLO le tue chiavi su tutti i tipi ---
function resetDataStorageByPrefix() {
    clearDataStorageByPrefix("local");
    clearDataStorageByPrefix("session");
    clearDataStorageByPrefix("cookie");
}

// --- (Opzionale) Reset TOTALE di tutto ovunque ---
function resetDataStorage() {
    clearDataStorage("local");
    clearDataStorage("session");
    clearDataStorage("cookie");
}


