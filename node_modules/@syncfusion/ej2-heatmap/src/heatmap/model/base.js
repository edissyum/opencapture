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
import { Property, ChildProperty, Complex, Collection } from '@syncfusion/ej2-base';
import { Theme } from './theme';
/**
 * Configures the fonts in heat map.
 */
var Font = /** @class */ (function (_super) {
    __extends(Font, _super);
    function Font() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('16px')
    ], Font.prototype, "size", void 0);
    __decorate([
        Property('')
    ], Font.prototype, "color", void 0);
    __decorate([
        Property('Segoe UI')
    ], Font.prototype, "fontFamily", void 0);
    __decorate([
        Property('Normal')
    ], Font.prototype, "fontWeight", void 0);
    __decorate([
        Property('Normal')
    ], Font.prototype, "fontStyle", void 0);
    __decorate([
        Property('Center')
    ], Font.prototype, "textAlignment", void 0);
    __decorate([
        Property('Trim')
    ], Font.prototype, "textOverflow", void 0);
    return Font;
}(ChildProperty));
export { Font };
/**
 * Configures the heat map margins.
 */
var Margin = /** @class */ (function (_super) {
    __extends(Margin, _super);
    function Margin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(10)
    ], Margin.prototype, "left", void 0);
    __decorate([
        Property(10)
    ], Margin.prototype, "right", void 0);
    __decorate([
        Property(10)
    ], Margin.prototype, "top", void 0);
    __decorate([
        Property(10)
    ], Margin.prototype, "bottom", void 0);
    return Margin;
}(ChildProperty));
export { Margin };
/**
 * Configures the borders in the heat map.
 */
var Border = /** @class */ (function (_super) {
    __extends(Border, _super);
    function Border() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], Border.prototype, "color", void 0);
    __decorate([
        Property(1)
    ], Border.prototype, "width", void 0);
    __decorate([
        Property('')
    ], Border.prototype, "radius", void 0);
    return Border;
}(ChildProperty));
export { Border };
/**
 * Configures the tooltip borders in the heat map.
 */
var TooltipBorder = /** @class */ (function (_super) {
    __extends(TooltipBorder, _super);
    function TooltipBorder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], TooltipBorder.prototype, "color", void 0);
    __decorate([
        Property(0)
    ], TooltipBorder.prototype, "width", void 0);
    return TooltipBorder;
}(ChildProperty));
export { TooltipBorder };
/**
 * Configures the mapping name for size and color in SizeAndColor type.
 */
var BubbleData = /** @class */ (function (_super) {
    __extends(BubbleData, _super);
    function BubbleData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], BubbleData.prototype, "size", void 0);
    __decorate([
        Property(null)
    ], BubbleData.prototype, "color", void 0);
    return BubbleData;
}(ChildProperty));
export { BubbleData };
/**
 * class used to maintain Title styles.
 */
var Title = /** @class */ (function (_super) {
    __extends(Title, _super);
    function Title() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], Title.prototype, "text", void 0);
    __decorate([
        Complex({}, Font)
    ], Title.prototype, "textStyle", void 0);
    return Title;
}(ChildProperty));
export { Title };
/**
 * class used to maintain the fill color value for cell color range
 */
var FillColor = /** @class */ (function (_super) {
    __extends(FillColor, _super);
    function FillColor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('#eeeeee')
    ], FillColor.prototype, "minColor", void 0);
    __decorate([
        Property('#eeeeee')
    ], FillColor.prototype, "maxColor", void 0);
    return FillColor;
}(ChildProperty));
export { FillColor };
/**
 * class used to maintain palette information.
 */
var PaletteCollection = /** @class */ (function (_super) {
    __extends(PaletteCollection, _super);
    function PaletteCollection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], PaletteCollection.prototype, "value", void 0);
    __decorate([
        Property(null)
    ], PaletteCollection.prototype, "color", void 0);
    __decorate([
        Property(null)
    ], PaletteCollection.prototype, "label", void 0);
    __decorate([
        Property(null)
    ], PaletteCollection.prototype, "startValue", void 0);
    __decorate([
        Property(null)
    ], PaletteCollection.prototype, "endValue", void 0);
    __decorate([
        Property(null)
    ], PaletteCollection.prototype, "minColor", void 0);
    __decorate([
        Property(null)
    ], PaletteCollection.prototype, "maxColor", void 0);
    return PaletteCollection;
}(ChildProperty));
export { PaletteCollection };
/**
 * label border properties.
 */
