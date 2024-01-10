var ScaffoldClient = (function (m) {

    m.modules = [
            {
                id: 'carousel_1'
            },
            {
                id: 'callout_box_10'
            },
            {
                id: 'image_12'
            },
            {
                id: 'page_banner_w_image_96'
            },
            {
                id: 'tabs_24'
            },
            {
                id: 'uta_staff_card_244'
            },
            {
                id: 'utc_accordion_242'
            },
            {
                id: 'utc_audio_251'
            },
            {
                id: 'utc_blockquote_248'
            },
            {
                id: 'utc_button_228'
            },
            {
                id: 'utc_callout_box_239'
            },
            {
                id: 'page_banner_w_image_copy_229'
            },
            {
                id: 'utc_home_footer_237'
            },
            {
                id: 'utc_lined_heading_234'
            },
            {
                id: 'utc_media_container_252'
            },
            {
                id: 'utc_module_cards_236'
            },
            {
                id: 'utc_page_as_agreement_238'
            },
            {
                id: 'utc_pages_banner_247'
            },
            {
                id: 'utc_progress_and_continue_253'
            },
            {
                id: 'utc_rubric_btn_230'
            },
            {
                id: 'utc_table_240'
            },
            {
                id: 'utc_tabs_243'
            },
            {
                id: 'utc_two_columns_233'
            },
            {
                id: 'utc_video_232'
            },
            {
                id: 'utc_videos_carousel_241'
            },
            {
                id: 'utc_weekly_mat_topics_249'
            }];

    m.onloadset = false;
	m.oninitset = false;

    m.loadcheck = false;
    m.loadcount = 0;

    m.options = {
        source: 'api',
        origin: document.location.origin,
        afterInit: () => {
            /** Variables configuration */

ScaffoldClient.preloadPromises = [];
ScaffoldClient.courseData = {
    currentItem: null,
    currentModule: {},
    currentActivities: [],
    modules: [],
    saveModuleItems: function (data) {/* save all the module items information */
        if (typeof data !== 'object' || data.length === 0) {
            return Promise.resolve(false);
        }
        let tester = ScaffoldClient.courseData.modules.find((d) => data[0].id === d.id);
        if(!tester) ScaffoldClient.courseData.modules = ScaffoldClient.courseData.modules.concat(Array.from(data));
        return Promise.resolve();
    },
    saveCurrentModule: function (data) {/* save the module information for current page */
        if (typeof data !== 'object' || data.length === 0) {
            let currentDiscussionUrl = "/api/v1/courses/" + ScaffoldClient.getCourseID() + "/discussion_topics?per_page=100&i&search_term=" + ScaffoldClient.getPageTitle();
            ScaffoldClient.preloadPromises.push(ScaffoldClient.fetchResults(currentDiscussionUrl, ScaffoldClient.courseData.saveCurrentItem));
            return Promise.resolve(false);
        }
        var modules = [];
        for (let module of data) {
            if (Array.from(module.items).find(item => item.title.trim() === ScaffoldClient.getPageTitle().trim())) {
                ScaffoldClient.courseData.currentItem = Array.from(module.items).find(item => item.title.trim() === ScaffoldClient.getPageTitle().trim());
                modules.push(module);
            }
        }

        /* It is possible the user insert same page in two different modules. We only handle the first one. */
        if (modules.length > 0) {
            ScaffoldClient.courseData.currentModule = modules[0];
            return Promise.resolve();
        } else {
            ScaffoldClient.courseData.currentItem = null;
            
            let currentDiscussionUrl = "/api/v1/courses/" + ScaffoldClient.getCourseID() + "/discussion_topics?per_page=100&i&search_term=" + ScaffoldClient.getPageTitle();
            ScaffoldClient.preloadPromises.push(ScaffoldClient.fetchResults(currentDiscussionUrl, ScaffoldClient.courseData.saveCurrentItem));
            
            return Promise.resolve(console.log("SaveCurrentModule: the page is not in any module"));
        }
    },
    saveCurrentItem: function (data) {/* save current item information - mainly design for discussion*/
        if (typeof data !== 'object' || data.length === 0) {
            return Promise.resolve(false);
        }
        data[0]['type'] = 'Discussion';
        ScaffoldClient.courseData.currentItem = data[0];
        return Promise.resolve();
    },
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
ScaffoldClient.minTime = 30;

/**
 * maxConcurrent specifies the maximum number of concurrent requests that can
 * be made.
 */
ScaffoldClient.maxConcurrent = 25;

ScaffoldClient.failedFetches = {};
ScaffoldClient.limiter = null;
ScaffoldClient.minimumRateRemaining = null;
ScaffoldClient.maximumRequestCost = null;

ScaffoldClient.initBottleneck = function () {
    return new Promise(function (res, rej) {
        if (typeof Bottleneck === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/bottleneck@2/light.min.js';
            script.onload = function () {
                ScaffoldClient.initBottleneck().then(
                    res()
                );
            };
            document.head.appendChild(script);
        } else {
            ScaffoldClient.limiter = new Bottleneck({
                'maxConcurrent': ScaffoldClient.maxConcurrent,
                'minTime': ScaffoldClient.minTime,
            });
            console.log("bottleneck is resolved!");
            res();
        }
    })
}

// set up bottleneck for API calls
// pre-load some api calls here
ScaffoldClient.initBottleneck().then(function () {
    if (ScaffoldClient.getCourseID()) {
        // Get current module id
        let currentModuleUrl = "/api/v1/courses/" + ScaffoldClient.getCourseID() + "/modules?per_page=100&include[]=items&search_term=" + ScaffoldClient.getPageTitle();
        ScaffoldClient.preloadPromises.push(ScaffoldClient.fetchResults(currentModuleUrl, ScaffoldClient.courseData.saveCurrentModule));

        // get all modules and module items information
        let moduleItemUrl = origin + "/api/v1/courses/" + ScaffoldClient.getCourseID() + "/modules?per_page=100&include[]=items";
        ScaffoldClient.preloadPromises.push(ScaffoldClient.fetchResults(moduleItemUrl, ScaffoldClient.courseData.saveModuleItems));
    }
});

ScaffoldClient.checkFailed = function () {
    const urls = Object.keys(ScaffoldClient.failedFetches);
    if (urls.length > 0) {
        console.log("failed fetches found: " + urls);
        ScaffoldClient.limiter.updateSettings({
            'maxConcurrent': Math.floor(Math.max(5, ScaffoldClient.maxConcurrent / 2)),
            'minTime': ScaffoldClient.minTime < 30 ? 45 : Math.floor(ScaffoldClient.minTime * 1.5),
        });
        return ScaffoldClient.fetchResults(urls);
    } else {
        return Promise.resolve(false);
    }
}

ScaffoldClient.fetchResults = function (url, callback) {
    if (typeof url === 'object') {
        const p = [];
        if (Array.isArray(url)) {
            url.forEach(function (u) {
                p.push(ScaffoldClient.fetchResult(u, callback));
            });
        } else {
            const keys = Object.keys(url);
            keys.forEach(function (u) {
                p.push(ScaffoldClient.fetchResult(u, url[u]));
            });
        }
        return p.length > 0 ? Promise.all(p) : Promise.resolve(false);
    } else {
        return ScaffoldClient.fetchResult(url, callback);
    }
}

ScaffoldClient.fetchResult = function (url, callback) {
    let links;
    return ScaffoldClient.limiter.schedule(function () {
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
            links = res.headers.get('link') ? ScaffoldClient.extractLinks(res.headers.get('link')) : null;
            return res.json();
        } else if (res.status === 403) {
            if (typeof ScaffoldClient.failedFetches[res.url] !== 'undefined') {
                if (debug) {
                    console.log('FETCH FAILED A SECOND TIME');
                    console.log(res.headers.entries());
                }
                return Promise.reject('A fetch failed for the second time, giving up.');
            } else {
                ScaffoldClient.failedFetches[res.url] = callback;
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
        const additionalLinks = ScaffoldClient.nextPage(links);
        if (additionalLinks !== false && additionalLinks.length > 0) {
            return ScaffoldClient.fetchResults(additionalLinks, callback);
        } else {
            return Promise.resolve(true);
        }
    }).catch(function (e) {
        // Suppress warnings when canceled
        if (!(e instanceof Bottleneck.BottleneckError)) {
            console.log(`Error: ${e}`);
        }
    });
}

ScaffoldClient.calculateLimits = function (res) {
    const xremaining = parseFloat(res.headers.get('x-rate-limit-remaining'));
    const xcost = parseFloat(res.headers.get('x-request-cost'));
    if (ScaffoldClient.minimumRateRemaining === null || xremaining < ScaffoldClient.minimumRateRemaining) {
        ScaffoldClient.minimumRateRemaining = xremaining;
    }
    if (ScaffoldClient.maximumRequestCost === null || xcost > ScaffoldClient.maximumRequestCost) {
        ScaffoldClient.maximumRequestCost = xcost;
    }
    const outstat = [Date.now().toString(), xremaining, xcost, res.url];
    console.log(outstat.join('\t'));
}

ScaffoldClient.extractLinks = function (hdr) {
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

ScaffoldClient.paginationInfo = function (link) {
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

ScaffoldClient.nextPage = function (links) {
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
ScaffoldClient.interactiveSetup = function () {
    // functions doesn't requires API

    // display the page title while it is not using the style
    if (!document.querySelector(".cbt-banner") && document.querySelector("h1.page-title")) {
        document.querySelector("h1.page-title").style.display = "block";
    }

    if (document.querySelector(".cbt-home-button a")) {
        ScaffoldClient.displayHomeBtn();
    }

    if ("undefined" === typeof tinymce || !tinymce.hasOwnProperty("activeEditor") || !tinymce.activeEditor) {
        if (typeof ScaffoldClient.accordionList === 'function') {
            ScaffoldClient.accordionList();
        }

        if (typeof ScaffoldClient.mutipleAccordion === 'function') {
            ScaffoldClient.mutipleAccordion();
        }

        if (typeof ScaffoldClient.tab === 'function') {
            ScaffoldClient.tab();
        }

        // make sure limiter is set before calling apis
        if (typeof Bottleneck != 'undefined' && ScaffoldClient.limiter && ScaffoldClient.getCourseID) {
            ScaffoldClient.apiFunctions();
        } else {
            ScaffoldClient.initBottleneck().then(function () {
                if (ScaffoldClient.getCourseID()) {
                    ScaffoldClient.apiFunctions();
                }
            });
        }
    }
}



ScaffoldClient.apiFunctions = function () {
    console.log("bottleneck is setup -  starting API calls");
    Promise.all(ScaffoldClient.preloadPromises).then(async function () {

        ScaffoldClient.snippetCopy();

        // if (document.querySelector('.cbt--set-template')) {
        //     ScaffoldClient.setTemplateDocumentation();
        // }

        if (document.querySelector('.cbt-page-as-agreement')) {
            ScaffoldClient.setPageAsAgreement();
        }

        if (document.querySelector('.module-sequence-footer')) {
            ScaffoldClient.findNavItems().then(function(navItem){
                let navHTML = ScaffoldClient.getNavHTML(navItem);
                if($(".module-sequence-footer").length > 0) {
                    $(".module-sequence-footer").parent().append(navHTML);
                    $(".module-sequence-footer").hide();
                }
            });
        }

        if (document.querySelector('.cbt-audio')) {
            ScaffoldClient.customiseAudioPlayer();
        }

        if (document.querySelector('.cbt-banner-announcements--container')) {
            ScaffoldClient.setAnnouncementsButton();
        }

        if(document.querySelector(".cbt-carousel")){ ScaffoldClient.getCarousels(); }

        ScaffoldClient.courseData.modules = await ScaffoldClient.getModItemsProgress(ScaffoldClient.courseData.markableDiscussions);
        if (document.getElementById('cbt-learner')) {
            ScaffoldClient.getUserName().then(function (user) {
                if (user && user.hasOwnProperty("short_name")) {
                    document.getElementById("cbt-learner").innerHTML = 'Welcome ' + user.short_name + ',';
                }
            });
        }
        if (document.querySelector('.cbt-rubric-btn')) {
            ScaffoldClient.displayRubric()
        }

        // all progress items should consider discussions
        if (document.querySelector(".cbt-home-cards")) {
            ScaffoldClient.getHomecards(ScaffoldClient.courseData.modules); // custom based on the template
        }
        if (document.querySelector(".cbt-course-progress")) {
            ScaffoldClient.getContinueItem().then(function (item) {
                ScaffoldClient.setCourseProgressBlock(item);
            });
        }

        if (document.querySelector('.cbt-topic-overview')) {
            ScaffoldClient.getTopicOverview();
        }

        if (ScaffoldClient.courseData.currentItem && ScaffoldClient.courseData.currentItem.hasOwnProperty('type') && ScaffoldClient.courseData.currentItem.type === 'Discussion') {
            ScaffoldClient.initMarkableDiscussion();
            if(document.querySelector('#cbt-banner-header') && document.querySelector('.discussion-redesign-layout h2')){
                document.querySelector('.discussion-redesign-layout h2').remove();
            }
        }

        if (document.querySelector('.cbt-weekly-materials')) {
            ScaffoldClient.setWeeklyMaterials();
        }
        
    })
}



        },
        afterOnLoad: () => {
            /* Import Style and Script */
var head = document.getElementsByTagName("head")[0];
var bootstrapStyle = document.createElement("link");
bootstrapStyle.rel = "stylesheet";
bootstrapStyle.type = "text/css";
bootstrapStyle.href = "https://cdn.jsdelivr.net/npm/bootstrap@4.4/dist/css/bootstrap-grid.min.css";
head.insertBefore(bootstrapStyle, head.firstChild);

if (typeof jQuery == 'undefined' || typeof jQuery === undefined || typeof jQuery === null) {
    var headTag = document.getElementsByTagName("head")[0];
    var jqTag = document.createElement('script');
    jqTag.type = 'text/javascript';
    jqTag.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js';
    headTag.appendChild(jqTag);
}

// Only start to load the interactivity while the content page is loaded  
if (!document.querySelector("#content, .cbt-content")) {
    // mobile - if (document.querySelector('#content'))
    const contentLoadInterval = window.setInterval(function () {
        if (!document.querySelector("#content, .cbt-content")) {
            // mobile - if (document.querySelector('#content'))
            window.clearInterval(contentLoadInterval);
            ScaffoldClient.interactiveSetup();
        }
    }, 500);
    window.setTimeout(function () {
        window.clearInterval(contentLoadInterval);
    }, 10000);
} else {
    ScaffoldClient.interactiveSetup();
}


        },
        css:[],
        js:[]
    };

    m.data = {};

    m.init = function(options) {
        if (ScaffoldClient.oninitset) return false;
        ScaffoldClient.options = ScaffoldClient.merge(ScaffoldClient.options, options );
        if (ScaffoldClient.options.css !== undefined) {
            if (typeof ScaffoldClient.options.css === 'string')
                ScaffoldClient.options.css = [ScaffoldClient.options.css];
            ScaffoldClient.options.css.forEach((a) => {
                var fileref=document.createElement("link")
                fileref.setAttribute("rel", "stylesheet")
                fileref.setAttribute("type", "text/css")
                fileref.setAttribute("href", a)
                document.getElementsByTagName("head")[0].appendChild(fileref)
            });
        }

        if (ScaffoldClient.options.js !== undefined) {
            if (typeof ScaffoldClient.options.js === 'string')
                ScaffoldClient.options.js = [ScaffoldClient.options.js];
                
            ScaffoldClient.options.js.forEach((a) => {
                var st   = document.createElement("script");
                st.type  = "text/javascript";
                st.src   = a;
                document.getElementsByTagName('head')[0].appendChild(st);
            });
        }

        if (ScaffoldClient.modules.length) {
            ScaffoldClient.modules.forEach(item => {
                if (item.init !== undefined && typeof item.init === 'function')
                    item.init();
            });
        }

        if (ScaffoldClient.options.afterInit !== undefined && typeof ScaffoldClient.options.afterInit === 'function')
            ScaffoldClient.options.afterInit();

        ScaffoldClient.oninitset = true;
    };

    m.onPageLoad = function() {
        if (!ScaffoldClient.oninitset) {
			if (!ScaffoldClient.loadcheck) {
				ScaffoldClient.loadcheck = setInterval(function() {
					if (ScaffoldClient.oninitset) {
						ScaffoldClient.onPageLoad();
					}
				}, 250);
			}
			
			if (200 == ScaffoldClient.loadcount) {
				clearInterval(ScaffoldClient.loadcheck);
			} else {
				ScaffoldClient.loadcount += 1;
			}
			return;
		}

		if (ScaffoldClient.loadcheck)
			clearInterval(ScaffoldClient.loadcheck);
		
        if (ScaffoldClient.onloadset) return;

        ScaffoldClient.loadcount = 0;
        
        if (ScaffoldClient.modules.length) {
            ScaffoldClient.modules.forEach(item => {
                if (item.pageload !== undefined && typeof item.pageload === 'function')
                    item.pageload();
            });
        }

        if (ScaffoldClient.options.afterOnLoad !== undefined && typeof ScaffoldClient.options.afterOnLoad === 'function')
            ScaffoldClient.options.afterOnLoad();
        
        ScaffoldClient.onloadset = true;
    };

    m.getCourseID = function() {
        if (ScaffoldClient.options['courseid'] === undefined) {
            if (window?.ENV?.COURSE?.id) {
                ScaffoldClient.options['courseid'] = window.ENV.COURSE.id;
            } else {
                if (document.getElementById('cbt-courseid')) {
                    ScaffoldClient.options['courseid'] = document.getElementById('cbt-courseid').getAttribute('data-course-id');
                } else if (document.getElementById('cbt-progress')) {
                    ScaffoldClient.options['courseid'] = document.getElementById('cbt-progress').getAttribute('data-course-id');
                } else if(window.location.pathname.match(/(courses)\/[0-9]{1,}/gi)) {
                    var id = window.location.pathname.match(/(courses)\/[0-9]{1,}/gi)[0].split("courses/");
                    ScaffoldClient.options['courseid'] = id[id.length - 1];
                }
            }
        }
        return ScaffoldClient.options.courseid;
    };

    m.getCsrfToken = function() {
        var csrfRegex = new RegExp('^_csrf_token=(.*)$');
        var csrf;
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
             var cookie = cookies[i].trim();
             var match = csrfRegex.exec(cookie);
             if (match) {
                  csrf = decodeURIComponent(match[1]);
                  break;
             }
        }
        return csrf;
    };

    m.getOrigin = function() {
        return ScaffoldClient.options.origin;
    };

	m.getPageTitle = function() {
		if (ScaffoldClient.options['pagetitle'] !== undefined) return ScaffoldClient.options['pagetitle'];
        var pageTitle = "";
        //get page title
        if (document.getElementsByClassName("page-title") && document.getElementsByClassName("page-title").length > 0 ){
            pageTitle = document.getElementsByClassName("page-title")[0].innerHTML;
        } else if (document.querySelectorAll(".ellipsible") && document.querySelectorAll(".ellipsible").length > 2){
            pageTitle = document.querySelectorAll(".ellipsible")[document.querySelectorAll(".ellipsible").length-1].innerText
        } else if (document.title){
            pageTitle = document.title;
        }

        ScaffoldClient.options['pagetitle'] = pageTitle;
        return ScaffoldClient.options.pagetitle;
	};

    m.merge = function() {
        var dst = {}
            ,src
            ,p
            ,args = [].splice.call(arguments, 0)
        ;
    
        while (args.length > 0) {
            src = args.splice(0, 1)[0];
            if (toString.call(src) == '[object Object]') {
                for (p in src) {
                    if (src.hasOwnProperty(p)) {
                        if (toString.call(src[p]) == '[object Object]') {
                            dst[p] = ScaffoldClient.merge(dst[p] || {}, src[p]);
                        } else {
                            dst[p] = src[p];
                        }
                    }
                }
            }
        }
    
       return dst;
    };

    m.fetchstatus = function(response) {
        if (response.status >= 200 && response.status < 300) {
             return Promise.resolve(response)
        } else {
             return Promise.reject(new Error(response.statusText))
        }
    };

    /*
    * Function which returns json from response
    */
    m.fetchjson = function(response) {
        return response.json()
    };

    
    m.accordionList = function() {
        // Accordion
function accordionToggle(event) {
  var code;
  if (event.type === "keypress") {
    code = event.charCode || event.keyCode;
  }
  if (event.type === "click" || code === 32 || code === 13) {
    var parent = event.currentTarget.parentNode;
    if (!parent.classList.contains('active')) {
      event.currentTarget.setAttribute('aria-expanded', 'true');
      event.currentTarget.setAttribute('aria-select', 'true');
      parent.classList.add('active');

      parent.querySelector('.cbt-accordion-content').classList.toggle('cbt-answer');

      parent.querySelector('.cbt-accordion-content').setAttribute('aria-hidden', 'false');
      //reload iframe when it open
      var iframes = parent.querySelectorAll('iframe');
      if (iframes.length > 0) {
        for (var i = 0; i < iframes.length; i++) {
          iframes[i].src = iframes[i].src;
        }
      }
    } else {
      parent.querySelector('.cbt-accordion-content').classList.toggle('cbt-answer');
      parent.classList.remove('active');

      event.currentTarget.setAttribute('aria-expanded', 'false');
      event.currentTarget.setAttribute('aria-select', 'false');

    }
    accordionToggleIcon(event.currentTarget);
  }
}


const acc = document.querySelectorAll('.cbt-accordion-list .cbt-accordion-header');
var i;
for (i = 0; i < acc.length; i++) {
  var ctrl_name = 'cbt_panel_' + i + '_content';
  var label_name = 'cbt_panel_' + i;
  acc[i].tabIndex = "0";
  acc[i].role = "tab";
  acc[i].id = label_name;
  acc[i].setAttribute('aria-expanded', 'false');
  acc[i].setAttribute('aria-select', 'false');
  acc[i].setAttribute('aria-controls', ctrl_name);

  var parent = acc[i].parentNode;
  parent.role = "tablist"
  if (parent.querySelector('.cbt-accordion-content')) {
    parent.querySelector('.cbt-accordion-content').id = ctrl_name;
    parent.querySelector('.cbt-accordion-content').tabIndex = "0";
    parent.querySelector('.cbt-accordion-content').role = "tabpanel";
    parent.querySelector('.cbt-accordion-content').setAttribute('aria-hidden', 'true');
    parent.querySelector('.cbt-accordion-content').setAttribute('aria-labelledby', label_name);
  }
  loadAccordionIcon(acc[i]);
  acc[i].addEventListener("click", accordionToggle);
  acc[i].addEventListener("keypress", accordionToggle);
};
function loadAccordionIcon(headerElem) {
  if (!headerElem.querySelector('.cbt-accordion-close, .cbt-accordion-open')) {
    if (parent.querySelector('.cbt-accordion-content.cbt-answer')) {
      headerElem.innerHTML += '<i class="cbt-accordion-close"></i>';
    } else {
      headerElem.innerHTML += '<i class="cbt-accordion-open"></i>';
    }
  }
}
function accordionToggleIcon(headerElem) {
  headerElem.querySelector("i").classList.toggle("cbt-accordion-close");
  headerElem.querySelector("i").classList.toggle("cbt-accordion-open");
}



    };

    m.tabs = function() {
        // Tab
function tabDisplay(event){
  var code;
  if (event.type === "keypress") {
    code = event.charCode || event.keyCode;
  }
  if (event.type === "click" || code === 32 || code === 13) {
    var t_con = event.currentTarget.closest('.cbt-tabs').getElementsByClassName("cbt-tab-content");
    var tabs = event.currentTarget.closest('.cbt-tabs').getElementsByClassName("cbt-tab-trigger");

    for (i = 0; i < t_con.length; i++) {
      t_con[i].style.display = "none";
      t_con[i].setAttribute('aria-hidden', 'true');
    }

    for (i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove("active");
      tabs[i].setAttribute('aria-expanded', 'false');
    }
    event.currentTarget.setAttribute('aria-expanded', 'true');
    event.currentTarget.closest('.cbt-tabs').querySelector('.cbt-tab-content[data-content='+ event.currentTarget.dataset.content+']').style.display = "block";
    event.currentTarget.closest('.cbt-tabs').querySelector('.cbt-tab-content[data-content='+ event.currentTarget.dataset.content+']').setAttribute('aria-hidden', 'false');
    event.currentTarget.classList.add("active");
  }
}

var i;
var tabs = document.querySelectorAll(".cbt-tabs");
for (let tab of tabs){
    t_con = tab.getElementsByClassName("cbt-tab-content");
    for (i = 1; i < t_con.length; i++) {
        t_con[i].style.display = "none";
    }
}

var triggers = document.getElementsByClassName("cbt-tab-trigger");

for (let trigger of triggers) {
    trigger.tabIndex = "0";
    trigger.role="tab";
    trigger.addEventListener("click", tabDisplay);
    trigger.addEventListener("keypress", tabDisplay);
}

var tab_content = document.getElementsByClassName("cbt-tab-content");

for (let content of tab_content) {
    content.tabIndex = "0";
    content.role="tabpanel";
    var tab_div = content.getElementsByTagName("div");
    for (let container of tab_div) {
        container.tabIndex = "0";
    }
}

    };

    m.getCarousels = async function() {
        /** Image and video carousel **/
// Updating arrow visibility
function HideShowArrow(prevButton, nextButton, targetDotIndex, totalSlides){
  if (targetDotIndex === 0) {
    prevButton.classList.add("is-hidden");
    nextButton.classList.remove("is-hidden");
  } else if (targetDotIndex === totalSlides - 1) {
    prevButton.classList.remove("is-hidden");
    nextButton.classList.add("is-hidden");
  } else {
    nextButton.classList.remove("is-hidden");
    prevButton.classList.remove("is-hidden");
  }
};

// Updating dots navigation visibility
function UpdateDots(currentDot, targetDot){
  currentDot.classList.remove("cbt-carousel-current-slide");
  targetDot.classList.add("cbt-carousel-current-slide");
};

// Moving the slides
function MoveToSlide(track, currentSlide, targetSlide) {
  var slides = Array.from(track.children);
  var currIndex = slides.findIndex((slide) => slide === currentSlide);
  var targetIndex = slides.findIndex((slide) => slide === targetSlide);
  var leftValue = 0 - parseInt(targetSlide.style.left);
  var tempSlide = currentSlide;

  if (currIndex > targetIndex){
    while (targetSlide != tempSlide){
      tempSlide.style.left = leftValue + "px";
      tempSlide.style.display = "none";
      tempSlide = tempSlide.previousElementSibling
    }
  } else if (currIndex < targetIndex) {
    while (targetSlide != tempSlide){
      tempSlide.style.left = leftValue + "px";
      tempSlide.style.display = "none";
      tempSlide = tempSlide.nextElementSibling        
    }
  }

  // stop the current video
  if (currentSlide.querySelector("iframe")){
    currentSlide.querySelector('iframe').setAttribute('src', currentSlide.querySelector('iframe').getAttribute('src'));
  }
  targetSlide.style.display = "block";
  targetSlide.style.left = 0 + "px";

  // check height of the image
  if (targetSlide.querySelector("img")){
    track.style.padding = 0;
    var img_height = targetSlide.querySelector("img").height + targetSlide.querySelector("p").offsetHeight + 18;
    track.style.height = img_height + "px"
  } else {
    track.style = "";
  }
  currentSlide.classList.remove("cbt-carousel-current-slide");
  targetSlide.classList.add("cbt-carousel-current-slide");
};

// Get and init carousel
const carousel = document.querySelectorAll(".cbt-carousel");

// Find all the video carousel on a page
for (var i = 0; i < carousel.length; i++) {
// Add left and right navigation
var left_nav = '<button tabIndex="0" class="cbt-carousel__button cbt-carousel__button--left is-hidden" aria-label="left navigation"><i class="cbt-icon-left" alt="carousel navigation left"></i></button>';
var right_nav = '<button tabIndex="0" class="cbt-carousel__button cbt-carousel__button--right" aria-label="right navigation"><i class="cbt-icon-right" alt="carousel navigation right"></i></button>';
var dot_nav = '<div class="cbt-carousel__nav"></div>';
carousel[i].innerHTML = left_nav + carousel[i].innerHTML + dot_nav + right_nav;

const track = carousel[i].querySelector(".cbt-carousel__track-container");

if (!track.querySelector(".cbt-carousel-current-slide")){ //set the first element when the page load
    track.children[0].classList.add("cbt-carousel-current-slide");
    track.children[0].style.left = 0;
    track.children[0].style.display = "block"; //avoid the iframe load display on the screen load
    // initial height of the image
    if (track.children[0].querySelector("img")){
    track.style.padding = 0;
    var img_height = track.children[0].querySelector("img").height + track.children[0].querySelector("p").offsetHeight + 18;
    track.style.height = img_height + "px"
    }
    carousel[i].querySelector(".cbt-carousel__nav").innerHTML += '<button tabIndex="0" class="cbt-carousel__indicator" aria-label="slide 0 navigation"></button>';
}

// Find an element in a video carousel
for (var j = 1; j < track.children.length; j++) {
    var slideWidth = track.children[j].getBoundingClientRect().width;
    track.children[j].style.left = slideWidth + "px";
    carousel[i].querySelector(".cbt-carousel__nav").innerHTML += '<button tabIndex="0" class="cbt-carousel__indicator" aria-label="slide '+ j +' navigation"></button>';
}

carousel[i].querySelector(".cbt-carousel__nav").children[0].classList.add("cbt-carousel-current-slide");

const prevButton = carousel[i].querySelector(".cbt-carousel__button--left");
const nextButton = carousel[i].querySelector(".cbt-carousel__button--right");
const dotsNav = carousel[i].querySelector(".cbt-carousel__nav");
const dots = Array.from(dotsNav.children);
const slides = Array.from(carousel[i].querySelector(".cbt-carousel__track-container").children);

// On click right button slide moves to left
nextButton.addEventListener("click", (e) => {
    const currentSlide = track.querySelector(".cbt-carousel-current-slide") ;
    const nextSlide = currentSlide.nextElementSibling;
    const currentDot = dotsNav.querySelector(".cbt-carousel-current-slide");
    const nextSlideIndex = slides.findIndex((slide) => slide === nextSlide);
    const nextDot = currentDot.nextElementSibling;
    UpdateDots(currentDot, nextDot);
    MoveToSlide(track, currentSlide, nextSlide);
    HideShowArrow(e.currentTarget.parentNode.querySelector(".cbt-carousel__button--left"), e.currentTarget, nextSlideIndex, slides.length);
});

// On click left button slide moves to right
prevButton.addEventListener("click", (e) => {
    const currentSlide = track.querySelector(".cbt-carousel-current-slide");
    const prevSlide = currentSlide.previousElementSibling;
    const currentDot = dotsNav.querySelector(".cbt-carousel-current-slide");
    const prevDot = currentDot.previousElementSibling;
    const prevSlideIndex = slides.findIndex((slide) => slide === prevSlide);
    UpdateDots(currentDot, prevDot);
    MoveToSlide(track, currentSlide, prevSlide);
    HideShowArrow(e.currentTarget, e.currentTarget.parentNode.querySelector(".cbt-carousel__button--right"), prevSlideIndex, slides.length);
});

// Dots functionality
dotsNav.addEventListener("click", (e) => {
    targetDot = e.target.closest("button");
    if (!targetDot) return;
    const currentSlide = track.querySelector(".cbt-carousel-current-slide");
    const currentDot = dotsNav.querySelector(".cbt-carousel-current-slide");
    const targetDotIndex = dots.findIndex((dot) => dot === targetDot);
    const targetSlide = slides[targetDotIndex];

    MoveToSlide(track, currentSlide, targetSlide);
    UpdateDots(currentDot, targetDot);
    HideShowArrow(e.currentTarget.parentNode.querySelector(".cbt-carousel__button--left"), e.currentTarget.parentNode.querySelector(".cbt-carousel__button--right"), targetDotIndex, slides.length);
});
}

    };

    m.getUserName = function(data) {
        /* return user name */
return new Promise(function (userRes, userRej) {
    let url = `/api/v1/users/self`;
    if(typeof Bottleneck != 'undefined' && ScaffoldClient.limiter && typeof ScaffoldClient.fetchResult === 'function'){
        ScaffoldClient.fetchResult(url, function(data){
            if (typeof data !== 'object' || data.length === 0) {
                userRes(false);
            }
            if (data.hasOwnProperty("short_name")) {
                userRes(data);
            } else {
                console.log('Request failed', error);
                userRej(error);
            }
        });
    } else {
        fetch('/api/v1/users/self', {
            method: 'GET',
            credentials: 'include',
            headers: {
                    "Accept": "application/json",
                    "X-CSRF-Token": ScaffoldClient.getCsrfToken()
            }
        })
        .then(ScaffoldClient.fetchstatus)
        .then( ScaffoldClient.fetchjson)
        .then(function (user) {
            if (user.hasOwnProperty("short_name")) {
                userRes(user)
            }
        }).catch(function(error) {
            console.log('Request failed', error);
            userRej(error);
        });
    }
});


    };

    m.getContinueItem = async function(course_id) {
        return new Promise(function (continueRes, continueRej) {
  /* Circular progress bar */
  if(!ScaffoldClient.courseData || !ScaffoldClient.courseData.modules || ScaffoldClient.courseData.modules == 0){
    //console.log('cannot find course Data :(');
    let moduleItemUrl = origin + "/api/v1/courses/" + ScaffoldClient.getCourseID() + "/modules?per_page=100&include[]=items";
    ScaffoldClient.fetchResults(moduleItemUrl, ScaffoldClient.courseData.saveModuleItems);
  } else {
    var publishedModules = ScaffoldClient.courseData.modules.filter((m)=> {return ( typeof m.published === 'undefined' || m.published === true) && m.state != 'completed'})
    if(publishedModules && publishedModules.length > 0 ) {
      publishedModules.sort(function(a, b) {
          return parseFloat(a.position) - parseFloat(b.position);
      });
      var incompletedModule = publishedModules[0].items;
      var incompletedItem = incompletedModule.find((i) => {return i.completion_requirement && i.completion_requirement.completed === false});
      // console.log(incompletedItem);
      if(incompletedItem){
        incompletedItem['status'] = publishedModules[0].state;
        incompletedItem['module_name'] = publishedModules[0].name;
        incompletedItem['module_item_link'] = ScaffoldClient.getOrigin() + incompletedItem.url.split("/api/v1")[1] + '?module_item_id=' + incompletedItem.id;
        continueRes(incompletedItem);
      } else {
        continueRes(null);
      }
    } else {
      continueRes(null);
    }
  }
}).catch(function (e) {
  // Suppress warnings when canceled
  if (!(e instanceof Bottleneck.BottleneckError)) {
      console.log(`getContinueItem Error: ${e}`);
      Promise.reject(e);
  }
});




    };

    m.getModImgURL = async function(filename) {
        return new Promise(function(i , e) {
    fetch(origin + "/api/v1/courses/" + ScaffoldClient.getCourseID() + "/files?per_page=10000&content_types[]=image&search_term=" + filename, {
        method: 'GET',
        credentials: 'include',
        headers: {
                "Accept": "application/json",
                "X-CSRF-Token": ScaffoldClient.getCsrfToken()
        }
    })
    .then(ScaffoldClient.fetchstatus)
    .then( ScaffoldClient.fetchjson)
    .then(function (files) {
        var module_img_url = 'https://i.stack.imgur.com/y9DpT.jpg'; //default image
        for (let file of files) {
            if (file.display_name === filename + ".png" || file.display_name === filename + ".jpg") {
                module_img_url = ScaffoldClient.getOrigin() + "/courses/"+ ScaffoldClient.getCourseID() +"/files/"+ file.id +"/preview";
                //img_id = file.id
            }
        }
        i(module_img_url);
    }).catch(function(error) {
        console.log('getModImgURL request failed' + error);
        e('https://i.stack.imgur.com/y9DpT.jpg');
    });
})

function console2(message) {
    let console = document.getElementById("console2");
    if(ScaffoldClient.getCourseID() == "3829777") {
        if(!console) {
            console = createConsole();
        }
        console.innerHTML = message;
    }

    function createConsole() {
        let targetNode = document.querySelector('.cbt-footer-container').parentNode;
        let elem = document.createElement("div");
        elem.id = "console2";
        applyStyle(elem);
        targetNode.insertBefore(elem, document.querySelector('.cbt-footer-container'));
        return elem;
    }

    function applyStyle(elem) {
        elem.style.position = "fixed";
        elem.style.top = "0";
        elem.style.left = "0";
        elem.style.width = "100vw";
        elem.style.height = "100vh";
        elem.style.background = "rgba(255,255,255,0.3)";
        elem.style.color = "#000";
        elem.style.zIndex = "2000";
    }
}
    };

    m.initMarkableDiscussion = function() {
        const markable_discussion = {
  dataHandler: {
    data: {},
    ns: "cbt_discussion_" + ScaffoldClient.getCourseID(),
    getData: function(){
      var e = {
        ns: markable_discussion.dataHandler.ns
      };
      return new Promise(function(i, e) {
        fetch("/api/v1/users/self/custom_data/" + markable_discussion.dataHandler.ns + "?ns=" + markable_discussion.dataHandler.ns,{
          method: 'GET',
          credentials: 'include',
          headers: {
                "Accept": "application/json",
                "X-CSRF-Token": ScaffoldClient.getCsrfToken()
          } 
        })
        .then(ScaffoldClient.fetchstatus)
        .then(ScaffoldClient.fetchjson)
        .then(function(t) {
          var e = JSON.parse(t.data);
          i(e)
        })
        .catch(function(error) {
          console.log(`initMarkableDiscussion Get Error: ${error}`);
          e(error);              
        });
      })
    },
    setData: function(d) {
      var i = {
        data: d
      };

      return new Promise(function(e) {
        fetch('/api/v1/users/self/custom_data/' +  markable_discussion.dataHandler.ns + "?ns=" +  markable_discussion.dataHandler.ns, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "X-CSRF-Token": ScaffoldClient.getCsrfToken()
          },
          body: JSON.stringify(i)
        })
        .then(ScaffoldClient.fetchstatus)
        .then(ScaffoldClient.fetchjson)
        .then(function(t) {
          var i = JSON.parse(t.data);
          console.log(i),
          e(i)
        })
        .catch(function(error) {
            console.log(`initMarkableDiscussion Set Error: ${error}`);
        });
      })
    }

  },
  ui: {
    updateTaskHTML: function(task_id, e){
      var discussionId;
      if(/task-(\d)+-/.test(task_id)){
        discussionId = task_id.match(/task-(\d)+-/)[0].replace(/-$/,'');
      }
      if (e.querySelector(".utc-icon-empty")) { //not checked
        e.querySelector(".utc-icon-empty").classList.add("utc-icon-checkmark-circle");
        e.classList.add("utc-mark-done");
        e.querySelector(".utc-icon-empty").classList.remove("utc-icon-empty");
        e.querySelector(".mark-done-labels").innerHTML = '<span class="visible">Done</span>';
        console.log("Add data");
      
        if(!markable_discussion.dataHandler.data[discussionId]){
          markable_discussion.dataHandler.data[discussionId] = [];
          markable_discussion.dataHandler.data[discussionId].push(task_id);
        } else if (markable_discussion.dataHandler.data[discussionId].indexOf(task_id) == -1) {
          markable_discussion.dataHandler.data[discussionId].push(task_id);
        }

      
      } else if(e.querySelector(".utc-icon-checkmark-circle")) { //checked
        e.querySelector(".utc-icon-checkmark-circle").classList.add("utc-icon-empty");
        e.classList.remove("utc-mark-done");
        e.querySelector(".utc-icon-checkmark-circle").classList.remove("utc-icon-checkmark-circle");
        e.querySelector(".mark-done-labels").innerHTML = '<span class="visible">Mark as done.</span>';
    
        console.log("Delete data");
      
        if(markable_discussion.dataHandler.data[discussionId]){
          const dataIndex = markable_discussion.dataHandler.data[discussionId].indexOf(task_id);
          if (dataIndex > -1) {
            markable_discussion.dataHandler.data[discussionId].splice(dataIndex, 1);
          }
        }
      }
      console.log(markable_discussion.dataHandler.data);
      markable_discussion.dataHandler.setData(JSON.stringify(markable_discussion.dataHandler.data)).then(function(t) {
        console.log(t)
      }, function(t) {
        console.log(`initMarkableDiscussion updateTaskHTML Error: ${t}`);
      })
    }
  },

  init: function(){
    // check task status
    markable_discussion.dataHandler.getData().then(function(e) {
        console.log("Data exists");
        markable_discussion.dataHandler.data = e;
        console.log(markable_discussion.dataHandler.data);
        if(ScaffoldClient.courseData.currentItem && ScaffoldClient.courseData.currentItem.hasOwnProperty("type") && ScaffoldClient.courseData.currentItem.type === 'Discussion'){ // they have to be a module item
          var discussionId = 'task-'+ (Object.keys(ScaffoldClient.courseData.currentModule).length > 0 ? ScaffoldClient.courseData.currentItem.content_id : ScaffoldClient.courseData.currentItem.id); // this is module item id
          var tasks = document.querySelectorAll('.cbt-manual-mark-btn');
          if (tasks && tasks.length == 2) {
            let banner = document.querySelector('.scaffold-media-box.cbt-banner.cbt-image-banner');
            console.log(banner);
            if (banner) {
                boilerplate = document.createElement('div');
                banner.after(boilerplate);
                boilerplate.outerHTML = '<div class="scaffold-media-box cbt-content cbt-discussion-boilerplate" data-context-menu="insert delete" editable="false" caninsert="false" data-canhavechild="true">' + 
                '<div class="cbt-callout-box" >' + 
                '<p><strong>In most Unity DE Discussions, you must post your own initial response to the prompt before before you will be able to view and/or respond to your peers’ posts.</strong></p>' +
                '</div>' + 
                '</div>';
            }
          }

          if(markable_discussion.dataHandler.data[discussionId]){
            var btns = markable_discussion.dataHandler.data[discussionId];
            for (let i = 0; i < tasks.length; i++) {
              /* Identify if the button is clicked or not */
              let currentTaskId = discussionId +'-btn-'+ i;
              if(btns.indexOf(currentTaskId) > -1){
                tasks[i].innerHTML = '<button class="btn utc-mark-done" data-discussion-done-id="'+ currentTaskId +'" ><i class="utc-icon-checkmark-circle"></i> <span class="mark-done-labels"><span class="visible">Done</span></span></button>';
              } else {
                tasks[i].innerHTML = '<button class="btn" data-discussion-done-id="'+ currentTaskId +'" ><i class="utc-icon-empty"></i> <span class="mark-done-labels"><span class="visible">Mark as done.</span></span></button>';
              }
              tasks[i].querySelector('button').addEventListener("click", (e) => {
                var currTaskID = e.currentTarget.getAttribute("data-discussion-done-id");
                console.log(currTaskID);
                markable_discussion.ui.updateTaskHTML(currTaskID, e.currentTarget);
              })
            }
          } else {
            markable_discussion.dataHandler.data[discussionId] = [];
            for (let i = 0; i < tasks.length; i++) {
              /* Default status */
              tasks[i].innerHTML = '<button class="btn" data-discussion-done-id="task-'+ discussionId +'-btn-'+ i +'" ><i class="utc-icon-empty"></i> <span class="mark-done-labels"><span class="visible">Mark as done.</span></span></button>';
              tasks[i].querySelector('button').addEventListener("click", (e) => {
                var currTaskID = e.currentTarget.getAttribute("data-discussion-done-id");
                console.log(currTaskID);
                markable_discussion.ui.updateTaskHTML(currTaskID, e.currentTarget);
              })
            }
          }
        }


  
    }, function(e) {                  
        console.log("No Data, create new data");
        if(ScaffoldClient.courseData.currentItem && ScaffoldClient.courseData.currentItem.hasOwnProperty("type") && ScaffoldClient.courseData.currentItem.type === 'Discussion'){ // they have to be a module item
          var tasks = document.querySelectorAll('.cbt-manual-mark-btn');
          var discussionId = Object.keys(ScaffoldClient.courseData.currentModule).length > 0 ? ScaffoldClient.courseData.currentItem.content_id : ScaffoldClient.courseData.currentItem.id; // this is module item id
          for (let i = 0; i < tasks.length; i++) {
            /* Default status */
            tasks[i].innerHTML = '<button class="btn" data-discussion-done-id="task-'+ discussionId +'-btn-'+ i +'" ><i class="utc-icon-empty"></i> <span class="mark-done-labels"><span class="visible">Mark as done.</span></span></button>';
            tasks[i].querySelector('button').addEventListener("click", (e) => {
              var currTaskID = e.currentTarget.getAttribute("data-discussion-done-id");
              console.log(currTaskID);
              markable_discussion.ui.updateTaskHTML(currTaskID, e.currentTarget);
            })
          }

          var tasks = document.querySelectorAll('.cbt-manual-mark-btn');
          if (tasks && tasks.length == 2) {
            let banner = document.querySelector('.scaffold-media-box.cbt-banner.cbt-image-banner');
            console.log(banner);
            if (banner) {
                boilerplate = document.createElement('div');
                banner.after(boilerplate);
                boilerplate.outerHTML = '<div class="scaffold-media-box cbt-content cbt-discussion-boilerplate" data-context-menu="insert delete" editable="false" caninsert="false" data-canhavechild="true">' + 
                '<div class="cbt-callout-box" >' + 
                '<p><strong>In most Unity DE Discussions, you must post your own initial response to the prompt before before you will be able to view and/or respond to your peers’ posts.</strong></p>' +
                '</div>' + 
                '</div>';
            }
          }

          
        }
    })
  }
}

markable_discussion.init();
    };

    m.getModItemsProgress = async function(discussion) {
        return new Promise(function (incompleteRes, incompleteRej) {
  /* Circular progress bar */
  if(!ScaffoldClient.courseData || !ScaffoldClient.courseData.modules || ScaffoldClient.courseData.modules == 0){
    //console.log('cannot find course Data :(');
    let moduleItemUrl = origin + "/api/v1/courses/" + ScaffoldClient.getCourseID() + "/modules?per_page=100&include[]=items";
    ScaffoldClient.fetchResults(moduleItemUrl, ScaffoldClient.courseData.saveModuleItems);
  } else {
    var publishedModules = ScaffoldClient.courseData.modules.filter((m)=> {return ( typeof m.published === 'undefined' || m.published === true )});
    var modules = [];

    for(let m of publishedModules){
      if(m.state === 'completed'){
        m['task_progress'] = m.items.length +'/'+ m.items.length;
      } else {

        var incompleteDiscussions = m.items.filter((i) => {return i.type === 'Discussion' && i.completion_requirement && i.completion_requirement.completed === false});

        for(let d of incompleteDiscussions){
            if(d.hasOwnProperty('content_id')){
                let taskId = 'task-'+ d.content_id;
                if(discussion && Object.keys(discussion).length > 0 && discussion[taskId] && discussion[taskId].length >= 2){
                    let incompleteIndex = m.items.findIndex((i) => i.id === d.id);
                    m.items[incompleteIndex].completion_requirement.completed = true;
                    //console.log("changedItems ", m.items[incompleteIndex]);
                }
            }
        }
        var completeItems =  m.items.filter((i) => {return i.completion_requirement && i.completion_requirement.completed === true});
        m['task_progress'] = completeItems.length +'/'+ m.items.length;
      }
      modules.push(m);
    }
    //console.log(modules);
    incompleteRes(modules);
  }
}).catch(function (e) {
  // Suppress warnings when canceled
  if (!(e instanceof Bottleneck.BottleneckError)) {
      console.log(`getIncompleteModItems Error: ${e}`);
      Promise.reject(e);
  }
});




    };

    m.displayRubric = function() {
        let rubricBtns = document.querySelectorAll('.cbt-rubric-btn');

for ( let rubricBtn of rubricBtns){
    let rubricUrl = rubricBtn.querySelector('a');
    //if(rubricUrl && rubricUrl.href && /.*\/assignments\/\d+\/rubric$/.test(rubricUrl.href)){// remove rubrics
    if(rubricUrl && rubricUrl.href && /.*\/assignments\/\d+(\/rubric)?\/?$/.test(rubricUrl.href)){
        console.log(rubricUrl.href);
        rubricBtn.innerHTML = '<button class="btn" data-rubric-link="'+rubricUrl.href+'">View rubric</button>';
        rubricBtn.addEventListener("click", (e) => {
            const rubricDiv = e.currentTarget;
            let rubricBtn = e.currentTarget.querySelector('button');
            let rubricContent = rubricDiv.querySelector('.cbt-rubric-content');
            if(rubricDiv && !rubricContent){
                console.log(rubricDiv);
                let rubricUrl = rubricBtn.getAttribute("data-rubric-link");
                rubricUrl = rubricUrl.endsWith("/rubric") ? rubricUrl : `${rubricUrl}/rubric`;//add rubric url "" /rubric, then add
                console.log(`rubricUrl: "${rubricUrl}"`)
                try {
                    var xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        var rubricDoc = new DOMParser().parseFromString(this.response, "text/html");
                        console.log(rubricDoc.getElementById('rubrics'));
                        rubricDiv.innerHTML += '<div class="cbt-rubric-content" style="display:block" aria-hidden="false"><button><span class="ui-icon ui-icon-closethick">Close</span></button>'+rubricDoc.getElementById('rubrics').innerHTML+'</div>';
                        rubricDiv.querySelector(".cbt-rubric-content > button").addEventListener("click", (e) => {
                            e.currentTarget.parentNode.style.display = "none";
                        })
                    };
                    xhr.open('GET', rubricUrl, true);
                    xhr.send();
                } catch (error) {
                    console.error(error);
                }
            }else{
                if(e.target.getAttribute("data-rubric-link")){
                    if(rubricContent.style.display == "block"){
                        rubricContent.style.display = "none";
                        rubricContent.setAttribute('aria-hidden', 'true');
                    } else {
                        rubricContent.style.display = "block";
                        rubricContent.setAttribute('aria-hidden', 'false');
                    }
                }

            }
        })
    }
}




    };

    m.setPageAsAgreement = function() {
        

console.log("======Page as agreement;=========");

let container = document.querySelector('.cbt-page-as-agreement');
let state = {
    container: container,
    temporaryButton: container.querySelector('.cbt-button'),
    markAsDoneButton: null,
    buttonClasses: "cbt-agreement-button cbt-button"
};

init();
function init() {

    setMarkAsDoneButton();
    if (state.markAsDoneButtone) {
        setButtonStyle();
        setButtonText();
        placeMarkAsDoneButton();
    }
    else {
       console.log("mark as done button doesn't exist")
        setTempBtnAsAgreement(state.temporaryButton);
    }

}

function setMarkAsDoneButton() {
    let markAsDoneButton = document.querySelector('#mark-as-done-checkbox');
    state.markAsDoneButton = markAsDoneButton;
}

function setButtonStyle() {
    if (state.markAsDoneButton) {
        state.buttonClasses.split(" ").forEach((className) => { state.markAsDoneButton.classList.add(className.trim()) });
    }
}

function setButtonText() {
    let btnText = state.temporaryButton.textContent;
    if (state.markAsDoneButton) {
        let replaceTargets = state.markAsDoneButton.querySelectorAll(".mark-done-labels span");
        Array.from(replaceTargets).forEach((target) => { target.textContent = btnText });
    }
}

function placeMarkAsDoneButton() {
    if (state.markAsDoneButton) {
        state.temporaryButton.parentNode.replaceChild(state.markAsDoneButton, state.temporaryButton);
    }
}

function setTempBtnAsAgreement(temporaryButton) {
    let modItemData = {
        courseID: encodeURIComponent(ScaffoldClient.getCourseID()),
        moduleID: null,
        moduleItemID: null,
        url: null,
        isComplete: null,
    }
   //console.log("setTempBtnAsAgreement(temporaryButton)");
    __init();

    function __init() {
       console.log(`no mark as done found`);
        try {
            //get initiate state (current page completion status)
            getModItemData();

            //set style
            setTempButtonStyle();

            if (modItemData && modItemData.courseID && modItemData.moduleID && modItemData.moduleItemID) {
                constructUrl();
                if (modItemData.url) {
                    attachMarkAsDoneHandler();
                }
            }
        }
        catch (e) {
           console.log(`error: ${e} \n|| e.message: ${e.message} \n|| e.stack: ${e.stack}`);
        }
    }

    function setTempButtonStyle() {
       //console.log("setTempButtonStyle()");
        let temporaryButtonLink = temporaryButton.querySelector('a');
       //console.log(`temporaryButtonLink ${temporaryButtonLink ? true : false} (***)`);
        if (!temporaryButton.querySelector('i')) {
            let radioIcon = document.createElement('i');
            radioIcon.appendChild(document.createTextNode(" "));
           //console.log("radioIcon(***)");
            let isComplete = modItemData.isComplete;
           //console.log(`isComplete ${isComplete}(***)`);
            if (isComplete !== null) {
                radioIcon.classList.add(isComplete ? 'utc-icon-check_circle' : 'utc-utc-icon-empty');
                if(isComplete) {
                    temporaryButton.classList.add("btn-success");
                }
                else {
                    temporaryButton.classList.remove("btn-success");
                }
            }

            let targetElem = temporaryButtonLink ? temporaryButtonLink : temporaryButton;
            if(targetElem.firstChild) {
                targetElem.insertBefore(radioIcon, targetElem.firstChild);
            }
            else {
                targetElem.appendChild(radioIcon);
            }
           //console.log(`targetElem.nodeName ${targetElem.firstChild.nodeName}(***)`);
           //console.log(`targetElem ${targetElem.querySelector('i').classList.length}(***)`);
           //console.log(`targetElem.innerHTML ${targetElem.innerHTML}(***)`);
        }
        //<i class="utc-icon-empty"> </i>
    }

    // get course id
    // get current module // ScaffoldClient.courseData.currentModule
    // get current module id
    // get current moduleItem id
    function getModItemData() {
       //console.log("getModItemData()");
        let currModule = getCurrentModule();
        ////console.log(`currModule: "${JSON.stringify(currModule)}"`);
        let currModuleItem = getCurrModuleItem(currModule.items);

        __init();

        function __init() {
            modItemData.moduleID = currModule.id;
            modItemData.moduleItemID = currModuleItem.id;
            modItemData.isComplete = currModuleItem.completion_requirement.completed;
        }

        function getCurrentModule() {
           //console.log("getCurrentModule()");
            let modules = ScaffoldClient.courseData.modules;
            return modules.reduce((acc, module, arr, index) => {
                let modItems = module.items;
                let isCurrentModule = getCurrModuleItem(modItems);
                if (!acc) {
                    if (isCurrentModule) {
                        return module;
                    }
                }
                else { return acc; }
                return false;
            }, 0);
        }

        function getCurrModuleItem(modItems) {
            ////console.log(`modItems: "${modItems}"`);
            return modItems.reduce((acc, item, index, arr) => {
                if (!acc) {
                    if (isCurrentPage(item)) {
                        return item;
                    }
                }
                else { return acc; }
                return false;
            }, false);
        }

        function isCurrentPage(item) {
            let moduleUtils = canvasModuleUtils();
            ////console.log(`moduleUtils: ${JSON.stringify(moduleUtils)}`);

            moduleUtils.setUrl(window.location.href);

            ////console.log(`moduleUtils2: ${JSON.stringify(moduleUtils)}`);

            const matches = moduleUtils.matchesModuleItem(item);
            return matches;
        }


    }

    //construct url
    function constructUrl() {
       //console.log("constructUrl()");
        modItemData.url = `${ScaffoldClient.getOrigin()}/api/v1/courses/${modItemData.courseID}/modules/${modItemData.moduleID}/items/${modItemData.moduleItemID}/done`;
    }
    //attach handler:
    //fetch POST


    function attachMarkAsDoneHandler() {
       //console.log("attachMarkAsDoneHandler()");
        let apiUrl = modItemData.url;
        let isComplete = modItemData.isComplete;

        //attach handler
        temporaryButton.addEventListener("click", toggleMarkAsDoneHandler);
        async function toggleMarkAsDoneHandler(e) {
            e.preventDefault();
            
           //console.log("toggleMarkAsDoneHandler(e)");

            let options = {
                method: isComplete ? 'DELETE' : 'PUT',
                credentials: 'include',
                headers: {
                    "Accept": "application/json",
                    "X-CSRF-Token": ScaffoldClient.getCsrfToken()
                }
            }

            //check state first
            if (isComplete !== null) {
                //fetch POST
                try {
                    const response = await fetch(apiUrl, options);

                    if (response.ok) {
                        isComplete = !isComplete;
                       console.log(`Module item marked as ${isComplete ? "done" : "NOT done"} successfully`);

                        toggleIcon(e);

                    } else {
                        console.error("\n" + `Error marking module item as ${isComplete ? "NOT done" : "done"}`);
                    }
                } catch (error) {
                    console.error("\n" + 'API request error:', error);
                }
            }
        }

        function toggleIcon(e) {
           //console.log("toggleIcon(e)");
           //console.log("e: " + e);
           //console.log("isComplete: " + isComplete);
            let radioIcon = e.target.querySelector('i');
           //console.log("radioIcon: " + (radioIcon.outerHTML + ""));
            if (isComplete !== null) {
                radioIcon.classList.remove(isComplete ? 'utc-icon-empty' : 'utc-icon-check_circle');
                radioIcon.classList.add(isComplete ? 'utc-icon-check_circle' : 'utc-icon-empty');
                
                if(isComplete) {
                    temporaryButton.classList.add("btn-success");
                }
                else {
                    temporaryButton.classList.remove("btn-success");
                }
            }
        }
    }

}

function canvasModuleUtils() {
    return {
        pageInfo: {},
        urlTypes: ['Module Item', 'Page', 'Assignment', 'Quiz', 'Discussion', 'ExternalTool', 'File'],
        parseUrl: function (url) {
            const urlSegments = url.split('/');

            if (url.includes('module_item_id=')) {
                const pageUrl = url.split("module_item_id=")[1];
                return { type: 'Module Item', id: pageUrl };
            } else if (url.includes('/pages/')) {
                const pageUrlIndex = urlSegments.indexOf('pages') + 1;
                const pageUrl = urlSegments[pageUrlIndex];
                return { type: 'Page', id: pageUrl };
            } else if (url.includes('/assignments/')) {
                const assignmentIdIndex = urlSegments.indexOf('assignments') + 1;
                const assignmentId = urlSegments[assignmentIdIndex];
                return { type: 'Assignment', id: assignmentId };
            } else if (url.includes('/quizzes/')) {
                const quizIdIndex = urlSegments.indexOf('quizzes') + 1;
                const quizId = urlSegments[quizIdIndex];
                return { type: 'Quiz', id: quizId };
            } else if (url.includes('/discussion_topics/')) {
                const discussionIdIndex = urlSegments.indexOf('discussion_topics') + 1;
                const discussionId = urlSegments[discussionIdIndex];
                return { type: 'Discussion', id: discussionId };
            } else if (url.includes('/external_tools/')) {
                const toolIdIndex = urlSegments.indexOf('external_tools') + 1;
                const toolId = urlSegments[toolIdIndex];
                return { type: 'ExternalTool', id: toolId };
            } else if (url.includes('/files/')) {
                const fileIdIndex = urlSegments.indexOf('files') + 1;
                const fileId = urlSegments[fileIdIndex];
                return { type: 'File', id: fileId };
            } else if (url.includes('/modules/') && url.includes('#')) {
                const moduleItemIdIndex = urlSegments.indexOf('modules') + 1;
                const moduleItemId = urlSegments[moduleItemIdIndex].split("#")[1];
                return { type: 'Module Item', id: moduleItemId };
            } else if (url.includes('/modules/') && url.includes('/items/')) {
                const moduleItemIdIndex = urlSegments.indexOf('items') + 1;
                const moduleItemId = urlSegments[moduleItemIdIndex];
               //console.log(`moduleItemId ${moduleItemId}`);
                return { type: 'Module Item', id: moduleItemId };
            } else if (url.includes('/assignment_groups/')) {
                // const assignmentGroupIdIndex = urlSegments.indexOf('assignment_groups') + 1;
                // const assignmentGroupId = urlSegments[assignmentGroupIdIndex];
                // return { type: 'Assignment Group', id: assignmentGroupId };
            } else {
                return { type: 'Unknown', id: null };
            }
        },
        setUrl: function (url) {
            let filteredID = filterIDString(this.parseUrl(url))
            this.pageInfo.info = filteredID;

            function filterIDString(infoObj) {
                let id = infoObj.id;
                if (id) {
                    // Check if invalid characters (#, &, ?) are in the middle of the slug string
                    if (/\D[#&?]\D/.test(id)) {
                        return null; // Return null if invalid characters are in the middle
                    }

                    // Remove invalid characters (#, &, ?) using regular expression
                    infoObj.id = id.replace(/[#&?]/g, '');
                }

                return infoObj;
            }
        },
        matchesModuleItem: function (moduleItem) {
            let info = this.pageInfo.info;
            if (!moduleItem || !info) {
               console.log(`error not match`)
                return false;
            }

            ////console.log(`wassa: ${info.type}`)
            // 'File', 'Page', 'Discussion',
            // 'Assignment', 'Quiz', 'SubHeader', 'ExternalUrl', 'ExternalTool'
            if (this.urlTypes.some((item) => item === moduleItem.type)) {
                if (info.type == 'Module Item') {
                    return moduleItem.id == info.id
                }
                if (info.type == 'Page') {
                    return moduleItem.page_url == info.id
                }
                return moduleItem.content_id == info.id
            }

            return (false);
        }
    }
}

console.log("``````End: Page as agreement;``````");
    };

    m.tab = function() {
        // Tab
function tabDisplay(event) {
    var code;
    if (event.type === "keypress") {
        code = event.charCode || event.keyCode;
    }
    if (event.type === "click" || code === 32 || code === 13) {
        var t_con = event.currentTarget.closest('.cbt-tabs').getElementsByClassName("cbt-tab-content");
        var tabs = event.currentTarget.closest('.cbt-tabs').getElementsByClassName("cbt-tab-trigger");

        for (i = 0; i < t_con.length; i++) {
            t_con[i].style.display = "none";
            t_con[i].setAttribute('aria-hidden', 'true');
        }

        for (i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove("active");
            tabs[i].setAttribute('aria-expanded', 'false');
        }
        event.currentTarget.setAttribute('aria-expanded', 'true');
        event.currentTarget.closest('.cbt-tabs').querySelector('.cbt-tab-content[data-content=' + event.currentTarget.dataset.content + ']').style.display = "block";
        event.currentTarget.closest('.cbt-tabs').querySelector('.cbt-tab-content[data-content=' + event.currentTarget.dataset.content + ']').setAttribute('aria-hidden', 'false');
        event.currentTarget.classList.add("active");
    }
}

var i;
var tabs = document.querySelectorAll(".cbt-tabs");
for (let tab of tabs) {
    t_con = tab.getElementsByClassName("cbt-tab-content");
    for (i = 1; i < t_con.length; i++) {
        t_con[i].style.display = "none";
    }
}

var triggers = document.getElementsByClassName("cbt-tab-trigger");

for (let trigger of triggers) {
    trigger.tabIndex = "0";
    trigger.role = "tab";
    trigger.addEventListener("click", tabDisplay);
    trigger.addEventListener("keypress", tabDisplay);
}

var tab_content = document.getElementsByClassName("cbt-tab-content");

for (let content of tab_content) {
    content.tabIndex = "0";
    content.role = "tabpanel";
    var tab_div = content.getElementsByTagName("div");
    for (let container of tab_div) {
        container.tabIndex = "0";
    }
}
    };

    m.customiseAudioPlayer = function() {
        console.log('===customised audio player===');
init();
function init() {
    let state = {
        classNames: {
            component: 'cbt-audio',
            play: 'cbt-audio-play',
            timetracker: 'cbt-time-tracker',
            mute: 'cbt-audio-mute',
            progress: {
                progressbar: 'cbt-audio-progress-bar',
                progress: 'cbt-audio-progress'
            },
        },
    };
    let players = document.querySelectorAll(`.${state.classNames.component}`);
    players.forEach((player) => customiseAudioControls(player, state.classNames));
}

function customiseAudioControls(player, classNameList) {
    let audio = player.querySelectorAll('audio')[0];
    let playButton = getCustomPlayButton(classNameList.play);
    let initPlaytime = `00:00 / 00:00`;
    let timetracker = getCustomTimeTracker(classNameList.timetracker, initPlaytime);
    let muteButton = getCustomMuteButton(classNameList.mute);
    let progressBar = getCustomProgressBar(classNameList.progress);

    if (audio) {
        addControlEvents(audio, playButton, timetracker, muteButton, progressBar);

        hideControls(audio);
        
        insertNewControls(audio, playButton, timetracker, muteButton, progressBar);


    }
}

function insertNewControls(audio, playButton, timetracker, muteButton, progressBar) {
    audio.parentNode.insertBefore(progressBar, audio.nextSibling);
    audio.parentNode.insertBefore(muteButton, audio.nextSibling);
    audio.parentNode.insertBefore(timetracker, audio.nextSibling);
    audio.parentNode.insertBefore(playButton, audio.nextSibling);
}

function addControlEvents(audio, playButton, timetracker, muteButton, progressBar) {
    let isPlaying = false;
    playButton.addEventListener('click', function () {
        if (!audio.paused) {
            audio.pause();
            playButton.classList.add("cbt-paused");
        }
        else {
            audio.play();
            playButton.classList.remove("cbt-paused");
        }
        isPlaying = !isPlaying;
    });

    muteButton.addEventListener('click', function () {
        if (audio.muted) {
            audio.muted = false;
            muteButton.classList.remove('cbt-muted');
        } else {
            audio.muted = true;
            muteButton.classList.add('cbt-muted');
        }
    });

    audio.addEventListener('timeupdate', function () {
        let currentTime = formatTime(audio.currentTime);
        let totalDuration = formatTime(audio.duration);

        let progress = currentTime / totalDuration * 100;
        timetracker.innerHTML = `${currentTime} / ${totalDuration}`;
        progressBar.style.width = progress + '%';
    });

    audio.addEventListener('loadedmetadata', function () {
        let currentTime = formatTime(audio.currentTime);
        let totalDuration = formatTime(audio.duration);

        timetracker.innerHTML = `${currentTime} / ${totalDuration}`;
    });
}

function getCustomTimeTracker(classes, initPlaytime) {
    return createElement("DIV", typeof classes == "string" ? [classes] : [...classes], initPlaytime);
}
function getCustomPlayButton(classes) {
    return createElement("BUTTON", typeof classes == "string" ? [classes] : [...classes], "");
}

function getCustomMuteButton(classes) {
    return createElement("BUTTON", typeof classes == "string" ? [classes] : [...classes], "");
}

function getCustomProgressBar(classes) {
    let progressBar = createElement("DIV", [classes.progressbar]);
    let progressSlider = createElement("DIV", [classes.progress]);
    progressBar.appendChild(progressSlider);
    return progressBar;
}
// helper methods
function formatTime(time) {
    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time - minutes * 60);
    var minuteValue;
    var secondValue;

    if (minutes < 10) { minuteValue = "0" + minutes; }
    else { minuteValue = minutes; }

    if (seconds < 10) { secondValue = "0" + seconds; }
    else { secondValue = seconds; }

    return minuteValue + ":" + secondValue;
}
function createElement(tagName, classNames = [], text = "") {
    let element = document.createElement(tagName);
    if (text && text !== "") {
        element.appendChild(document.createTextNode(text));
    }
    classNames.forEach((className) => { element.classList.add(className) });
    return element;
}

function hideControls(audioElement) {
    if (audioElement.hasAttribute('controls')) {
        audioElement.removeAttribute('controls');
    }
}
console.log('===customised audio player - end===')
/*
function customiseAudioControls(player, classNameList) {
    let audio = player.querySelectorAll(classNameList.audio)[0];
    let playButton = player.querySelectorAll(classNameList.play)[0];
    let muteButton = player.querySelectorAll(classNameList.mute)[0];
    let progressBar = player.querySelectorAll(classNameList.progress)[0];

    hideControls(audio);

    playButton.addEventListener('click', function () {
        audio.play();
    });

    muteButton.addEventListener('click', function () {
        audio.pause();
    });

    audio.addEventListener('timeupdate', function () {
        let progress = audio.currentTime / audio.duration * 100;
        progressBar.style.width = progress + '%';
    });
}*/
    };

    m.setWeeklyMaterials = function() {
        
function console2(message) {
    let console = document.getElementById("console2");
    if (ScaffoldClient.getCourseID() == "3829777") {
        if (!console) {
            console = createConsole();
        }
        console.innerHTML += message;
        // console.textContent += message;
    }

    function createConsole() {
        try {
            let targetNode = document.querySelector('.cbt-content:last-of-type').parentNode;
            let elem = document.createElement("div");
            elem.id = "console2";
            applyStyle(elem);
            targetNode.insertBefore(elem, document.querySelector('.cbt-content:last-of-type'));
            return elem;
        }
        catch (e) {
            console.log(`error: ${e} || error.message: {${e.message} || error.stack: {${e.stack}}`);
        }
    }

    function applyStyle(elem) {
        elem.style.border = "1px solid red";
        elem.style.position = "fixed";
        elem.style.top = "0";
        elem.style.left = "0";
        elem.style.width = "100vw";
        elem.style.height = "60vh";
        elem.style.background = "rgba(255,255,255,0.3)";
        elem.style.color = "#000";
        elem.style.zIndex = "2000";
        elem.style.overflow = "auto";
    }
}

console.log(`===========setWeeklyMaterials============`);

//ScaffoldClient.courseData.currentModule.id

// get current module items

// check each for their completion, type and link

// set list item
// checkbox style to item completion
// set url
// set icon

// place list items

init();
function init() {
    let moduleItems = getCurrentModuleItems();

    let weeklyMaterialsList = getWeeklyMaterialsList(moduleItems);

    setWeeklyMaterialsList(weeklyMaterialsList);
};

function setWeeklyMaterialsList(listHTML) {
    let components = document.querySelectorAll('.cbt-weekly-materials');
    if (components && components.length > 0) {
        components.forEach((component) => {
            component.innerHTML = listHTML;
        });
    }
}

function getListHTML(moduleItemObj) {

    //icon classes. //'File', 'Page', 'Discussion', 'Assignment', 'Quiz', 'SubHeader', 'ExternalUrl', 'ExternalTool'
    const iconClasses = {
        "discussion": "icon-Line icon-discussion",
        "assignment": "utc-icon-assignment",
        "page": "icon-Line icon-document",
        "quiz": "icon-Line icon-quiz",
        "externalurl": "icon-Line icon-external-link",
        "externaltool": "icon-Line icon-link",
    }
    // local helping methods
    let getIcon = (iconClass) => `<i class="${iconClass}"></i>`;
    const isSpecialType = (type) => type && iconClasses[type.toLowerCase()] ? getIcon(iconClasses[type.toLowerCase()]) : "";

    // Assignment by destructuring
    let { title, html_url, type, icon = isSpecialType(type), completion_requirement } = moduleItemObj;
    const liClass = completion_requirement && completion_requirement.completed === true ? "cbt-completed" : "";

    const listHTML = `<li class="${liClass}"><a href="${html_url}">${icon}${title}</a></li>`;
    return listHTML;
}

function getWeeklyMaterialsList(moduleItems) {
    let listItemsHTML = moduleItems.slice(1).map(getListHTML).join("");
    let list = `<ul>${listItemsHTML}</ul>`

    return list;
}

function getCurrentModuleItems() {
    try {
        // console.log(`getCurrentModuleItems()`);
        let currentModuleID = ScaffoldClient.courseData.currentModule.id;
        if(!currentModuleID) {//for mobile app
            // console.log(`!currentModuleID`);
            currentModuleID = getCurrentModuleID();
        }

        // console.log(`currentModuleID: ${currentModuleID}`);
        let currentModuleItems = ScaffoldClient.courseData.modules.reduce((acc, module, index, array) => module.id && module.id === currentModuleID ? module.items : acc, []);
        return currentModuleItems;
    }
    catch (e) {
        console.log(`error: ${e} || error.message: {${e.message} || error.stack: {${e.stack}}`);
    }
}

function getCurrentModuleID() {
    let currentModuleHelper = ScaffoldClient.currentModuleHelper();
    let currentModule = currentModuleHelper.getCurrentModule();

    return currentModule.id;
}


console.log(`===========setWeeklyMaterials - END ============`);
    };

    m.getHomecards = async function(data) {
        

function setHomecardHTML(name, modUrl, imgUrl, completedItems, totalItems, state) {
    let html = '<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">';
    state && state === "locked" ? html += '<a class="cbt-module-card cbt-module-locked" title="' + name + '" href="' + modUrl + '">' : html += '<a class="cbt-module-card" title="' + name + '" href="' + modUrl + '">';

    if(imgUrl){
        html += '<div class="cbt-module-card-img"> \
                    <img src="'+imgUrl+'" alt="module card image" />\
                </div>';
    }

    html += '<div class="cbt-module-info"><div class="cbt-module-details">';
    if (name.length > 0 && /^module[\s]*[\d]+[\s]?[:]?[-]?.+/gi.test(name)) {
        let topicNum = name.match(/^(module[\s]*[\d]+[\s]?)/gi)[0].trim();
        let moduleName = name.split(/^module[\s]*[\d]+[\s]?[:]?[-]?/gi).join("").trim();
        html += '<p>' + topicNum + '</p>';
        html += '<h3>' + moduleName + '</h3>';
    } else {
        html += '<p>&nbsp;</p>';
        html += '<h3>' + name + '</h3>';
    }

    html += '</div>';
    if(totalItems && completedItems <= totalItems){
        html += '<div class="cbt-module-footer"> \
                    <div class="cbt-module-details"> \
                    <p><b>'+ completedItems +'/'+ totalItems +'</b> complete</p> \
                    </div> \
                    <div class="cbt-module-completion"><span style="width:'+ Math.round((completedItems / totalItems) * 100)  +'%">&nbsp;</span></div> \
                </div>';
    }
    html += '</div></a></div>';
    return html;
}

if (typeof data !== 'object' || data.length === 0) {
    return Promise.resolve(false);
}

Promise.all(ScaffoldClient.preloadPromises).then(async function () {
    console.log("module items are all ready for you :)");
    let moduleCardsContainer = document.querySelector('.cbt-home-cards');
    let hasModuleCards = (container) => {
        return container.querySelector('.cbt-module-card') ? true : false;
    };

    if (ScaffoldClient.courseData.modules && ScaffoldClient.courseData.modules.length > 0 && !hasModuleCards(moduleCardsContainer) ) {
        var cardHtml = '';
        // Loop and display all module items in the accordion
        for (let mod of ScaffoldClient.courseData.modules) {
            var imgUrl, state;
            let firstItem = mod.items.find(item => item.type != "SubHeader");
            var modUrl = '#';
            if(mod.state){
               state =  mod.state;
            }
            if( state != "locked" && firstItem && firstItem.hasOwnProperty("html_url") && firstItem.type === "ExternalTool"){
              modUrl = firstItem.html_url;
            } else if(  state != "locked" && firstItem && firstItem.hasOwnProperty("html_url") && firstItem.type === "ExternalUrl"){
              modUrl = ScaffoldClient.getOrigin() + firstItem.html_url.split("/api/v1")[1].replace('module_item_redirect','modules/items');
            } else if (  state != "locked" && firstItem && firstItem.hasOwnProperty("url")){
              modUrl = ScaffoldClient.getOrigin() + firstItem.url.split("/api/v1")[1] + "?module_item_id="+ firstItem.id;
            }

            let completedItems = mod.items.filter(item => item.type != "SubHeader" && item.hasOwnProperty("completion_requirement") && item.completion_requirement.completed === true);
            let totalItems = mod.items.filter(item => item.type != "SubHeader" && item.hasOwnProperty("completion_requirement"));
            try{
                imgUrl = await ScaffoldClient.getModImgURL("hometile" + mod.position);
            } catch(e) {
                console.log("Cannot find the image" + e + "; stack: " + e.stack);
                imgUrl = 'https://i.stack.imgur.com/y9DpT.jpg';
            }
            cardHtml += setHomecardHTML(mod.name, modUrl, imgUrl, completedItems.length, totalItems.length, state);

        }

        moduleCardsContainer.innerHTML =  '<div class="row">'  + cardHtml + '</div>';
    }

}).catch(function (e) {
    console.log("getHomecards error - " + e);
});
    };

    m.setAnnouncementsButton = function() {
        console.log(`========Announcements button==========`)


// Get the button
// enable the button
// double check btn link & insert only if not there

// Make fetch query
// if new in the list - add class

init();
function init() {
    let buttonContainers = document.querySelectorAll('.cbt-banner-announcements--container');
    buttonContainers.forEach((buttonContainer) => { setAnnouncements(buttonContainer) });
}

async function setAnnouncements(buttonContainer) {
    let state = {
        buttonContainer: buttonContainer,
        newAnnoucementsClasses: ["cbt-button-unread"],//Classes for btn style for new (unread) annoucements
        button: null,
        buttonInfo: {
            container: { elementType: "DIV", classNames: "scaffold-media-box cbt-button" },
            anchor: {
                elementType: "A",
                children: ["New Announcements"],
                title: "Announcements",
                link: `/courses/${ScaffoldClient.getCourseID()}/announcements`
            },
        }
    }

    state.button = getTargetButton(state.buttonContainer, state.buttonInfo);

    if (state.buttonContainer && state.button) {//if any button meet the requirement (isTargetButton())
        //enable the button
        // double check btn link & insert only if not there

        // Make fetch query
        let announcements = await getAnnouncements();

        // get new Annoucements
        let newAnnoucements = announcements? hasNewAnnoucements(announcements) : false;
        
        // get new Annoucements style
        state.button.style.display = "none";
        if (newAnnoucements) {//if there are new announcements
            setButtonStyle(state.button, state.newAnnoucementsClasses);
            state.button.style.display = "inline-block";//only show if new announcements
        }
        // insert Annoucements Button
        insertAnnoucementsButton(state.button, state.buttonContainer);

    }
}

// place announcements button in the container
function insertAnnoucementsButton(button, container) {
    container.appendChild(button);
    console.log('Annoucements button placed');
}

// set btn style to unread
function setButtonStyle(button, classes) {
    classes.forEach((className) => button.classList.add(className));
}

// check if there are unread annoucements
function hasNewAnnoucements(announcement) {
    var n_unread = 0;
    announcement.forEach(function (item) {
        if (String(item.read_state) === 'unread') {
            n_unread++;
        }
    });

    return n_unread > 0;
}

// call Annoucements API
async function getAnnouncements() {
    let courseID = ScaffoldClient.getCourseID();
    //let url = '/api/v1/announcements?context_codes[]=course_' + courseID;
    let url = `https://unity.instructure.com/api/v1/courses/${courseID}/discussion_topics?only_announcements=true`;
    
    let options = {
        method: 'GET',
        credentials: 'include',
        headers: {
            "Accept": "application/json",
            "X-CSRF-Token": ScaffoldClient.getCsrfToken()
        }
    };

    try {
        const response = await fetch(url, options); // Send the request and wait for the response
        if (!response.ok) {
            throw new Error('Request failed with status ' + response.status);
        }
        const data = await response.json(); // Extract the JSON data from the response
        return data; // Return the fetched data
    } catch (error) {
        console.error('Error:', error.message);
        return false;
    }
}

function getTargetButton(buttonContainer, buttonInfo) {
    let anchorTag = createElement(buttonInfo.anchor);
    let buttonTag = createElement({...buttonInfo.container, children: [anchorTag]});//set children as anchor tag

    return buttonTag;
}

//** Helper methods:

//create element
function createElement({elementType = "DIV", children, title, classNames, link}) {
    const element = document.createElement(elementType);

    if (children) {
        children.forEach(child => { element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child) });
    }

    if (title) element.title = title;
    if (classNames) classNames.split(" ").forEach((className) => element.classList.add(className.trim()));
    if (link) element.href = link;

    return element;
}

//find and return first item that meets the requirement
function findFirstElement(array, requirement) {//unneeded
    for (let i = 0; i < array.length; i++) {
        if (requirement(array[i])) {
            return array[i];
        }
    }
    return undefined; // Return undefined if no element meets the requirement
}

// button requirement
function isTargetButton(linkString) {//unneeded
    return linkString === "#";
}

console.log(`========Announcements button - END ==========`)
    };

    m.setCourseProgressBlock = function(item) {
        console.log(`========= setCourseProgressBlock ==========`);

console.log(`item: ${item}`);

// Things to calculate 
// Continue(already have)
// course progress

// set Continue
// get modules
// calculate the order of continueitem module
// set progressbar

init();
function init() {
    let components = document.querySelectorAll('.cbt-course-progress');
    components.forEach(component => loadProgressBlock(component));

}

function loadProgressBlock(component) {
    //set HTML
    component.innerHTML = getHTML(`loading...`, '0');

    //get Modules
    let modules = ScaffoldClient.courseData.modules;

    // calculate course completion
    let completePercentage = calculateCourseCompletion(modules);

    // set progressbar
    component.innerHTML = getHTML(`<strong>${completePercentage}%</strong> completed`, completePercentage);
} 

function calculateCourseCompletion(modules) {
 
    let modulesCompleted = 0;

    for (let i = 0; i < modules.length; i++) {
        if (modules[i].completed_at) {
            modulesCompleted++;
        }
    }
    let completePercentage = (modulesCompleted / modules.length) * 100
    return Math.round(completePercentage);
}

function getHTML(infoString, progressBarWidth) {
    let html = `<h3>Course Progress</h3>
        <div class="cbt-progress-info">
            <p>${infoString}</p>
            <div class="cbt-progress-bar"><span style="width: ${progressBarWidth}%;">&nbsp;</span></div>
        </div>`;

    if(item && item.title){
        html += `<div class="cbt-progress-continue">
                    <div><p>Start <strong>${item.title}</strong></p></div>
                    <div class="scaffold-media-box cbt-button"><a title="${item.title}" href="${item &&  item.html_url? item.html_url : '#'}">${progressBarWidth > 0 ? `Continue...` : `Start here`}</a></div>
                </div>`;
    } else { 
        if (progressBarWidth == 100){
            html += `<div class="cbt-progress-continue">
                        <div><p>Congratulations! You have completed the course.</p></div>
                    </div>`;
        } else { // for teacher / LD
            html += `<div class="cbt-progress-continue">
                        <div><p>Please select a module tile to begin.</p></div>
                    </div>`;
        }

    }

    return html;
}

//** Helper methods:

//create element
function createElement({ elementType = "DIV", children, title, classNames, link }) {
    const element = document.createElement(elementType);

    if (children) {
        children.forEach(child => { element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child) });
    }

    if (title) element.title = title;
    if (classNames) classNames.split(" ").forEach((className) => element.classList.add(className.trim()));
    if (link) element.href = link;

    return element;
}


//console.log(`Course Progress:: ${asd}`)
console.log(`========= setCourseProgressBlock END ==========`);

/*

let heading = createElement({elementType: "H3", children: ["Course Progress"]});
    // set info container
    let infoContainer = createElement({elementType: "DIV", classNames: "cbt-progress-info"});
    infoContainer.innerHTML = `<p><strong>loading...</strong></p><div class="cbt-progress-bar"><span>&nbsp;</span></div>`;
    // set continue container
     let continueContainer = createElement({elementType: "DIV", classNames: "cbt-progress-continue"});
    continueContainer.innerHTML = ` <div><p>Start <strong>${item.title}</p></div>
            <div class="scaffold-media-box cbt-button">
                <a title="${item.title}" href="${item.html_url}">Continue...</a>
            </div>`;

    component.appendChild
    return element;

    */
    };

    m.getNavHTML = function(navItem) {
        

var doneHtml = "";
if(document.getElementById("mark-as-done-container")){
    doneHtml = document.getElementById("mark-as-done-container").innerHTML;
    document.getElementById("mark-as-done-container").innerHTML = "";
}
var html = '<div class="cbt-nav-footer" role="navigation" aria-label="Module Navigation">';
html += doneHtml,
html += "<hr>",
html += '<div class="row">',
navItem.items.length > 0 && navItem.items[0].prev ? (html += '<div class="col-xs-6 col-sm-6 col-md-6 col-6">',
html += '<div class="cbt-nav-prev"><div class="cbt-nav-wrapper left"> \
        <div class="cbt-nav"><i class="cbt-icon-left" aria-hidden="true"></i></div><span>Back</span></div>\
        <div class="cbt-nav-item-detail right"> \
        <p class="cbt-nav-module-name">'+ navItem.items[0].prev.module_title +'</p> \
        <p class="cbt-nav-item-name">' + navItem.items[0].prev.title + "</p></div>",
html += '<a class="cbt-nav-link" aria-label="' + navItem.items[0].prev.module_title + '" href="' + navItem.items[0].prev.html_url + '"></a>',
html += "</div></div>") : html += '<div class="col-xs-12 col-sm-12 col-md-6 col-6 cbt-inactive"></div>';


navItem.items.length > 0 && navItem.items[0].next ? (html += '<div class="col-xs-6 col-sm-6 col-md-6 col-6">',
html += '<div class="cbt-nav-next"><div class="cbt-nav-item-detail left"><p class="cbt-nav-module-name">'+navItem.items[0].next.module_title+'</p> \
        <p class="cbt-nav-item-name">' + navItem.items[0].next.title + '</p></div> \
        <div class="cbt-nav-wrapper right"><div class="cbt-nav"><i class="cbt-icon-right" aria-hidden="true"></i></div><span>Next</span></div>',
html += '<a class="cbt-nav-link" aria-label="' + navItem.items[0].next.title + '" href="' + navItem.items[0].next.html_url + '"></a>',
html += "</div></div>") : html += '<div class="col-xs-12 col-sm-12 col-md-6 col-6 cbt-inactive"></div>',
html += "</div>",
html += "</div>";

return html

    };

    m.snippetCopy = function() {
        /*Copy to clipboard*/
var i, code;
code = document.getElementsByClassName("cbt-snippet-copy");
for (i = 0; i < code.length; i++) {
    code[i].addEventListener("click", function () {
        var copyText = this.previousElementSibling.textContent;
        const el = document.createElement('textarea');
        el.value = copyText;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        this.innerHTML = "Copied!";
        setTimeout(function () {
            $(".cbt-snippet-copy").each(function () {
                this.innerHTML = "Copy";
            });
        }, 3000);
    });
}

/*Copy to clipboard: Icons*/
setIconsSnippetCopy();
function setIconsSnippetCopy() {
    var i, code;
    code = document.getElementsByClassName("cbt-snippet--icons");
    for (i = 0; i < code.length; i++) {
        code[i].addEventListener("click", copyHandler);
    }

    function copyHandler(e) {
        var copyHTML = e.target.querySelector('.cbt-snippet--target').innerHTML;
        const el = document.createElement('textarea');
        el.textContent = copyHTML;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        e.target.querySelector(`.cbt-copy--status`).innerHTML = "Copied!";
        setTimeout(function () {
            $(".cbt-copy--status").each(function () {
                this.innerHTML = "";
            });
        }, 3000);
    }
}
    };

    m.canvasModuleUtils = function() {
        return {
    pageInfo: {},
    urlTypes: ['Module Item', 'Page', 'Assignment', 'Quiz', 'Discussion', 'ExternalTool', 'File'],
    parseUrl: function (url) {
        const urlSegments = url.split('/');

        if (url.includes('module_item_id=')) {
            const pageUrl = url.split("module_item_id=")[1];
            return { type: 'Module Item', id: pageUrl };
        } else if (url.includes('/pages/')) {
            const pageUrlIndex = urlSegments.indexOf('pages') + 1;
            const pageUrl = urlSegments[pageUrlIndex];
            return { type: 'Page', id: pageUrl };
        } else if (url.includes('/assignments/')) {
            const assignmentIdIndex = urlSegments.indexOf('assignments') + 1;
            const assignmentId = urlSegments[assignmentIdIndex];
            return { type: 'Assignment', id: assignmentId };
        } else if (url.includes('/quizzes/')) {
            const quizIdIndex = urlSegments.indexOf('quizzes') + 1;
            const quizId = urlSegments[quizIdIndex];
            return { type: 'Quiz', id: quizId };
        } else if (url.includes('/discussion_topics/')) {
            const discussionIdIndex = urlSegments.indexOf('discussion_topics') + 1;
            const discussionId = urlSegments[discussionIdIndex];
            return { type: 'Discussion', id: discussionId };
        } else if (url.includes('/external_tools/')) {
            const toolIdIndex = urlSegments.indexOf('external_tools') + 1;
            const toolId = urlSegments[toolIdIndex];
            return { type: 'ExternalTool', id: toolId };
        } else if (url.includes('/files/')) {
            const fileIdIndex = urlSegments.indexOf('files') + 1;
            const fileId = urlSegments[fileIdIndex];
            return { type: 'File', id: fileId };
        } else if (url.includes('/modules/') && url.includes('#')) {
            const moduleItemIdIndex = urlSegments.indexOf('modules') + 1;
            const moduleItemId = urlSegments[moduleItemIdIndex].split("#")[1];
            return { type: 'Module Item', id: moduleItemId };
        } else if (url.includes('/modules/') && url.includes('/items/')) {
            const moduleItemIdIndex = urlSegments.indexOf('items') + 1;
            const moduleItemId = urlSegments[moduleItemIdIndex];
            //console.log(`moduleItemId ${moduleItemId}`);
            return { type: 'Module Item', id: moduleItemId };
        } else if (url.includes('/assignment_groups/')) {
            // const assignmentGroupIdIndex = urlSegments.indexOf('assignment_groups') + 1;
            // const assignmentGroupId = urlSegments[assignmentGroupIdIndex];
            // return { type: 'Assignment Group', id: assignmentGroupId };
        } else {
            return { type: 'Unknown', id: null };
        }
    },
    setUrl: function (url) {
        let filteredID = filterIDString(this.parseUrl(url))
        this.pageInfo.info = filteredID;

        function filterIDString(infoObj) {
            let id = infoObj.id;
            if (id) {
                // Check if invalid characters (#, &, ?) are in the middle of the slug string
                if (/\D[#&?]\D/.test(id)) {
                    return null; // Return null if invalid characters are in the middle
                }

                // Remove invalid characters (#, &, ?) using regular expression
                infoObj.id = id.replace(/[#&?]/g, '');
            }

            return infoObj;
        }
    },
    matchesModuleItem: function (moduleItem) {
        let info = this.pageInfo.info;
        if (!moduleItem || !info) {
            console.log(`error not match`)
            return false;
        }

        ////console.log(`wassa: ${info.type}`)
        // 'File', 'Page', 'Discussion',
        // 'Assignment', 'Quiz', 'SubHeader', 'ExternalUrl', 'ExternalTool'
        if (this.urlTypes.some((item) => item === moduleItem.type)) {
            if (info.type == 'Module Item') {
                return moduleItem.id == info.id
            }
            if (info.type == 'Page') {
                return moduleItem.page_url == info.id
            }
            return moduleItem.content_id == info.id
        }

        return (false);
    }
}
    };

    m.currentModuleHelper = function(modulesData) {
        let canvasModuleUtils = ScaffoldClient.canvasModuleUtils;
return {
    getCurrentModule: function () {
        //console.log("getCurrentModule()");
        let modules = modulesData ? modulesData : ScaffoldClient.courseData.modules;
        return modules.reduce((acc, module, arr, index) => {
            let modItems = module.items;
            let isCurrentModule = this.getCurrModuleItem(modItems);
            if (!acc) {
                if (isCurrentModule) {
                    return module;
                }
            }
            else { return acc; }
            return false;
        }, 0);
    },
    getCurrModuleItem: function (modItems) {
        ////console.log(`modItems: "${modItems}"`);
        return modItems.reduce((acc, item, index, arr) => {
            if (!acc) {
                if (this.isCurrentPage(item)) {
                    return item;
                }
            }
            else { return acc; }
            return false;
        }, false);
    },
    isCurrentPage: function (item) {
        let moduleUtils = canvasModuleUtils();
        ////console.log(`moduleUtils: ${JSON.stringify(moduleUtils)}`);

        moduleUtils.setUrl(window.location.href);

        ////console.log(`moduleUtils2: ${JSON.stringify(moduleUtils)}`);

        const matches = moduleUtils.matchesModuleItem(item);
        return matches;
    }
}
    };

	return m;

})(ScaffoldClient || {});
// load base css
var loadstyles = [];
// var style = 'https://app.getscaffold.co/deploy/08a990a64086e274a440029a740b78dd2ab2d6a51ccd0f00268a0e445e1ac45c/mobile.css';
// loadstyles.push(style);
for (var i = 0; i < loadstyles.length; i++) {
	var fileref=document.createElement("link");
	fileref.setAttribute("rel", "stylesheet");
	fileref.setAttribute("type", "text/css");
	fileref.setAttribute("href", loadstyles[i]);
	document.getElementsByTagName("head")[0].appendChild(fileref);
}

// document.addEventListener("scaffoldclientjscontrolsloaded", function () {
	if (window['ScaffoldClient'] !== undefined) {
		ScaffoldClient.init();
	}
// });

window.addEventListener('load', function() {
	if (window['ScaffoldClient'] !== undefined) {
		ScaffoldClient.onPageLoad();
	}
});

// var path = 'https://app.getscaffold.co/deploy/08a990a64086e274a440029a740b78dd2ab2d6a51ccd0f00268a0e445e1ac45c/mobile.js';
// (function () { var script = document.createElement('script'); script.src=path,script.async=!0,script.charset="UTF-8",script.onload=function(){fireEvent("scaffoldclientjscontrolsloaded")};var firstScript=document.getElementsByTagName("script")[0];function fireEvent(e){var t;document.createEventObject||document.createEvent?(document.createEvent?(t=document.createEvent("HTMLEvents")).initEvent(e,!0,!0):document.createEventObject&&((t=document.createEventObject()).eventType=e),t.eventName=e):t=new CustomEvent(e,{bubbles:!0,cancelable:!0}),document.dispatchEvent(t)}firstScript.parentNode.insertBefore(script,firstScript); })();
