// --------------------------- URL HELPERS ---------------------------
setWebServiceUrl = function (webServiceName) {
  let urlWs = new URL(getUrl.origin());

  if (Boolean(getUrl.isReverseProxy())) {
    urlWs.pathname = urlWs.pathname.replace("pui", "iws");
  } else {
    if (searchString(urlWs.toString(), "trebi")) {
      urlWs.port = getUrl.port() - 200;
    }
  }
  urlWs.pathname = "/web/services/" + webServiceName;
  return urlWs.href;
};

function buildWebServiceUrl(url, forcedEnv = null) {
  const storedEnvironment = getDataStorage("environment", "session");
  const environment = (storedEnvironment || forcedEnv || "").slice(-3);
  const prefixWs = getDataStorage("prefixWs", "session") || properties.defaultPrefixWs;

  if (typeof url !== "string") return url;

  let currentBaseEnvironmentWs = baseEnvironmentWs;

  let finalUrl = url;

  /* CASI GESTITI
      1. INFRASTRUTTURA PROD + ambiente NON PRD => usa WS TEST
      2. INFRASTRUTTURA TEST + ambiente PRD => usa WS PRODUZIONE
  */

  if (baseEnvironmentWs === "PRODUZIONE" && environment && environment !== "PRD"  ) {
    currentBaseEnvironmentWs = "TEST";
  } else if (baseEnvironmentWs === "TEST" && environment === "PRD") {
    currentBaseEnvironmentWs = "PRODUZIONE";
  }

  const currentWsConfigs = isPublicIP
    ? wsParamConfigs[currentBaseEnvironmentWs].public
    : wsParamConfigs[currentBaseEnvironmentWs].internal;

  const currentBaseWsUrl = getBaseWsUrl(currentWsConfigs, isPublicIP);

  const serviceName = url.substring(url.lastIndexOf("/") + 1);

  finalUrl = currentBaseWsUrl + serviceName;

  return finalUrl
    .replace("{PREFIXWS}", prefixWs)
    .replace("{ENV}", environment);
}

function buildWebServiceUrlCacheKey(url, isWindow, data) {
  const d = (typeof data === "string")
    ? data
    : JSON.stringify(data || {});
  return (
    "url:" + url +
    "&window:" + isWindow +
    "&Data:" + d
      .replaceAll(",", "&")
      .replaceAll(":", "=")
      .replaceAll(/{|}|['"]+/g, "")
      .replaceAll("IJOB=", "?")
  );
}

// --------------------------- CACHE LOCALE ---------------------------
var localCache = {
  data: {},
  remove: function (url) { delete localCache.data[url]; },
  exist: function (url) { return localCache.data.hasOwnProperty(url) && localCache.data[url] !== null; },
  get: function (url) { return localCache.data[url]; },
  set: function (url, response) {
    localCache.remove(url);
    localCache.data[url] = response;
  },
  clearAll: function () {
    localCache.data = {};
    consoleLog.debug("Clear localCache");
  }
};

// --------------------------- CALLBACK HUB (UNICO) ---------------------------
var result = {
  data: {},
  callbackSuccess: function (data, callback, urlCache) {
    if ($.isFunction(callback)) callback(data, urlCache);
  },
  callbackError: function (webServiceName, url, xhr, errorThrown, callback) {
    if ($.isFunction(callback)) {
      callback(webServiceName, url, xhr, errorThrown);
    } else {
      errorWebService(webServiceName, url, xhr, errorThrown);
    }
  }
};

// --------------------------- LOG ERRORI ---------------------------
errorWebService = function (webServiceName, url, xhr, errorThrown) {
  try {
    const status = (xhr && typeof xhr.status !== "undefined") ? (xhr.status + " " + (xhr.statusText || "")) : "n/a";
    consoleLog.error(
      "Invoke web service (error): " + webServiceName +
      " url: " + url +
      " (status: " + status + "; error: " + (errorThrown || "n/a") + ")"
    );
  } catch (e) {
    // non bloccare mai il flusso su error logging
  }
};

// --------------------------- INVOKER ---------------------------
invokeWebService = function (
  webServiceName,
  url,
  headers,
  type,
  dataType,
  data,
  cache,
  useLocalCache,
  urlCache,
  asyncr,
  crossDomain,
  timeout,
  fnOnSuccess,
  fnOnError
) {
  return $.ajax({
    url,
    type,
    cache,
    data,
    dataType,
    crossDomain,
    headers,
    async: asyncr,
    timeout,

    beforeSend: function () {
      if (useLocalCache && urlCache && localCache.exist(urlCache)) {
        if (webServiceName !== properties.nameWs_BGNIWMSG) {
          consoleLog.debug("Cache web service (beforeSend): " + webServiceName + " cache: " + urlCache);
        }
        result.callbackSuccess(localCache.get(urlCache), fnOnSuccess, urlCache);
        return false;
      }
      const requestData =
        (typeof data === "string") ? data.replaceAll(",", "&").replaceAll(":", "=").replaceAll(/{|}|['"]+/g, "")
          : JSON.stringify(data);
      if (webServiceName !== properties.nameWs_BGNIWMSG) {
        consoleLog.debug("Invoke web service (beforeSend): " + webServiceName + " url: " + url + " | request: " + requestData);
      }
      return true;
    },

    success: function (response) {
      const requestData =
        (typeof data === "string") ? data.replaceAll(",", "&").replaceAll(":", "=").replaceAll(/{|}|['"]+/g, "")
          : JSON.stringify(data);
      const responseData =
        (typeof response === "string") ? response.replaceAll(",", "&").replaceAll(":", "=").replaceAll(/{|}|['"]+/g, "")
          : JSON.stringify(response);
      if (webServiceName !== properties.nameWs_BGNIWMSG) {
        consoleLog.debug("Invoke web service (success): " + webServiceName + " url: " + url + " | request: " + requestData + " | response: " + responseData);
      }

      if (useLocalCache && urlCache) {
        localCache.set(urlCache, response);
      }
      result.callbackSuccess(response, fnOnSuccess, urlCache);
    },

    // Firma jQuery corretta: (xhr, textStatus, errorThrown)
    error: function (xhr, textStatus, errorThrown) {
      // Fallback log immediato, a prova di ridefinizioni
      try { errorWebService(webServiceName, url, xhr, errorThrown); } catch (_) { }
      // Inoltra alla callback centralizzata (userà fnOnError se funzione, altrimenti errorWebService)
      const onError = $.isFunction(fnOnError) ? fnOnError : errorWebService;
      result.callbackError(webServiceName, url, xhr, errorThrown, onError);
    },

    complete: function () { }
  });
};