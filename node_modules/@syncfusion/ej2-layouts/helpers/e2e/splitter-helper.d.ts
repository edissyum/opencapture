import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class SplitterHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    /**
     * The method which returns Splitter's root element.
     */
    getElement(): any;
    /**
     * The method which returns Splitter's all pane elements.
     */
    getPaneElement(): any;
    /**
     * The method which returns Splitter's separator (split-bar) elements.
     */
    getSplitBar(): any;
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
     * The invoke method is used to set value for the property. It will accepts two arguments.
     * @param property - Specifices name of the property which value is to be updated.
     * @param value - Specifies corresponding value of the property.
     */
    invoke(fName: string, args?: any[]): void;
}
