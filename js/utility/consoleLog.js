// --- util ---
const hasConsole = typeof console !== "undefined";

const getProps = () =>
  typeof properties === "object" && properties ? properties : {};

const isConsoleEnabled = () =>
  Boolean(getProps().showConsoleLog);

const isWsEnabled = () =>
  Boolean(getProps().sendConsoleToWs);

// livelli con priorità
const LEVEL_PRIORITY = {
  error: 4,
  warn: 3,
  log: 2,
  info: 2,
  debug: 1
};

const getUrlParam = (name) => {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
};

const getMinLevel = () => {
  const fromUrl = getUrlParam("minConsoleLevel");

  if (fromUrl) {
    return fromUrl.toLowerCase().trim();
  }

  return (getProps().minConsoleLevel || "").toLowerCase().trim();
};

const isLevelEnabled = (level) => {
  const min = getMinLevel();
  if (!min || !LEVEL_PRIORITY[min]) return true;

  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[min];
};

// filtro per programma
const isProgramEnabled = () => {
  const list = getProps().consoleLogPrograms;

  if (!list || list.length === 0) return true;

  try {
    const pgm = getProgramName?.name?.();
    return list.includes(pgm);
  } catch {
    return true;
  }
};

const timeStamp = () =>
  new Date().toLocaleString("it-IT", {
    hour12: false,
    timeZone: "Europe/Rome"
  });

// throttle semplice (per WS)
let lastSend = 0;
const THROTTLE_MS = 200;

const canSendNow = () => {
  const now = Date.now();
  if (now - lastSend < THROTTLE_MS) return false;
  lastSend = now;
  return true;
};

// stringify sicuro
const safeStringify = (val) => {
  const seen = new WeakSet();

  return JSON.stringify(
    val,
    (k, v) => {
      if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
      if (typeof v === "symbol") return v.toString();
      if (typeof v === "bigint") return v.toString() + "n";

      if (typeof v === "object" && v !== null) {
        if (seen.has(v)) return "[Circular]";
        seen.add(v);
      }

      return v;
    },
    2
  );
};

const normalizeArgs = (args) =>
  args.map((a) =>
    typeof a === "string"
      ? a
      : typeof a === "number"
        ? String(a)
        : safeStringify(a)
  );

// --- core ---
function logCore(level, ...args) {
  if (!isLevelEnabled(level)) return;
  if (!isProgramEnabled()) return;

  const prepared = normalizeArgs(args);

  // --- WS ---
  if (isWsEnabled() && canSendNow()) {
    sendToWs(level, prepared);
  }

  // --- Console ---
  if (!isConsoleEnabled() || !hasConsole) return;

  const prefix = `${timeStamp()}:`;
  const m = typeof console[level] === "function" ? level : "log";

  try {
    console[m](prefix, ...prepared);
  } catch {
    try {
      console[m]([prefix, ...prepared].join(" "));
    } catch {}
  }
}

function sendToWs(level, prepared) {
  try {
    if ((window.__CL_NO_FORWARD || 0) > 0) return;

    if (window.logger?.sendErrorToBGNIWMSG) {
      const entry = {
        ts: new Date().toISOString(),
        type: level,
        message: prepared.join(" "),
        source: "consoleLog",
        program: getProgramName?.name?.() || "",
        args: prepared
      };

      window.logger.sendErrorToBGNIWMSG(entry, { type: "console-log" });
    }
  } catch (e) {
    if (console?.warn) {
      console.warn("Send to BGNIWMSG failed:", e);
    }
  }
}

// --- API ---
var consoleLog = {
  log(...args)   { logCore("log", ...args); },
  info(...args)  { logCore("info", ...args); },
  warn(...args)  { logCore("warn", ...args); },
  error(...args) { logCore("error", ...args); },
  debug(...args) { logCore("debug", ...args); },

  enableConsole()  { getProps().showConsoleLog = true; },
  disableConsole() { getProps().showConsoleLog = false; },

  enableWs()  { getProps().sendConsoleToWs = true; },
  disableWs() { getProps().sendConsoleToWs = false; }
};