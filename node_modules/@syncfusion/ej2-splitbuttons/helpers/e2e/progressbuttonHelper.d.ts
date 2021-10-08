import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * E2E test helpers for ProgressButton to easily interact and the test the component
 */
export declare class ProgressButtonHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    /**
     * Initialize the ProgressButton E2E helpers
     * @param id Element id of the ProgressButton element
     * @param wrapperFn Pass the wrapper function
     * @return ProgressButton any
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Used to get the root element of the ProgressButton component.
     * @return Element
     */
    getElement(): any;
    /**
     * The setModel method is used to set values for the property. It will accepts two arguments.
     * @param property - Specifies the name of the property whose value has to be updated.
     * @param value - Specifies the corresponding value to the property.
     */
    setModel(property: any, value: any): any;
    /**
     * The getModel method is used to return value for the property.
     * @param property - Specifies the name of the property.
     */
    getModel(property: any): any;
    /**
     * The invoke method is used to access the public methods available in ProgressButton control.
     * @param fName - Specifies the method name of the ProgressButton control.
     * @param args - Specifies the arguments. This is optional.
     */
    invoke(fName: any, args?: any): any;
}
