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
import { Property, Complex, ChildProperty, Collection } from '@syncfusion/ej2-base';
import { Font, Border } from '../model/base';
/** Sets and gets the options for customizing the axis line in linear gauge. */
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], Line.prototype, "dashArray", void 0);
    __decorate([
        Property(null)
    ], Line.prototype, "height", void 0);
    __decorate([
        Property(2)
    ], Line.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], Line.prototype, "color", void 0);
    __decorate([
        Property(0)
    ], Line.prototype, "offset", void 0);
    return Line;
}(ChildProperty));
export { Line };
/**
 * Sets and gets the options for customizing the appearance of the axis labels.
 */
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Complex({ size: '12px', color: null, fontStyle: null, fontWeight: null }, Font)
    ], Label.prototype, "font", void 0);
    __decorate([
        Property(false)
    ], Label.prototype, "useRangeColor", void 0);
    __decorate([
        Property('')
    ], Label.prototype, "format", void 0);
    __decorate([
        Property(0)
    ], Label.prototype, "offset", void 0);
    __decorate([
        Property('Auto')
    ], Label.prototype, "position", void 0);
    return Label;
}(ChildProperty));
export { Label };
/**
 * Sets and gets the options for customizing the ranges of an axis.
 */
var Range = /** @class */ (function (_super) {
    __extends(Range, _super);
    function Range() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0)
    ], Range.prototype, "start", void 0);
    __decorate([
        Property(0)
    ], Range.prototype, "end", void 0);
    __decorate([
        Property(null)
    ], Range.prototype, "linearGradient", void 0);
    __decorate([
        Property(null)
    ], Range.prototype, "radialGradient", void 0);
    __decorate([
        Property('Outside')
    ], Range.prototype, "position", void 0);
    __decorate([
        Property('')
    ], Range.prototype, "color", void 0);
    __decorate([
        Property(10)
    ], Range.prototype, "startWidth", void 0);
    __decorate([
        Property(10)
    ], Range.prototype, "endWidth", void 0);
    __decorate([
        Property(0)
    ], Range.prototype, "offset", void 0);
    __decorate([
        Complex({ color: '#000000', width: 0 }, Border)
    ], Range.prototype, "border", void 0);
    return Range;
}(ChildProperty));
export { Range };
/**
 * Sets and gets the options for customizing the minor tick lines in axis.
 */
var Tick = /** @class */ (function (_super) {
    __extends(Tick, _super);
    function Tick() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(20)
    ], Tick.prototype, "height", void 0);
    __decorate([
        Property(2)
    ], Tick.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], Tick.prototype, "interval", void 0);
    __decorate([
        Property(null)
    ], Tick.prototype, "color", void 0);
    __decorate([
        Property(null)
    ], Tick.prototype, "offset", void 0);
    __decorate([
        Property('Auto')
    ], Tick.prototype, "position", void 0);
    return Tick;
}(ChildProperty));
export { Tick };
/**
 * Sets and gets the options for customizing the pointers of an axis in linear gauge.
 */
var Pointer = /** @class */ (function (_super) {
    __extends(Pointer, _super);
    function Pointer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** @private */
        _this.animationComplete = true;
        /** @private */
        _this.currentValue = null;
        return _this;
    }
    __decorate([
        Property('Marker')
    ], Pointer.prototype, "type", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "linearGradient", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "radialGradient", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "value", void 0);
    __decorate([
        Property('InvertedTriangle')
    ], Pointer.prototype, "markerType", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "imageUrl", void 0);
    __decorate([
        Complex({ color: '#808080' }, Border)
    ], Pointer.prototype, "border", void 0);
    __decorate([
        Property(10)
    ], Pointer.prototype, "roundedCornerRadius", void 0);
    __decorate([
        Property('Far')
    ], Pointer.prototype, "placement", void 0);
    __decorate([
        Property(20)
    ], Pointer.prototype, "height", void 0);
    __decorate([
        Property(20)
    ], Pointer.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "color", void 0);
    __decorate([
        Property(1)
    ], Pointer.prototype, "opacity", void 0);
    __decorate([
        Property(0)
    ], Pointer.prototype, "animationDuration", void 0);
    __decorate([
        Property(false)
    ], Pointer.prototype, "enableDrag", void 0);
    __decorate([
        Property(0)
    ], Pointer.prototype, "offset", void 0);
    __decorate([
        Property('Auto')
    ], Pointer.prototype, "position", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "description", void 0);
    return Pointer;
}(ChildProperty));
export { Pointer };
/**
 * Sets and gets the options for customizing the axis of a gauge.
 */
var Axis = /** @class */ (function (_super) {
    __extends(Axis, _super);
    function Axis() {
        /**
         * Sets and gets the minimum value for the axis.
         *
         * @default 0
         */
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** @private */
        _this.visibleLabels = [];
        return _this;
    }
    __decorate([
        Property(0)
    ], Axis.prototype, "minimum", void 0);
    __decorate([
        Property(100)
    ], Axis.prototype, "maximum", void 0);
    __decorate([
        Property(false)
    ], Axis.prototype, "isInversed", void 0);
    __decorate([
        Property(false)
    ], Axis.prototype, "showLastLabel", void 0);
    __decorate([
        Property(false)
    ], Axis.prototype, "opposedPosition", void 0);
    __decorate([
        Complex({}, Line)
    ], Axis.prototype, "line", void 0);
    __decorate([
        Collection([{}], Range)
    ], Axis.prototype, "ranges", void 0);
    __decorate([
        Collection([{}], Pointer)
    ], Axis.prototype, "pointers", void 0);
    __decorate([
        Complex({ width: 2, height: 20 }, Tick)
    ], Axis.prototype, "majorTicks", void 0);
    __decorate([
        Complex({ width: 1, height: 10 }, Tick)
    ], Axis.prototype, "minorTicks", void 0);
    __decorate([
        Complex({}, Label)
    ], Axis.prototype, "labelStyle", void 0);
    return Axis;
}(ChildProperty));
export { Axis };
