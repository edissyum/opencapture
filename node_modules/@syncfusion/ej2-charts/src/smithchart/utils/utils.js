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
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Property, ChildProperty } from '@syncfusion/ej2-base';
var SmithchartFont = /** @class */ (function (_super) {
    __extends(SmithchartFont, _super);
    function SmithchartFont() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('Segoe UI')
    ], SmithchartFont.prototype, "fontFamily", void 0);
    __decorate([
        Property('Normal')
    ], SmithchartFont.prototype, "fontStyle", void 0);
    __decorate([
        Property('Regular')
    ], SmithchartFont.prototype, "fontWeight", void 0);
    __decorate([
        Property('')
    ], SmithchartFont.prototype, "color", void 0);
    __decorate([
        Property('12px')
    ], SmithchartFont.prototype, "size", void 0);
    __decorate([
        Property(1)
    ], SmithchartFont.prototype, "opacity", void 0);
    return SmithchartFont;
}(ChildProperty));
export { SmithchartFont };
var SmithchartMargin = /** @class */ (function (_super) {
    __extends(SmithchartMargin, _super);
    function SmithchartMargin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(10)
    ], SmithchartMargin.prototype, "top", void 0);
    __decorate([
        Property(10)
    ], SmithchartMargin.prototype, "bottom", void 0);
    __decorate([
        Property(10)
    ], SmithchartMargin.prototype, "right", void 0);
    __decorate([
        Property(10)
    ], SmithchartMargin.prototype, "left", void 0);
    return SmithchartMargin;
}(ChildProperty));
export { SmithchartMargin };
var SmithchartBorder = /** @class */ (function (_super) {
    __extends(SmithchartBorder, _super);
    function SmithchartBorder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0)
    ], SmithchartBorder.prototype, "width", void 0);
    __decorate([
        Property(1)
    ], SmithchartBorder.prototype, "opacity", void 0);
    __decorate([
        Property('transparent')
    ], SmithchartBorder.prototype, "color", void 0);
    return SmithchartBorder;
}(ChildProperty));
export { SmithchartBorder };
/**
 * Internal use of type rect
 */
var SmithchartRect = /** @class */ (function () {
    function SmithchartRect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    return SmithchartRect;
}());
export { SmithchartRect };
var LabelCollection = /** @class */ (function () {
    function LabelCollection() {
    }
    return LabelCollection;
}());
export { LabelCollection };
var LegendSeries = /** @class */ (function () {
    function LegendSeries() {
    }
    return LegendSeries;
}());
export { LegendSeries };
var LabelRegion = /** @class */ (function () {
    function LabelRegion() {
    }
    return LabelRegion;
}());
export { LabelRegion };
var HorizontalLabelCollection = /** @class */ (function (_super) {
    __extends(HorizontalLabelCollection, _super);
    function HorizontalLabelCollection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return HorizontalLabelCollection;
}(LabelCollection));
export { HorizontalLabelCollection };
var RadialLabelCollections = /** @class */ (function (_super) {
    __extends(RadialLabelCollections, _super);
    function RadialLabelCollections() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RadialLabelCollections;
}(HorizontalLabelCollection));
export { RadialLabelCollections };
var LineSegment = /** @class */ (function () {
    function LineSegment() {
    }
    return LineSegment;
}());
export { LineSegment };
var PointRegion = /** @class */ (function () {
    function PointRegion() {
    }
    return PointRegion;
}());
export { PointRegion };
/**
 * Smithchart internal class for point
 */
var Point = /** @class */ (function () {
    function Point() {
    }
    return Point;
}());
export { Point };
var ClosestPoint = /** @class */ (function () {
    function ClosestPoint() {
    }
    return ClosestPoint;
}());
export { ClosestPoint };
var MarkerOptions = /** @class */ (function () {
    function MarkerOptions(id, fill, borderColor, borderWidth, opacity) {
        this.id = id;
        this.fill = fill;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.opacity = opacity;
    }
    return MarkerOptions;
}());
export { MarkerOptions };
var SmithchartLabelPosition = /** @class */ (function () {
    function SmithchartLabelPosition() {
    }
    return SmithchartLabelPosition;
}());
export { SmithchartLabelPosition };
var Direction = /** @class */ (function () {
    function Direction() {
        this.counterclockwise = 0;
        this.clockwise = 1;
    }
    return Direction;
}());
export { Direction };
var DataLabelTextOptions = /** @class */ (function () {
    function DataLabelTextOptions() {
    }
    return DataLabelTextOptions;
}());
export { DataLabelTextOptions };
var LabelOption = /** @class */ (function () {
    function LabelOption() {
    }
    return LabelOption;
}());
export { LabelOption };
/** @private */
var SmithchartSize = /** @class */ (function () {
    function SmithchartSize(width, height) {
        this.width = width;
        this.height = height;
    }
    return SmithchartSize;
}());
export { SmithchartSize };
var GridArcPoints = /** @class */ (function () {
    function GridArcPoints() {
    }
    return GridArcPoints;
}());
export { GridArcPoints };
