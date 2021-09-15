import { applyMerge, activeCellMergedRange } from '../../workbook/common/index';
import { hiddenMerge, dialog, locale, focus } from '../common/index';
import { checkPrevMerge, checkMerge } from '../common/index';
import { getCell, isHiddenCol, isHiddenRow } from '../../workbook/index';
/**
 * The `Merge` module is used to to merge the range of cells.
 */
var Merge = /** @class */ (function () {
    /**
     * Constructor for the Spreadsheet merge module.
     *
     * @param {Spreadsheet} parent - Specify the spreadsheet.
     * @private
     */
    function Merge(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    Merge.prototype.merge = function (args) {
        var _this = this;
        if (args.showDialog) {
            this.parent.serviceLocator.getService(dialog).show({
                target: this.parent.element,
                height: 180, width: 400, isModal: true, showCloseIcon: true,
                content: this.parent.serviceLocator.getService(locale).getConstant('PasteMergeAlert'),
                beforeOpen: function (args) {
                    var dlgArgs = {
                        dialogName: 'MergeDialog',
                        element: args.element, target: args.target, cancel: args.cancel
                    };
                    _this.parent.trigger('dialogBeforeOpen', dlgArgs);
                    if (dlgArgs.cancel) {
                        args.cancel = true;
                    }
                    focus(_this.parent.element);
                }
            });
            return;
        }
        this.parent.serviceLocator.getService('cell').refresh(args.rowIdx, args.colIdx, args.lastCell, args.element);
    };
    Merge.prototype.hideHandler = function (args) {
        var sheet = this.parent.getActiveSheet();
        var mergeArgs = { range: [args.rowIdx, args.colIdx, args.rowIdx, args.colIdx] };
        this.parent.notify(activeCellMergedRange, mergeArgs);
        mergeArgs.range = mergeArgs.range;
        var cell = getCell(mergeArgs.range[0], mergeArgs.range[1], sheet) || {};
        var startIdx = args.model === 'row' ? mergeArgs.range[0] : mergeArgs.range[1];
        var endIdx = startIdx + ((cell[args.model + "Span"] || 1) - 1);
        if ((!args.isEnd && (args.start === startIdx || isHiddenCol(sheet, startIdx))) || (args.isEnd && (args.start > startIdx &&
            !isHiddenCol(sheet, startIdx)))) {
            return;
        }
        if (cell[args.model + "Span"] > 1 && endIdx >= args.start) {
            if (args.model === 'row' ? isHiddenRow(sheet, startIdx) : isHiddenCol(sheet, startIdx)) {
                if (args.end < endIdx && (endIdx - args.end > 1 || cell.rowSpan > 1)) {
                    var cellEle = this.parent.getCell(args.rowIdx, args.end + 1);
                    if (cellEle) {
                        if (endIdx - args.end > 1) {
                            cellEle.colSpan = endIdx - args.end;
                        }
                        cellEle.style.display = '';
                    }
                    if (cell.rowSpan > 1) {
                        var rowSpan = cell.rowSpan - this.parent.hiddenCount(args.rowIdx, args.rowIdx + (cell.rowSpan - 1));
                        if (rowSpan > 1) {
                            cellEle.rowSpan = rowSpan;
                        }
                    }
                }
            }
            else {
                this.merge({ rowIdx: mergeArgs.range[0], colIdx: mergeArgs.range[1] });
            }
        }
    };
    Merge.prototype.checkPrevMerge = function (args) {
        var cell;
        var sheet = this.parent.getActiveSheet();
        var mergeArgs;
        var mergeCount;
        if (args.isRow) {
            if (args.rowIdx - 1 > -1 && isHiddenRow(sheet, args.rowIdx - 1)) {
                cell = getCell(args.rowIdx - 1, args.colIdx, sheet) || {};
                if ((cell.rowSpan !== undefined || cell.colSpan !== undefined) && (cell.colSpan === undefined || cell.colSpan > 1 ||
                    (args.colIdx - 1 > -1 && isHiddenCol(sheet, args.colIdx - 1)))) {
                    mergeArgs = { range: [args.rowIdx - 1, args.colIdx, args.rowIdx - 1, args.colIdx] };
                    this.parent.notify(activeCellMergedRange, mergeArgs);
                    mergeArgs.range = mergeArgs.range;
                    if (isHiddenRow(sheet, mergeArgs.range[0]) && mergeArgs.range[2] >= args.rowIdx) {
                        cell = getCell(mergeArgs.range[0], mergeArgs.range[1], sheet) || {};
                        if (cell.rowSpan > 1) {
                            mergeCount = (mergeArgs.range[2] - args.rowIdx) + 1 - this.parent.hiddenCount(args.rowIdx, args.rowIdx + (mergeArgs.range[2] - args.rowIdx));
                            if (mergeCount > 1) {
                                args.td.rowSpan = mergeCount;
                                args.td.style.display = '';
                            }
                            if (cell.colSpan > 1 && !(args.colIdx - 1 > -1 && isHiddenCol(sheet, args.colIdx - 1))) {
                                mergeCount = cell.colSpan - this.parent.hiddenCount(args.colIdx, args.colIdx + (cell.colSpan - 1), 'columns');
                                if (mergeCount > 1) {
                                    args.td.colSpan = mergeCount;
                                    args.td.style.display = '';
                                }
                            }
                        }
                    }
                }
            }
            return;
        }
        if (args.colIdx - 1 > -1 && isHiddenCol(sheet, args.colIdx - 1)) {
            cell = getCell(args.rowIdx, args.colIdx - 1, sheet) || {};
            if ((cell.colSpan !== undefined || cell.rowSpan !== undefined) && (cell.rowSpan === undefined || cell.rowSpan > 1 ||
                (args.rowIdx - 1 > -1 && isHiddenRow(sheet, args.rowIdx - 1)))) {
                mergeArgs = { range: [args.rowIdx, args.colIdx - 1, args.rowIdx, args.colIdx - 1] };
                this.parent.notify(activeCellMergedRange, mergeArgs);
                mergeArgs.range = mergeArgs.range;
                if (isHiddenCol(sheet, mergeArgs.range[1]) && mergeArgs.range[3] >= args.colIdx) {
                    cell = getCell(mergeArgs.range[0], mergeArgs.range[1], sheet) || {};
                    if (cell.colSpan > 1) {
                        mergeCount = (mergeArgs.range[3] - args.colIdx) + 1 - this.parent.hiddenCount(args.colIdx, args.colIdx + (cell.colSpan - 1), 'columns');
                        if (mergeCount > 1) {
                            args.td.colSpan = mergeCount;
                            args.td.style.display = '';
                        }
                        if (cell.rowSpan > 1 && !(args.rowIdx - 1 > -1 && isHiddenRow(sheet, args.rowIdx - 1))) {
                            mergeCount = cell.rowSpan - this.parent.hiddenCount(args.rowIdx, args.rowIdx + (cell.rowSpan - 1));
                            if (mergeCount > 1) {
                                args.td.rowSpan = mergeCount;
                                args.td.style.display = '';
                            }
                        }
                    }
                }
            }
        }
    };
    Merge.prototype.checkMerge = function (args) {
        var sheet = this.parent.getActiveSheet();
        var cell = getCell(args.rowIdx, args.colIdx, sheet) || {};
        if (args.isRow) {
            if (cell.colSpan === undefined || isHiddenCol(sheet, args.colIdx - 1)) {
                var mergeArgs = { range: [args.rowIdx, args.colIdx, args.rowIdx, args.colIdx] };
                mergeArgs.range = mergeArgs.range;
                this.parent.notify(activeCellMergedRange, mergeArgs);
                if ((isHiddenCol(sheet, args.colIdx - 1) && !isHiddenCol(sheet, mergeArgs.range[1])) || (args.isFreezePane &&
                    mergeArgs.range[0] < this.parent.frozenRowCount(sheet))) {
                    args.insideFreezePane = mergeArgs.range[0] < this.parent.frozenRowCount(sheet);
                    return;
                }
                cell = getCell(mergeArgs.range[0], mergeArgs.range[1], sheet);
                var mergeCount = (mergeArgs.range[2] - args.rowIdx) + 1 -
                    this.parent.hiddenCount(args.rowIdx, mergeArgs.range[2]);
                if (mergeCount > 1) {
                    this.merge({ rowIdx: mergeArgs.range[0], colIdx: mergeArgs.range[1], element: args.td });
                    args.td.rowSpan = mergeCount;
                    args.td.style.display = '';
                }
            }
        }
        else {
            if (cell.rowSpan === undefined || isHiddenRow(sheet, args.rowIdx - 1)) {
                var mergeArgs = { range: [args.rowIdx, args.colIdx, args.rowIdx, args.colIdx] };
                mergeArgs.range = mergeArgs.range;
                this.parent.notify(activeCellMergedRange, mergeArgs);
                if ((isHiddenRow(sheet, args.rowIdx - 1) && !isHiddenRow(sheet, mergeArgs.range[0])) || (args.isFreezePane &&
                    mergeArgs.range[1] < this.parent.frozenColCount(sheet))) {
                    args.insideFreezePane = mergeArgs.range[1] < this.parent.frozenColCount(sheet);
                    return;
                }
                cell = getCell(mergeArgs.range[0], mergeArgs.range[1], sheet);
                var mergeCount = (mergeArgs.range[3] - args.colIdx) + 1 - this.parent.hiddenCount(args.colIdx, mergeArgs.range[3], 'columns');
                if (mergeCount > 1) {
                    this.merge({ rowIdx: mergeArgs.range[0], colIdx: mergeArgs.range[1], element: args.td });
                    args.td.colSpan = mergeCount;
                    args.td.style.display = '';
                }
            }
        }
    };
    Merge.prototype.addEventListener = function () {
        this.parent.on(applyMerge, this.merge, this);
        this.parent.on(hiddenMerge, this.hideHandler, this);
        this.parent.on(checkPrevMerge, this.checkPrevMerge, this);
        this.parent.on(checkMerge, this.checkMerge, this);
    };
    /**
     * Destroy merge module.
     *
     * @returns {void} - Destroy merge module.
     */
    Merge.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    Merge.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(applyMerge, this.merge);
            this.parent.off(hiddenMerge, this.hideHandler);
            this.parent.off(checkPrevMerge, this.checkPrevMerge);
            this.parent.off(checkMerge, this.checkMerge);
        }
    };
    /**
     * Get the merge module name.
     *
     * @returns {string} - Get the merge module name.
     */
    Merge.prototype.getModuleName = function () {
        return 'merge';
    };
    return Merge;
}());
export { Merge };
