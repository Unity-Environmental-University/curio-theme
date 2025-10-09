export function getNavHtml(navItem) {
    var doneHtml = "";
    // if (document.getElementById("mark-as-done-container")) {
    //     doneHtml = document.getElementById("mark-as-done-container").innerHTML;
    //     //document.getElementById("mark-as-done-container").innerHTML = "";
    // }
    var html = '<div class="cbt-nav-footer" role="navigation" aria-label="Module Navigation">';
    html += doneHtml,
        html += "<hr>",
        html += '<div class="row">',
        navItem.items.length > 0 && navItem.items[0].prev ? (html += '<div class="col-xs-6 col-sm-6 col-md-6 col-6">',
            html += '<div class="cbt-nav-prev"><div class="cbt-nav-wrapper left"> \
        <div class="cbt-nav"><i class="cbt-icon-left" aria-hidden="true"></i></div><span>Back</span></div>\
        <div class="cbt-nav-item-detail right"> \
        <p class="cbt-nav-module-name">' + navItem.items[0].prev.module_title + '</p> \
        <p class="cbt-nav-item-name">' + navItem.items[0].prev.title + "</p></div>",
            html += '<a class="cbt-nav-link" aria-label="' + navItem.items[0].prev.module_title + '" href="' + navItem.items[0].prev.html_url + '"></a>',
            html += "</div></div>") : html += '<div class="col-xs-12 col-sm-12 col-md-6 col-6 cbt-inactive"></div>';


    navItem.items.length > 0 && navItem.items[0].next ? (html += '<div class="col-xs-6 col-sm-6 col-md-6 col-6">',
        html += '<div class="cbt-nav-next"><div class="cbt-nav-item-detail left"><p class="cbt-nav-module-name">' + navItem.items[0].next.module_title + '</p> \
        <p class="cbt-nav-item-name">' + navItem.items[0].next.title + '</p></div> \
        <div class="cbt-nav-wrapper right"><div class="cbt-nav"><i class="cbt-icon-right" aria-hidden="true"></i></div><span>Next</span></div>',
        html += '<a class="cbt-nav-link" aria-label="' + navItem.items[0].next.title + '" href="' + navItem.items[0].next.html_url + '"></a>',
        html += "</div></div>") : html += '<div class="col-xs-12 col-sm-12 col-md-6 col-6 cbt-inactive"></div>',
        html += "</div>",
        html += "</div>";

    return html
}