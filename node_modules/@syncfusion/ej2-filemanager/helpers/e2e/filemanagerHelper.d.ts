import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * E2E test helpers for FileManager to easily interact and the test the component
 */
export declare class FileManagerHelpers extends TestHelper {
    id: string;
    wrapperFn: Function;
    /**
     * Initialize the FileManager E2E helpers
     * @param id Element id of the FileManager element
     * @param wrapperFn Pass the wrapper function
     */
    constructor(id: string, wrapperFn: Function);
    selector(arg: any): any;
    /**
     * Returns the root element of the FileManager component.
     */
    getElement(): any;
    /**
     * Returns the toolbar items from the FileManager component.
     */
    getToolbarItems(): any;
    /**
     * Returns the active toolbar item element from the FileManager component.
     */
    getToolbarItemsActive(): any;
    getTreeviewItems(): any;
    /**
     * Returns the collapsed treeview node element from the FileManager component.
     */
    getTreeviewCollapsedItems(): any;
    /**
     * Returns the collapsed icon of treeview node element from the FileManager component.
     */
    getTreeviewCollapsedIcon(): any;
    /**
     * Returns the expanded icon of treeview node element from the FileManager component.
     */
    getTreeviewExpandedIcon(): any;
    /**
     * Returns the active treeview node element from the FileManager component.
     */
    getTreeviewActiveItems(): any;
    /**
     * Returns the treeview items folder icon from the FileManager component.
     */
    getTreeviewItemsFolderIcon(): any;
    /**
     * Returns the treeview items text from the FileManager component.
     */
    getTreeviewItemsText(): any;
    /**
     * Returns the largeIcon element from the FileManager component.
     */
    getlargeIconsItems(): any;
    /**
     * Returns the active list element in largeIcon view from the FileManager component.
     */
    getlargeIconsActiveItems(): any;
    /**
     * Returns the checked element in largeIcon view from the FileManager component.
     */
    getlargeIconsCheckedItems(): any;
    /**
     * Returns the grid element from the FileManager component.
     */
    getGridElement(): any;
    /**
     * Returns the active element in grid view from the FileManager component.
     */
    getGridActiveElements(): any;
    /**
     * Returns the checked element in grid view from the FileManager component.
     */
    getGridCheckedElements(): any;
    /**
     * Returns the dialog element from the FileManager component.
     */
    getDialogElement(): any;
    /**
     * Returns the breadcrumbBar element from the FileManager component.
     */
    getBreadCrumbBarElement(): any;
    /**
     * Returns the splitter element from the FileManager component.
     */
    getSplitterElement(): any;
    /**
     * Returns the contextmenu element from the FileManager component.
     */
    getContextMenuElement(): any;
    /**
     * Returns the sortby popup element from the FileManager component.
     */
    getSortByPopupElement(): any;
    setModel(property: any, value: any): any;
    getModel(property: any): any;
    invoke(fName: any, args?: any): any;
}
