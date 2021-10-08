import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * E2E test helpers for Button to easily interact and the test the component
 */
export declare class listboxHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    /**
     * Initialize the Button E2E helpers
     * @param id Element id of the Button element
     * @param wrapperFn Pass the wrapper function
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Used to get root element of the Button component
     */
    getElement(): any;
    selectElement(element_id: string): void;
    setModel(property: any, value: any): any;
    getModel(property: any): any;
    invoke(fName: any, args?: any): any;
}
