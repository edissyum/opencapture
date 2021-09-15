import { Dictionary } from '../../base/dictionary';
import { TextPosition } from '../selection/selection-helper';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { BaseHistoryInfo } from './base-history-info';
import { ModifiedParagraphFormat, ModifiedLevel, RowHistoryFormat, TableHistoryInfo } from './history-helper';
import { HistoryInfo } from './history-info';
import { WParagraphFormat } from '../format/paragraph-format';
import { HelperMethods } from '../editor/editor-helper';
/**
 *  `EditorHistory` Module class is used to handle history preservation
 */
var EditorHistory = /** @class */ (function () {
    /**
     * @param {DocumentEditor} node - Specified the document editor.
     * @private
     */
    function EditorHistory(node) {
        //Fields
        this.undoStackIn = [];
        this.redoStackIn = [];
        this.historyInfoStack = [];
        /**
         * @private
         */
        this.isUndoing = false;
        /**
         * @private
         */
        this.isRedoing = false;
        this.owner = node;
        this.documentHelper = node.documentHelper;
        this.modifiedParaFormats = new Dictionary();
        this.undoLimitIn = 500;
        this.redoLimitIn = 500;
    }
    Object.defineProperty(EditorHistory.prototype, "currentHistoryInfo", {
        /**
         * @private
         * @returns {HistoryInfo} - Returns the history info.
         */
        get: function () {
            return this.historyInfoStack && this.historyInfoStack.length > 0 ?
                this.historyInfoStack[this.historyInfoStack.length - 1] : undefined;
        },
        /**
         * @private
         * @param {HistoryInfo} value - Specified the value.
         */
        set: function (value) {
            if (value instanceof HistoryInfo) {
                this.historyInfoStack.push(value);
            }
            else {
                this.historyInfoStack.pop();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EditorHistory.prototype, "undoStack", {
        //Properties
        /**
         * gets undo stack
         *
         * @private
         * @returns {BaseHistoryInfo[]} - Returns the undo stack.
         */
        get: function () {
            return this.undoStackIn;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EditorHistory.prototype, "redoStack", {
        /**
         * gets redo stack
         *
         * @private
         * @returns {BaseHistoryInfo[]} - Returns the redo stack.
         */
        get: function () {
            return this.redoStackIn;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EditorHistory.prototype, "undoLimit", {
        /**
         * Gets or Sets the limit of undo operations can be done.
         *
         * @aspType int
         * @returns {number} - Returns the redo limit
         */
        get: function () {
            return isNullOrUndefined(this.undoLimitIn) ? 0 : this.undoLimitIn;
        },
        /**
         * Sets the limit of undo operations can be done.
         *
         * @aspType int
         * @param {number} value - Specified the value.
         */
        set: function (value) {
            if (value < 0) {
                throw new Error('The limit should be greater than or equal to zero.');
            }
            this.undoLimitIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EditorHistory.prototype, "redoLimit", {
        /**
         * Gets or Sets the limit of redo operations can be done.
         *
         * @aspType int
         * @returns {number} - Returns the redo limit
         */
        get: function () {
            return isNullOrUndefined(this.redoLimitIn) ? 0 : this.redoLimitIn;
        },
        /**
         * Gets or Sets the limit of redo operations can be done.
         *
         * @aspType int
         * @param {number} value - Specified the value.
         */
        set: function (value) {
            if (value < 0) {
                throw new Error('The limit should be greater than or equal to zero.');
            }
            this.redoLimitIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EditorHistory.prototype, "viewer", {
        get: function () {
            return this.owner.viewer;
        },
        enumerable: true,
        configurable: true
    });
    EditorHistory.prototype.getModuleName = function () {
        return 'EditorHistory';
    };
    /**
     * Determines whether undo operation can be done.
     *
     * @returns {boolean} - Returns the canUndo.
     */
    EditorHistory.prototype.canUndo = function () {
        return !isNullOrUndefined(this.undoStack) && this.undoStack.length > 0;
    };
    /**
     * Determines whether redo operation can be done.
     *
     * @returns {boolean} - Returns the canRedo.
     */
    EditorHistory.prototype.canRedo = function () {
        return !isNullOrUndefined(this.redoStack) && this.redoStack.length > 0;
    };
    //EditorHistory Initialization
    /**
     * initialize EditorHistory
     *
     * @private
     * @param {Action} action - Specifies the action.
     * @returns {void}
     */
    EditorHistory.prototype.initializeHistory = function (action) {
        this.currentBaseHistoryInfo = new BaseHistoryInfo(this.owner);
        this.currentBaseHistoryInfo.action = action;
        this.currentBaseHistoryInfo.updateSelection();
    };
    /**
     * Initialize complex history
     *
     * @private
     * @param {Selection} selection - Specifies the selection.
     * @param {Action} action - Specifies the action.
     * @returns {void}
     */
    EditorHistory.prototype.initComplexHistory = function (selection, action) {
        this.currentHistoryInfo = new HistoryInfo(selection.owner, !isNullOrUndefined(this.currentHistoryInfo));
        this.currentHistoryInfo.action = action;
        this.currentHistoryInfo.updateSelection();
    };
    /**
     * @private
     * @param {Point} startingPoint - Specifies the start point.
     * @param {TableResizer} tableResize - Spcifies the table resizer.
     * @returns {void}
     */
    EditorHistory.prototype.initResizingHistory = function (startingPoint, tableResize) {
        if (tableResize.resizeNode === 1) {
            this.initializeHistory('RowResizing');
            if (!isNullOrUndefined(this.currentBaseHistoryInfo)) {
                /* eslint-disable-next-line max-len */
                this.currentBaseHistoryInfo.modifiedProperties.push(new RowHistoryFormat(startingPoint, tableResize.currentResizingTable.childWidgets[tableResize.resizerPosition].rowFormat));
            }
        }
        else {
            this.initializeHistory('CellResizing');
            if (this.currentBaseHistoryInfo) {
                tableResize.currentResizingTable = tableResize.currentResizingTable.combineWidget(this.viewer);
                var tableHistoryInfo = new TableHistoryInfo(tableResize.currentResizingTable, this.owner);
                tableHistoryInfo.startingPoint = startingPoint;
                this.currentBaseHistoryInfo.modifiedProperties.push(tableHistoryInfo);
            }
        }
    };
    /**
     * Update resizing history
     *
     * @private
     * @param {Point} point - Specifies the point.
     * @param {TableResizer} tableResize - Specifies the table resizer.
     * @returns {void}
     */
    EditorHistory.prototype.updateResizingHistory = function (point, tableResize) {
        if (tableResize.resizeNode === 1) {
            if (!isNullOrUndefined(this.currentBaseHistoryInfo)) {
                var rowHistoryFormat = this.currentBaseHistoryInfo.modifiedProperties[0];
                if (rowHistoryFormat.startingPoint.y === point.y) {
                    this.currentBaseHistoryInfo.modifiedProperties.length = 0;
                }
                else {
                    rowHistoryFormat.displacement = HelperMethods.convertPixelToPoint(point.y - rowHistoryFormat.startingPoint.y);
                    this.recordChanges(this.currentBaseHistoryInfo);
                    this.currentBaseHistoryInfo = undefined;
                }
            }
        }
        else {
            if (!isNullOrUndefined(this.currentBaseHistoryInfo)) {
                var cellHistoryFormat = this.currentBaseHistoryInfo.modifiedProperties[0];
                if (cellHistoryFormat.startingPoint.x === point.x) {
                    this.currentBaseHistoryInfo.modifiedProperties.length = 0;
                }
                else {
                    cellHistoryFormat.displacement = HelperMethods.convertPixelToPoint(point.x - cellHistoryFormat.startingPoint.x);
                    cellHistoryFormat.endIndex = tableResize.getCellReSizerPosition(point);
                    this.owner.editorHistory.recordChanges(this.currentBaseHistoryInfo);
                    this.currentBaseHistoryInfo = undefined;
                }
            }
        }
    };
    /**
     * Record the changes
     *
     * @private
     * @param {BaseHistoryInfo} baseHistoryInfo - Specified the base history info.
     * @returns {void}
     */
    EditorHistory.prototype.recordChanges = function (baseHistoryInfo) {
        if (!this.owner.enableHistoryMode) {
            return;
        }
        if (this.isUndoing) {
            if (isNullOrUndefined(this.redoStack)) {
                this.redoStackIn = [];
            }
            if (this.redoStack.length === this.redoLimit && this.redoLimit > 0) {
                var count = this.undoLimit > 20 ? 10 : 1;
                this.redoStackIn.splice(0, count);
            }
            if (this.redoStack.length < this.redoLimit) {
                this.redoStack.push(baseHistoryInfo);
            }
        }
        else {
            if (!this.isRedoing) {
                this.clearRedoStack();
            }
            if (isNullOrUndefined(this.undoStack)) {
                this.undoStackIn = [];
            }
            if (this.undoStack.length === this.undoLimit && this.undoLimit > 0) {
                var count = this.undoLimit > 20 ? 10 : 1;
                this.undoStackIn.splice(0, count);
            }
            if (this.undoStack.length < this.undoLimit) {
                this.undoStackIn.push(baseHistoryInfo);
            }
        }
    };
    /**
     * update EditorHistory
     *
     * @private
     * @returns {void}
     */
    EditorHistory.prototype.updateHistory = function () {
        if (this.documentHelper.owner.enableHistoryMode && !isNullOrUndefined(this.currentBaseHistoryInfo)) {
            //Updates the current end position
            if (!isNullOrUndefined(this.currentBaseHistoryInfo)
                && isNullOrUndefined(this.currentBaseHistoryInfo.endPosition)) {
                this.currentBaseHistoryInfo.endPosition = this.currentBaseHistoryInfo.insertPosition;
            }
            if (!isNullOrUndefined(this.currentHistoryInfo)) {
                this.currentHistoryInfo.addModifiedAction(this.currentBaseHistoryInfo);
            }
            else {
                this.recordChanges(this.currentBaseHistoryInfo);
            }
            this.currentBaseHistoryInfo = undefined;
        }
    };
    /**
     * @private
     * @returns {boolean} -Returns isHandleComplexHistory
     */
    EditorHistory.prototype.isHandledComplexHistory = function () {
        var isHandledComplexHistory = false;
        if (!(this.isUndoing || this.isRedoing)) {
            isHandledComplexHistory = this.owner.editorModule.insertRemoveBookMarkElements();
        }
        if (this.documentHelper.owner.enableHistoryMode && !isNullOrUndefined(this.currentHistoryInfo)) {
            this.updateHistory();
            isHandledComplexHistory = true;
        }
        else if (this.owner.editorModule.isHandledComplex) {
            isHandledComplexHistory = true;
        }
        return isHandledComplexHistory;
    };
    /**
     * Update complex history
     *
     * @private
     * @returns {void}
     */
    EditorHistory.prototype.updateComplexHistory = function () {
        var selection = this.documentHelper.selection;
        if (this.currentHistoryInfo.hasAction) {
            if (this.currentHistoryInfo.action === 'AutoFormatHyperlink' || this.currentHistoryInfo.action === 'SkipCommentInline'
                || this.currentHistoryInfo.action === 'DeleteCommentInline') {
                var startPosition = new TextPosition(selection.owner);
                this.owner.editorModule.setPositionForCurrentIndex(startPosition, this.currentHistoryInfo.insertPosition);
                // this.reLayoutParagraph(startPosition.paragraph, 0);
                if (selection.owner.editorHistory.isUndoing) {
                    this.owner.editorModule.setPositionForCurrentIndex(selection.start, this.currentHistoryInfo.selectionStart);
                    this.owner.editorModule.setPositionForCurrentIndex(selection.end, this.currentHistoryInfo.selectionEnd);
                }
                else {
                    this.owner.editorModule.setPositionForCurrentIndex(selection.start, this.currentHistoryInfo.endPosition);
                    this.owner.editorModule.setPositionForCurrentIndex(selection.end, this.currentHistoryInfo.endPosition);
                }
            }
            if (this.currentHistoryInfo.action === 'InsertHyperlink') {
                var startPosition = new TextPosition(selection.owner);
                this.owner.editorModule.setPositionForCurrentIndex(startPosition, this.currentHistoryInfo.insertPosition);
                var endPosition = new TextPosition(selection.owner);
                this.owner.editorModule.setPositionForCurrentIndex(endPosition, this.currentHistoryInfo.endPosition);
                this.documentHelper.layout.reLayoutParagraph(startPosition.paragraph, 0, 0);
                if (endPosition.paragraph !== startPosition.paragraph) {
                    this.documentHelper.layout.reLayoutParagraph(endPosition.paragraph, 0, 0);
                }
            }
            if (this.currentHistoryInfo.action === 'ReplaceAll') {
                this.owner.editorModule.layoutWholeDocument();
            }
            else if (selection.owner.isShiftingEnabled) {
                this.documentHelper.layout.shiftLayoutedItems(false);
                if (this.owner.enableHeaderAndFooter) {
                    this.owner.editorModule.updateHeaderFooterWidget();
                }
                this.documentHelper.removeEmptyPages();
            }
        }
        if (this.owner.showRevisions) {
            this.owner.trackChangesPane.updateTrackChanges();
        }
        selection.owner.isShiftingEnabled = false;
        selection.owner.isLayoutEnabled = true;
        // // selection.addMultipleSelectionRanges();
        if (this.currentHistoryInfo.action === 'ApplyStyle') {
            this.owner.editor.getOffsetValue(selection);
        }
        else {
            selection.start.updatePhysicalPosition(true);
            if (selection.isEmpty) {
                selection.end.setPositionInternal(selection.start);
            }
            else {
                selection.end.updatePhysicalPosition(true);
            }
        }
        selection.upDownSelectionLength = selection.end.location.x;
        this.documentHelper.isScrollHandler = true;
        this.viewer.updateScrollBars();
        selection.fireSelectionChanged(true);
        this.documentHelper.isScrollHandler = false;
        this.documentHelper.updateFocus();
        this.updateComplexHistoryInternal();
        this.owner.editorModule.fireContentChange();
    };
    /**
     * @private
     *
     * @returns {void}
     */
    EditorHistory.prototype.updateComplexHistoryInternal = function () {
        if (!isNullOrUndefined(this.currentHistoryInfo)) {
            //Updates the current end position
            if (isNullOrUndefined(this.currentHistoryInfo.endPosition)) {
                this.currentHistoryInfo.endPosition = this.currentHistoryInfo.insertPosition;
            }
            if (this.historyInfoStack.length > 1) {
                var historyInfo = this.historyInfoStack[this.historyInfoStack.length - 2];
                historyInfo.addModifiedAction(this.currentHistoryInfo);
            }
            else {
                this.recordChanges(this.currentHistoryInfo);
            }
            this.currentHistoryInfo = undefined;
        }
    };
    //List history preservation undo API
    /**
     * update list changes for history preservation
     *
     * @private
     * @param  {WAbstractList} currentAbstractList - Specfies the abstractlist.
     * @param  {WList} list - Specifies the list.
     * @returns {Dictionary<number, ModifiedLevel>} - Returns the modified action.
     */
    EditorHistory.prototype.updateListChangesInHistory = function (currentAbstractList, list) {
        this.currentBaseHistoryInfo = new BaseHistoryInfo(this.documentHelper.owner);
        this.currentBaseHistoryInfo.action = 'List';
        this.currentBaseHistoryInfo.updateSelection();
        var collection = new Dictionary();
        for (var i = 0; i < currentAbstractList.levels.length; i++) {
            var levels = this.documentHelper.getAbstractListById(list.abstractListId).levels[i];
            this.currentBaseHistoryInfo.addModifiedPropertiesForList(levels);
            var modifiedLevel = new ModifiedLevel(levels, currentAbstractList.levels[i]);
            if (!isNullOrUndefined(levels)) {
                this.documentHelper.owner.editorModule.copyListLevel(levels, currentAbstractList.levels[i]);
            }
            collection.add(i, modifiedLevel);
        }
        return collection;
    };
    /**
     * Apply list changes
     *
     * @private
     * @param  {Selection} selection - Specifies the selection.
     * @param  {Dictionary<number, ModifiedLevel>} modifiedLevelsInternal - Specifies the modified levels.
     * @returns {void}
     */
    EditorHistory.prototype.applyListChanges = function (selection, modifiedLevelsInternal) {
        if (isNullOrUndefined(this.modifiedParaFormats)) {
            this.modifiedParaFormats = new Dictionary();
        }
        var collection = [];
        for (var i = 0; i < this.documentHelper.listParagraphs.length; i++) {
            var paragraph = this.documentHelper.listParagraphs[i];
            var paraFormat = paragraph.paragraphFormat;
            var currentList = this.documentHelper.getListById(paraFormat.listFormat.listId);
            var listLevel = this.documentHelper.layout.getListLevel(currentList, paraFormat.listFormat.listLevelNumber);
            if (modifiedLevelsInternal.containsKey(paraFormat.listFormat.listLevelNumber)
                && modifiedLevelsInternal.get(paraFormat.listFormat.listLevelNumber).ownerListLevel === listLevel) {
                var modifiedFormat = new WParagraphFormat(null);
                modifiedFormat.leftIndent = paraFormat.leftIndent;
                modifiedFormat.firstLineIndent = paraFormat.firstLineIndent;
                var modified = new ModifiedParagraphFormat(paraFormat, modifiedFormat);
                collection.push(modified);
                this.owner.editorModule.copyFromListLevelParagraphFormat(paraFormat, listLevel.paragraphFormat);
            }
        }
        this.modifiedParaFormats.add(this.currentBaseHistoryInfo, collection);
    };
    /**
     * Update list changes
     *
     * @private
     * @param  {Dictionary<number, ModifiedLevel>} modifiedCollection - Specifies the modified colection.
     * @returns {void }
     */
    EditorHistory.prototype.updateListChanges = function (modifiedCollection) {
        this.documentHelper.owner.isLayoutEnabled = false;
        this.owner.editorModule.updateListParagraphs();
        for (var i = 0; i < modifiedCollection.keys.length; i++) {
            var levelNumber = modifiedCollection.keys[0];
            var modifiedLevel = modifiedCollection.get(levelNumber);
            if (!isNullOrUndefined(this.currentBaseHistoryInfo)) {
                modifiedLevel = this.currentBaseHistoryInfo.addModifiedPropertiesForList(modifiedLevel.ownerListLevel);
            }
            this.owner.editorModule.copyListLevel(modifiedLevel.ownerListLevel, modifiedLevel.modifiedListLevel);
        }
        this.revertListChanges();
        this.documentHelper.owner.isLayoutEnabled = true;
        this.documentHelper.renderedLists.clear();
        this.documentHelper.renderedLevelOverrides = [];
        this.documentHelper.pages = [];
        this.documentHelper.layout.layout();
        var selection = this.documentHelper.selection;
        selection.start.updatePhysicalPosition(true);
        if (selection.isEmpty) {
            selection.end.setPositionInternal(selection.start);
        }
        else {
            selection.end.updatePhysicalPosition(true);
        }
        selection.upDownSelectionLength = selection.end.location.x;
        selection.fireSelectionChanged(false);
        this.updateHistory();
    };
    /**
     * Revert list changes
     *
     * @returns {void}
     */
    EditorHistory.prototype.revertListChanges = function () {
        if (!isNullOrUndefined(this.currentBaseHistoryInfo)
            && this.documentHelper.owner.editorHistory.modifiedParaFormats.containsKey(this.currentBaseHistoryInfo)) {
            var collection = this.modifiedParaFormats.get(this.currentBaseHistoryInfo);
            for (var i = 0; i < collection.length; i++) {
                var modified = new WParagraphFormat(null);
                modified.leftIndent = collection[i].ownerFormat.leftIndent;
                modified.firstLineIndent = collection[i].ownerFormat.firstLineIndent;
                collection[i].ownerFormat.copyFormat(collection[i].modifiedFormat);
                collection[i].modifiedFormat.leftIndent = modified.leftIndent;
                collection[i].modifiedFormat.firstLineIndent = modified.firstLineIndent;
            }
        }
    };
    /**
     * Reverts the last editing action.
     *
     * @returns {void}
     */
    EditorHistory.prototype.undo = function () {
        if ((this.owner.isReadOnlyMode &&
            (this.owner.documentHelper.protectionType !== 'FormFieldsOnly')) ||
            !this.canUndo() || !this.owner.enableHistoryMode) {
            return;
        }
        //this.owner.ClearTextSearchResults();
        var historyInfo = this.undoStack.pop();
        this.isUndoing = true;
        historyInfo.revert();
        this.isUndoing = false;
        this.owner.selection.checkForCursorVisibility();
        this.owner.editorModule.isBordersAndShadingDialog = false;
    };
    /**
     * Performs the last reverted action.
     *
     * @returns {void}
     */
    EditorHistory.prototype.redo = function () {
        if ((this.owner.isReadOnlyMode &&
            (this.owner.documentHelper.protectionType !== 'FormFieldsOnly'))
            || !this.canRedo() || !this.owner.enableHistoryMode) {
            return;
        }
        //this.owner.ClearTextSearchResults();
        var historyInfo = this.redoStack.pop();
        if (historyInfo.action === 'BordersAndShading') {
            this.owner.editorModule.isBordersAndShadingDialog = true;
        }
        this.isRedoing = true;
        historyInfo.revert();
        this.isRedoing = false;
        this.owner.selection.checkForCursorVisibility();
        this.owner.editorModule.isBordersAndShadingDialog = false;
    };
    /**
     * @private
     * @returns {void}
     */
    EditorHistory.prototype.destroy = function () {
        this.clearHistory();
        this.undoStackIn = undefined;
        this.redoStackIn = undefined;
    };
    /**
     * @private
     * @returns {void}
     */
    EditorHistory.prototype.clearHistory = function () {
        this.clearUndoStack();
        this.clearRedoStack();
    };
    EditorHistory.prototype.clearUndoStack = function () {
        if (this.canUndo()) {
            while (this.undoStack.length > 0) {
                var historyInfo = this.undoStack.pop();
                historyInfo.destroy();
                historyInfo = undefined;
            }
        }
    };
    EditorHistory.prototype.clearRedoStack = function () {
        if (this.canRedo()) {
            while (this.redoStack.length > 0) {
                var historyInfo = this.redoStack.pop();
                historyInfo.destroy();
                historyInfo = undefined;
            }
        }
    };
    return EditorHistory;
}());
export { EditorHistory };
