import { IFileManager, ReadArgs, SearchArgs } from '../base/interface';
import { Draggable } from '@syncfusion/ej2-base';
import { DragEventArgs } from '@syncfusion/ej2-base';
import { MenuEventArgs } from '@syncfusion/ej2-navigations';
/**
 * Utility file for common actions
 *
 * @param {HTMLLIElement} node - specifies the node.
 * @param {Object} data - specifies the data.
 * @param {IFileManager} instance - specifies the control instance.
 * @returns {void}
 * @private
 */
export declare function updatePath(node: HTMLLIElement, data: Object, instance: IFileManager): void;
/**
 * Functions for get path in FileManager
 *
 * @param {Element | Node} element - specifies the element.
 * @param {string} text - specifies the text.
 * @param {boolean} hasId - specifies the id.
 * @returns {string} returns the path.
 * @private
 */
export declare function getPath(element: Element | Node, text: string, hasId: boolean): string;
/**
 * Functions for get path id in FileManager
 *
 * @param {Element} node - specifies the node element.
 * @returns {string[]} returns the path ids.
 * @private
 */
export declare function getPathId(node: Element): string[];
/**
 * Functions for get path names in FileManager
 *
 * @param {Element} element - specifies the node element.
 * @param {string} text - specifies the text.
 * @returns {string[]} returns the path names.
 * @private
 */
export declare function getPathNames(element: Element, text: string): string[];
/**
 * Functions for get path id in FileManager
 *
 * @param {Element} element - specifies the node element.
 * @param {string} text - specifies the text.
 * @param {boolean} isId - specifies the id.
 * @param {boolean} hasId - checks the id exists.
 * @returns {string[]} returns parent element.
 * @private
 */
export declare function getParents(element: Element, text: string, isId: boolean, hasId?: boolean): string[];
/**
 * Functions for generate path
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @returns {void}
 * @private
 */
export declare function generatePath(parent: IFileManager): void;
/**
 * Functions for remove active element
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @returns {void}
 * @private
 */
export declare function removeActive(parent: IFileManager): void;
/**
 * Selects active element in File Manager
 *
 * @param {string} action - specifies the action.
 * @param {IFileManager} parent - specifies the parent element.
 * @returns {boolean} - returns active element.
 * @private
 */
export declare function activeElement(action: string, parent: IFileManager): boolean;
/**
 * Adds blur to the elements
 *
 * @param {Element} nodes - specifies the nodes.
 * @returns {void}
 * @private
 */
export declare function addBlur(nodes: Element): void;
/**
 * Removes blur from elements
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} hover - specifies the hover string.
 * @returns {void}
 * @private
 */
export declare function removeBlur(parent?: IFileManager, hover?: string): void;
/**
 * Gets module name
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {Element} element - specifies the element.
 * @returns {void}
 * @private
 */
export declare function getModule(parent: IFileManager, element: Element): void;
/**
 * Gets module name
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} value - specifies the value.
 * @param {boolean} isLayoutChange - specifies the layout change.
 * @returns {void}
 * @private
 */
export declare function searchWordHandler(parent: IFileManager, value: string, isLayoutChange: boolean): void;
/**
 * Gets updated layout
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} view - specifies the view.
 * @returns {void}
 * @private
 */
export declare function updateLayout(parent: IFileManager, view: string): void;
/**
 * Gets updated layout
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {Element} element - specifies the element.
 * @returns {void}
 * @private
 */
export declare function getTargetModule(parent: IFileManager, element: Element): void;
/**
 * refresh the layout
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @returns {void}
 * @private
 */
export declare function refresh(parent: IFileManager): void;
/**
 * open action in the layout
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @returns {void}
 * @private
 */
export declare function openAction(parent: IFileManager): void;
/**
 * open action in the layout
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @returns {Object} - returns the path data.
 * @private
 */
export declare function getPathObject(parent: IFileManager): Object;
/**
 * Copy files
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @returns {void}
 * @private
 */
export declare function copyFiles(parent: IFileManager): void;
/**
 * Cut files
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @returns {void}
 * @private
 */
export declare function cutFiles(parent: IFileManager): void;
/**
 * To add class for fileType
 *
 * @param {Object} file - specifies the file.
 * @returns {string} - returns the file type.
 * @private
 */
export declare function fileType(file: Object): string;
/**
 * To get the image URL
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {Object} item - specifies the item.
 * @returns {string} - returns the image url.
 * @private
 */
export declare function getImageUrl(parent: IFileManager, item: Object): string;
/**
 * Gets the full path
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {Object} data - specifies the data.
 * @param {string} path - specifies the path.
 * @returns {string} - returns the image url.
 * @private
 */
