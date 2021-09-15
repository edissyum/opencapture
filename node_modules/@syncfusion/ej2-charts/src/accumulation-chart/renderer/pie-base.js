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
/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable jsdoc/require-param */
/* eslint-disable valid-jsdoc */
/**
 * Accumulation charts base file
 */
import { Animation, isNullOrUndefined } from '@syncfusion/ej2-base';
import { stringToNumber, ChartLocation, degreeToLocation, getAnimationFunction, getElement } from '../../common/utils/helper';
import { Rect } from '@syncfusion/ej2-svg-base';
import { animationComplete } from '../../common/model/constants';
import { AccumulationBase } from './accumulation-base';
/**
 * PieBase class used to do pie base calculations.
 */
var PieBase = /** @class */ (function (_super) {
    __extends(PieBase, _super);
    function PieBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * To initialize the property values.
     *
     * @private
     */
    PieBase.prototype.initProperties = function (chart, series) {
        this.accumulation = chart;
        this.size = Math.min(chart.initialClipRect.width, chart.initialClipRect.height);
        this.initAngles(series);
        var r = parseInt(series.radius, 10);
        if ((series.radius.indexOf('%') !== -1 || typeof r === 'number') && !isNaN(r)) {
            this.isRadiusMapped = false;
            this.pieBaseRadius = stringToNumber(series.radius, this.size / 2);
            this.innerRadius = stringToNumber(series.innerRadius, this.pieBaseRadius);
            this.pieBaseLabelRadius = series.dataLabel.position === 'Inside' ? (((this.pieBaseRadius - this.innerRadius) / 2) + this.innerRadius) :
                (this.pieBaseRadius + stringToNumber(series.dataLabel.connectorStyle.length || '4%', this.size / 2));
        }
        else {
            var radiusCollection = [];
            this.isRadiusMapped = true;
            for (var i = 0; i < Object.keys(series.points).length; i++) {
                if (series.points[i].sliceRadius.indexOf('%') !== -1) {
                    radiusCollection[i] = stringToNumber(series.points[i].sliceRadius, this.size / 2);
                }
                else {
                    radiusCollection[i] = parseInt(series.points[i].sliceRadius, 10);
                }
            }
            var minRadius = Math.min.apply(null, radiusCollection);
            var maxRadius = Math.max.apply(null, radiusCollection);
            this.pieBaseRadius = this.seriesRadius = maxRadius;
            this.innerRadius = stringToNumber(series.innerRadius, this.seriesRadius);
            this.innerRadius = this.innerRadius > minRadius ? (this.innerRadius / 2) : this.innerRadius;
        }
        // this.radius = stringToNumber(series.radius, size / 2);
        // this.innerRadius = stringToNumber(series.innerRadius, this.radius);
        // this.labelRadius = series.dataLabel.position === 'Inside' ? (((this.radius - this.innerRadius) / 2) + this.innerRadius) :
        //     (this.radius + stringToNumber(series.dataLabel.connectorStyle.length || '4%', size / 2));
        this.radius = this.pieBaseRadius;
        this.labelRadius = this.pieBaseLabelRadius;
        chart.explodeDistance = series.explode ? stringToNumber(series.explodeOffset, this.pieBaseRadius) : 0;
        this.findCenter(chart, series);
        this.center = this.pieBaseCenter;
        this.defaultLabelBound(series, series.dataLabel.visible, series.dataLabel.position);
        this.totalAngle -= 0.001;
    };
    /*
     * To get label radius of the pie.
     * @private
     */
    PieBase.prototype.getLabelRadius = function (series, point) {
        return series.dataLabel.position === 'Inside' ?
            ((((stringToNumber(point.sliceRadius, this.pieBaseRadius) - this.innerRadius)) / 2) + this.innerRadius) :
            (stringToNumber(point.sliceRadius, this.seriesRadius) + stringToNumber(series.dataLabel.connectorStyle.length || '4%', this.size / 2));
    };
    /**
     * To find the center of the accumulation.
     *
     * @private
     */
    PieBase.prototype.findCenter = function (accumulation, series) {
        this.accumulation = accumulation;
        this.pieBaseCenter = {
            x: stringToNumber(accumulation.center.x, accumulation.initialClipRect.width) + (accumulation.initialClipRect.x),
            y: stringToNumber(accumulation.center.y, accumulation.initialClipRect.height) + (accumulation.initialClipRect.y)
        };
        var accumulationRect = this.getSeriesBound(series);
        var accumulationRectCenter = new ChartLocation(accumulationRect.x + accumulationRect.width / 2, accumulationRect.y + accumulationRect.height / 2);
        this.pieBaseCenter.x += (this.pieBaseCenter.x - accumulationRectCenter.x);
        this.pieBaseCenter.y += (this.pieBaseCenter.y - accumulationRectCenter.y);
        this.accumulation.origin = this.pieBaseCenter;
    };
    /**
     * To find angles from series.
     */
    PieBase.prototype.initAngles = function (series) {
        var endAngle = isNullOrUndefined(series.endAngle) ? series.startAngle : series.endAngle;
        this.totalAngle = (endAngle - series.startAngle) % 360;
        this.startAngle = series.startAngle - 90;
        this.totalAngle = this.totalAngle <= 0 ? (360 + this.totalAngle) : this.totalAngle;
        this.startAngle = (this.startAngle < 0 ? (this.startAngle + 360) : this.startAngle) % 360;
    };
    /**
     * To calculate data-label bound
     *
     * @private
     */
    PieBase.prototype.defaultLabelBound = function (series, visible, position) {
        var accumulationBound = this.getSeriesBound(series);
        series.accumulationBound = accumulationBound;
        series.labelBound = new Rect(accumulationBound.x, accumulationBound.y, accumulationBound.width + accumulationBound.x, accumulationBound.height + accumulationBound.y);
        if (visible && position === 'Outside') {
            series.labelBound = new Rect(Infinity, Infinity, -Infinity, -Infinity);
        }
    };
    /**
     * To calculate series bound
     *
     * @private
     */
    PieBase.prototype.getSeriesBound = function (series) {
        var rect = new Rect(Infinity, Infinity, -Infinity, -Infinity);
        this.initAngles(series);
        var start = this.startAngle;
        var total = this.totalAngle;
        var end = (this.startAngle + total) % 360;
        end = (end === 0) ? 360 : end;
        series.findMaxBounds(rect, this.getRectFromAngle(start));
        series.findMaxBounds(rect, this.getRectFromAngle(end));
        series.findMaxBounds(rect, new Rect(this.pieBaseCenter.x, this.pieBaseCenter.y, 0, 0));
        var nextQuandrant = (Math.floor(start / 90) * 90 + 90) % 360;
        var lastQuadrant = (Math.floor(end / 90) * 90) % 360;
        lastQuadrant = (lastQuadrant === 0) ? 360 : lastQuadrant;
        if (total >= 90 || lastQuadrant === nextQuandrant) {
            series.findMaxBounds(rect, this.getRectFromAngle(nextQuandrant));
            series.findMaxBounds(rect, this.getRectFromAngle(lastQuadrant));
        }
        if (start === 0 || (start + total >= 360)) {
            series.findMaxBounds(rect, this.getRectFromAngle(0));
        }
        var length = nextQuandrant === lastQuadrant ? 0 : Math.floor(total / 90);
        for (var i = 1; i < length; i++) {
            nextQuandrant = nextQuandrant + 90;
            if ((nextQuandrant < lastQuadrant || end < start) || total === 360) {
                series.findMaxBounds(rect, this.getRectFromAngle(nextQuandrant));
            }
        }
        rect.width -= rect.x;
        rect.height -= rect.y;
        return rect;
    };
    /**
     * To get rect location size from angle
     */
    PieBase.prototype.getRectFromAngle = function (angle) {
        var location = degreeToLocation(angle, this.pieBaseRadius, this.pieBaseCenter);
        return new Rect(location.x, location.y, 0, 0);
    };
    /**
     * To get path arc direction
     */
    PieBase.prototype.getPathArc = function (center, start, end, radius, innerRadius) {
        var degree = end - start;
        degree = degree < 0 ? (degree + 360) : degree;
        var flag = (degree < 180) ? 0 : 1;
        if (!innerRadius && innerRadius === 0) {
            return this.getPiePath(center, degreeToLocation(start, radius, center), degreeToLocation(end, radius, center), radius, flag);
        }
        else {
            return this.getDoughnutPath(center, degreeToLocation(start, radius, center), degreeToLocation(end, radius, center), radius, degreeToLocation(start, innerRadius, center), degreeToLocation(end, innerRadius, center), innerRadius, flag);
        }
    };
    /**
     * To get pie direction
     */
    PieBase.prototype.getPiePath = function (center, start, end, radius, clockWise) {
        return 'M ' + center.x + ' ' + center.y + ' L ' + start.x + ' ' + start.y + ' A ' + radius + ' ' +
            radius + ' 0 ' + clockWise + ' 1 ' + end.x + ' ' + end.y + ' Z';
    };
    /**
     * To get doughnut direction
     */
    PieBase.prototype.getDoughnutPath = function (center, start, end, radius, innerStart, innerEnd, innerRadius, clockWise) {
        return 'M ' + start.x + ' ' + start.y + ' A ' + radius + ' ' + radius + ' 0 ' + clockWise +
            ' 1 ' + end.x + ' ' + end.y + ' L ' + innerEnd.x + ' ' + innerEnd.y + ' A ' + innerRadius +
            ' ' + innerRadius + ' 0 ' + clockWise + ',0 ' + innerStart.x + ' ' + innerStart.y + ' Z';
    };
    /**
     * Method to start animation for pie series.
     */
    PieBase.prototype.doAnimation = function (slice, series) {
        var _this = this;
        var startAngle = series.startAngle - 90;
        var duration = this.accumulation.duration ? this.accumulation.duration : series.animation.duration;
        var value;
        this.pieBaseCenter.x += 1;
        var radius = Math.max(this.accumulation.availableSize.height, this.accumulation.availableSize.width) * 0.75;
        radius += radius * (0.414); // formula r + r / 2 * (1.414 -1)
        // eslint-disable-next-line @typescript-eslint/ban-types
        var effect = getAnimationFunction('Linear'); // need to check animation type
        new Animation({}).animate(slice, {
            duration: duration,
            delay: series.animation.delay,
            progress: function (args) {
                value = effect(args.timeStamp, startAngle, _this.totalAngle, args.duration);
                slice.setAttribute('d', _this.getPathArc(_this.pieBaseCenter, startAngle, value, radius, 0));
            },
            end: function () {
                _this.pieBaseCenter.x -= 1;
                slice.setAttribute('d', _this.getPathArc(_this.pieBaseCenter, 0, 359.99999, radius, 0));
                _this.accumulation.trigger(animationComplete, _this.accumulation.isBlazor ? {} :
                    { series: series, accumulation: _this.accumulation, chart: _this.accumulation });
                var datalabelGroup = getElement(_this.accumulation.element.id + '_datalabel_Series_' + series.index);
                datalabelGroup.style.visibility = _this.accumulation.isDestroyed ? 'hidden' : 'visible';
            }
        });
    };
    return PieBase;
}(AccumulationBase));
export { PieBase };
