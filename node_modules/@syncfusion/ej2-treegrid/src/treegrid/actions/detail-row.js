import { Grid, getObject } from '@syncfusion/ej2-grids';
import { DetailRow as detailrow } from '@syncfusion/ej2-grids';
import { isNullOrUndefined, addClass } from '@syncfusion/ej2-base';
import { getExpandStatus, isRemoteData } from '../utils';
/**
 * TreeGrid Detail Row module
 *
 * @hidden
 */
var DetailRow = /** @class */ (function () {
    function DetailRow(parent) {
        Grid.Inject(detailrow);
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * @hidden
     */
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns DetailRow module name
     */
    DetailRow.prototype.getModuleName = function () {
        return 'detailRow';
    };
    DetailRow.prototype.addEventListener = function () {
        this.parent.on('dataBoundArg', this.dataBoundArg, this);
        this.parent.on('detaildataBound', this.detaildataBound, this);
        this.parent.grid.on('detail-indentcell-info', this.setIndentVisibility, this);
        this.parent.on('childRowExpand', this.childRowExpand, this);
        this.parent.on('rowExpandCollapse', this.rowExpandCollapse, this);
        this.parent.on('actioncomplete', this.actioncomplete, this);
    };
    /**
     * @hidden
     * @returns {void}
     */
    DetailRow.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('dataBoundArg', this.dataBoundArg);
        this.parent.off('detaildataBound', this.detaildataBound);
        this.parent.off('childRowExpand', this.childRowExpand);
        this.parent.off('rowExpandCollapse', this.rowExpandCollapse);
        this.parent.off('actioncomplete', this.actioncomplete);
        this.parent.grid.off('detail-indentcell-info', this.setIndentVisibility);
    };
    DetailRow.prototype.setIndentVisibility = function (args) {
        var visible = 'visible';
        args[visible] = false;
    };
    DetailRow.prototype.dataBoundArg = function () {
        var detailele = this.parent.getRows().filter(function (e) {
            return !e.classList.contains('e-detailrow');
        });
        for (var i = 0; i < detailele.length; i++) {
            var elements = detailele[i].getElementsByClassName('e-detailrowcollapse');
            var detailData = this.parent.grid.getRowObjectFromUID(detailele[i].getAttribute('data-Uid'));
            var parentItem = getObject('parentItem', this.parent.grid.getCurrentViewRecords()[i]);
            if (isNullOrUndefined(parentItem) || !isNullOrUndefined(parentItem) &&
                getExpandStatus(this.parent, detailData.data, this.parent.grid.getCurrentViewRecords())) {
                this.parent.grid.detailRowModule.expand(elements[0]);
            }
        }
    };
    DetailRow.prototype.childRowExpand = function (args) {
        var detailRowElement = args.row.getElementsByClassName('e-detailrowcollapse');
        if (!isNullOrUndefined(detailRowElement[0])) {
            this.parent.grid.detailRowModule.expand(detailRowElement[0]);
        }
    };
    DetailRow.prototype.rowExpandCollapse = function (args) {
        if (isRemoteData(this.parent)) {
            return;
        }
        for (var i = 0; i < args.detailrows.length; i++) {
            args.detailrows[i].style.display = args.action;
        }
    };
    DetailRow.prototype.detaildataBound = function (args) {
        var data = args.data;
        var row = args.detailElement.parentElement.previousSibling;
        var index = !isNullOrUndefined(data.parentItem) ? data.parentItem.index : data.index;
        var expandClass = 'e-gridrowindex' + index + 'level' + data.level;
        var classlist = row.querySelector('.' + expandClass).classList;
        var gridClas = [].slice.call(classlist).filter(function (gridclass) { return (gridclass === expandClass); });
        var newNo = gridClas[0].length;
        var slicedclas = gridClas.toString().slice(6, newNo);
        var detailClass = 'e-griddetail' + slicedclas;
        addClass([args.detailElement.parentElement], detailClass);
    };
    DetailRow.prototype.actioncomplete = function (args) {
        if (args.requestType === 'beginEdit' || args.requestType === 'add') {
            var spann = (args.row.querySelectorAll('.e-editcell')[0].getAttribute('colSpan'));
            var colum = parseInt(spann, 10) - 1;
            var updtdcolum = colum.toString();
            args.row.querySelectorAll('.e-editcell')[0].setAttribute('colSpan', updtdcolum);
        }
        var focusElement = this.parent.grid.contentModule.getRows();
        for (var i = 0; i < focusElement.length; i++) {
            focusElement[i].cells[0].visible = false;
        }
        var focusModule = getObject('focusModule', this.parent.grid);
        var matrix = 'refreshMatrix';
        focusModule[matrix](true)({ rows: this.parent.grid.contentModule.getRows() });
    };
    /**
     * Destroys the DetailModule.
     *
     * @function destroy
     * @returns {void}
     */
    DetailRow.prototype.destroy = function () {
        this.removeEventListener();
    };
    return DetailRow;
}());
export { DetailRow };
