/**
 *
 * `Logger` class
 */
import { IGrid } from '../base/interface';
export interface ILogger {
    log: (type: string | string[], args: Object) => void;
}
export interface CheckOptions {
    success: boolean;
    options?: Object;
}
export interface ItemDetails {
    type: string;
    logType: string;
    message?: string;
    check: (args: Object, parent: IGrid) => CheckOptions;
    generateMessage: (args: Object, parent: IGrid, checkOptions?: Object) => string;
}
export declare class Logger implements ILogger {
    parent: IGrid;
    constructor(parent: IGrid);
    getModuleName(): string;
    log(types: string | string[], args: Object): void;
    patchadaptor(): void;
    destroy(): void;
}
export declare const detailLists: {
    [key: string]: ItemDetails;
};
