/**
 * @jest-environment jsdom
 */
import {afterInit} from "../../src/client/afterInit.js";

const makeClient = () => {
    const client = {
        getCourseID: () => null,
        getPageTitle: () => "",
        displayHomeBtn: jest.fn(),
    };
    afterInit(client);
    client.apiFunctions = jest.fn();
    return client;
};

const bottleneckScripts = () =>
    Array.from(document.head.querySelectorAll("script")).filter((s) => s.src.includes("bottleneck"));

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("afterInit Bottleneck loading", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        document.body.innerHTML = "";
        delete global.Bottleneck;
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.Bottleneck;
    });

    test("fallback path passes the client to apiFunctions and does not throw", async () => {
        const client = makeClient();
        client.getCourseID = () => "123";
        client.fetchResults = jest.fn(() => Promise.resolve());

        client.interactiveSetup();

        global.Bottleneck = class { constructor() {} };
        bottleneckScripts().forEach((s) => s.onload());
        await flush();

        expect(client.apiFunctions).toHaveBeenCalledTimes(1);
        expect(client.apiFunctions).toHaveBeenCalledWith(client);
    });

    test("concurrent callers inject only one script", () => {
        const client = makeClient();
        client.initBottleneck();
        client.initBottleneck();
        client.initBottleneck();
        // makeClient's own preload call plus the three above share one script
        expect(bottleneckScripts()).toHaveLength(1);
    });

    test("a failed script load rejects and allows retry", async () => {
        const client = makeClient();
        const p = client.initBottleneck();
        bottleneckScripts()[0].onerror();
        await expect(p).rejects.toThrow(/Failed to load Bottleneck/);

        client.initBottleneck().catch(() => {});
        expect(bottleneckScripts()).toHaveLength(1);
    });

    test("resolves only after the script has loaded", async () => {
        const client = makeClient();
        let resolved = false;
        client.initBottleneck().then(() => { resolved = true; });
        await flush();
        expect(resolved).toBe(false);

        global.Bottleneck = class { constructor() {} };
        bottleneckScripts()[0].onload();
        await flush();
        expect(resolved).toBe(true);
        expect(client.limiter).toBeInstanceOf(global.Bottleneck);
    });
});
