import {useDocInfo} from "../../src/client/hooks/useDocInfo.js";


jest.mock('../../src/client/hooks/useDocInfo.js', () => ({
    useDocInfo: () => ({
        origin:  'https://example.com',
    })
}));
import {getModUrl} from "../../src/toolbox/getModUrl.js";


describe('getModUrl', () => {
    let scaffoldClient;


    it('should return "#" when module is locked', () => {
        const module = {state: 'locked'};
        const firstItem = {type: 'ExternalTool'};  // any value here
        expect(getModUrl(module, firstItem)).toBe('#');
    });

    it('should return "#" when firstItem is not provided', () => {
        const module = {state: 'active'};
        const firstItem = null;  // No firstItem

        expect(getModUrl(module, firstItem)).toBe('#');
    });

    it('should return firstItem.html_url when type is "ExternalTool"', () => {
        const module = {state: 'active'};
        const firstItem = {
            type: 'ExternalTool',
            html_url: '/path/to/external/tool'
        };
        expect(getModUrl(module, firstItem)).toBe('/path/to/external/tool');
    });

    it('should return a transformed URL when type is "ExternalUrl"', () => {
        const module = {state: 'active'};
        const firstItem = {
            type: 'ExternalUrl',
            html_url: '/api/v1/module_item_redirect/123'
        };
        expect(getModUrl(module, firstItem)).toBe('https://example.com/modules/items/123');
    });
    it('should return the formatted URL when firstItem has "url" property', () => {
        const module = {state: 'active'};
        const firstItem = {
            type: 'OtherType',
            url: '/api/v1/modules/123',
            id: '456'
        };
        expect(getModUrl(module, firstItem)).toBe('https://example.com/modules/123?module_item_id=456');
    });
    it('should return # with uncovered cases', () => {
        const module = {state: 'active'};
        const firstItem = {
            type: 'OtherType',
            id: '456'
        };
        expect(getModUrl(module, firstItem)).toBe('#');
    });
});
