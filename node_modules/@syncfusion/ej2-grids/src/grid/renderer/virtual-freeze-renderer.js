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
import { extend, isNullOrUndefined } from '@syncfusion/ej2-base';
import { DataManager } from '@syncfusion/ej2-data';
import { FreezeContentRender, FreezeRender } from './freeze-renderer';
import { ColumnFreezeContentRenderer } from './column-freeze-renderer';
import { VirtualContentRenderer, VirtualHeaderRenderer } from './virtual-content-renderer';
import { RowRenderer } from '../renderer/row-renderer';
import { FreezeRowModelGenerator } from '../services/freeze-row-model-generator';
import { RowModelGenerator } from '../services/row-model-generator';
import { RenderType } from '../base/enum';
import { InterSectionObserver } from '../services/intersection-observer';
import * as events from '../base/constant';
import { splitFrozenRowObjectCells } from '../base/util';
import * as literals from '../base/string-literals';
/**
 * VirtualFreezeRenderer is used to render the virtual table within the frozen and movable content table
 *
 * @hidden
 */
var VirtualFreezeRenderer = /** @class */ (function (_super) {
    __extends(VirtualFreezeRenderer, _super);
    function VirtualFreezeRenderer(parent, locator) {
        var _this = _super.call(this, parent, locator) || this;
        /** @hidden */
        _this.frzRows = [];
        /** @hidden */
        _this.mvblRows = [];
        /** @hidden */
        _this.frRows = [];
        _this.serviceLoc = locator;
        _this.eventListener('on');
        _this.rowModelGenerator = new RowModelGenerator(_this.parent);
        return _this;
    }
    VirtualFreezeRenderer.prototype.eventListener = function (action) {
        this.parent[action](events.getVirtualData, this.getVirtualData, this);
        this.parent[action](events.setFreezeSelection, this.setFreezeSelection, this);
        this.parent[action](events.refreshVirtualFrozenRows, this.refreshVirtualFrozenRows, this);
        this.parent.addEventListener(events.actionComplete, this.actionComplete.bind(this));
    };
    VirtualFreezeRenderer.prototype.actionComplete = function (args) {
        if (args.requestType === 'delete' && this.parent.frozenRows) {
            for (var i = 0; i < this.parent.frozenRows; i++) {
                setCache(this, i);
            }
        }
    };
    VirtualFreezeRenderer.prototype.refreshVirtualFrozenRows = function (args) {
        var _this = this;
        var gObj = this.parent;
        if (args.requestType === 'delete' && gObj.frozenRows) {
            args.isFrozenRowsRender = true;
            var query = gObj.renderModule.data.generateQuery(true).clone();
            query.page(1, gObj.pageSettings.pageSize);
            gObj.renderModule.data.getData({}, query).then(function (e) {
                renderFrozenRows(args, e.result, gObj.getSelectedRowIndexes(), gObj, _this.rowModelGenerator, _this.serviceLoc, _this.virtualRenderer, _this);
            });
        }
    };
    VirtualFreezeRenderer.prototype.getVirtualData = function (data) {
        this.virtualRenderer.getVirtualData(data);
    };
    VirtualFreezeRenderer.prototype.setFreezeSelection = function (args) {
        setFreezeSelection(args, this.virtualRenderer);
    };
    /**
     * @returns {void}
     * @hidden
     */
    VirtualFreezeRenderer.prototype.renderTable = function () {
        this.freezeRowGenerator = new FreezeRowModelGenerator(this.parent);
        this.virtualRenderer = new VirtualContentRenderer(this.parent, this.serviceLoc);
        this.virtualRenderer.header = this.serviceLoc.getService('rendererFactory')
            .getRenderer(RenderType.Header).virtualHdrRenderer;
        _super.prototype.renderTable.call(this);
        this.virtualRenderer.setPanel(this.parent.getContent());
        this.scrollbar = this.parent.getContent().querySelector('.e-movablescrollbar');
        var movableCont = this.getMovableContent();
        var minHeight = this.parent.height;
        this.virtualRenderer.virtualEle.content = this.virtualRenderer.content = this.getPanel().querySelector('.' + literals.content);
        this.virtualRenderer.virtualEle.content.style.overflowX = 'hidden';
        this.virtualRenderer.virtualEle.renderFrozenWrapper(minHeight);
        this.virtualRenderer.virtualEle.renderFrozenPlaceHolder();
        if (this.parent.enableColumnVirtualization) {
            this.virtualRenderer.virtualEle.movableContent = this.virtualRenderer.movableContent
                = this.getPanel().querySelector('.' + literals.movableContent);
            this.virtualRenderer.virtualEle.renderMovableWrapper(minHeight);
            this.virtualRenderer.virtualEle.renderMovablePlaceHolder();
            var tbl = movableCont.querySelector('table');
            this.virtualRenderer.virtualEle.movableTable = tbl;
            this.virtualRenderer.virtualEle.movableWrapper.appendChild(tbl);
            movableCont.appendChild(this.virtualRenderer.virtualEle.movableWrapper);
            movableCont.appendChild(this.virtualRenderer.virtualEle.movablePlaceholder);
        }
        this.virtualRenderer.virtualEle.wrapper.appendChild(this.getFrozenContent());
        this.virtualRenderer.virtualEle.wrapper.appendChild(movableCont);
        this.virtualRenderer.virtualEle.table = this.getTable();
        setDebounce(this.parent, this.virtualRenderer, this.scrollbar, this.getMovableContent());
    };
    /**
     * @param {HTMLElement} target - specifies the target
     * @param {DocumentFragment} newChild - specifies the newChild
     * @param {NotifyArgs} e - specifies the notifyargs
     * @returns {void}
     * @hidden
     */
    VirtualFreezeRenderer.prototype.appendContent = function (target, newChild, e) {
        appendContent(this.virtualRenderer, this.widthService, target, newChild, e);
    };
    /**
     * @param {Object[]} data - specifies the data
     * @param {NotifyArgs} notifyArgs - specifies the notifyargs
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    VirtualFreezeRenderer.prototype.generateRows = function (data, notifyArgs) {
        if (!this.firstPageRecords) {
            this.firstPageRecords = data;
        }
        return generateRows(this.virtualRenderer, data, notifyArgs, this.freezeRowGenerator, this.parent);
    };
    /**
     * @param {number} index - specifies the index
     * @returns {Element} returns the element
     * @hidden
     */
    VirtualFreezeRenderer.prototype.getRowByIndex = function (index) {
        return this.virtualRenderer.getRowByIndex(index);
    };
    /**
     * @param {number} index - specifies the index
     * @returns {Element} returns the element
     * @hidden
     */
    VirtualFreezeRenderer.prototype.getMovableRowByIndex = function (index) {
        return this.virtualRenderer.getMovableVirtualRowByIndex(index);
    };
    VirtualFreezeRenderer.prototype.collectRows = function (tableName) {
        return collectRows(tableName, this.virtualRenderer, this.parent);
    };
    /**
     * @returns {HTMLCollection} returns the Htmlcollection
     * @hidden
     */
    VirtualFreezeRenderer.prototype.getMovableRows = function () {
        return this.collectRows('movable');
    };
    /**
     * @returns {HTMLCollectionOf<HTMLTableRowElement>} returns the html collection
     * @hidden
     */
    VirtualFreezeRenderer.prototype.getRows = function () {
        return this.collectRows('frozen-left');
    };
    /**
     * @returns {Element} returns the element
     * @hidden
     */
    VirtualFreezeRenderer.prototype.getColGroup = function () {
        var mCol = this.parent.getMovableVirtualContent();
        return this.isXaxis() ? mCol.querySelector(literals.colGroup) : this.colgroup;
    };
    /**
     * @param {NotifyArgs} args - specifies the args
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    VirtualFreezeRenderer.prototype.getReorderedFrozenRows = function (args) {
        return getReorderedFrozenRows(args, this.virtualRenderer, this.parent, this.freezeRowGenerator, this.firstPageRecords);
    };
    VirtualFreezeRenderer.prototype.isXaxis = function () {
        return isXaxis(this.virtualRenderer);
    };
    VirtualFreezeRenderer.prototype.getHeaderCells = function () {
        return getHeaderCells(this.virtualRenderer, this.parent);
    };
    VirtualFreezeRenderer.prototype.getVirtualFreezeHeader = function () {
        return getVirtualFreezeHeader(this.virtualRenderer, this.parent);
    };
    VirtualFreezeRenderer.prototype.ensureFrozenCols = function (columns) {
        return ensureFrozenCols(columns, this.parent);
    };
    /**
     * @param {number} index - specifies the index
     * @returns {object} returns the object
     * @hidden
     */
    VirtualFreezeRenderer.prototype.getRowObjectByIndex = function (index) {
        return this.virtualRenderer.getRowObjectByIndex(index);
    };
    /**
     * Set the header colgroup element
     *
     * @param {Element} colGroup - specifies the colgroup
     * @returns {Element} returns the element
     */
    VirtualFreezeRenderer.prototype.setColGroup = function (colGroup) {
        return setColGroup(colGroup, this.virtualRenderer, this);
    };
    return VirtualFreezeRenderer;
}(FreezeContentRender));
export { VirtualFreezeRenderer };
/**
 * VirtualFreezeHdrRenderer is used to render the virtual table within the frozen and movable header table
 *
 * @hidden
 */
