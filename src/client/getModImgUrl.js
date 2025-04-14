export const getModImgUrl = async function (
    {
        fetchstatus,
        fetchjson,
        getCourseID,
        getOrigin,
        getCsrfToken,
    }, filename) {
    return new Promise(function (i, e) {
        fetch(origin + "/api/v1/courses/" + getCourseID() + "/files?per_page=10000&content_types[]=image&search_term=" + filename, {
            method: 'GET',
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "X-CSRF-Token": getCsrfToken()
            }
        })
            .then(fetchstatus)
            .then(fetchjson)
            .then(function (files) {
                var module_img_url = 'https://i.stack.imgur.com/y9DpT.jpg'; //default image
                for (let file of files) {
                    if (file.display_name === filename + ".png" || file.display_name === filename + ".jpg") {
                        module_img_url = getOrigin() + "/courses/" +
                            getCourseID() + "/files/" + file.id + "/preview";
                        //img_id = file.id
                    }
                }
                i(module_img_url);
            }).catch(function (error) {
            console.log('getModImgURL request failed' + error);
            e('https://i.stack.imgur.com/y9DpT.jpg');
        });
    })

    function console2(message) {
        let console = document.getElementById("console2");
        if (getCourseID() == "3829777") {
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