export declare function getFullPath(parent: IFileManager, data: Object, path: string): string;
/**
 * Gets the name
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {Object} data - specifies the data.
 * @returns {string} - returns the name.
 * @private
 */
export declare function getName(parent: IFileManager, data: Object): string;
/**
 * Gets the name
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {Object[]} items - specifies the item elements.
 * @returns {Object[]} - returns the sorted data.
 * @private
 */
export declare function getSortedData(parent: IFileManager, items: Object[]): Object[];
/**
 * Gets the data object
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} key - specifies the key.
 * @param {string} value - specifies the value.
 * @returns {Object} - returns the sorted data.
 * @private
 */
export declare function getObject(parent: IFileManager, key: string, value: string): Object;
/**
 * Creates empty element
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {HTMLElement} element - specifies the element.
 * @param {ReadArgs | SearchArgs} args - specifies the args.
 * @returns {void}
 * @private
 */
export declare function createEmptyElement(parent: IFileManager, element: HTMLElement, args: ReadArgs | SearchArgs): void;
/**
 * Gets the directories
 *
 * @param {Object[]} files - specifies the file object.
 * @returns {Object[]} - returns the sorted data.
 * @private
 */
export declare function getDirectories(files: Object[]): Object[];
/**
 * set the Node ID
 *
 * @param {ReadArgs} result - specifies the result.
 * @param {string} rootId - specifies the rootId.
 * @returns {void}
 * @private
 */
export declare function setNodeId(result: ReadArgs, rootId: string): void;
/**
 * set the date object
 *
 * @param {Object[]} args - specifies the file object.
 * @returns {void}
 * @private
 */
export declare function setDateObject(args: Object[]): void;
/**
 * get the locale text
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} text - specifies the text.
 * @returns {string} - returns the locale text.
 * @private
 */
export declare function getLocaleText(parent: IFileManager, text: string): string;
/**
 * get the CSS class
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} css - specifies the css.
 * @returns {string} - returns the css classes.
 * @private
 */
export declare function getCssClass(parent: IFileManager, css: string): string;
/**
 * sort on click
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {MenuEventArgs} args - specifies the menu event arguements.
 * @returns {void}
 * @private
 */
export declare function sortbyClickHandler(parent: IFileManager, args: MenuEventArgs): void;
/**
 * Gets the sorted fields
 *
 * @param {string} id - specifies the id.
 * @returns {string} - returns the sorted fields
 * @private
 */
export declare function getSortField(id: string): string;
/**
 * Sets the next path
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} path - specifies the path.
 * @returns {void}
 * @private
 */
export declare function setNextPath(parent: IFileManager, path: string): void;
/**
 * Opens the searched folder
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {Object} data - specifies the data
 * @returns {void}
 * @private
 */
export declare function openSearchFolder(parent: IFileManager, data: Object): void;
/**
 * Paste handling function
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @returns {void}
 * @private
 */
export declare function pasteHandler(parent: IFileManager): void;
/**
 * Validates the sub folders
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {'{ [key: string]: Object; }[]'} data - specifies the data.
 * @param {string} dropPath - specifies the drop path.
 * @param {string} dragPath - specifies the drag path.
 * @returns {boolean} - returns the validated sub folder.
 * @private
 */
export declare function validateSubFolder(parent: IFileManager, data: {
    [key: string]: Object;
}[], dropPath: string, dragPath: string): boolean;
/**
 * Validates the drop handler
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @returns {void}
 * @private
 */
export declare function dropHandler(parent: IFileManager): void;
/**
 * Gets the parent path
 *
 * @param {string} oldPath - specifies the old path.
 * @returns {string} - returns the parent path.
 * @private
 */
export declare function getParentPath(oldPath: string): string;
/**
 * Gets the directory path
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {ReadArgs} args - returns the read arguements.
 * @returns {string} - returns the directory path
 * @private
 */
export declare function getDirectoryPath(parent: IFileManager, args: ReadArgs): string;
/**
 * Gets the do paste path
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {string} operation - specifies the operations.
 * @param {ReadArgs} result - returns the result.
 * @returns {void}
 * @private
 */
export declare function doPasteUpdate(parent: IFileManager, operation: string, result: ReadArgs): void;
/**
 * Reads the drop path
 *
 * @param {IFileManager} parent - specifies the parent.
 * @returns {void}
 * @private
 */
export declare function readDropPath(parent: IFileManager): void;
/**
 * Gets the duplicated path
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {string} name - specifies the name.
 * @returns {object} - returns the duplicated path.
 * @private
 */
