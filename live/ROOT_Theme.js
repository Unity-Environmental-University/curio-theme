/////////////////////////////////////////////
/////////// ELEVATEACTUAL CHANGES ///////////
/////////////////////////////////////////////
////////////// AS OF 2-20-2024 //////////////
/////////////////////////////////////////////

function fixLinksInNodes(parentNode, userID) {
    let els = parentNode.querySelectorAll('[href^="https://unitycollege.tfaforms.net/"]')
    if (els && els.length > 0) {
        for (let el of els) {
            if (el.href.includes(userID)) continue;
            el.href += userID;
        }
    }

}

$(document).ready(function (classNames){
    console.log('ElevateActual custom javascript is running');
    let userID = ENV['current_user_id'];
    fixLinksInNodes(document, userID);
    let el = document.getElementById('global_nav_help_link');
    if(el) {
        el.addEventListener('click', () => {
            let tryAddButton;
            tryAddButton = () => {
                let els = document.querySelectorAll('#nav-tray-portal [href*="tfaforms.net/"]');
                if (els && els.length > 0) {
                    for (let el of els) {
                        if (el.href.includes(userID)) continue;
                        el.href += userID;
                        console.log(el.href);
                    }
                } else {
                    setTimeout(tryAddButton, 200);
                }
            }
            tryAddButton();
        })
    }

    let observer = new MutationObserver((mutations)=>{
        for (let mutation of mutations) {
            fixLinksInNodes(mutation.target, userID);
        }
    });

    observer.observe(document.querySelector('body'), {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: true,
    });

}); // end doc ready

/////////////////////////////////////////////
///////// END ELEVATEACTUAL CHANGES /////////
/////////////////////////////////////////////
