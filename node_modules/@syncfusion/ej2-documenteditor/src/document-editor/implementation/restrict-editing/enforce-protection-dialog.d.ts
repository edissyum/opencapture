import { LayoutViewer, DocumentHelper } from '../viewer';
import { L10n } from '@syncfusion/ej2-base';
import { RestrictEditing } from './restrict-editing-pane';
/**
 * @private
 */
export declare class EnforceProtectionDialog {
    private documentHelper;
    private target;
    private passwordTextBox;
    private confirmPasswordTextBox;
    private localeValue;
    private owner;
    /**
     * @private
     */
    password: string;
    constructor(documentHelper: DocumentHelper, owner: RestrictEditing);
    readonly viewer: LayoutViewer;
    initDialog(localValue: L10n): void;
    /**
     * @private
     * @returns {void}
     */
    show: () => void;
    /**
     * @returns {void}
     */
    hideDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    okButtonClick: () => void;
}
/**
 * @private
 */
export declare class UnProtectDocumentDialog {
    private documentHelper;
    private target;
    private passwordTextBox;
    private owner;
    private localObj;
    private currentHashValue;
    private currentSaltValue;
    readonly viewer: LayoutViewer;
    constructor(documentHelper: DocumentHelper, owner: RestrictEditing);
    initDialog(localValue: L10n): void;
    /**
     * @private
     * @returns {void}
     */
    show: () => void;
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
}
