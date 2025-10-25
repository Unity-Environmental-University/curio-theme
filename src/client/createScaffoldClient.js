import {afterOnLoad} from "./afterOnLoad.js";
import {getNavHtml} from "../toolbox/getNavHtml.js";
import {afterInit} from "./afterInit.js";
import {getModImgUrl} from "../toolbox/getModImgUrl.js";
import {displayRubric} from "./displayRubric.js";
import {setupDiscussionNoticeAsync} from "../toolbox/discussionUtils.js";
import {canvasModuleUtils} from "../toolbox/canvasModuleUtils.js";
import {currentModuleHelper} from "../toolbox/currentModuleHelper.js";
import {getCourseId} from "./hooks/useDocInfo.js";
import {accordionList} from "../components/accordionList.js";
import {getCsrfToken} from "../toolbox/getCsrfToken.js";

export const createScaffoldClient = function (scaffoldClient, $) {
    scaffoldClient.modules = [
        'carousel_1',
        'blockquote_14',
        'callout_box_10',
        'page_banner_w_image_96',
        'tabs_24',
        'two_columns_21',
        'uta_staff_card_244',
        'utc_accordion_242',
        'utc_audio_251',
        'utc_blockquote_248',
        'utc_button_228',
        'utc_callout_box_239',
        'page_banner_w_image_copy_229',
        'utc_home_footer_237',
        'utc_lined_heading_234',
        'utc_media_container_252',
        'utc_module_cards_236',
        'utc_page_as_agreement_238',
        'utc_pages_banner_247',
        'utc_progress_and_continue_253',
        'utc_rubric_btn_230',
        'utc_table_240',
        'utc_tabs_243',
        'utc_two_columns_233',
        'utc_video_232',
        'utc_videos_carousel_241',
        'utc_weekly_mat_topics_249'
    ].map(id => ({id}));

    scaffoldClient.oninitset = false;
    scaffoldClient.onloadset = false;

    scaffoldClient.loadcheck = false;
    scaffoldClient.loadcount = 0;

    scaffoldClient.options = {
        source: 'api',
        origin: document.location.origin,
        afterInit,
        afterOnLoad,
        css: [],
        js: []
    };

    scaffoldClient.data = {};
    scaffoldClient.init = async function (options) {
        if (scaffoldClient.oninitset) return false;
        scaffoldClient.options = $.extend(scaffoldClient.options, options);

        if (!scaffoldClient.options.scaffoldBuilder) throw new Error("Scaffold builder must be passed in");
        scaffoldClient.scaffoldBuilder = options.scaffoldBuilder;
        if (scaffoldClient.options.css !== undefined) {
            if (typeof scaffoldClient.options.css === 'string')
                scaffoldClient.options.css = [scaffoldClient.options.css];
            scaffoldClient.options.css.forEach((a) => {
                var fileref = document.createElement("link")
                fileref.setAttribute("rel", "stylesheet")
                fileref.setAttribute("type", "text/css")
                fileref.setAttribute("href", a)
                document.getElementsByTagName("head")[0].appendChild(fileref)
            });
        }

        if (scaffoldClient.options.js !== undefined) {
            if (typeof scaffoldClient.options.js === 'string')
                scaffoldClient.options.js = [scaffoldClient.options.js];

            scaffoldClient.options.js.forEach((a) => {
                var st = document.createElement("script");
                st.type = "text/javascript";
                st.src = a;
                document.getElementsByTagName('head')[0].appendChild(st);
            });
        }

        if (scaffoldClient.modules.length) {
            scaffoldClient.modules.forEach(item => {
                if (item.init !== undefined && typeof item.init === 'function')
                    item.init();
            });
        }

        if (scaffoldClient.options.afterInit !== undefined && typeof scaffoldClient.options.afterInit === 'function')
            scaffoldClient.options.afterInit(scaffoldClient);

        scaffoldClient.oninitset = true;

    };

    scaffoldClient.onPageLoad = function () {
        if (!scaffoldClient.oninitset || scaffoldClient.onloadset) {
            if (!scaffoldClient.loadcheck) {
                scaffoldClient.loadcheck = setInterval(function () {
                    if (document.readyState === 'complete') {
                        scaffoldClient.onPageLoad();
                    }
                }, 250);
            }

            if (200 === scaffoldClient.loadcount) {
                clearInterval(scaffoldClient.loadcheck);
            } else {
                scaffoldClient.loadcount += 1;
            }
            return;
        }

        if (scaffoldClient.loadcheck)
            clearInterval(scaffoldClient.loadcheck);

        scaffoldClient.loadcount = 0;

        if (scaffoldClient.modules.length) {
            scaffoldClient.modules.forEach(item => {
                if (item.pageload !== undefined && typeof item.pageload === 'function')
                    item.pageload();
            });
        }

        if (scaffoldClient.options.afterOnLoad !== undefined && typeof scaffoldClient.options.afterOnLoad === 'function')
            scaffoldClient.options.afterOnLoad(scaffoldClient);

        scaffoldClient.onloadset = true;
    };


    scaffoldClient.getModImgURL = getModImgUrl;


    scaffoldClient.getCourseID = function () {
        if (scaffoldClient.options['courseid'] === undefined) {
            if (window?.ENV?.COURSE_ID) {
                scaffoldClient.options['courseid'] = window.ENV.COURSE_ID;
            } else {
                if (document.getElementById('cbt-courseid')) {
                    scaffoldClient.options['courseid'] = document.getElementById('cbt-courseid').getAttribute('data-course-id');
                } else if (document.getElementById('cbt-progress')) {
                    scaffoldClient.options['courseid'] = document.getElementById('cbt-progress').getAttribute('data-course-id');
                } else if (window.location.pathname.match(/(courses)\/[0-9]{1,}/gi)) {
                    var id = window.location.pathname.match(/(courses)\/[0-9]{1,}/gi)[0].split("courses/");
                    scaffoldClient.options['courseid'] = id[id.length - 1];
                }
            }
        }
        return scaffoldClient.options.courseid;
    };

    scaffoldClient.getCsrfToken = getCsrfToken,
    scaffoldClient.getOrigin = function () {
        return scaffoldClient.options.origin;
    };

    scaffoldClient.getPageTitle = function () {

        if (scaffoldClient.options['pagetitle'] !== undefined) return scaffoldClient.options['pagetitle'];
        var pageTitle = "";
        //get page title
        if (document.getElementsByClassName("page-title") && document.getElementsByClassName("page-title").length > 0) {
            pageTitle = document.getElementsByClassName("page-title")[0].innerHTML;
        } else if (document.querySelectorAll(".ellipsible") && document.querySelectorAll(".ellipsible").length > 2) {
            pageTitle = document.querySelectorAll(".ellipsible")[document.querySelectorAll(".ellipsible").length - 1].innerText
        } else if (document.title) {
            pageTitle = document.title;
        }

        scaffoldClient.options['pagetitle'] = pageTitle;
        return scaffoldClient.options.pagetitle;

    };

    scaffoldClient.merge = function () {
        var dst = {}
            , src
            , p
            , args = [].splice.call(arguments, 0)
        ;

        while (args.length > 0) {
            src = args.splice(0, 1)[0];
            if (toString.call(src) === '[object Object]') {
                for (p in src) {
                    if (src.hasOwnProperty(p)) {
                        if (toString.call(src[p]) === '[object Object]') {
                            dst[p] = scaffoldClient.merge(dst[p] || {}, src[p]);
                        } else {
                            dst[p] = src[p];
                        }
                    }
                }
            }
        }

        return dst;
    };

    scaffoldClient.fetchstatus = function (response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    };

    /*
    * Function which returns json from response
    */
    scaffoldClient.fetchjson = function (response) {
        return response.json()
    };


    scaffoldClient.accordionList = accordionList;

    scaffoldClient.tabs = function () {
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
            let t_con = tab.getElementsByClassName("cbt-tab-content");
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

    scaffoldClient.getCarousels = async function () {
        /** Image and video carousel **/
        // Updating arrow visibility
        function HideShowArrow(prevButton, nextButton, targetDotIndex, totalSlides) {
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
        function UpdateDots(currentDot, targetDot) {
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

            if (currIndex > targetIndex) {
                while (targetSlide != tempSlide) {
                    tempSlide.style.left = leftValue + "px";
                    tempSlide.style.display = "none";
                    tempSlide = tempSlide.previousElementSibling
                }
            } else if (currIndex < targetIndex) {
                while (targetSlide != tempSlide) {
                    tempSlide.style.left = leftValue + "px";
                    tempSlide.style.display = "none";
                    tempSlide = tempSlide.nextElementSibling
                }
            }

            // stop the current video
            if (currentSlide.querySelector("iframe")) {
                currentSlide.querySelector('iframe').setAttribute('src', currentSlide.querySelector('iframe').getAttribute('src'));
            }
            targetSlide.style.display = "block";
            targetSlide.style.left = 0 + "px";

            // check height of the image
            if (targetSlide.querySelector("img")) {
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

            if (!track.querySelector(".cbt-carousel-current-slide")) { //set the first element when the page load
                track.children[0].classList.add("cbt-carousel-current-slide");
                track.children[0].style.left = 0;
                track.children[0].style.display = "block"; //avoid the iframe load display on the screen load
                // initial height of the image
                if (track.children[0].querySelector("img")) {
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
                carousel[i].querySelector(".cbt-carousel__nav").innerHTML += '<button tabIndex="0" class="cbt-carousel__indicator" aria-label="slide ' + j + ' navigation"></button>';
            }

            carousel[i].querySelector(".cbt-carousel__nav").children[0].classList.add("cbt-carousel-current-slide");

            const prevButton = carousel[i].querySelector(".cbt-carousel__button--left");
            const nextButton = carousel[i].querySelector(".cbt-carousel__button--right");
            const dotsNav = carousel[i].querySelector(".cbt-carousel__nav");
            const dots = Array.from(dotsNav.children);
            const slides = Array.from(carousel[i].querySelector(".cbt-carousel__track-container").children);

            // On click right button slide moves to left
            nextButton.addEventListener("click", (e) => {
                const currentSlide = track.querySelector(".cbt-carousel-current-slide");
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
                const targetDot = e.target.closest("button");
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


    scaffoldClient.getUserName = function (data) {
        /* return user name */
        return new Promise(function (userRes, userRej) {
            let url = `/api/v1/users/self`;
            if (typeof Bottleneck != 'undefined' && scaffoldClient.limiter && typeof scaffoldClient.fetchResult === 'function') {
                scaffoldClient.fetchResult(url, function (data) {
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
                        "X-CSRF-Token": scaffoldClient.getCsrfToken()
                    }
                })
                    .then(scaffoldClient.fetchstatus)
                    .then(scaffoldClient.fetchjson)
                    .then(function (user) {
                        if (user.hasOwnProperty("short_name")) {
                            userRes(user)
                        }
                    }).catch(function (error) {
                    console.log('Request failed', error);
                    userRej(error);
                });
            }
        });


    };

    scaffoldClient.getContinueItem = async function (course_id) {
        return new Promise(function (continueRes, continueRej) {
            /* Circular progress bar */
            if (!scaffoldClient.courseData || !scaffoldClient.courseData.modules || scaffoldClient.courseData.modules == 0) {
                //console.log('cannot find course Data :(');
                let moduleItemUrl = origin + "/api/v1/courses/" + scaffoldClient.getCourseID() + "/modules?per_page=100&include[]=items";
                scaffoldClient.fetchResults(moduleItemUrl, scaffoldClient.courseData.saveModuleItems);
            } else {
                var publishedModules = scaffoldClient.courseData.modules.filter((m) => {
                    return (typeof m.published === 'undefined' || m.published === true) && m.state != 'completed'
                })
                if (publishedModules && publishedModules.length > 0) {
                    publishedModules.sort(function (a, b) {
                        return parseFloat(a.position) - parseFloat(b.position);
                    });
                    var incompletedModule = publishedModules[0].items;
                    var incompletedItem = incompletedModule.find((i) => {
                        return i.completion_requirement && i.completion_requirement.completed === false
                    });
                    // console.log(incompletedItem);
                    if (incompletedItem) {
                        incompletedItem['status'] = publishedModules[0].state;
                        incompletedItem['module_name'] = publishedModules[0].name;
                        incompletedItem['module_item_link'] = scaffoldClient.getOrigin() + incompletedItem.url.split("/api/v1")[1] + '?module_item_id=' + incompletedItem.id;
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
            if (typeof Bottleneck !== 'undefined' && !(e instanceof Bottleneck.BottleneckError)) {
                console.log(`getContinueItem Error: ${e}`);
                Promise.reject(e);
            }
        });


    };

    scaffoldClient.findNavItems = async function () {
        let courseId = getCourseId();
        let pageType = '';
        let pageId;

        if (window.location.search && window.location.search.match(/module_item_id/gi)) {
            pageId = (s = window.location.search.split("module_item_id="))[s.length - 1]
                , pageType = "ModuleItem";
        } else if (window.location.pathname.match(/(courses)\/[0-9]{1,}\/(pages)\//gi))
            if (window.location.pathname.match(/new/gi) || window.location.pathname.match(/edit/gi))
                ;
            else {
                pageId = (s = (i = window.location.pathname.match(/(pages)\/.{1,}/gi))[0].split("pages/"))[s.length - 1]
                    , pageType = "Page";
            }
        else if (window.location.pathname.match(/(courses)\/[0-9]{1,}\/(quizzes)\//gi))
            if (window.location.pathname.match(/new/gi) || window.location.pathname.match(/edit/gi))
                ;
            else {
                pageId = (s = (i = window.location.pathname.match(/(quizzes)\/[0-9]{1,}/gi))[0].split("quizzes/"))[s.length - 1]
                    , pageType = "Quiz";
            }
        else if (window.location.pathname.match(/(courses)\/[0-9]{1,}\/(assignments)\//gi) && !window.location.pathname.match(/syllabus/gi))
            if (window.location.pathname.match(/new/gi) || window.location.pathname.match(/edit/gi))
                ;
            else {
                pageId = (s = (i = window.location.pathname.match(/(assignments)\/[0-9]{1,}/gi))[0].split("assignments/"))[s.length - 1]
                    , pageType = "Assignment";
            }
        else if (window.location.pathname.match(/(courses)\/[0-9]{1,}\/(discussion_topics)\//gi))
            if (window.location.pathname.match(/new/gi) || window.location.pathname.match(/edit/gi))
                ;
            else {
                pageId = (s = (i = window.location.pathname.match(/(discussion_topics)\/[0-9]{1,}/gi))[0].split("discussion_topics/"))[s.length - 1]
                    , pageType = "Discussion";
            }
        else if (window.location.pathname.match(/(courses)\/[0-9]{1,}\/(files)/gi)) {
            pageId = (s = (i = window.location.pathname.match(/(files)\/[0-9]{1,}/gi))[0].split("files/"))[s.length - 1]
                , pageType = "File";
        } else if (window.location.pathname.match(/(courses)\/[0-9]{1,}\/(modules\/items)/gi)) {
            var i = window.location.pathname.match(/(modules\/items)\/.{1,}/gi)
                , s = i[0].split("modules/items/");
            pageId = s[s.length - 1];
            pageType = "ModuleItem";
        }

        return new Promise(function (res, rej) {
            if (courseId && pageType && pageId) {
                $.ajax({
                    url: "/api/v1/courses/" + courseId + "/module_item_sequence?asset_type=" + pageType + "&asset_id=" + pageId + "&frame_external_urls=true"
                }).fail(function (navItem) {
                }).done(function (navItem) {
                    if (navItem.items.length > 0 && navItem.items[0].prev) {
                        var prev = navItem.items[0].prev.module_id;
                        for (var i = 0; i < navItem.modules.length; i++) {
                            if (navItem.modules[i].id == prev) {
                                navItem.items[0].prev.module_title = navItem.modules[i].name;
                                break;
                            }
                        }
                    }
                    if (navItem.items.length > 0 && navItem.items[0].next) {
                        var next = navItem.items[0].next.module_id;
                        for (var i = 0; i < navItem.modules.length; i++) {
                            if (navItem.modules[i].id == next) {
                                navItem.items[0].next.module_title = navItem.modules[i].name;
                                break;
                            }
                        }
                    }
                    res(navItem);
                })
            } else {
                rej();
            }
        }).catch(function (e) {
            // Suppress warnings when canceled
            console.log(`findNavItems Error: ${e}`);
            rej();
        });
    };

    scaffoldClient.initMarkableDiscussion = function () {
        const markable_discussion = {
            dataHandler: {
                data: {},
                ns: "cbt_discussion_" + getCourseId(),
                getData: function () {
                    var e = {
                        ns: markable_discussion.dataHandler.ns
                    };
                    return new Promise(function (i, e) {
                        fetch("/api/v1/users/self/custom_data/" + markable_discussion.dataHandler.ns + "?ns=" + markable_discussion.dataHandler.ns, {
                            method: 'GET',
                            credentials: 'include',
                            headers: {
                                "Accept": "application/json",
                                "X-CSRF-Token": scaffoldClient.getCsrfToken()
                            }
                        })
                            .then(scaffoldClient.fetchstatus)
                            .then(scaffoldClient.fetchjson)
                            .then(function (t) {
                                var e = JSON.parse(t.data);
                                i(e)
                            })
                            .catch(function (error) {
                                console.log(`initMarkableDiscussion Get Error: ${error}`);
                                e(error);
                            });
                    })
                },
                setData: function (d) {
                    var i = {
                        data: d
                    };

                    return new Promise(function (e) {
                        fetch('/api/v1/users/self/custom_data/' + markable_discussion.dataHandler.ns + "?ns=" + markable_discussion.dataHandler.ns, {
                            method: 'PUT',
                            credentials: 'include',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                "X-CSRF-Token": scaffoldClient.getCsrfToken()
                            },
                            body: JSON.stringify(i)
                        })
                            .then(scaffoldClient.fetchstatus)
                            .then(scaffoldClient.fetchjson)
                            .then(function (t) {
                                var i = JSON.parse(t.data);
                                console.log(i),
                                    e(i)
                            })
                            .catch(function (error) {
                                console.log(`initMarkableDiscussion Set Error: ${error}`);
                            });
                    })
                }

            },
            ui: {
                updateTaskHTML: function (task_id, e) {
                    var discussionId;
                    if (/task-(\d)+-/.test(task_id)) {
                        discussionId = task_id.match(/task-(\d)+-/)[0].replace(/-$/, '');
                    }
                    if (e.querySelector(".utc-icon-empty")) { //not checked
                        e.querySelector(".utc-icon-empty").classList.add("utc-icon-checkmark-circle");
                        e.classList.add("utc-mark-done");
                        e.querySelector(".utc-icon-empty").classList.remove("utc-icon-empty");
                        e.querySelector(".mark-done-labels").innerHTML = '<span class="visible">Done</span>';
                        console.log("Add data");

                        if (!markable_discussion.dataHandler.data[discussionId]) {
                            markable_discussion.dataHandler.data[discussionId] = [];
                            markable_discussion.dataHandler.data[discussionId].push(task_id);
                        } else if (markable_discussion.dataHandler.data[discussionId].indexOf(task_id) == -1) {
                            markable_discussion.dataHandler.data[discussionId].push(task_id);
                        }


                    } else if (e.querySelector(".utc-icon-checkmark-circle")) { //checked
                        e.querySelector(".utc-icon-checkmark-circle").classList.add("utc-icon-empty");
                        e.classList.remove("utc-mark-done");
                        e.querySelector(".utc-icon-checkmark-circle").classList.remove("utc-icon-checkmark-circle");
                        e.querySelector(".mark-done-labels").innerHTML = '<span class="visible">Mark as done.</span>';

                        console.log("Delete data");

                        if (markable_discussion.dataHandler.data[discussionId]) {
                            const dataIndex = markable_discussion.dataHandler.data[discussionId].indexOf(task_id);
                            if (dataIndex > -1) {
                                markable_discussion.dataHandler.data[discussionId].splice(dataIndex, 1);
                            }
                        }
                    }
                    console.log(markable_discussion.dataHandler.data);
                    markable_discussion.dataHandler.setData(JSON.stringify(markable_discussion.dataHandler.data)).then(function (t) {
                        console.log(t)
                    }, function (t) {
                        console.log(`initMarkableDiscussion updateTaskHTML Error: ${t}`);
                    })
                }
            },

            init: function () {
                // check task status
                // markable_discussion.dataHandler.getData().then(function (e) {
                //         console.log("Data exists");
                //         markable_discussion.dataHandler.data = e;
                //         console.log(markable_discussion.dataHandler.data);
                //         if (scaffoldClient.courseData.currentItem && scaffoldClient.courseData.currentItem.hasOwnProperty("type") && scaffoldClient.courseData.currentItem.type === 'Discussion') { // they have to be a module item
                //             var discussionId = (Object.keys(scaffoldClient.courseData.currentModule).length > 0 ? scaffoldClient.courseData.currentItem.content_id : scaffoldClient.courseData.currentItem.id); // this is module item id

                //             var taskDiscussionId = 'task-' + discussionId;
                //             var tasks = document.querySelectorAll('.cbt-manual-mark-btn');
                //             if (tasks && tasks.length == 2) {

                //                 setupDiscussionNoticeAsync(discussionId, scaffoldClient.getCourseID()).then();
                //                 if (markable_discussion.dataHandler.data[taskDiscussionId]) {
                //                     var btns = markable_discussion.dataHandler.data[taskDiscussionId];
                //                     for (let i = 0; i < tasks.length; i++) {
                //                         /* Identify if the button is clicked or not */
                //                         let currentTaskId = taskDiscussionId + '-btn-' + i;
                //                         if (btns.indexOf(currentTaskId) > -1) {
                //                             tasks[i].innerHTML = '<button class="btn utc-mark-done" data-discussion-done-id="' + currentTaskId + '" ><i class="utc-icon-checkmark-circle"></i> <span class="mark-done-labels"><span class="visible">Done</span></span></button>';
                //                         } else {
                //                             tasks[i].innerHTML = '<button class="btn" data-discussion-done-id="' + currentTaskId + '" ><i class="utc-icon-empty"></i> <span class="mark-done-labels"><span class="visible">Mark as done.</span></span></button>';
                //                         }
                //                         tasks[i].querySelector('button').addEventListener("click", (e) => {
                //                             var currTaskID = e.currentTarget.getAttribute("data-discussion-done-id");
                //                             console.log(currTaskID);
                //                             markable_discussion.ui.updateTaskHTML(currTaskID, e.currentTarget);
                //                         })
                //                     }
                //                 } else {
                //                     markable_discussion.dataHandler.data[taskDiscussionId] = [];
                //                     for (let i = 0; i < tasks.length; i++) {
                //                         /* Default status */
                //                         tasks[i].innerHTML = '<button class="btn" data-discussion-done-id="task-' + taskDiscussionId + '-btn-' + i + '" ><i class="utc-icon-empty"></i> <span class="mark-done-labels"><span class="visible">Mark as done.</span></span></button>';
                //                         tasks[i].querySelector('button').addEventListener("click", (e) => {
                //                             var currTaskID = e.currentTarget.getAttribute("data-discussion-done-id");
                //                             console.log(currTaskID);
                //                             markable_discussion.ui.updateTaskHTML(currTaskID, e.currentTarget);
                //                         })
                //                     }
                //                 }
                //             }
                //         }
                //     },


                //    function (e) {
                        console.log("No Data, create new data");
                        if (scaffoldClient.courseData.currentItem && scaffoldClient.courseData.currentItem.hasOwnProperty("type") && scaffoldClient.courseData.currentItem.type === 'Discussion') { // they have to be a module item
                            console.log("inside the if of creating that new data");
                            let tasks = document.querySelectorAll('.cbt-manual-mark-btn');
                            var discussionId = Object.keys(scaffoldClient.courseData.currentModule).length > 0 ? scaffoldClient.courseData.currentItem.content_id : scaffoldClient.courseData.currentItem.id; // this is module item id
                            for (let i = 0; i < tasks.length; i++) {
                                /* Default status */
                                tasks[i].innerHTML = '<button class="btn" data-discussion-done-id="task-' + discussionId + '-btn-' + i + '" ><i class="utc-icon-empty"></i> <span class="mark-done-labels"><span class="visible">Mark as done.</span></span></button>';
                                tasks[i].querySelector('button').addEventListener("click", (e) => {
                                    var currTaskID = e.currentTarget.getAttribute("data-discussion-done-id");
                                    console.log(currTaskID);
                                    markable_discussion.ui.updateTaskHTML(currTaskID, e.currentTarget);
                                })
                            }

                            tasks = document.querySelectorAll('.cbt-manual-mark-btn');
                            console.log("here is tasks", tasks);
                            // TODO why the length of 2? discussion in question has 3, reason why its not getting it
                            // if (tasks && tasks.length == 2) {
                            if (tasks) {
                                console.log("we are adding the discussion blurb");
                                setupDiscussionNoticeAsync(discussionId, scaffoldClient.getCourseID()).then();
                            }

                        }
                    }
            //    )
          //  }
        }
        console.log("initing discus")
        markable_discussion.init();
    };

    scaffoldClient.getModItemsProgress = async function (discussion) {
        return new Promise(function (incompleteRes, incompleteRej) {
            /* Circular progress bar */
            if (!scaffoldClient.courseData || !scaffoldClient.courseData.modules || scaffoldClient.courseData.modules == 0) {
                //console.log('cannot find course Data :(');
                let moduleItemUrl = origin + "/api/v1/courses/" + getCourseId() + "/modules?per_page=100&include[]=items";
                scaffoldClient.fetchResults(moduleItemUrl, scaffoldClient.courseData.saveModuleItems);
            } else {
                var publishedModules = scaffoldClient.courseData.modules.filter((m) => {
                    return (typeof m.published === 'undefined' || m.published === true)
                });
                var modules = [];

                for (let m of publishedModules) {
                    if (m.state === 'completed') {
                        m['task_progress'] = m.items.length + '/' + m.items.length;
                    } else {

                        var incompleteDiscussions = m.items.filter((i) => {
                            return i.type === 'Discussion' && i.completion_requirement && i.completion_requirement.completed === false
                        });

                        for (let d of incompleteDiscussions) {
                            if (d.hasOwnProperty('content_id')) {
                                let taskId = 'task-' + d.content_id;
                                if (discussion && Object.keys(discussion).length > 0 && discussion[taskId] && discussion[taskId].length >= 2) {
                                    let incompleteIndex = m.items.findIndex((i) => i.id === d.id);
                                    m.items[incompleteIndex].completion_requirement.completed = true;
                                    //console.log("changedItems ", m.items[incompleteIndex]);
                                }
                            }
                        }
                        var completeItems = m.items.filter((i) => {
                            return i.completion_requirement && i.completion_requirement.completed === true
                        });
                        m['task_progress'] = completeItems.length + '/' + m.items.length;
                    }
                    modules.push(m);
                }
                //console.log(modules);
                incompleteRes(modules);
            }
        }).catch(function (e) {
            // Suppress warnings when canceled
            if (typeof (Bottleneck) !== 'undefined' && !(e instanceof Bottleneck.BottleneckError)) {
                console.log(`getIncompleteModItems Error: ${e}`);
                Promise.reject(e);
            }
        });


    };


    scaffoldClient.displayRubric = displayRubric,


    scaffoldClient.setPageAsAgreement = function () {


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
            if (state.markAsDoneButton) {
                setButtonStyle();
                setButtonText();
                placeMarkAsDoneButton();
            } else {
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
                state.buttonClasses.split(" ").forEach((className) => {
                    state.markAsDoneButton.classList.add(className.trim())
                });
            }
        }

        function setButtonText() {
            let btnText = state.temporaryButton.textContent;
            if (state.markAsDoneButton) {
                let replaceTargets = state.markAsDoneButton.querySelectorAll(".mark-done-labels span");
                Array.from(replaceTargets).forEach((target) => {
                    target.textContent = btnText
                });
            }
        }

        function placeMarkAsDoneButton() {
            if (state.markAsDoneButton) {
                state.temporaryButton.parentNode.replaceChild(state.markAsDoneButton, state.temporaryButton);
            }
        }

        function setTempBtnAsAgreement(temporaryButton) {
            let modItemData = {
                courseID: encodeURIComponent(scaffoldClient.getCourseID()),
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
                } catch (e) {
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
                        if (isComplete) {
                            temporaryButton.classList.add("btn-success");
                        } else {
                            temporaryButton.classList.remove("btn-success");
                        }
                    }

                    let targetElem = temporaryButtonLink ? temporaryButtonLink : temporaryButton;
                    if (targetElem.firstChild) {
                        targetElem.insertBefore(radioIcon, targetElem.firstChild);
                    } else {
                        targetElem.appendChild(radioIcon);
                    }
                    //console.log(`targetElem.nodeName ${targetElem.firstChild.nodeName}(***)`);
                    //console.log(`targetElem ${targetElem.querySelector('i').classList.length}(***)`);
                    //console.log(`targetElem.innerHTML ${targetElem.innerHTML}(***)`);
                }
                //<i class="utc-icon-empty"> </i>
            }

            // get course id
            // get current module // scaffoldClient.courseData.currentModule
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
                    let modules = scaffoldClient.courseData.modules;
                    return modules.reduce((acc, module, arr, index) => {
                        let modItems = module.items;
                        let isCurrentModule = getCurrModuleItem(modItems);
                        if (!acc) {
                            if (isCurrentModule) {
                                return module;
                            }
                        } else {
                            return acc;
                        }
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
                        } else {
                            return acc;
                        }
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
                modItemData.url = `${scaffoldClient.getOrigin()}/api/v1/courses/${modItemData.courseID}/modules/${modItemData.moduleID}/items/${modItemData.moduleItemID}/done`;
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
                            "X-CSRF-Token": getCsrfToken()
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

                        if (isComplete) {
                            temporaryButton.classList.add("btn-success");
                        } else {
                            temporaryButton.classList.remove("btn-success");
                        }
                    }
                }
            }
        }


        console.log("``````End: Page as agreement;``````");
    };

    scaffoldClient.tab = function () {
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
            const t_con = tab.getElementsByClassName("cbt-tab-content");
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

    scaffoldClient.customiseAudioPlayer = function () {
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
                } else {
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

            if (minutes < 10) {
                minuteValue = "0" + minutes;
            } else {
                minuteValue = minutes;
            }

            if (seconds < 10) {
                secondValue = "0" + seconds;
            } else {
                secondValue = seconds;
            }

            return minuteValue + ":" + secondValue;
        }

        function createElement(tagName, classNames = [], text = "") {
            let element = document.createElement(tagName);
            if (text && text !== "") {
                element.appendChild(document.createTextNode(text));
            }
            classNames.forEach((className) => {
                element.classList.add(className)
            });
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

    scaffoldClient.setWeeklyMaterials = function () {

        const courseId = getCourseId();
        function console2(message) {
            let console = document.getElementById("console2");
            if (courseId.toString() === "3829777") {
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
                } catch (e) {
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
            let {title, html_url, type, icon = isSpecialType(type), completion_requirement} = moduleItemObj;
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
                let currentModuleID = scaffoldClient.courseData.currentModule.id;
                if (!currentModuleID) {//for mobile app
                    currentModuleID = getCurrentModuleID();
                }

                // console.log(`currentModuleID: ${currentModuleID}`);
                return scaffoldClient.courseData.modules.reduce((acc, module, index, array) => module.id && module.id === currentModuleID ? module.items : acc, []);
            } catch (e) {
                console.log(`error: ${e} || error.message: {${e.message} || error.stack: {${e.stack}}`);
            }
        }

        function getCurrentModuleID() {
            let currentModuleHelper = scaffoldClient.currentModuleHelper();
            let currentModule = currentModuleHelper.getCurrentModule();

            return currentModule.id;
        }


        console.log(`===========setWeeklyMaterials - END ============`);
    };


    scaffoldClient.setAnnouncementsButton = function () {
        console.log(`========Announcements button==========`)


        // Get the button
        // enable the button
        // double check btn link & insert only if not there

        // Make fetch query
        // if new in the list - add class

        init();

        function init() {
            let buttonContainers = document.querySelectorAll('.cbt-banner-announcements--container');
            buttonContainers.forEach((buttonContainer) => {
                setAnnouncements(buttonContainer)
            });
        }

        async function setAnnouncements(buttonContainer) {
            let state = {
                buttonContainer: buttonContainer,
                newAnnoucementsClasses: ["cbt-button-unread"],//Classes for btn style for new (unread) annoucements
                button: null,
                buttonInfo: {
                    container: {elementType: "DIV", classNames: "scaffold-media-box cbt-button"},
                    anchor: {
                        elementType: "A",
                        children: ["New Announcements"],
                        title: "Announcements",
                        link: `/courses/${scaffoldClient.getCourseID()}/announcements`
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
                let newAnnoucements = announcements ? hasNewAnnoucements(announcements) : false;

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
            let courseID = scaffoldClient.getCourseID();
            //let url = '/api/v1/announcements?context_codes[]=course_' + courseID;
            let url = `https://unity.instructure.com/api/v1/courses/${courseID}/discussion_topics?only_announcements=true`;

            let options = {
                method: 'GET',
                credentials: 'include',
                headers: {
                    "Accept": "application/json",
                    "X-CSRF-Token": getCsrfToken()
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
                children.forEach(child => {
                    element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
                });
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

    scaffoldClient.setCourseProgressBlock = function (item) {
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
            let modules = scaffoldClient.courseData.modules;

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

            if (item && item.title) {
                html += `<div class="cbt-progress-continue">
                    <div><p>Start <strong>${item.title}</strong></p></div>
                    <div class="scaffold-media-box cbt-button"><a title="${item.title}" href="${item && item.html_url ? item.html_url : '#'}">${progressBarWidth > 0 ? `Continue...` : `Start here`}</a></div>
                </div>`;
            } else {
                if (progressBarWidth == 100) {
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
        function createElement({elementType = "DIV", children, title, classNames, link}) {
            const element = document.createElement(elementType);

            if (children) {
                children.forEach(child => {
                    element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
                });
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

    scaffoldClient.getNavHTML = getNavHtml;

    scaffoldClient.snippetCopy = function () {
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
    scaffoldClient.currentModuleHelper = currentModuleHelper;

    return scaffoldClient;
}