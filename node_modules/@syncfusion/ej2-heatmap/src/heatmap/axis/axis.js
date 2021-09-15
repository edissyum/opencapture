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
/**
 * HeatMap Axis file
 */
import { Property, Complex, ChildProperty, isNullOrUndefined, Collection } from '@syncfusion/ej2-base';
import { DataUtil } from '@syncfusion/ej2-data';
import { Font, Title, AxisLabelBorder, MultiLevelLabels, MultipleRow } from '../model/base';
import { Theme } from '../model/theme';
import { Rect, measureText, Size, rotateTextSize, increaseDateTimeInterval, formatValue, textTrim } from '../utils/helper';
import { MultiLevelPosition, textWrap } from '../utils/helper';
var Axis = /** @class */ (function (_super) {
    __extends(Axis, _super);
    function Axis() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** @private */
        _this.multipleRow = [];
        /** @private */
        _this.rect = new Rect(undefined, undefined, 0, 0);
        /** @private */
        _this.nearSizes = [];
        /** @private */
        _this.farSizes = [];
        /** @private */
        _this.maxLabelSize = new Size(0, 0);
        /** @private */
        _this.titleSize = new Size(0, 0);
        /** @private */
        _this.multilevel = [];
        /** @private */
        _this.axisLabels = [];
        /** @private */
        _this.tooltipLabels = [];
        /** @private */
        _this.labelValue = [];
        /** @private */
        _this.axisLabelSize = 0;
        /** @private */
        _this.axisLabelInterval = 0;
        /** @private */
        _this.dateTimeAxisLabelInterval = [];
        /** @private */
        _this.maxLength = 0;
        /** @private */
        _this.min = 0;
        /** @private */
        _this.max = 0;
        /** @private */
        _this.isIntersect = false;
        /** @private */
        _this.jsonCellLabel = [];
        _this.multiLevelSize = [];
        /** @private */
        _this.xAxisMultiLabelHeight = [];
        /** @private */
        _this.yAxisMultiLabelHeight = [];
        /** @private */
        _this.multiLevelPosition = [];
        return _this;
    }
    /**
     * measure the axis title and label size
     *
     * @param axis
     * @param heatmap
     * @private
     */
    Axis.prototype.computeSize = function (axis, heatmap, rect) {
        var size = new Size(0, 0);
        var innerPadding = 10;
        this.titleSize = axis.getTitleSize(axis, innerPadding);
        this.maxLabelSize = axis.getMaxLabelSize(axis, heatmap);
        this.getMultilevelLabelsHeight(axis, rect, heatmap);
        for (var i = 0; i < this.multiLevelLabels.length; i++) {
            size = axis.multiLevelLabelSize(innerPadding, i);
            this.multiLevelSize.push(size);
        }
    };
    /**
     * calculating x, y position of multi level labels
     *
     * @private
     */
    Axis.prototype.multiPosition = function (axis, index) {
        var innerPadding = axis.orientation === 'Horizontal' ? 10 : 20;
        var multiPosition = new MultiLevelPosition(0, 0);
        if (axis.orientation === 'Horizontal') {
            var level0 = axis.maxLabelSize.height + innerPadding;
            var level1 = this.xAxisMultiLabelHeight[index - 1];
            multiPosition.x = (axis.isInversed ? axis.rect.x + axis.rect.width : axis.rect.x);
            multiPosition.y = index === 0 ? axis.rect.y + (axis.opposedPosition ? -level0 : level0) :
                axis.multiLevelPosition[index - 1].y + (axis.opposedPosition ? -level1 : level1);
        }
        else {
            var level0 = axis.maxLabelSize.width + innerPadding;
            var level1 = index !== 0 && (this.multiLevelSize[index - 1].width);
            multiPosition.x = index === 0 ? axis.rect.x - (axis.opposedPosition ? -level0 : level0) :
                axis.multiLevelPosition[index - 1].x - (axis.opposedPosition ? -(level1 + innerPadding) : level1 + innerPadding);
            multiPosition.y = axis.isInversed ? axis.rect.y : axis.rect.y + axis.rect.height;
        }
        return multiPosition;
    };
    Axis.prototype.multiLevelLabelSize = function (innerPadding, index) {
        var labelSize = new Size(0, 0);
        var multiLevel = this.multiLevelLabels;
        var categoryLabel = multiLevel[index].categories;
        for (var i = 0; i < categoryLabel.length; i++) {
            var size_1 = measureText(categoryLabel[i].text, multiLevel[index].textStyle);
            labelSize.width = (labelSize.width > size_1.width) ? labelSize.width : size_1.width;
            labelSize.height = (labelSize.height > size_1.height) ? labelSize.height : size_1.height;
        }
        var size = (this.orientation === 'Horizontal') ? this.xAxisMultiLabelHeight[index] : this.yAxisMultiLabelHeight[index];
        if (this.opposedPosition) {
            this.farSizes.push(size);
        }
        else {
            this.nearSizes.push(size);
        }
        return labelSize;
    };
    Axis.prototype.getMultilevelLabelsHeight = function (axis, rect, heatmap) {
        var labelSize;
        var gap;
        var height;
        var multiLevelLabelsHeight = [];
        var start;
        var end;
        var startPosition;
        var endPosition;
        var isVertical = axis.orientation === 'Vertical';
        var padding = axis.orientation === 'Vertical' ? 20 : 10;
        this.multiLevelLabels.map(function (multiLevel, index) {
            multiLevel.categories.map(function (categoryLabel) {
                start = typeof categoryLabel.start === 'number' ? categoryLabel.start : Number(new Date(categoryLabel.start));
                end = typeof categoryLabel.end === 'number' ? categoryLabel.end : Number(new Date(categoryLabel.end));
                if (categoryLabel.text !== '' && categoryLabel.start !== null && categoryLabel.end !== null) {
                    labelSize = measureText(categoryLabel.text, multiLevel.textStyle);
                    height = isVertical ? labelSize.width : labelSize.height;
                    startPosition = heatmap.heatMapAxis.calculateLeftPosition(axis, start, categoryLabel.start, rect);
                    endPosition = heatmap.heatMapAxis.calculateWidth(axis, categoryLabel.end, end, rect);
                    labelSize = measureText(categoryLabel.text, multiLevel.textStyle);
                    gap = ((categoryLabel.maximumTextWidth === null) ? Math.abs(endPosition - startPosition) :
                        categoryLabel.maximumTextWidth);
                    if ((labelSize.width > gap - padding) && (multiLevel.overflow === 'Wrap') && !isVertical) {
                        height = (height * (textWrap(categoryLabel.text, gap - padding, multiLevel.textStyle).length));
                    }
                    multiLevelLabelsHeight[index] = !multiLevelLabelsHeight[index] ? height + padding :
                        ((multiLevelLabelsHeight[index] < height) ? height + padding : multiLevelLabelsHeight[index]);
                }
            });
        });
        if (isVertical) {
            this.yAxisMultiLabelHeight = multiLevelLabelsHeight;
        }
        else {
            this.xAxisMultiLabelHeight = multiLevelLabelsHeight;
        }
    };
    Axis.prototype.getTitleSize = function (axis, innerPadding) {
        var titleSize = new Size(0, 0);
        if (this.title.text) {
            titleSize = measureText(this.title.text, this.title.textStyle);
            titleSize.height += innerPadding;
        }
        if (axis.opposedPosition) {
            this.farSizes.push(titleSize.height);
        }
        else {
            this.nearSizes.push(titleSize.height);
        }
        return titleSize;
    };
    Axis.prototype.getMaxLabelSize = function (axis, heatmap) {
        var labelSize = new Size(0, 0);
        var labels = this.axisLabels;
        var padding = (axis.border.width > 0 || axis.multiLevelLabels.length > 0) ? 10 : 0;
        var count = 1;
        var row = 1;
        var interval = (axis.valueType === 'DateTime' && axis.showLabelOn !== 'None') ?
            heatmap.initialClipRect.width / axis.axisLabelSize : heatmap.initialClipRect.width / axis.axisLabels.length;
        axis.angle = axis.labelRotation;
        axis.isIntersect = false;
        if (axis.orientation === 'Horizontal' && (axis.labelIntersectAction === 'Rotate45' ||
            (axis.labelRotation % 180 === 0 && axis.labelIntersectAction === 'Trim' || axis.enableTrim)) ||
            axis.labelIntersectAction === 'MultipleRows') {
            var startX = heatmap.initialClipRect.x + ((!axis.isInversed) ? 0 : heatmap.initialClipRect.width);
            var previousEnd = void 0;
            var previousStart = void 0;
            this.clearMultipleRow();
            for (var i = 0, len = labels.length; i < len; i++) {
                var label = labels[i];
                var elementSize = measureText(label, axis.textStyle);
                var axisInterval = (axis.valueType === 'DateTime' && axis.showLabelOn !== 'None') ?
                    axis.dateTimeAxisLabelInterval[i] * interval : interval;
                var startPoint = startX + (!axis.isInversed ?
                    ((interval - elementSize.width) / 2) : -((interval + elementSize.width) / 2));
                startPoint = startPoint < heatmap.initialClipRect.x ? heatmap.initialClipRect.x : startPoint;
                var endPoint = startPoint + elementSize.width;
                if (!axis.isInversed) {
                    if (isNullOrUndefined(previousEnd)) {
                        previousEnd = endPoint;
                    }
                    else if ((startPoint < previousEnd) && axis.labelIntersectAction !== 'MultipleRows') {
                        if (axis.labelIntersectAction === 'Rotate45' && !axis.enableTrim) {
                            axis.angle = 45;
                        }
                        else {
                            axis.isIntersect = true;
                        }
                        break;
                    }
                    previousEnd = endPoint;
                }
                else {
                    if (isNullOrUndefined(previousStart)) {
                        previousStart = startPoint;
                    }
                    else if ((previousStart < endPoint && axis.labelIntersectAction !== 'MultipleRows')) {
                        if (axis.labelIntersectAction === 'Rotate45' && !axis.enableTrim) {
                            axis.angle = 45;
                        }
                        else {
                            axis.isIntersect = true;
                        }
                        break;
                    }
                    previousStart = startPoint;
                }
                startX += axis.isInversed ? -axisInterval : axisInterval;
                if (axis.orientation === 'Horizontal' && axis.labelIntersectAction === 'MultipleRows' && axis.labelRotation === 0) {
                    this.multipleRow.push(new MultipleRow(startPoint, endPoint, count, label, row));
                }
            }
            if (axis.orientation === 'Horizontal' && axis.labelIntersectAction === 'MultipleRows' && axis.isInversed) {
                this.multipleRow = this.multipleRow.reverse();
            }
        }
        for (var i = 0; i < labels.length; i++) {
            var multipleRow = this.multipleRow;
            var label = void 0;
            if (axis.enableTrim) {
                label = textTrim(axis.maxLabelLength, labels[i], axis.textStyle);
            }
            else {
                label = labels[i];
            }
            var size = (axis.angle % 180 === 0) ?
                measureText(label, axis.textStyle) : rotateTextSize(axis.textStyle, labels[i], axis.angle);
            labelSize.width = (labelSize.width > size.width) ? labelSize.width : size.width;
            if (axis.labelIntersectAction === 'MultipleRows' && axis.orientation === 'Horizontal' && i > 0 && axis.labelRotation === 0) {
                if (multipleRow[i].end >= heatmap.initialClipRect.width && i < labels.length - 1) {
                    multipleRow[i].row = multipleRow[i].row + 1;
                }
                for (var k = 1; k <= axis.multilevel.length; k++) {
                    if (multipleRow[i].start < multipleRow[i - 1].end) {
                        if (axis.multilevel[k] < multipleRow[i].start) {
                            count = k;
                            break;
                        }
                        else if (k === axis.multilevel.length - 1) {
                            count = axis.multilevel.length;
                            break;
                        }
                    }
                    else if (size.width < interval) {
                        for (var j = 1; j <= axis.multilevel.length; j++) {
                            if (axis.multilevel[j] < multipleRow[i].start) {
                                count = j;
                                multipleRow[j].row = count;
                                break;
                            }
                        }
                    }
                }
                labelSize.height = (labelSize.height > ((size.height * count) + (((size.height * 0.5) / 2) * (count - 1)))) ?
                    labelSize.height : ((size.height * count) + (((size.height * 0.5) / 2) * count));
                this.multipleRow[i].index = count;
                axis.multilevel[count] = multipleRow[i].end;
            }
            else {
                if (axis.orientation === 'Horizontal' && axis.labelIntersectAction === 'MultipleRows' && i === 0 &&
                    axis.labelRotation === 0) {
                    axis.multilevel[1] = multipleRow[i].end;
                }
                labelSize.height = (labelSize.height > size.height) ? labelSize.height : size.height;
            }
        }
        if (heatmap.cellSettings.border.width >= 20 && axis.orientation !== 'Horizontal') {
            labelSize.width = labelSize.width + (heatmap.cellSettings.border.width / 4);
        }
        if (axis.opposedPosition) {
            this.farSizes.push((axis.orientation === 'Horizontal') ? labelSize.height : labelSize.width + padding);
        }
        else {
            this.nearSizes.push((axis.orientation === 'Horizontal') ? labelSize.height : labelSize.width + padding);
        }
        return labelSize;
    };
    /**
     * Generate the axis lables for numeric axis
     *
     * @param heatmap
     * @private
     */
    Axis.prototype.calculateNumericAxisLabels = function (heatmap) {
        //Axis Min
        var min = 0;
        var max = 0;
        var interval = this.interval ? this.interval : 1;
        var adaptorMin;
        var adaptorMax;
        if (heatmap.adaptorModule && heatmap.isCellData) {
            adaptorMin = this.orientation === 'Horizontal' ?
                heatmap.adaptorModule.adaptiveXMinMax.min : heatmap.adaptorModule.adaptiveYMinMax.min;
            adaptorMax = this.orientation === 'Horizontal' ?
                heatmap.adaptorModule.adaptiveXMinMax.max : heatmap.adaptorModule.adaptiveYMinMax.max;
        }
        min = !isNullOrUndefined(this.minimum) ? this.minimum : ((adaptorMin) ? adaptorMin : 0);
        max = !isNullOrUndefined(this.maximum) ? this.maximum :
            ((adaptorMax) ? adaptorMax : (this.maxLength * this.increment));
        var temp;
        if (this.minimum && this.maximum && min > max) {
            temp = min;
            min = max;
            max = temp;
        }
        max = !isNullOrUndefined(this.maximum) ? max : (adaptorMax ? adaptorMax : (max + min));
        var format = this.labelFormat;
        var isCustom = format.match('{value}') !== null;
        this.format = heatmap.intl.getNumberFormat({
            format: isCustom ? '' : format
        });
        for (var i = min; i <= max; i = i + (interval * this.increment)) {
            var value = formatValue(isCustom, format, i, this.format);
            this.axisLabels.push(value);
        }
        this.min = 0;
        this.axisLabelSize = Math.floor(((max - min) / this.increment) + 1);
        this.max = this.axisLabelSize - 1;
        this.axisLabelInterval = interval;
        for (var i = min; i <= max; i = i + this.increment) {
            var value = formatValue(isCustom, format, i, this.format);
            this.tooltipLabels.push(value);
            this.labelValue.push(i);
        }
        this.labelValue = this.isInversed ? this.labelValue.reverse() : this.labelValue;
    };
    /**
     * Generate the axis lables for category axis
     *
     * @private
     */
    Axis.prototype.calculateCategoryAxisLabels = function () {
        var labels = this.labels ? this.labels : [];
        labels = (labels.length > 0) ? labels : this.jsonCellLabel;
        var min = !isNullOrUndefined(this.minimum) && !(this.minimum instanceof Date) ? this.minimum : 0;
        var max = !isNullOrUndefined(this.maximum) && !(this.maximum instanceof Date) ? this.maximum : this.maxLength;
        var interval = this.interval ? this.interval : 1;
        var temp;
        if (!isNullOrUndefined(this.minimum) && !isNullOrUndefined(this.maximum) && min > max) {
            temp = min;
            min = max;
            max = temp;
        }
        if (labels && labels.length > 0) {
            for (var i = min; i <= max; i = i + interval) {
                var value = labels[i] ? labels[i].toString() : i.toString();
                this.axisLabels.push(value);
            }
        }
        else {
            for (var i = min; i <= max; i = i + interval) {
                this.axisLabels.push(i.toString());
            }
        }
        for (var i = min; i <= max; i++) {
            this.tooltipLabels.push(labels[i] ? labels[i].toString() : i.toString());
            this.labelValue.push(labels[i] ? labels[i].toString() : i.toString());
        }
        this.min = min;
        this.max = max;
        this.axisLabelSize = max - min + 1;
        this.axisLabelInterval = interval;
        this.labelValue = this.isInversed ? this.labelValue.reverse() : this.labelValue;
    };
    /**
     * Generate the axis labels for date time axis.
     *
     * @param heatmap
     * @private
     */
    Axis.prototype.calculateDateTimeAxisLabel = function (heatmap) {
        var interval = this.interval ? this.interval : 1;
        var option = {
            skeleton: 'full',
            type: 'dateTime'
        };
        // eslint-disable-next-line @typescript-eslint/ban-types
        var dateParser = heatmap.intl.getDateParser(option);
        // eslint-disable-next-line @typescript-eslint/ban-types
        var dateFormatter = heatmap.intl.getDateFormat(option);
        var min;
        var max;
        var adaptorMin = null;
        var adaptorMax = null;
        if (heatmap.adaptorModule && heatmap.isCellData) {
            adaptorMin = this.orientation === 'Horizontal' ? heatmap.adaptorModule.adaptiveXMinMax.min :
                heatmap.adaptorModule.adaptiveYMinMax.min;
            adaptorMax = this.orientation === 'Horizontal' ? heatmap.adaptorModule.adaptiveXMinMax.max :
                heatmap.adaptorModule.adaptiveYMinMax.max;
        }
        var minimum = this.minimum ? this.minimum : (adaptorMin ? adaptorMin : null);
        var maximum = this.maximum ? this.maximum : (adaptorMax ? adaptorMax : null);
        if (minimum === null && maximum === null) {
            min = 0;
            max = this.maxLength * this.increment;
            for (var i = min; i <= max; i = i + (interval * this.increment)) {
                this.axisLabels.push(i.toString());
                this.tooltipLabels.push(i.toString());
                this.labelValue.push(i.toString());
            }
            this.min = 0;
            this.max = this.maxLength;
            this.axisLabelSize = (max - min) / this.increment + 1;
            this.axisLabelInterval = interval;
        }
        else {
            if (minimum !== null && maximum === null) {
                min = Date.parse(dateParser(dateFormatter(new Date(DataUtil.parse.parseJson({ val: minimum }).val))));
                max = increaseDateTimeInterval(min, this.maxLength, this.intervalType, this.increment).getTime();
            }
            else if (minimum === null && maximum !== null) {
                max = Date.parse(dateParser(dateFormatter(new Date(DataUtil.parse.parseJson({ val: maximum }).val))));
                min = increaseDateTimeInterval(max, -this.maxLength, this.intervalType, this.increment).getTime();
            }
            else {
                min = Date.parse(dateParser(dateFormatter(new Date(DataUtil.parse.parseJson({ val: minimum }).val))));
                max = Date.parse(dateParser(dateFormatter(new Date(DataUtil.parse.parseJson({ val: maximum }).val))));
            }
            this.format = heatmap.intl.getDateFormat({
                format: this.labelFormat, skeleton: this.getSkeleton()
            });
            var tempInterval = min;
            while (tempInterval <= max) {
                var value = this.format(new Date(tempInterval));
                this.axisLabels.push(value);
                if (this.showLabelOn !== 'None') {
                    interval = this.calculateLabelInterval(tempInterval);
                    this.dateTimeAxisLabelInterval.push(interval);
                }
                tempInterval = increaseDateTimeInterval(tempInterval, interval, this.intervalType, this.increment).getTime();
            }
            this.min = 0;
            this.axisLabelInterval = interval;
            this.axisLabelSize = this.getTotalLabelLength(min, max); // this.tooltipLabels.length;
            this.max = this.axisLabelSize - 1;
            tempInterval = min;
            while (tempInterval <= max) {
                var value = this.format(new Date(tempInterval));
                this.tooltipLabels.push(value);
                this.labelValue.push(new Date(tempInterval));
                tempInterval = increaseDateTimeInterval(tempInterval, 1, this.intervalType, this.increment).getTime();
            }
        }
        this.labelValue = this.isInversed ? this.labelValue.reverse() : this.labelValue;
    };
    Axis.prototype.calculateLabelInterval = function (interval) {
        var year = new Date(interval).getFullYear();
        var month = new Date(interval).getMonth() + 1;
        var day = new Date(interval).getDate();
        var numberOfDays;
        var tempInterval;
        if (this.showLabelOn === 'Years' || this.showLabelOn === 'Months') {
            if (this.showLabelOn === 'Years' && this.intervalType === 'Months') {
                tempInterval = Math.ceil(12 / this.increment);
            }
            else {
                numberOfDays = this.showLabelOn === 'Years' ? year % 4 === 0 ? 366 : 365 : new Date(year, month, 0).getDate();
                numberOfDays += 1 - day;
                tempInterval = this.intervalType === 'Days' ? Math.ceil(numberOfDays / this.increment) : this.intervalType === 'Hours' ?
                    Math.ceil((numberOfDays * 24) / this.increment) : this.intervalType === 'Minutes' ?
                    Math.ceil((numberOfDays * 24 * 60) / this.increment) : 1;
            }
        }
        else if (this.showLabelOn === 'Days') {
            tempInterval = this.intervalType === 'Hours' ? Math.ceil(24 / this.increment) : this.intervalType === 'Minutes' ?
                Math.ceil((24 * 60) / this.increment) : 1;
        }
        else if (this.showLabelOn === 'Hours') {
            var minutes = new Date(interval).getMinutes();
            tempInterval = this.intervalType === 'Minutes' ? Math.ceil((60 - minutes) / this.increment) : 1;
        }
        else {
            tempInterval = 1;
        }
        return tempInterval;
    };
    /**
     * @private
     */
    Axis.prototype.getSkeleton = function () {
        var skeleton;
        if (this.intervalType === 'Years') {
            skeleton = 'yMMM';
        }
        else if (this.intervalType === 'Months') {
            skeleton = 'MMMd';
        }
        else if (this.intervalType === 'Days') {
            skeleton = 'yMd';
        }
        else if (this.intervalType === 'Hours') {
            skeleton = 'EHm';
        }
        else if (this.intervalType === 'Minutes') {
            skeleton = 'Hms';
        }
        else {
            skeleton = 'Hms';
        }
        return skeleton;
    };
    /** @private */
    Axis.prototype.getTotalLabelLength = function (min, max) {
        var length = 0;
        var minimum = new Date(min);
        var maximum = new Date(max);
        var difference;
        var days;
        switch (this.intervalType) {
            case 'Years':
                // eslint-disable-next-line no-case-declarations
                var years = ((maximum.getFullYear() - minimum.getFullYear()) / this.increment) + 1;
                length = Math.floor(years);
                break;
            case 'Months':
                // eslint-disable-next-line no-case-declarations
                var months = (maximum.getFullYear() - minimum.getFullYear()) * 12;
                months -= minimum.getMonth();
                months += maximum.getMonth();
                length = months <= 0 ? 1 : Math.floor((months / this.increment) + 1);
                break;
            case 'Days':
                difference = Math.abs(minimum.getTime() - maximum.getTime());
                days = Math.floor(difference / (1000 * 3600 * 24));
                length = Math.floor((days / this.increment) + 1);
                break;
            case 'Hours':
                difference = Math.abs(minimum.getTime() - maximum.getTime());
                // eslint-disable-next-line no-case-declarations
                var hours = Math.floor(difference / (1000 * 3600));
                length = Math.floor(hours / this.increment) + 1;
                break;
            case 'Minutes':
                difference = Math.abs(minimum.getTime() - maximum.getTime());
                // eslint-disable-next-line no-case-declarations
                var minutes = Math.floor(difference / (1000 * 60));
                length = Math.floor(minutes / this.increment) + 1;
                break;
        }
        return length;
    };
    /**
     * Clear the axis label collection
     *
     * @private
     */
    Axis.prototype.clearAxisLabel = function () {
        this.axisLabels = [];
        this.tooltipLabels = [];
        this.dateTimeAxisLabelInterval = [];
        this.labelValue = [];
    };
    /**
     * Clear the axis label collection
     *
     * @private
     */
    Axis.prototype.clearMultipleRow = function () {
        this.multipleRow = [];
        this.multilevel = [];
    };
    __decorate([
        Complex({ text: '', textStyle: Theme.axisTitleFont }, Title)
    ], Axis.prototype, "title", void 0);
    __decorate([
        Property(false)
    ], Axis.prototype, "opposedPosition", void 0);
    __decorate([
        Property(null)
    ], Axis.prototype, "labels", void 0);
    __decorate([
        Complex(Theme.axisLabelFont, Font)
    ], Axis.prototype, "textStyle", void 0);
    __decorate([
        Property(0)
    ], Axis.prototype, "labelRotation", void 0);
    __decorate([
        Property(false)
    ], Axis.prototype, "isInversed", void 0);
    __decorate([
        Property('Category')
    ], Axis.prototype, "valueType", void 0);
    __decorate([
        Property(1)
    ], Axis.prototype, "increment", void 0);
    __decorate([
        Property('None')
    ], Axis.prototype, "showLabelOn", void 0);
    __decorate([
        Property(null)
    ], Axis.prototype, "minimum", void 0);
    __decorate([
        Property(null)
    ], Axis.prototype, "maximum", void 0);
    __decorate([
        Property(null)
    ], Axis.prototype, "interval", void 0);
    __decorate([
        Property('')
    ], Axis.prototype, "labelFormat", void 0);
    __decorate([
        Property('Days')
    ], Axis.prototype, "intervalType", void 0);
    __decorate([
        Property('Trim')
    ], Axis.prototype, "labelIntersectAction", void 0);
    __decorate([
        Property(false)
    ], Axis.prototype, "enableTrim", void 0);
    __decorate([
        Property(35)
    ], Axis.prototype, "maxLabelLength", void 0);
    __decorate([
        Complex({ color: '#b5b5b5', width: 0, type: 'Rectangle' }, AxisLabelBorder)
    ], Axis.prototype, "border", void 0);
    __decorate([
        Collection([], MultiLevelLabels)
    ], Axis.prototype, "multiLevelLabels", void 0);
    return Axis;
}(ChildProperty));
export { Axis };
