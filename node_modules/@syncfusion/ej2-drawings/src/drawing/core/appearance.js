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
import { Property, ChildProperty, Collection, ComplexFactory } from '@syncfusion/ej2-base';
/**   @private  */
var getGradientType = function (obj) {
    switch (obj.type) {
        case 'Linear':
            return LinearGradient;
        case 'Radial':
            return RadialGradient;
        default:
            return LinearGradient;
    }
};
/**
 * Layout Model module defines the styles and types to arrange objects in containers
 */
var Thickness = /** @class */ (function () {
    function Thickness(left, right, top, bottom) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }
    return Thickness;
}());
export { Thickness };
/**
 * Defines the space to be left between an object and its immediate parent
 */
var Margin = /** @class */ (function (_super) {
    __extends(Margin, _super);
    function Margin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0)
    ], Margin.prototype, "left", void 0);
    __decorate([
        Property(0)
    ], Margin.prototype, "right", void 0);
    __decorate([
        Property(0)
    ], Margin.prototype, "top", void 0);
    __decorate([
        Property(0)
    ], Margin.prototype, "bottom", void 0);
    return Margin;
}(ChildProperty));
export { Margin };
/**
 * Defines the different colors and the region of color transitions
 * ```html
 * <div id='diagram'></div>
 * ```
 * ```typescript
 * let stopscol: StopModel[] = [];
 * let stops1: StopModel = { color: 'white', offset: 0, opacity: 0.7 };
 * stopscol.push(stops1);
 * let stops2: StopModel = { color: 'red', offset: 0, opacity: 0.3 };
 * stopscol.push(stops2);
 * let gradient: RadialGradientModel = { cx: 50, cy: 50, fx: 50, fy: 50, stops: stopscol, type: 'Radial' };
 * let nodes: NodeModel[] = [{ id: 'node1', width: 100, height: 100,
 * style: { gradient: gradient }
 * }];
 * let diagram: Diagram = new Diagram({
 * ...
 *   nodes: nodes,
 * ...
 * });
 * diagram.appendTo('#diagram');
 * ```
 */
var Stop = /** @class */ (function (_super) {
    __extends(Stop, _super);
    function Stop() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @private
     * Returns the name of class Stop
     */
    Stop.prototype.getClassName = function () {
        return 'Stop';
    };
    __decorate([
        Property('')
    ], Stop.prototype, "color", void 0);
    __decorate([
        Property(0)
    ], Stop.prototype, "offset", void 0);
    __decorate([
        Property(1)
    ], Stop.prototype, "opacity", void 0);
    return Stop;
}(ChildProperty));
export { Stop };
/**
 * Paints the node with a smooth transition from one color to another color
 */
var Gradient = /** @class */ (function (_super) {
    __extends(Gradient, _super);
    function Gradient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Collection([], Stop)
    ], Gradient.prototype, "stops", void 0);
    __decorate([
        Property('None')
    ], Gradient.prototype, "type", void 0);
    __decorate([
        Property('')
    ], Gradient.prototype, "id", void 0);
    return Gradient;
}(ChildProperty));
export { Gradient };
/**
 * Defines the linear gradient of styles
 * ```html
 * <div id='diagram'></div>
 * ```
 * ```typescript
 * let stopscol: StopModel[] = [];
 * let stops1: StopModel = { color: 'white', offset: 0, opacity: 0.7 };
 * stopscol.push(stops1);
 * let stops2: StopModel = { color: 'red', offset: 0, opacity: 0.3 };
 * stopscol.push(stops2);
 * let gradient: LinearGradientModel = { x1: 0, x2: 50, y1: 0, y2: 50, stops: stopscol, type: 'Linear' };
 * let nodes: NodeModel[] = [{ id: 'node1', width: 100, height: 100,
 * style: { gradient: gradient }
 * }];
 * let diagram: Diagram = new Diagram({
 * ...
 *   nodes: nodes,
 * ...
 * });
 * diagram.appendTo('#diagram');
 * ```
 */
/**
 * Paints the node with linear color transitions
 */
