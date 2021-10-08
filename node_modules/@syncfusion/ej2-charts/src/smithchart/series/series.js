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
/* eslint-disable @typescript-eslint/ban-types */
import { Property, Complex, ChildProperty } from '@syncfusion/ej2-base';
import { SmithchartFont } from '../utils/utils';
import { Theme } from '../model/theme';
var SeriesTooltipBorder = /** @class */ (function (_super) {
    __extends(SeriesTooltipBorder, _super);
    function SeriesTooltipBorder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(1)
    ], SeriesTooltipBorder.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], SeriesTooltipBorder.prototype, "color", void 0);
    return SeriesTooltipBorder;
}(ChildProperty));
export { SeriesTooltipBorder };
var SeriesTooltip = /** @class */ (function (_super) {
    __extends(SeriesTooltip, _super);
    function SeriesTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], SeriesTooltip.prototype, "visible", void 0);
    __decorate([
        Property(null)
    ], SeriesTooltip.prototype, "fill", void 0);
    __decorate([
        Property(0.95)
    ], SeriesTooltip.prototype, "opacity", void 0);
    __decorate([
        Property('')
    ], SeriesTooltip.prototype, "template", void 0);
    __decorate([
        Complex({}, SeriesTooltipBorder)
    ], SeriesTooltip.prototype, "border", void 0);
    return SeriesTooltip;
}(ChildProperty));
export { SeriesTooltip };
var SeriesMarkerBorder = /** @class */ (function (_super) {
    __extends(SeriesMarkerBorder, _super);
    function SeriesMarkerBorder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(3)
    ], SeriesMarkerBorder.prototype, "width", void 0);
    __decorate([
        Property('white')
    ], SeriesMarkerBorder.prototype, "color", void 0);
    return SeriesMarkerBorder;
}(ChildProperty));
export { SeriesMarkerBorder };
var SeriesMarkerDataLabelBorder = /** @class */ (function (_super) {
    __extends(SeriesMarkerDataLabelBorder, _super);
    function SeriesMarkerDataLabelBorder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0.1)
    ], SeriesMarkerDataLabelBorder.prototype, "width", void 0);
    __decorate([
        Property('white')
    ], SeriesMarkerDataLabelBorder.prototype, "color", void 0);
    return SeriesMarkerDataLabelBorder;
}(ChildProperty));
export { SeriesMarkerDataLabelBorder };
var SeriesMarkerDataLabelConnectorLine = /** @class */ (function (_super) {
    __extends(SeriesMarkerDataLabelConnectorLine, _super);
    function SeriesMarkerDataLabelConnectorLine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(1)
    ], SeriesMarkerDataLabelConnectorLine.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], SeriesMarkerDataLabelConnectorLine.prototype, "color", void 0);
    return SeriesMarkerDataLabelConnectorLine;
}(ChildProperty));
export { SeriesMarkerDataLabelConnectorLine };
var SeriesMarkerDataLabel = /** @class */ (function (_super) {
    __extends(SeriesMarkerDataLabel, _super);
    function SeriesMarkerDataLabel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], SeriesMarkerDataLabel.prototype, "visible", void 0);
    __decorate([
        Property('')
    ], SeriesMarkerDataLabel.prototype, "template", void 0);
    __decorate([
        Property(null)
    ], SeriesMarkerDataLabel.prototype, "fill", void 0);
    __decorate([
        Property(1)
    ], SeriesMarkerDataLabel.prototype, "opacity", void 0);
    __decorate([
        Complex({}, SeriesMarkerDataLabelBorder)
    ], SeriesMarkerDataLabel.prototype, "border", void 0);
    __decorate([
        Complex({}, SeriesMarkerDataLabelConnectorLine)
    ], SeriesMarkerDataLabel.prototype, "connectorLine", void 0);
    __decorate([
        Complex(Theme.dataLabelFont, SmithchartFont)
    ], SeriesMarkerDataLabel.prototype, "textStyle", void 0);
    return SeriesMarkerDataLabel;
}(ChildProperty));
export { SeriesMarkerDataLabel };
var SeriesMarker = /** @class */ (function (_super) {
    __extends(SeriesMarker, _super);
    function SeriesMarker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], SeriesMarker.prototype, "visible", void 0);
    __decorate([
        Property('circle')
    ], SeriesMarker.prototype, "shape", void 0);
    __decorate([
        Property(6)
    ], SeriesMarker.prototype, "width", void 0);
    __decorate([
        Property(6)
    ], SeriesMarker.prototype, "height", void 0);
    __decorate([
        Property('')
    ], SeriesMarker.prototype, "imageUrl", void 0);
    __decorate([
        Property('')
    ], SeriesMarker.prototype, "fill", void 0);
    __decorate([
        Property(1)
    ], SeriesMarker.prototype, "opacity", void 0);
    __decorate([
        Complex({}, SeriesMarkerBorder)
    ], SeriesMarker.prototype, "border", void 0);
    __decorate([
        Complex({}, SeriesMarkerDataLabel)
    ], SeriesMarker.prototype, "dataLabel", void 0);
    return SeriesMarker;
}(ChildProperty));
export { SeriesMarker };
var SmithchartSeries = /** @class */ (function (_super) {
    __extends(SmithchartSeries, _super);
    function SmithchartSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('visible')
    ], SmithchartSeries.prototype, "visibility", void 0);
    __decorate([
        Property([])
    ], SmithchartSeries.prototype, "points", void 0);
    __decorate([
        Property('')
    ], SmithchartSeries.prototype, "resistance", void 0);
    __decorate([
        Property('')
    ], SmithchartSeries.prototype, "reactance", void 0);
    __decorate([
        Property('')
    ], SmithchartSeries.prototype, "tooltipMappingName", void 0);
    __decorate([
        Property(null)
    ], SmithchartSeries.prototype, "dataSource", void 0);
    __decorate([
        Property('')
    ], SmithchartSeries.prototype, "name", void 0);
    __decorate([
        Property(null)
    ], SmithchartSeries.prototype, "fill", void 0);
    __decorate([
        Property(false)
    ], SmithchartSeries.prototype, "enableAnimation", void 0);
    __decorate([
        Property('2000ms')
    ], SmithchartSeries.prototype, "animationDuration", void 0);
    __decorate([
        Property(false)
    ], SmithchartSeries.prototype, "enableSmartLabels", void 0);
    __decorate([
        Property(1)
    ], SmithchartSeries.prototype, "width", void 0);
    __decorate([
        Property(1)
    ], SmithchartSeries.prototype, "opacity", void 0);
    __decorate([
        Complex({}, SeriesMarker)
    ], SmithchartSeries.prototype, "marker", void 0);
    __decorate([
        Complex({}, SeriesTooltip)
    ], SmithchartSeries.prototype, "tooltip", void 0);
    return SmithchartSeries;
}(ChildProperty));
export { SmithchartSeries };
