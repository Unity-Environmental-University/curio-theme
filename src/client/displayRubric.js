import {getDiscussionAsync} from "../toolbox/discussionUtils.js";
import {getCourseId, useDocInfo} from "./hooks/useDocInfo.js";
import {useCanvasModuleUtils} from "../toolbox/canvasModuleUtils.js";

export const displayRubric = async function () {

    const moduleUtils = useCanvasModuleUtils();
    let rubricBtns = document.querySelectorAll('.cbt-rubric-btn');
    const {
        courseId,
        origin
    } = useDocInfo();
    const {id, type} = moduleUtils.pageInfo.info;
    let cachedRubricUrl = undefined;
    const getRubricUrl = async (rubricBtn) =>
    {
        console.log()
        let rubricAnchorEl = rubricBtn.querySelector('a');
        let href = rubricAnchorEl.getAttribute('href');
        if(href && href !== '#') {
            cachedRubricUrl = href.endsWith("/rubric") ? href : `${href}/rubric`;
            return cachedRubricUrl;
        } //if it's actually set to something, just add the /rubric onto the end if necessary and boot it;
        console.log("Cached Url");
        if(cachedRubricUrl) return cachedRubricUrl;

        if(type === 'Assignment') {
            cachedRubricUrl = `${origin}/courses/${courseId}/assignments/${id}/rubric`;
        }

        if(type === 'Discussion') {
            const discussionData = await getDiscussionAsync(id, courseId);
            console.log(discussionData);
            cachedRubricUrl = `${origin}/courses/${courseId}/assignments/${discussionData.assignment_id}/rubric`;
        }

        return cachedRubricUrl ?? '#';
    }

    for (let rubricBtn of rubricBtns) {
        //if(rubricUrl && rubricUrl.href && /.*\/assignments\/\d+\/rubric$/.test(rubricUrl.href)){// remove rubrics
        let rubricText = rubricBtn?.querySelector('a')?.text ?? 'Show Rubric';
        const rubricUrl = await getRubricUrl(rubricBtn);
        if (rubricUrl && /.*\/assignments\/\d+(\/rubric)?\/?$/.test(rubricUrl)) {
            rubricBtn.innerHTML = `<button class="btn" data-rubric-link="${rubricUrl}">${rubricText}</button>`;
            rubricBtn.addEventListener("click", async (e) => {
                const rubricDiv = e.currentTarget;
                let rubricBtn = e.currentTarget.querySelector('button');
                let rubricContent = rubricDiv.querySelector('.cbt-rubric-content');
                if (rubricDiv && !rubricContent) {
                    console.log(rubricDiv);
                    let rubricUrl = rubricBtn.getAttribute("data-rubric-link");
                    try {
                        let xhr = new XMLHttpRequest();
                        xhr.onload = function () {
                            var rubricDoc = new DOMParser().parseFromString(this.response, "text/html");
                            console.log(rubricDoc.getElementById('rubrics'));
                            rubricDiv.innerHTML += '<div class="cbt-rubric-content" style="display:block" aria-hidden="false"><button><span class="ui-icon ui-icon-closethick">Close</span></button>' + rubricDoc.getElementById('rubrics').innerHTML + '</div>';
                            rubricDiv.querySelector(".cbt-rubric-content > button").addEventListener("click", (e) => {
                                e.currentTarget.parentNode.style.display = "none";
                            })
                        };
                        xhr.open('GET', rubricUrl, true);
                        xhr.send();
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    if (e.target.getAttribute("data-rubric-link")) {
                        if (rubricContent.style.display === "block") {
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