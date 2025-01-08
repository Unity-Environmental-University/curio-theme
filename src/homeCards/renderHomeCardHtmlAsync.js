import {getModUrl} from "../toolbox/getModUrl.js";
import {getImgUrlAsync} from "../toolbox/getImgUrlAsync.js";

/**
 * Generates HTML for a "home card" module with customizable content.
 *
 * @param {object} mod - The canvas module
 * @param {ScaffoldClient} scaffoldClient - the scaffoldClient instance for this theme
 **/

export async function renderHomeCardHtmlAsync(mod, scaffoldClient) {
    const firstItem = mod.items.find(item => item.type !== "SubHeader");
    const name = mod.name ? mod.name : "";

    const modUrl = getModUrl(scaffoldClient, mod, firstItem);
    const imgUrl = await getImgUrlAsync(scaffoldClient, mod);

    let completedItems = mod.items.filter(
        item => item.type !== "SubHeader" && item.hasOwnProperty("completion_requirement") && item.completion_requirement.completed === true
    ).length;
    let totalItems = mod.items.filter(
        item => item.type !== "SubHeader" && item.hasOwnProperty("completion_requirement")
    ).length;

    let html = '<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">';

    const moduleClassNames = getModuleClassNames(mod);

    html += `<a class="${moduleClassNames}" title="${name}" href="${modUrl}">`;
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



const classnameChecks = [
    { className: 'cbt-module-locked', test: (mod) => mod?.state === 'locked' },
];

function getModuleClassNames(module) {
    const moduleClassNames = ['cbt-module-card'];
    for(const { className, test } of classnameChecks) {
        if(test(module)) {moduleClassNames.push(className);}
    }
    return moduleClassNames.join(' ');
}


