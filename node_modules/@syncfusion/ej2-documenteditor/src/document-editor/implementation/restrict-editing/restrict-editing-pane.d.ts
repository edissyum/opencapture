import { LayoutViewer, DocumentHelper } from '../viewer';
import { L10n } from '@syncfusion/ej2-base';
import { CheckBox } from '@syncfusion/ej2-buttons';
import { EnforceProtectionDialog, UnProtectDocumentDialog } from './enforce-protection-dialog';
import { ProtectionType } from '../../base/types';
import { Base64 } from '../editor/editor-helper';
import { ListView } from '@syncfusion/ej2-lists';
/**
 * @private
 */
export declare class RestrictEditing {
    private documentHelper;
    restrictPane: HTMLElement;
    allowFormatting: CheckBox;
    private addUser;
    private enforceProtection;
    private allowFormat;
    private allowPrint;
    private allowCopy;
    private addUserDialog;
    enforceProtectionDialog: EnforceProtectionDialog;
    stopProtection: HTMLButtonElement;
    addRemove: boolean;
    private protectionTypeDrop;
    private userWholeDiv;
    /**
     * @private
     */
    unProtectDialog: UnProtectDocumentDialog;
    stopProtectionDiv: HTMLElement;
    contentDiv1: HTMLElement;
    restrictPaneWholeDiv: HTMLElement;
    private closeButton;
    protectionType: ProtectionType;
    restrictFormatting: boolean;
    private localObj;
    currentHashValue: string;
    currentSaltValue: string;
    isShowRestrictPane: boolean;
    base64: Base64;
    addedUser: ListView;
    stopReadOnlyOptions: HTMLElement;
    isAddUser: boolean;
    usersCollection: string[];
    highlightCheckBox: CheckBox;
    constructor(documentHelper: DocumentHelper);
    readonly viewer: LayoutViewer;
    showHideRestrictPane(isShow: boolean): void;
    private initPane;
    initRestrictEditingPane(localObj: L10n): void;
    showStopProtectionPane(show: boolean): void;
    /**
     * @returns {void}
     */
    private closePane;
    private wireEvents;
    private enableFormatting;
    private stopProtectionTriggered;
    private protectionTypeDropChanges;
    private selectHandler;
    highlightClicked(args: any): void;
    private protectDocument;
    createCheckBox(label: string, element: HTMLInputElement): CheckBox;
    loadPaneValue(): void;
    navigateNextRegion(): void;
    addUserCollection(): void;
    /**
     * @returns {void}
     */
    showAllRegion: () => void;
    updateUserInformation(): void;
}
