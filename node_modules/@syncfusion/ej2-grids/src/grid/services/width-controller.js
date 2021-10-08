import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { formatUnit } from '@syncfusion/ej2-base';
import { columnWidthChanged, preventFrozenScrollRefresh } from '../base/constant';
import { Column } from '../models/column';
import { parentsUntil, ispercentageWidth, getScrollBarWidth } from '../base/util';
import * as literals from '../base/string-literals';
/**
 * ColumnWidthService
 *
 * @hidden
 */
var ColumnWidthService = /** @class */ (function () {
    function ColumnWidthService(parent) {
        this.parent = parent;
    }
    ColumnWidthService.prototype.setWidthToColumns = function () {
        var i = 0;
        var indexes = this.parent.getColumnIndexesInView();
        var wFlag = true;
        var totalColumnsWidth = 0;
        if (this.parent.allowGrouping) {
            for (var len = this.parent.groupSettings.columns.length; i < len; i++) {
                if (this.parent.enableColumnVirtualization && indexes.indexOf(i) === -1) {
                    wFlag = false;
                    continue;
                }
                this.setColumnWidth(new Column({ width: '30px' }), i);
            }
        }
        if (this.parent.detailTemplate || this.parent.childGrid) {
            this.setColumnWidth(new Column({ width: '30px' }), i);
            i++;
        }
        if (this.parent.isRowDragable() && this.parent.getFrozenMode() !== 'Right') {
            this.setColumnWidth(new Column({ width: '30px' }), i);
            i++;
        }
        var columns = this.parent.getColumns();
        for (var j = 0; j < columns.length; j++) {
            this.setColumnWidth(columns[j], wFlag && this.parent.enableColumnVirtualization ? undefined : j + i);
        }
        if (this.parent.isRowDragable() && this.parent.getFrozenMode() === 'Right') {
            this.setColumnWidth(new Column({ width: '30px' }), columns.length);
        }
        totalColumnsWidth = this.getTableWidth(this.parent.getColumns());
        if (this.parent.width !== 'auto' && this.parent.width.toString().indexOf('%') === -1) {
            this.setMinwidthBycalculation(totalColumnsWidth);
        }
    };
    ColumnWidthService.prototype.setMinwidthBycalculation = function (tWidth) {
        var difference = 0;
        var collection = this.parent.getColumns().filter(function (a) {
            return isNullOrUndefined(a.width) || a.width === 'auto';
        });
        if (collection.length) {
            if (!isNullOrUndefined(this.parent.width) && this.parent.width !== 'auto' &&
                typeof (this.parent.width) === 'string' && this.parent.width.indexOf('%') === -1) {
                difference = (typeof this.parent.width === 'string' ? parseInt(this.parent.width, 10) : this.parent.width) - tWidth;
            }
            else {
                difference = this.parent.element.getBoundingClientRect().width - tWidth;
            }
            var tmWidth = 0;
            for (var _i = 0, collection_1 = collection; _i < collection_1.length; _i++) {
                var cols = collection_1[_i];
                tmWidth += !isNullOrUndefined(cols.minWidth) ?
                    ((typeof cols.minWidth === 'string' ? parseInt(cols.minWidth, 10) : cols.minWidth)) : 0;
            }
            for (var i = 0; i < collection.length; i++) {
                if (tWidth === 0 && this.parent.allowResizing && this.isWidthUndefined() && (i !== collection.length - 1)) {
                    this.setUndefinedColumnWidth(collection);
                }
                var index = this.parent.getColumnIndexByField(collection[i].field) + this.parent.getIndentCount();
                if (tWidth !== 0 && difference < tmWidth) {
                    this.setWidth(collection[i].minWidth, index);
                }
                else if (tWidth !== 0 && difference > tmWidth) {
                    this.setWidth('', index, true);
                }
            }
        }
    };
    ColumnWidthService.prototype.setUndefinedColumnWidth = function (collection) {
        for (var k = 0; k < collection.length; k++) {
            if (k !== collection.length - 1) {
                collection[k].width = 200;
                this.setWidth(200, this.parent.getColumnIndexByField(collection[k].field));
            }
        }
    };
    ColumnWidthService.prototype.setColumnWidth = function (column, index, module) {
        if (this.parent.getColumns().length < 1) {
            return;
        }
        var columnIndex = isNullOrUndefined(index) ? this.parent.getNormalizedColumnIndex(column.uid) : index;
        var cWidth = this.getWidth(column);
        var tgridWidth = this.getTableWidth(this.parent.getColumns());
        if (cWidth !== null) {
            this.setWidth(cWidth, columnIndex);
            if (this.parent.width !== 'auto' && this.parent.width.toString().indexOf('%') === -1) {
                this.setMinwidthBycalculation(tgridWidth);
            }
            if ((this.parent.allowResizing && module === 'resize') || (this.parent.getFrozenColumns() && this.parent.allowResizing)) {
                this.setWidthToTable();
            }
            this.parent.notify(columnWidthChanged, { index: columnIndex, width: cWidth, column: column, module: module });
        }
    };
    ColumnWidthService.prototype.setWidth = function (width, index, clear) {
        if (this.parent.groupSettings.columns.length > index && ispercentageWidth(this.parent)) {
            var elementWidth = this.parent.element.offsetWidth;
            width = (30 / elementWidth * 100).toFixed(1) + '%';
        }
        var header = this.parent.getHeaderTable();
        var content = this.parent.getContentTable();
        var fWidth = formatUnit(width);
        var headerCol;
        var frzCols = this.parent.getFrozenColumns();
        var isDraggable = this.parent.isRowDragable();
        frzCols = frzCols && isDraggable ? frzCols + 1 : frzCols;
        var mHdr = this.parent.getHeaderContent().querySelector('.' + literals.movableHeader);
        var mCont = this.parent.getContent().querySelector('.' + literals.movableContent);
        var freezeLeft = this.parent.getFrozenLeftColumnsCount();
        var freezeRight = this.parent.getFrozenRightColumnsCount();
        var movableCount = this.parent.getMovableColumnsCount();
        var isColFrozen = freezeLeft !== 0 || freezeRight !== 0;
        if (frzCols && index >= frzCols) {
            if (!mHdr || !mHdr.querySelector(literals.colGroup)) {
                return;
            }
            headerCol = mHdr.querySelector(literals.colGroup).children[index - frzCols];
        }
        else if (this.parent.enableColumnVirtualization && frzCols && this.parent.contentModule.isXaxis()
            && mHdr.scrollLeft > 0) {
            var colGroup = mHdr.querySelector(literals.colGroup);
            headerCol = colGroup.children[(colGroup.children.length - 1) - index];
        }
        else if (isColFrozen) {
            var target = void 0;
            if (freezeLeft && !freezeRight) {
                index = isDraggable ? index - 1 : index;
                target = index < freezeLeft ? header : mHdr;
            }
            else if (!freezeLeft && freezeRight) {
                target = index >= movableCount ? header : mHdr;
            }
            else if (freezeLeft && freezeRight) {
                index = isDraggable ? index - 1 : index;
                var frHdr = this.parent.getFrozenRightHeader();
                target = index < freezeLeft ? header : index < (freezeLeft + movableCount) ? mHdr : frHdr;
            }
            headerCol = this.getColumnLevelFrozenColgroup(index, freezeLeft, movableCount, target);
            if (!headerCol) {
                return;
            }
        }
        else {
            headerCol = header.querySelector(literals.colGroup).children[index];
        }
        if (headerCol && !clear) {
            headerCol.style.width = fWidth;
        }
        else if (headerCol && clear) {
            headerCol.style.width = '';
        }
        var contentCol;
        if (frzCols && index >= frzCols) {
            contentCol = this.parent.getContent().querySelector('.' + literals.movableContent)
                .querySelector(literals.colGroup).children[index - frzCols];
        }
        else if (this.parent.enableColumnVirtualization && frzCols && this.parent.contentModule.isXaxis()
            && mCont.scrollLeft > 0) {
            var colGroup = this.parent.getContent().querySelector('.' + literals.movableContent)
                .querySelector(literals.colGroup);
            contentCol = colGroup.children[(colGroup.children.length - 1) - index];
        }
        else if (isColFrozen) {
            var target = void 0;
            if (freezeLeft && !freezeRight) {
                target = index < freezeLeft ? content : mCont;
            }
            if (!freezeLeft && freezeRight) {
                target = index >= movableCount ? content : mCont;
            }
            if (freezeLeft && freezeRight) {
                var frCont = this.parent.getContent().querySelector('.e-frozen-right-content');
                target = index < freezeLeft ? content : index < (freezeLeft + movableCount) ? mCont : frCont;
            }
            contentCol = this.getColumnLevelFrozenColgroup(index, freezeLeft, movableCount, target);
        }
        else {
            contentCol = content.querySelector(literals.colGroup).children[index];
        }
        if (contentCol && !clear) {
            contentCol.style.width = fWidth;
        }
        else if (contentCol && clear) {
            contentCol.style.width = '';
        }
        if (!this.parent.enableColumnVirtualization) {
            var edit = this.parent.element.querySelectorAll('.e-table.e-inline-edit');
            var editTableCol = [];
            for (var i = 0; i < edit.length; i++) {
                if (parentsUntil(edit[i], 'e-grid').id === this.parent.element.id) {
                    for (var j = 0; j < edit[i].querySelector('colgroup').children.length; j++) {
                        editTableCol.push(edit[i].querySelector('colgroup').children[j]);
                    }
                }
            }
            if (edit.length && editTableCol.length) {
                editTableCol[index].style.width = fWidth;
            }
        }
        if (this.parent.isFrozenGrid()) {
            this.refreshFrozenScrollbar();
        }
    };
    ColumnWidthService.prototype.getColumnLevelFrozenColgroup = function (index, left, movable, ele) {
        if (!ele || !ele.querySelector(literals.colGroup)) {
            return null;
        }
        var columns = this.parent.getColumns();
        var isDrag = this.parent.isRowDragable();
        var frzMode = this.parent.getFrozenMode();
        var headerCol;
        var colGroup = [].slice.call(ele.querySelector(literals.colGroup).children);
        if (frzMode === 'Right' && isDrag && index === (movable + this.parent.getFrozenRightColumnsCount())) {
            headerCol = colGroup[colGroup.length - 1];
        }
        else if (isDrag && index === -1) {
            headerCol = colGroup[0];
        }
        else if (columns[index].freeze === 'Left') {
            headerCol = colGroup[isDrag ? (index + 1) : index];
        }
        else if (columns[index].freeze === 'Right') {
            headerCol = colGroup[index - (left + movable)];
        }
        else {
            headerCol = colGroup[index - left];
        }
        return headerCol;
    };
    /**
     * @returns {void}
     * @hidden
     */
    ColumnWidthService.prototype.refreshFrozenScrollbar = function () {
        var args = { cancel: false };
        this.parent.notify(preventFrozenScrollRefresh, args);
        if (args.cancel) {
            return;
        }
        var scrollWidth = getScrollBarWidth();
        var frozenScrollbar = this.parent.element.querySelector('.e-frozenscrollbar');
        var movableScrollbar = this.parent.element.querySelector('.e-movablescrollbar');
        var frozencontent = this.parent.getContent().querySelector('.' + literals.frozenContent);
        var movableContent = this.parent.getContent().querySelector('.' + literals.movableContent);
        var frozenWidth = frozencontent.firstElementChild.getBoundingClientRect().width;
        var movableWidth = movableContent.firstElementChild.getBoundingClientRect().width;
        if (this.parent.getFrozenMode() === 'Right') {
            frozenWidth = frozenWidth + scrollWidth;
        }
        frozenScrollbar.style.width = frozenWidth + 'px';
        if (this.parent.getFrozenMode() === literals.leftRight) {
            var frozenRightScrollbar = this.parent.element.querySelector('.e-frozen-right-scrollbar');
            var frozenRightWidth = this.parent.getContent().querySelector('.e-frozen-right-content')
                .firstElementChild.getBoundingClientRect().width;
            if (this.parent.height !== 'auto') {
                frozenRightWidth = frozenRightWidth + scrollWidth;
            }
            frozenRightScrollbar.style.width = frozenRightWidth + 'px';
        }
        else {
            if (this.parent.enableColumnVirtualization) {
                var placeHolder = this.parent.getMovableVirtualContent().querySelector('.e-virtualtrack');
                if (placeHolder) {
                    movableWidth = placeHolder.scrollWidth;
                }
            }
            if (this.parent.getFrozenMode() !== 'Right' && this.parent.height !== 'auto') {
                movableWidth = movableWidth + scrollWidth;
            }
        }
        movableScrollbar.firstElementChild.style.width = movableWidth + 'px';
    };
    ColumnWidthService.prototype.getSiblingsHeight = function (element) {
        var previous = this.getHeightFromDirection(element, 'previous');
        var next = this.getHeightFromDirection(element, 'next');
        return previous + next;
    };
    ColumnWidthService.prototype.getHeightFromDirection = function (element, direction) {
        var sibling = element[direction + 'ElementSibling'];
        var result = 0;
        var classList = [literals.gridHeader, literals.gridFooter, 'e-groupdroparea', 'e-gridpager', 'e-toolbar'];
        while (sibling) {
            if (classList.some(function (value) { return sibling.classList.contains(value); })) {
                result += sibling.offsetHeight;
            }
            sibling = sibling[direction + 'ElementSibling'];
        }
        return result;
    };
    ColumnWidthService.prototype.isWidthUndefined = function () {
        var isWidUndefCount = this.parent.getColumns().filter(function (col) {
            return isNullOrUndefined(col.width) && isNullOrUndefined(col.minWidth);
        }).length;
        return (this.parent.getColumns().length === isWidUndefCount);
    };
    ColumnWidthService.prototype.getWidth = function (column) {
        if (isNullOrUndefined(column.width) && this.parent.allowResizing
            && isNullOrUndefined(column.minWidth) && !this.isWidthUndefined()) {
            column.width = 200;
        }
        if (this.parent.isFrozenGrid() && isNullOrUndefined(column.width) &&
            (column.getFreezeTableName() === literals.frozenLeft || column.getFreezeTableName() === literals.frozenRight)) {
            column.width = 200;
        }
        if (!column.width) {
            return null;
        }
        var width = parseInt(column.width.toString(), 10);
        if (column.minWidth && width < parseInt(column.minWidth.toString(), 10)) {
            return column.minWidth;
        }
        else if ((column.maxWidth && width > parseInt(column.maxWidth.toString(), 10))) {
            return column.maxWidth;
        }
        else {
            return column.width;
        }
    };
    ColumnWidthService.prototype.getTableWidth = function (columns) {
        var tWidth = 0;
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var column = columns_1[_i];
            var cWidth = this.getWidth(column);
            if (column.width === 'auto') {
                cWidth = 0;
            }
            if (column.visible !== false && cWidth !== null) {
                tWidth += parseInt(cWidth.toString(), 10);
            }
        }
        return tWidth;
    };
    ColumnWidthService.prototype.calcMovableOrFreezeColWidth = function (tableType) {
        var columns = this.parent.getColumns().slice();
        var left = this.parent.getFrozenLeftColumnsCount() || this.parent.getFrozenColumns();
        var movable = this.parent.getMovableColumnsCount();
        var right = this.parent.getFrozenRightColumnsCount();
        if (tableType === 'movable') {
            if (right) {
                columns.splice(left + movable, columns.length);
            }
            if (left) {
                columns.splice(0, left);
            }
        }
        else if (tableType === 'freeze-left') {
            columns.splice(left, columns.length);
        }
        else if (tableType === 'freeze-right') {
            columns.splice(0, left + movable);
        }
        return formatUnit(this.getTableWidth(columns));
    };
    ColumnWidthService.prototype.setWidthToFrozenRightTable = function () {
        var freezeWidth = this.calcMovableOrFreezeColWidth('freeze-right');
        freezeWidth = this.isAutoResize() ? '100%' : freezeWidth;
        var headerTbl = this.parent.getHeaderContent().querySelector('.e-frozen-right-header').querySelector('.' + literals.table);
        var cntTbl = this.parent.getContent().querySelector('.e-frozen-right-content').querySelector('.' + literals.table);
        headerTbl.style.width = freezeWidth;
        cntTbl.style.width = freezeWidth;
    };
    ColumnWidthService.prototype.setWidthToFrozenLeftTable = function () {
        var freezeWidth = this.calcMovableOrFreezeColWidth('freeze-left');
        freezeWidth = this.isAutoResize() ? '100%' : freezeWidth;
        this.parent.getHeaderTable().style.width = freezeWidth;
        this.parent.getContentTable().style.width = freezeWidth;
    };
    ColumnWidthService.prototype.setWidthToMovableTable = function () {
        var movableWidth = '';
        var isColUndefined = this.parent.getColumns().filter(function (a) { return isNullOrUndefined(a.width); }).length >= 1;
        var isWidthAuto = this.parent.getColumns().filter(function (a) { return (a.width === 'auto'); }).length >= 1;
        if (typeof this.parent.width === 'number' && !isColUndefined && !isWidthAuto) {
            movableWidth = formatUnit(this.parent.width - parseInt(this.calcMovableOrFreezeColWidth('freeze').split('px')[0], 10) - 5);
        }
        else if (!isColUndefined && !isWidthAuto) {
            movableWidth = this.calcMovableOrFreezeColWidth('movable');
        }
        movableWidth = this.isAutoResize() ? '100%' : movableWidth;
        if (this.parent.getHeaderContent().querySelector('.' + literals.movableHeader).firstElementChild) {
            this.parent.getHeaderContent().querySelector('.' + literals.movableHeader).firstElementChild.style.width
                = movableWidth;
        }
        this.parent.getContent().querySelector('.' + literals.movableContent).firstElementChild.style.width =
            movableWidth;
    };
    ColumnWidthService.prototype.setWidthToFrozenEditTable = function () {
        var freezeWidth = this.calcMovableOrFreezeColWidth('freeze');
        freezeWidth = this.isAutoResize() ? '100%' : freezeWidth;
        this.parent.element.querySelectorAll('.e-table.e-inline-edit')[0].style.width = freezeWidth;
    };
    ColumnWidthService.prototype.setWidthToMovableEditTable = function () {
        var movableWidth = this.calcMovableOrFreezeColWidth('movable');
        movableWidth = this.isAutoResize() ? '100%' : movableWidth;
        this.parent.element.querySelectorAll('.e-table.e-inline-edit')[1].style.width = movableWidth;
    };
    ColumnWidthService.prototype.setWidthToTable = function () {
        var tWidth = formatUnit(this.getTableWidth(this.parent.getColumns()));
        if (this.parent.isFrozenGrid()) {
            if (this.parent.getFrozenColumns() || this.parent.getFrozenLeftColumnsCount()) {
                this.setWidthToFrozenLeftTable();
            }
            this.setWidthToMovableTable();
            if (this.parent.getFrozenRightColumnsCount()) {
                this.setWidthToFrozenRightTable();
            }
        }
        else {
            if (this.parent.detailTemplate || this.parent.childGrid) {
                this.setColumnWidth(new Column({ width: '30px' }));
            }
            tWidth = this.isAutoResize() ? '100%' : tWidth;
            this.parent.getHeaderTable().style.width = tWidth;
            this.parent.getContentTable().style.width = tWidth;
        }
        var edit = this.parent.element.querySelector('.e-table.e-inline-edit');
        if (edit && this.parent.getFrozenColumns()) {
            this.setWidthToFrozenEditTable();
            this.setWidthToMovableEditTable();
        }
        else if (edit) {
            edit.style.width = tWidth;
        }
    };
    ColumnWidthService.prototype.isAutoResize = function () {
        return this.parent.allowResizing && this.parent.resizeSettings.mode === 'Auto';
    };
    return ColumnWidthService;
}());
export { ColumnWidthService };
