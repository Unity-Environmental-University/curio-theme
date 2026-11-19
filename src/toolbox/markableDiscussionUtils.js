/**
 * Helpers for the "mark as done" discussion data stored in Canvas custom_data.
 *
 * Data shape: { "task-<discussionId>": ["task-<discussionId>-btn-<i>", ...] }
 */

const TASK_PREFIX_RE = /^(?:task-)+/;

/**
 * One-time migration for data saved by the bug that produced "task-task-<id>-btn-<i>" ids.
 * Collapses repeated "task-" prefixes on keys and ids and de-duplicates entries.
 * Never mutates the input.
 *
 * @param {Object<string, string[]>} data
 * @returns {{data: Object<string, string[]>, changed: boolean}}
 */
export function migrateMarkData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {data: {}, changed: false};
    }
    const result = {};
    let changed = false;
    for (const [key, ids] of Object.entries(data)) {
        const newKey = key.replace(TASK_PREFIX_RE, 'task-');
        if (newKey !== key) changed = true;
        const list = Array.isArray(ids) ? ids : [];
        if (!Array.isArray(ids)) changed = true;
        if (!result[newKey]) result[newKey] = [];
        for (const id of list) {
            const newId = typeof id === 'string' ? id.replace(TASK_PREFIX_RE, 'task-') : id;
            if (newId !== id) changed = true;
            if (result[newKey].includes(newId)) {
                changed = true; // duplicate dropped
            } else {
                result[newKey].push(newId);
            }
        }
    }
    return {data: result, changed};
}
