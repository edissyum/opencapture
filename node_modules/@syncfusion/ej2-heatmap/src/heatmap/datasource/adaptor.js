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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { isNullOrUndefined, Complex } from '@syncfusion/ej2-base';
import { Property, ChildProperty } from '@syncfusion/ej2-base';
import { DataUtil } from '@syncfusion/ej2-data';
import { increaseDateTimeInterval } from '../utils/helper';
import { BubbleData } from '../model/base';
/**
 * Configures the Adaptor Property in the Heatmap.
 */
var Data = /** @class */ (function (_super) {
    __extends(Data, _super);
    function Data() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], Data.prototype, "isJsonData", void 0);
    __decorate([
        Property('None')
    ], Data.prototype, "adaptorType", void 0);
    __decorate([
        Property('')
    ], Data.prototype, "xDataMapping", void 0);
    __decorate([
        Property('')
    ], Data.prototype, "yDataMapping", void 0);
    __decorate([
        Property('')
    ], Data.prototype, "valueMapping", void 0);
    __decorate([
        Complex({}, BubbleData)
    ], Data.prototype, "bubbleDataMapping", void 0);
    return Data;
}(ChildProperty));
export { Data };
var AdaptiveMinMax = /** @class */ (function () {
    function AdaptiveMinMax() {
    }
    return AdaptiveMinMax;
}());
export { AdaptiveMinMax };
/**
 *
 * The `Adaptor` module is used to handle JSON and Table data.
 */
