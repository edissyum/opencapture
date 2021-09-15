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
/**
 * Path.ts class for EJ2-PDF
 */
import { PdfBrush } from './../brushes/pdf-brush';
import { PdfPen } from './../pdf-pen';
import { PdfLayoutFormat } from './../figures/base/element-layouter';
import { RectangleF, PointF } from './../../drawing/pdf-drawing';
import { PathPointType } from './enum';
import { PdfFillElement } from './../figures/base/fill-element';
import { PdfFillMode } from './../enum';
/**
 * `PdfPath` class Implements graphics path, which is a sequence of primitive graphics elements.
 * @private
 */
var PdfPath = /** @class */ (function (_super) {
    __extends(PdfPath, _super);
    /**
     * Initializes a new instance of the `PdfPath` class.
     * @public
     */
    /* tslint:disable-next-line:max-line-length */
    function PdfPath(arg1, arg2, arg3, arg4) {
        var _this = _super.call(this) || this;
        // Fields
        /**
         * Local variable to store the points.
         * @private
         */
        _this.mpoints = null;
        /**
         * Local variable to store the path Types.
         * @private
         */
        _this.mpathTypes = null;
        /**
         * Local variable to store the Start Figure.
         * @private
         */
        _this.mStartFigure = true;
        /**
         * Local variable to store the fill Mode.
         * @private
         */
        _this.mfillMode = PdfFillMode.Alternate;
        /**
         * Local variable to store the Beziers.
         * @private
         */
        _this.isBeziers3 = false;
        /**
         * Local variable to store the xps.
         * @private
         */
        _this.isXps = false;
        if (typeof arg1 === 'undefined') {
            //
        }
        else if (arg1 instanceof PdfPen) {
            _this = _super.call(this, arg1) || this;
            if (arg2 instanceof PdfBrush) {
                _this = _super.call(this, arg1, arg2) || this;
                _this.fillMode = arg3;
            }
            else if (arg2 !== null && typeof arg2 !== 'undefined' && arg3 !== null && typeof arg3 !== 'undefined') {
                _this.addPath(arg2, arg3);
            }
        }
        else if (arg1 instanceof PdfBrush) {
            _this = _super.call(this, arg1) || this;
            if (arg2 !== null && typeof arg2 !== 'undefined') {
                _this.fillMode = arg2;
            }
            if (arg3 !== null && typeof arg3 !== 'undefined' && arg4 !== null && typeof arg4 !== 'undefined') {
                _this.addPath(arg3, arg4);
            }
        }
        else {
            _this.addPath(arg1, arg2);
        }
        return _this;
    }
    Object.defineProperty(PdfPath.prototype, "fillMode", {
        // Properties
        /**
         * Gets or sets the fill mode.
         * @public
         */
        get: function () {
            return this.mfillMode;
        },
        set: function (value) {
            this.mfillMode = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPath.prototype, "pathPoints", {
        /**
         * Gets the path points.
         * @public
         */
        get: function () {
            return this.points;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPath.prototype, "pathTypes", {
        /**
         * Gets the path point types.
         * @public
         */
        get: function () {
            return this.types;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPath.prototype, "pointCount", {
        /**
         * Gets the point count.
         * @public
         */
        get: function () {
            var count = 0;
            if ((this.mpoints != null)) {
                count = this.mpoints.length;
            }
            return count;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPath.prototype, "lastPoint", {
        /**
         * Gets the last points.
         * @public
         */
        get: function () {
            return this.getLastPoint();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPath.prototype, "points", {
        /**
         * Gets the points list.
         * @private
         */
        get: function () {
            if ((this.mpoints == null)) {
                this.mpoints = [];
            }
            return this.mpoints;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPath.prototype, "types", {
        /**
         * Gets the types.
         * @private
         */
        get: function () {
            if ((this.mpathTypes == null)) {
                this.mpathTypes = [];
            }
            return this.mpathTypes;
        },
        enumerable: true,
        configurable: true
    });
    PdfPath.prototype.draw = function (arg1, arg2, arg3, arg4) {
        if (arg2 instanceof PointF && typeof arg2.width === 'undefined' && typeof arg3 === 'undefined') {
            return this.drawHelper(arg1, arg2.x, arg2.y);
        }
        else if (arg2 instanceof RectangleF && typeof arg2.width !== 'undefined' && typeof arg3 === 'undefined') {
            return this.drawHelper(arg1, arg2, null);
        }
        else if (typeof arg2 === 'number' && typeof arg3 === 'number' && typeof arg4 === 'undefined') {
            return this.drawHelper(arg1, arg2, arg3, null);
        }
        else if (arg2 instanceof PointF && arg3 instanceof PdfLayoutFormat) {
            return this.drawHelper(arg1, arg2.x, arg2.y, arg3);
        }
        else if (typeof arg2 === 'number' && (arg4 instanceof PdfLayoutFormat || arg4 == null) && typeof arg3 === 'number') {
            var widthValue = (arg1.graphics.clientSize.width - arg2);
            var layoutRect = new RectangleF(arg2, arg3, widthValue, 0);
            return this.drawHelper(arg1, layoutRect, arg4);
        }
        else if (arg2 instanceof RectangleF && arg3 instanceof PdfLayoutFormat) {
            return this.drawHelper(arg1, arg2, arg3);
        }
        else {
            return this.drawHelper(arg1, arg2, arg3);
        }
    };
    PdfPath.prototype.addArc = function (arg1, arg2, arg3, arg4, arg5, arg6) {
        if (arg1 instanceof RectangleF) {
            this.addArc(arg1.x, arg1.y, arg1.width, arg1.height, arg2, arg3);
        }
        else {
            var points = this.getBezierArcPoints(arg1, arg2, (arg2 + arg3), (arg2 + arg4), arg5, arg6);
            for (var i = 0; i < points.length; i = i + 8) {
                /* tslint:disable-next-line:max-line-length */
                var point = [points[i], points[i + 1], points[i + 2], points[i + 3], points[i + 4], points[i + 5], points[i + 6], points[i + 7]];
                this.addPoints(point, PathPointType.Bezier3);
            }
        }
    };
    /* tslint:disable-next-line:max-line-length */
    PdfPath.prototype.addBezier = function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        if (arg1 instanceof PointF && arg2 instanceof PointF && arg3 instanceof PointF && arg4 instanceof PointF) {
            this.addBezier(arg1.x, arg1.y, arg2.x, arg2.y, arg3.x, arg3.y, arg4.x, arg4.y);
        }
        else {
            var points = [];
            points.push(arg1);
            points.push(arg2);
            points.push(arg3);
            points.push(arg4);
            points.push(arg5);
            points.push(arg6);
            points.push(arg7);
            points.push(arg8);
            this.addPoints(points, PathPointType.Bezier3);
        }
    };
    PdfPath.prototype.addEllipse = function (arg1, arg2, arg3, arg4) {
        if (arg1 instanceof RectangleF) {
            this.addEllipse(arg1.x, arg1.y, arg1.width, arg1.height);
        }
        else {
            this.startFigure();
            this.addArc(arg1, arg2, arg3, arg4, 0, 360);
            this.closeFigure();
        }
    };
    PdfPath.prototype.addLine = function (arg1, arg2, arg3, arg4) {
        if (arg1 instanceof PointF && arg2 instanceof PointF) {
            this.addLine(arg1.x, arg1.y, arg2.x, arg2.y);
        }
        else {
            var points = [];
            points.push(arg1);
            points.push(arg2);
            points.push(arg3);
            points.push(arg4);
            this.addPoints(points, PathPointType.Line);
        }
    };
    PdfPath.prototype.addPath = function (arg1, arg2) {
        if (arg1 instanceof PdfPath) {
            this.addPath(arg1.pathPoints, arg1.pathTypes);
        }
        else {
            if ((arg1 == null)) {
                throw new Error('ArgumentNullException:pathPoints');
            }
            if ((arg2 == null)) {
                throw new Error('ArgumentNullException:pathTypes');
            }
            var count = arg1.length;
            if ((count !== arg2.length)) {
                throw new Error('The argument arrays should be of equal length.');
            }
        }
    };
    PdfPath.prototype.addPie = function (arg1, arg2, arg3, arg4, arg5, arg6) {
        if (arg1 instanceof RectangleF) {
            this.addPie(arg1.x, arg1.y, arg1.width, arg1.height, arg2, arg3);
        }
        else {
            this.startFigure();
            this.addArc(arg1, arg2, arg3, arg4, arg5, arg6);
            this.addPoint(new PointF((arg1 + (arg3 / 2)), (arg2 + (arg4 / 2))), PathPointType.Line);
            this.closeFigure();
        }
    };
    /**
     * `add a polygon` specified by points.
     * @param points The points of the polygon
     */
    PdfPath.prototype.addPolygon = function (points) {
        var count = (points.length * 2);
        var p = [];
        this.startFigure();
        for (var i = 0; i < points.length; i++) {
            p.push(points[i].x);
            p.push(points[i].y);
        }
        this.addPoints(p, PathPointType.Line);
        this.closeFigure();
    };
    PdfPath.prototype.addRectangle = function (arg1, y, width, height) {
        if (arg1 instanceof RectangleF) {
            this.addRectangle(arg1.x, arg1.y, arg1.width, arg1.height);
        }
        else {
            var points = [];
            this.startFigure();
            points.push(arg1);
            points.push(y);
            points.push((arg1 + width));
            points.push(y);
            points.push((arg1 + width));
            points.push((y + height));
            points.push(arg1);
            points.push((y + height));
            this.addPoints(points, PathPointType.Line);
            this.closeFigure();
        }
    };
    /**
     * Starts a new figure.
     * @public
     */
    PdfPath.prototype.startFigure = function () {
        this.mStartFigure = true;
    };
    /**
     * Closed all non-closed figures.
     * @public
     */
    PdfPath.prototype.closeAllFigures = function () {
        var startPath = this.pathPoints[0];
        for (var i = 0; i < this.mpathTypes.length; i++) {
            var pt = ((this.types[i]));
            var flag = false;
            if (((i !== 0) && (pt === PathPointType.Start))) {
                this.closeFigure((i - 1));
                flag = true;
            }
            else if (((i === (this.mpathTypes.length - 1)) && (!flag && this.isXps))) {
                if ((startPath.x === this.pathPoints[i].y)) {
                    this.closeFigure(i);
                }
            }
        }
    };
    /**
     * Gets the last point.
     * @public
     */
    PdfPath.prototype.getLastPoint = function () {
        var lastPoint = new PointF(0, 0);
        var count = this.pointCount;
        if (((count > 0) && (this.mpoints != null))) {
            lastPoint.x = this.mpoints[(count - 1)].x;
            lastPoint.y = this.mpoints[(count - 1)].y;
        }
        return lastPoint;
    };
    /**
     * Gets the bezier points for arc constructing.
     * @public
     */
    PdfPath.prototype.getBezierArcPoints = function (x1, y1, x2, y2, s1, e1) {
        if ((x1 > x2)) {
            var tmp = void 0;
            tmp = x1;
            x1 = x2;
            x2 = tmp;
        }
        if ((y2 > y1)) {
            var tmp = void 0;
            tmp = y1;
            y1 = y2;
            y2 = tmp;
        }
        var fragAngle;
        var numFragments;
        if ((Math.abs(e1) <= 90)) {
            fragAngle = e1;
            numFragments = 1;
        }
        else {
            numFragments = (Math.ceil((Math.abs(e1) / 90)));
            fragAngle = (e1 / numFragments);
        }
        var xcen = ((x1 + x2) / 2);
        var ycen = ((y1 + y2) / 2);
        var rx = ((x2 - x1) / 2);
        var ry = ((y2 - y1) / 2);
        var halfAng = ((fragAngle * (Math.PI / 360)));
        var kappa = (Math.abs(4.0 / 3.0 * (1.0 - Math.cos(halfAng)) / Math.sin(halfAng)));
        var pointList = [];
        for (var i = 0; (i < numFragments); i++) {
            var theta0 = (((s1 + (i * fragAngle)) * (Math.PI / 180)));
            var theta1 = (((s1 + ((i + 1) * fragAngle)) * (Math.PI / 180)));
            var cos0 = (Math.cos(theta0));
            var cos1 = (Math.cos(theta1));
            var sin0 = (Math.sin(theta0));
            var sin1 = (Math.sin(theta1));
            if ((fragAngle > 0)) {
                /* tslint:disable-next-line:max-line-length */
                pointList.push((xcen + (rx * cos0)), (ycen - (ry * sin0)), (xcen + (rx * (cos0 - (kappa * sin0)))), (ycen - (ry * (sin0 + (kappa * cos0)))), (xcen + (rx * (cos1 + (kappa * sin1)))), (ycen - (ry * (sin1 - (kappa * cos1)))), (xcen + (rx * cos1)), (ycen - (ry * sin1)));
            }
            else {
                /* tslint:disable-next-line:max-line-length */
                pointList.push((xcen + (rx * cos0)), (ycen - (ry * sin0)), (xcen + (rx * (cos0 + (kappa * sin0)))), (ycen - (ry * (sin0 - (kappa * cos0)))), (xcen + (rx * (cos1 - (kappa * sin1)))), (ycen - (ry * (sin1 + (kappa * cos1)))), (xcen + (rx * cos1)), (ycen - (ry * sin1)));
            }
        }
        return pointList;
    };
    /**
     * `getBoundsInternal` Returns a rectangle that bounds this element.
     * @public
     */
    PdfPath.prototype.getBoundsInternal = function () {
        var points = this.pathPoints;
        var bounds = new RectangleF(0, 0, 0, 0);
        if ((points.length > 0)) {
            var xmin = points[0].x;
            var xmax = points[0].x;
            var ymin = points[0].y;
            var ymax = points[0].y;
            for (var i = 1; i < points.length; i++) {
                var point = points[i];
                xmin = Math.min(point.x, xmin);
                xmax = Math.max(point.x, xmax);
                ymin = Math.min(point.y, ymin);
                ymax = Math.max(point.y, ymax);
            }
            bounds = new RectangleF(xmin, ymin, (xmax - xmin), (ymax - ymin));
        }
        return bounds;
    };
    /**
     * `drawInternal` Draws an element on the Graphics.
     * @param graphics Graphics context where the element should be printed.
     * @public
     */
    PdfPath.prototype.drawInternal = function (graphics) {
        if ((graphics == null)) {
            throw new Error('ArgumentNullException :graphics');
        }
        graphics.drawPath(this.obtainPen(), this.brush, this);
    };
    PdfPath.prototype.addPoints = function (points, pointType, startIndex, endIndex) {
        if (typeof startIndex === 'undefined' && typeof endIndex === 'undefined') {
            this.addPoints(points, pointType, 0, points.length);
        }
        else {
            for (var i = startIndex; i < endIndex; i++) {
                var point = new PointF(points[i], points[(i + 1)]);
                if ((i === startIndex)) {
                    if (((this.pointCount <= 0) || this.mStartFigure)) {
                        this.addPoint(point, PathPointType.Start);
                        this.mStartFigure = false;
                    }
                    else if (((point.x !== this.lastPoint.x) && (point.y !== this.lastPoint.y) && !this.isBeziers3)) {
                        this.addPoint(point, PathPointType.Line);
                    }
                    else if ((point.x !== this.lastPoint.x) && (point.y !== this.lastPoint.y)) {
                        this.addPoint(point, PathPointType.Bezier3);
                    }
                }
                else {
                    this.addPoint(point, pointType);
                }
                i++;
            }
        }
    };
    /**
     * `add a point` Adds the point and its type
     * @param points The points.
     * @param pointType Type of the points.
     * @private
     */
    PdfPath.prototype.addPoint = function (point, pointType) {
        this.points.push(point);
        this.types.push((pointType));
    };
    PdfPath.prototype.closeFigure = function (index) {
        if (typeof index === 'undefined') {
            if ((this.pointCount > 0)) {
                this.closeFigure(this.pointCount - 1);
            }
            this.startFigure();
        }
        else {
            if ((index < 0)) {
                throw new Error('IndexOutOfRangeException()');
            }
            var pt = ((this.types[index]));
            pt = (pt | PathPointType.CloseSubpath);
            this.types[index] = (pt);
        }
    };
    return PdfPath;
}(PdfFillElement));
export { PdfPath };