var AxisLabelBorder = /** @class */ (function (_super) {
    __extends(AxisLabelBorder, _super);
    function AxisLabelBorder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('#b5b5b5')
    ], AxisLabelBorder.prototype, "color", void 0);
    __decorate([
        Property(1)
    ], AxisLabelBorder.prototype, "width", void 0);
    __decorate([
        Property('Rectangle')
    ], AxisLabelBorder.prototype, "type", void 0);
    return AxisLabelBorder;
}(ChildProperty));
export { AxisLabelBorder };
var BubbleSize = /** @class */ (function (_super) {
    __extends(BubbleSize, _super);
    function BubbleSize() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('0%')
    ], BubbleSize.prototype, "minimum", void 0);
    __decorate([
        Property('100%')
    ], BubbleSize.prototype, "maximum", void 0);
    return BubbleSize;
}(ChildProperty));
export { BubbleSize };
/**
 * categories for multi level labels
 */
var MultiLevelCategories = /** @class */ (function (_super) {
    __extends(MultiLevelCategories, _super);
    function MultiLevelCategories() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], MultiLevelCategories.prototype, "start", void 0);
    __decorate([
        Property(null)
    ], MultiLevelCategories.prototype, "end", void 0);
    __decorate([
        Property('')
    ], MultiLevelCategories.prototype, "text", void 0);
    __decorate([
        Property(null)
    ], MultiLevelCategories.prototype, "maximumTextWidth", void 0);
    return MultiLevelCategories;
}(ChildProperty));
export { MultiLevelCategories };
/**
 * MultiLevelLabels properties
 */
var MultiLevelLabels = /** @class */ (function (_super) {
    __extends(MultiLevelLabels, _super);
    function MultiLevelLabels() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('Center')
    ], MultiLevelLabels.prototype, "alignment", void 0);
    __decorate([
        Property('Wrap')
    ], MultiLevelLabels.prototype, "overflow", void 0);
    __decorate([
        Complex(Theme.axisLabelFont, Font)
    ], MultiLevelLabels.prototype, "textStyle", void 0);
    __decorate([
        Complex({ color: '#b5b5b5', width: 1, type: 'Rectangle' }, AxisLabelBorder)
    ], MultiLevelLabels.prototype, "border", void 0);
    __decorate([
        Collection([], MultiLevelCategories)
    ], MultiLevelLabels.prototype, "categories", void 0);
    return MultiLevelLabels;
}(ChildProperty));
export { MultiLevelLabels };
/**
 * Internal class used to maintain colorcollection.
 */
var ColorCollection = /** @class */ (function () {
    function ColorCollection(value, color, label, startValue, endValue, minColor, maxColor) {
        this.value = value;
        this.color = color;
        this.label = label;
        this.startValue = startValue;
        this.endValue = endValue;
        this.minColor = minColor;
        this.maxColor = maxColor;
    }
    return ColorCollection;
}());
export { ColorCollection };
/**
 * class used to maintain color and value collection.
 */
var BubbleTooltipData = /** @class */ (function () {
    function BubbleTooltipData(mappingName, bubbleData, valueType) {
        this.mappingName = mappingName;
        this.bubbleData = bubbleData;
        this.valueType = valueType;
    }
    return BubbleTooltipData;
}());
export { BubbleTooltipData };
/**
 * Internal class used to maintain legend colorcollection.
 */
var LegendColorCollection = /** @class */ (function () {
    function LegendColorCollection(value, color, label, startValue, endValue, minColor, maxColor, isHidden) {
        this.value = value;
        this.color = color;
        this.label = label;
        this.startValue = startValue;
        this.endValue = endValue;
        this.minColor = minColor;
        this.maxColor = maxColor;
        this.isHidden = isHidden;
    }
    return LegendColorCollection;
}());
export { LegendColorCollection };
/**
 * class used to maintain xAxis labels details for multipleRow label intersect action.
 */
var MultipleRow = /** @class */ (function () {
    function MultipleRow(start, end, index, label, row) {
        this.index = 1;
        this.row = 1;
        this.start = start;
        this.end = end;
        this.index = index;
        this.label = label;
        this.row = row;
    }
    return MultipleRow;
}());
export { MultipleRow };
