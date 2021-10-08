import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class TreeGridHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    getDataGridElement(): any;
    getHeaderElement(): any;
    getContentElement(): any;
    getFooterElement(): any;
    getPagerElement(): any;
    getDialogElement(): any;
    getFilterPopupElement(): any;
    getToolbarElement(): any;
    getCurrentPagerElement(): any;
    getPagerDropDownElement(): any;
    getExpandedElements(): any;
    getCollapsedElements(): any;
    setModel(property: any, value: any): any;
    getModel(property: any): any;
    invoke(fName: any, args?: any): any;
}
