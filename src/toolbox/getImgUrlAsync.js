export async function getImgUrlAsync(getModImgUrl, module) {
    try {
        return await getModImgUrl("hometile" + module.position);
    } catch (e) {
        console.log("Cannot find the image" + e + "; stack: " + e.stack);
        return 'https://i.stack.imgur.com/y9DpT.jpg';
    }
}