export function getModUrl(scaffoldClient, module, firstItem) {
    const {state} = module;
    if (state === 'locked' || !firstItem) return '#';

    if (firstItem.hasOwnProperty("html_url")) {
        if (firstItem.type === "ExternalTool") return firstItem.html_url;
        if (firstItem.type === "ExternalUrl") {
            return scaffoldClient.getOrigin() + firstItem.html_url.split("/api/v1")[1].replace('module_item_redirect', 'modules/items');
        }
    }

    if (firstItem.hasOwnProperty("url")) {
        return scaffoldClient.getOrigin() + firstItem.url.split("/api/v1")[1] + "?module_item_id=" + firstItem.id;
    }
    return '#';
}