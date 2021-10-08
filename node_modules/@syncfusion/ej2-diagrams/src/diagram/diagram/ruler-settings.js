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
import { Property, ChildProperty, Complex } from '@syncfusion/ej2-base';
/**
 * Defines the properties of both horizontal and vertical guides/rulers to measure the diagram area.
 */
var DiagramRuler = /** @class */ (function (_super) {
    __extends(DiagramRuler, _super);
    function DiagramRuler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(5)
    ], DiagramRuler.prototype, "interval", void 0);
    __decorate([
        Property(100)
    ], DiagramRuler.prototype, "segmentWidth", void 0);
    __decorate([
        Property('Horizontal')
    ], DiagramRuler.prototype, "orientation", void 0);
    __decorate([
        Property('RightOrBottom')
    ], DiagramRuler.prototype, "tickAlignment", void 0);
    __decorate([
        Property('red')
    ], DiagramRuler.prototype, "markerColor", void 0);
    __decorate([
        Property(25)
    ], DiagramRuler.prototype, "thickness", void 0);
    __decorate([
        Property(null)
    ], DiagramRuler.prototype, "arrangeTick", void 0);
    return DiagramRuler;
}(ChildProperty));
export { DiagramRuler };
/**
 * Defines the ruler settings of diagram
 * ```html
 * <div id='diagram'></div>
 * ```
 * ```typescript
 * let diagram: Diagram = new Diagram({
 * ...
 * rulerSettings: { showRulers: true,
 * horizontalRuler: { segmentWidth: 50,interval: 10 },
 * verticalRuler: {segmentWidth: 200,interval: 20}
 * },
 * ...
 * });
 * diagram.appendTo('#diagram');
 * ```
 * @default {}
 */
var RulerSettings = /** @class */ (function (_super) {
    __extends(RulerSettings, _super);
    function RulerSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], RulerSettings.prototype, "showRulers", void 0);
    __decorate([
        Property(true)
    ], RulerSettings.prototype, "dynamicGrid", void 0);
    __decorate([
        Complex({ orientation: 'Horizontal' }, DiagramRuler)
    ], RulerSettings.prototype, "horizontalRuler", void 0);
    __decorate([
        Complex({ orientation: 'Vertical' }, DiagramRuler)
    ], RulerSettings.prototype, "verticalRuler", void 0);
    return RulerSettings;
}(ChildProperty));
export { RulerSettings };
