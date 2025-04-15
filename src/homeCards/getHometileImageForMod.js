import {getModImgUrl} from "../toolbox/getModImgUrl.js";

export async function getHometileImageForMod(module) {
    try {
        return await getModImgUrl("hometile" + module.position);
    } catch (e) {
        console.log("Cannot find the image" + e + "; stack: " + e.stack);
        return 'https://i.stack.imgur.com/y9DpT.jpg';
    }
}