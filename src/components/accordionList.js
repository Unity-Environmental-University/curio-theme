export const accordionList = () => {
    // Accordion
    function accordionToggle(event) {
        var code;
        if (event.type === "keypress") {
            code = event.charCode || event.keyCode;
        }
        if (event.type === "click" || code === 32 || code === 13) {
            var parent = event.currentTarget.parentNode;
            if (!parent.classList.contains('active')) {
                event.currentTarget.setAttribute('aria-expanded', 'true');
                event.currentTarget.setAttribute('aria-select', 'true');
                parent.classList.add('active');

                parent.querySelector('.cbt-accordion-content').classList.toggle('cbt-answer');

                parent.querySelector('.cbt-accordion-content').setAttribute('aria-hidden', 'false');
                //reload iframe when it open
                var iframes = parent.querySelectorAll('iframe');
                if (iframes.length > 0) {
                    for (var i = 0; i < iframes.length; i++) {
                        iframes[i].src = iframes[i].src;
                    }
                }
            } else {
                parent.querySelector('.cbt-accordion-content').classList.toggle('cbt-answer');
                parent.classList.remove('active');

                event.currentTarget.setAttribute('aria-expanded', 'false');
                event.currentTarget.setAttribute('aria-select', 'false');

            }
            accordionToggleIcon(event.currentTarget);
        }
    }


    const acc = document.querySelectorAll('.cbt-accordion-list .cbt-accordion-header');
    var i;
    for (i = 0; i < acc.length; i++) {
        var ctrl_name = 'cbt_panel_' + i + '_content';
        var label_name = 'cbt_panel_' + i;
        acc[i].tabIndex = "0";
        acc[i].role = "tab";
        acc[i].id = label_name;
        acc[i].setAttribute('aria-expanded', 'false');
        acc[i].setAttribute('aria-select', 'false');
        acc[i].setAttribute('aria-controls', ctrl_name);

        var parent = acc[i].parentNode;
        parent.role = "tablist"
        if (parent.querySelector('.cbt-accordion-content')) {
            parent.querySelector('.cbt-accordion-content').id = ctrl_name;
            parent.querySelector('.cbt-accordion-content').tabIndex = "0";
            parent.querySelector('.cbt-accordion-content').role = "tabpanel";
            parent.querySelector('.cbt-accordion-content').setAttribute('aria-hidden', 'true');
            parent.querySelector('.cbt-accordion-content').setAttribute('aria-labelledby', label_name);
        }
        loadAccordionIcon(acc[i]);
        acc[i].addEventListener("click", accordionToggle);
        acc[i].addEventListener("keypress", accordionToggle);
    }
    ;

    function loadAccordionIcon(headerElem) {
        if (!headerElem.querySelector('.cbt-accordion-close, .cbt-accordion-open')) {
            if (parent.querySelector('.cbt-accordion-content.cbt-answer')) {
                headerElem.innerHTML += '<i class="cbt-accordion-close"></i>';
            } else {
                headerElem.innerHTML += '<i class="cbt-accordion-open"></i>';
            }
        }
    }

    function accordionToggleIcon(headerElem) {
        headerElem.querySelector("i").classList.toggle("cbt-accordion-close");
        headerElem.querySelector("i").classList.toggle("cbt-accordion-open");
    }


};