var LinearGradient = /** @class */ (function (_super) {
    __extends(LinearGradient, _super);
    function LinearGradient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0)
    ], LinearGradient.prototype, "x1", void 0);
    __decorate([
        Property(0)
    ], LinearGradient.prototype, "x2", void 0);
    __decorate([
        Property(0)
    ], LinearGradient.prototype, "y1", void 0);
    __decorate([
        Property(0)
    ], LinearGradient.prototype, "y2", void 0);
    return LinearGradient;
}(Gradient));
export { LinearGradient };
/**
 * A focal point defines the beginning of the gradient, and a circle defines the end point of the gradient
 * ```html
 * <div id='diagram'></div>
 * ```
 * ```typescript
 * let stopscol: StopModel[] = [];
 * let stops1: StopModel = { color: 'white', offset: 0, opacity: 0.7 };
 * stopscol.push(stops1);
 * let stops2: StopModel = { color: 'red', offset: 0, opacity: 0.3 };
 * stopscol.push(stops2);
 * let gradient: RadialGradientModel = { cx: 50, cy: 50, fx: 50, fy: 50, stops: stopscol, type: 'Radial' };
 * let nodes: NodeModel[] = [{ id: 'node1', width: 100, height: 100,
 * style: { gradient: gradient }
 * }];
 * let diagram: Diagram = new Diagram({
 * ...
 *   nodes: nodes,
 * ...
 * });
 * diagram.appendTo('#diagram');
 * ```
 */
var RadialGradient = /** @class */ (function (_super) {
    __extends(RadialGradient, _super);
    function RadialGradient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0)
    ], RadialGradient.prototype, "cx", void 0);
    __decorate([
        Property(0)
    ], RadialGradient.prototype, "cy", void 0);
    __decorate([
        Property(0)
    ], RadialGradient.prototype, "fx", void 0);
    __decorate([
        Property(0)
    ], RadialGradient.prototype, "fy", void 0);
    __decorate([
        Property(50)
    ], RadialGradient.prototype, "r", void 0);
    return RadialGradient;
}(Gradient));
export { RadialGradient };
/**
 * Defines the style of shape/path
 */
var ShapeStyle = /** @class */ (function (_super) {
    __extends(ShapeStyle, _super);
    function ShapeStyle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('white')
    ], ShapeStyle.prototype, "fill", void 0);
    __decorate([
        Property('black')
    ], ShapeStyle.prototype, "strokeColor", void 0);
    __decorate([
        Property('')
    ], ShapeStyle.prototype, "strokeDashArray", void 0);
    __decorate([
        Property(1)
    ], ShapeStyle.prototype, "strokeWidth", void 0);
    __decorate([
        Property(1)
    ], ShapeStyle.prototype, "opacity", void 0);
    __decorate([
        ComplexFactory(getGradientType)
    ], ShapeStyle.prototype, "gradient", void 0);
    return ShapeStyle;
}(ChildProperty));
export { ShapeStyle };
/**
 * Defines the stroke style of a path
 */
var StrokeStyle = /** @class */ (function (_super) {
    __extends(StrokeStyle, _super);
    function StrokeStyle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('transparent')
    ], StrokeStyle.prototype, "fill", void 0);
    return StrokeStyle;
}(ShapeStyle));
export { StrokeStyle };
/**
 * Defines the appearance of text
 * ```html
 * <div id='diagram'></div>
 * ```
 * ```typescript
 * let style: TextStyleModel = { strokeColor: 'black', opacity: 0.5, strokeWidth: 1 };
 * let node: NodeModel;
 * node = {
 * ...
 * id: 'node', width: 100, height: 100, offsetX: 100, offsetY: 100,
 * annotations : [{
 * content: 'text', style: style }];
 * ...
 * };
 * let diagram: Diagram = new Diagram({
 * ...
 *   nodes: [node],
 * ...
 * });
 * diagram.appendTo('#diagram');
 * ```
 */
var TextStyle = /** @class */ (function (_super) {
    __extends(TextStyle, _super);
    function TextStyle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('black')
    ], TextStyle.prototype, "color", void 0);
    __decorate([
        Property('Arial')
    ], TextStyle.prototype, "fontFamily", void 0);
    __decorate([
        Property(12)
    ], TextStyle.prototype, "fontSize", void 0);
    __decorate([
        Property(false)
    ], TextStyle.prototype, "italic", void 0);
    __decorate([
        Property(false)
    ], TextStyle.prototype, "bold", void 0);
    __decorate([
        Property('CollapseSpace')
    ], TextStyle.prototype, "whiteSpace", void 0);
    __decorate([
        Property('WrapWithOverflow')
    ], TextStyle.prototype, "textWrapping", void 0);
    __decorate([
        Property('Center')
    ], TextStyle.prototype, "textAlign", void 0);
    __decorate([
        Property('None')
    ], TextStyle.prototype, "textDecoration", void 0);
    __decorate([
        Property('Wrap')
    ], TextStyle.prototype, "textOverflow", void 0);
    __decorate([
        Property('transparent')
    ], TextStyle.prototype, "fill", void 0);
    return TextStyle;
}(ShapeStyle));
export { TextStyle };