export declare function getDuplicateData(parent: IFileManager, name: string): object;
/**
 * Gets the create the virtual drag element
 *
 * @param {IFileManager} parent - specifies the parent.
 * @returns {void}
 * @private
 */
export declare function createVirtualDragElement(parent: IFileManager): void;
/**
 * Drops the stop handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {DragEventArgs} args - specifies the drag event arguements.
 * @returns {void}
 * @private
 */
export declare function dragStopHandler(parent: IFileManager, args: DragEventArgs): void;
/**
 * Drag the start handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {'DragEventArgs'} args - specifies the drag event arguements.
 * @param {Draggable} dragObj - specifies the drag event arguements.
 * @returns {void}
 * @private
 */
export declare function dragStartHandler(parent: IFileManager, args: DragEventArgs, dragObj: Draggable): void;
/**
 * Drag the cancel handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @returns {void}
 * @private
 */
export declare function dragCancel(parent: IFileManager): void;
/**
 * Remove drop target handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @returns {void}
 * @private
 */
export declare function removeDropTarget(parent: IFileManager): void;
/**
 * Remove item class handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {string} value - specifies the value.
 * @returns {void}
 * @private
 */
export declare function removeItemClass(parent: IFileManager, value: string): void;
/**
 * Dragging handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {DragEventArgs} args - specifies the arguements.
 * @returns {void}
 * @private
 */
export declare function draggingHandler(parent: IFileManager, args: DragEventArgs): void;
/**
 * Object to string handler
 *
 * @param {Object} data - specifies the data.
 * @returns {string} returns string converted from Object.
 * @private
 */
export declare function objectToString(data: Object): string;
/**
 * Get item name handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {Object} data - specifies the data.
 * @returns {string} returns the item name.
 * @private
 */
export declare function getItemName(parent: IFileManager, data: Object): string;
/**
 * Get item name handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {Object} data - specifies the data.
 * @returns {void}
 * @private
 */
export declare function updateRenamingData(parent: IFileManager, data: Object): void;
/**
 * Get item name handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @returns {void}
 * @private
 */
export declare function doRename(parent: IFileManager): void;
/**
 * Download handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @returns {void}
 * @private
 */
export declare function doDownload(parent: IFileManager): void;
/**
 * Delete Files handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {Object[]} data - specifies the data.
 * @param {string[]} newIds - specifies the new Ids.
 * @returns {void}
 * @private
 */
export declare function doDeleteFiles(parent: IFileManager, data: Object[], newIds: string[]): void;
/**
 * Download files handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {Object[]} data - specifies the data.
 * @param {string[]} newIds - specifies the new Ids.
 * @returns {void}
 * @private
 */
export declare function doDownloadFiles(parent: IFileManager, data: Object[], newIds: string[]): void;
/**
 * Download files handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @param {Object} data - specifies the data.
 * @param {string} action - specifies the actions.
 * @returns {void}
 * @private
 */
export declare function createDeniedDialog(parent: IFileManager, data: Object, action: string): void;
/**
 * Get Access Classes
 *
 * @param {Object} data - specifies the data.
 * @returns {string} - returns accesses classes.
 * @private
 */
export declare function getAccessClass(data: Object): string;
/**
 * Check read access handler
 *
 * @param {Object} data - specifies the data.
 * @returns {boolean} - returns read access.
 * @private
 */
export declare function hasReadAccess(data: Object): boolean;
/**
 * Check edit access handler
 *
 * @param {Object} data - specifies the data.
 * @returns {boolean} - returns edit access.
 * @private
 */
export declare function hasEditAccess(data: Object): boolean;
/**
 * Check content access handler
 *
 * @param {Object} data - specifies the data.
 * @returns {boolean} - returns content access.
 * @private
 */
export declare function hasContentAccess(data: Object): boolean;
/**
 * Check upload access handler
 *
 * @param {Object} data - specifies the data.
 * @returns {boolean} - returns upload access.
 * @private
 */
export declare function hasUploadAccess(data: Object): boolean;
/**
 * Check download access handler
 *
 * @param {Object} data - specifies the data.
 * @returns {boolean} - returns download access.
 * @private
 */
export declare function hasDownloadAccess(data: Object): boolean;
/**
 * Create new folder handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @returns {void}
 * @private
 */
export declare function createNewFolder(parent: IFileManager): void;
/**
 * Upload item handler
 *
 * @param {IFileManager} parent - specifies the parent.
 * @returns {void}
 * @private
 */
export declare function uploadItem(parent: IFileManager): void;
