import { DocumentHelper } from '../viewer';
import { L10n } from '@syncfusion/ej2-base';
/**
 * @private
 */
export declare class AddUserDialog {
    private documentHelper;
    private target;
    private textBoxInput;
    private userList;
    private addButton;
    constructor(documentHelper: DocumentHelper);
    initUserDialog(localValue: L10n, isRtl?: boolean): void;
    /**
     * @private
     * @returns {void}
     */
    show: () => void;
    /**
     * @private
     * @returns {void}
     */
    loadUserDetails: () => void;
    /**
     * @private
     * @returns {void}
     */
    okButtonClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    hideDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    onKeyUpOnDisplayBox: () => void;
    /**
     * @returns {void}
     */
    addButtonClick: () => void;
    validateUserName(value: string): boolean;
    /**
     * @returns {void}
     */
    deleteButtonClick: () => void;
}
