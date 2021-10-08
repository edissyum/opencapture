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
import { Property, ChildProperty } from '@syncfusion/ej2-base';
/**
 * Defines and processes coordinates
 */
var Point = /** @class */ (function (_super) {
    __extends(Point, _super);
    function Point() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**   @private  */
    Point.equals = function (point1, point2) {
        if (point1 === point2) {
            return true;
        }
        if (!point1 || !point2) {
            return false;
        }
        return !point1 || !point2 || point1.x === point2.x && point1.y === point2.y;
    };
    /**
     * check whether the points are given
     */
    Point.isEmptyPoint = function (point) {
        if (point.x && point.y) {
            return false;
        }
        return true;
    };
    /**   @private  */
    Point.transform = function (point, angle, length) {
        var pt = { x: 0, y: 0 };
        pt.x = Math.round((point.x + length * Math.cos(angle * Math.PI / 180)) * 100) / 100;
        pt.y = Math.round((point.y + length * Math.sin(angle * Math.PI / 180)) * 100) / 100;
        return pt;
    };
    /**   @private  */
    Point.findLength = function (s, e) {
        var length = Math.sqrt(Math.pow((s.x - e.x), 2) + Math.pow((s.y - e.y), 2));
        return length;
    };
    /**   @private  */
    Point.findAngle = function (point1, point2) {
        var angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
        angle = (180 * angle / Math.PI);
        angle %= 360;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    };
    /**   @private  */
    Point.distancePoints = function (pt1, pt2) {
        return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
    };
    /**   @private  */
    Point.getLengthFromListOfPoints = function (points) {
        var length = 0;
        for (var j = 0; j < points.length - 1; j++) {
            length += this.distancePoints(points[j], points[j + 1]);
        }
        return length;
    };
    /**   @private  */
    Point.adjustPoint = function (source, target, isStart, length) {
        var pt = isStart ? { x: source.x, y: source.y } : { x: target.x, y: target.y };
        var angle;
        if (source.x === target.x) {
            if (source.y < target.y && isStart || source.y > target.y && !isStart) {
                pt.y += length;
            }
            else {
                pt.y -= length;
            }
        }
        else if (source.y === target.y) {
            if (source.x < target.x && isStart || source.x > target.x && !isStart) {
                pt.x += length;
            }
            else {
                pt.x -= length;
            }
        }
        else {
            if (isStart) {
                angle = this.findAngle(source, target);
                pt = this.transform(source, angle, length);
            }
            else {
                angle = this.findAngle(target, source);
                pt = this.transform(target, angle, length);
            }
        }
        return pt;
    };
    /**   @private  */
    Point.direction = function (pt1, pt2) {
        if (Math.abs(pt2.x - pt1.x) > Math.abs(pt2.y - pt1.y)) {
            return pt1.x < pt2.x ? 'Right' : 'Left';
        }
        else {
            return pt1.y < pt2.y ? 'Bottom' : 'Top';
        }
    };
    /**
     * @private
     * Returns the name of class Point
     */
    Point.prototype.getClassName = function () {
        return 'Point';
    };
    __decorate([
        Property(0)
    ], Point.prototype, "x", void 0);
    __decorate([
        Property(0)
    ], Point.prototype, "y", void 0);
    return Point;
}(ChildProperty));
export { Point };
