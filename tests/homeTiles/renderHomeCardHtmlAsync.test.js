jest.mock('../../src/toolbox/getModUrl.js');
import {getModUrl} from "../../src/toolbox/getModUrl.js";
import {renderHomeCardHtmlAsync} from "../../src/homeCards/renderHomeCardHtmlAsync.js";

describe('renderHomeCardHtmlAsync', () => {
    let scaffoldClient;
    let mod;
    let name;
    let state;


    beforeEach(() => {
        name = 'Module 1: Introduction';
        state = 'locked';

        scaffoldClient = {
            preloadPromises: [Promise.resolve()],
            getOrigin: jest.fn(() => 'https://example.com/'),
            getModImgURL: jest.fn(() => 'https://example.com/img/module1.jpg'),
        }

        mod = {
            name, state, items: [
                {completion_requirement: {completed: true}},
                {completion_requirement: {completed: true}},
                {completion_requirement: {completed: true}},
                {completion_requirement: {completed: false}},
                {completion_requirement: {completed: false}}
            ]
        };
    })

    it('should generate the correct HTML structure for a module card with completed items', async () => {
        const result = await renderHomeCardHtmlAsync(mod, scaffoldClient);
        expect(result).toContain('<a class="cbt-module-card cbt-module-locked"');
        expect(result).toContain('title="Module 1: Introduction"');
        expect(result).not.toContain('href="https://example.com/module1"');
        expect(result).toContain('<img src="https://example.com/img/module1.jpg"');
        expect(result).toContain('<p>Module 1</p>');
        expect(result).toContain('<h3>Introduction</h3>');
        expect(result).toContain('<b>3/5</b> complete');
    });

    it('should generate urls for nonlocked modules', async () => {
        getModUrl.mockImplementationOnce(() => 'https://example.com/module1');

        const result = await renderHomeCardHtmlAsync({
            state: "active", ...mod, items: [
                {completion_requirement: {completed: true}, html_url: 'https://example.com/'},
            ]
        }, scaffoldClient);

        expect(result).toContain('href="https://example.com/module1"');
    });



});
