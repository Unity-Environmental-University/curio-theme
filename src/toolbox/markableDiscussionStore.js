/**
 * Storage for "Mark as done" discussion marks in Canvas custom_data.
 *
 * Layout (all inside the namespace `cbt_discussion_<courseId>`):
 *  - legacy, read-only: scope `<ns>` holds ONE JSON string mapping every discussion key to its ids.
 *    Writing that blob is what let a failed read wipe every discussion, so it is never written again.
 *  - current: scope `tasks/task-<id>` holds that discussion's ids as a plain array. A save only
 *    ever touches its own discussion.
 * Reads merge both layouts; the per-discussion value wins for a key.
 */

export const TASKS_SCOPE = 'tasks';
const TASK_KEY_RE = /^task-\d+$/;

export class MarkStoreError extends Error {
    constructor(message, {status = null, retryable = true} = {}) {
        super(message);
        this.name = 'MarkStoreError';
        this.status = status;
        this.retryable = retryable;
    }
}

/**
 * Canvas answers a GET for a scope that was never written with 404 or 400 ("no data for scope").
 * Those mean "no marks yet". Anything else is a failure to READ and is never treated as empty.
 */
export function isNoDataStatus(status) {
    return status === 404 || status === 400;
}

/** Transient statuses worth retrying: rate limiting (Canvas uses 403), timeouts and server errors. */
export function isRetryableStatus(status) {
    return status === 403 || status === 408 || status === 429 || status >= 500;
}

/** Stored values may be a JSON string (legacy) or native JSON (current). */
export function parseStoredValue(value) {
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch (e) {
        throw new MarkStoreError(`Stored mark data is not valid JSON: ${e.message}`, {retryable: false});
    }
}

function onlyIdLists(map) {
    const out = {};
    if (!map || typeof map !== 'object' || Array.isArray(map)) return out;
    for (const [key, ids] of Object.entries(map)) {
        if (Array.isArray(ids)) out[key] = ids.slice();
    }
    return out;
}

/** Legacy marks overlaid with per-discussion marks (per-discussion wins per key). */
export function mergeMarkData(legacy, perDiscussion) {
    return {...onlyIdLists(legacy), ...onlyIdLists(perDiscussion)};
}

/** Applies clicks made before the saved marks were readable: {taskId: checked}. */
export function applyPendingOps(ids, pending) {
    const result = Array.isArray(ids) ? ids.slice() : [];
    for (const [taskId, checked] of Object.entries(pending || {})) {
        const at = result.indexOf(taskId);
        if (checked && at === -1) result.push(taskId);
        if (!checked && at > -1) result.splice(at, 1);
    }
    return result;
}

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs fn, retrying retryable failures with exponential backoff and jitter.
 * Delays (before jitter) with defaults: 0.5s, 1s, 2s, 4s, 8s, 15s.
 */
export async function withRetry(fn, {
    attempts = 7,
    baseMs = 500,
    maxMs = 15000,
    sleep = defaultSleep,
    random = Math.random,
} = {}) {
    for (let attempt = 1; ; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt >= attempts || (error && error.retryable === false)) throw error;
            const delay = Math.min(maxMs, baseMs * 2 ** (attempt - 1));
            await sleep(Math.round(delay * (0.75 + random() * 0.5)));
        }
    }
}

/**
 * Serialises saves: only one runs at a time, and clicks that arrive meanwhile collapse into one
 * more run that saves the latest state. The returned promise settles when the queue is idle and
 * rejects only if the final save failed.
 */
export function createSaveQueue(saveFn) {
    let running = null;
    let dirty = false;
    return function requestSave() {
        dirty = true;
        if (!running) {
            running = (async () => {
                let lastError = null;
                while (dirty) {
                    dirty = false;
                    try {
                        await saveFn();
                        lastError = null;
                    } catch (e) {
                        lastError = e;
                    }
                }
                running = null;
                if (lastError) throw lastError;
            })();
        }
        return running;
    };
}

export function createMarkStore({ns, getCsrfToken, fetchFn = (...args) => fetch(...args)}) {
    const url = (scope) => `/api/v1/users/self/custom_data/${scope}?ns=${ns}`;

    async function send(scope, init) {
        try {
            return await fetchFn(url(scope), {
                credentials: 'include',
                ...init,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-Token': getCsrfToken(),
                    ...(init.headers || {}),
                },
            });
        } catch (cause) {
            throw new MarkStoreError(`Network error: ${cause && cause.message}`, {retryable: true});
        }
    }

    function assertOk(response) {
        if (!(response.status >= 200 && response.status < 300)) {
            throw new MarkStoreError(`HTTP ${response.status}`, {
                status: response.status,
                retryable: isRetryableStatus(response.status),
            });
        }
    }

    /** Resolves the stored value, or undefined when nothing was ever stored. Rejects on any failure. */
    async function get(scope) {
        const response = await send(scope, {method: 'GET'});
        if (isNoDataStatus(response.status)) return undefined;
        assertOk(response);
        let body;
        try {
            body = await response.json();
        } catch (e) {
            throw new MarkStoreError(`Unreadable response: ${e.message}`, {retryable: true});
        }
        return parseStoredValue(body.data);
    }

    async function put(scope, value) {
        const response = await send(scope, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({data: value}),
        });
        assertOk(response);
    }

    return {
        /** All of the student's marks for the course, from both layouts. Rejects if either read fails. */
        async loadAll() {
            const [legacy, current] = await Promise.all([get(ns), get(TASKS_SCOPE)]);
            return mergeMarkData(legacy, current);
        },

        /** Writes one discussion's ids. Cannot affect any other discussion. */
        async saveDiscussion(key, ids) {
            if (!TASK_KEY_RE.test(key)) {
                throw new MarkStoreError(`Invalid discussion key: ${key}`, {retryable: false});
            }
            await put(`${TASKS_SCOPE}/${key}`, ids);
        },
    };
}
