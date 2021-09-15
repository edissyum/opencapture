var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as events from '../base/constant';
import { isNullOrUndefined, Browser } from '@syncfusion/ej2-base';
import { Clipboard as GridClipboard } from '@syncfusion/ej2-grids';
/**
 * The `Clipboard` module is used to handle clipboard copy action.
 *
 * @hidden
 */
var TreeClipboard = /** @class */ (function (_super) {
    __extends(TreeClipboard, _super);
    function TreeClipboard(parent) {
        var _this = _super.call(this, parent.grid) || this;
        _this.treeCopyContent = '';
        _this.copiedUniqueIdCollection = [];
        _this.treeGridParent = parent;
        return _this;
    }
    TreeClipboard.prototype.setCopyData = function (withHeader) {
        var copyContent = 'copyContent';
        var getCopyData = 'getCopyData';
        var isSelect = 'isSelect';
        var uniqueID = 'uniqueID';
        var currentRecords = this.treeGridParent.getCurrentViewRecords();
        if (window.getSelection().toString() === '') {
            this.clipBoardTextArea.value = this[copyContent] = '';
            var rows = this.treeGridParent.grid.getRows();
            if (this.treeGridParent.selectionSettings.mode !== 'Cell') {
                var selectedIndexes = this.treeGridParent.getSelectedRowIndexes().sort(function (a, b) {
                    return a - b;
                });
                for (var i = 0; i < selectedIndexes.length; i++) {
                    if (i > 0) {
                        this.treeCopyContent += '\n';
                    }
                    if (!rows[selectedIndexes[i]].classList.contains('e-summaryrow')) {
                        var cells = [].slice.call(rows[selectedIndexes[i]].querySelectorAll('.e-rowcell'));
                        var uniqueid = this.treeGridParent.getSelectedRecords()[i][uniqueID];
                        if (this.copiedUniqueIdCollection.indexOf(uniqueid) === -1) {
                            if (this.treeGridParent.copyHierarchyMode === 'Parent' || this.treeGridParent.copyHierarchyMode === 'Both') {
                                this.parentContentData(currentRecords, selectedIndexes[i], rows, withHeader, i);
                            }
                            this[getCopyData](cells, false, '\t', withHeader);
                            this.treeCopyContent += this[copyContent];
                            this.copiedUniqueIdCollection.push(uniqueid);
                            this[copyContent] = '';
                            if (this.treeGridParent.copyHierarchyMode === 'Child' || this.treeGridParent.copyHierarchyMode === 'Both') {
                                this.childContentData(currentRecords, selectedIndexes[i], rows, withHeader);
                            }
                        }
                    }
                }
                if (withHeader) {
                    var headerTextArray = [];
                    for (var i = 0; i < this.treeGridParent.getVisibleColumns().length; i++) {
                        headerTextArray[i] = this.treeGridParent.getVisibleColumns()[i].headerText;
                    }
                    this[getCopyData](headerTextArray, false, '\t', withHeader);
                    this.treeCopyContent = this[copyContent] + '\n' + this.treeCopyContent;
                }
                var args = {
                    data: this.treeCopyContent,
                    cancel: false
                };
                this.treeGridParent.trigger(events.beforeCopy, args);
                if (args.cancel) {
                    return;
                }
                this.clipBoardTextArea.value = this[copyContent] = args.data;
                if (!Browser.userAgent.match(/ipad|ipod|iphone/i)) {
                    this.clipBoardTextArea.select();
                }
                else {
                    this.clipBoardTextArea.setSelectionRange(0, this.clipBoardTextArea.value.length);
                }
                this[isSelect] = true;
                this.copiedUniqueIdCollection = [];
                this.treeCopyContent = '';
            }
            else {
                _super.prototype.setCopyData.call(this, withHeader);
            }
        }
    };
    TreeClipboard.prototype.parentContentData = function (currentRecords, selectedIndex, rows, withHeader, index) {
        var getCopyData = 'getCopyData';
        var copyContent = 'copyContent';
        var parentItem = 'parentItem';
        var uniqueID = 'uniqueID';
        var level = 'level';
        if (!isNullOrUndefined(currentRecords[selectedIndex][parentItem])) {
            var treeLevel = currentRecords[selectedIndex][parentItem][level];
            for (var i = 0; i < treeLevel + 1; i++) {
                for (var j = 0; j < currentRecords.length; j++) {
                    if (!isNullOrUndefined(currentRecords[selectedIndex][parentItem]) &&
                        currentRecords[j][uniqueID] === currentRecords[selectedIndex][parentItem][uniqueID]) {
                        selectedIndex = j;
                        var cells = [].slice.call(rows[selectedIndex].querySelectorAll('.e-rowcell'));
                        var uniqueid = currentRecords[j][uniqueID];
                        if (this.copiedUniqueIdCollection.indexOf(uniqueid) === -1) {
                            this[getCopyData](cells, false, '\t', withHeader);
                            if (index > 0) {
                                this.treeCopyContent = this.treeCopyContent + this[copyContent] + '\n';
                            }
                            else {
                                this.treeCopyContent = this[copyContent] + '\n' + this.treeCopyContent;
                            }
                            this.copiedUniqueIdCollection.push(uniqueid);
                            this[copyContent] = '';
                            break;
                        }
                    }
                }
            }
        }
    };
    TreeClipboard.prototype.copy = function (withHeader) {
        _super.prototype.copy.call(this, withHeader);
    };
    TreeClipboard.prototype.paste = function (data, rowIndex, colIndex) {
        _super.prototype.paste.call(this, data, rowIndex, colIndex);
    };
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns clipboard module name
     */
    TreeClipboard.prototype.getModuleName = function () {
        return 'clipboard';
    };
    /**
     * To destroy the clipboard
     *
     * @returns {void}
     * @hidden
     */
    TreeClipboard.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    TreeClipboard.prototype.childContentData = function (currentRecords, selectedIndex, rows, withHeader) {
        var getCopyData = 'getCopyData';
        var copyContent = 'copyContent';
        var childRecords = 'childRecords';
        var hasChildRecords = 'hasChildRecords';
        var uniqueID = 'uniqueID';
        if (currentRecords[selectedIndex][hasChildRecords]) {
            var childData = currentRecords[selectedIndex][childRecords];
            for (var i = 0; i < childData.length; i++) {
                for (var j = 0; j < currentRecords.length; j++) {
                    if (!isNullOrUndefined(childData[i][uniqueID]) && currentRecords[j][uniqueID] === childData[i][uniqueID]) {
                        if ((!isNullOrUndefined(rows[j])) && !rows[j].classList.contains('e-summaryrow')) {
                            var cells = [].slice.call(rows[j].querySelectorAll('.e-rowcell'));
                            var uniqueid = currentRecords[j][uniqueID];
                            if (this.copiedUniqueIdCollection.indexOf(uniqueid) === -1) {
                                this[getCopyData](cells, false, '\t', withHeader);
                                this.treeCopyContent += ('\n' + this[copyContent]);
                                this[copyContent] = '';
                                this.copiedUniqueIdCollection.push(uniqueid);
                                this.childContentData(currentRecords, j, rows, withHeader);
                            }
                        }
                        break;
                    }
                }
            }
        }
    };
    return TreeClipboard;
}(GridClipboard));
export { TreeClipboard };
