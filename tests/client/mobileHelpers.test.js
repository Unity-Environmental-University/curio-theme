/**
 * @jest-environment jsdom
 */
import {createScaffoldClientMobile} from "../../src/client/createScaffoldClientMobile.js";

describe("mobile client shared helper calls", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        document.body.innerHTML = "";
        jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("onPageLoad passes the client to options.afterOnLoad", () => {
        const client = createScaffoldClientMobile({});
        const afterOnLoad = jest.fn();
        client.modules = [];
        client.options = {afterOnLoad};
        client.oninitset = true;

        client.onPageLoad();

        expect(afterOnLoad).toHaveBeenCalledTimes(1);
        expect(afterOnLoad).toHaveBeenCalledWith(client);
    });
});

describe("mainThemeMobile entry", () => {
    test("loads without reading ScaffoldClient before initialization", async () => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        delete window.ScaffoldClient;
        await expect(import("../../src/mainThemeMobile.js")).resolves.toBeDefined();
    });
});
