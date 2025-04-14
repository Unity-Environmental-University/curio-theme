export const displayRubric = function () {
    let rubricBtns = document.querySelectorAll('.cbt-rubric-btn');

    for (let rubricBtn of rubricBtns) {
        let rubricUrl = rubricBtn.querySelector('a');
        //if(rubricUrl && rubricUrl.href && /.*\/assignments\/\d+\/rubric$/.test(rubricUrl.href)){// remove rubrics
        let rubricText = rubricUrl.text ? rubricUrl.text : 'Show Rubric';
        if (rubricUrl && rubricUrl.href && /.*\/assignments\/\d+(\/rubric)?\/?$/.test(rubricUrl.href)) {
            rubricBtn.innerHTML = `<button class="btn" data-rubric-link="${rubricUrl.href}">${rubricText}</button>`;
            rubricBtn.addEventListener("click", (e) => {
                const rubricDiv = e.currentTarget;
                let rubricBtn = e.currentTarget.querySelector('button');
                let rubricContent = rubricDiv.querySelector('.cbt-rubric-content');
                if (rubricDiv && !rubricContent) {
                    console.log(rubricDiv);
                    let rubricUrl = rubricBtn.getAttribute("data-rubric-link");
                    rubricUrl = rubricUrl.endsWith("/rubric") ? rubricUrl : `${rubricUrl}/rubric`;//add rubric url "" /rubric, then add
                    console.log(`rubricUrl: "${rubricUrl}"`)
                    try {
                        var xhr = new XMLHttpRequest();
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
                        if (rubricContent.style.display == "block") {
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