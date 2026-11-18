import {migrateMarkData} from '../../src/toolbox/markableDiscussionUtils.js';

describe('migrateMarkData', () => {
    test('rewrites task-task- ids saved by the doubled-prefix bug', () => {
        const {data, changed} = migrateMarkData({
            'task-42': ['task-task-42-btn-0', 'task-task-42-btn-1'],
        });
        expect(changed).toBe(true);
        expect(data).toEqual({'task-42': ['task-42-btn-0', 'task-42-btn-1']});
    });

    test('de-duplicates entries after rewriting', () => {
        const {data, changed} = migrateMarkData({
            'task-42': ['task-task-42-btn-0', 'task-42-btn-0', 'task-task-42-btn-0'],
        });
        expect(changed).toBe(true);
        expect(data['task-42']).toEqual(['task-42-btn-0']);
    });

    test('collapses doubled prefixes on keys and merges', () => {
        const {data} = migrateMarkData({
            'task-task-7': ['task-task-7-btn-0'],
            'task-7': ['task-7-btn-1'],
        });
        expect(data).toEqual({'task-7': ['task-7-btn-0', 'task-7-btn-1']});
    });

    test('leaves clean data untouched and reports no change', () => {
        const input = {'task-1': ['task-1-btn-0'], 'task-2': []};
        const {data, changed} = migrateMarkData(input);
        expect(changed).toBe(false);
        expect(data).toEqual(input);
    });

    test('does not mutate its input', () => {
        const input = {'task-1': ['task-task-1-btn-0']};
        migrateMarkData(input);
        expect(input).toEqual({'task-1': ['task-task-1-btn-0']});
    });

    test('migrated marks match the ids rendered on reload and count once', () => {
        const {data} = migrateMarkData({'task-5': ['task-task-5-btn-0', 'task-task-5-btn-0']});
        const reloadedId = 'task-5-btn-0';
        expect(data['task-5'].indexOf(reloadedId)).toBeGreaterThan(-1);
        // progress logic requires >= 2 distinct marks; a duplicate must not inflate it
        expect(data['task-5'].length).toBe(1);
    });

    test.each([null, undefined, [], 'x', 5])('tolerates invalid input %p', (bad) => {
        expect(migrateMarkData(bad)).toEqual({data: {}, changed: false});
    });
});
