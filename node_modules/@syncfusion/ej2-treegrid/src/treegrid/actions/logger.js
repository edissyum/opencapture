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
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { Logger as GridLogger, Grid, detailLists } from '@syncfusion/ej2-grids';
/**
 * Logger module for TreeGrid
 *
 * @hidden
 */
var DOC_URL = 'https://ej2.syncfusion.com/documentation/treegrid';
var BASE_DOC_URL = 'https://ej2.syncfusion.com/documentation';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var WARNING = '[EJ2TreeGrid.Warning]';
var ERROR = '[EJ2TreeGrid.Error]';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var INFO = '[EJ2TreeGrid.Info]';
var IsRowDDEnabled = false;
var Logger = /** @class */ (function (_super) {
    __extends(Logger, _super);
    function Logger(parent) {
        var _this = this;
        Grid.Inject(GridLogger);
        _this = _super.call(this, parent) || this;
        return _this;
    }
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Returns Logger module name
     */
    Logger.prototype.getModuleName = function () {
        return 'logger';
    };
    Logger.prototype.log = function (types, args) {
        if (!(types instanceof Array)) {
            types = [types];
        }
        var type = types;
        for (var i = 0; i < type.length; i++) {
            var item = detailLists[type[i]];
            var cOp = item.check(args, this.parent);
            if (cOp.success) {
                var message = item.generateMessage(args, this.parent, cOp.options);
                message = message.replace('EJ2Grid', 'EJ2TreeGrid').replace('* Hierarchy Grid', '').replace('* Grouping', '');
                if (IsRowDDEnabled && type[i] === 'primary_column_missing') {
                    message = message.replace('Editing', 'Row DragAndDrop');
                    IsRowDDEnabled = false;
                }
                var index = message.indexOf('https');
                var gridurl = message.substring(index);
                if (type[i] === 'module_missing') {
                    message = message.replace(gridurl, DOC_URL + '/modules');
                }
                else if (type[i] === 'primary_column_missing' || type[i] === 'selection_key_missing') {
                    message = message.replace(gridurl, BASE_DOC_URL + '/api/treegrid/column/#isprimarykey');
                }
                else if (type[i] === 'grid_remote_edit') {
                    message = message.replace(gridurl, DOC_URL + '/edit');
                }
                else if (type[i] === 'virtual_height') {
                    message = message.replace(gridurl, DOC_URL + '/virtual');
                }
                else if (type[i] === 'check_datasource_columns') {
                    message = message.replace(gridurl, DOC_URL + '/columns');
                }
                else if (type[i] === 'locale_missing') {
                    message = message.replace(gridurl, DOC_URL + '/global-local/#localization');
                }
                if (type[i] === 'datasource_syntax_mismatch') {
                    if (!isNullOrUndefined(this.treeGridObj) && !isNullOrUndefined(this.treeGridObj.dataStateChange)) {
                        // eslint-disable-next-line no-console
                        console[item.logType](message);
                    }
                }
                else {
                    // eslint-disable-next-line no-console
                    console[item.logType](message);
                }
            }
        }
    };
    Logger.prototype.treeLog = function (types, args, treeGrid) {
        this.treeGridObj = treeGrid;
        if (!(types instanceof Array)) {
            types = [types];
        }
        var type = types;
        if (treeGrid.allowRowDragAndDrop && !treeGrid.columns.filter(function (column) { return column.isPrimaryKey; }).length) {
            IsRowDDEnabled = true;
            this.log('primary_column_missing', args);
        }
        for (var i = 0; i < type.length; i++) {
            var item = treeGridDetails[type[i]];
            var cOp = item.check(args, treeGrid);
            if (cOp.success) {
                var message = item.generateMessage(args, treeGrid, cOp.options);
                // eslint-disable-next-line no-console
                console[item.logType](message);
            }
        }
    };
    return Logger;
}(GridLogger));
export { Logger };
export var treeGridDetails = {
    // eslint-disable-next-line camelcase
    mapping_fields_missing: {
        type: 'mapping_fields_missing',
        logType: 'error',
        check: function (args, parent) {
            var opt = { success: false };
            if ((isNullOrUndefined(parent.idMapping) && isNullOrUndefined(parent.childMapping)
                && isNullOrUndefined(parent.parentIdMapping)) ||
                (!isNullOrUndefined(parent.idMapping) && isNullOrUndefined(parent.parentIdMapping)) ||
                (isNullOrUndefined(parent.idMapping) && !isNullOrUndefined(parent.parentIdMapping))) {
                opt = { success: true };
            }
            return opt;
        },
        generateMessage: function () {
            return ERROR + ':' + ' MAPPING FIELDS MISSING \n' + 'One of the following fields is missing. It is ' +
                'required for the hierarchical relationship of records in TreeGrid:\n' +
                '* childMapping\n' + '* idMapping\n' + '* parentIdMapping\n' +
                'Refer to the following documentation links for more details.\n' +
                (BASE_DOC_URL + "/api/treegrid#childmapping") + '\n' +
                (BASE_DOC_URL + "/api/treegrid#idmapping") + '\n' +
                (BASE_DOC_URL + "/api/treegrid#$parentidmapping");
        }
    }
};
