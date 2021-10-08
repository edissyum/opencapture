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
import { Property, Complex, ChildProperty } from '@syncfusion/ej2-base';
import { SmithchartFont } from '../utils/utils';
import { Theme } from '../model/theme';
/**
 * Configures the major Grid lines in the `axis`.
 */
var SmithchartMajorGridLines = /** @class */ (function (_super) {
    __extends(SmithchartMajorGridLines, _super);
    function SmithchartMajorGridLines() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(1)
    ], SmithchartMajorGridLines.prototype, "width", void 0);
    __decorate([
        Property('')
    ], SmithchartMajorGridLines.prototype, "dashArray", void 0);
    __decorate([
        Property(true)
    ], SmithchartMajorGridLines.prototype, "visible", void 0);
    __decorate([
        Property(null)
    ], SmithchartMajorGridLines.prototype, "color", void 0);
    __decorate([
        Property(1)
    ], SmithchartMajorGridLines.prototype, "opacity", void 0);
    return SmithchartMajorGridLines;
}(ChildProperty));
export { SmithchartMajorGridLines };
/**
 * Configures the major grid lines in the `axis`.
 */
var SmithchartMinorGridLines = /** @class */ (function (_super) {
    __extends(SmithchartMinorGridLines, _super);
    function SmithchartMinorGridLines() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(1)
    ], SmithchartMinorGridLines.prototype, "width", void 0);
    __decorate([
        Property('')
    ], SmithchartMinorGridLines.prototype, "dashArray", void 0);
    __decorate([
        Property(false)
    ], SmithchartMinorGridLines.prototype, "visible", void 0);
    __decorate([
        Property(null)
    ], SmithchartMinorGridLines.prototype, "color", void 0);
    __decorate([
        Property(8)
    ], SmithchartMinorGridLines.prototype, "count", void 0);
    return SmithchartMinorGridLines;
}(ChildProperty));
export { SmithchartMinorGridLines };
/**
 * Configures the axis lines in the `axis`.
 */
var SmithchartAxisLine = /** @class */ (function (_super) {
    __extends(SmithchartAxisLine, _super);
    function SmithchartAxisLine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(true)
    ], SmithchartAxisLine.prototype, "visible", void 0);
    __decorate([
        Property(1)
    ], SmithchartAxisLine.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], SmithchartAxisLine.prototype, "color", void 0);
    __decorate([
        Property('')
    ], SmithchartAxisLine.prototype, "dashArray", void 0);
    return SmithchartAxisLine;
}(ChildProperty));
export { SmithchartAxisLine };
var SmithchartAxis = /** @class */ (function (_super) {
    __extends(SmithchartAxis, _super);
    function SmithchartAxis() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(true)
    ], SmithchartAxis.prototype, "visible", void 0);
    __decorate([
        Property('Outside')
    ], SmithchartAxis.prototype, "labelPosition", void 0);
    __decorate([
        Property('Hide')
    ], SmithchartAxis.prototype, "labelIntersectAction", void 0);
    __decorate([
        Complex({}, SmithchartMajorGridLines)
    ], SmithchartAxis.prototype, "majorGridLines", void 0);
    __decorate([
        Complex({}, SmithchartMinorGridLines)
    ], SmithchartAxis.prototype, "minorGridLines", void 0);
    __decorate([
        Complex({}, SmithchartAxisLine)
    ], SmithchartAxis.prototype, "axisLine", void 0);
    __decorate([
        Complex(Theme.axisLabelFont, SmithchartFont)
    ], SmithchartAxis.prototype, "labelStyle", void 0);
    return SmithchartAxis;
}(ChildProperty));
export { SmithchartAxis };
