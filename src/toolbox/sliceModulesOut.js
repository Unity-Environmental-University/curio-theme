/**
 * Filters an array of modules based on provided test criteria, returning
 * the modules that meet those criteria and those that do not.
 *
 * The function can handle a single filtering function or an object containing
 * multiple filtering functions. When supplied with an object, it will apply
 * each filtering function and categorize the removed modules accordingly.
 *
 * @param {Array} modules - The original array of modules to be filtered.
 * @param {Function|Object} test - A function or an object containing multiple
 *   filter functions. If a function is provided, it will be used to identify
 *   modules that should be removed. If an object is provided, each property
 *   should be a function, and the removed modules will be grouped by property name.
 *
 * @returns {Object} An object containing:
 *   - `removed`: An object where each key corresponds to a filtering function's
 *     name (if an object of functions was used) or an array of modules removed
 *     by the single function.
 *   - `remaining`: An array of modules that were not removed.
 *
 * @example
 * // Using a single filter function
 * const result = sliceModulesOut(modules, filterBadgeEarnModules);
 * console.log(result);
 * // Output: { removed: [...], remaining: [...] }
 *
 * @example
 * // Using multiple filter functions
 * const result = sliceModulesOut(modules, {
 *     earnIt: filterBadgeEarnModules,
 *     claimIt: filterBadgeClaimModules,
 * });
 * console.log(result);
 * // Output: { removed: { earnIt: [...], claimIt: [...] }, remaining: [...] }
 */
export function sliceModulesOut(modules, test) {
    const result = {
        removed: {},
        remaining: []
    };

    // Check if 'test' is an object
    if (typeof test === 'object') {
        // Initialize an empty array for remaining modules
        const remainingSet = new Set(modules);

        for (const [key, filterFn] of Object.entries(test)) {
            // Filter removed modules based on the filter function
            const removedModules = modules.filter(filterFn);
            result.removed[key] = removedModules;

            // Remove modules from the remaining set
            removedModules.forEach(module => remainingSet.delete(module));
        }

        // Convert the remaining set back to an array
        result.remaining = Array.from(remainingSet);
    } else {
        // If 'test' is a function, continue with the current filtering logic
        result.removed = modules.filter(test);
        result.remaining = modules.filter(module => !test(module));
    }

    return result;
}

export function filterBadgeEarnModules(module) {
    return module.name?.match(/(how do i earn it\?)/ig);
}

export function filterBadgeClaimModules(module) {
    return module.name?.match(/^claim badge/ig);
}