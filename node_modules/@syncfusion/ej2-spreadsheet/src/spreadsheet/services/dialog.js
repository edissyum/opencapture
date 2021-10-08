import { Dialog as DialogComponent } from '@syncfusion/ej2-popups';
import { extend, remove, isNullOrUndefined } from '@syncfusion/ej2-base';
import { locale } from '../common/index';
/**
 * Dialog Service.
 *
 * @hidden
 */
var Dialog = /** @class */ (function () {
    /**
     * Constructor for initializing dialog service.
     *
     * @param {Spreadsheet} parent - Specifies the Spreadsheet instance.
     */
    function Dialog(parent) {
        this.parent = parent;
    }
    /**
     * To show dialog.
     *
     * @param {DialogModel} dialogModel - Specifies the Dialog model.
     * @param {boolean} cancelBtn - Specifies the cancel button.
     * @returns {void}
     */
    Dialog.prototype.show = function (dialogModel, cancelBtn) {
        var _this = this;
        var btnContent;
        cancelBtn = isNullOrUndefined(cancelBtn) ? true : false;
        var closeHandler = dialogModel.close || null;
        var model = {
            header: 'Spreadsheet',
            cssClass: this.parent.cssClass,
            target: this.parent.element,
            buttons: []
        };
        dialogModel.close = function () {
            _this.destroyDialog();
            if (closeHandler) {
                closeHandler();
            }
        };
        extend(model, dialogModel);
        if (cancelBtn) {
            btnContent = this.parent.serviceLocator.getService(locale).getConstant(model.buttons.length ? 'Cancel' : 'Ok');
            model.buttons.push({
                buttonModel: { content: btnContent, isPrimary: model.buttons.length === 0 },
                click: this.hide.bind(this)
            });
        }
        var div = this.parent.createElement('div');
        document.body.appendChild(div);
        this.dialogInstance = new DialogComponent(model);
        this.dialogInstance.createElement = this.parent.createElement;
        this.dialogInstance.appendTo(div);
        this.dialogInstance.refreshPosition();
    };
    /**
     * To destroy the dialog if it open is prevented by user.
     *
     * @returns {void}
     */
    Dialog.prototype.destroyDialog = function () {
        this.dialogInstance.destroy();
        remove(this.dialogInstance.element);
        this.dialogInstance = null;
    };
    /**
     * To hide dialog.
     *
     * @returns {void}
     */
    Dialog.prototype.hide = function () {
        if (this.dialogInstance) {
            this.dialogInstance.hide();
        }
    };
    /**
     * To clear private variables.
     *
     * @returns {void}
     */
    Dialog.prototype.destroy = function () {
        this.parent = null;
    };
    return Dialog;
}());
export { Dialog };
