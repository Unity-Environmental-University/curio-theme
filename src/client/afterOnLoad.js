export const afterOnLoad = (scaffoldClient) => {
    /* Import Style and Script */
    let head = document.getElementsByTagName("head")[0];
    let bootstrapStyle = document.createElement("link");
    bootstrapStyle.rel = "stylesheet";
    bootstrapStyle.type = "text/css";
    bootstrapStyle.href = "https://cdn.jsdelivr.net/npm/bootstrap@4.4/dist/css/bootstrap-grid.min.css";
    head.insertBefore(bootstrapStyle, head.firstChild);

    if (typeof jQuery == 'undefined' || typeof jQuery === undefined || typeof jQuery === null) {
        var headTag = document.getElementsByTagName("head")[0];
        var jqTag = document.createElement('script');
        jqTag.type = 'text/javascript';
        jqTag.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js';
        headTag.appendChild(jqTag);
    }

    if (!/^\/courses\/\d+\/gradebook/.test(window.location.pathname) && !/^\/courses\/\d+\/assignment/.test(window.location.pathname) && !/\/edit$/.test(window.location.pathname)) {
        document.body.classList.remove('full-width');
    }

    // Only start to load the interactivity while the content page is loaded
    if (!document.querySelector(".user_content, #quiz_show")) {
        // mobile - if (document.querySelector('#content'))
        const contentLoadInterval = window.setInterval(function () {
            if (document.querySelector(".user_content, #quiz_show")) {
                // mobile - if (document.querySelector('#content'))
                window.clearInterval(contentLoadInterval);
                scaffoldClient.interactiveSetup();
            }
        }, 500);
        window.setTimeout(function () {
            window.clearInterval(contentLoadInterval);
        }, 10000);
    } else {
        scaffoldClient.interactiveSetup();
    }
};