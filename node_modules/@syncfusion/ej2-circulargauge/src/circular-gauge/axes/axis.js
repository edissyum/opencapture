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
/* eslint-disable @typescript-eslint/member-delimiter-style */
import { Property, Complex, ChildProperty, Collection } from '@syncfusion/ej2-base';
import { Font, Border } from '../model/base';
import { Theme } from '../model/theme';
/**
 * Sets and gets the axis line in circular gauge component.
 */
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(2)
    ], Line.prototype, "width", void 0);
    __decorate([
        Property('')
    ], Line.prototype, "dashArray", void 0);
    __decorate([
        Property(null)
    ], Line.prototype, "color", void 0);
    return Line;
}(ChildProperty));
export { Line };
/**
 * Sets and gets the axis label in circular gauge component.
 */
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Complex(Theme.axisLabelFont, Font)
    ], Label.prototype, "font", void 0);
    __decorate([
        Property('')
    ], Label.prototype, "format", void 0);
    __decorate([
        Property('Inside')
    ], Label.prototype, "position", void 0);
    __decorate([
        Property('None')
    ], Label.prototype, "hiddenLabel", void 0);
    __decorate([
        Property(false)
    ], Label.prototype, "autoAngle", void 0);
    __decorate([
        Property(false)
    ], Label.prototype, "useRangeColor", void 0);
    __decorate([
        Property(0)
    ], Label.prototype, "offset", void 0);
    __decorate([
        Property(true)
    ], Label.prototype, "shouldMaintainPadding", void 0);
    return Label;
}(ChildProperty));
export { Label };
/**
 * Sets and gets the option to customize the ranges of an axis in circular gauge component.
 */
var Range = /** @class */ (function (_super) {
    __extends(Range, _super);
    function Range() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** @private */
        _this.isLinearCircularGradient = false;
        return _this;
    }
    __decorate([
        Property(0)
    ], Range.prototype, "start", void 0);
    __decorate([
        Property(0)
    ], Range.prototype, "end", void 0);
    __decorate([
        Property(null)
    ], Range.prototype, "radius", void 0);
    __decorate([
        Property(10)
    ], Range.prototype, "startWidth", void 0);
    __decorate([
        Property(10)
    ], Range.prototype, "endWidth", void 0);
    __decorate([
        Property(null)
    ], Range.prototype, "color", void 0);
    __decorate([
        Property(0)
    ], Range.prototype, "roundedCornerRadius", void 0);
    __decorate([
        Property(1)
    ], Range.prototype, "opacity", void 0);
    __decorate([
        Property('')
    ], Range.prototype, "legendText", void 0);
    __decorate([
        Property('Auto')
    ], Range.prototype, "position", void 0);
    __decorate([
        Property(0)
    ], Range.prototype, "offset", void 0);
    __decorate([
        Property(null)
    ], Range.prototype, "linearGradient", void 0);
    __decorate([
        Property(null)
    ], Range.prototype, "radialGradient", void 0);
    return Range;
}(ChildProperty));
export { Range };
/**
 * Sets and gets the major and minor tick lines of an axis in circular gauge component.
 */
var Tick = /** @class */ (function (_super) {
    __extends(Tick, _super);
    function Tick() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(2)
    ], Tick.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], Tick.prototype, "height", void 0);
    __decorate([
        Property(null)
    ], Tick.prototype, "interval", void 0);
    __decorate([
        Property(0)
    ], Tick.prototype, "offset", void 0);
    __decorate([
        Property(null)
    ], Tick.prototype, "color", void 0);
    __decorate([
        Property('Inside')
    ], Tick.prototype, "position", void 0);
    __decorate([
        Property(false)
    ], Tick.prototype, "useRangeColor", void 0);
    __decorate([
        Property('0')
    ], Tick.prototype, "dashArray", void 0);
    return Tick;
}(ChildProperty));
export { Tick };
/**
 * Sets and gets the needle cap of pointer in circular gauge component.
 */
var Cap = /** @class */ (function (_super) {
    __extends(Cap, _super);
    function Cap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], Cap.prototype, "color", void 0);
    __decorate([
        Property(null)
    ], Cap.prototype, "linearGradient", void 0);
    __decorate([
        Property(null)
    ], Cap.prototype, "radialGradient", void 0);
    __decorate([
        Complex({ color: null, width: 8 }, Border)
    ], Cap.prototype, "border", void 0);
    __decorate([
        Property(8)
    ], Cap.prototype, "radius", void 0);
    return Cap;
}(ChildProperty));
export { Cap };
/**
 * Sets and gets the pointer needle in the circular gauge component.
 */
var NeedleTail = /** @class */ (function (_super) {
    __extends(NeedleTail, _super);
    function NeedleTail() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], NeedleTail.prototype, "color", void 0);
    __decorate([
        Complex({ color: null, width: 0 }, Border)
    ], NeedleTail.prototype, "border", void 0);
    __decorate([
        Property('0%')
    ], NeedleTail.prototype, "length", void 0);
    __decorate([
        Property(null)
    ], NeedleTail.prototype, "linearGradient", void 0);
    __decorate([
        Property(null)
    ], NeedleTail.prototype, "radialGradient", void 0);
    return NeedleTail;
}(ChildProperty));
export { NeedleTail };
/**
 * Sets and gets the animation of pointers in circular gauge component.
 */
