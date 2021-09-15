import { TreeGrid } from '../base/treegrid';
import { Logger as GridLogger, IGrid, CheckOptions } from '@syncfusion/ej2-grids';
export interface TreeItemDetails {
    type: string;
    logType: string;
    message?: string;
    check: (args: Object, parent: TreeGrid) => CheckOptions;
    generateMessage: (args: Object, parent: TreeGrid, checkOptions?: Object) => string;
}
export declare class Logger extends GridLogger {
    private treeGridObj;
    constructor(parent: IGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Returns Logger module name
     */
    getModuleName(): string;
    log(types: string | string[], args: Object): void;
    treeLog(types: string | string[], args: Object, treeGrid: TreeGrid): void;
}
export declare const treeGridDetails: {
    [key: string]: TreeItemDetails;
};
