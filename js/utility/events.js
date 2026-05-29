addEventPluginElements = function (element, fkey) {
    element.fkey = fkey;
    element.onclick = function (e) {
        var target = getTarget(e);
        if (target.fkey == null) {
            target = target.parentNode;
        }
        if (target.fkey != null) {
            pressKeyAndNotify(target.fkey);
        }
    }
}

detectEventListener = function () {
  let _busyCF03 = false;
  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "F10":
        if (Boolean(isProgramAppCore)) isInsideProgramAppCore = true;
        break;
    }
  }, true);

  // intercetta tasti “logici” (da codice)
  document.addEventListener("appcore:fkey", (e) => {
    switch (e.detail.fkey) {
      case "CF10":
        if (Boolean(isProgramAppCore)) isInsideProgramAppCore = true;
        break;
      case "CF03":
        if (isSideBarOpen()) {
            // Per chiudere SideBar
            pressKeyAndNotify("CF10");
        }
        break;
    }
  });
}

addEventUrl = function (element, url) {
    if (element != null) {
        element.addEventListener("click", function () {
            window.open(url, '_blank');
        });
    }
}

function pressKeyAndNotify(fkey) {
  document.dispatchEvent(new CustomEvent("appcore:fkey", { detail: { fkey } }));

  return pressKey(fkey);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}