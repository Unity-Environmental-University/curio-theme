// File: tests/modules/canvasModuleUtils.test.ts

import {useCanvasModuleUtils} from '../../src/toolbox/canvasModuleUtils.js';


describe('canvasModuleUtils - matchesModuleItem', () => {
    let moduleUtils;
    let originalWindowLocation;

    function defineWindowUrl(href) {

        Object.defineProperty(window, 'location', {
            writable: true,
            value: {href}

        });
        moduleUtils = useCanvasModuleUtils();

    }

    beforeEach(() => {

        originalWindowLocation = window.location;

        // Override window.location for each test
        Object.defineProperty(window, 'location', {
            writable: true,
            value: {href: 'http://example.com/?module_item_id=123'}

        });
        moduleUtils = useCanvasModuleUtils();


    });

    afterEach(() => {
        // Restore the original window.location after each test
        Object.defineProperty(window, 'location', {
            writable: true,
            value: originalWindowLocation
        });
    })

    test('should return false if moduleItem is undefined', () => {
        const result = moduleUtils.matchesModuleItem(undefined);
        expect(result).toBe(false);
    });

    test('should return true when info type is Module Item and moduleItem id matches info id', () => {
        const moduleItem = {id: '123', current: true, type: 'Module Item'};
        const result = moduleUtils.matchesModuleItem(moduleItem);
        expect(result).toBe(true);
    });

    test('should return false when info type is Module Item and moduleItem id does not match info id', () => {
        const moduleItem = {id: '456', current: true, type: 'Module Item'};
        const result = moduleUtils.matchesModuleItem(moduleItem);
        expect(result).toBe(false);
    });

    test('should return true when info type is Page and moduleItem.page_url matches info id', () => {
        defineWindowUrl('https://example.com/pages/abc');
        const moduleUtils = useCanvasModuleUtils();
        const moduleItem = {page_url: 'abc', type: 'Page'};
        const result = moduleUtils.matchesModuleItem(moduleItem);
        expect(result).toBe(true);
    });

    test('should return false when info type is Page but moduleItem.page_url does not match info id', () => {
        defineWindowUrl('https://example.com/pages/abc');
        const moduleUtils = useCanvasModuleUtils();
        const moduleItem = {page_url: 'def', type: 'Page'};
        const result = moduleUtils.matchesModuleItem(moduleItem);
        expect(result).toBe(false);
    });


    test('should return false if moduleItem type is not included in urlTypes', () => {
        const moduleItem = {id: '123', type: 'NotIncluded'};
        const result = moduleUtils.matchesModuleItem(moduleItem);
        expect(result).toBe(false);
    });
});