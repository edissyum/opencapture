import { PivotCommon } from '../base/pivot-common';
import { Dialog } from '@syncfusion/ej2-popups';
/**
 * `ErrorDialog` module to create error dialog.
 */
/** @hidden */
export declare class ErrorDialog {
    parent: PivotCommon;
    /** @hidden */
    errorPopUp: Dialog;
    /**
     * Constructor for the dialog action.
     * @hidden
     */
    constructor(parent: PivotCommon);
    /**
     * Creates the error dialog for the unexpected action done.
     * @function createErrorDialog
     * @returns {void}
     * @hidden
     */
    createErrorDialog(title: string, description: string, target?: HTMLElement): void;
    private closeErrorDialog;
    private removeErrorDialog;
}
