

let _courseId = undefined;


export const useDocInfo = function() {
    const courseId = getCourseId();

    return {
        courseId,
        origin: document.location.origin,
    }
}


export const getCourseId = function () {
    if (_courseId === undefined) {
        if (window?.ENV?.COURSE_ID) {
            _courseId = window.ENV.COURSE_ID;
        } else {
            if (document?.getElementById('cbt-courseid')) {
                _courseId = document.getElementById('cbt-courseid').getAttribute('data-course-id');
            } else if (document?.getElementById('cbt-progress')) {
                _courseId = document.getElementById('cbt-progress').getAttribute('data-course-id');
            } else if (window.location.pathname.match(/(courses)\/[0-9]{1,}/gi)) {
                var id = window.location.pathname.match(/(courses)\/[0-9]{1,}/gi)[0].split("courses/");
                _courseId = id[id.length - 1];
            }
        }
    }
    return _courseId;
};
