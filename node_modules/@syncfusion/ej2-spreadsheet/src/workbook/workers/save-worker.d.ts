import { Workbook } from '../base';
import { pdfLayoutSettings, SaveOptions } from '../common/index';
/**
 * @hidden
 * The `SaveWorker` module is used to perform save functionality with Web Worker.
 */
export declare class SaveWorker {
    protected parent: Workbook;
    /**
     * Constructor for SaveWorker module in Workbook library.
     *
     * @private
     * @param {Workbook} parent - Specifies the workbook.
     */
    constructor(parent: Workbook);
    /**
     * Process sheet.
     *
     * @param {string} sheet - specify the sheet
     * @param {number} sheetIndex - specify the sheetIndex
     * @returns {Object} - Process sheet.
     * @hidden
     */
    protected processSheet(sheet: string, sheetIndex: number): Object;
    /**
     * Process save action.
     *
     * @param {Object} saveJSON - specify the object
     * @param {SaveOptions | Object} saveSettings - specify the saveSettings
     * @param {Object} customParams - specify the customParams
     * @param {Object} pdfLayoutSettings - specify the pdfLayoutSettings
     * @returns {void} - Process save action.
     * @hidden
     */
    protected processSave(saveJSON: Object, saveSettings: SaveOptions | {
        [key: string]: string;
    }, customParams: Object, pdfLayoutSettings: pdfLayoutSettings): void;
}
