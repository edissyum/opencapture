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
import { isNullOrUndefined, extend } from '@syncfusion/ej2-base';
import { DataManager, Query, Deferred, Predicate, DataUtil } from '@syncfusion/ej2-data';
import { initForeignKeyColumn, getForeignKeyData, generateQuery } from '../base/constant';
import { getDatePredicate } from '../base/util';
import { Data } from './data';
import * as events from '../base/constant';
/**
 * `ForeignKey` module is used to handle foreign key column's actions.
 */
var ForeignKey = /** @class */ (function (_super) {
    __extends(ForeignKey, _super);
    function ForeignKey(parent, serviceLocator) {
        var _this = _super.call(this, parent, serviceLocator) || this;
        _this.parent = parent;
        _this.serviceLocator = serviceLocator;
        _this.initEvent();
        return _this;
    }
    ForeignKey.prototype.initEvent = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.on(initForeignKeyColumn, this.initForeignKeyColumns, this);
        this.parent.on(getForeignKeyData, this.getForeignKeyData, this);
        this.parent.on(generateQuery, this.generateQueryFormData, this);
    };
    ForeignKey.prototype.initForeignKeyColumns = function (columns) {
        for (var i = 0; i < columns.length; i++) {
            columns[i].dataSource = (columns[i].dataSource instanceof DataManager ? columns[i].dataSource :
                (isNullOrUndefined(columns[i].dataSource) ? new DataManager() : 'result' in columns[i].dataSource ? columns[i].dataSource :
                    new DataManager(columns[i].dataSource)));
        }
    };
    ForeignKey.prototype.eventfPromise = function (args, query, key, column) {
        var state = this.getStateEventArgument(query);
        var def = new Deferred();
        var deff = new Deferred();
        state.action = args.action;
        var dataModule = this.parent.getDataModule();
        if (!isNullOrUndefined(args.action) && args.action.requestType && dataModule.foreignKeyDataState.isDataChanged !== false) {
            dataModule.setForeignKeyDataState({
                isPending: true, resolver: deff.resolve
            });
            deff.promise.then(function () {
                def.resolve(column.dataSource);
            });
            state.setColumnData = this.parent.setForeignKeyData.bind(this.parent);
            this.parent.trigger(events.columnDataStateChange, state);
        }
        else {
            dataModule.setForeignKeyDataState({});
            def.resolve(key);
        }
        return def;
    };
    ForeignKey.prototype.getForeignKeyData = function (args) {
        var _this = this;
        var foreignColumns = args.column ? [args.column] : this.parent.getForeignKeyColumns();
        var allPromise = [];
        var _loop_1 = function (i) {
            var promise = void 0;
            var query = args.isComplex ? this_1.genarateColumnQuery(foreignColumns[i]) :
                this_1.genarateQuery(foreignColumns[i], args.result.result, false, true);
            query.params = this_1.parent.query.params;
            var dataSource = foreignColumns[i].dataSource;
            if (dataSource && 'result' in dataSource) {
                var def = this_1.eventfPromise(args, query, dataSource, foreignColumns[i]);
                promise = def.promise;
            }
            else if (!dataSource.ready || dataSource.dataSource.offline) {
                promise = dataSource.executeQuery(query);
            }
            else {
                promise = dataSource.ready.then(function () {
                    return dataSource.executeQuery(query);
                });
            }
            allPromise.push(promise);
        };
        var this_1 = this;
        for (var i = 0; i < foreignColumns.length; i++) {
            _loop_1(i);
        }
        Promise.all(allPromise).then(function (responses) {
            for (var i = 0; i < responses.length; i++) {
                foreignColumns[i].columnData = responses[i].result;
                if (foreignColumns[i].editType === 'dropdownedit' && 'result' in foreignColumns[i].dataSource) {
                    foreignColumns[i].edit.params = extend(foreignColumns[i].edit.params, {
                        dataSource: responses[i].result,
                        query: new Query(), fields: {
                            value: foreignColumns[i].foreignKeyField || foreignColumns[i].field,
                            text: foreignColumns[i].foreignKeyValue
                        }
                    });
                }
            }
            args.promise.resolve(args.result);
        }).catch(function (e) {
            _this.parent.log(['actionfailure', 'foreign_key_failure']);
            if (args.promise && args.promise.reject) {
                args.promise.reject(e);
            }
            return e;
        });
    };
    ForeignKey.prototype.generateQueryFormData = function (args) {
        args.predicate.predicate = this.genarateQuery(args.column, args.column.columnData, true);
    };
    ForeignKey.prototype.genarateQuery = function (column, e, fromData, needQuery) {
        var gObj = this.parent;
        var predicates = [];
        var query = new Query();
        var field = fromData ? column.foreignKeyField : column.field;
        if (gObj.allowPaging || gObj.enableVirtualization || fromData) {
            e = new DataManager(((gObj.allowGrouping && gObj.groupSettings.columns.length && !fromData) ?
                e.records : e)).executeLocal(new Query().select(field));
            var filteredValue = DataUtil.distinct(e, field, false);
            field = fromData ? column.field : column.foreignKeyField;
            for (var i = 0; i < filteredValue.length; i++) {
                if (filteredValue[i] && filteredValue[i].getDay) {
                    predicates.push(getDatePredicate({ field: field, operator: 'equal', value: filteredValue[i], matchCase: false }));
                }
                else {
                    predicates.push(new Predicate(field, 'equal', filteredValue[i], false));
                }
            }
        }
        if (needQuery) {
            return predicates.length ? query.where(Predicate.or(predicates)) : query;
        }
        return (predicates.length ? Predicate.or(predicates) : { predicates: [] });
    };
    ForeignKey.prototype.genarateColumnQuery = function (column) {
        var gObj = this.parent;
        var query = new Query();
        var queryColumn = this.isFiltered(column);
        if (queryColumn.isTrue) {
            query = this.filterQuery(query, queryColumn.column, true);
        }
        if (gObj.searchSettings.key.length) {
            var sSettings = gObj.searchSettings;
            if (column.dataSource instanceof DataManager && (column.dataSource.adaptor.getModuleName &&
                column.dataSource.adaptor.getModuleName() === 'ODataV4Adaptor')) {
                query = this.searchQuery(query, column, true);
            }
            else {
                query.search(sSettings.key, column.foreignKeyValue, sSettings.operator, sSettings.ignoreCase);
            }
        }
        return query;
    };
    ForeignKey.prototype.isFiltered = function (column) {
        var filterColumn = this.parent.filterSettings.columns.filter(function (fColumn) {
            return (fColumn.field === column.foreignKeyValue && fColumn.uid === column.uid);
        });
        return {
            column: filterColumn, isTrue: !!filterColumn.length
        };
    };
    ForeignKey.prototype.getModuleName = function () {
        return 'foreignKey';
    };
    ForeignKey.prototype.destroy = function () {
        this.destroyEvent();
    };
    ForeignKey.prototype.destroyEvent = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off(initForeignKeyColumn, this.initForeignKeyColumns);
        this.parent.off(getForeignKeyData, this.getForeignKeyData);
        this.parent.off(generateQuery, this.generateQueryFormData);
    };
    return ForeignKey;
}(Data));
export { ForeignKey };