var VirtualFreezeHdrRenderer = /** @class */ (function (_super) {
    __extends(VirtualFreezeHdrRenderer, _super);
    function VirtualFreezeHdrRenderer(parent, locator) {
        var _this = _super.call(this, parent, locator) || this;
        _this.serviceLoc = locator;
        return _this;
    }
    /**
     * @returns {void}
     * @hidden
     */
    VirtualFreezeHdrRenderer.prototype.renderTable = function () {
        this.virtualHdrRenderer = new VirtualHeaderRenderer(this.parent, this.serviceLoc);
        this.virtualHdrRenderer.gen.refreshColOffsets();
        this.parent.setColumnIndexesInView(this.virtualHdrRenderer.gen.getColumnIndexes(this.getPanel()
            .querySelector('.' + literals.headerContent)));
        this.virtualHdrRenderer.virtualEle.content = this.getPanel().querySelector('.' + literals.headerContent);
        this.virtualHdrRenderer.virtualEle.renderFrozenWrapper();
        this.virtualHdrRenderer.virtualEle.renderFrozenPlaceHolder();
        if (this.parent.enableColumnVirtualization) {
            this.virtualHdrRenderer.virtualEle.movableContent = this.getPanel().querySelector('.' + literals.movableHeader);
            this.virtualHdrRenderer.virtualEle.renderMovableWrapper();
            this.virtualHdrRenderer.virtualEle.renderMovablePlaceHolder();
        }
        _super.prototype.renderTable.call(this);
        this.virtualHdrRenderer.setPanel(this.parent.getHeaderContent());
    };
    VirtualFreezeHdrRenderer.prototype.rfshMovable = function () {
        this.getFrozenHeader().appendChild(this.getTable());
        this.virtualHdrRenderer.virtualEle.wrapper.appendChild(this.getFrozenHeader());
        if (this.parent.enableColumnVirtualization) {
            this.virtualHdrRenderer.virtualEle.movableWrapper.appendChild(this.createHeader(undefined, 'movable'));
        }
        else {
            this.getMovableHeader().appendChild(this.createTable());
        }
        this.virtualHdrRenderer.virtualEle.wrapper.appendChild(this.getMovableHeader());
    };
    return VirtualFreezeHdrRenderer;
}(FreezeRender));
export { VirtualFreezeHdrRenderer };
/**
 * @param {NotifyArgs} args - specifies the args
 * @param {Object[]} data - specifies the data
 * @param {number[]}selectedIdx - specifies the selected index
 * @param {IGrid} parent - specifies the IGrid
 * @param {IModelGenerator} rowModelGenerator - specifies the rowModeGenerator
 * @param {ServiceLocator} locator - specifies the locator
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {VirtualFreezeRenderer} instance - specifies the instance
 * @returns {void}
 * @hidden
 */
