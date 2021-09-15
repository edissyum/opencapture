import { Spreadsheet } from '../base/index';
/**
 *  Begin and complete events.
 *
 * @hidden
 */
export declare class ActionEvents {
    private parent;
    /**
     * Constructor for initializing action begin and action complete services.
     *
     * @param {Spreadsheet} parent - Specifies the spreadsheet element.
     */
    constructor(parent: Spreadsheet);
    private initializeActionBegin;
    private initializeActionComplete;
    private actionEventHandler;
    private actionBeginHandler;
    private actionCompleteHandler;
    private addEventListener;
    private removeEventListener;
}
