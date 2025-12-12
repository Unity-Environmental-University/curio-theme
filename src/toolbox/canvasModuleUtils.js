
export function useCanvasModuleUtils() {
    const moduleUtils = canvasModuleUtils();
    moduleUtils.setUrl(window.location.href);
    return moduleUtils;
}


export function canvasModuleUtils() {

    const urlTypes = ['Module Item', 'Page', 'Assignment', 'Quiz', 'Discussion', 'ExternalTool', 'File'];
    const pageInfo = {}

    return {
        pageInfo,
        urlTypes,
        parseUrl: function (url) {
            const urlSegments = url.split('/');

            if (url.includes('module_item_id=')) {
                const pageUrl = url.split("module_item_id=")[1];
                return {type: 'Module Item', id: pageUrl};
            } else if (url.includes('/pages/')) {
                const pageUrlIndex = urlSegments.indexOf('pages') + 1;
                const pageUrl = urlSegments[pageUrlIndex];
                return {type: 'Page', id: pageUrl};
            } else if (url.includes('/assignments/')) {
                const assignmentIdIndex = urlSegments.indexOf('assignments') + 1;
                const assignmentId = urlSegments[assignmentIdIndex];
                return {type: 'Assignment', id: assignmentId};
            } else if (url.includes('/quizzes/')) {
                const quizIdIndex = urlSegments.indexOf('quizzes') + 1;
                const quizId = urlSegments[quizIdIndex];
                return {type: 'Quiz', id: quizId};
            } else if (url.includes('/discussion_topics/')) {
                const discussionIdIndex = urlSegments.indexOf('discussion_topics') + 1;
                const discussionId = urlSegments[discussionIdIndex];
                return {type: 'Discussion', id: discussionId};
            } else if (url.includes('/external_tools/')) {
                const toolIdIndex = urlSegments.indexOf('external_tools') + 1;
                const toolId = urlSegments[toolIdIndex];
                return {type: 'ExternalTool', id: toolId};
            } else if (url.includes('/files/')) {
                const fileIdIndex = urlSegments.indexOf('files') + 1;
                const fileId = urlSegments[fileIdIndex];
                return {type: 'File', id: fileId};
            } else if (url.includes('/modules/') && url.includes('#')) {
                const moduleItemIdIndex = urlSegments.indexOf('modules') + 1;
                const moduleItemId = urlSegments[moduleItemIdIndex].split("#")[1];
                return {type: 'Module Item', id: moduleItemId};
            } else if (url.includes('/modules/') && url.includes('/items/')) {
                const moduleItemIdIndex = urlSegments.indexOf('items') + 1;
                const moduleItemId = urlSegments[moduleItemIdIndex];
                //console.log(`moduleItemId ${moduleItemId}`);
                return {type: 'Module Item', id: moduleItemId};
            } else if (url.includes('/assignment_groups/')) {
                // const assignmentGroupIdIndex = urlSegments.indexOf('assignment_groups') + 1;
                // const assignmentGroupId = urlSegments[assignmentGroupIdIndex];
                // return { type: 'Assignment Group', id: assignmentGroupId };
            } else {
                return {type: 'Unknown', id: null};
            }
        },
        setUrl: function (url) {
            this.pageInfo.info = filterIDString(this.parseUrl(url))

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
            let info = pageInfo.info;
            if (!moduleItem || !info) {
                console.log(`error not match`)
                return false;
            }

            ////console.log(`wassa: ${info.type}`)
            // 'File', 'Page', 'Discussion',
            // 'Assignment', 'Quiz', 'SubHeader', 'ExternalUrl', 'ExternalTool'
            if (urlTypes.some((item) => item === moduleItem.type)) {
                if (info.type === 'Module Item') {
                    return moduleItem.id == info.id
                }
                if (info.type === 'Page') {
                    return moduleItem.page_url == info.id
                }
                return moduleItem.content_id == info.id
            }

            return false;
        }
    }
}
