invokeWebService_BGNIATTR = function () {
  isSuccessBGNIATTR = false;
  if (Boolean(properties.invokeWs_BGNIATTR) && Boolean(isAppCore) && (getDataStorage("environment", "session") === null || isMainMenuAppCore)) {
    let url = properties.urlWs_BGNIATTR;
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

    let data = JSON.stringify({
      iJob: {
        iJobName: pui.appJob.name,
        iJobUser: pui.appJob.user,
        iJobNumber: pui.appJob.number,
      },
    });

    let asyncr = false;
    let crossDomain = true;
    let timeout = properties?.timeoutWs || 3000;

    if (!getProgramName.name()) {
      useLocalCache = false;
    }

    let urlCache = null;

    invokeWebService(
      properties.nameWs_BGNIATTR,
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
      handleResponse_BGNIATTR,
      errorWebService
    );
  }

  if (!pui.appJob.name || !pui.appJob.user || !pui.appJob.number) {
    if (getDataStorage("jobName", "session") && getDataStorage("jobUser", "session") && getDataStorage("jobNumber", "session")) {
      pui.appJob.name = getDataStorage("jobName", "session");
      pui.appJob.user = getDataStorage("jobUser", "session");
      pui.appJob.number = getDataStorage("jobNumber", "session");
    }
  }

  if (!pui.appJob.name) {
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search);
    pui.appJob.name = params.get('workstnid');
  }
};

handleResponse_BGNIATTR = function (response, urlCache) {
  let tag_oErrorNode = "oErrorNode";
  // Verifica se c'è un errore
  if (tag_oErrorNode in response) {
    const oError = response.oErrorNode;
    const returnCode = oError?.returnCode;

    // Se returnCode è valorizzato, gestisci l'errore e interrompi
    if (returnCode !== undefined && returnCode !== null && returnCode !== "") {
      const message = oError.returnCodeDescription || "Si è verificato un errore.";
      consoleLog.error("Error web service BGNIATTR. Code ", returnCode, message);
      isSuccessBGNIATTR = false;
      return;
    }
  }

  isSuccessBGNIATTR = true;

  const tag_oJob = "oJob";
  const item = response[tag_oJob];

  if (item && item.appEnvironment) {
    setDataStorage("environment", item.appEnvironment, "session");
    setEnvironmentDescription();
  }

  if (item && item.codeEnvironment) {
    setDataStorage("codeEnvironment", item.codeEnvironment, "session");
  }

  if (item && item.company) {
    setDataStorage("company", item.company, "session");
  }


  if (item && item.oJobName) setDataStorage("jobName", item.oJobName, "session");
  if (item && item.oJobUser) setDataStorage("jobUser", item.oJobUser, "session");
  if (item && item.oJobNumber) setDataStorage("jobNumber", item.oJobNumber, "session");
  if (item && item.userSurname) setDataStorage("userSurname", item.userSurname, "session");
  if (item && item.userName) setDataStorage("userName", item.userName, "session");
};