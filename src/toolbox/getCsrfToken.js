export const getCsrfToken = function () {
    var csrfRegex = new RegExp('^_csrf_token=(.*)$');
    var csrf;
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        var match = csrfRegex.exec(cookie);
        if (match) {
            csrf = decodeURIComponent(match[1]);
            break;
        }
    }
    return csrf;
};