import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * E2E test helpers for DropDownButton to easily interact and the test the component
 */
export declare class DropDownButtonHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    /**
     * Initialize the DropDownButton E2E helpers
     * @param id Element id of the DropDownButton element
     * @param wrapperFn Pass the wrapper function
     * @return DropDownButton any
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Used to get the root element of the DropDownButton component.
     * @return Element
     */
    getElement(): any;
    /**
     * Used to get the popup element of the DropDownButton component.
     * @return Element
     */
    getPopupElement(): any;
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
     * The invoke method is used to access the public methods available in DropDownButton control.
     * @param fName - Specifies the method name of the DropDownButton control.
     * @param args - Specifies the arguments. This is optional.
     */
    invoke(fName: any, args?: any): any;
}
