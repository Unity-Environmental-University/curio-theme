/**
 * Generates and populates the home card HTML for each module in the course.
 *
 * This function retrieves course module data from `ScaffoldClient.courseData`, processes each module to
 * generate HTML for home cards, and appends the resulting HTML to the container for displaying the cards.
 * It also ensures that images are loaded asynchronously, and URLs are adjusted based on module item data.
 * If there are no valid modules or cards, the function does nothing.
 *
 * @param {Array} data - The data to process, expected to be an array of module objects. If not provided or invalid, the function resolves to `false` and does not proceed.
 * @param {Object} scaffoldClient - The `ScaffoldClient` object, which contains methods for handling course data, fetching URLs, and images.
 *
 * @returns {Promise} - Resolves with `false` if no valid data is provided. Otherwise, it returns a promise that resolves once the home cards are generated and displayed.
 *
 * @throws {Error} - If there is an issue with generating or fetching module data (e.g., missing image URL), an error is logged.
 */
import {renderHomeCardHtmlAsync} from "./renderHomeCardHtmlAsync.js";


export const getHomeCardsAsync = async function (scaffoldClient, data) {
    if (typeof data !== 'object' || data.length === 0) {
        return Promise.resolve(false);
    }
    try {
        await Promise.all(scaffoldClient.preloadPromises);

        console.log("module items are all ready for you :)");
        let moduleCardsContainer = document.querySelector('.cbt-home-cards');
        let hasModuleCards = (container) => {
            return !!container.querySelector('.cbt-module-card');
        };

        if (scaffoldClient.courseData.modules && scaffoldClient.courseData.modules.length > 0 && !hasModuleCards(moduleCardsContainer)) {
            let cardHtmls = [];
            // Loop and display all module items in the accordion

            for (let mod of scaffoldClient.courseData.modules) {
                cardHtmls.push(renderHomeCardHtmlAsync(mod, scaffoldClient));

            }

            moduleCardsContainer.innerHTML = `<div class="row">${cardHtmls.join('\n')}</div>`;
        }
    } catch (e) {
        console.log("getHomeCards error - " + e);
    }
}


