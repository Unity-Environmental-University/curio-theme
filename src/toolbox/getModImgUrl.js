import {getCourseId} from "../client/hooks/useDocInfo.js";
import {fetchStatus} from "../client/fetchStatus.js";
import {getCsrfToken} from "./getCsrfToken.js";
import {DEFAULT_HOME_TILE} from "../config.js";

const DEFAULT_IMG_URL = DEFAULT_HOME_TILE;


export const getModImgUrl = async function (filename, defaultImgUrl = DEFAULT_IMG_URL) {

    const origin = document.location.origin;
    const courseId = getCourseId();
    return new Promise(async function (i, e) {
        fetch(origin + "/api/v1/courses/" + courseId + "/files?per_page=10000&content_types[]=image&search_term=" + filename, {
            method: 'GET',
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "X-CSRF-Token": getCsrfToken()
            }
        })
            .then(fetchStatus)
            .then(res => res.json())
            .then(function (files) {
                var module_img_url = defaultImgUrl;
                for (let file of files) {
                    if (file.display_name === filename + ".png" || file.display_name === filename + ".jpg") {
                        module_img_url = origin + "/courses/" +
                            courseId + "/files/" + file.id + "/preview";
                        //img_id = file.id
                    }
                }
                i(module_img_url);
            }).catch(function (error) {
            console.log('getModImgURL request failed' + error);
            e(defaultImgUrl);
        });
    })

    function console2(message) {
        let console = document.getElementById("console2");
        if ( courseId == "3829777") {
            if (!console) {
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