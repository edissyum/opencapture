/**
 *
 * `Logger` class
 */
import { isNullOrUndefined, L10n, isUndefined } from '@syncfusion/ej2-base';
import { DataUtil, DataManager } from '@syncfusion/ej2-data';
var BASE_DOC_URL = 'https://ej2.syncfusion.com/documentation/grid';
var DOC_URL = 'https://ej2.syncfusion.com/documentation/';
var WARNING = '[EJ2Grid.Warning]';
var ERROR = '[EJ2Grid.Error]';
var INFO = '[EJ2Grid.Info]';
var Logger = /** @class */ (function () {
    function Logger(parent) {
        this.parent = parent;
        this.parent.on('initial-end', this.patchadaptor, this);
    }
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
                // eslint-disable-next-line no-console
                console[item.logType](item.generateMessage(args, this.parent, cOp.options));
            }
        }
    };
    Logger.prototype.patchadaptor = function () {
        var adaptor = this.parent.getDataModule().dataManager.adaptor;
        var original = adaptor.beforeSend;
        if (original) {
            adaptor.beforeSend = function (dm, request, settings) {
                original.call(adaptor, dm, request, settings);
            };
        }
    };
    Logger.prototype.destroy = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('initial-end', this.patchadaptor);
    };
    return Logger;
}());
export { Logger };
export var detailLists = {
    // eslint-disable-next-line camelcase
    module_missing: {
        type: 'module_missing',
        logType: 'warn',
        check: function (args, parent) {
            var injected = parent.getInjectedModules().map(function (m) { return m.prototype.getModuleName(); });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var modules = parent.requiredModules().map(function (m) { return m.member; })
                .filter(function (name) { return injected.indexOf(name) === -1; });
            return { success: modules.filter(function (m) { return m !== 'resize'; }).length > 0, options: modules };
        },
        generateMessage: function (args, parent, modules) {
            modules = modules.filter(function (m) { return m !== 'resize'; })
                .reduce(function (prev, cur) { return prev + ("* " + cur + "\n"); }, '');
            return WARNING + ': MODULES MISSING\n' + 'The following modules are not injected:.\n' +
                ("" + modules) +
                ("Refer to " + BASE_DOC_URL + "/module.html for documentation on importing feature modules.");
        }
    },
    // eslint-disable-next-line camelcase
    promise_enabled: {
        type: 'promise_enabled',
        logType: 'error',
        check: function () {
            return { success: typeof Promise === 'undefined' };
        },
        generateMessage: function () {
            return ERROR + ': PROMISE UNDEFINED\n' +
                'Promise object is not present in the global environment,' +
                'please use polyfil to support Promise object in your environment.\n' +
                ("Refer to " + DOC_URL + "/base/browser.html?#required-polyfills for more information.");
        }
    },
    // eslint-disable-next-line camelcase
    primary_column_missing: {
        type: 'primary_column_missing',
        logType: 'warn',
        check: function (args, parent) {
            return { success: parent.getColumns().filter(function (column) { return column.isPrimaryKey; }).length === 0 };
        },
        generateMessage: function () {
            return WARNING + ': PRIMARY KEY MISSING\n' + 'Editing is enabled but primary key column is not specified.\n' +
                ("Refer to " + BASE_DOC_URL + "/api-column.html?#isprimarykey for documentation on providing primary key columns.");
        }
    },
    // eslint-disable-next-line camelcase
    selection_key_missing: {
        type: 'selection_key_missing',
        logType: 'warn',
        check: function (args, parent) {
            return { success: parent.selectionSettings.persistSelection &&
                    parent.getColumns().filter(function (column) { return column.isPrimaryKey; }).length === 0 };
        },
        generateMessage: function () {
            return WARNING + ': PRIMARY KEY MISSING\n' +
                'selectionSettings.persistSelection property is enabled. It requires one primary key column to persist selection.\n' +
                ("Refer to " + BASE_DOC_URL + "/api-column.html?#isprimarykey for documentation on providing primary key columns.");
        }
    },
    actionfailure: {
        type: 'actionfailure',
        logType: 'error',
        check: function () {
            return { success: true };
        },
        generateMessage: function (args, parent) {
            var message = '';
            var formatError = formatErrorHandler(args, parent);
            var ajaxError = ajaxErrorHandler(args, parent);
            if (ajaxError !== '') {
                message = ajaxError;
            }
            else if (formatError !== '') {
                message = formatError;
            }
            else {
                message = args.error;
            }
            return WARNING + ': ' + message;
        }
    },
    // eslint-disable-next-line camelcase
    locale_missing: {
        type: 'locale_missing',
        logType: 'warn',
        check: function (args, parent) {
            var lObj = DataUtil.getObject("locale." + parent.locale + ".grid", L10n);
            return { success: parent.locale !== 'en-US' && isNullOrUndefined(lObj) };
        },
        generateMessage: function (args, parent) {
            return WARNING + ': LOCALE CONFIG MISSING\n' + ("Locale configuration for '" + parent.locale + "' is not provided.\n") +
                ("Refer to " + BASE_DOC_URL + "/globalization-and-localization.html?#localization \n             for documentation on setting locale configuration.");
        }
    },
    limitation: {
        type: 'limitation',
        logType: 'warn',
        check: function (args, parent) {
            var name = args;
            var opt;
            switch (name) {
                case 'freeze':
                    opt = {
                        success: parent.allowGrouping || !isUndefined(parent.detailTemplate) || !isUndefined(parent.childGrid)
                            || !isUndefined(parent.rowTemplate) || parent.enableVirtualization,
                        options: { name: 'freeze' }
                    };
                    break;
                case 'virtualization':
                    opt = {
                        success: !isUndefined(parent.detailTemplate) || !isUndefined(parent.childGrid) || parent.frozenRows !== 0
                            || parent.frozenColumns !== 0,
                        options: { name: 'virtualization' }
                    };
                    break;
                default:
                    opt = { success: false };
                    break;
            }
            return opt;
        },
        generateMessage: function (args, parent, options) {
            var name = options.name;
            var opt;
            switch (name) {
                case 'freeze':
                    opt = 'Frozen rows and columns do not support the following features:\n' +
                        '* Virtualization\n' +
                        '* Row Template\n' +
                        '* Details Template\n' +
                        '* Hierarchy Grid\n' +
                        '* Grouping';
                    break;
                case 'virtualization':
                    opt = 'Virtualization does not support the following features.\n' +
                        '* Freeze rows and columns.\n' +
                        '* Details Template.\n' +
                        '* Hierarchy Grid.\n';
                    break;
                default:
                    opt = '';
                    break;
            }
            return WARNING + (": " + name.toUpperCase() + " LIMITATIONS\n") + opt;
        }
    },
    // eslint-disable-next-line camelcase
    check_datasource_columns: {
        type: 'check_datasource_columns',
        logType: 'warn',
        check: function (args, parent) {
            return { success: !(parent.columns.length ||
                    (parent.dataSource instanceof DataManager) || parent.dataSource.length) };
        },
        generateMessage: function () {
            return WARNING + ': GRID CONFIG MISSING\n' + 'dataSource and columns are not provided in the grid. ' +
                'At least one of either must be provided for grid configuration.\n' +
                ("Refer to " + BASE_DOC_URL + "/columns.html for documentation on configuring the grid data and columns.");
        }
    },
    // eslint-disable-next-line camelcase
    virtual_height: {
        type: 'virtual_height',
        logType: 'error',
        check: function (args, parent) {
            return { success: isNullOrUndefined(parent.height) || parent.height === 'auto' };
        },
        generateMessage: function () {
            return ERROR + ': GRID HEIGHT MISSING \n' + 'height property is required to use virtualization.\n' +
                ("Refer to " + BASE_DOC_URL + "/virtual.html for documentation on configuring the virtual grid.");
        }
    },
    // eslint-disable-next-line camelcase
    grid_remote_edit: {
        type: 'grid_remote_edit',
        logType: 'error',
        check: function (args) {
            return { success: Array.isArray(args) || Array.isArray(args.result) };
        },
        generateMessage: function () {
            return ERROR + ': RETRUN VALUE MISSING  \n' +
                'Remote service returns invalid data. \n' +
                ("Refer to " + BASE_DOC_URL + "/edit.html for documentation on configuring editing with remote data.");
        }
    },
    // eslint-disable-next-line camelcase
    grid_sort_comparer: {
        type: 'grid_sort_comparer',
        logType: 'warn',
        check: function (args, parent) {
            return { success: parent.getDataModule().isRemote() };
        },
        generateMessage: function () {
            return WARNING + ': SORT COMPARER NOT WORKING  \n' + 'Sort comparer will not work with remote data.' +
                ("Refer to " + BASE_DOC_URL + "/sorting/#custom-sort-comparer for documentation on using the sort comparer.");
        }
    },
    // eslint-disable-next-line camelcase
    resize_min_max: {
        type: 'resize_min_max',
        logType: 'info',
        check: function (args) {
            return { success: (args.column.minWidth && args.column.minWidth >= args.width) ||
                    (args.column.maxWidth && args.column.maxWidth <= args.width) };
        },
        generateMessage: function () {
            return INFO + ': RESIZING COLUMN REACHED MIN OR MAX  \n' + 'The column resizing width is at its min or max.';
        }
    },
    // eslint-disable-next-line camelcase
    action_disabled_column: {
        type: 'action_disabled_column',
        logType: 'info',
        check: function (args) {
            var success = true;
            var fn;
            switch (args.moduleName) {
                case 'reorder':
                    if (isNullOrUndefined(args.destColumn)) {
                        fn = "reordering action is disabled for the " + args.column.headerText + " column";
                    }
                    else {
                        fn = "reordering action is disabled for the " + (args.column.allowReordering ?
                            args.destColumn.headerText : args.column.headerText) + " column";
                    }
                    break;
                case 'group':
                    fn = "grouping action is disabled for the " + args.columnName + " column.";
                    break;
                case 'filter':
                    fn = "filtering action is disabled for the " + args.columnName + " column.";
                    break;
                case 'sort':
                    fn = "sorting action is disabled for the " + args.columnName + " column.";
                    break;
            }
            return { success: success, options: { fn: fn } };
        },
        generateMessage: function (args, parent, options) {
            return INFO + (": ACTION DISABLED \n " + options.fn);
        }
    },
    // eslint-disable-next-line camelcase
    exporting_begin: {
        type: 'exporting_begin',
        logType: 'info',
        check: function (args) {
            return { success: true, options: { args: args } };
        },
        generateMessage: function (args, parent, options) {
            return INFO + (": EXPORTNIG INPROGRESS \n Grid " + options.args + "ing is in progress");
        }
    },
    // eslint-disable-next-line camelcase
    exporting_complete: {
        type: 'exporting_complete',
        logType: 'info',
        check: function (args) {
            return { success: true, options: { args: args } };
        },
        generateMessage: function (args, parent, options) {
            return INFO + (": EXPORTNIG COMPLETED \n Grid " + options.args + "ing is complete");
        }
    },
    // eslint-disable-next-line camelcase
    foreign_key_failure: {
        type: 'foreign_key_failure',
        logType: 'error',
        check: function () {
            return { success: true };
        },
        generateMessage: function () {
            return ERROR + ': FOREIGNKEY CONFIG \n  Grid foreign key column needs a valid data source/service.' +
                ("Refer to " + BASE_DOC_URL + "/columns/#foreign-key-column for documentation on configuring foreign key columns.");
        }
    },
    // eslint-disable-next-line camelcase
    initial_action: {
        type: 'initial_action',
        logType: 'error',
        check: function (args) {
            var success = true;
            var fn;
            switch (args.moduleName) {
                case 'group':
                    fn = "The " + args.columnName + " column is not available in the grid's column model." +
                        'Please provide a valid field name to group the column';
                    break;
                case 'filter':
                    fn = "The " + args.columnName + " column is not available in the grid's column model." +
                        'Please provide a valid field name to filter the column.';
                    break;
                case 'sort':
                    fn = "The " + args.columnName + " column is not available in the grid's column model." +
                        'Please provide a valid field name to sort the column.';
                    break;
            }
            return { success: success, options: { fn: fn } };
        },
        generateMessage: function (args, parent, options) {
            return ERROR + (": INITIAL ACTION FAILURE \n " + options.fn);
        }
    },
    // eslint-disable-next-line camelcase
    frozen_rows_columns: {
        type: 'frozen_rows_columns',
        logType: 'error',
        check: function (args, parent) {
            return { success: parent.getColumns().length <= parent.frozenColumns || parent.frozenRows >= parent.currentViewData.length };
        },
        generateMessage: function (args, parent) {
            return ERROR + (": OUT OF RANGE ERROR-\n " + (parent.getColumns().length <= parent.frozenColumns ? 'FROZEN COLUMNS,' : '')) +
                ((parent.frozenRows >= parent.currentViewData.length ? 'FROZEN ROWS' : '') + " invalid");
        }
    },
    // eslint-disable-next-line camelcase
    column_type_missing: {
        type: 'column_type_missing',
        logType: 'error',
        check: function (args) {
            return { success: isNullOrUndefined(args.column.type), options: args.column.headerText };
        },
        generateMessage: function (args, parent, options) {
            return ERROR + (": COLUMN TYPE MISSING-\n  " + options + " column type was invalid or not defined.") +
                ("Please go through below help link: " + DOC_URL + "/grid/columns/#column-type");
        }
    },
    // eslint-disable-next-line camelcase
    datasource_syntax_mismatch: {
        type: 'datasource_syntax_mismatch',
        logType: 'warn',
        check: function (args) {
            return { success: args.dataState.dataSource && !(args.dataState.dataSource instanceof DataManager ||
                    'result' in args.dataState.dataSource || args.dataState.dataSource instanceof Array) &&
                    !(isNullOrUndefined(args.dataState.dataStateChange)) };
        },
        generateMessage: function () {
            return WARNING + ': DATASOURCE SYNTAX WARNING\n' +
                'DataSource should be in the form of {result: Object[], count: number}' +
                'when dataStateChangeEvent used';
        }
    }
};
var formatErrorHandler = function (args) {
    var error = args.error;
    if (error.indexOf && error.indexOf('Format options') !== 0) {
        return '';
    }
    return 'INVALID FORMAT\n' +
        'For more information, refer to the following documentation links:\n' +
        ("Number format: " + DOC_URL + "/base/intl.html?#supported-format-string.\n") +
        ("Date format: " + DOC_URL + "/base/intl.html?#manipulating-datetime.\n") +
        ("Message: " + error);
};
var ajaxErrorHandler = function (args) {
    var error = DataUtil.getObject('error.error', args);
    if (isNullOrUndefined(error)) {
        return '';
    }
    var jsonResult = '';
    try {
        jsonResult = JSON.parse(error.responseText);
    }
    catch (_a) {
        jsonResult = '';
    }
    return 'XMLHTTPREQUEST FAILED\n' +
        ("Url: " + error.responseURL + "\n") +
        ("Status: " + error.status + " - " + error.statusText + "\n") +
        ("" + (jsonResult !== '' ? 'Message: ' + jsonResult : ''));
};
