import {createScaffoldClientMobile} from "./client/createScaffoldClientMobile.js";

const ScaffoldClient = createScaffoldClientMobile(ScaffoldClient || {});
// load base css

var loadstyles = [];
// var style = 'https://app.getscaffold.co/deploy/08a990a64086e274a440029a740b78dd2ab2d6a51ccd0f00268a0e445e1ac45c/mobile.css';
// loadstyles.push(style);
for (var i = 0; i < loadstyles.length; i++) {
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", loadstyles[i]);
    document.getElementsByTagName("head")[0].appendChild(fileref);
}

// document.addEventListener("scaffoldclientjscontrolsloaded", function () {
//if (window['ScaffoldClient'] !== undefined) {
    ScaffoldClient.init();
//}
// });

window.addEventListener('load', function () {
//    if (window['ScaffoldClient'] !== undefined) {
        ScaffoldClient.onPageLoad();
//    }
});

// var path = 'https://app.getscaffold.co/deploy/08a990a64086e274a440029a740b78dd2ab2d6a51ccd0f00268a0e445e1ac45c/mobile.js';
// (function () { var script = document.createElement('script'); script.src=path,script.async=!0,script.charset="UTF-8",script.onload=function(){fireEvent("scaffoldclientjscontrolsloaded")};var firstScript=document.getElementsByTagName("script")[0];function fireEvent(e){var t;document.createEventObject||document.createEvent?(document.createEvent?(t=document.createEvent("HTMLEvents")).initEvent(e,!0,!0):document.createEventObject&&((t=document.createEventObject()).eventType=e),t.eventName=e):t=new CustomEvent(e,{bubbles:!0,cancelable:!0}),document.dispatchEvent(t)}firstScript.parentNode.insertBefore(script,firstScript); })();
