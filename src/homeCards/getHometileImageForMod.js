import {getModImgUrl} from "../toolbox/getModImgUrl.js";
import {DEFAULT_HOME_TILE} from "../config.js";

export async function getHometileImageForMod(module, defaultImgUrl = DEFAULT_HOME_TILE) {
    try {
        return await getModImgUrl("hometile" + module.position, defaultImgUrl);
    } catch (e) {
        console.log("Cannot find the image" + e + "; stack: " + e.stack);
        return defaultImgUrl;
    }
}