export function renderFrozenRows(args, data, selectedIdx, parent, rowModelGenerator, locator, virtualRenderer, instance) {
    parent.clearSelection();
    args.startIndex = 0;
    var rowRenderer = new RowRenderer(locator, null, parent);
    var rows = rowModelGenerator.generateRows(data, args);
    if (args.renderMovableContent) {
        virtualRenderer.vgenerator.movableCache[1] = rows;
        rows = parent.getMovableRowsObject();
    }
    else if (!args.renderFrozenRightContent && !args.renderMovableContent) {
        virtualRenderer.vgenerator.cache[1] = rows;
        rows = parent.getRowsObject();
    }
    else if (args.renderFrozenRightContent) {
        virtualRenderer.vgenerator.frozenRightCache[1] = rows;
        rows = parent.getFrozenRightRowsObject();
    }
    var hdr = !args.renderMovableContent && !args.renderFrozenRightContent
        ? parent.getHeaderContent().querySelector('.' + literals.frozenHeader).querySelector(literals.tbody) : args.renderMovableContent
        ? parent.getHeaderContent().querySelector('.' + literals.movableHeader).querySelector(literals.tbody)
        : parent.getHeaderContent().querySelector('.e-frozen-right-header').querySelector(literals.tbody);
    hdr.innerHTML = '';
    for (var i = 0; i < parent.frozenRows; i++) {
        hdr.appendChild(rowRenderer.render(rows[i], parent.getColumns()));
        if (selectedIdx.indexOf(i) > -1) {
            rows[i].isSelected = true;
            for (var k = 0; k < rows[i].cells.length; k++) {
                rows[i].cells[k].isSelected = true;
            }
        }
    }
    if (args.renderMovableContent) {
        instance.mvblRows = virtualRenderer.vgenerator.movableCache[1];
    }
    else if (!args.renderMovableContent && !args.renderFrozenRightContent) {
        instance.frzRows = virtualRenderer.vgenerator.cache[1];
    }
    else if (args.renderFrozenRightContent) {
        instance.frRows = virtualRenderer.vgenerator.frozenRightCache[1];
    }
    args.renderMovableContent = !args.renderMovableContent && !args.renderFrozenRightContent;
    args.renderFrozenRightContent = parent.getFrozenMode() === literals.leftRight
        && !args.renderMovableContent && !args.renderFrozenRightContent;
    if (args.renderMovableContent || args.renderFrozenRightContent) {
        renderFrozenRows(args, data, selectedIdx, parent, rowModelGenerator, locator, virtualRenderer, instance);
        if (!args.renderMovableContent && !args.renderFrozenRightContent) {
            args.isFrozenRowsRender = false;
        }
    }
}
/**
 * @param {Row<Column>[]} data - specifies the data
 * @param {freezeTable} tableName -specifies the table
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Row<Column>[]} returns the row
 * @hidden
 */
