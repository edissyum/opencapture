import { WTableHolder } from '../viewer/page';
/**
 * @private
 */
var ModifiedLevel = /** @class */ (function () {
    function ModifiedLevel(owner, modified) {
        this.ownerListLevelIn = undefined;
        this.modifiedListLevelIn = undefined;
        this.ownerListLevel = owner;
        this.modifiedListLevel = modified;
    }
    Object.defineProperty(ModifiedLevel.prototype, "ownerListLevel", {
        get: function () {
            return this.ownerListLevelIn;
        },
        set: function (value) {
            this.ownerListLevelIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModifiedLevel.prototype, "modifiedListLevel", {
        get: function () {
            return this.modifiedListLevelIn;
        },
        set: function (value) {
            this.modifiedListLevelIn = value;
        },
        enumerable: true,
        configurable: true
    });
    ModifiedLevel.prototype.destroy = function () {
        this.ownerListLevel = undefined;
        this.modifiedListLevel = undefined;
    };
    return ModifiedLevel;
}());
export { ModifiedLevel };
/**
 * @private
 */
var ModifiedParagraphFormat = /** @class */ (function () {
    function ModifiedParagraphFormat(ownerFormat, modifiedFormat) {
        this.ownerFormatIn = undefined;
        this.modifiedFormatIn = undefined;
        this.ownerFormat = ownerFormat;
        this.modifiedFormat = modifiedFormat;
    }
    Object.defineProperty(ModifiedParagraphFormat.prototype, "ownerFormat", {
        get: function () {
            return this.ownerFormatIn;
        },
        set: function (value) {
            this.ownerFormatIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModifiedParagraphFormat.prototype, "modifiedFormat", {
        get: function () {
            return this.modifiedFormatIn;
        },
        set: function (value) {
            this.modifiedFormatIn = value;
        },
        enumerable: true,
        configurable: true
    });
    ModifiedParagraphFormat.prototype.destroy = function () {
        this.ownerFormat = undefined;
        this.modifiedFormat.destroy();
        this.modifiedFormat = undefined;
    };
    return ModifiedParagraphFormat;
}());
export { ModifiedParagraphFormat };
/**
 * @private
 */
var RowHistoryFormat = /** @class */ (function () {
    function RowHistoryFormat(startingPoint, rowFormat) {
        this.startingPoint = startingPoint;
        this.rowFormat = rowFormat;
        this.rowHeightType = rowFormat.heightType;
    }
    RowHistoryFormat.prototype.revertChanges = function (isRedo, owner) {
        //backup current format values.
        var currentRowHeightType = this.rowFormat.heightType;
        //Restore old values.
        owner.editorModule.tableResize.updateRowHeight(this.rowFormat.ownerBase, isRedo ? this.displacement : (-this.displacement));
        owner.documentHelper.layout.reLayoutTable(this.rowFormat.ownerBase.ownerTable);
        if (this.rowFormat.heightType !== this.rowHeightType) {
            this.rowFormat.heightType = this.rowHeightType;
        }
        //backup the current format values for redo.
        this.rowHeightType = currentRowHeightType;
    };
    return RowHistoryFormat;
}());
export { RowHistoryFormat };
/**
 * @private
 */
var TableHistoryInfo = /** @class */ (function () {
    function TableHistoryInfo(table, owner) {
        this.tableHolder = new WTableHolder();
        this.tableFormat = new TableFormatHistoryInfo();
        this.rows = [];
        this.owner = owner;
        this.copyProperties(table);
    }
    TableHistoryInfo.prototype.copyProperties = function (table) {
        if (table.tableHolder) {
            this.tableHolder = table.tableHolder.clone();
        }
        if (table.tableFormat) {
            this.tableFormat.leftIndent = table.tableFormat.leftIndent;
            this.tableFormat.preferredWidth = table.tableFormat.preferredWidth;
            this.tableFormat.preferredWidthType = table.tableFormat.preferredWidthType;
            this.tableFormat.allowAutoFit = table.tableFormat.allowAutoFit;
        }
        for (var i = 0; i < table.childWidgets.length; i++) {
            var row = table.childWidgets[i];
            var rowFormat = new RowFormatHistoryInfo();
            rowFormat.gridBefore = row.rowFormat.gridBefore;
            rowFormat.gridBeforeWidth = row.rowFormat.gridBeforeWidth;
            rowFormat.gridBeforeWidthType = row.rowFormat.gridBeforeWidthType;
            rowFormat.gridAfter = row.rowFormat.gridAfter;
            rowFormat.gridAfterWidth = row.rowFormat.gridAfterWidth;
            rowFormat.gridAfterWidthType = row.rowFormat.gridAfterWidthType;
            for (var j = 0; j < row.childWidgets.length; j++) {
                var cell = row.childWidgets[j];
                var cellFormat = new CellFormatHistoryInfo();
                cellFormat.columnIndex = cell.columnIndex;
                cellFormat.columnSpan = cell.cellFormat.columnSpan;
                cellFormat.preferredWidth = cell.cellFormat.preferredWidth;
                cellFormat.preferredWidthType = cell.cellFormat.preferredWidthType;
                rowFormat.cells.push(cellFormat);
            }
            this.rows.push(rowFormat);
        }
        this.tableHierarchicalIndex = this.owner.selection.getHierarchicalIndex(table, '0');
    };
    TableHistoryInfo.prototype.destroy = function () {
        this.tableHierarchicalIndex = undefined;
        if (this.tableHolder) {
            this.tableHolder.destroy();
            this.tableHolder = undefined;
        }
        if (this.tableFormat) {
            this.tableFormat = null;
        }
        if (this.rows) {
            this.rows = [];
            this.rows = undefined;
        }
    };
    return TableHistoryInfo;
}());
export { TableHistoryInfo };
/**
 * @private
 */
var TableFormatHistoryInfo = /** @class */ (function () {
    function TableFormatHistoryInfo() {
    }
    return TableFormatHistoryInfo;
}());
export { TableFormatHistoryInfo };
/**
 * @private
 */
var RowFormatHistoryInfo = /** @class */ (function () {
    function RowFormatHistoryInfo() {
        this.cells = [];
    }
    return RowFormatHistoryInfo;
}());
export { RowFormatHistoryInfo };
/**
 * @private
 */
var CellFormatHistoryInfo = /** @class */ (function () {
    function CellFormatHistoryInfo() {
    }
    return CellFormatHistoryInfo;
}());
export { CellFormatHistoryInfo };
/**
 * @private
 */
var CellHistoryFormat = /** @class */ (function () {
    function CellHistoryFormat(point) {
        this.startingPoint = point; // starting point preserved to calculate the displacement on after cell resizing finished.
    }
    return CellHistoryFormat;
}());
export { CellHistoryFormat };
