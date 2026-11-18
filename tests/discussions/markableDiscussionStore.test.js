import {
    createMarkStore,
    createSaveQueue,
    withRetry,
    applyPendingOps,
    mergeMarkData,
    parseStoredValue,
    isNoDataStatus,
    MarkStoreError,
} from '../../src/toolbox/markableDiscussionStore.js';
import {renderMarkButtons, showMarkSaveError, clearMarkSaveError} from '../../src/toolbox/markableDiscussionUtils.js';

const NS = 'cbt_discussion_123';

/** In-memory stand-in for Canvas custom_data. Missing scopes answer 400 like Canvas does. */
function fakeCanvas(initial = {}) {
    const stored = {...initial}; // scope -> value
    const calls = [];
    const failures = []; // queue of {method, status|throw} consumed in order
    const fetchFn = async (url, init) => {
        const scope = decodeURIComponent(url.split('/custom_data/')[1].split('?')[0]);
        calls.push({method: init.method, scope, body: init.body && JSON.parse(init.body)});
        const failure = failures.find((f) => f.method === init.method && (!f.scope || f.scope === scope) && f.times > 0);
        if (failure) {
            failure.times--;
            if (failure.throws) throw new TypeError('Failed to fetch');
            return {status: failure.status, json: async () => ({})};
        }
        if (init.method === 'GET') {
            // scope "tasks" returns every "tasks/<key>" value as a map, like Canvas nested scopes
            if (scope === 'tasks') {
                const map = {};
                for (const [s, v] of Object.entries(stored)) if (s.startsWith('tasks/')) map[s.slice(6)] = v;
                return Object.keys(map).length
                    ? {status: 200, json: async () => ({data: map})}
                    : {status: 400, json: async () => ({message: 'no data for scope'})};
            }
            return scope in stored
                ? {status: 200, json: async () => ({data: stored[scope]})}
                : {status: 400, json: async () => ({message: 'no data for scope'})};
        }
        stored[scope] = JSON.parse(init.body).data;
        return {status: 200, json: async () => ({data: stored[scope]})};
    };
    return {stored, calls, failures, fetchFn, puts: () => calls.filter((c) => c.method === 'PUT')};
}

const storeFor = (canvas) => createMarkStore({ns: NS, getCsrfToken: () => 'csrf', fetchFn: canvas.fetchFn});
const noSleep = {sleep: async () => {}};

describe('loading marks', () => {
    test('a first-time student (nothing stored) loads as empty', async () => {
        const canvas = fakeCanvas();
        await expect(storeFor(canvas).loadAll()).resolves.toEqual({});
        expect(canvas.puts()).toHaveLength(0);
    });

    test('reads the legacy single-blob layout (stored as a JSON string)', async () => {
        const canvas = fakeCanvas({[NS]: JSON.stringify({'task-1': ['task-1-btn-0'], 'task-2': ['task-2-btn-0', 'task-2-btn-1']})});
        await expect(storeFor(canvas).loadAll()).resolves.toEqual({
            'task-1': ['task-1-btn-0'],
            'task-2': ['task-2-btn-0', 'task-2-btn-1'],
        });
    });

    test('per-discussion value wins over legacy for that key only', async () => {
        const canvas = fakeCanvas({
            [NS]: JSON.stringify({'task-1': ['task-1-btn-0'], 'task-2': ['task-2-btn-0']}),
            'tasks/task-1': [], // student unchecked it after the switch
            'tasks/task-3': ['task-3-btn-0'],
        });
        await expect(storeFor(canvas).loadAll()).resolves.toEqual({
            'task-1': [],
            'task-2': ['task-2-btn-0'],
            'task-3': ['task-3-btn-0'],
        });
    });

    test.each([
        ['403 rate limit', {status: 403}],
        ['429', {status: 429}],
        ['500', {status: 500}],
        ['503', {status: 503}],
        ['network error', {throws: true}],
    ])('a %s on either read rejects as retryable and is never treated as empty', async (_name, failure) => {
        for (const scope of [NS, 'tasks']) {
            const canvas = fakeCanvas({[NS]: JSON.stringify({'task-1': ['task-1-btn-0']})});
            canvas.failures.push({method: 'GET', scope, times: 1, ...failure});
            await expect(storeFor(canvas).loadAll()).rejects.toMatchObject({retryable: true});
            expect(canvas.puts()).toHaveLength(0);
        }
    });

    test('corrupt stored JSON is a non-retryable failure', async () => {
        const canvas = fakeCanvas({[NS]: '{not json'});
        await expect(storeFor(canvas).loadAll()).rejects.toMatchObject({retryable: false});
    });

    test('other 4xx (e.g. 401) are not retried', async () => {
        const canvas = fakeCanvas();
        canvas.failures.push({method: 'GET', scope: NS, times: 1, status: 401});
        await expect(storeFor(canvas).loadAll()).rejects.toMatchObject({status: 401, retryable: false});
    });

    test('400 and 404 count as "no data"', () => {
        expect(isNoDataStatus(400)).toBe(true);
        expect(isNoDataStatus(404)).toBe(true);
        expect(isNoDataStatus(500)).toBe(false);
    });
});

