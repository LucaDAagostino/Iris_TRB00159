invokeWebService_BGNIWMSG = function(payload) {
  isSuccessBGNIWMSG = false;
  if (Boolean(properties.invokeWs_BGNIWMSG)) {
    let url = properties.urlWs_BGNIWMSG;
    if (properties.isProduction) {
      url = buildWebServiceUrl(url, 'PRD');
    } else {
      url = buildWebServiceUrl(url, 'SVL');
    }

    let type = "POST";
    let dataType = "json";
    let cache = properties.cacheWs;

    // Disabilita la cache se il nome programma è tra quelli esclusi
    if (properties.disableCacheWs.includes(getProgramName.name())) {
      cache = false;
    }

    let useLocalCache = false;
    let headers = { "Content-Type": "application/json" };

    let data = JSON.stringify(payload || {});
    
    let asyncr = false;
    let crossDomain = true;
    let timeout = properties?.timeoutWs || 3000;

    if (!getProgramName.name()) {
      useLocalCache = false;
    }

    let urlCache = null;

    invokeWebService(
      properties.nameWs_BGNIWMSG,
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
      handleResponse_BGNIWMSG,
      errorWebService
    );
  }
};

handleResponse_BGNIWMSG = function (response, urlCache) {

  let tag_oErrorNode = "oErrorNode";
  // Verifica se c'è un errore
  if (tag_oErrorNode in response) {
    const oError = response.oErrorNode;
    const returnCode = oError?.returnCode;

    // Se returnCode è valorizzato, gestisci l'errore e interrompi
    if (returnCode !== undefined && returnCode !== null && returnCode !== "") {
      const message = oError.returnCodeDescription || "Si è verificato un errore.";
      consoleLog.error("Error web service BGNIWMSG. Code ", returnCode, message);
      isSuccessBGNIWMSG = false;
      return;
    }
  }

  isSuccessBGNIWMSG = true;

  const tag_oJob = "oJob";
  const item = response[tag_oJob];

};