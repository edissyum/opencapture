import { dialog, focus } from '../index';
import { beginSave, saveCompleted, saveError } from '../../workbook/common/event';
/**
 * `Save` module is used to handle the save action in Spreadsheet.
 */
var Save = /** @class */ (function () {
    /**
     * Constructor for Save module in Spreadsheet.
     *
     * @private
     * @param {Spreadsheet} parent - Specifies the Spreadsheet instance.
     */
    function Save(parent) {
        this.parent = parent;
        this.addEventListener();
        //Spreadsheet.Inject(WorkbookSave);
    }
    /**
     * To destroy the Save module.
     *
     * @returns {void}
     * @hidden
     */
    Save.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    Save.prototype.addEventListener = function () {
        this.parent.on(beginSave, this.initiateSave, this);
        this.parent.on(saveCompleted, this.saveCompleted, this);
        this.parent.on(saveError, this.showErrorDialog, this);
    };
    Save.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(beginSave, this.initiateSave);
            this.parent.off(saveCompleted, this.saveCompleted);
            this.parent.off(saveError, this.showErrorDialog);
        }
    };
    /**
     * Get the module name.
     *
     * @returns {string} - Get the module name.
     * @private
     */
    Save.prototype.getModuleName = function () {
        return 'save';
    };
    /**
     * Initiate save process.
     *
     * @hidden
     * @returns {void} - Initiate save process.
     */
    Save.prototype.initiateSave = function () {
        this.parent.showSpinner();
    };
    /**
     * Save action completed.
     *
     * @hidden
     * @returns {void} - Save action completed.
     */
    Save.prototype.saveCompleted = function () {
        this.parent.hideSpinner();
    };
    Save.prototype.showErrorDialog = function (args) {
        var _this = this;
        var dialogInst = this.parent.serviceLocator.getService(dialog);
        dialogInst.show({
            target: this.parent.element, isModal: true, showCloseIcon: true, height: 180, width: 400, content: args.content,
            beforeOpen: function () { return focus(_this.parent.element); }
        });
    };
    return Save;
}());
export { Save };
