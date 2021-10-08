import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class DashboardHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    /**
     * Initialize the Dashboard Layout E2E helpers.
     * @param id element id of the Dashboard Layout component.
     * @param wrapperFn pass the wrapper function.
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Gets the selector of the Dashboard Layout component.
     */
    selector(arg: any): any;
    /**
     * Gets root element of the Dashboard Layout component.
     */
    getElement(): any;
    /**
     * Gets the element of the Dashboard Layout component.
     */
    getDashboardLayout(): any;
    /**
     * Gets a panel container and its inner elements with the given id from dashboard layout component.
     */
    getPanelContainer(): any;
    /**
     * Gets the panel element of Dashboard Layout component which consists the panel container and its inner elements
     */
    getPanelElement(): any;
    /**
     * Used to get the panel header of Dashboard Layout component which contains the header details.
     */
    getPanelHeader(): any;
    /**
     * Gets the panel content of Dashboard Layout component which contains the panel content class.
     */
    getPanelContent(): any;
    /**
     * Gets the resize icon positioned on the South-East side in panel container.
     */
    getSouthEastResizeIcon(): any;
    /**
     * Gets the resize icon positioned on the North-East side in panel container.
     */
    getNorthEastResizeIcon(): any;
    /**
     * Gets the resize icon positioned on the North-West side in panel container.
     */
    getNorthWestResizeIcon(): any;
    /**
     * Gets the resize icon positioned on the South-West side in panel container.
     */
    getSouthWestResizeIcon(): any;
    /**
     * Gets the clear icon from the panel element.
     */
    getClearIcon(): any;
    /**
     * Gets the transition of panel in Dashboard Layout component which is used to achieve the resizing behavior.
     */
    getPanelTansition(): any;
}
