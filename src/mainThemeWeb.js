import { createScaffoldBuilder } from "./builder/createScaffoldBuilder.js";
import { createScaffoldClient } from "./client/createScaffoldClient.js";

const ScaffoldClient = createScaffoldClient({}, jQuery);
const ScaffoldBuilder = createScaffoldBuilder({}, ScaffoldClient, jQuery);
// load base css

var loadstyles = [];

if (
  (document.location.pathname.toLowerCase().indexOf("/pages") >= 0 &&
    ENV.WIKI_RIGHTS !== undefined &&
    (ENV.WIKI_RIGHTS?.update || ENV.WIKI_RIGHTS?.create_page)) ||
  document.location.pathname.toLowerCase().indexOf("/syllabus") >= 0 ||
  ((document.location.pathname.toLowerCase().indexOf("/quizzes") >= 0 ||
    document.location.pathname.toLowerCase().indexOf("/assignments") >= 0 ||
    document.location.pathname.toLowerCase().indexOf("/discussion_topics") >= 0) &&
    (document.location.pathname.toLowerCase().indexOf("/edit") >= 0 ||
      document.location.pathname.toLowerCase().indexOf("/new") >= 0))
) {
  loadstyles.push("https://app.getscaffold.co/assets/css/scaffoldbuilder.css");
}

for (var i = 0; i < loadstyles.length; i++) {
  var fileref = document.createElement("link");
  fileref.setAttribute("rel", "stylesheet");
  fileref.setAttribute("type", "text/css");
  fileref.setAttribute("href", loadstyles[i]);
  document.getElementsByTagName("head")[0].appendChild(fileref);
}

// load in the client script
// document.addEventListener("scaffoldbuilderjscontrolsloaded", function () {

//if (window['ScaffoldBuilder'] !== undefined) {

const builderInit = async () => {
  console.log("builderinit");
  if (ScaffoldBuilder.checkInitOk()) {
    await ScaffoldBuilder.getActiveEditor();

    var config = ScaffoldBuilder.editor.tinymceInitOptions;
    // Load all provided css files into the editor
    var a = "";
    ($("link").each(function () {
      ($(this)
        .attr("href")
        .match(/(instructure-uploads).{1,}(.css)$/gi) ||
        $(this)
          .attr("href")
          .match(/(brandable_css).{1,}(common).{1,}(.css)$/gi) ||
        $(this)
          .attr("href")
          .match(/(08a990a64086e274a440029a740b78dd2ab2d6a51ccd0f00268a0e445e1ac45c).{1,}(.css)$/gi)) &&
        "stylesheet" == $(this).attr("rel") &&
        (a += $(this).attr("href") + ",");
    }),
      (a = a.slice(0, -1)),
      ScaffoldBuilder.editor.dom.loadCSS(a));

    // the theme could provide a custom CSS, which will be accessed via an external URL
    if (ScaffoldBuilder.options.editorcss !== undefined) {
      if (typeof ScaffoldBuilder.options.editorcss === "string")
        ScaffoldBuilder.options.editorcss = [ScaffoldBuilder.options.editorcss];

      ScaffoldBuilder.options.editorcss.forEach((a) => {
        if (
          a.match(/(08a990a64086e274a440029a740b78dd2ab2d6a51ccd0f00268a0e445e1ac45c).{1,}(.css)$/gi) &&
          a.toLowerCase().indexOf("editor.css") >= 0 &&
          !scaffoldBuilder.loadeditorcss
        )
          return;

        ScaffoldBuilder.editor.dom.loadCSS(a);
      });
    }
  }
};

//}
// });
document.addEventListener("DOMContentLoaded", async function () {
  //if (window['ScaffoldClient'] !== undefined) {
  console.log("clientinit");
  await builderInit();
  await ScaffoldClient.init({ scaffoldBuilder: ScaffoldBuilder });
  console.log("clientonload");
  ScaffoldClient.onPageLoad();

  //}
});
