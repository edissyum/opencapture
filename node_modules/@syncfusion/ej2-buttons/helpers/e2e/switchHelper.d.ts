import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * E2E test helpers for Switch to easily interact and the test the component
*/
export declare class SwitchHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    /**
     * Initialize the Switch E2E helpers
     * @param id Element id of the Switch element
     * @param wrapperFn Pass the wrapper function
     * @return Switch any
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Used to get the root element of the Switch component.
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
     * The invoke method is used to access the public methods available in Switch control.
     * @param fName - Specifies the method name of the Switch control.
     * @param args - Specifies the arguments. This is optional.
     */
    invoke(fName: any, args?: any): any;
}
