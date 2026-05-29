setCookie = function (nome, valore, path, expires) {
    $.cookie(nome, valore, {
        path: path,
        expires: expires
    });
}

getCookie = function (keyValueMatch) {
    var dummyCookie = $.cookie(keyValueMatch);
    return dummyCookie != null ? dummyCookie : null;
};

deleteCookue= function (removeElement) {
    $.removeCookie(removeElement, {
        path: '/'
    });
}