export function splitCells(data, tableName, parent) {
    var rows = [];
    for (var i = 0; i < data.length; i++) {
        rows.push(extend({}, data[i]));
        rows[i].cells = splitFrozenRowObjectCells(parent, rows[i].cells, tableName);
    }
    return rows;
}
/**
 * @param {freezeTable} tableName - specifies the freeze tabel
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Row<Column>[]} returns the row
 * @hidden
 */
export function collectRows(tableName, virtualRenderer, parent) {
    var rows = [];
    var cache;
    if (tableName === literals.frozenLeft) {
        cache = virtualRenderer.vgenerator.cache;
    }
    else if (tableName === 'movable') {
        cache = virtualRenderer.vgenerator.movableCache;
    }
    else if (tableName === literals.frozenRight) {
        cache = parent.getFrozenMode() === 'Right' ? virtualRenderer.vgenerator.cache : virtualRenderer.vgenerator.frozenRightCache;
    }
    var keys = Object.keys(cache);
    for (var i = 0; i < keys.length; i++) {
        rows = rows.concat(splitCells(cache[keys[i]], tableName, parent));
    }
    return rows;
}
/**
 * @param {object} args - specifies the args
 * @param {string} args.uid - specifirs the uid
 * @param {boolean} args.set - specifies the set
 * @param {boolean} args.clearAll - specifies the boolean to clearall
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @returns {void}
 * @hidden
 */
export function setFreezeSelection(args, virtualRenderer) {
    var leftKeys = Object.keys(virtualRenderer.vgenerator.cache);
    var movableKeys = Object.keys(virtualRenderer.vgenerator.movableCache);
    var rightKeys = Object.keys(virtualRenderer.vgenerator.frozenRightCache);
    for (var i = 0; i < leftKeys.length; i++) {
        selectFreezeRows(args, virtualRenderer.vgenerator.cache[leftKeys[i]]);
    }
    for (var i = 0; i < movableKeys.length; i++) {
        selectFreezeRows(args, virtualRenderer.vgenerator.movableCache[movableKeys[i]]);
    }
    for (var i = 0; i < rightKeys.length; i++) {
        selectFreezeRows(args, virtualRenderer.vgenerator.frozenRightCache[rightKeys[i]]);
    }
}
/**
 * @param {Object} args - specifies the args
 * @param {string} args.uid - specifirs the uid
 * @param {boolean} args.set - specifies the set
 * @param {boolean} args.clearAll - specifies the boolean to clearall
 * @param {Row<Column>[]} cache - specifies the cache
 * @returns {void}
 * @hidden
 */
