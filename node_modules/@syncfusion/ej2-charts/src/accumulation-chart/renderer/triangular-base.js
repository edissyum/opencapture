/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable jsdoc/require-param */
/* eslint-disable valid-jsdoc */
/**
 * Defines the common behavior of funnel and pyramid series
 */
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
import { Rect, Size } from '@syncfusion/ej2-svg-base';
import { stringToNumber } from '../../common/utils/helper';
import { AccumulationBase } from './accumulation-base';
/**
 * TriangularBase is used to calculate base functions for funnel/pyramid series.
 */
var TriangularBase = /** @class */ (function (_super) {
    __extends(TriangularBase, _super);
    function TriangularBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Initializes the properties of funnel/pyramid series
     *
     * @private
     */
    TriangularBase.prototype.initProperties = function (chart, series) {
        var actualChartArea = chart.initialClipRect;
        series.triangleSize = new Size(stringToNumber(series.width, actualChartArea.width), stringToNumber(series.height, actualChartArea.height));
        series.neckSize = new Size(stringToNumber(series.neckWidth, actualChartArea.width), stringToNumber(series.neckHeight, actualChartArea.height));
        this.defaultLabelBound(series, series.dataLabel.visible, series.dataLabel.position, chart);
        if (series.explodeOffset === '30%') {
            series.explodeOffset = '25px';
        }
        chart.explodeDistance = stringToNumber(series.explodeOffset, actualChartArea.width);
        var points = series.points;
        this.initializeSizeRatio(points, series);
    };
    /**
     * Initializes the size of the pyramid/funnel segments
     *
     * @private
     */
    TriangularBase.prototype.initializeSizeRatio = function (points, series, reverse) {
        if (reverse === void 0) { reverse = false; }
        var sumOfPoints = series.sumOfPoints;
        //Limiting the ratio within the range of 0 to 1
        var gapRatio = Math.min(Math.max(series.gapRatio, 0), 1);
        //% equivalence of a value 1
        var coEff = 1 / (sumOfPoints * (1 + gapRatio / (1 - gapRatio)));
        var spacing = gapRatio / (points.length - 1);
        var y = 0;
        //starting from bottom
        for (var i = points.length - 1; i >= 0; i--) {
            var index = reverse ? points.length - 1 - i : i;
            if (points[index].visible) {
                var height = coEff * points[index].y;
                points[index].yRatio = y;
                points[index].heightRatio = height;
                y += height + spacing;
            }
        }
    };
    /**
     * Marks the label location from the set of points that forms a pyramid/funnel segment
     *
     * @private
     */
    TriangularBase.prototype.setLabelLocation = function (series, point, points) {
        var last = points.length - 1;
        var bottom = series.type === 'Funnel' ? points.length - 2 : points.length - 1;
        var x = (points[0].x + points[bottom].x) / 2;
        var right = (points[1].x + points[bottom - 1].x) / 2;
        point.region = new Rect(x, points[0].y, right - x, points[bottom].y - points[0].y);
        point.symbolLocation = {
            x: point.region.x + point.region.width / 2,
            y: point.region.y + point.region.height / 2
        };
        point.labelOffset = {
            x: point.symbolLocation.x - (points[0].x + points[last].x) / 2,
            y: point.symbolLocation.y - (points[0].y + points[last].y) / 2
        };
    };
    /**
     * Finds the path to connect the list of points
     *
     * @private
     */
    TriangularBase.prototype.findPath = function (locations) {
        var path = 'M';
        for (var i = 0; i < locations.length; i++) {
            path += locations[i].x + ' ' + locations[i].y;
            if (i !== locations.length - 1) {
                path += ' L';
            }
        }
        return path;
    };
    /**
     * To calculate data-label bounds
     *
     * @private
     */
    TriangularBase.prototype.defaultLabelBound = function (series, visible, position, chart) {
        var x = (chart.initialClipRect.width - series.triangleSize.width) / 2;
        var y = (chart.initialClipRect.height - series.triangleSize.height) / 2;
        var accumulationBound = new Rect(x, y, series.triangleSize.width, series.triangleSize.height);
        series.labelBound = new Rect(accumulationBound.x, accumulationBound.y, accumulationBound.width + accumulationBound.x, accumulationBound.height + accumulationBound.y);
        series.accumulationBound = accumulationBound;
        if (visible && position === 'Outside') {
            series.labelBound = new Rect(Infinity, Infinity, -Infinity, -Infinity);
        }
    };
    return TriangularBase;
}(AccumulationBase));
export { TriangularBase };
