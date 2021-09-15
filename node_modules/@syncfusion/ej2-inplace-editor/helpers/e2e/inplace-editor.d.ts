import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class InPlaceEditorHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    /**
     * The method which returns In-place Editor's root element.
     */
    getElement(): any;
    /**
     * The method which returns In-place Editor's editable element.
     */
    getValueElement(): any;
    /**
     * The method which returns In-place Editor's edit icons's element.
     */
    getEditIconElement(): any;
    /**
     * The method which returns In-place Editor's popup element.
     */
    getPopupElement(): any;
    /**
     * The method which returns In-place Editor's loading element, during editing.
     * @param mode - It specifies the rendering mode. Type of this parameter is string.
     */
    getLoadingElement(mode: string): any;
    /**
     * The method which returns In-place Editor's error element, on updating new value.
     * @param mode - It specifies the rendering mode. Type of this parameter is string.
     */
    getErrorElement(mode: string): any;
    /**
     * The method which returns In-place Editor's form element.
     * @param mode - It specifies the rendering mode. Type of this parameter is string.
     */
    getFormElement(mode: string): any;
    /**
     * The method which returns In-place Editor's action buttons container.
     * @param mode - It specifies the rendering mode. Type of this parameter is string.
     */
    getButtonsWrapper(mode: string): any;
    /**
     * The method which returns In-place Editor's save action button container element.
     * @param mode - It specifies the rendering mode. Type of this parameter is string.
     */
    getSaveButton(mode: string): any;
    /**
     * The method which returns In-place Editor's cancel action buttons container element.
     * @param mode - It specifies the rendering mode. Type of this parameter is string.
     */
    getCancelButton(mode: string): any;
    /**
     * The method which returns In-place Editor's root container element.
     * @param mode - It specifies the rendering mode. Type of this parameter is string.
     */
    getComponentWrapper(mode: string): any;
    /**
     * The method which returns In-place Editor's editable element.
     * @param mode - It specifies the rendering mode. Type of this parameter is string.
     */
    getComponentElement(mode: string): any;
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
     * The invoke method is used to access the public methods available in In-place Editor control.
     * @param fName - Specifies method name of the In-place Editor control. It must be string type.
     * @param args - Specifies arguments. This is optional.
     */
    invoke(fName: string, args?: any[]): void;
}
