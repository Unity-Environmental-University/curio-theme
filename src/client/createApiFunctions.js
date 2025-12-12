import {getNavHtml} from "../toolbox/getNavHtml.js";
import {getHomeCardsAsync} from "../homeCards/getHomeCardsAsync.js";

export const createApiFunctions = function (scaffoldClient) {
    console.log("bottleneck is setup -  starting API calls");
    const {
        options,
        courseData,
        displayRubric,
        setWeeklyMaterials,
        initMarkableDiscussion,
        getModItemsProgress,
        getContinueItem,
        setCourseProgressBlock,
        getTopicOverview,
        getUserName,
        preloadPromises,
        snippetCopy,
        setPageAsAgreement,
        findNavItems,
        customiseAudioPlayer,
        setAnnouncementsButton,
        getCarousels,
    } = scaffoldClient;

    Promise.all(preloadPromises).then(async function (key) {
        try{
            snippetCopy();

            // if (document.querySelector('.cbt--set-template')) {
            //     scaffoldClient.setTemplateDocumentation();
            // }

            if (document.querySelector('.cbt-page-as-agreement')) {
                setPageAsAgreement();
            }

            if (document.querySelector('.module-sequence-footer')) {
                findNavItems().then(function (navItem) {
                    let navHTML = getNavHtml(navItem);
                    if ($(".module-sequence-footer").length > 0) {
                        //$(".module-sequence-footer").parent().append(navHTML);
                        //$(".module-sequence-footer").hide();
                    }
                });
            }

            if (document.querySelector('.cbt-audio')) {
                customiseAudioPlayer();
            }

            if (document.querySelector('.cbt-banner-announcements--container')) {
                setAnnouncementsButton();
            }

            if (document.querySelector(".cbt-carousel")) {
                getCarousels();
            }

            courseData.modules = await getModItemsProgress(courseData.markableDiscussions);
            if (document.getElementById('cbt-learner')) {
                getUserName().then(function (user) {
                    if (user) {
                        if (user.hasOwnProperty("first_name")) {
                            document.getElementById("cbt-learner").innerHTML = 'Welcome ' + user.first_name + ',';
                        } else if (user.hasOwnProperty("short_name")) {
                            document.getElementById("cbt-learner").innerHTML = 'Welcome ' + user.short_name + ',';
                        } else {
                            document.getElementById("cbt-learner").innerHTML = 'Welcome,';
                        }
                    } else {
                        document.getElementById("cbt-learner").innerHTML = 'Welcome,';
                    }
                });
            }
            if (document.querySelector('.cbt-rubric-btn')) {
                displayRubric()
            }

            // all progress items should consider discussions
            if (document.querySelector(".cbt-home-cards")) {
                if (!options.scaffoldBuilder) throw new Error("Scaffold builder unset");
                await getHomeCardsAsync(scaffoldClient, courseData.modules);
            }

            if (document.querySelector(".cbt-course-progress")) {
                getContinueItem().then(function (item) {
                    setCourseProgressBlock(item);
                });
            }

            if (document.querySelector('.cbt-topic-overview')) {
                getTopicOverview();
            }

            if (courseData.currentItem && courseData.currentItem.hasOwnProperty('type') && courseData.currentItem.type === 'Discussion') {
                initMarkableDiscussion();
                //I don't know why this is here but it's likely outdated and eating Introduction headers.
                // if (document.querySelector('#cbt-banner-header') && document.querySelector('.discussion-redesign-layout h2')) {
                //     document.querySelector('.discussion-redesign-layout h2').remove();
                // }
            }

            if (document.querySelector('.cbt-weekly-materials')) {
                setWeeklyMaterials();
            }
        }
        catch(err){
            console.error("ERROR IN THE PROMISES", err)
        }

    })
}