export function selectFreezeRows(args, cache) {
    var rows = cache.filter(function (row) { return args.clearAll || args.uid === row.uid; });
    for (var j = 0; j < rows.length; j++) {
        rows[j].isSelected = args.set;
        var cells = rows[j].cells;
        for (var k = 0; k < cells.length; k++) {
            cells[k].isSelected = args.set;
        }
    }
}
/**
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {ColumnWidthService} widthService - specifies the width service
 * @param {HTMLElement} target - specifies the target
 * @param {DocumentFragment} newChild - specifies the newchild
 * @param {NotifyArgs} e - specifies the notifyargs
 * @returns {void}
 * @hidden
 */
export function appendContent(virtualRenderer, widthService, target, newChild, e) {
    virtualRenderer.appendContent(target, newChild, e);
    widthService.refreshFrozenScrollbar();
}
/**
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {object[]} data - specifies the data
 * @param {NotifyArgs} notifyArgs - specifies the notifyargs
 * @param {FreezeRowModelGenerator} freezeRowGenerator - specifies the freeze row generator
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Row<Column>[]} returns the row
 * @hidden
 */
export function generateRows(virtualRenderer, data, notifyArgs, freezeRowGenerator, parent) {
    var virtualRows = virtualRenderer.vgenerator.generateRows(data, notifyArgs);
    var arr = [];
    arr = virtualRows.map(function (row) { return extend({}, row); });
    var rows = freezeRowGenerator.generateRows(data, notifyArgs, arr);
    if (parent.frozenRows && notifyArgs.requestType === 'delete' && parent.pageSettings.currentPage === 1) {
        rows = rows.slice(parent.frozenRows);
    }
    return rows;
}
/**
 * @param {NotifyArgs} args -specifies the args
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {IGrid} parent - specifies the IGrid
 * @param {FreezeRowModelGenerator} freezeRowGenerator - specifies the freezeRowGenerator
 * @param {Object[]} firstPageRecords - specifies the first page records
 * @returns {Row<Column>[]} returns the row
 * @hidden
 */
export function getReorderedFrozenRows(args, virtualRenderer, parent, freezeRowGenerator, firstPageRecords) {
    var bIndex = args.virtualInfo.blockIndexes;
    var colIndex = args.virtualInfo.columnIndexes;
    var page = args.virtualInfo.page;
    args.virtualInfo.blockIndexes = [1, 2];
    args.virtualInfo.page = 1;
    if (!args.renderMovableContent) {
        args.virtualInfo.columnIndexes = [];
    }
    var firstRecordslength = parent.getCurrentViewRecords().length;
    firstPageRecords = parent.renderModule.data.dataManager.dataSource.json.slice(0, firstRecordslength);
    var virtualRows = virtualRenderer.vgenerator.generateRows(firstPageRecords, args);
    var rows = splitReorderedRows(virtualRows, parent, args, freezeRowGenerator);
    args.virtualInfo.blockIndexes = bIndex;
    args.virtualInfo.columnIndexes = colIndex;
    args.virtualInfo.page = page;
    return rows.splice(0, parent.frozenRows);
}
/**
 * @param {Row<Column>[]} rows - specifies the row
 * @param {IGrid} parent - specifies the IGrid
 * @param {NotifyArgs} args - specifies the notify arguments
 * @param {FreezeRowModelGenerator} freezeRowGenerator - specifies the freezerowgenerator
 * @returns {Row<Column>[]} returns the row
 * @hidden
 */
export function splitReorderedRows(
// eslint-disable-next-line @typescript-eslint/no-unused-vars
rows, parent, args, freezeRowGenerator) {
    var tableName;
    if (args.renderMovableContent) {
        tableName = 'movable';
    }
    else if (args.renderFrozenRightContent) {
        tableName = 'frozen-right';
    }
    else {
        tableName = 'frozen-left';
    }
    for (var i = 0, len = rows.length; i < len; i++) {
        rows[i].cells = splitFrozenRowObjectCells(parent, rows[i].cells, tableName);
    }
    return rows;
}
/**
 * @param {VirtualContentRenderer} virtualRenderer - specifies the VirtualRenderer
 * @returns {boolean} returns the isXaxis
 * @hidden
 */
export function isXaxis(virtualRenderer) {
    var value = false;
    if (virtualRenderer) {
        value = virtualRenderer.requestType === 'virtualscroll'
            && virtualRenderer.currentInfo.sentinelInfo.axis === 'X';
    }
    return value;
}
/**
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtualrenderer
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Element[]} returns the element
 * @hidden
 */
