import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * E2E test helpers for Spreadsheet to easily interact and the test the component.
 */
export declare class SpreadsheetHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    /**
     * Initialize the Spreadsheet E2E helpers
     * @param id Element id of the Spreadsheet element
     * @param wrapperFn Pass the wrapper function
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Used to get root element of the Spreadsheet component
     */
    getElement(): any;
    setModel(property: any, value: any): any;
    getModel(property: any): any;
    invoke(fName: any, args?: any): any;
}
