import { getHomeCardsAsync } from '../../src/homeCards/getHomeCardsAsync.js';
import {useDocInfo} from "../../src/client/hooks/useDocInfo.js";
import {getModImgUrl} from "../../src/toolbox/getModImgUrl.js"; // Adjust the import path as necessary.
jest.mock('../../src/toolbox/getModImgUrl.js', () => ({
    getModImgUrl: jest.fn(),
}));
jest.mock('../../src/client/hooks/useDocInfo.js', () => ({
    useDocInfo: jest.fn(),
}))


describe('getHomeCardsAsync', () => {
    let scaffoldClient;
    let moduleCardsContainer;

    beforeEach(() => {
        // Set up DOM element for the test
        moduleCardsContainer = document.createElement('div');
        moduleCardsContainer.className = 'cbt-home-cards';
        document.body.appendChild(moduleCardsContainer);

        useDocInfo.mockReturnValue({
            origin: 'https://example/com/'
        })
        getModImgUrl.mockReturnValue('https://example.com/img/module1.jpg');

        // Create a mock of ScaffoldClient
        scaffoldClient = {
            courseData: {
                modules: [
                    {name: 'Module 1', items: [], state: 'active'},
                    {name: 'Module 2', items: [], state: 'active'},
                ],
            },
            preloadPromises: [Promise.resolve()],
        };
    });

    afterEach(() => {
        // Clean up the DOM element after each test
        document.body.removeChild(moduleCardsContainer);
    });

    it('should populate the home cards when valid modules are provided', async () => {
        await getHomeCardsAsync(scaffoldClient, scaffoldClient.courseData.modules);

        expect(moduleCardsContainer.innerHTML).toContain('Module 1');
        expect(moduleCardsContainer.innerHTML).toContain('Module 2');
        // Further assertions would depend on the generated HTML structure from renderHomeCardHtmlAsync
    });



    it('should resolve to false when invalid data is provided', async () => {
        const result = await getHomeCardsAsync(scaffoldClient, []);
        expect(result).toBe(false);
    })

    it('should populate the home cards when valid modules are provided', async () => {

        scaffoldClient.courseData.modules = [
            {name: 'Module 1 - Godzilla', items: [], state: 'active'},
            {name: 'Claim Badge - Godzilla Evac Route Captain', items: [], state: 'active'},
            {name: 'Godzilla Evac Route Captain - How Do I Earn It?', items: [], state: 'active'},

        ];

        await getHomeCardsAsync(scaffoldClient, scaffoldClient.courseData.modules);

        expect(moduleCardsContainer.innerHTML).toContain('ueu-weekly-module');
        expect(moduleCardsContainer.innerHTML).toContain('ueu-claim-badge-module');
        expect(moduleCardsContainer.innerHTML).toContain('ueu-earn-badge-module');
        // Further assertions would depend on the generated HTML structure from renderHomeCardHtmlAsync
    });

});