describe('saving marks', () => {
    test('writes only that discussion under tasks/<key> and never touches the legacy blob', async () => {
        const legacy = JSON.stringify({'task-1': ['task-1-btn-0']});
        const canvas = fakeCanvas({[NS]: legacy});
        await storeFor(canvas).saveDiscussion('task-2', ['task-2-btn-0']);
        expect(canvas.puts()).toEqual([{method: 'PUT', scope: 'tasks/task-2', body: {data: ['task-2-btn-0']}}]);
        expect(canvas.stored[NS]).toBe(legacy);
    });

    test('marking discussion B leaves discussion A stored entry untouched', async () => {
        const canvas = fakeCanvas();
        const store = storeFor(canvas);
        await store.saveDiscussion('task-1', ['task-1-btn-0', 'task-1-btn-1']);
        await store.saveDiscussion('task-2', ['task-2-btn-0']);
        expect(canvas.stored['tasks/task-1']).toEqual(['task-1-btn-0', 'task-1-btn-1']);
        await expect(store.loadAll()).resolves.toEqual({
            'task-1': ['task-1-btn-0', 'task-1-btn-1'],
            'task-2': ['task-2-btn-0'],
        });
    });

    test('rejects when the PUT fails', async () => {
        const canvas = fakeCanvas();
        canvas.failures.push({method: 'PUT', times: 1, status: 500});
        await expect(storeFor(canvas).saveDiscussion('task-1', [])).rejects.toMatchObject({retryable: true});
    });

    test('refuses a key that is not task-<digits> without making a request', async () => {
        const canvas = fakeCanvas();
        await expect(storeFor(canvas).saveDiscussion('../evil', [])).rejects.toBeInstanceOf(MarkStoreError);
        expect(canvas.calls).toHaveLength(0);
    });
});

describe('withRetry', () => {
    const half = () => 0.5; // jitter factor of exactly 1.0

    test('backs off exponentially and succeeds once the failure clears', async () => {
        const sleeps = [];
        let n = 0;
        const result = await withRetry(async () => {
            if (++n < 4) throw new MarkStoreError('HTTP 503', {retryable: true});
            return 'ok';
        }, {sleep: async (ms) => sleeps.push(ms), random: half});
        expect(result).toBe('ok');
        expect(sleeps).toEqual([500, 1000, 2000]);
    });

    test('caps the delay', async () => {
        const sleeps = [];
        await expect(withRetry(async () => { throw new MarkStoreError('x'); },
            {attempts: 8, sleep: async (ms) => sleeps.push(ms), random: half})).rejects.toThrow();
        expect(Math.max(...sleeps)).toBe(15000);
        expect(sleeps).toHaveLength(7);
    });

    test('gives up after the last attempt with the last error', async () => {
        let n = 0;
        await expect(withRetry(async () => { throw new MarkStoreError(`fail ${++n}`); }, {attempts: 3, ...noSleep})).rejects.toThrow('fail 3');
    });

    test('does not retry a non-retryable error', async () => {
        let n = 0;
        await expect(withRetry(async () => { n++; throw new MarkStoreError('bad', {retryable: false}); }, noSleep)).rejects.toThrow('bad');
        expect(n).toBe(1);
    });
});

describe('save queue', () => {
    test('runs one save at a time and collapses clicks made meanwhile into one more save of the latest state', async () => {
        const saved = [];
        let state = 0;
        let release;
        const q = createSaveQueue(() => {
            const snapshot = state;
            return new Promise((resolve) => { release = () => { saved.push(snapshot); resolve(); }; });
        });
        state = 1; const first = q();
        state = 2; q();
        state = 3; q();
        release();           // finishes the in-flight save of state 1
        await Promise.resolve(); await Promise.resolve();
        release();           // the single follow-up save sees the latest state (3)
        await first;
        expect(saved).toEqual([1, 3]);
    });

    test('rejects if the final save failed, and recovers on the next request', async () => {
        let fail = true;
        const q = createSaveQueue(async () => { if (fail) throw new Error('nope'); });
        await expect(q()).rejects.toThrow('nope');
        fail = false;
        await expect(q()).resolves.toBeUndefined();
    });
});

