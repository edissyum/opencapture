import { measureText, textElement } from '@syncfusion/ej2-svg-base';
/**
 * Class for Bullet chart axis
 */
var BulletChartAxis = /** @class */ (function () {
    function BulletChartAxis(bullet) {
        //super();
        this.bulletChart = bullet;
        this.isVertical = (bullet.orientation === 'Vertical');
        this.isLabelsInside = (bullet.labelPosition === 'Inside');
        this.isHorizontal = (bullet.orientation === 'Horizontal');
        this.isLeft = bullet.titlePosition === 'Left';
        this.isRight = bullet.titlePosition === 'Right';
        this.isTop = bullet.titlePosition === 'Top';
        this.majorTickSize = bullet.majorTickLines.height;
        this.location = 10;
        this.labelOffset = 15;
        this.labelSize = parseFloat(bullet.labelStyle.size);
        this.isLabelBelow = !this.bulletChart.opposedPosition;
    }
    BulletChartAxis.prototype.renderMajorTickLines = function (intervalValue, scale) {
        if (this.bulletChart.orientation === 'Horizontal') {
            this.renderXMajorTickLines(intervalValue, scale);
        }
        else {
            this.renderYMajorTickLines(intervalValue, scale);
        }
    };
    BulletChartAxis.prototype.renderMinorTickLines = function (intervalValue, scale) {
        if (this.bulletChart.orientation === 'Horizontal') {
            this.renderXMinorTickLines(intervalValue, scale);
        }
        else {
            this.renderYMinorTickLines(intervalValue, scale);
        }
    };
    BulletChartAxis.prototype.renderAxisLabels = function (intervalValue, scale) {
        if (this.bulletChart.orientation === 'Horizontal') {
            this.renderXAxisLabels(intervalValue, scale);
        }
        else {
            this.renderYAxisLabels(intervalValue, scale);
        }
    };
    /**
     * To render grid lines of bullet chart axis
     */
    BulletChartAxis.prototype.renderXMajorTickLines = function (intervalValue, scale) {
        var bullet = this.bulletChart;
        var tickGroup = bullet.renderer.createGroup({ 'id': bullet.svgObject.id + '_majorTickGroup' });
        var min = bullet.minimum;
        var max = bullet.maximum;
        var interval = bullet.interval;
        var enableRtl = bullet.enableRtl;
        var y1 = bullet.initialClipRect.y + ((bullet.opposedPosition) ? 0 : bullet.initialClipRect.height);
        var y2 = y1 + ((!bullet.opposedPosition) ? ((bullet.tickPosition !== 'Inside' ?
            this.majorTickSize : -this.majorTickSize)) : ((bullet.tickPosition !== 'Inside' ? -this.majorTickSize : this.majorTickSize)));
        var majorTick = bullet.majorTickLines;
        var strokeColor = majorTick.color || bullet.themeStyle.majorTickLineColor;
        var options;
        var condition;
        var size = bullet.initialClipRect.x + ((bullet.enableRtl) ? bullet.initialClipRect.width : 0);
        var majorPointX = bullet.initialClipRect.x + majorTick.width / 2 + ((enableRtl) ? bullet.initialClipRect.width : 0);
        for (var i = min; i <= max; i += interval) {
            condition = (!bullet.enableRtl) ? (i === max) : (i === min);
            if (condition) {
                majorPointX -= majorTick.width / 2;
            }
            condition = (!bullet.enableRtl) ? (i === max) : (i === min);
            if (bullet.majorTickLines.useRangeColor) {
                strokeColor = this.bindingRangeStrokes(majorPointX - ((condition) ? this.bulletChart.majorTickLines.width / 2 : 0), size, this.bulletChart.orientation, bullet.enableRtl);
            }
            options = this.majorTicks(majorPointX, majorPointX, y1, y2, strokeColor, i);
            var majorTicks = bullet.renderer.drawLine(options);
            majorPointX = majorPointX + ((enableRtl ? -intervalValue : intervalValue));
            tickGroup.appendChild(majorTicks);
            scale.appendChild(tickGroup);
        }
    };
    /**
     * To render grid lines of bullet chart axis
     */
    BulletChartAxis.prototype.renderYMajorTickLines = function (intervalValue, scale) {
        var bulletChart = this.bulletChart;
        var tickGroup = bulletChart.renderer.createGroup({ 'id': bulletChart.svgObject.id + '_majorTickGroup' });
        var min = bulletChart.minimum;
        var max = bulletChart.maximum;
        var interval = bulletChart.interval;
        var enableRtl = bulletChart.enableRtl;
        var rect = bulletChart.initialClipRect;
        var x1 = rect.x + ((!bulletChart.opposedPosition) ? 0 : rect.width);
        var x2 = x1 - ((!bulletChart.opposedPosition) ? ((bulletChart.tickPosition !== 'Inside' ?
            this.majorTickSize : -this.majorTickSize)) : ((bulletChart.tickPosition !== 'Inside'
            ? -this.majorTickSize : this.majorTickSize)));
        var majorTick = bulletChart.majorTickLines;
        var strokeColor = majorTick.color || bulletChart.themeStyle.majorTickLineColor;
        var condition;
        var options;
        var size = rect.y + ((!bulletChart.enableRtl) ? rect.height : 0);
        var majorPointY = rect.y + majorTick.width / 2 + ((!enableRtl) ? rect.height : 0);
        for (var i = min; i <= max; i += interval) {
            condition = (bulletChart.enableRtl) ? (i === max) : (i === min);
            if (condition) {
                majorPointY -= majorTick.width / 2;
            }
            condition = (!bulletChart.enableRtl) ? (i === max) : (i === min);
            if (bulletChart.majorTickLines.useRangeColor) {
                strokeColor = this.bindingRangeStrokes(majorPointY - ((condition) ? this.bulletChart.majorTickLines.width / 2 : 0), size, this.bulletChart.orientation, bulletChart.enableRtl);
            }
            options = this.majorTicks(x1, x2, majorPointY, majorPointY, strokeColor, i);
            var majorTicks = bulletChart.renderer.drawLine(options);
            majorPointY = majorPointY + ((!enableRtl ? -intervalValue : intervalValue));
            tickGroup.appendChild(majorTicks);
            scale.appendChild(tickGroup);
        }
    };
    BulletChartAxis.prototype.majorTicks = function (x1, x2, y1, y2, strokeColor, i) {
        var options = {
            'id': this.bulletChart.svgObject.id + '_MajorTickLine_' + i,
            'x1': x1,
            'y1': y1,
            'x2': x2,
            'y2': y2,
            'stroke-width': this.bulletChart.majorTickLines.width,
            'stroke': (this.bulletChart.majorTickLines.useRangeColor && strokeColor) ? strokeColor :
                this.bulletChart.majorTickLines.color || strokeColor
        };
        return options;
    };
    BulletChartAxis.prototype.bindingRangeStrokes = function (majorPointX, size, orientation, rtl) {
        if ((orientation === 'Vertical' && !rtl) || (rtl && orientation === 'Horizontal')) {
            return this.backwardStrokeBinding(majorPointX, size);
        }
        else {
            return this.forwardStrokeBinding(majorPointX, size);
        }
    };
    /**
     * To render minor tick lines of bullet chart
     */
    BulletChartAxis.prototype.renderXMinorTickLines = function (intervalValue, scaleGroup) {
        var minorTickGroup = this.bulletChart.renderer.createGroup({ 'id': this.bulletChart.svgObject.id + '_minorTickGroup' });
        var bullet = this.bulletChart;
        var max = bullet.maximum;
        var min = bullet.minimum;
        var interval = bullet.interval;
        var minorTick = bullet.minorTickLines.height;
        var minorTicksPerInterval = this.bulletChart.minorTicksPerInterval;
        var minorPointX;
        var x;
        var majorPointX = bullet.initialClipRect.x;
        var y1 = bullet.initialClipRect.y + ((bullet.opposedPosition) ? 0 : bullet.initialClipRect.height);
        var y2 = y1 + ((!bullet.opposedPosition) ? ((bullet.tickPosition !== 'Inside' ? minorTick : -minorTick)) :
            ((bullet.tickPosition !== 'Inside' ? -minorTick : minorTick)));
        var strokeColor = bullet.minorTickLines.color || bullet.themeStyle.minorTickLineColor;
        var options;
        var minorTicks;
        var size = bullet.initialClipRect.x + ((bullet.enableRtl) ? bullet.initialClipRect.width : 0);
        for (var i = min; i < max; i += interval) {
            minorPointX = intervalValue / minorTicksPerInterval;
            for (var j = 1; j <= minorTicksPerInterval; j++) {
                x = majorPointX + minorPointX - (minorPointX / (minorTicksPerInterval + 1));
                if (bullet.minorTickLines.useRangeColor) {
                    strokeColor = this.bindingRangeStrokes(x, size, this.bulletChart.orientation, bullet.enableRtl);
                }
                options = this.minorXTicks(x, x, y1, y2, strokeColor, i.toString() + j.toString());
                minorTicks = this.bulletChart.renderer.drawLine(options);
                minorTickGroup.appendChild(minorTicks);
                scaleGroup.appendChild(minorTickGroup);
                minorPointX = (intervalValue / minorTicksPerInterval) * (j + 1);
            }
            majorPointX += intervalValue;
        }
    };
    /**
     * To render minor tick lines of bullet chart
     */
    BulletChartAxis.prototype.renderYMinorTickLines = function (intervalValue, scaleGroup) {
        var minorTickGroup = this.bulletChart.renderer.createGroup({ 'id': this.bulletChart.svgObject.id + '_minorTickGroup' });
        var bulletChart = this.bulletChart;
        var max = bulletChart.maximum;
        var min = bulletChart.minimum;
        var interval = bulletChart.interval;
        var minorTick = bulletChart.minorTickLines.height;
        var minorTicksPerInterval = this.bulletChart.minorTicksPerInterval;
        var minorPointY;
        var y;
        var majorPointY = bulletChart.initialClipRect.y + ((!bulletChart.enableRtl) ? bulletChart.initialClipRect.height : 0);
        var x1 = bulletChart.initialClipRect.x + ((!bulletChart.opposedPosition) ? 0 : bulletChart.initialClipRect.width);
        var x2 = x1 - ((!bulletChart.opposedPosition) ? ((bulletChart.tickPosition !== 'Inside' ? minorTick : -minorTick)) :
            ((bulletChart.tickPosition !== 'Inside' ? -minorTick : minorTick)));
        var strokeColor = bulletChart.minorTickLines.color || bulletChart.themeStyle.minorTickLineColor;
        var options;
        var minorTicks;
        var size = bulletChart.initialClipRect.y + ((!bulletChart.enableRtl) ? bulletChart.initialClipRect.height : 0);
        for (var i = min; i < max; i += interval) {
            minorPointY = intervalValue / minorTicksPerInterval;
            for (var j = 1; j <= minorTicksPerInterval; j++) {
                if (!this.bulletChart.enableRtl) {
                    y = majorPointY - minorPointY + (minorPointY / (minorTicksPerInterval + 1));
                }
                else {
                    y = majorPointY + minorPointY - (minorPointY / (minorTicksPerInterval + 1));
                }
                if (bulletChart.minorTickLines.useRangeColor) {
                    strokeColor = this.bindingRangeStrokes(y, size, this.bulletChart.orientation, bulletChart.enableRtl);
                }
                options = this.minorXTicks(x1, x2, y, y, strokeColor, i.toString() + j.toString());
                minorTicks = this.bulletChart.renderer.drawLine(options);
                minorTickGroup.appendChild(minorTicks);
                scaleGroup.appendChild(minorTickGroup);
                minorPointY = (intervalValue / minorTicksPerInterval) * (j + 1);
            }
            majorPointY -= (this.bulletChart.enableRtl) ? -intervalValue : intervalValue;
        }
    };
    BulletChartAxis.prototype.minorXTicks = function (x1, x2, y1, y2, strokeColor, i) {
        var options = {
            'id': this.bulletChart.svgObject.id + '_MajorTickLine_' + i,
            'x1': x1,
            'x2': x2,
            'y1': y1,
            'y2': y2,
            'stroke-width': this.bulletChart.minorTickLines.width,
            'stroke': (this.bulletChart.minorTickLines.useRangeColor && strokeColor) ? strokeColor :
                this.bulletChart.minorTickLines.color || strokeColor
        };
        return options;
    };
    BulletChartAxis.prototype.forwardStrokeBinding = function (position, size) {
        var bullet = this.bulletChart;
        var previous = size;
        // (bullet.orientation === 'Horizontal') ? bullet.initialClipRect.x :
        // (bullet.initialClipRect.y + bullet.initialClipRect.height);
        for (var k = 0; k <= bullet.rangeCollection.length - 1; k++) {
            previous += (!k) ? 0 : bullet.rangeCollection[k - 1];
            if (position >= previous && position < previous + bullet.rangeCollection[k]) {
                return bullet.ranges[k].color;
            }
        }
        return null;
    };
    BulletChartAxis.prototype.backwardStrokeBinding = function (position, size) {
        var bullet = this.bulletChart;
        var previous = size;
        for (var k = 0; k <= bullet.rangeCollection.length - 1; k++) {
            previous -= (!k) ? 0 : bullet.rangeCollection[k - 1];
            if (Math.round(position) >= Math.round(previous - bullet.rangeCollection[k]) && position <= previous) {
                return bullet.ranges[k].color;
            }
        }
        return null;
    };
    /**
     * To render axis labels of bullet chart
     */
    BulletChartAxis.prototype.renderXAxisLabels = function (intervalValue, scaleGroup) {
        var axisLabelGroup = this.bulletChart.renderer.createGroup({ 'id': this.bulletChart.svgObject.id + '_axisLabelGroup' });
        var text;
        var bullet = this.bulletChart;
        var locale = this.bulletChart.locale;
        var padding = 5;
        var enableRtl = bullet.enableRtl;
        var tick = (((bullet.tickPosition === bullet.labelPosition) ? bullet.majorTickLines.height : 0) + padding * 2);
        var y = bullet.initialClipRect.y + ((bullet.opposedPosition) ? ((bullet.labelPosition === 'Inside') ? tick : -tick)
            : bullet.initialClipRect.height + ((bullet.labelPosition === 'Inside') ? -tick : tick));
        var x = bullet.initialClipRect.x + ((enableRtl) ? bullet.initialClipRect.width : 0);
        var min = bullet.minimum;
        var max = bullet.maximum;
        var interval = bullet.interval;
        var localizedText = locale && this.bulletChart.enableGroupSeparator;
        var format = this.getFormat(this.bulletChart);
        var strokeColor = bullet.labelStyle.color || bullet.themeStyle.labelFontColor;
        var condition;
        var isCustomFormat = format.match('{value}') !== null;
        this.format = this.bulletChart.intl.getNumberFormat({
            format: isCustomFormat ? '' : format, useGrouping: this.bulletChart.enableGroupSeparator
        });
        var size = bullet.initialClipRect.x + ((bullet.enableRtl) ? bullet.initialClipRect.width : 0);
        y += measureText(this.formatValue(this, isCustomFormat, format, this.bulletChart.maximum), bullet.labelStyle).height / 3;
        for (var i = min; i <= max; i += interval) {
            condition = (!bullet.enableRtl) ? (i === max) : (i === min);
            if (bullet.labelStyle.useRangeColor) {
                strokeColor = this.bindingRangeStrokes(x - ((condition) ? this.bulletChart.majorTickLines.width / 2 : 0), size, this.bulletChart.orientation, bullet.enableRtl);
            }
            text = localizedText ? i.toLocaleString(locale) : this.formatValue(this, isCustomFormat, format, i);
            var labelOptions = this.labelXOptions(x, y, text, i);
            var label = textElement(labelOptions, this.bulletChart.labelStyle, strokeColor, scaleGroup);
            axisLabelGroup.appendChild(label);
            x += (enableRtl) ? -intervalValue : intervalValue;
        }
        scaleGroup.appendChild(axisLabelGroup);
    };
    BulletChartAxis.prototype.labelXOptions = function (labelX, pointY, displayText, i) {
        var labelOptions = {
            'id': this.bulletChart.svgObject.id + '_AxisLabel_' + i,
            'anchor': 'middle',
            'text': displayText,
            'transform': '',
            'x': labelX,
            'y': pointY,
            'baseLine': '',
            'labelRotation': 0
        };
        return labelOptions;
    };
    /**
     * To render axis labels of bullet chart
     */
    BulletChartAxis.prototype.renderYAxisLabels = function (intervalValue, scaleGroup) {
        var axisLabelGroup = this.bulletChart.renderer.createGroup({ 'id': this.bulletChart.svgObject.id + '_axisLabelGroup' });
        var text;
        var bulletChart = this.bulletChart;
        var locale = bulletChart.locale;
        var padding = 5;
        var enableRtl = bulletChart.enableRtl;
        var tick = (((bulletChart.tickPosition === bulletChart.labelPosition) ?
            bulletChart.majorTickLines.height : 0) + padding * 2);
        var y = bulletChart.initialClipRect.y + ((!enableRtl) ? bulletChart.initialClipRect.height : 0);
        var x = bulletChart.initialClipRect.x + ((!bulletChart.opposedPosition) ?
            ((bulletChart.labelPosition === 'Inside') ? (tick + padding * 2) : -tick)
            : bulletChart.initialClipRect.width + ((bulletChart.labelPosition === 'Inside') ? -(tick + padding * 2) : tick));
        var min = bulletChart.minimum;
        var max = bulletChart.maximum;
        var interval = bulletChart.interval;
        var localizedText = locale && this.bulletChart.enableGroupSeparator;
        var strokeColor = bulletChart.labelStyle.color || bulletChart.themeStyle.labelFontColor;
        var format = this.getFormat(this.bulletChart);
        var isCustomFormat = format.match('{value}') !== null;
        var condition;
        this.format = this.bulletChart.intl.getNumberFormat({
            format: isCustomFormat ? '' : format, useGrouping: this.bulletChart.enableGroupSeparator
        });
        var size = bulletChart.initialClipRect.y + ((!bulletChart.enableRtl) ? bulletChart.initialClipRect.height : 0);
        var labelWidth = measureText(this.formatValue(this, isCustomFormat, format, this.bulletChart.maximum), bulletChart.labelStyle).width / 2;
        var height = measureText(this.formatValue(this, isCustomFormat, format, this.bulletChart.maximum), bulletChart.labelStyle).height / 3;
        y += height;
        for (var i = min; i <= max; i += interval) {
            condition = (bulletChart.enableRtl) ? (i === max) : (i === min);
            if (bulletChart.labelStyle.useRangeColor) {
                strokeColor = this.bindingRangeStrokes(y - height - ((condition) ? this.bulletChart.majorTickLines.width / 2 : 0), size, this.bulletChart.orientation, bulletChart.enableRtl);
            }
            text = localizedText ? i.toLocaleString(locale) : this.formatValue(this, isCustomFormat, format, i);
            //labelWidth = measureText(text, bullet.labelStyle).width / 2;
            var labelOptions = this.labelXOptions(x - (!this.bulletChart.opposedPosition ? labelWidth : -labelWidth), y, text, i);
            var label = textElement(labelOptions, this.bulletChart.labelStyle, strokeColor, scaleGroup);
            axisLabelGroup.appendChild(label);
            y += (!enableRtl) ? -intervalValue : intervalValue;
        }
        scaleGroup.appendChild(axisLabelGroup);
    };
    /**
     * Format of the axis label.
     *
     * @private
     */
    BulletChartAxis.prototype.getFormat = function (axis) {
        if (axis.labelFormat) {
            return axis.labelFormat;
        }
        return '';
    };
    /**
     * Formatted the axis label.
     *
     * @private
     */
    BulletChartAxis.prototype.formatValue = function (axis, isCustom, format, tempInterval) {
        return isCustom ? format.replace('{value}', axis.format(tempInterval))
            : axis.format(tempInterval);
    };
    return BulletChartAxis;
}());
export { BulletChartAxis };
