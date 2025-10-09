// File: src/modules/currentModuleHelper.test.js

import { currentModuleHelper } from '../../src/toolbox/currentModuleHelper.js';
import * as canvasModuleUtilsModule from '../../src/toolbox/canvasModuleUtils.js';

// Create a dummy implementation for useCanvasModuleUtils
const dummyModuleUtils = {
    matchesModuleItem: (item) => item.current === true
};

jest.spyOn(canvasModuleUtilsModule, 'useCanvasModuleUtils').mockImplementation(() => dummyModuleUtils);

describe('currentModuleHelper', () => {
    const moduleItemCurrent = { id: 'current', current: true, type: 'Module Item' };
    const moduleItemNotCurrent = { id: 'not_current', current: false, type: 'Module Item' };

    const modulesData = [
        {
            items: [
                moduleItemNotCurrent,
                moduleItemNotCurrent
            ]
        },
        {
            items: [
                moduleItemNotCurrent,
                moduleItemCurrent, // current item for this module
                moduleItemNotCurrent
            ]
        },
    ];

    test('getCurrModuleItem returns the current module item if present', () => {
        const helper = currentModuleHelper(modulesData);
        const modItems = modulesData[1].items;
        const currentItem = helper.getCurrModuleItem(modItems);
        expect(currentItem).toBe(moduleItemCurrent);
    });

    test('getCurrModuleItem returns false if no item is current', () => {
        const helper = currentModuleHelper(modulesData);
        const modItems = modulesData[0].items;
        const currentItem = helper.getCurrModuleItem(modItems);
        expect(currentItem).toBe(false);
    });

    test('getCurrentModule returns the module containing a current module item', () => {
        const helper = currentModuleHelper(modulesData);
        const currentModule = helper.getCurrentModule();
        // should return the second module as it contains the current item
        expect(currentModule).toBe(modulesData[1]);
    });

    test('getCurrentModule returns false if no module has a current module item', () => {
        const data = [
            { items: [ moduleItemNotCurrent, moduleItemNotCurrent ] },
            { items: [ moduleItemNotCurrent ] },
        ];
        const helper = currentModuleHelper(data);
        const currentModule = helper.getCurrentModule();
        // reduce returns 0 if nothing is found so checking for falsy value
        expect(currentModule).toBeFalsy();
    });
});

