/////////////////////////////////////////////
/////////// ELEVATEACTUAL CHANGES ///////////
/////////////////////////////////////////////
////////////// AS OF 2-20-2024 //////////////
/////////////////////////////////////////////
$(document).ready(function (classNames){

    //console.clear();

    console.log('ElevateActual custom javascript is running');

    let userID = ENV['current_user_id'];

    let el = document.getElementById('global_nav_help_link');
    if(el) {
        el.addEventListener('click', () => {
            console.log("Clicked");
            let tryAddButton;
            tryAddButton = () => {
                console.log("Done Waiting");
                let els = document.querySelectorAll('#nav-tray-portal [href^="https://unitycollege.tfaforms.net/"]');
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
}); // end doc ready

/////////////////////////////////////////////
///////// END ELEVATEACTUAL CHANGES /////////
/////////////////////////////////////////////
