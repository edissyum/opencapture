import { IFileManager, ReadArgs, FileDetails } from '../base/interface';
import { SelectedEventArgs } from '@syncfusion/ej2-inputs';
/**
 *
 * @param {IFileManager} parent - Specifies the parent element
 * @param {string} text - specifies the text string.
 * @param {ReadArgs | SelectedEventArgs} e - specifies the type of event args.
 * @param {FileDetails} details - specifies the file details.
 * @param {string[]} replaceItems - specifies the replacement.
 * @returns {void}
 * @private
 */
export declare function createDialog(parent: IFileManager, text: string, e?: ReadArgs | SelectedEventArgs, details?: FileDetails, replaceItems?: string[]): void;
/**
 *
 * @param {IFileManager} parent - Specifies the parent element.
 * @param {string} text - specifies the text string.
 * @param {string[]} replaceItems - specifies the replacement items.
 * @param {string} newPath - specifies the new path.
 * @returns {void}
 * @private
 */
export declare function createExtDialog(parent: IFileManager, text: string, replaceItems?: string[], newPath?: string): void;
/**
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} header - specifies the header element.
 * @param {string} imageUrl - specifies the image URL.
 * @returns {void}
 * @private
 */
export declare function createImageDialog(parent: IFileManager, header: string, imageUrl: string): void;
