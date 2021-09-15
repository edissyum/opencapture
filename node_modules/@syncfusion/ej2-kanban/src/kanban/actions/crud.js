import { isNullOrUndefined, closest } from '@syncfusion/ej2-base';
import * as events from '../base/constant';
import * as cls from '../base/css-constant';
/**
 * Kanban CRUD module
 */
var Crud = /** @class */ (function () {
    /**
     * Constructor for CRUD module
     *
     * @param {Kanban} parent Accepts the kanban instance
     * @private
     */
    function Crud(parent) {
        this.parent = parent;
    }
    Crud.prototype.addCard = function (cardData, index) {
        var _this = this;
        var args = {
            cancel: false, requestType: 'cardCreate', addedRecords: (cardData instanceof Array) ? cardData : [cardData],
            changedRecords: [], deletedRecords: []
        };
        this.parent.trigger(events.actionBegin, args, function (addArgs) {
            if (!addArgs.cancel) {
                var modifiedData_1 = [];
                if (_this.parent.sortSettings.field && _this.parent.sortSettings.sortBy === 'Index') {
                    if (cardData instanceof Array) {
                        modifiedData_1 = cardData;
                    }
                    else {
                        modifiedData_1.push(cardData);
                    }
                    modifiedData_1.forEach(function (data, index) {
                        if (!data[_this.parent.sortSettings.field]) {
                            var columnData = _this.parent.getColumnData(data[_this.parent.keyField]);
                            if (_this.parent.sortSettings.direction === 'Ascending' && columnData.length > 0) {
                                data[_this.parent.sortSettings.field] = (columnData[columnData.length - 1][_this.parent.sortSettings.field]) + index + 1;
                            }
                            else if (_this.parent.sortSettings.direction === 'Descending' && columnData.length > 0) {
                                data[_this.parent.sortSettings.field] = columnData[0][_this.parent.sortSettings.field] + index + 1;
                            }
                            if (columnData.length === 0) {
                                data[_this.parent.sortSettings.field] = 1;
                            }
                        }
                    });
                    if (!(cardData instanceof Array)) {
                        if (!index && _this.parent.sortSettings.direction === 'Descending') {
                            _this.parent.getColumnData(modifiedData_1[0][_this.parent.keyField]).filter(function (obj, count) {
                                if (obj[_this.parent.sortSettings.field] === modifiedData_1[0][_this.parent.sortSettings.field]) {
                                    index = count + 1;
                                }
                            });
                        }
                    }
                    if (index !== 0 && !index && _this.parent.sortSettings.direction === 'Descending') {
                        index = 0;
                    }
                    modifiedData_1 = _this.priorityOrder(modifiedData_1, index);
                }
                var addedRecords = (cardData instanceof Array) ? cardData : [cardData];
                var changedRecords = (_this.parent.sortSettings.field && _this.parent.sortSettings.sortBy === 'Index') ? modifiedData_1 : [];
                var editParms = { addedRecords: addedRecords, changedRecords: changedRecords, deletedRecords: [] };
                var type = (cardData instanceof Array || modifiedData_1.length > 0) ? 'batch' : 'insert';
                _this.parent.dataModule.updateDataManager(type, editParms, 'cardCreated', cardData, index);
            }
        });
    };
    Crud.prototype.getIndexFromData = function (data) {
        var cardElement = this.parent.element.querySelector("." + cls.CARD_CLASS + "[data-id=\"" + data[this.parent.cardSettings.headerField] + "\"]");
        var element = closest(cardElement, '.' + cls.CONTENT_CELLS_CLASS);
        var index = [].slice.call(element.querySelectorAll('.' + cls.CARD_CLASS)).indexOf(cardElement);
        return index;
    };
    Crud.prototype.updateCard = function (cardData, index) {
        var _this = this;
        var args = {
            requestType: 'cardChange', cancel: false, addedRecords: [],
            changedRecords: (cardData instanceof Array) ? cardData : [cardData], deletedRecords: []
        };
        index = isNullOrUndefined(index) ? this.getIndexFromData(args.changedRecords[0]) : index;
        this.parent.trigger(events.actionBegin, args, function (updateArgs) {
            if (!updateArgs.cancel) {
                if (_this.parent.sortSettings.field && _this.parent.sortSettings.sortBy === 'Index') {
                    var modifiedData = [];
                    if (cardData instanceof Array) {
                        modifiedData = cardData;
                    }
                    else {
                        modifiedData.push(cardData);
                    }
                    cardData = _this.priorityOrder(modifiedData, index);
                }
                var editParms = {
                    addedRecords: [], changedRecords: (cardData instanceof Array) ? cardData : [cardData], deletedRecords: []
                };
                var type = (cardData instanceof Array) ? 'batch' : 'update';
                _this.parent.dataModule.updateDataManager(type, editParms, 'cardChanged', cardData, index);
            }
        });
    };
    Crud.prototype.deleteCard = function (cardData) {
        var _this = this;
        var editParms = { addedRecords: [], changedRecords: [], deletedRecords: [] };
        if (typeof cardData === 'string' || typeof cardData === 'number') {
            editParms.deletedRecords = this.parent.kanbanData.filter(function (data) {
                return data[_this.parent.cardSettings.headerField] === cardData;
            });
        }
        else {
            editParms.deletedRecords = (cardData instanceof Array) ? cardData : [cardData];
        }
        var args = {
            requestType: 'cardRemove', cancel: false, addedRecords: [], changedRecords: [], deletedRecords: editParms.deletedRecords
        };
        this.parent.trigger(events.actionBegin, args, function (deleteArgs) {
            if (!deleteArgs.cancel) {
                var type = (editParms.deletedRecords.length > 1) ? 'batch' : 'delete';
                var cardData_1 = editParms.deletedRecords;
                _this.parent.dataModule.updateDataManager(type, editParms, 'cardRemoved', cardData_1[0]);
            }
        });
    };
    Crud.prototype.priorityOrder = function (cardData, cardIndex) {
        var _this = this;
        var cardsId = cardData.map(function (obj) { return obj[_this.parent.cardSettings.headerField]; });
        var num = cardData[cardData.length - 1][this.parent.sortSettings.field];
        var allModifiedKeys = cardData.map(function (obj) { return obj[_this.parent.keyField]; });
        var modifiedKey = allModifiedKeys.filter(function (key, index) { return allModifiedKeys.indexOf(key) === index; }).sort();
        var columnAllDatas;
        var finalData = [];
        var originalIndex = [];
        var _loop_1 = function (columnKey) {
            var keyData = cardData.filter(function (cardObj) {
                return cardObj[_this.parent.keyField] === columnKey;
            });
            columnAllDatas = this_1.parent.layoutModule.getColumnData(columnKey);
            for (var _i = 0, _a = keyData; _i < _a.length; _i++) {
                var data = _a[_i];
                if (this_1.parent.swimlaneSettings.keyField) {
                    var swimlaneDatas = this_1.parent.getSwimlaneData(data[this_1.parent.swimlaneSettings.keyField]);
                    columnAllDatas = this_1.parent.getColumnData(columnKey, swimlaneDatas);
                }
            }
            keyData.forEach(function (key) { return finalData.push(key); });
            if (!isNullOrUndefined(cardIndex)) {
                var _loop_2 = function (j) {
                    columnAllDatas.filter(function (data, index) {
                        if (data[_this.parent.cardSettings.headerField] === cardsId[j] && index <= cardIndex) {
                            originalIndex.push(index);
                        }
                    });
                };
                for (var j = 0; j < cardsId.length; j++) {
                    _loop_2(j);
                }
                if (originalIndex.length > 0) {
                    cardIndex = cardIndex + originalIndex.length;
                }
                if (this_1.parent.sortSettings.direction === 'Ascending') {
                    for (var i = cardIndex; i < columnAllDatas.length; i++) {
                        if (cardsId.indexOf(columnAllDatas[i][this_1.parent.cardSettings.headerField]) === -1) {
                            columnAllDatas[i][this_1.parent.sortSettings.field] = ++num;
                            finalData.push(columnAllDatas[i]);
                        }
                    }
                }
                else {
                    for (var i = cardIndex - 1; i >= 0; i--) {
                        if (cardsId.indexOf(columnAllDatas[i][this_1.parent.cardSettings.headerField]) === -1) {
                            columnAllDatas[i][this_1.parent.sortSettings.field] = ++num;
                            finalData.push(columnAllDatas[i]);
                        }
                    }
                }
            }
        };
        var this_1 = this;
        for (var _i = 0, modifiedKey_1 = modifiedKey; _i < modifiedKey_1.length; _i++) {
            var columnKey = modifiedKey_1[_i];
            _loop_1(columnKey);
        }
        return finalData;
    };
    return Crud;
}());
export { Crud };
