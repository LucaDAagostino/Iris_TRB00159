function redrawAdvanced_I0065LB() {
  setRedrawAdvanced.On();
  
  const container = document.getElementById('detail_I0065LB00V');
  if (!container) return;

  // 1. Crea contenitore per la mappa
  const containerGoogleMaps = createDiv("containerGoogleMaps", "container gx-0 gy-0 containerGoogleMaps");
  container.appendChild(containerGoogleMaps);

  // 2. Funzione helper per estrarre e codificare il dato
  const safeGetData = (name) => {
    const obj = getObjectByName(name);
    return obj?.fieldInfo?.data ? encodeURIComponent(obj.fieldInfo.data) : "";
  };

  // 3. Recupera i valori da comporre nell'URL
  const via = safeGetData("I0065LB00V_I0065LB01R_DSNOMCOM");
  const cap = safeGetData("I0065LB00V_I0065LB01R_CDTIPSTR");
  const città = safeGetData("I0065LB00V_I0065LB01R_DSIND");
  const provincia = safeGetData("I0065LB00V_I0065LB01R_CDNRCIND");

  // 4. Costruisci l’URL
  const mapsUrl = `https://maps.google.com/maps?hl=it&q=${via} ${cap} ${città} ${provincia}&output=embed`;

  // 5. Crea iframe per Google Maps
  const iframe = document.createElement("iframe");
  iframe.src = mapsUrl;
  iframe.id = "iframeGoogleMaps";
  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "none"
  });

  // 6. Inserisci iframe
  containerGoogleMaps.appendChild(iframe);
}