var Adaptor = /** @class */ (function () {
    function Adaptor(heatMap) {
        this.reconstructedXAxis = [];
        this.reconstructedYAxis = [];
        this.adaptiveXMinMax = new AdaptiveMinMax();
        this.adaptiveYMinMax = new AdaptiveMinMax();
        this.heatMap = heatMap;
    }
    /**
     * Method to construct Two Dimentional Datasource.
     *
     * @returns {void}
     * @private
     */
    Adaptor.prototype.constructDatasource = function (dataSource, dataSourceSettings) {
        if (dataSourceSettings.adaptorType === 'Cell') {
            var xAxis = this.heatMap.xAxis;
            var yAxis = this.heatMap.yAxis;
            this.adaptiveXMinMax.min = xAxis.minimum;
            this.adaptiveXMinMax.max = xAxis.maximum;
            this.adaptiveYMinMax.min = yAxis.minimum;
            this.adaptiveYMinMax.max = yAxis.maximum;
            if (((xAxis.valueType === 'Numeric' || xAxis.valueType === 'DateTime') &&
                (isNullOrUndefined(xAxis.minimum) || isNullOrUndefined(xAxis.maximum))) ||
                ((yAxis.valueType === 'Numeric' || yAxis.valueType === 'DateTime') &&
                    (isNullOrUndefined(yAxis.minimum) || isNullOrUndefined(yAxis.maximum)))) {
                this.getMinMaxValue(dataSource, dataSourceSettings, xAxis, yAxis);
            }
            this.heatMap.isCellData = true;
        }
        if (dataSourceSettings.adaptorType === 'None') {
            this.heatMap.completeAdaptDataSource = dataSource;
        }
        else if (!dataSourceSettings.isJsonData && dataSourceSettings.adaptorType === 'Table') {
            this.heatMap.completeAdaptDataSource = dataSource;
        }
        else if (dataSourceSettings.isJsonData && dataSourceSettings.adaptorType === 'Table') {
            this.heatMap.completeAdaptDataSource = this.processJsonTableData(dataSource, dataSourceSettings);
        }
        else if (dataSourceSettings.isJsonData && dataSourceSettings.adaptorType === 'Cell') {
            this.heatMap.completeAdaptDataSource = this.processJsonCellData(dataSource, dataSourceSettings);
        }
        else if (!dataSourceSettings.isJsonData && dataSourceSettings.adaptorType === 'Cell') {
            this.constructAdaptiveAxis();
            this.heatMap.completeAdaptDataSource = this.processCellData(dataSource);
            this.heatMap.isCellData = true;
        }
    };
    /**
     * Method to construct Axis Collection.
     *
     * @returns {void}
     * @private
     */
    Adaptor.prototype.constructAdaptiveAxis = function () {
        var xAxis = this.heatMap.xAxis;
        var yAxis = this.heatMap.yAxis;
        if (xAxis.valueType === 'Numeric') {
            this.reconstructedXAxis = this.getNumericAxisCollection(this.adaptiveXMinMax.min, this.adaptiveXMinMax.max, xAxis.increment);
        }
        if (yAxis.valueType === 'Numeric') {
            this.reconstructedYAxis = this.getNumericAxisCollection(this.adaptiveYMinMax.min, this.adaptiveYMinMax.max, yAxis.increment);
        }
        if (xAxis.valueType === 'DateTime') {
            this.reconstructedXAxis = this.getDateAxisCollection(this.adaptiveXMinMax.min, this.adaptiveXMinMax.max, xAxis.intervalType, xAxis.increment);
        }
        if (yAxis.valueType === 'DateTime') {
            this.reconstructedYAxis = this.getDateAxisCollection(this.adaptiveYMinMax.min, this.adaptiveYMinMax.max, yAxis.intervalType, yAxis.increment);
        }
    };
    /**
     * Method to calculate Numeric Axis Collection.
     *
     * @returns {string[]}
     * @private
     */
    Adaptor.prototype.getNumericAxisCollection = function (min, max, increment) {
        var loopIndex = min;
        var tempAxisColl = [];
        while (loopIndex <= max) {
            tempAxisColl.push(loopIndex.toString());
            loopIndex = loopIndex + increment;
        }
        return tempAxisColl;
    };
    /**
     * Method to calculate DateTime Axis Collection.
     *
     * @returns {string[]}
     * @private
     */
    Adaptor.prototype.getDateAxisCollection = function (min, max, intervalType, increment) {
        var option = {
            skeleton: 'full',
            type: 'dateTime'
        };
        // eslint-disable-next-line @typescript-eslint/ban-types
        var dateParser = this.heatMap.intl.getDateParser(option);
        // eslint-disable-next-line @typescript-eslint/ban-types
        var dateFormatter = this.heatMap.intl.getDateFormat(option);
        min = Date.parse(dateParser(dateFormatter(new Date(DataUtil.parse.parseJson({ val: min }).val))));
        var tempInterval = min;
        var tempAxisColl = [];
        while (tempInterval <= max) {
            tempAxisColl.push(new Date(tempInterval).toString());
            tempInterval = increaseDateTimeInterval(tempInterval, 1, intervalType, increment).getTime();
        }
        return tempAxisColl;
    };
    /**
     * Method to calculate Maximum and Minimum Value from datasource.
     *
     * @returns {void}
     * @private
     */
    Adaptor.prototype.getMinMaxValue = function (dataSource, adapData, xAxis, yAxis) {
        var data = dataSource;
        var label = Object.keys(data[0]);
        if (data.length > 0) {
            this.adaptiveXMinMax.min = !isNullOrUndefined(xAxis.minimum) ? xAxis.minimum : adapData.isJsonData ?
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data[0][label[0]] : data[0][0];
            this.adaptiveYMinMax.min = !isNullOrUndefined(yAxis.minimum) ? yAxis.minimum : adapData.isJsonData ?
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data[0][label[1]] : data[0][1];
            this.adaptiveXMinMax.max = !isNullOrUndefined(xAxis.maximum) ? xAxis.maximum : adapData.isJsonData ?
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data[0][label[0]] : data[0][0];
            this.adaptiveYMinMax.max = !isNullOrUndefined(yAxis.maximum) ? yAxis.maximum : adapData.isJsonData ?
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data[0][label[1]] : data[0][1];
        }
        for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var xDataIndex = adapData.isJsonData ? data[dataIndex][label[0]] : data[dataIndex][0];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var yDataIndex = adapData.isJsonData ? data[dataIndex][label[1]] : data[dataIndex][1];
            if (xDataIndex < this.adaptiveXMinMax.min && isNullOrUndefined(xAxis.minimum)) {
                this.adaptiveXMinMax.min = xDataIndex;
            }
            if (xDataIndex > this.adaptiveXMinMax.max && isNullOrUndefined(xAxis.maximum)) {
                this.adaptiveXMinMax.max = xDataIndex;
            }
            if (yDataIndex < this.adaptiveYMinMax.min && isNullOrUndefined(yAxis.minimum)) {
                this.adaptiveYMinMax.min = yDataIndex;
            }
            if (yDataIndex > this.adaptiveYMinMax.max && isNullOrUndefined(yAxis.maximum)) {
                this.adaptiveYMinMax.max = yDataIndex;
            }
        }
    };
    /**
     * Method to process Cell datasource.
     *
     * @returns {Object}
     * @private
     */
    Adaptor.prototype.processCellData = function (dataSource) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var tempDataCollection = dataSource;
        var xLabels = this.reconstructedXAxis;
        var yLabels = this.reconstructedYAxis;
        var currentDataXIndex = 0;
        var currentDataYIndex = 0;
        this.reconstructData = [];
        if (tempDataCollection && tempDataCollection.length) {
            for (var xindex = 0; xindex < tempDataCollection.length; xindex++) {
                if (this.heatMap.xAxis.valueType === 'Category') {
                    currentDataXIndex = tempDataCollection[xindex][0];
                }
                else {
                    currentDataXIndex = xLabels.indexOf(tempDataCollection[xindex][0].toString());
                }
                if (currentDataXIndex > -1) {
                    while (!this.reconstructData[currentDataXIndex]) {
                        this.reconstructData.push([]);
                    }
                    if (this.heatMap.yAxis.valueType === 'Category') {
                        currentDataYIndex = tempDataCollection[xindex][1];
                    }
                    else {
                        currentDataYIndex = yLabels.indexOf(tempDataCollection[xindex][1].toString());
                    }
                    if (currentDataYIndex !== -1) {
                        while (this.reconstructData[currentDataXIndex][currentDataYIndex] !== '') {
                            this.reconstructData[currentDataXIndex].push('');
                        }
                        this.reconstructData[currentDataXIndex][currentDataYIndex] = isNullOrUndefined(tempDataCollection[xindex][2]) ?
                            '' : tempDataCollection[xindex][2];
                    }
                }
            }
        }
        return this.reconstructData;
    };
    /**
     * Method to process JSON Cell datasource.
     *
     * @returns {Object}
     * @private
     */
    Adaptor.prototype.processJsonCellData = function (dataSource, adaptordata) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var tempDataCollection = dataSource;
        var xAxisLabels = this.heatMap.xAxis.labels ? this.heatMap.xAxis.labels : [];
        var yAxisLabels = this.heatMap.yAxis.labels ? this.heatMap.yAxis.labels : [];
        var axisCollections = this.heatMap.axisCollections;
        if (xAxisLabels.length === 0 || yAxisLabels.length === 0) {
            this.generateAxisLabels(dataSource, adaptordata);
        }
        var xLabels = (this.heatMap.xAxis.valueType === 'Category') ? (xAxisLabels.length > 0 ?
            this.heatMap.xAxis.labels : axisCollections[0].jsonCellLabel) : axisCollections[0].labelValue;
        var yLabels = (this.heatMap.yAxis.valueType === 'Category') ? (yAxisLabels.length > 0 ?
            this.heatMap.yAxis.labels : axisCollections[1].jsonCellLabel) : axisCollections[1].labelValue;
        var currentDataXIndex = 0;
        var currentDataYIndex = 0;
        if (tempDataCollection.length) {
            this.reconstructData = [];
            for (var index = 0; index < tempDataCollection.length; index++) {
                currentDataXIndex = this.getSplitDataValue(tempDataCollection[index], adaptordata, xLabels, adaptordata.xDataMapping.split('.'), this.heatMap.xAxis.valueType);
                if (currentDataXIndex !== -1) {
                    while (!this.reconstructData[currentDataXIndex]) {
                        this.reconstructData.push([]);
                    }
                    currentDataYIndex = this.getSplitDataValue(tempDataCollection[index], adaptordata, yLabels, adaptordata.yDataMapping.split('.'), this.heatMap.yAxis.valueType);
                    if (currentDataYIndex !== -1) {
                        while (isNullOrUndefined(this.reconstructData[currentDataXIndex][currentDataYIndex])) {
                            this.reconstructData[currentDataXIndex].push('');
                        }
                        if (this.heatMap.bubbleSizeWithColor) {
                            this.reconstructData[currentDataXIndex][currentDataYIndex] = [
                                this.getSplitDataValue(tempDataCollection[index], adaptordata, null, adaptordata.bubbleDataMapping.size.split('.'), ''),
                                this.getSplitDataValue(tempDataCollection[index], adaptordata, null, adaptordata.bubbleDataMapping.color.split('.'), '')
                            ];
                        }
                        else {
                            this.reconstructData[currentDataXIndex][currentDataYIndex] = this.getSplitDataValue(tempDataCollection[index], adaptordata, null, adaptordata.valueMapping.split('.'), '');
                        }
                    }
                }
            }
        }
        return this.reconstructData;
    };
    /**
     * Method to generate axis labels when labels are not given.
     *
     * @returns {string}
     * @private
     */
    Adaptor.prototype.generateAxisLabels = function (dataSource, adaptordata) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var tempDataCollection = dataSource;
        var xLabels = this.heatMap.xAxis.labels ? this.heatMap.xAxis.labels : [];
        var yLabels = this.heatMap.yAxis.labels ? this.heatMap.yAxis.labels : [];
        var hasXLabels = xLabels.length > 0 ? true : false;
        var hasYLabels = yLabels.length > 0 ? true : false;
        var axisCollection = this.heatMap.axisCollections;
        for (var index = 0; index < axisCollection.length; index++) {
            var valueType = axisCollection[index].valueType;
            var axis = axisCollection[index];
            if (valueType === 'Category') {
                var hasLabels = void 0;
                var dataMapping = void 0;
                var labels = void 0;
                if (axis.orientation === 'Horizontal') {
                    hasLabels = hasXLabels;
                    dataMapping = adaptordata.xDataMapping;
                    axis.jsonCellLabel = labels = [];
                }
                else {
                    hasLabels = hasYLabels;
                    dataMapping = adaptordata.yDataMapping;
                    axis.jsonCellLabel = labels = [];
                }
                if (!hasLabels) {
                    for (var i = 0; i < tempDataCollection.length; i++) {
                        if (dataMapping in tempDataCollection[i]) {
                            var xValue = tempDataCollection[i][dataMapping].toString();
                            if (labels.indexOf(xValue.toString()) === -1) {
                                labels.push(xValue);
                            }
                        }
                    }
                }
            }
            else if (valueType === 'DateTime') {
                axis.clearAxisLabel();
                axis.calculateDateTimeAxisLabel(this.heatMap);
            }
            else {
                axis.clearAxisLabel();
                axis.calculateNumericAxisLabels(this.heatMap);
            }
        }
    };
    /**
     * Method to get data from complex mapping.
     *
     * @returns {number|string}
     * @private
     */
    Adaptor.prototype.getSplitDataValue = function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tempSplitDataCollection, adaptordata, labels, tempSplitData, valueType) {
        var value = -1;
        this.tempSplitDataCollection = tempSplitDataCollection;
        for (var splitIndex = 0; splitIndex < tempSplitData.length; splitIndex++) {
            value = !isNullOrUndefined(labels) ? (!(valueType === 'DateTime') ?
                labels.indexOf(this.tempSplitDataCollection[tempSplitData[splitIndex]]) :
                labels.map(Number).indexOf(+this.tempSplitDataCollection[tempSplitData[splitIndex]])) : null;
            if (!isNullOrUndefined(this.tempSplitDataCollection)) {
                this.tempSplitDataCollection = value !== -1 && !isNullOrUndefined(labels) ?
                    this.tempSplitDataCollection : this.tempSplitDataCollection[tempSplitData[splitIndex]];
            }
            if (isNullOrUndefined(this.tempSplitDataCollection)) {
                break;
            }
        }
        value = !isNullOrUndefined(labels) ? value : isNullOrUndefined(this.tempSplitDataCollection) ||
            this.tempSplitDataCollection.toString() === '' ? '' : parseFloat(this.tempSplitDataCollection.toString());
        return value;
    };
    /**
     * Method to process JSON Table datasource.
     *
     * @returns {Object}
     * @private
     */
    Adaptor.prototype.processJsonTableData = function (dataSource, adaptordata) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var tempDataCollection = dataSource;
        var currentDataXIndex = 0;
        var currentDataYIndex = 0;
        var xLabels = this.heatMap.xAxis.labels ? this.heatMap.xAxis.labels : [];
        var yLabels = this.heatMap.yAxis.labels ? this.heatMap.yAxis.labels : [];
        var key;
        if (tempDataCollection.length) {
            this.reconstructData = [];
            for (var xindex = 0; xindex < tempDataCollection.length; xindex++) {
                currentDataXIndex = this.getSplitDataValue(tempDataCollection[xindex], adaptordata, xLabels, adaptordata.xDataMapping.split('.'), this.heatMap.xAxis.valueType);
                if (currentDataXIndex !== -1) {
                    while (!this.reconstructData[currentDataXIndex]) {
                        this.reconstructData.push([]);
                    }
                    for (var index = 0; index < Object.keys(this.tempSplitDataCollection).length; index++) {
                        key = Object.keys(this.tempSplitDataCollection)[index];
                        currentDataYIndex = key !== adaptordata.xDataMapping ? yLabels.indexOf(key) : -1;
                        if (currentDataYIndex !== -1) {
                            while (isNullOrUndefined(this.reconstructData[currentDataXIndex][currentDataYIndex])) {
                                this.reconstructData[currentDataXIndex].push('');
                            }
                            this.reconstructData[currentDataXIndex][currentDataYIndex] =
                                isNullOrUndefined(this.tempSplitDataCollection[key]) ?
                                    '' : this.tempSplitDataCollection[key];
                        }
                    }
                }
            }
        }
        return this.reconstructData;
    };
    /**
     * To destroy the Adaptor.
     *
     * @returns {void}
     * @private
     */
    Adaptor.prototype.destroy = function () {
        /**
         * No Lines
         */
    };
    /**
     * To get Module name
     */
    Adaptor.prototype.getModuleName = function () {
        return 'Adaptor';
    };
    return Adaptor;
}());
export { Adaptor };
