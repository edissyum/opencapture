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
/* eslint-disable valid-jsdoc */
import { SvgRenderer } from '@syncfusion/ej2-svg-base';
import { Property, ChildProperty, Complex, Collection } from '@syncfusion/ej2-base';
/**
 * Specified the color information for the gradient in the linear gauge.
 */
var ColorStop = /** @class */ (function (_super) {
    __extends(ColorStop, _super);
    function ColorStop() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('#000000')
    ], ColorStop.prototype, "color", void 0);
    __decorate([
        Property(1)
    ], ColorStop.prototype, "opacity", void 0);
    __decorate([
        Property('0%')
    ], ColorStop.prototype, "offset", void 0);
    __decorate([
        Property('')
    ], ColorStop.prototype, "style", void 0);
    return ColorStop;
}(ChildProperty));
export { ColorStop };
/**
 * Specifies the position in percentage from which the radial gradient must be applied.
 */
var GradientPosition = /** @class */ (function (_super) {
    __extends(GradientPosition, _super);
    function GradientPosition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('0%')
    ], GradientPosition.prototype, "x", void 0);
    __decorate([
        Property('0%')
    ], GradientPosition.prototype, "y", void 0);
    return GradientPosition;
}(ChildProperty));
export { GradientPosition };
/**
 * This specifies the properties of the linear gradient colors for the linear gauge.
 */
var LinearGradient = /** @class */ (function (_super) {
    __extends(LinearGradient, _super);
    function LinearGradient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('0%')
    ], LinearGradient.prototype, "startValue", void 0);
    __decorate([
        Property('100%')
    ], LinearGradient.prototype, "endValue", void 0);
    __decorate([
        Collection([{ color: '#000000', opacity: 1, offset: '0%', style: '' }], ColorStop)
    ], LinearGradient.prototype, "colorStop", void 0);
    return LinearGradient;
}(ChildProperty));
export { LinearGradient };
/**
 * This specifies the properties of the radial gradient colors for the linear gauge.
 */
var RadialGradient = /** @class */ (function (_super) {
    __extends(RadialGradient, _super);
    function RadialGradient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('0%')
    ], RadialGradient.prototype, "radius", void 0);
    __decorate([
        Complex({ x: '0%', y: '0%' }, GradientPosition)
    ], RadialGradient.prototype, "outerPosition", void 0);
    __decorate([
        Complex({ x: '0%', y: '0%' }, GradientPosition)
    ], RadialGradient.prototype, "innerPosition", void 0);
    __decorate([
        Collection([{ color: '#000000', opacity: 1, offset: '0%', style: '' }], ColorStop)
    ], RadialGradient.prototype, "colorStop", void 0);
    return RadialGradient;
}(ChildProperty));
export { RadialGradient };
/**
 * To get the gradient support for pointers and ranges in the linear gauge.
 *
 * @hidden
 */
var Gradient = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    function Gradient(control) {
        this.gauge = control;
    }
    /**
     * To get the linear gradient string.
     *
     * @private
     */
    Gradient.prototype.getLinearGradientColor = function (element) {
        var render = new SvgRenderer('');
        var colorStop = element.linearGradient.colorStop;
        var colors = this.getGradientColor(colorStop);
        var name = '_' + this.gauge.svgObject.id + '_' + this.gauge.gradientCount + '_' + 'linearGradient';
        var gradientPosition = {
            id: name,
            x1: (element.linearGradient.startValue.indexOf('%') === -1 ?
                element.linearGradient.startValue :
                parseFloat(element.linearGradient.startValue).toString()) + '%',
            x2: (element.linearGradient.endValue.indexOf('%') === -1 ?
                element.linearGradient.endValue :
                parseFloat(element.linearGradient.endValue).toString()) + '%',
            y1: '0' + '%',
            y2: '0' + '%'
        };
        var def = render.drawGradient('linearGradient', gradientPosition, colors);
        this.gauge.svgObject.appendChild(def);
        return 'url(#' + name + ')';
    };
    /**
     * To get the radial gradient string.
     *
     * @private
     */
    Gradient.prototype.getRadialGradientColor = function (element) {
        var render = new SvgRenderer('');
        var colorStop = element.radialGradient.colorStop;
        var colors = this.getGradientColor(colorStop);
        var name = '_' + this.gauge.svgObject.id + '_' + this.gauge.gradientCount + '_' + 'radialGradient';
        var gradientPosition = {
            id: name,
            r: (element.radialGradient.radius.indexOf('%') === -1 ?
                element.radialGradient.radius :
                parseFloat(element.radialGradient.radius).toString()) + '%',
            cx: (element.radialGradient.outerPosition.x.indexOf('%') === -1 ?
                element.radialGradient.outerPosition.x :
                parseFloat(element.radialGradient.outerPosition.x).toString()) + '%',
            cy: (element.radialGradient.outerPosition.y.indexOf('%') === -1 ?
                element.radialGradient.outerPosition.y :
                parseFloat(element.radialGradient.outerPosition.y).toString()) + '%',
            fx: (element.radialGradient.innerPosition.x.indexOf('%') === -1 ?
                element.radialGradient.innerPosition.y :
                parseFloat(element.radialGradient.innerPosition.x).toString()) + '%',
            fy: (element.radialGradient.innerPosition.y.indexOf('%') === -1 ?
                element.radialGradient.innerPosition.y :
                parseFloat(element.radialGradient.innerPosition.y).toString()) + '%'
        };
        var def = render.drawGradient('radialGradient', gradientPosition, colors);
        this.gauge.svgObject.appendChild(def);
        return 'url(#' + name + ')';
    };
    /**
     * To get the color, offset, opacity and style.
     *
     * @private
     */
    Gradient.prototype.getGradientColor = function (colorStop) {
        var colors = [];
        var length = colorStop.length;
        for (var j = 0; j < length; j++) {
            var color = {
                color: colorStop[j].color,
                colorStop: colorStop[j].offset,
                opacity: (colorStop[j].opacity) ? (colorStop[j].opacity).toString() : '1',
                style: colorStop[j].style
            };
            colors.push(color);
        }
        return colors;
    };
    /**
     * To get the gradient color string.
     *
     * @private
     */
    Gradient.prototype.getGradientColorString = function (element) {
        var gradientColor;
        if ((element.linearGradient || element.radialGradient)) {
            if (element.linearGradient) {
                gradientColor = this.getLinearGradientColor(element);
            }
            else {
                gradientColor = this.getRadialGradientColor(element);
            }
            this.gauge.gradientCount += 1;
        }
        else {
            return null;
        }
        return gradientColor;
    };
    /**
     * Get module name.
     */
    Gradient.prototype.getModuleName = function () {
        return 'Gradient';
    };
    /**
     * To destroy the gradient.
     *
     * @return {void}
     * @private
     */
    Gradient.prototype.destroy = function (control) {
        /**
         * Destroy method performed here
         */
    };
    return Gradient;
}());
export { Gradient };