export function getHeaderCells(virtualRenderer, parent) {
    var content = isXaxis(virtualRenderer) ? parent.getMovableVirtualHeader() : parent.getHeaderContent();
    return content ? [].slice.call(content.querySelectorAll('.e-headercell:not(.e-stackedheadercell)')) : [];
}
/**
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual Renderer
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Element} returns the element
 * @hidden
 */
export function getVirtualFreezeHeader(virtualRenderer, parent) {
    var headerTable;
    if (isXaxis(virtualRenderer)) {
        headerTable = parent.getMovableVirtualHeader().querySelector('.' + literals.table);
    }
    else {
        headerTable = parent.getFrozenVirtualHeader().querySelector('.' + literals.table);
    }
    return headerTable;
}
/**
 * @param {Column[]} columns - specifies the columns
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Column[]} returns the column[]
 * @hidden
 */
export function ensureFrozenCols(columns, parent) {
    var frozenCols = parent.columns.slice(0, parent.getFrozenColumns());
    columns = frozenCols.concat(columns);
    return columns;
}
/**
 * @param {Element} colGroup - specifies the colGroup
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {ColumnVirtualFreezeRenderer} instance - specifies the instances
 * @returns {Element} returns the element
 * @hidden
 */
export function setColGroup(colGroup, virtualRenderer, instance) {
    if (!isXaxis(virtualRenderer)) {
        if (!isNullOrUndefined(colGroup)) {
            colGroup.id = 'content-' + colGroup.id;
        }
        instance.colgroup = colGroup;
    }
    return instance.colgroup;
}
/**
 * @param {VirtualFreezeRenderer} instance - specifies the instance
 * @param {number} index - specifies the index
 * @returns {void}
 * @hidden
 */
export function setCache(instance, index) {
    if (instance.virtualRenderer.vgenerator.cache[1]) {
        instance.virtualRenderer.vgenerator.cache[1][index] = instance.frzRows[index];
    }
    else {
        instance.virtualRenderer.vgenerator.cache[1] = instance.frzRows;
    }
    if (instance.virtualRenderer.vgenerator.movableCache[1]) {
        instance.virtualRenderer.vgenerator.movableCache[1][index] = instance.mvblRows[index];
    }
    else {
        instance.virtualRenderer.vgenerator.movableCache[1] = instance.mvblRows;
    }
}
/**
 * @param {IGrid} parent - specifies the IGrid
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtualRenderer
 * @param {Element} scrollbar - specifies the scrollbr
 * @param {Element} mCont - specifies the mCont
 * @returns {void}
 * @hidden
 */
export function setDebounce(parent, virtualRenderer, scrollbar, mCont) {
    var debounceEvent = (parent.dataSource instanceof DataManager && !parent.dataSource.dataSource.offline);
    var opt = {
        container: virtualRenderer.content, pageHeight: virtualRenderer.getBlockHeight() * 2, debounceEvent: debounceEvent,
        axes: parent.enableColumnVirtualization ? ['X', 'Y'] : ['Y'], scrollbar: scrollbar,
        movableContainer: mCont
    };
    virtualRenderer.observer = new InterSectionObserver(virtualRenderer.virtualEle.wrapper, opt, virtualRenderer.virtualEle.movableWrapper);
}
/**
 * ColumnVirtualFreezeRenderer is used to render the virtual table within the frozen and movable content table
 *
 * @hidden
 */
