import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * E2E test helpers for Colorpicker to easily interact and the test the component
 */
export declare class ColorpickerHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    /**
     * Initialize the Colorpicker E2E helpers
     * @param id Element id of the Colorpicker element
     * @param wrapperFn Pass the wrapper function
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Used to get root element of the Colorpicker component
     */
    getElement(): any;
    getSplitButtonElement(): any;
    getSplitButtonPopupElement(): any;
    setModel(property: any, value: any): any;
    getModel(property: any): any;
    invoke(fName: any, args?: any): any;
}
