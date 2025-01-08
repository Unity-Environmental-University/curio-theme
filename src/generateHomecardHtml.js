/**
 * Generates HTML for a "home card" module with customizable content.
 *
 * @param {string} name - The name of the module, potentially including a topic number.
 * @param {string} modUrl - The URL the card links to.
 * @param {string} [imgUrl] - The URL of the image to display on the card (optional).
 * @param {number} completedItems - The number of completed items in the module.
 * @param {number} totalItems - The total number of items in the module.
 * @param {string} [state] - The state of the module, such as "locked" (optional).
 * @returns {string} - The generated HTML string for the home card.
 */
export function generateHomecardHtml(name, modUrl, imgUrl, completedItems, totalItems, state) {
    let html = '<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">';

    const moduleClassNames = ['cbt-module-card'];
    if (state && state === 'locked') moduleClassNames.push('cbt-module-locked');

    html += `<a class="${moduleClassNames.join(' ')}" title="${name}" href="${modUrl}">`;
    if (imgUrl) {
        html += `
            <div class="cbt-module-card-img">
                <img src="${imgUrl}" alt="module card image" />
            </div>`.trim();
    }

    html += '<div class="cbt-module-info"><div class="cbt-module-details">';
    if (name.length > 0 && /^module\s*\d+\s?:?-?.+/gi.test(name)) {
        let topicNum = name.match(/^(module\s*\d+\s?)/gi)[0].trim();
        let moduleName = name.split(/^module\s*\d+\s?:?-?/gi).join("").trim();
        html += `<p>${topicNum}</p>`;
        html += `<h3>${moduleName}</h3>`;
    } else {
        html += '<p>&nbsp;</p>';
        html += `<h3>${name}</h3>`;
    }

    html += '</div>';
    if (totalItems && completedItems <= totalItems) {
        html += '<div class="cbt-module-footer"> \
                    <div class="cbt-module-details"> \
                    <p><b>' + completedItems + '/' + totalItems + '</b> complete</p> \
                    </div> \
                    <div class="cbt-module-completion"><span style="width:' + Math.round((completedItems / totalItems) * 100) + '%">&nbsp;</span></div> \
                </div>';
    }
    html += '</div></a></div>';
    return html;
}