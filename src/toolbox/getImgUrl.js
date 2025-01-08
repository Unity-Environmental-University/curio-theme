export async function getImgUrl(scaffoldClient, module) {
    try {
        return await scaffoldClient.getModImgURL("hometile" + module.position);
    } catch (e) {
        console.log("Cannot find the image" + e + "; stack: " + e.stack);
        return 'https://i.stack.imgur.com/y9DpT.jpg';
    }
}