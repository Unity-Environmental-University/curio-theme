/**
 * Generates and populates the home card HTML for each module in the course.
 *
 * This function retrieves course module data from `ScaffoldClient.courseData`, processes each module to
 * generate HTML for home cards, and appends the resulting HTML to the container for displaying the cards.
 * It also ensures that images are loaded asynchronously, and URLs are adjusted based on module item data.
 * If there are no valid modules or cards, the function does nothing.
 *
 * @param {Array} data - The data to process, expected to be an array of module objects. If not provided or invalid, the function resolves to `false` and does not proceed.
 * @param {{preloadPromises, getOrigin, getModImgURL}} scaffoldClient - The `ScaffoldClient` object
 *
 * @returns {Promise} - Resolves with `false` if no valid data is provided. Otherwise, it returns a promise that resolves once the home cards are generated and displayed.
 *
 * @throws {Error} - If there is an issue with generating or fetching module data (e.g., missing image URL), an error is logged.
 */

import {renderHomeCardHtmlAsync} from "./renderHomeCardHtmlAsync.js";
import {filterBadgeClaimModules, filterBadgeEarnModules, sliceModulesOut} from "../toolbox/sliceModulesOut.js";


export const getHomeCardsAsync = async function ({preloadPromises}, modules) {
    if (typeof modules !== 'object' || modules.length === 0) {
        return Promise.resolve(false);
    }

    try {
        await Promise.all(preloadPromises);

        console.log("module items are all ready for you :)");
        let moduleCardsContainer = document.querySelector('.cbt-home-cards');
        let hasModuleCards = (container) => {
            return !!container.querySelector('.cbt-module-card');
        };

        if (
            modules &&
            modules.length > 0
            && !hasModuleCards(moduleCardsContainer)
        ) {
            // Loop and display all module items in the accordion

            const filterResults = sliceModulesOut(modules, {
                claimMods: filterBadgeClaimModules,
                earnMods: filterBadgeEarnModules
            });

            const weeklyMods = filterResults.remaining;
            const {claimMods, earnMods} = filterResults.removed;

            const weeklyHtmlPromises = weeklyMods.map(mod => renderHomeCardHtmlAsync(mod));
            const claimPromises = claimMods?.map(mod => renderHomeCardHtmlAsync(mod)) ?? [];
            const earnPromises = earnMods?.map(mod => renderHomeCardHtmlAsync(mod)) ?? [];

            const weeklyHtmls = (await Promise.all(weeklyHtmlPromises));
            const earnBadgeHtmls = (await Promise.all(earnPromises));
            const claimBadgeHtmls = (await Promise.all(claimPromises));


            let html = `<div class="row ueu-weekly-modules">${weeklyHtmls.join('\n')}</div>\n`;
            if (claimBadgeHtmls.length > 0) {
                html += `<div class="row ueu-claim-badge-modules">${claimBadgeHtmls.join('\n')}</div>\n`;
            }
            if (earnBadgeHtmls.length > 0) {
                html += `<div class="row ueu-earn-badge-modules">${earnBadgeHtmls.join('\n')}</div>\n`;
            }

            moduleCardsContainer.innerHTML = html;
        }
    } catch (e) {
        console.log("getHomeCards error - " + e);
        throw(e);
    }
}