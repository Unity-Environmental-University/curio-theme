import {DiscussionNotice} from "../components/DiscussionNotice.js";

/**
 * @type {import('../client/types.js').IDiscussionUtilsScaffoldClientView}
 * @type {import('../client/types.d.ts').IDiscussionData}
 **/
const _discussionCache = {};
const _discussionsByAssignmentId = {};

export const getDiscussionAsync = async (discussionId, courseId, noCached = false) => {

    if (_discussionCache[discussionId] && !noCached) return _discussionCache[discussionId];
    try {

        const response = await fetch(`/api/v1/courses/${courseId}/discussion_topics/${discussionId}`);
        /**
         * @type {IDiscussionData}
         */

        const data = await response.json();
        _discussionCache[discussionId] = data;
        if (data.assignment_id) _discussionsByAssignmentId[data.assignment_id] = data;

        return data;

    } catch (e) {
        console.error(e);
        return null;
    }
}


export const setupDiscussionNoticeAsync = async (id, courseId) => {
    let data = await getDiscussionAsync(id,  courseId);
    if (!data?.require_initial_post) return;

    let banner = document.querySelector('.scaffold-media-box.cbt-banner.cbt-image-banner');
    if (banner) {
        const boilerplate = document.createElement('div');
        banner.after(boilerplate);
        boilerplate.outerHTML = DiscussionNotice();
    }

}