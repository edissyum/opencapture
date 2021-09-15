import { TableWidget } from '../index';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { Point, HelperMethods } from './editor-helper';
/**
 * @private
 */
var TableResizer = /** @class */ (function () {
    function TableResizer(node) {
        this.resizeNode = 0;
        this.resizerPosition = -1;
        this.currentResizingTable = undefined;
        this.owner = node;
        this.documentHelper = this.owner.documentHelper;
        this.startingPoint = new Point(0, 0);
    }
    Object.defineProperty(TableResizer.prototype, "viewer", {
        get: function () {
            return this.owner.viewer;
        },
        enumerable: true,
        configurable: true
    });
    TableResizer.prototype.getModuleName = function () {
        return 'TableResizer';
    };
    TableResizer.prototype.updateResizingHistory = function (touchPoint) {
        if (this.owner.editorHistory) {
            this.owner.editorHistory.updateResizingHistory(touchPoint, this);
        }
        this.documentHelper.isRowOrCellResizing = false;
        this.resizerPosition = -1;
    };
    TableResizer.prototype.handleResize = function (point) {
        this.owner.documentHelper.isRowOrCellResizing = true;
        this.startingPoint.x = point.x;
        this.startingPoint.y = point.y;
        //Initialize resizing history.
        this.owner.editorHistory.initResizingHistory(point, this);
    };
    //Table Resizing implementation starts
    TableResizer.prototype.isInRowResizerArea = function (touchPoint) {
        var position = this.getRowReSizerPosition(undefined, touchPoint);
        if (position === -1) {
            return false;
        }
        else {
            this.resizeNode = 1;
            this.resizerPosition = position;
            return true;
        }
    };
    TableResizer.prototype.isInCellResizerArea = function (touchPoint) {
        var position = this.getCellReSizerPosition(touchPoint);
        if (position === -1) {
            return false;
        }
        else {
            this.resizeNode = 0;
            this.resizerPosition = position;
            return true;
        }
    };
    TableResizer.prototype.getCellReSizerPosition = function (touchPoint) {
        var position = -1;
        var resizerBoundaryWidth = 2;
        var tableWidget = this.getTableWidget(touchPoint);
        var cellWidget = this.getTableCellWidget(touchPoint);
        var cellSpacing = isNullOrUndefined(tableWidget) ? 0 : tableWidget.tableFormat.cellSpacing;
        if (tableWidget && cellSpacing > 0) {
            this.currentResizingTable = tableWidget;
            /* eslint-disable-next-line max-len */
            if (this.documentHelper.isInsideRect(tableWidget.x - HelperMethods.convertPointToPixel(tableWidget.leftBorderWidth) - 0.25, tableWidget.y, HelperMethods.convertPointToPixel(tableWidget.leftBorderWidth) + 0.5, tableWidget.height, touchPoint)) {
                return position = 0;
            }
            var startingPointX = tableWidget.x;
            for (var i = 0; i < tableWidget.tableHolder.columns.length; i++) {
                var preferredWidth = HelperMethods.convertPointToPixel(tableWidget.tableHolder.columns[i].preferredWidth);
                /* eslint-disable-next-line max-len */
                if ((this.documentHelper.isInsideRect(startingPointX - 1, tableWidget.y, tableWidget.leftBorderWidth + resizerBoundaryWidth, tableWidget.height, touchPoint))) {
                    return position = i > 0 ? i : 0;
                    /* eslint-disable-next-line max-len */
                }
                else if (i > 0 && (this.documentHelper.isInsideRect(startingPointX + preferredWidth - resizerBoundaryWidth / 2, tableWidget.y, resizerBoundaryWidth, tableWidget.height, touchPoint))) {
                    return position = (i + 1);
                }
                startingPointX = startingPointX + preferredWidth;
            }
        }
        else {
            if (!isNullOrUndefined(cellWidget)) {
                this.currentResizingTable = cellWidget.ownerTable;
                /* eslint-disable-next-line max-len */
                if (this.documentHelper.isInsideRect(cellWidget.x - cellWidget.margin.left - resizerBoundaryWidth / 2, cellWidget.y - cellWidget.margin.top, resizerBoundaryWidth, cellWidget.height + cellWidget.margin.top + cellWidget.margin.bottom, touchPoint)) {
                    return position = cellWidget.columnIndex;
                }
                else if (isNullOrUndefined(cellWidget.nextRenderedWidget)
                    /* eslint-disable-next-line max-len */
                    && this.documentHelper.isInsideRect(cellWidget.x + cellWidget.margin.right + cellWidget.width - resizerBoundaryWidth / 2, cellWidget.y - cellWidget.margin.top, resizerBoundaryWidth, cellWidget.height + cellWidget.margin.top + cellWidget.margin.bottom, touchPoint)) {
                    return position = (cellWidget.columnIndex + cellWidget.cellFormat.columnSpan);
                }
                else if (cellWidget.childWidgets.length > 0) {
                    return this.getCellReSizerPositionInternal(cellWidget, touchPoint); // Gets the nested table resizer position.
                }
            }
        }
        return position;
    };
    TableResizer.prototype.getCellReSizerPositionInternal = function (cellWidget, touchPoint) {
        var position = -1;
        var childTableWidget = this.getTableWidgetFromWidget(touchPoint, cellWidget);
        var childCellWidget = undefined;
        if (!isNullOrUndefined(childTableWidget) && childTableWidget.tableFormat.cellSpacing > 0) {
            this.currentResizingTable = childTableWidget;
            /* eslint-disable-next-line max-len */
            if (this.documentHelper.isInsideRect(childTableWidget.x - childTableWidget.leftBorderWidth - 0.25, childTableWidget.y, childTableWidget.leftBorderWidth + 0.5, childTableWidget.height, touchPoint)) {
                return position = 0;
            }
            var startingPointX = childTableWidget.x;
            for (var i = 0; i < childTableWidget.tableHolder.columns.length; i++) {
                var preferredWidth = HelperMethods.convertPointToPixel(childTableWidget.tableHolder.columns[i].preferredWidth);
                /* eslint-disable-next-line max-len */
                if ((this.documentHelper.isInsideRect(startingPointX - 1, childTableWidget.y, childTableWidget.leftBorderWidth + 2, childTableWidget.height, touchPoint))) {
                    return position = i > 0 ? i : 0;
                    /* eslint-disable-next-line max-len */
                }
                else if (i > 0 && (this.documentHelper.isInsideRect(startingPointX + preferredWidth - 1, childTableWidget.y, 2, childTableWidget.height, touchPoint))) {
                    return position = (i + 1);
                }
                startingPointX = startingPointX + preferredWidth;
            }
        }
        else {
            if (!isNullOrUndefined(childTableWidget)) {
                childCellWidget = childTableWidget.getTableCellWidget(touchPoint);
            }
            if (!isNullOrUndefined(childCellWidget)) {
                this.currentResizingTable = childCellWidget.ownerTable;
                /* eslint-disable-next-line max-len */
                if (this.documentHelper.isInsideRect(childCellWidget.x - childCellWidget.margin.left - 1, childCellWidget.y - childCellWidget.margin.top, 2, childCellWidget.height, touchPoint)) {
                    return position = childCellWidget.columnIndex;
                }
                else if (isNullOrUndefined(childCellWidget.nextRenderedWidget)
                    /* eslint-disable-next-line max-len */
                    && this.documentHelper.isInsideRect(childCellWidget.x + childCellWidget.margin.right + childCellWidget.width - 1, childCellWidget.y - childCellWidget.margin.top, 2, childCellWidget.height, touchPoint)) {
                    return position = (childCellWidget.columnIndex + childCellWidget.cellFormat.columnSpan);
                }
                else if (childCellWidget.childWidgets.length > 0) {
                    return this.getCellReSizerPositionInternal(childCellWidget, touchPoint);
                }
            }
        }
        return position;
    };
    TableResizer.prototype.getRowReSizerPosition = function (widget, touchPoint) {
        var tableWidget = undefined;
        var cellWidget = undefined;
        if (isNullOrUndefined(widget)) {
            tableWidget = this.getTableWidget(touchPoint);
            cellWidget = this.getTableCellWidget(touchPoint);
        }
        else {
            tableWidget = this.getTableWidgetFromWidget(touchPoint, widget);
        }
        var cellSpacing = isNullOrUndefined(tableWidget) ? 0 : tableWidget.tableFormat.cellSpacing;
        if (tableWidget && cellSpacing > 0) {
            this.currentResizingTable = tableWidget;
            /* eslint-disable-next-line max-len */
            if (this.owner.documentHelper.isInsideRect(tableWidget.x, tableWidget.y + tableWidget.height - cellSpacing, this.getActualWidth(tableWidget.lastChild), (isNullOrUndefined(tableWidget.nextSplitWidget) ? tableWidget.bottomBorderWidth + cellSpacing : 0), touchPoint)) {
                return tableWidget.lastChild.rowIndex;
            }
            for (var i = 0; i < tableWidget.childWidgets.length; i++) {
                //Need to consider for splitted widgets
                var rowWidget = tableWidget.childWidgets[i];
                if (tableWidget.childWidgets.indexOf(rowWidget) > -1
                    /* eslint-disable-next-line max-len */
                    && (this.owner.documentHelper.isInsideRect(rowWidget.x, rowWidget.y + rowWidget.height + cellSpacing / 2, this.getActualWidth(rowWidget), cellSpacing / 2, touchPoint))) {
                    return rowWidget.rowIndex;
                }
            }
        }
        else {
            if (tableWidget && cellWidget) {
                cellWidget = this.getTableCellWidget(touchPoint);
            }
            if (cellWidget) {
                var rowWidget = cellWidget.containerWidget;
                var height = 0;
                if (rowWidget.rowIndex === rowWidget.ownerTable.childWidgets.length - 1) {
                    height = rowWidget.bottomBorderWidth + 2;
                }
                else {
                    height = rowWidget.nextRenderedWidget.topBorderWidth + 2;
                }
                /* eslint-disable-next-line max-len */
                if (this.owner.documentHelper.isInsideRect(rowWidget.x, rowWidget.y + rowWidget.height - height, rowWidget.width, height * 2, touchPoint)) {
                    this.currentResizingTable = rowWidget.ownerTable;
                    return rowWidget.rowIndex;
                }
                else {
                    if (cellWidget.childWidgets.length > 0) {
                        return this.getRowReSizerPosition(cellWidget, touchPoint);
                    }
                }
            }
        }
        return -1;
    };
    TableResizer.prototype.handleResizing = function (touchPoint) {
        var dragValue = 0;
        if (this.resizeNode === 0) {
            dragValue = touchPoint.x - this.startingPoint.x;
            this.resizeTableCellColumn(dragValue);
        }
        else {
            dragValue = touchPoint.y - this.startingPoint.y;
            this.resizeTableRow(dragValue);
        }
    };
    TableResizer.prototype.resizeTableRow = function (dragValue) {
        var table = this.currentResizingTable;
        if (isNullOrUndefined(table) || dragValue === 0 || this.resizerPosition === -1) {
            return;
        }
        var selection = this.owner.selection;
        if (table.isInsideTable) {
            this.owner.isLayoutEnabled = false; //Layouting is disabled to skip the child table layouting.
        }
        var row = undefined;
        if (this.resizerPosition > -1) {
            row = table.childWidgets[this.resizerPosition];
            if (row) {
                this.updateRowHeight(row, dragValue);
            }
            selection.selectPosition(selection.start, selection.end);
        }
        if (table.isInsideTable) {
            var parentTable = this.owner.documentHelper.layout.getParentTable(table);
            this.owner.isLayoutEnabled = true; //layouting is enabled to layout the parent table of the nested table.
            table = parentTable;
        }
        this.startingPoint.y += HelperMethods.convertPointToPixel(dragValue);
        this.owner.documentHelper.layout.reLayoutTable(table);
        this.owner.editorModule.reLayout(this.owner.selection);
        if (row) {
            this.getRowReSizerPosition(undefined, this.startingPoint);
        }
        if (this.currentResizingTable && (this.currentResizingTable.childWidgets === undefined
            || this.currentResizingTable.childWidgets[this.resizerPosition] === undefined)) {
            this.resizerPosition = -1;
        }
    };
    TableResizer.prototype.getTableWidget = function (cursorPoint) {
        var widget = undefined;
        var currentPage = this.owner.documentHelper.currentPage;
        if (!isNullOrUndefined(currentPage)) {
            for (var i = 0; i < currentPage.bodyWidgets.length; i++) {
                var bodyWidget = currentPage.bodyWidgets[i];
                widget = this.getTableWidgetFromWidget(cursorPoint, bodyWidget);
                if (!isNullOrUndefined(widget)) {
                    break;
                }
            }
        }
        return widget;
    };
    TableResizer.prototype.getTableWidgetFromWidget = function (point, widget) {
        for (var j = 0; j < widget.childWidgets.length; j++) {
            if (widget.childWidgets[j] instanceof TableWidget) {
                var childWidget = widget.childWidgets[j];
                var tableWidth = 0;
                if (childWidget.wrapTextAround) {
                    tableWidth = childWidget.getTableCellWidth();
                }
                if (!(childWidget.wrapTextAround) && childWidget.y <= point.y && (childWidget.y + childWidget.height) >= point.y) {
                    return childWidget;
                }
                if ((childWidget.wrapTextAround &&
                    (childWidget.x <= point.x && (childWidget.x + tableWidth) >= point.x &&
                        childWidget.y <= point.y && (childWidget.y + childWidget.height) >= point.y))) {
                    return childWidget;
                }
            }
        }
        return undefined;
    };
    TableResizer.prototype.getTableCellWidget = function (cursorPoint) {
        var widget = undefined;
        var currentPage = this.owner.documentHelper.currentPage;
        if (!isNullOrUndefined(currentPage)) {
            for (var i = 0; i < currentPage.bodyWidgets.length; i++) {
                var bodyWidget = currentPage.bodyWidgets[i];
                widget = bodyWidget.getTableCellWidget(cursorPoint);
                if (!isNullOrUndefined(widget)) {
                    break;
                }
            }
        }
        return widget;
    };
    TableResizer.prototype.updateRowHeight = function (row, dragValue) {
        var rowFormat = row.rowFormat;
        if (rowFormat.heightType === 'Auto') {
            rowFormat.heightType = 'AtLeast';
            var row_1 = rowFormat.ownerBase;
            var currentHeight = this.owner.documentHelper.layout.getRowHeight(row_1, [row_1]);
            //the minimum height of the Row in MS word is 2.7 points which is equal to 3.6 pixel.
            if (currentHeight + dragValue >= 2.7 && rowFormat.height !== currentHeight + dragValue) {
                rowFormat.height = currentHeight + dragValue;
            }
        }
        else {
            //the minimum height of the Row in MS word is 2.7 points which is equal to 3.6 pixel.
            if (rowFormat.height + dragValue >= 2.7 && rowFormat.height !== rowFormat.height + dragValue) {
                rowFormat.height = rowFormat.height + dragValue;
            }
        }
    };
    //Resize Table cell
    TableResizer.prototype.resizeTableCellColumn = function (dragValue) {
        var table = this.currentResizingTable;
        if (isNullOrUndefined(table) || dragValue === 0 || isNullOrUndefined(table.childWidgets) || this.resizerPosition < 0) {
            return;
        }
        var selectionFlag = true;
        var selection = this.owner.selection;
        this.owner.editor.setOffsetValue(selection);
        table = table.combineWidget(this.viewer);
        this.owner.isLayoutEnabled = false;
        // table.PreserveGrid = true;
        this.setPreferredWidth(table);
        var containerWidth = table.getOwnerWidth(true);
        var newIndent = table.leftIndent;
        var tableAlignment = table.tableFormat.tableAlignment;
        if (!selection.isEmpty) {
            selectionFlag = this.resizeColumnWithSelection(selection, table, dragValue);
        }
        if (!selectionFlag) {
            this.owner.isLayoutEnabled = true;
            return;
        }
        if (this.resizerPosition === 0) {
            // Todo: need to handle the resizing of first column and table indent.
            var columnIndex = this.resizerPosition;
            var rightColumn = table.tableHolder.columns[columnIndex];
            var width = rightColumn.preferredWidth;
            if (dragValue > 0) {
                var prevDragValue = dragValue;
                do {
                    var newWidth = HelperMethods.round(rightColumn.preferredWidth - dragValue, 1);
                    if (newWidth >= rightColumn.minWidth) {
                        rightColumn.preferredWidth = newWidth;
                        newIndent = table.leftIndent + dragValue;
                        newIndent = newIndent >= -1440 ? (newIndent <= 1440 ? newIndent : 1440) : -1440;
                        break;
                    }
                    else {
                        prevDragValue = dragValue;
                        dragValue += newWidth - rightColumn.minWidth;
                    }
                } while (dragValue !== prevDragValue);
            }
            else {
                var prevDragValue = dragValue;
                do {
                    var newWidth = HelperMethods.round(rightColumn.preferredWidth - dragValue, 1);
                    if (newWidth <= 2112) {
                        rightColumn.preferredWidth = newWidth;
                        newIndent = table.leftIndent + dragValue;
                        newIndent = newIndent >= -1440 ? (newIndent <= 1440 ? newIndent : 1440) : -1440;
                        break;
                    }
                    else {
                        prevDragValue = dragValue;
                        dragValue -= newWidth - 2112;
                    }
                } while (dragValue !== prevDragValue);
            }
            var dragOffset = dragValue;
            if (tableAlignment !== 'Left' && (table.tableHolder.getTotalWidth(0) > containerWidth) && table.tableFormat.preferredWidthType === 'Auto') {
                if (table.tableHolder.isFitColumns(containerWidth, table.tableHolder.tableWidth, table.tableFormat.preferredWidthType === 'Auto')) {
                    table.tableHolder.fitColumns(containerWidth, table.tableHolder.tableWidth, table.tableFormat.preferredWidthType === 'Auto');
                }
                else {
                    rightColumn.preferredWidth = width;
                }
                dragOffset = 0;
            }
            if (tableAlignment === 'Center'
                && (table.tableHolder.getTotalWidth(0) < containerWidth || table.tableFormat.preferredWidthType !== 'Auto')) {
                dragOffset = dragOffset / 2;
            }
            table.tableFormat.leftIndent = tableAlignment === 'Left' ? newIndent : 0;
            table.tableHolder.tableWidth = table.tableHolder.getTotalWidth(0);
            this.updateCellPreferredWidths(table);
            this.updateGridValue(table, true, dragOffset);
        }
        else if (table !== null && this.resizerPosition === table.tableHolder.columns.length) {
            // Todo: need to handle the resizing of last column and table width.
            this.resizeColumnAtLastColumnIndex(table, dragValue, containerWidth);
        }
        else {
            if (this.resizerPosition === -1) {
                this.owner.isLayoutEnabled = true;
                return;
            }
            this.resizeCellAtMiddle(table, dragValue);
        }
        // table.PreserveGrid = false;
        this.owner.isLayoutEnabled = true;
        selection.selectPosition(selection.start, selection.end);
    };
    TableResizer.prototype.resizeColumnWithSelection = function (selection, table, dragValue) {
        //const newIndent: number = table.leftIndent;
        var cellwidget = this.getTableCellWidget(this.startingPoint);
        if (cellwidget && (selection.selectedWidgets.containsKey(cellwidget) || (cellwidget.previousWidget
            && selection.selectedWidgets.containsKey((cellwidget.previousWidget))))) {
            var selectedCells = selection.getSelectedCells();
            if (this.resizerPosition === 0) {
                this.resizeColumnAtStart(table, dragValue, selectedCells);
            }
            else if (table !== null && this.resizerPosition === table.tableHolder.columns.length) {
                var leftColumnCollection = this.getColumnCells(table, this.resizerPosition, true);
                for (var i = 0; i < leftColumnCollection.length; i++) {
                    var cell = leftColumnCollection[i];
                    if (selectedCells.indexOf(cell) !== -1) {
                        this.increaseOrDecreaseWidth(cell, dragValue, true);
                    }
                }
                //Updates the grid after value for all the rows.
                this.updateRowsGridAfterWidth(table);
                table.updateWidth(dragValue);
                table.tableFormat.allowAutoFit = false;
                this.updateGridValue(table, true, dragValue);
            }
            else {
                if (this.resizerPosition === -1) {
                    return false;
                }
                var columnIndex = this.resizerPosition;
                var leftColumnCollection = this.getColumnCells(table, columnIndex, true);
                var rightColumnCollection = this.getColumnCells(table, columnIndex, false);
                var isColumnResizing = this.isColumnSelected(table, columnIndex);
                if (leftColumnCollection.length > 0 && !isColumnResizing) {
                    for (var i = 0; i < leftColumnCollection.length; i++) {
                        if (selectedCells.indexOf(leftColumnCollection[i]) === -1) {
                            leftColumnCollection.splice(i, 1);
                            i--;
                        }
                    }
                }
                if (rightColumnCollection.length > 0 && !isColumnResizing) {
                    for (var i = 0; i < rightColumnCollection.length; i++) {
                        if (selectedCells.indexOf(rightColumnCollection[i]) === -1) {
                            rightColumnCollection.splice(i, 1);
                            i--;
                        }
                    }
                }
                //Getting the adjacent cell collections for left side selected cells in the right column collection.
                if (leftColumnCollection.length === 0 && rightColumnCollection.length > 0) {
                    for (var i = 0; i < rightColumnCollection.length; i++) {
                        var cell = rightColumnCollection[i];
                        if (cell.previousWidget) {
                            leftColumnCollection.push(cell.previousWidget);
                        }
                    }
                }
                else if (rightColumnCollection.length === 0 && leftColumnCollection.length > 0) {
                    for (var i = 0; i < leftColumnCollection.length; i++) {
                        var cell = leftColumnCollection[i];
                        if (cell.nextWidget) {
                            rightColumnCollection.push(cell.nextWidget);
                        }
                    }
                }
                this.changeWidthOfCells(table, leftColumnCollection, rightColumnCollection, dragValue);
                if (table.tableFormat.allowAutoFit) {
                    table.updateWidth(dragValue);
                }
                table.tableFormat.allowAutoFit = false;
                this.updateGridValue(table, true, dragValue);
            }
            selection.selectPosition(selection.start, selection.end);
        }
        return false;
    };
    TableResizer.prototype.resizeColumnAtStart = function (table, dragValue, selectedCells) {
        var newIndent = table.leftIndent;
        //const rightColumnCollection: TableCellWidget[] = this.getColumnCells(table, this.resizerPosition, false);
        var offset = 0;
        var selectedRow = selectedCells[0].ownerRow;
        var rowFormat = selectedRow.rowFormat;
        if (rowFormat.beforeWidth > 0) {
            var newGridBefore = rowFormat.beforeWidth + dragValue;
            if (newGridBefore > 0) {
                this.updateGridBefore(selectedRow, dragValue);
            }
            else {
                var leastGridBefore = this.getLeastGridBefore(table, selectedRow);
                if (newGridBefore < leastGridBefore && offset !== newGridBefore) {
                    newIndent = table.leftIndent + newGridBefore;
                    table.tableFormat.leftIndent = newIndent >= -1440 ? (newIndent <= 1440 ? newIndent : 1440) : -1440;
                    for (var i = 0; i < table.childWidgets.length; i++) {
                        var tableRow = table.childWidgets[i];
                        if (selectedRow !== tableRow) {
                            this.updateGridBefore(tableRow, -newGridBefore);
                        }
                    }
                }
            }
        }
        else {
            if (dragValue < 0) {
                newIndent = table.leftIndent + dragValue;
                table.tableFormat.leftIndent = newIndent >= -1440 ? (newIndent <= 1440 ? newIndent : 1440) : -1440;
                this.updateWidthForCells(table, selectedCells, dragValue);
            }
            else {
                var leastGridBefore = this.getLeastGridBefore(table, selectedRow);
                var currentTableIndent = table.tableFormat.leftIndent;
                if (currentTableIndent === 0) {
                    for (var i = 0; i < table.childWidgets.length; i++) {
                        var tableRow = table.childWidgets[i];
                        if (selectedCells.indexOf(tableRow.childWidgets[0]) !== -1) {
                            this.updateGridBefore(tableRow, dragValue);
                            this.increaseOrDecreaseWidth(tableRow.childWidgets[0], dragValue, false);
                        }
                    }
                }
                else {
                    var difference = leastGridBefore - dragValue;
                    if (difference > 0) {
                        newIndent = table.leftIndent + dragValue;
                        table.tableFormat.leftIndent = newIndent >= -1440 ? (newIndent <= 1440 ? newIndent : 1440) : -1440;
                        this.updateWidthForCells(table, selectedCells, dragValue);
                    }
                    else {
                        newIndent = table.leftIndent + leastGridBefore;
                        table.tableFormat.leftIndent = newIndent >= -1440 ? (newIndent <= 1440 ? newIndent : 1440) : -1440;
                        for (var i = 0; i < table.childWidgets.length; i++) {
                            var tableRow = table.childWidgets[i];
                            if (selectedCells.indexOf(tableRow.childWidgets[0]) !== -1) {
                                this.increaseOrDecreaseWidth(tableRow.childWidgets[0], dragValue, false);
                                this.updateGridBefore(tableRow, dragValue - leastGridBefore);
                            }
                            else {
                                this.updateGridBefore(tableRow, -leastGridBefore);
                            }
                        }
                    }
                }
            }
        }
        table.tableFormat.allowAutoFit = false;
        this.updateGridValue(table, true, dragValue);
    };
    TableResizer.prototype.updateWidthForCells = function (table, selectedCells, dragValue) {
        for (var i = 0; i < table.childWidgets.length; i++) {
            var tableRow = table.childWidgets[i];
            if (selectedCells.indexOf(tableRow.childWidgets[0]) !== -1) {
                this.increaseOrDecreaseWidth(tableRow.childWidgets[0], dragValue, false);
            }
            else {
                this.updateGridBefore(tableRow, -dragValue);
            }
        }
    };
    TableResizer.prototype.resizeColumnAtLastColumnIndex = function (table, dragValue, containerWidth) {
        var tableAlignment = table.tableFormat.tableAlignment;
        var preferredWidth = table.tableFormat.preferredWidth;
        var hasTableWidth = preferredWidth;
        var columnIndex = this.resizerPosition;
        var leftColumn = table.tableHolder.columns[columnIndex - 1];
        var prevDragValue = 0;
        while (dragValue !== prevDragValue) {
            var newWidth = HelperMethods.round(leftColumn.preferredWidth + dragValue, 1);
            if (newWidth >= leftColumn.minWidth) {
                leftColumn.preferredWidth = newWidth;
                prevDragValue = dragValue;
            }
            else {
                prevDragValue = dragValue;
                dragValue -= newWidth - leftColumn.minWidth;
            }
        }
        this.updateCellPreferredWidths(table);
        if (hasTableWidth || table.tableHolder.getTotalWidth(0) > containerWidth) {
            table.tableFormat.allowAutoFit = false;
            table.updateWidth(dragValue);
            table.tableHolder.tableWidth = table.tableHolder.getTotalWidth(0);
        }
        var dragOffset = dragValue;
        if (tableAlignment === 'Right') {
            dragOffset = 0;
        }
        else if (tableAlignment === 'Center') {
            dragOffset = dragOffset / 2;
        }
        this.updateGridValue(table, true, dragOffset);
    };
    TableResizer.prototype.resizeCellAtMiddle = function (table, dragValue) {
        var columnIndex = this.resizerPosition;
        var leftColumn = table.tableHolder.columns[columnIndex - 1];
        var rightColumn = table.tableHolder.columns[columnIndex];
        if (dragValue > 0) {
            var isContinue = true;
            while (isContinue) {
                var newWidth = HelperMethods.round(rightColumn.preferredWidth - dragValue, 1);
                if (newWidth >= rightColumn.minWidth) {
                    rightColumn.preferredWidth = newWidth;
                    leftColumn.preferredWidth = leftColumn.preferredWidth + dragValue;
                    isContinue = false;
                }
                else {
                    dragValue += newWidth - rightColumn.minWidth;
                }
            }
        }
        else {
            var isContinue = true;
            while (isContinue) {
                var newWidth = HelperMethods.round(leftColumn.preferredWidth + dragValue, 1);
                if (newWidth >= leftColumn.minWidth) {
                    leftColumn.preferredWidth = newWidth;
                    rightColumn.preferredWidth = rightColumn.preferredWidth - dragValue;
                    isContinue = false;
                }
                else {
                    dragValue -= newWidth - leftColumn.minWidth;
                }
            }
        }
        // Update the cell widths based on the columns preferred width
        this.updateCellPreferredWidths(table);
        if (table.tableFormat.allowAutoFit) {
            table.updateWidth(dragValue);
        }
        table.tableFormat.allowAutoFit = false;
        table.tableHolder.tableWidth = table.tableHolder.getTotalWidth(0);
        this.updateGridValue(table, false, dragValue);
    };
    TableResizer.prototype.updateGridValue = function (table, isUpdate, dragValue) {
        if (isUpdate) {
            table.calculateGrid();
            table.isGridUpdated = false;
        }
        table.buildTableColumns();
        table.isGridUpdated = true;
        this.viewer.owner.isLayoutEnabled = true;
        if (table.isInsideTable) {
            var parentTable = this.documentHelper.layout.getParentTable(table);
            this.documentHelper.layout.reLayoutTable(parentTable); // Need to optmize this.
        }
        else {
            this.documentHelper.layout.reLayoutTable(table);
        }
        this.owner.editor.getOffsetValue(this.documentHelper.selection);
        this.owner.editorModule.reLayout(this.owner.selection);
        if (dragValue) {
            this.startingPoint.x += HelperMethods.convertPointToPixel(dragValue);
            this.resizerPosition = this.getCellReSizerPosition(this.startingPoint);
        }
    };
    TableResizer.prototype.getColumnCells = function (table, columnIndex, isLeftSideCollection) {
        var cells = [];
        for (var i = 0; i < table.childWidgets.length; i++) {
            var row = table.childWidgets[i];
            for (var j = 0; j < row.childWidgets.length; j++) {
                var cell = row.childWidgets[j];
                if (isLeftSideCollection) {
                    if (cell.columnIndex + cell.cellFormat.columnSpan === columnIndex) {
                        cells.push(cell);
                    }
                }
                else {
                    if (cell.columnIndex === columnIndex) {
                        cells.push(cell);
                    }
                }
            }
        }
        return cells;
    };
    TableResizer.prototype.updateGridBefore = function (row, offset) {
        if (row.rowFormat.beforeWidth + offset !== row.rowFormat.beforeWidth) {
            row.rowFormat.beforeWidth = row.rowFormat.beforeWidth + offset;
            row.rowFormat.gridBeforeWidth = row.rowFormat.beforeWidth;
        }
    };
    TableResizer.prototype.getLeastGridBefore = function (table, ignoreRow) {
        var gridBefore = 0;
        var flag = 0;
        for (var i = 0; i < table.childWidgets.length; i++) {
            var row = table.childWidgets[i];
            if (row !== ignoreRow) {
                if (flag === 0) {
                    gridBefore = row.rowFormat.beforeWidth;
                    flag++;
                }
                if (row.rowFormat.beforeWidth <= gridBefore) {
                    gridBefore = row.rowFormat.beforeWidth;
                }
            }
        }
        return gridBefore;
    };
    TableResizer.prototype.increaseOrDecreaseWidth = function (cell, dragValue, isIncrease) {
        var preferredWidth = cell.cellFormat.preferredWidth;
        if (cell.cellFormat.preferredWidthType === 'Auto') {
            preferredWidth = cell.cellFormat.cellWidth;
            cell.cellFormat.preferredWidthType = 'Point';
        }
        var minimumWidth = cell.ownerColumn.minWidth;
        if (cell.cellFormat.preferredWidthType === 'Percent') {
            minimumWidth = cell.convertPointToPercent(minimumWidth);
        }
        // Margins properties usedd for internal purpose.
        if (isIncrease) {
            cell.cellFormat.preferredWidth = preferredWidth + dragValue > minimumWidth ? preferredWidth + dragValue : minimumWidth;
        }
        else {
            cell.cellFormat.preferredWidth = preferredWidth - dragValue > minimumWidth ? preferredWidth - dragValue : minimumWidth;
        }
    };
    /* eslint-disable-next-line max-len */
    TableResizer.prototype.changeWidthOfCells = function (table, leftColumnCollection, rightColumnCollection, dragValue) {
        if (leftColumnCollection.length > 0) {
            var flag = false;
            for (var i = 0; i < leftColumnCollection.length; i++) {
                var cell = leftColumnCollection[i];
                this.increaseOrDecreaseWidth(cell, dragValue, true);
                if (cell.cellIndex === cell.ownerRow.childWidgets.length - 1) {
                    flag = true;
                }
            }
            if (flag) {
                this.updateRowsGridAfterWidth(table);
            }
        }
        if (rightColumnCollection.length > 0) {
            var diff = 0;
            for (var i = 0; i < rightColumnCollection.length; i++) {
                var cell = rightColumnCollection[i];
                if (cell.cellIndex === 0) {
                    var newGridBefore = cell.ownerRow.rowFormat.beforeWidth + dragValue;
                    if (newGridBefore >= 0) {
                        this.updateGridBefore(cell.ownerRow, dragValue);
                    }
                    else {
                        if (diff !== newGridBefore) {
                            diff = newGridBefore;
                        }
                        cell.ownerRow.rowFormat.gridBeforeWidth = 0;
                        cell.ownerRow.rowFormat.gridBeforeWidthType = 'Auto';
                    }
                }
                this.increaseOrDecreaseWidth(cell, dragValue, false);
            }
            if (diff !== 0) {
                var newIndent = table.leftIndent + diff;
                table.tableFormat.leftIndent = newIndent >= -1440 ? (newIndent <= 1440 ? newIndent : 1440) : -1440;
                for (var j = 0; j < table.childWidgets.length; j++) {
                    var row = table.childWidgets[j];
                    if (rightColumnCollection.indexOf(row.childWidgets[0]) === -1) {
                        this.updateGridBefore(row, diff > 0 ? diff : -diff);
                    }
                }
            }
        }
    };
    TableResizer.prototype.updateRowsGridAfterWidth = function (table) {
        var maxRowWidth = this.getMaxRowWidth(table, true);
        for (var i = 0; i < table.childWidgets.length; i++) {
            var row = table.childWidgets[i];
            var currentRowWidth = this.getRowWidth(row, true);
            if (maxRowWidth >= currentRowWidth && row.rowFormat.afterWidth !== maxRowWidth - currentRowWidth) {
                var value = maxRowWidth - currentRowWidth;
                row.rowFormat.gridAfterWidth = value;
                row.rowFormat.afterWidth = value;
            }
        }
    };
    TableResizer.prototype.getRowWidth = function (row, toUpdateGridAfter) {
        var rowWidth = 0;
        if (toUpdateGridAfter) {
            rowWidth = rowWidth + row.rowFormat.beforeWidth;
        }
        for (var i = 0; i < row.childWidgets.length; i++) {
            var cell = row.childWidgets[i];
            rowWidth += cell.cellFormat.cellWidth;
        }
        return rowWidth;
    };
    TableResizer.prototype.getMaxRowWidth = function (table, toUpdateGridAfter) {
        var width = 0;
        for (var i = 0; i < table.childWidgets.length; i++) {
            var row = table.childWidgets[i];
            var rowWidth = 0;
            if (toUpdateGridAfter) {
                rowWidth = rowWidth + row.rowFormat.beforeWidth;
            }
            for (var i_1 = 0; i_1 < row.childWidgets.length; i_1++) {
                var cell = row.childWidgets[i_1];
                rowWidth += cell.cellFormat.cellWidth;
            }
            if (width < rowWidth) {
                width = rowWidth;
            }
        }
        return width;
    };
    TableResizer.prototype.isColumnSelected = function (table, columnIndex) {
        var selection = this.owner.selection;
        var selectedCells = selection.getSelectedCells();
        var leftColumnCells = this.getColumnCells(table, columnIndex, true);
        var rightColumnCells = this.getColumnCells(table, columnIndex, false);
        var isColumnSelected = false;
        for (var i = 0; i < leftColumnCells.length; i++) {
            var columnCell = leftColumnCells[i];
            isColumnSelected = selectedCells.indexOf(columnCell) !== -1 ? true : false;
        }
        if (!isColumnSelected) {
            for (var i = 0; i < rightColumnCells.length; i++) {
                var columnCell = rightColumnCells[i];
                isColumnSelected = selectedCells.indexOf(columnCell) !== -1 ? true : false;
            }
        }
        return isColumnSelected;
    };
    TableResizer.prototype.applyProperties = function (table, tableHistoryInfo) {
        if (isNullOrUndefined(tableHistoryInfo)) {
            return;
        }
        // PreserveGrid = true;
        if (tableHistoryInfo.tableHolder) {
            table.tableHolder = tableHistoryInfo.tableHolder.clone();
        }
        if (tableHistoryInfo.tableFormat !== null) {
            table.tableFormat.leftIndent = tableHistoryInfo.tableFormat.leftIndent;
            table.tableFormat.preferredWidth = tableHistoryInfo.tableFormat.preferredWidth;
            table.tableFormat.preferredWidthType = tableHistoryInfo.tableFormat.preferredWidthType;
            table.tableFormat.allowAutoFit = tableHistoryInfo.tableFormat.allowAutoFit;
        }
        for (var i = 0; i < table.childWidgets.length; i++) {
            var row = table.childWidgets[i];
            var rowFormat = tableHistoryInfo.rows[i];
            row.rowFormat.gridBefore = rowFormat.gridBefore;
            row.rowFormat.gridBeforeWidth = rowFormat.gridBeforeWidth;
            row.rowFormat.gridBeforeWidthType = rowFormat.gridBeforeWidthType;
            row.rowFormat.gridAfter = rowFormat.gridAfter;
            row.rowFormat.gridAfterWidth = rowFormat.gridAfterWidth;
            row.rowFormat.gridAfterWidthType = rowFormat.gridAfterWidthType;
            for (var j = 0; j < row.childWidgets.length; j++) {
                var cell = row.childWidgets[j];
                var cellFormat = rowFormat.cells[j];
                cell.columnIndex = cellFormat.columnIndex;
                cell.cellFormat.columnSpan = cellFormat.columnSpan;
                cell.cellFormat.preferredWidth = cellFormat.preferredWidth;
                cell.cellFormat.preferredWidthType = cellFormat.preferredWidthType;
            }
        }
        var containerWidth = table.getOwnerWidth(true);
        var tableWidth = table.getTableClientWidth(containerWidth);
        //Sets the width to cells
        table.setWidthToCells(tableWidth, table.tableFormat.preferredWidthType === 'Auto');
        // PreserveGrid = false;
    };
    TableResizer.prototype.getActualWidth = function (row) {
        var width = 0;
        if (row.childWidgets.length > 0) {
            for (var i = 0; i < row.childWidgets.length; i++) {
                width += row.childWidgets[i].cellFormat.cellWidth;
            }
        }
        return width;
    };
    TableResizer.prototype.setPreferredWidth = function (table) {
        for (var i = 0; i < table.childWidgets.length; i++) {
            var rw = table.childWidgets[i];
            var rowFormat = rw.rowFormat;
            if (rowFormat.gridBefore > 0) {
                rowFormat.gridBeforeWidth = rowFormat.beforeWidth;
                rowFormat.gridBeforeWidthType = 'Point';
            }
            for (var j = 0; j < rw.childWidgets.length; j++) {
                var cell = rw.childWidgets[j];
                cell.cellFormat.preferredWidth = cell.cellFormat.cellWidth;
                cell.cellFormat.preferredWidthType = 'Point';
            }
            if (rowFormat.gridAfter > 0) {
                rowFormat.gridAfterWidth = rowFormat.afterWidth;
                rowFormat.gridAfterWidthType = 'Point';
            }
        }
    };
    TableResizer.prototype.updateCellPreferredWidths = function (table) {
        var tableWidth = table.tableHolder.tableWidth;
        for (var i = 0; i < table.childWidgets.length; i++) {
            var row = table.childWidgets[i];
            if (row.rowFormat.gridBefore > 0) {
                var width = table.tableHolder.getCellWidth(0, row.rowFormat.gridBefore, tableWidth);
                this.updateGridBeforeWidth(width, row);
            }
            for (var j = 0; j < row.childWidgets.length; j++) {
                var cell = row.childWidgets[j];
                cell.updateWidth(table.tableHolder.getCellWidth(cell.columnIndex, cell.cellFormat.columnSpan, tableWidth));
            }
            if (row.rowFormat.gridAfter > 0) {
                /* eslint-disable-next-line max-len */
                this.updateGridAfterWidth(table.tableHolder.getCellWidth(row.childWidgets.length, row.rowFormat.gridAfter, tableWidth), row);
            }
        }
    };
    TableResizer.prototype.updateGridBeforeWidth = function (width, row) {
        var rowFormat = row.rowFormat;
        if (width !== rowFormat.beforeWidth) {
            rowFormat.beforeWidth = width;
            if (rowFormat.gridBeforeWidthType === 'Auto') {
                rowFormat.gridBeforeWidthType = 'Point';
            }
            if (rowFormat.gridBeforeWidthType === 'Point') {
                rowFormat.gridBeforeWidth = rowFormat.beforeWidth;
            }
            else {
                // The value is calculated from the pixel values hence, its converted to percent using method.
                var ownerWidth = row.ownerTable.getTableClientWidth(row.ownerTable.getOwnerWidth(true));
                var value = row.ownerTable.convertPointToPercent(rowFormat.beforeWidth, ownerWidth);
                rowFormat.gridBeforeWidth = value;
            }
        }
    };
    TableResizer.prototype.updateGridAfterWidth = function (width, row) {
        var rowFormat = row.rowFormat;
        if (width !== rowFormat.afterWidth) {
            rowFormat.afterWidth = width;
        }
        if (rowFormat.gridAfterWidthType === 'Auto') {
            rowFormat.gridAfterWidthType = 'Point';
        }
        if (rowFormat.gridAfterWidthType === 'Point') {
            rowFormat.gridAfterWidth = rowFormat.afterWidth;
        }
        else {
            // The value is calculated from the pixel values hence, its converted to percent using method.
            var ownerWidth = row.ownerTable.getTableClientWidth(row.ownerTable.getOwnerWidth(true));
            var value = row.ownerTable.convertPointToPercent(rowFormat.afterWidth, ownerWidth);
            rowFormat.gridAfterWidth = value;
        }
    };
    return TableResizer;
}());
export { TableResizer };
