import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class ToastHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    /**
     * The method which returns Toast's target element.
     */
    getElement(): any;
    /**
     * The method which returns Toast's root element.
     */
    getToastElement(): any;
    /**
     * The method which returns Toast's message container element.
     */
    getMessageWrapper(): any;
    /**
     * The method which returns Toast's title container element.
     */
    getTitleElement(): any;
    /**
     * The method which returns Toast's content container element.
     */
    getContentElement(): any;
    /**
     * The method which returns Toast's progress-bar element.
     */
    getProgressElement(): any;
    /**
     * The method which returns Toast's action buttons wrapper element.
     */
    getButtonWrapper(): any;
    /**
     * The method which returns Toast's action buttons element.
     */
    getButtons(): any;
    /**
     * The method which returns Toast's Close action button element.
     */
    getCloseButton(): any;
    /**
     * The getModel method is used to return value of the property.
     * @param property - Specifies name of the property. It must be string type.
     */
    getModel(property: string): void;
    /**
     * The setModel method is used to set value for the property. It will accepts two arguments.
     * @param property - Specifices name of the property which value is to be updated.
     * @param value - Specifies corresponding value of the property.
     */
    setModel(property: string, value: any): void;
    /**
     * The invoke method is used to access the public methods available in Toast control.
     * @param fName - Specifies method name of the Toast control. It must be string type.
     * @param args - Specifies arguments. This is optional.
     */
    invoke(fName: string, args?: any[]): void;
}
