/**
 * Removes objects in modules according to test functions, returns
 * an object with the removed and remaining modules.
 *
 * @param {Array} modules - The original array of modules
 * @param {Function} test - A function that determines if a module should be removed
 * @returns {Object} An object with:
 *   - `removed`: Array of modules removed by the test function
 *   - `remaining`: Array of remaining modules after removal
 */
export function sliceModulesOut(modules, test) {
    return {
        removed: modules.filter(test),
        remaining: modules.filter((module) => !test(module)),
    };
}

/**
 *
 * @param module
 * @returns {*}
 */
export function filterBadgeEarnModules(module) {
    return module.name?.match(/(how do i earn it\?)/ig);
}