describe('read failure then click (the original bug)', () => {
    test('retries in the background, applies the click on top of the loaded marks, sends one PUT for that discussion only', async () => {
        const canvas = fakeCanvas({
            [NS]: JSON.stringify({'task-1': ['task-1-btn-0', 'task-1-btn-1'], 'task-2': ['task-2-btn-0']}),
        });
        canvas.failures.push({method: 'GET', times: 4, status: 503}); // first attempt fails on both reads, then more
        const store = storeFor(canvas);

        // page load: the first read fails, the student clicks anyway
        await expect(store.loadAll()).rejects.toThrow();
        const pending = {'task-2-btn-1': true};
        expect(canvas.puts()).toHaveLength(0); // nothing written while the marks are unknown

        // background recovery
        const loaded = await withRetry(() => store.loadAll(), noSleep);
        loaded['task-2'] = applyPendingOps(loaded['task-2'], pending);
        await store.saveDiscussion('task-2', loaded['task-2']);

        expect(canvas.puts()).toEqual([{method: 'PUT', scope: 'tasks/task-2', body: {data: ['task-2-btn-0', 'task-2-btn-1']}}]);
        await expect(store.loadAll()).resolves.toEqual({
            'task-1': ['task-1-btn-0', 'task-1-btn-1'], // untouched
            'task-2': ['task-2-btn-0', 'task-2-btn-1'],
        });
    });

    test('a failed PUT is retried and eventually lands', async () => {
        const canvas = fakeCanvas();
        canvas.failures.push({method: 'PUT', times: 2, status: 502});
        const store = storeFor(canvas);
        await withRetry(() => store.saveDiscussion('task-9', ['task-9-btn-0']), {attempts: 5, ...noSleep});
        expect(canvas.stored['tasks/task-9']).toEqual(['task-9-btn-0']);
        expect(canvas.puts()).toHaveLength(3);
    });
});

describe('pure helpers', () => {
    test('applyPendingOps adds, removes and does not mutate or duplicate', () => {
        const ids = ['a', 'b'];
        expect(applyPendingOps(ids, {c: true, a: false, b: true})).toEqual(['b', 'c']);
        expect(ids).toEqual(['a', 'b']);
        expect(applyPendingOps(undefined, {a: true})).toEqual(['a']);
    });

    test('mergeMarkData ignores non-list values and bad input', () => {
        expect(mergeMarkData({a: ['x'], b: 'junk'}, null)).toEqual({a: ['x']});
        expect(mergeMarkData(undefined, [1])).toEqual({});
    });

    test('parseStoredValue passes native values through and parses strings', () => {
        expect(parseStoredValue({a: []})).toEqual({a: []});
        expect(parseStoredValue('{"a":[]}')).toEqual({a: []});
        expect(() => parseStoredValue('{x')).toThrow(MarkStoreError);
    });
});

describe('button rendering', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div class="cbt-manual-mark-btn"></div><div class="cbt-manual-mark-btn"></div>';
    });

    test('renders Done for saved ids, Mark as done otherwise, and reports clicks', () => {
        const clicks = [];
        renderMarkButtons(document.querySelectorAll('.cbt-manual-mark-btn'), 'task-5', ['task-5-btn-1'], (id) => clicks.push(id));
        const [b0, b1] = document.querySelectorAll('.cbt-manual-mark-btn button');
        expect(b0.getAttribute('data-discussion-done-id')).toBe('task-5-btn-0');
        expect(b0.classList.contains('utc-mark-done')).toBe(false);
        expect(b1.classList.contains('utc-mark-done')).toBe(true);
        b0.click();
        expect(clicks).toEqual(['task-5-btn-0']);
    });

    test('save error shows once and clears on success', () => {
        const container = document.querySelector('.cbt-manual-mark-btn');
        container.innerHTML = '<button class="btn"></button>';
        const btn = container.querySelector('button');
        showMarkSaveError(btn);
        showMarkSaveError(btn);
        expect(container.querySelectorAll('.mark-done-error')).toHaveLength(1);
        clearMarkSaveError(btn);
        expect(container.querySelector('.mark-done-error')).toBeNull();
    });
});
