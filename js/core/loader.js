function startLoader() {
    let loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "block";
    }

    let bodyWrapper = document.getElementById("bodyWrapper");
    if (bodyWrapper) {
        bodyWrapper.style.visibility = "hidden";
        bodyWrapper.classList.remove("show");
    }
}

function stopLoader() {
    loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "none"
    }

    let bodyWrapper = document.getElementById("bodyWrapper");
    if (bodyWrapper) {
        bodyWrapper.style.removeProperty("visibility");
        bodyWrapper.classList.add("fadeLong");
        bodyWrapper.classList.add("show");
    }
}