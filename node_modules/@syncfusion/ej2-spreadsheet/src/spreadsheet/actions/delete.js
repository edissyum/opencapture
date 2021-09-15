import { beginAction, completeAction, skipHiddenIdx, refreshSheetTabs, refreshImagePosition, focus } from '../common/index';
import { deleteAction } from '../../workbook/common/index';
import { getCell } from '../../workbook/index';
/**
 * The `Delete` module is used to delete cells, rows, columns and sheets from the spreadsheet.
 */
var Delete = /** @class */ (function () {
    /**
     * Constructor for the Spreadsheet insert module.
     *
     * @param {Spreadsheet} parent - Constructor for the Spreadsheet insert module.
     * @private
     */
    function Delete(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    Delete.prototype.delete = function (args) {
        var isAction;
        if (args.isAction) {
            isAction = true;
            delete args.isAction;
        }
        if (isAction) {
            this.parent.notify(beginAction, { eventArgs: args, action: 'delete' });
        }
        if (args.modelType === 'Sheet') {
            var activeSheetDeleted = args.activeSheetIndex >= args.startIndex && args.activeSheetIndex <= args.endIndex;
            if (activeSheetDeleted) {
                this.parent.setProperties({ activeSheetIndex: this.parent.skipHiddenSheets(args.startIndex < this.parent.sheets.length ? args.startIndex :
                        (args.startIndex ? args.startIndex - 1 : 0)) }, true);
            }
            this.parent.notify(refreshSheetTabs, null);
            if (activeSheetDeleted) {
                this.parent.renderModule.refreshSheet();
            }
            focus(this.parent.element);
        }
        else if (args.modelType === 'Row') {
            if (!this.parent.scrollSettings.enableVirtualization || args.startIndex <= this.parent.viewport.bottomIndex) {
                if (args.freezePane) {
                    this.parent.renderModule.refreshSheet();
                }
                else if (this.parent.scrollSettings.enableVirtualization) {
                    if (args.startIndex < this.parent.viewport.topIndex) {
                        this.parent.viewport.topIndex -= args.model.length;
                    }
                    this.parent.renderModule.refreshUI({
                        skipUpdateOnFirst: this.parent.viewport.topIndex === skipHiddenIdx(this.parent.getActiveSheet(), 0, true), rowIndex: this.parent.viewport.topIndex, refresh: 'Row',
                        colIndex: this.parent.viewport.leftIndex
                    });
                    this.parent.selectRange(this.parent.getActiveSheet().selectedRange);
                }
                else {
                    this.parent.renderModule.refreshUI({ skipUpdateOnFirst: true, refresh: 'Row', rowIndex: args.startIndex, colIndex: 0 });
                    this.parent.selectRange(this.parent.getActiveSheet().selectedRange);
                }
            }
        }
        else {
            if (!this.parent.scrollSettings.enableVirtualization || args.startIndex <= this.parent.viewport.rightIndex) {
                if (args.freezePane) {
                    this.parent.renderModule.refreshSheet();
                }
                else if (this.parent.scrollSettings.enableVirtualization) {
                    if (args.startIndex < this.parent.viewport.leftIndex) {
                        this.parent.viewport.leftIndex -= args.model.length;
                    }
                    this.parent.renderModule.refreshUI({
                        skipUpdateOnFirst: this.parent.viewport.leftIndex === skipHiddenIdx(this.parent.getActiveSheet(), 0, true, 'columns'), rowIndex: this.parent.viewport.topIndex, refresh: 'Column',
                        colIndex: this.parent.viewport.leftIndex
                    });
                    this.parent.selectRange(this.parent.getActiveSheet().selectedRange);
                }
                else {
                    this.parent.renderModule.refreshUI({
                        skipUpdateOnFirst: true, refresh: 'Column', rowIndex: 0,
                        colIndex: args.startIndex
                    });
                    this.parent.selectRange(this.parent.getActiveSheet().selectedRange);
                }
            }
        }
        this.refreshImgElement(args.deletedModel.length, this.parent.activeSheetIndex, args.modelType, args.startIndex);
        if (isAction) {
            this.parent.notify(completeAction, { eventArgs: args, action: 'delete' });
        }
    };
    Delete.prototype.refreshImgElement = function (count, sheetIdx, modelType, index) {
        var sheet = this.parent.sheets[sheetIdx];
        var cell;
        var address = [0, 0, sheet.usedRange.rowIndex, sheet.usedRange.colIndex];
        for (var i = 0; i <= address[2]; i++) {
            for (var j = address[1]; j <= address[3]; j++) {
                cell = getCell(i, j, sheet);
                if (cell && cell.image && cell.image.length > 0) {
                    if ((modelType === 'Row' && i >= index) || (modelType === 'Column' && j >= index)) {
                        this.parent.notify(refreshImagePosition, {
                            rowIdx: i, colIdx: j, sheetIdx: sheetIdx, type: modelType, count: count, status: 'delete'
                        });
                    }
                }
            }
        }
    };
    Delete.prototype.addEventListener = function () {
        this.parent.on(deleteAction, this.delete, this);
    };
    /**
     * Destroy delete module.
     *
     * @returns {void} - Destroy delete module.
     */
    Delete.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    Delete.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(deleteAction, this.delete);
        }
    };
    /**
     * Get the delete module name.
     *
     * @returns {string} - Get the delete module name.
     */
    Delete.prototype.getModuleName = function () {
        return 'delete';
    };
    return Delete;
}());
export { Delete };