var ColumnVirtualFreezeRenderer = /** @class */ (function (_super) {
    __extends(ColumnVirtualFreezeRenderer, _super);
    function ColumnVirtualFreezeRenderer(parent, locator) {
        var _this = _super.call(this, parent, locator) || this;
        /** @hidden */
        _this.frRows = [];
        /** @hidden */
        _this.frzRows = [];
        /** @hidden */
        _this.mvblRows = [];
        _this.serviceLoc = locator;
        _this.eventListener('on');
        _this.rowModelGenerator = new RowModelGenerator(_this.parent);
        return _this;
    }
    ColumnVirtualFreezeRenderer.prototype.actionComplete = function (args) {
        if (args.requestType === 'delete' && this.parent.frozenRows) {
            for (var i = 0; i < this.parent.frozenRows; i++) {
                if (this.virtualRenderer.vgenerator.frozenRightCache[1]) {
                    this.virtualRenderer.vgenerator.frozenRightCache[1][i] = this.frRows.length ? this.frRows[i] : this.frzRows[i];
                }
                else {
                    this.virtualRenderer.vgenerator.frozenRightCache[1] = this.frRows.length ? this.frRows : this.frzRows;
                    break;
                }
                setCache(this, i);
            }
        }
    };
    ColumnVirtualFreezeRenderer.prototype.eventListener = function (action) {
        this.parent.addEventListener(events.actionComplete, this.actionComplete.bind(this));
        this.parent[action](events.refreshVirtualFrozenRows, this.refreshVirtualFrozenRows, this);
        this.parent[action](events.getVirtualData, this.getVirtualData, this);
        this.parent[action](events.setFreezeSelection, this.setFreezeSelection, this);
    };
    ColumnVirtualFreezeRenderer.prototype.refreshVirtualFrozenRows = function (args) {
        var _this = this;
        if (args.requestType === 'delete' && this.parent.frozenRows) {
            args.isFrozenRowsRender = true;
            var query = this.parent.renderModule.data.generateQuery(true).clone();
            query.page(1, this.parent.pageSettings.pageSize);
            var selectedIdx_1 = this.parent.getSelectedRowIndexes();
            this.parent.renderModule.data.getData({}, query).then(function (e) {
                renderFrozenRows(args, e.result, selectedIdx_1, _this.parent, _this.rowModelGenerator, _this.serviceLoc, _this.virtualRenderer, _this);
            });
        }
    };
    ColumnVirtualFreezeRenderer.prototype.setFreezeSelection = function (args) {
        setFreezeSelection(args, this.virtualRenderer);
    };
    ColumnVirtualFreezeRenderer.prototype.getVirtualData = function (data) {
        this.virtualRenderer.getVirtualData(data);
    };
    ColumnVirtualFreezeRenderer.prototype.renderNextFrozentPart = function (e, tableName) {
        e.renderMovableContent = this.parent.getFrozenLeftCount() ? tableName === literals.frozenLeft : tableName === literals.frozenRight;
        e.renderFrozenRightContent = this.parent.getFrozenMode() === literals.leftRight && tableName === 'movable';
        if (e.renderMovableContent || e.renderFrozenRightContent) {
            this.refreshContentRows(extend({}, e));
        }
    };
    /**
     * @returns {void}
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.renderTable = function () {
        this.virtualRenderer = new VirtualContentRenderer(this.parent, this.serviceLoc);
        this.virtualRenderer.header = this.serviceLoc.getService('rendererFactory')
            .getRenderer(RenderType.Header).virtualHdrRenderer;
        this.freezeRowGenerator = new FreezeRowModelGenerator(this.parent);
        _super.prototype.renderTable.call(this);
        this.virtualRenderer.setPanel(this.parent.getContent());
        this.scrollbar = this.parent.getContent().querySelector('.e-movablescrollbar');
        var frozenRightCont = this.getFrozenRightContent();
        var frzCont = this.getFrozenContent();
        var movableCont = this.getMovableContent();
        if (this.parent.getFrozenMode() === 'Right') {
            frzCont = frozenRightCont;
        }
        this.virtualRenderer.virtualEle.content = this.virtualRenderer.content = this.getPanel().querySelector('.' + literals.content);
        this.virtualRenderer.virtualEle.content.style.overflowX = 'hidden';
        var minHeight = this.parent.height;
        this.virtualRenderer.virtualEle.renderFrozenWrapper(minHeight);
        this.virtualRenderer.virtualEle.renderFrozenPlaceHolder();
        this.renderVirtualFrozenLeft(frzCont, movableCont);
        this.renderVirtualFrozenRight(frzCont, movableCont);
        this.renderVirtualFrozenLeftRight(frzCont, movableCont, frozenRightCont);
        this.virtualRenderer.virtualEle.table = this.getTable();
        setDebounce(this.parent, this.virtualRenderer, this.scrollbar, this.getMovableContent());
    };
    ColumnVirtualFreezeRenderer.prototype.renderVirtualFrozenLeft = function (frzCont, movableCont) {
        if (this.parent.getFrozenMode() === 'Left') {
            this.virtualRenderer.virtualEle.wrapper.appendChild(frzCont);
            this.virtualRenderer.virtualEle.wrapper.appendChild(movableCont);
        }
    };
    ColumnVirtualFreezeRenderer.prototype.renderVirtualFrozenRight = function (frzCont, movableCont) {
        if (this.parent.getFrozenMode() === 'Right') {
            this.virtualRenderer.virtualEle.wrapper.appendChild(movableCont);
            this.virtualRenderer.virtualEle.wrapper.appendChild(frzCont);
        }
    };
    ColumnVirtualFreezeRenderer.prototype.renderVirtualFrozenLeftRight = function (frzCont, movableCont, frozenRightCont) {
        if (this.parent.getFrozenMode() === literals.leftRight) {
            this.virtualRenderer.virtualEle.wrapper.appendChild(frzCont);
            this.virtualRenderer.virtualEle.wrapper.appendChild(movableCont);
            this.virtualRenderer.virtualEle.wrapper.appendChild(frozenRightCont);
        }
    };
    /**
     * @param {HTMLElement} target - specifies the target
     * @param {DocumentFragment} newChild - specifies the newchild
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.appendContent = function (target, newChild, e) {
        appendContent(this.virtualRenderer, this.widthService, target, newChild, e);
        this.refreshScrollOffset();
    };
    /**
     * @param {Object[]} data - specifies the data
     * @param {NotifyArgs} e - specifies the notifyargs
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.generateRows = function (data, e) {
        if (!this.firstPageRecords) {
            this.firstPageRecords = data;
        }
        return generateRows(this.virtualRenderer, data, e, this.freezeRowGenerator, this.parent);
    };
    /**
     * @param {number} index - specifies the number
     * @returns {Element} returns the element
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.getRowByIndex = function (index) {
        return this.virtualRenderer.getRowByIndex(index);
    };
    /**
     * @param {number} index - specifies the index
     * @returns {Element} - returns the element
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.getFrozenRightRowByIndex = function (index) {
        return this.virtualRenderer.getFrozenRightVirtualRowByIndex(index);
    };
    ColumnVirtualFreezeRenderer.prototype.collectRows = function (tableName) {
        return collectRows(tableName, this.virtualRenderer, this.parent);
    };
    /**
     * @param {number} index - specifies the index
     * @returns {Element} returns the element
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.getMovableRowByIndex = function (index) {
        return this.virtualRenderer.getMovableVirtualRowByIndex(index);
    };
    /**
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.getFrozenRightRows = function () {
        return this.collectRows('frozen-right');
    };
    /**
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.getMovableRows = function () {
        return this.collectRows('movable');
    };
    /**
     * @returns {Element} returns the element
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.getColGroup = function () {
        var mCol = this.parent.getMovableVirtualContent();
        return isXaxis(this.virtualRenderer) ? mCol.querySelector(literals.colGroup) : this.colgroup;
    };
    /**
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.getRows = function () {
        return this.collectRows(this.parent.getFrozenMode() === 'Right' ? 'frozen-right' : 'frozen-left');
    };
    /**
     * @param {NotifyArgs} args - specifies the args
     * @returns {Row<Column>[]} returns the row object
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.getReorderedFrozenRows = function (args) {
        return getReorderedFrozenRows(args, this.virtualRenderer, this.parent, this.freezeRowGenerator, this.firstPageRecords);
    };
    ColumnVirtualFreezeRenderer.prototype.getHeaderCells = function () {
        return getHeaderCells(this.virtualRenderer, this.parent);
    };
    ColumnVirtualFreezeRenderer.prototype.isXaxis = function () {
        return isXaxis(this.virtualRenderer);
    };
    ColumnVirtualFreezeRenderer.prototype.getVirtualFreezeHeader = function () {
        return getVirtualFreezeHeader(this.virtualRenderer, this.parent);
    };
    /**
     * @param {number} index - specifies the index
     * @returns {object} - returns the object
     * @hidden
     */
    ColumnVirtualFreezeRenderer.prototype.getRowObjectByIndex = function (index) {
        return this.virtualRenderer.getRowObjectByIndex(index);
    };
    ColumnVirtualFreezeRenderer.prototype.ensureFrozenCols = function (columns) {
        return ensureFrozenCols(columns, this.parent);
    };
    /**
     * Set the header colgroup element
     *
     * @param {Element} colGroup - specifies the colgroup
     * @returns {Element} - returns the element
     */
    ColumnVirtualFreezeRenderer.prototype.setColGroup = function (colGroup) {
        return setColGroup(colGroup, this.virtualRenderer, this);
    };
    return ColumnVirtualFreezeRenderer;
}(ColumnFreezeContentRenderer));
export { ColumnVirtualFreezeRenderer };
