import {canvasModuleUtils, useCanvasModuleUtils} from "./canvasModuleUtils.js";

export const currentModuleHelper = function (modulesData) {
        return {
            getCurrentModule: function () {
                //console.log("getCurrentModule()");
                let modules = modulesData ? modulesData : scaffoldClient.courseData.modules;
                return modules.reduce((acc, module, arr, index) => {
                    let modItems = module.items;
                    let isCurrentModule = this.getCurrModuleItem(modItems);
                    if (!acc) {
                        if (isCurrentModule) {
                            return module;
                        }
                    } else {
                        return acc;
                    }
                    return false;
                }, 0);
            },
            getCurrModuleItem: function (modItems) {
                ////console.log(`modItems: "${modItems}"`);
                return modItems.reduce((acc, item, index, arr) => {
                    if (!acc) {
                        if (this.isCurrentPage(item)) {
                            return item;
                        }
                    } else {
                        return acc;
                    }
                    return false;
                }, false);
            },
            isCurrentPage: function (item) {
                let moduleUtils = useCanvasModuleUtils();
                const matches = moduleUtils.matchesModuleItem(item);
                return matches;
            }
        }
    };