var Animation = /** @class */ (function (_super) {
    __extends(Animation, _super);
    function Animation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(true)
    ], Animation.prototype, "enable", void 0);
    __decorate([
        Property(1000)
    ], Animation.prototype, "duration", void 0);
    return Animation;
}(ChildProperty));
export { Animation };
/**
 * Sets and gets the annotation element for an axis in circular gauge component.
 */
var Annotation = /** @class */ (function (_super) {
    __extends(Annotation, _super);
    function Annotation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], Annotation.prototype, "content", void 0);
    __decorate([
        Property(90)
    ], Annotation.prototype, "angle", void 0);
    __decorate([
        Property('50%')
    ], Annotation.prototype, "radius", void 0);
    __decorate([
        Property('-1')
    ], Annotation.prototype, "zIndex", void 0);
    __decorate([
        Property(false)
    ], Annotation.prototype, "autoAngle", void 0);
    __decorate([
        Complex({ size: '12px', color: '#686868' }, Font)
    ], Annotation.prototype, "textStyle", void 0);
    __decorate([
        Property(null)
    ], Annotation.prototype, "description", void 0);
    return Annotation;
}(ChildProperty));
export { Annotation };
/**
 * Sets and gets the pointers of an axis in circular gauge component.
 */
var Pointer = /** @class */ (function (_super) {
    __extends(Pointer, _super);
    function Pointer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], Pointer.prototype, "value", void 0);
    __decorate([
        Property('Needle')
    ], Pointer.prototype, "type", void 0);
    __decorate([
        Property('Auto')
    ], Pointer.prototype, "position", void 0);
    __decorate([
        Property(0)
    ], Pointer.prototype, "roundedCornerRadius", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "imageUrl", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "radius", void 0);
    __decorate([
        Property(20)
    ], Pointer.prototype, "pointerWidth", void 0);
    __decorate([
        Complex({}, Cap)
    ], Pointer.prototype, "cap", void 0);
    __decorate([
        Complex({}, Font)
    ], Pointer.prototype, "textStyle", void 0);
    __decorate([
        Complex({}, NeedleTail)
    ], Pointer.prototype, "needleTail", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "color", void 0);
    __decorate([
        Complex({ color: '#DDDDDD', width: 0 }, Border)
    ], Pointer.prototype, "border", void 0);
    __decorate([
        Complex(null, Animation)
    ], Pointer.prototype, "animation", void 0);
    __decorate([
        Property('Circle')
    ], Pointer.prototype, "markerShape", void 0);
    __decorate([
        Property(5)
    ], Pointer.prototype, "markerHeight", void 0);
    __decorate([
        Property('')
    ], Pointer.prototype, "text", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "description", void 0);
    __decorate([
        Property(5)
    ], Pointer.prototype, "markerWidth", void 0);
    __decorate([
        Property(0)
    ], Pointer.prototype, "offset", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "needleStartWidth", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "needleEndWidth", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "linearGradient", void 0);
    __decorate([
        Property(null)
    ], Pointer.prototype, "radialGradient", void 0);
    return Pointer;
}(ChildProperty));
export { Pointer };
/**
 * Sets and gets the options to customize the axis for the circular gauge component.
 */
var Axis = /** @class */ (function (_super) {
    __extends(Axis, _super);
    function Axis() {
        /**
         * Sets and gets the minimum value of an axis in the circular gauge component.
         *
         * @aspDefaultValueIgnore
         * @default null
         */
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** @private */
        _this.visibleLabels = [];
        return _this;
    }
    __decorate([
        Property(null)
    ], Axis.prototype, "minimum", void 0);
    __decorate([
        Property(null)
    ], Axis.prototype, "maximum", void 0);
    __decorate([
        Property(false)
    ], Axis.prototype, "showLastLabel", void 0);
    __decorate([
        Property(false)
    ], Axis.prototype, "hideIntersectingLabel", void 0);
    __decorate([
        Property(null)
    ], Axis.prototype, "roundingPlaces", void 0);
    __decorate([
        Property(null)
    ], Axis.prototype, "radius", void 0);
    __decorate([
        Complex({}, Line)
    ], Axis.prototype, "lineStyle", void 0);
    __decorate([
        Collection([{}], Range)
    ], Axis.prototype, "ranges", void 0);
    __decorate([
        Collection([{}], Pointer)
    ], Axis.prototype, "pointers", void 0);
    __decorate([
        Collection([{}], Annotation)
    ], Axis.prototype, "annotations", void 0);
    __decorate([
        Complex({ width: 2, height: 10 }, Tick)
    ], Axis.prototype, "majorTicks", void 0);
    __decorate([
        Complex({ width: 2, height: 5 }, Tick)
    ], Axis.prototype, "minorTicks", void 0);
    __decorate([
        Property(200)
    ], Axis.prototype, "startAngle", void 0);
    __decorate([
        Property(160)
    ], Axis.prototype, "endAngle", void 0);
    __decorate([
        Property('ClockWise')
    ], Axis.prototype, "direction", void 0);
    __decorate([
        Property(null)
    ], Axis.prototype, "background", void 0);
    __decorate([
        Property(null)
    ], Axis.prototype, "rangeGap", void 0);
    __decorate([
        Property(false)
    ], Axis.prototype, "startAndEndRangeGap", void 0);
    __decorate([
        Complex({}, Label)
    ], Axis.prototype, "labelStyle", void 0);
    return Axis;
}(ChildProperty));
export { Axis };
