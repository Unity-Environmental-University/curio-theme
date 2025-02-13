import {createApiFunctions} from "./createApiFunctions.js";

export const afterInit = (scaffoldClient) => {
    /** Variables configuration */

    scaffoldClient.preloadPromises = [];

    scaffoldClient.courseData = {
        currentItem: null,
        markableDiscussions: {},
        currentModule: {},
        modules: [],
        saveModuleItems: function (data) {/* save all the module items information */
            if (typeof data !== 'object' || data.length === 0) {
                return Promise.resolve(false);
            }
            let tester = scaffoldClient.courseData.modules.find((d) => data[0].id === d.id);
            if (!tester) scaffoldClient.courseData.modules = scaffoldClient.courseData.modules.concat(Array.from(data));
            return Promise.resolve();
        },
        saveCurrentModule: function (data) {/* save the module information for current page */
            if (typeof data !== 'object' || data.length === 0) {
                let currentDiscussionUrl = "/api/v1/courses/" + scaffoldClient.getCourseID() + "/discussion_topics?per_page=100&i&search_term=" + scaffoldClient.getPageTitle();
                scaffoldClient.preloadPromises.push(scaffoldClient.fetchResults(currentDiscussionUrl, scaffoldClient.courseData.saveCurrentItem));
                return Promise.resolve(false);
            }
            var modules = [];
            for (let module of data) {
                if (Array.from(module.items).find(item => item.title.trim() === scaffoldClient.getPageTitle().trim())) {
                    scaffoldClient.courseData.currentItem = Array.from(module.items).find(item => item.title.trim() === scaffoldClient.getPageTitle().trim());
                    modules.push(module);
                }
            }

            /* It is possible the user insert same page in two different modules. We only handle the first one. */
            if (modules.length > 0) {
                scaffoldClient.courseData.currentModule = modules[0];
                return Promise.resolve();
            } else {
                scaffoldClient.courseData.currentItem = null;

                let currentDiscussionUrl = "/api/v1/courses/" + scaffoldClient.getCourseID() + "/discussion_topics?per_page=100&i&search_term=" + scaffoldClient.getPageTitle();
                scaffoldClient.preloadPromises.push(scaffoldClient.fetchResults(currentDiscussionUrl, scaffoldClient.courseData.saveCurrentItem));

                Promise.resolve(console.log("SaveCurrentModule: the page is not in any module"));
            }
        },
        saveCurrentItem: function (data) {/* save current item information - mainly design for discussion*/
            if (typeof data !== 'object' || data.length === 0) {
                return Promise.resolve(false);
            }
            data[0]['type'] = 'Discussion';
            scaffoldClient.courseData.currentItem = data[0];
            return Promise.resolve();
        },
        saveMarkableDiscussions: function (discussions) {
            if (typeof discussions !== 'object' || Object.keys(discussions).length === 0) {
                return Promise.resolve();
            }
            scaffoldClient.courseData.markableDiscussions = JSON.parse(discussions.data);
            return Promise.resolve();
        }
    };

    /** End of variables configuration */

    /** Pagination Configuration */

    /**
     * Bottlneck js is a library that allows you to throttle requests. This is an
     * advanced section for those who want to tweak the settings or who have large
     * classes and find that the report is not running. If you exceed the
     * x-rate-limit-remaining value, then Canvas will shut down the requests.
     */

    /**
     * minTime specifies the number of milliseconds you must wait between
     * successive API calls. Making them all at the same time imposes a penalty
     * that can quickly deplete the Canvas x-rate-limit-remaining value. This will
     * have a greater impact than maxConcurrent and if your network calls are too
     * excessive, try increasing this first.
     */
    scaffoldClient.minTime = 30;

    /**
     * maxConcurrent specifies the maximum number of concurrent requests that can
     * be made.
     */
    scaffoldClient.maxConcurrent = 25;

    scaffoldClient.failedFetches = {};
    scaffoldClient.limiter = null;
    scaffoldClient.minimumRateRemaining = null;
    scaffoldClient.maximumRequestCost = null;

    scaffoldClient.initBottleneck = function () {
        return new Promise(function (res, rej) {
            if (typeof Bottleneck === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/bottleneck@2/light.min.js';
                script.onload = function () {
                    scaffoldClient.initBottleneck().then(
                        res()
                    );
                };
                document.head.appendChild(script);
            } else {
                scaffoldClient.limiter = new Bottleneck({
                    'maxConcurrent': scaffoldClient.maxConcurrent,
                    'minTime': scaffoldClient.minTime,
                });
                console.log("bottleneck is resolved!");
                res();
            }
        })
    }

    // set up bottleneck for API calls
    // pre-load some api calls here
    scaffoldClient.initBottleneck().then(async function () {
        if (scaffoldClient.getCourseID()) {
            // Get and saved the discussion
            let discussionUrl = "/api/v1/users/self/custom_data/cbt_discussion_" + scaffoldClient.getCourseID() + "?ns=cbt_discussion_" + scaffoldClient.getCourseID()
            scaffoldClient.preloadPromises.push(scaffoldClient.fetchResults(discussionUrl, scaffoldClient.courseData.saveMarkableDiscussions));

            // Get current module id
            let currentModuleUrl = "/api/v1/courses/" + scaffoldClient.getCourseID() + "/modules?per_page=100&include[]=items&search_term=" + scaffoldClient.getPageTitle();
            scaffoldClient.preloadPromises.push(scaffoldClient.fetchResults(currentModuleUrl, scaffoldClient.courseData.saveCurrentModule));

            // get all modules and module items information
            let moduleItemUrl = origin + "/api/v1/courses/" + scaffoldClient.getCourseID() + "/modules?per_page=100&include[]=items";
            scaffoldClient.preloadPromises.push(scaffoldClient.fetchResults(moduleItemUrl, scaffoldClient.courseData.saveModuleItems));
        }
    });

    scaffoldClient.checkFailed = function () {
        const urls = Object.keys(scaffoldClient.failedFetches);
        if (urls.length > 0) {
            console.log("failed fetches found: " + urls);
            scaffoldClient.limiter.updateSettings({
                'maxConcurrent': Math.floor(Math.max(5, scaffoldClient.maxConcurrent / 2)),
                'minTime': scaffoldClient.minTime < 30 ? 45 : Math.floor(scaffoldClient.minTime * 1.5),
            });
            return scaffoldClient.fetchResults(urls);
        } else {
            return Promise.resolve(false);
        }
    }

    scaffoldClient.fetchResults = function (url, callback) {
        if (typeof url === 'object') {
            const p = [];
            if (Array.isArray(url)) {
                url.forEach(function (u) {
                    p.push(scaffoldClient.fetchResult(u, callback));
                });
            } else {
                const keys = Object.keys(url);
                keys.forEach(function (u) {
                    p.push(scaffoldClient.fetchResult(u, url[u]));
                });
            }
            return p.length > 0 ? Promise.all(p) : Promise.resolve(false);
        } else {
            return scaffoldClient.fetchResult(url, callback);
        }
    }

    scaffoldClient.fetchResult = function (url, callback) {
        let links;
        return scaffoldClient.limiter.schedule(function () {
            const options = {
                'method': 'GET',
                'headers': {
                    'accept': 'application/json',
                },
                'credentials': 'same-origin',
                'timeout': 30000,
            };
            return fetch(url, options);
        }).then(function (res) {
            if (res.ok) {
                links = res.headers.get('link') ? scaffoldClient.extractLinks(res.headers.get('link')) : null;
                return res.json();
            } else if (res.status === 403) {
                if (typeof scaffoldClient.failedFetches[res.url] !== 'undefined') {
                    if (debug) {
                        console.log('FETCH FAILED A SECOND TIME');
                        console.log(res.headers.entries());
                    }
                    return Promise.reject('A fetch failed for the second time, giving up.');
                } else {
                    scaffoldClient.failedFetches[res.url] = callback;
                    if (debug) {
                        console.log(`FAILED FAILED : ${res.url}`);
                    }
                }
                return Promise.resolve(true);
            } else {
                return Promise.reject(`Got an HTTP status of ${res.status}`);
            }
        }).then(function (json) {
            if (typeof json === 'object') {
                return typeof callback === 'function' ? callback(json, links) : Promise.resolve(json);
            } else {
                return Promise.resolve(false);
            }
        }).then(function () {
            const additionalLinks = scaffoldClient.nextPage(links);
            if (additionalLinks !== false && additionalLinks.length > 0) {
                return scaffoldClient.fetchResults(additionalLinks, callback);
            } else {
                return Promise.resolve(true);
            }
        }).catch(function (e) {
            // Suppress warnings when canceled
            if (Bottleneck && !(e instanceof Bottleneck.BottleneckError)) {
                console.log(`Error: ${e}`);
            }
        });
    }

    scaffoldClient.calculateLimits = function (res) {
        const xremaining = parseFloat(res.headers.get('x-rate-limit-remaining'));
        const xcost = parseFloat(res.headers.get('x-request-cost'));
        if (scaffoldClient.minimumRateRemaining === null || xremaining < scaffoldClient.minimumRateRemaining) {
            scaffoldClient.minimumRateRemaining = xremaining;
        }
        if (scaffoldClient.maximumRequestCost === null || xcost > scaffoldClient.maximumRequestCost) {
            scaffoldClient.maximumRequestCost = xcost;
        }
        const outstat = [Date.now().toString(), xremaining, xcost, res.url];
        console.log(outstat.join('\t'));
    }

    scaffoldClient.extractLinks = function (hdr) {
        const linkRegex = new RegExp('^<(.*?)>; rel="(current|first|last|next|prev)"$');
        const linkStr = hdr.split(',');
        const links = {};
        for (let i = 0; i < linkStr.length; i++) {
            const matches = linkRegex.exec(linkStr[i]);
            if (matches) {
                const linkUrl = matches[1];
                const linkType = matches[2];
                links[linkType] = linkUrl;
            }
        }
        return links;
    }

    scaffoldClient.paginationInfo = function (link) {
        if (typeof link !== 'string' || link === '') {
            return false;
        }
        const url = new URL(link);
        const params = url.searchParams;
        const page = params.get('page');
        const perPage = params.get('per_page') || 10;
        const isNumeric = /^[0-9]+$/.test(page);
        return {
            'url': url,
            'page': isNumeric ? parseInt(page, 10) : page,
            'perPage': perPage,
            'isNumeric': isNumeric,
        };
    }

    scaffoldClient.nextPage = function (links) {
        if (!links || typeof links === 'undefined' || typeof links.next === 'undefined') {
            return false;
        }
        const results = [];
        if (typeof links.last !== 'undefined') {
            const next = paginationInfo(links.next);
            const last = paginationInfo(links.last);
            if (next.isNumeric && next.page === 2 && last.isNumeric) {
                results.push(links.next);
                const url = next.url;
                for (let i = next.page; i < last.page; i++) {
                    url.searchParams.set('page', i + 1);
                    results.push(url.toString());
                }
            }
        }
        if (results.length === 0) {
            results.push(links.next);
        }
        return results.length > 0 ? results : false;
    }
    /** End of pagination configuration */
    scaffoldClient.interactiveSetup = function () {
        // functions doesn't requires API

        // display the page title while it is not using the style
        if (!document.querySelector(".cbt-banner") && document.querySelector("h1.page-title")) {
            document.querySelector("h1.page-title").style.display = "block";
        }

        if (document.querySelector(".cbt-home-button a")) {
            scaffoldClient.displayHomeBtn();
        }

        if ("undefined" === typeof tinymce || !tinymce.hasOwnProperty("activeEditor") || !tinymce.activeEditor) {
            if (typeof scaffoldClient.accordionList === 'function') {
                scaffoldClient.accordionList();
            }

            if (typeof scaffoldClient.mutipleAccordion === 'function') {
                scaffoldClient.mutipleAccordion();
            }

            if (typeof scaffoldClient.tab === 'function') {
                scaffoldClient.tab();
            }

            // make sure limiter is set before calling apis
            if (typeof Bottleneck != 'undefined' && scaffoldClient.limiter && scaffoldClient.getCourseID) {
                scaffoldClient.apiFunctions(scaffoldClient);
            } else {
                scaffoldClient.initBottleneck().then(function () {
                    if (scaffoldClient.getCourseID()) {
                        scaffoldClient.apiFunctions();
                    }
                });
            }
        }
    }

    scaffoldClient.apiFunctions = createApiFunctions;

};