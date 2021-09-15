import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class RichTextEditorHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    /**
     * The method which returns RichTextEditor's root element.
     */
    getElement(): any;
    /**
     * The method which returns RichTextEditor's Quick Toolbar element.
     */
    getQuickToolbarElement(): any;
    /**
     * The method which returns RichTextEditor's toolbar element.
     */
    getToolbar(): any;
    /**
     * The method which returns RichTextEditor's character count element.
     */
    getCharCount(): any;
    /**
     * The method which returns insert table popup element.
     */
    getTableDialog(): any;
    /**
     * The method which returns insert image popup element.
     */
    getImageDialog(): any;
    /**
     * The method which returns insert link popup element.
     */
    getLinkDialog(): any;
    /**
     * The method which returns font name tool popup element.
     */
    getFontNamePopup(): any;
    /**
     * The method which returns font size tool popup element.
     */
    getFontSizePopup(): any;
    /**
     * The method which returns font color picker popup element.
     */
    getFontColorPopup(): any;
    /**
     * The method which returns background color picker popup element.
     */
    getBackgroundColorPopup(): any;
    /**
     * The method which returns Format tools popup element.
     */
    getFormatPopup(): any;
    /**
     * The method which returns alignment tool popup element.
     */
    getAlignmentPopup(): any;
    /**
     * The getContent method which returns the edit panel element.
     */
    getContent(): any;
    /**
     * The getModel method is used to return value for a property.
     * @param property - Specifies name of the property. It must be string type.
     */
    getModel(property: string): void;
    /**
     * The setModel method is used to set value for the property. It will accepts two arguments.
     * @param property - Specifices name of the property which value is to be updated.
     * @param value - Specifies corresponding value to the property.
     */
    setModel(property: string, value: any): void;
    /**
     * The invoke method is used to access the public methods available in RichTextEditor control.
     * @param fName - Specifies method name of the RichTextEditor control. It must be string type.
     * @param args - Specifies arguments. This is optional.
     */
    invoke(fName: string, args?: any[]): void;
}
