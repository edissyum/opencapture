import { Spreadsheet } from '../base/index';
import { Dialog as DialogComponent, DialogModel } from '@syncfusion/ej2-popups';
/**
 * Dialog Service.
 *
 * @hidden
 */
export declare class Dialog {
    private parent;
    dialogInstance: DialogComponent;
    /**
     * Constructor for initializing dialog service.
     *
     * @param {Spreadsheet} parent - Specifies the Spreadsheet instance.
     */
    constructor(parent: Spreadsheet);
    /**
     * To show dialog.
     *
     * @param {DialogModel} dialogModel - Specifies the Dialog model.
     * @param {boolean} cancelBtn - Specifies the cancel button.
     * @returns {void}
     */
    show(dialogModel: DialogModel, cancelBtn?: boolean): void;
    /**
     * To destroy the dialog if it open is prevented by user.
     *
     * @returns {void}
     */
    destroyDialog(): void;
    /**
     * To hide dialog.
     *
     * @returns {void}
     */
    hide(): void;
    /**
     * To clear private variables.
     *
     * @returns {void}
     */
    destroy(): void;
}
