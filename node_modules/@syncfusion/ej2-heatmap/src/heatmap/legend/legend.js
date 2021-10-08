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
import { Property, ChildProperty, Complex, Browser, createElement, isNullOrUndefined } from '@syncfusion/ej2-base';
import { DrawSvgCanvas, TextOption, TextBasic, PathOption, Line, LineOption, GradientPointer, textTrim } from '../utils/helper';
import { Size, measureText, getTitle, getElement, CanvasTooltip, formatValue, LegendRange, ToggleVisibility, sum } from '../utils/helper';
import { Font, Title } from '../model/base';
import { Rect, RectOption, Gradient, GradientColor, showTooltip, stringToNumber, CurrentLegendRect, removeElement } from '../utils/helper';
import { Theme } from '../model/theme';
import { Tooltip as tool } from '@syncfusion/ej2-svg-base';
/**
 * Configures the Legend
 */
var LegendSettings = /** @class */ (function (_super) {
    __extends(LegendSettings, _super);
    function LegendSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], LegendSettings.prototype, "height", void 0);
    __decorate([
        Property('')
    ], LegendSettings.prototype, "width", void 0);
    __decorate([
        Complex({ text: '', textStyle: Theme.titleFont }, Title)
    ], LegendSettings.prototype, "title", void 0);
    __decorate([
        Property('Right')
    ], LegendSettings.prototype, "position", void 0);
    __decorate([
        Property(true)
    ], LegendSettings.prototype, "visible", void 0);
    __decorate([
        Property('Center')
    ], LegendSettings.prototype, "alignment", void 0);
    __decorate([
        Property(true)
    ], LegendSettings.prototype, "showLabel", void 0);
    __decorate([
        Property(true)
    ], LegendSettings.prototype, "showGradientPointer", void 0);
    __decorate([
        Property(false)
    ], LegendSettings.prototype, "enableSmartLegend", void 0);
    __decorate([
        Property('All')
    ], LegendSettings.prototype, "labelDisplayType", void 0);
    __decorate([
        Complex(Theme.legendLabelFont, Font)
    ], LegendSettings.prototype, "textStyle", void 0);
    __decorate([
        Property('')
    ], LegendSettings.prototype, "labelFormat", void 0);
    __decorate([
        Property(true)
    ], LegendSettings.prototype, "toggleVisibility", void 0);
    return LegendSettings;
}(ChildProperty));
export { LegendSettings };
/**
 *
 * The `Legend` module is used to render legend for the heatmap.
 */
var Legend = /** @class */ (function () {
    function Legend(heatMap) {
        this.maxLegendLabelSize = new Size(0, 0);
        this.gradientScaleSize = 10;
        this.segmentCollections = [];
        this.segmentCollectionsLabels = [];
        this.textWrapCollections = [];
        this.labelCollections = [];
        this.labelCollection = [];
        this.legendSize = 10;
        this.previousOptions = new GradientPointer(0, 0, 0, 0, 0, 0);
        this.listPerPage = 0;
        this.numberOfPages = 1;
        this.listWidth = 0;
        this.fillRect = new Rect(0, 0, 0, 0);
        this.legendRect = new Rect(0, 0, 0, 0);
        this.currentPage = 1;
        this.lastList = [];
        this.navigationCollections = [];
        this.pagingRect = new Rect(0, 0, 0, 0);
        this.listInterval = 10; // padding between two lists
        this.legendLabelTooltip = [];
        this.legendTitleTooltip = [];
        this.labelXCollections = [];
        this.labelYCollections = [];
        this.legendXCollections = [];
        this.legendYCollections = [];
        /** @private */
        this.legendRectPositionCollection = [];
        /** @private */
        this.legendRange = [];
        /** @private */
        this.legendTextRange = [];
        /** @private */
        this.visibilityCollections = [];
        this.heatMap = heatMap;
        this.drawSvgCanvas = new DrawSvgCanvas(heatMap);
    }
    /**
     * Get module name
     */
    Legend.prototype.getModuleName = function () {
        return 'Legend';
    };
    /**
     * To destroy the Legend.
     *
     * @returns {void}
     * @private
     */
    Legend.prototype.destroy = function () {
        /**
         * destory code
         */
    };
    /**
     * @private
     */
    Legend.prototype.renderLegendItems = function () {
        var heatMap = this.heatMap;
        heatMap.toggleValue = [];
        var tempBorder = { color: 'transparent', width: 0 };
        this.legend = heatMap.renderer.createGroup({ id: heatMap.element.id + '_Heatmap_Legend' });
        var rectItems = new RectOption(heatMap.element.id + '_LegendBound', 'none', tempBorder, 1, this.legendGroup);
        this.drawSvgCanvas.drawRectangle(rectItems, this.legend);
        var legendBound = this.legendRectScale;
        var ctx = heatMap.canvasRenderer.ctx;
        var rectItemsSvg = new Rect(legendBound.x, legendBound.y, legendBound.width, legendBound.height);
        var fill;
        if (heatMap.paletteSettings.type === 'Fixed') {
            var colorCollection = (!heatMap.legendSettings.enableSmartLegend) ?
                heatMap.colorCollection : heatMap.legendColorCollection;
            this.legendRange = (heatMap.resizing || (!heatMap.legendOnLoad && heatMap.rendering)) ? [] : this.legendRange;
            this.legendTextRange = (heatMap.resizing || (!heatMap.legendOnLoad && heatMap.rendering)) ? [] : this.legendTextRange;
            if (heatMap.enableCanvasRendering) {
                ctx.save();
                ctx.clip();
            }
            for (var i = 0; i < colorCollection.length; i++) {
                var visibility = !isNullOrUndefined(this.visibilityCollections[i]) ? this.visibilityCollections[i] : true;
                heatMap.toggleValue.push(new ToggleVisibility(visibility, colorCollection[i].value, colorCollection[i].startValue, colorCollection[i].endValue));
            }
        }
        if (heatMap.paletteSettings.type === 'Gradient' || (heatMap.paletteSettings.type === 'Fixed' &&
            heatMap.legendSettings.enableSmartLegend === true)) {
            if (heatMap.paletteSettings.type === 'Gradient') {
                if (heatMap.enableCanvasRendering) {
                    var grd = void 0;
                    var ctx_1 = heatMap.canvasRenderer.ctx;
                    if (heatMap.horizontalGradient) {
                        grd = ctx_1.createLinearGradient(legendBound.x, 0, legendBound.x + legendBound.width, 0);
                    }
                    else {
                        grd = ctx_1.createLinearGradient(0, legendBound.y, 0, legendBound.y + legendBound.height);
                    }
                    if (heatMap.legendSettings.title.text) {
                        ctx_1.clip();
                    }
                    for (var i = 0; i < heatMap.legendColorCollection.length; i++) {
                        var value = (((this.heatMap.isColorRange ? heatMap.legendColorCollection[i].startValue :
                            heatMap.legendColorCollection[i].value) - this.legendMinValue) /
                            (this.legendMaxValue - this.legendMinValue));
                        value = isNaN(value) ? 0 : value;
                        if (this.heatMap.isColorRange && this.heatMap.paletteSettings.type === 'Gradient') {
                            this.calculateCanvasColorRange(i, grd);
                        }
                        else {
                            grd.addColorStop(value, heatMap.legendColorCollection[i].color);
                        }
                    }
                    ctx_1.fillStyle = grd;
                    fill = grd.toString();
                }
                else {
                    var gradientOptions = void 0;
                    var gradientColor = void 0;
                    var cgradientColors = [];
                    for (var i = 0; i < heatMap.legendColorCollection.length; i++) {
                        if (this.heatMap.isColorRange && this.heatMap.paletteSettings.type === 'Gradient') {
                            this.calculateColorRange(i, cgradientColors);
                        }
                        else {
                            var gradientPercentage = ((heatMap.legendColorCollection[i].value - this.legendMinValue) /
                                (this.legendMaxValue - this.legendMinValue)) * 100;
                            gradientPercentage = isNaN(gradientPercentage) ? 0 : gradientPercentage;
                            gradientColor = new GradientColor(heatMap.legendColorCollection[i].color, gradientPercentage + '%');
                            cgradientColors.push(gradientColor);
                        }
                        if (this.legendMaxValue === this.legendMinValue) {
                            break;
                        }
                    }
                    if (heatMap.horizontalGradient) {
                        gradientOptions = new Gradient(heatMap.element.id + '_lineargradient', '0%', '100%', '0%', '0%');
                    }
                    else {
                        gradientOptions = new Gradient(heatMap.element.id + '_lineargradient', '0%', '0%', '0%', '100%');
                    }
                    var linearGradient = heatMap.renderer.drawGradient('linearGradient', gradientOptions, cgradientColors);
                    this.legend.appendChild(linearGradient);
                    fill = 'url(#' + heatMap.element.id + '_lineargradient)';
                }
                var rectItem = new RectOption(heatMap.element.id + '_Gradient_Legend', fill, tempBorder, 1, rectItemsSvg);
                this.drawSvgCanvas.drawRectangle(rectItem, this.legend);
                this.renderElements(rectItemsSvg);
            }
            else {
                this.renderSmartLegend();
                this.renderTitle(rectItemsSvg);
            }
            if (!heatMap.enableCanvasRendering) {
                heatMap.svgObject.appendChild(this.legend);
            }
            if (heatMap.enableCanvasRendering) {
                ctx.restore();
            }
            this.renderLegendLabel(rectItemsSvg);
        }
        else {
            this.legendScale = heatMap.renderer.createGroup({ id: heatMap.element.id + 'Heatmap_GradientScale' });
            var listRect = new RectOption(heatMap.element.id + '_Gradient_Scale', 'none', tempBorder, 1, this.legendRectScale);
            this.drawSvgCanvas.drawRectangle(listRect, this.legendScale);
            this.renderTitle(rectItemsSvg);
            if (!heatMap.enableCanvasRendering) {
                this.legend.appendChild(this.legendScale);
            }
            this.translategroup = heatMap.renderer.createGroup({ id: heatMap.element.id + '_translate' });
            this.calculateListPerPage(rectItemsSvg);
            if (this.numberOfPages > 1) {
                this.paginggroup = heatMap.renderer.createGroup({ id: heatMap.element.id + '_navigation' });
            }
            this.renderListLegendMode(rectItemsSvg, true);
            if (heatMap.enableCanvasRendering) {
                ctx.restore();
            }
        }
    };
    Legend.prototype.renderElements = function (rectItemsSvg) {
        this.renderTitle(rectItemsSvg);
        this.renderColorAxisGrid(rectItemsSvg);
    };
    Legend.prototype.calculateCanvasColorRange = function (i, grd) {
        var heatMap = this.heatMap;
        var value = ((((heatMap.legendColorCollection[i].startValue < heatMap.dataSourceMinValue &&
            heatMap.legendColorCollection[i].endValue > heatMap.dataSourceMinValue) ?
            heatMap.dataSourceMinValue : heatMap.legendColorCollection[i].startValue) - this.legendMinValue) /
            (this.legendMaxValue - this.legendMinValue));
        value = isNaN(value) ? 0 : value;
        var value1 = ((heatMap.legendColorCollection[i].endValue >= this.heatMap.dataSourceMaxValue ?
            this.heatMap.dataSourceMaxValue : heatMap.legendColorCollection[i].endValue) - this.legendMinValue) /
            (this.legendMaxValue - this.legendMinValue);
        if (this.heatMap.legendColorCollection[0].startValue !== this.heatMap.dataSourceMinValue && i === 0 &&
            this.heatMap.legendColorCollection[0].startValue > this.heatMap.dataSourceMinValue) {
            value = (this.heatMap.legendColorCollection[0].startValue - this.legendMinValue) /
                (this.legendMaxValue - this.legendMinValue);
            grd.addColorStop(value / 2, this.heatMap.paletteSettings.fillColor.minColor);
            grd.addColorStop(value, this.heatMap.paletteSettings.fillColor.maxColor);
        }
        grd.addColorStop(value, heatMap.legendColorCollection[i].minColor);
        grd.addColorStop(value1, heatMap.legendColorCollection[i].maxColor);
        if (this.heatMap.legendColorCollection[i].endValue !== ((i === this.heatMap.legendColorCollection.length - 1) ?
            this.heatMap.dataSourceMaxValue : this.heatMap.legendColorCollection[i + 1].startValue) &&
            this.heatMap.legendColorCollection[i].endValue < this.heatMap.dataSourceMaxValue) {
            value = (heatMap.legendColorCollection[i].endValue - this.legendMinValue) /
                (this.legendMaxValue - this.legendMinValue);
            grd.addColorStop(value, this.heatMap.paletteSettings.fillColor.minColor);
            value = ((i === this.heatMap.legendColorCollection.length - 1 ? this.heatMap.dataSourceMaxValue :
                heatMap.legendColorCollection[i + 1].startValue) - this.legendMinValue) /
                (this.legendMaxValue - this.legendMinValue);
            grd.addColorStop(value, this.heatMap.paletteSettings.fillColor.maxColor);
        }
    };
    Legend.prototype.calculateColorRange = function (i, cgradientColors) {
        if (cgradientColors === void 0) { cgradientColors = []; }
        var heatMap = this.heatMap;
        heatMap.toggleValue = [];
        var gradientPercentage;
        var gradientColor;
        var gradientColor2;
        var gradientColor3;
        if (this.heatMap.legendColorCollection[0].startValue > this.heatMap.dataSourceMinValue && i === 0) {
            gradientPercentage = (this.heatMap.dataSourceMinValue - this.legendMinValue) /
                (this.legendMaxValue - this.legendMinValue) * 100;
            gradientPercentage = isNaN(gradientPercentage) ? 0 : gradientPercentage;
            gradientColor = new GradientColor(heatMap.paletteSettings.fillColor.minColor, gradientPercentage + '%');
            cgradientColors.push(gradientColor);
            gradientPercentage = (heatMap.legendColorCollection[0].startValue - this.legendMinValue) /
                (this.legendMaxValue - this.legendMinValue) * 100;
            gradientColor = new GradientColor(heatMap.paletteSettings.fillColor.maxColor, gradientPercentage + '%');
            cgradientColors.push(gradientColor);
        }
        gradientPercentage = ((heatMap.legendColorCollection[i].startValue - this.legendMinValue) /
            (this.legendMaxValue - this.legendMinValue)) * 100;
        gradientPercentage = isNaN(gradientPercentage) ? 0 : gradientPercentage;
        gradientColor = new GradientColor(heatMap.legendColorCollection[i].minColor, gradientPercentage + '%');
        cgradientColors.push(gradientColor);
        gradientPercentage = (heatMap.legendColorCollection[i].endValue - this.legendMinValue) /
            (this.legendMaxValue - this.legendMinValue) * 100;
        var gradientColor1 = new GradientColor(heatMap.legendColorCollection[i].maxColor, gradientPercentage + '%');
        cgradientColors.push(gradientColor1);
        if (this.heatMap.legendColorCollection[i].endValue !== ((i === this.heatMap.legendColorCollection.length - 1) ?
            this.heatMap.dataSourceMaxValue : this.heatMap.legendColorCollection[i + 1].startValue)) {
            gradientPercentage = (heatMap.legendColorCollection[i].endValue - this.legendMinValue) /
                (this.legendMaxValue - this.legendMinValue) * 100;
            gradientColor2 = new GradientColor(this.heatMap.paletteSettings.fillColor.minColor, (gradientPercentage) + '%');
            cgradientColors.push(gradientColor2);
            gradientPercentage = ((i === (this.heatMap.legendColorCollection.length - 1) ?
                this.heatMap.dataSourceMaxValue : heatMap.legendColorCollection[i + 1].startValue) - this.legendMinValue) /
                (this.legendMaxValue - this.legendMinValue) * 100;
            gradientColor3 = new GradientColor(this.heatMap.paletteSettings.fillColor.maxColor, (gradientPercentage) + '%');
            cgradientColors.push(gradientColor3);
        }
    };
    Legend.prototype.renderTitle = function (rect) {
        var heatMap = this.heatMap;
        if (heatMap.legendSettings.title.text) {
            var title = heatMap.legendSettings.title;
            var titleSize = measureText(title.text, title.textStyle);
            var padding = !heatMap.legendSettings.showLabel ? heatMap.horizontalGradient ? 10 : 6 : this.labelPadding;
            var y = void 0;
            var anchor = 'start';
            var maxWidth = void 0;
            var dominantBaseline = void 0;
            var text = title.text;
            var options = void 0;
            var yValue = void 0;
            if (heatMap.legendSettings.title.textStyle.textOverflow === 'Trim') {
                maxWidth = this.width - 10;
                text = textTrim(maxWidth, text, title.textStyle);
            }
            if (!heatMap.horizontalGradient) {
                padding = -(padding + titleSize.height / 4);
                if (text.length !== 0 && heatMap.enableCanvasRendering) {
                    this.legendTitleTooltip.push(new CanvasTooltip(title.text, new Rect(rect.x, rect.y - titleSize.height, maxWidth, titleSize.height)));
                }
                options = new TextOption(heatMap.element.id + '_legendTitle', new TextBasic(rect.x, rect.y + padding, anchor, text, 0, 'translate(0,0)', dominantBaseline), title.textStyle, title.textStyle.color || heatMap.themeStyle.heatMapTitle);
            }
            else {
                y = rect.y + (heatMap.legendSettings.position === 'Top' ? 0 :
                    -(10 + titleSize.height + padding));
                padding = heatMap.legendSettings.position === 'Top' ? -(padding + titleSize.height / 4) :
                    (padding + (3 * titleSize.height / 4));
                yValue = heatMap.legendSettings.position === 'Bottom' ? y : y - titleSize.height;
                if (text.length !== 0 && heatMap.enableCanvasRendering) {
                    this.legendTitleTooltip.push(new CanvasTooltip(title.text, new Rect(rect.x, yValue, maxWidth, titleSize.height)));
                }
                titleSize.width = rect.width < titleSize.width ? rect.width : titleSize.width;
                options = new TextOption(heatMap.element.id + '_legendTitle', new TextBasic(rect.x + (rect.width / 2) - (titleSize.width / 2), y + padding, anchor, text, 0, 'translate(0,0)', dominantBaseline), title.textStyle, title.textStyle.color || heatMap.themeStyle.heatMapTitle);
            }
            this.drawSvgCanvas.createText(options, this.legend, text);
        }
    };
    Legend.prototype.renderSmartLegend = function () {
        var heatMap = this.heatMap;
        var colorCollection = heatMap.colorCollection;
        var smartLegendRect;
        var tempBorder = {
            color: 'transparent',
            width: 0
        };
        var legendBound = this.legendRectScale;
        var legendX;
        var legendY;
        var legendWidth;
        var legendHeight;
        var width = legendBound.width / colorCollection.length;
        var height = legendBound.height / colorCollection.length;
        this.legendRectPositionCollection = [];
        this.legendRange = [];
        for (var i = 0; i < heatMap.legendColorCollection.length; i++) {
            var rectPosition = new CurrentLegendRect(0, 0, 0, 0, '', '');
            if (heatMap.horizontalGradient) {
                legendX = legendBound.x + (i * width);
                legendY = legendBound.y;
                legendWidth = width;
                legendHeight = legendBound.height;
                this.segmentCollections.push((heatMap.legendSettings.labelDisplayType === 'Edge' &&
                    i === heatMap.legendColorCollection.length - 1 && !heatMap.legendColorCollection[i].isHidden) ?
                    legendX + width : legendX);
            }
            else {
                legendX = legendBound.x;
                legendY = legendBound.y + (i * height);
                legendWidth = legendBound.width;
                legendHeight = height;
                this.segmentCollections.push((heatMap.legendSettings.labelDisplayType === 'Edge' &&
                    i === heatMap.legendColorCollection.length - 1 && !heatMap.legendColorCollection[i].isHidden) ?
                    legendY + height : legendY);
            }
            smartLegendRect = new Rect(legendX, legendY, legendWidth, legendHeight);
            var legendRange = new LegendRange(0, 0, 0, 0, 0, true, 0);
            legendRange.x = legendX;
            legendRange.y = legendY;
            legendRange.width = legendWidth;
            legendRange.height = legendHeight;
            legendRange.value = this.heatMap.isColorRange ?
                heatMap.legendColorCollection[i].endValue : heatMap.legendColorCollection[i].value;
            legendRange.currentPage = this.currentPage;
            if (colorCollection.length !== heatMap.legendColorCollection.length && i === heatMap.legendColorCollection.length - 1) {
                if (heatMap.horizontalGradient) {
                    legendRange.width = 0;
                }
                else {
                    legendRange.height = 0;
                }
                this.visibilityCollections[i] = this.visibilityCollections[i - 1];
            }
            legendRange.visible = !isNullOrUndefined(this.visibilityCollections[i]) ? this.visibilityCollections[i] : true;
            this.legendRange.push(legendRange);
            if (!heatMap.legendColorCollection[i].isHidden) {
                var color = heatMap.legendOnLoad ? this.heatMap.isColorRange ? colorCollection[i].minColor :
                    colorCollection[i].color : this.legendRange[i].visible ? this.heatMap.isColorRange ? colorCollection[i].minColor :
                    colorCollection[i].color : '#D3D3D3';
                var rectItem = new RectOption(heatMap.element.id + '_Smart_Legend' + i, color, tempBorder, 1, smartLegendRect);
                this.drawSvgCanvas.drawRectangle(rectItem, this.legend);
                rectPosition.x = legendX;
                rectPosition.y = legendY;
                rectPosition.width = legendWidth;
                rectPosition.height = legendHeight;
                rectPosition.label = this.labelCollections[i];
                rectPosition.id = heatMap.element.id + '_Smart_Legend' + i;
                this.legendRectPositionCollection.push(rectPosition);
                var text = getTitle(this.labelCollections[i], heatMap.legendSettings.textStyle, this.textWrapCollections[i]);
                if (text.length !== 0 && heatMap.enableCanvasRendering) {
                    var elementSize = measureText(this.labelCollections[i], heatMap.legendSettings.textStyle);
                    this.legendLabelTooltip.push(new CanvasTooltip(this.labelCollections[i], new Rect(rectPosition.x, rectPosition.y, elementSize.width, elementSize.height)));
                }
            }
        }
    };
    Legend.prototype.colorRangeLegendPosition = function (i, labelX) {
        if (this.segmentCollections.length !== this.segmentCollectionsLabels.length) {
            for (var k = 0; k < this.segmentCollections.length; k++) {
                if (this.segmentCollectionsLabels[i] === this.segmentCollections[k]) {
                    labelX = this.segmentCollectionsLabels[i] + (((k === this.segmentCollections.length - 1 ?
                        (this.heatMap.horizontalGradient ? this.width : this.height) :
                        this.segmentCollections[k + 1]) - this.segmentCollections[k]) / 2);
                    break;
                }
            }
        }
        else {
            labelX = this.segmentCollectionsLabels[i] + (((i === this.segmentCollectionsLabels.length - 1 ?
                (this.heatMap.horizontalGradient ? this.width : this.height) :
                this.segmentCollectionsLabels[i + 1]) - this.segmentCollectionsLabels[i]) / 2);
        }
        this.labelPosition = labelX;
    };
    Legend.prototype.renderLegendLabel = function (rect) {
        var heatMap = this.heatMap;
        this.legendTextRange = [];
        if (heatMap.legendSettings.showLabel && (heatMap.paletteSettings.type === 'Gradient' ||
            (heatMap.paletteSettings.type === 'Fixed' && heatMap.legendSettings.labelDisplayType !== 'None'))) {
            var anchor = 'start';
            var dominantBaseline = void 0;
            var legendLabel = void 0;
            var textWrapWidth = 0;
            var text = void 0;
            this.legendLabelTooltip = [];
            var elementSize = void 0;
            var isColorRange = heatMap.isColorRange;
            var colorCollection = heatMap.legendColorCollection;
            if (heatMap.enableCanvasRendering) {
                var ctx = heatMap.canvasRenderer.ctx;
                ctx.rect(this.legendGroup.x, this.legendGroup.y, this.legendGroup.width, this.legendGroup.height);
                ctx.save();
                ctx.clip();
                ctx.restore();
            }
            else {
                legendLabel = heatMap.renderer.createGroup({ id: heatMap.element.id + '_Heatmap_LegendLabel' });
            }
            var labelX = void 0;
            var labelY = void 0;
            for (var i = 0; i < colorCollection.length; i++) {
                var value = ((colorCollection[i].value - (Math.round(this.legendMinValue * 100) / 100)) /
                    ((Math.round(this.legendMaxValue * 100) / 100) - (Math.round(this.legendMinValue * 100) / 100))) * 100;
                if (heatMap.horizontalGradient) {
                    if (this.heatMap.isColorRange && heatMap.paletteSettings.type === 'Gradient') {
                        this.colorRangeLegendPosition(i, labelX);
                        labelX = this.labelPosition;
                    }
                    else if (this.heatMap.legendSettings.enableSmartLegend && this.heatMap.isColorRange &&
                        heatMap.paletteSettings.type === 'Fixed') {
                        labelX = this.segmentCollections[i] + ((rect.width / colorCollection.length) / 2);
                    }
                    else {
                        labelX = this.segmentCollections[i];
                    }
                    labelY = rect.y + rect.height + this.labelPadding;
                    anchor = (((Math.round(value * 100) / 100) === 0 && !isColorRange) || (heatMap.paletteSettings.type === 'Fixed' &&
                        i === 0)) ? 'start' : (((Math.round(value * 100) / 100) === 100 && heatMap.paletteSettings.type === 'Gradient' &&
                        !isColorRange) || (Math.round(heatMap.dataSourceMaxValue * 100) / 100) === colorCollection[i].value &&
                        heatMap.legendSettings.enableSmartLegend) || (heatMap.legendSettings.enableSmartLegend &&
                        heatMap.paletteSettings.type === 'Fixed' && heatMap.legendSettings.labelDisplayType === 'Edge') ? 'end' : 'middle';
                    dominantBaseline = 'hanging';
                }
                else {
                    labelX = rect.x + rect.width + this.labelPadding;
                    if (this.heatMap.isColorRange && heatMap.paletteSettings.type === 'Gradient') {
                        this.colorRangeLegendPosition(i, labelY);
                        labelY = this.labelPosition;
                    }
                    else if (this.heatMap.legendSettings.enableSmartLegend && this.heatMap.isColorRange &&
                        heatMap.paletteSettings.type === 'Fixed') {
                        labelY = this.segmentCollections[i] + ((rect.height / colorCollection.length) / 2);
                    }
                    else {
                        labelY = this.segmentCollections[i];
                    }
                    dominantBaseline = (((Math.round(value * 100) / 100) === 0 && !isColorRange) || (i === 0 &&
                        heatMap.paletteSettings.type === 'Fixed')) ? 'hanging' : (((Math.round(value * 100) / 100) === 100 &&
                        !isColorRange && heatMap.paletteSettings.type === 'Gradient') ||
                        (Math.round(heatMap.dataSourceMaxValue * 100) / 100) === colorCollection[i].value &&
                            heatMap.legendSettings.enableSmartLegend) || (heatMap.legendSettings.enableSmartLegend &&
                        heatMap.legendSettings.labelDisplayType === 'Edge' &&
                        heatMap.paletteSettings.type === 'Fixed') ? 'auto' : 'middle';
                }
                textWrapWidth = heatMap.horizontalGradient ? this.textWrapCollections[i] : this.width - (this.legendRectScale.width +
                    this.labelPadding + this.legendRectPadding);
                text = getTitle(this.labelCollections[i], heatMap.legendSettings.textStyle, textWrapWidth);
                elementSize = measureText(text[0], heatMap.legendSettings.textStyle);
                if (heatMap.paletteSettings.type === 'Fixed') {
                    var rectY = dominantBaseline === 'hanging' ? labelY : dominantBaseline === 'middle' ?
                        labelY - elementSize.height / 2 : labelY - elementSize.height;
                    var rectX = anchor === 'end' ? labelX - elementSize.width : anchor === 'middle' ?
                        labelX - elementSize.width / 2 : labelX;
                    var textPosition = new LegendRange(rectX, rectY, elementSize.width, elementSize.height, colorCollection[i].value, true, this.currentPage);
                    textPosition.visible = !isNullOrUndefined(this.visibilityCollections[i]) ? this.visibilityCollections[i] : true;
                    this.legendTextRange.push(textPosition);
                }
                if (this.labelCollections[i] !== '') {
                    if (text.length !== 0 && text[0].indexOf('...') !== -1 && heatMap.enableCanvasRendering) {
                        this.legendLabelTooltip.push(new CanvasTooltip(this.labelCollections[i], new Rect(labelX, labelY, elementSize.width, elementSize.height)));
                    }
                    var textBasic = new TextBasic(labelX, labelY, anchor, text, 0, 'translate(0,0)', dominantBaseline);
                    var options = new TextOption(heatMap.element.id + '_Legend_Label' + i, textBasic, heatMap.legendSettings.textStyle, heatMap.legendSettings.textStyle.color || heatMap.themeStyle.legendLabel);
                    options.fill = heatMap.legendOnLoad ? options.fill :
                        (heatMap.paletteSettings.type === 'Fixed' && !this.legendRange[i].visible) ? '#D3D3D3' : options.fill;
                    if (text.length > 1) {
                        this.drawSvgCanvas.createWrapText(options, heatMap.legendSettings.textStyle, legendLabel);
                    }
                    else {
                        this.drawSvgCanvas.createText(options, legendLabel, text[0]);
                    }
                    if (Browser.isIE && !heatMap.enableCanvasRendering) {
                        if (dominantBaseline === 'middle') {
                            legendLabel.lastChild.setAttribute('dy', '0.6ex');
                        }
                        else if (dominantBaseline === 'hanging') {
                            legendLabel.lastChild.setAttribute('dy', '1.5ex');
                        }
                    }
                }
                if (this.legendMaxValue === this.legendMinValue && heatMap.paletteSettings.type === 'Gradient') {
                    break;
                }
            }
            if (!heatMap.enableCanvasRendering) {
                this.legendGroup.height = this.legendGroup.height > 0 ? this.legendGroup.height : 0;
                this.legendGroup.width = this.legendGroup.width > 0 ? this.legendGroup.width : 0;
                this.legend.appendChild(legendLabel);
                var clippath = heatMap.renderer.createClipPath({ id: heatMap.element.id + '_clipPath' });
                var clipRect = heatMap.renderer.drawRectangle(this.legendGroup);
                clippath.appendChild(clipRect);
                heatMap.svgObject.appendChild(clippath);
                this.legend.setAttribute('style', 'clip-path:url(#' + clippath.id + ')');
            }
        }
    };
    /**
     * @private
     */
    Legend.prototype.renderGradientPointer = function (e, pageX, pageY) {
        var heatMap = this.heatMap;
        var currentRect = heatMap.heatMapSeries.getCurrentRect(pageX, pageY);
        var cellValue = heatMap.bubbleSizeWithColor ? currentRect.value[0].bubbleData.toString() !== '' ?
            !this.heatMap.isColorValueExist ? currentRect.value[0].bubbleData.toString() :
                currentRect.value[1].bubbleData.toString() : '' : currentRect.value.toString();
        var rect = this.legendRectScale;
        var legendPart;
        var direction;
        var options;
        var legendPath;
        var pathX1;
        var pathY1;
        var pathX2;
        var pathY2;
        var pathX3;
        var pathY3;
        if (cellValue.toString() !== '') {
            if (!heatMap.horizontalGradient) {
                legendPart = rect.height / 100;
                legendPath = legendPart * ((Number(cellValue) - this.legendMinValue) /
                    (this.legendMaxValue - this.legendMinValue)) * 100;
                legendPath = isNaN(legendPath) ? 0 : legendPath;
                pathX1 = rect.x - 1;
                pathY1 = rect.y + legendPath;
                pathX2 = pathX3 = rect.x - 8;
                pathY2 = rect.y - 5 + legendPath;
                pathY3 = rect.y + 5 + legendPath;
            }
            else {
                legendPart = rect.width / 100;
                legendPath = legendPart * ((Number(cellValue) - this.legendMinValue) /
                    (this.legendMaxValue - this.legendMinValue)) * 100;
                legendPath = isNaN(legendPath) ? 0 : legendPath;
                pathX1 = rect.x + legendPath;
                pathY1 = rect.y + rect.height;
                pathX2 = rect.x - 5 + legendPath;
                pathY2 = pathY3 = rect.y + rect.height + 8;
                pathX3 = rect.x + 5 + legendPath;
            }
            direction = 'M' + ' ' + pathX1 + ' ' + pathY1 + ' ' +
                'L' + ' ' + pathX2 + ' ' + pathY2 + ' ' + 'L' + ' ' + pathX3 + ' ' + pathY3 + ' ' + 'Z';
            options = new PathOption(heatMap.element.id + '_Gradient_Pointer', 'gray', 0.01, '#A0A0A0', 1, '0,0', direction);
            if (!heatMap.enableCanvasRendering) {
                this.gradientPointer = heatMap.renderer.drawPath(options);
                this.gradientPointer.style.visibility = 'visible';
                this.legend.appendChild(this.gradientPointer);
            }
            else {
                this.removeGradientPointer();
                var canvasTranslate = void 0;
                heatMap.canvasRenderer.drawPath(options, canvasTranslate);
                this.previousOptions.pathX1 = pathX1;
                this.previousOptions.pathY1 = pathY1;
                this.previousOptions.pathX2 = pathX2;
                this.previousOptions.pathY2 = pathY2;
                this.previousOptions.pathX3 = pathX3;
                this.previousOptions.pathY3 = pathY3;
            }
        }
        else {
            this.removeGradientPointer();
        }
    };
    /**
     * @private
     */
    Legend.prototype.removeGradientPointer = function () {
        var heatMap = this.heatMap;
        if (this.gradientPointer && !heatMap.enableCanvasRendering) {
            this.gradientPointer.style.visibility = 'hidden';
        }
        else if (heatMap.enableCanvasRendering) {
            if (Object.keys(this.previousOptions).length !== 0) {
                if (heatMap.horizontalGradient) {
                    this.fillRect.x = this.previousOptions.pathX2 - 1;
                    this.fillRect.y = this.previousOptions.pathY1;
                    this.fillRect.width = this.previousOptions.pathX3 - this.previousOptions.pathX2 + 2;
                    this.fillRect.height = this.previousOptions.pathY2 + 1 - this.previousOptions.pathY1;
                }
                else {
                    this.fillRect.x = this.previousOptions.pathX2 - 1;
                    this.fillRect.y = this.previousOptions.pathY2 - 1;
                    this.fillRect.width = this.previousOptions.pathX1 - this.previousOptions.pathX2 + 1;
                    this.fillRect.height = this.previousOptions.pathY3 - this.previousOptions.pathY2 + 2;
                }
            }
            heatMap.canvasRenderer.ctx.fillStyle = heatMap.themeStyle.background;
            heatMap.canvasRenderer.ctx.fillRect(this.fillRect.x, this.fillRect.y, this.fillRect.width, this.fillRect.height);
        }
    };
    /**
     * @private
     */
    Legend.prototype.calculateLegendBounds = function (rect) {
        var heatMap = this.heatMap;
        var legendSettings = heatMap.legendSettings;
        this.labelCollection = [];
        this.labelCollections = [];
        var colorCollection = heatMap.legendColorCollection;
        if (legendSettings.position !== 'Bottom' && legendSettings.position !== 'Top' &&
            legendSettings.position !== 'Right' && legendSettings.position !== 'Left') {
            legendSettings.position = 'Right';
        }
        var title = heatMap.legendSettings.title;
        var titleSize = measureText(title.text, title.textStyle);
        heatMap.horizontalGradient = legendSettings.position === 'Bottom' || legendSettings.position === 'Top';
        this.legendRectPadding = heatMap.horizontalGradient ? heatMap.legendSettings.title.text ?
            titleSize.height + 16 : 16 : 10; // padding between rect and legend
        this.labelPadding = legendSettings.showLabel ? this.heatMap.horizontalGradient ? 10 : 6 : 0; // padding between list and label
        this.legendHeight = legendSettings.height;
        this.legendWidth = legendSettings.width;
        var format = heatMap.legendSettings.labelFormat;
        var isCustom = format.match('{value}') !== null;
        this.format = heatMap.intl.getNumberFormat({ format: isCustom ? '' : format });
        if (heatMap.paletteSettings.type === 'Fixed') {
            for (var i = 0; i < colorCollection.length; i++) {
                var label = colorCollection[i].label ? colorCollection[i].label : this.heatMap.isColorRange ?
                    colorCollection[i].startValue.toString() + '-' + colorCollection[i].endValue.toString() : formatValue(isCustom, format, colorCollection[i].value, this.format).toString();
                var legendEventArg = { cancel: false, text: label, name: 'legendRender' };
                this.labelCollection.push(label);
                this.heatMap.trigger('legendRender', legendEventArg);
                if (heatMap.legendRender) {
                    if (heatMap.legendSettings.enableSmartLegend && heatMap.legendSettings.labelDisplayType === 'Edge'
                        && i > 0 && i < colorCollection.length - 1) {
                        this.labelCollections.push('');
                    }
                    else {
                        if (!legendEventArg.cancel) {
                            this.labelCollections.push(legendEventArg.text);
                        }
                        else {
                            this.labelCollections.push('');
                        }
                    }
                }
                else {
                    if (heatMap.legendSettings.enableSmartLegend && heatMap.legendSettings.labelDisplayType === 'Edge'
                        && i > 0 && i < colorCollection.length - 1) {
                        this.labelCollections.push('');
                    }
                    else {
                        this.labelCollections.push(label);
                    }
                }
            }
        }
        else {
            for (var i = 0; i < colorCollection.length; i++) {
                var label = colorCollection[i].isHidden ? '' : colorCollection[i].label ? colorCollection[i].label :
                    this.heatMap.isColorRange ? colorCollection[i].startValue.toString() + '-' + colorCollection[i].endValue.toString() :
                        formatValue(isCustom, format, colorCollection[i].value, this.format).toString();
                var legendEventArg = { cancel: false, text: label, name: 'legendRender' };
                if (!colorCollection[i].isHidden) {
                    this.heatMap.trigger('legendRender', legendEventArg);
                }
                if (heatMap.legendRender) {
                    if (!legendEventArg.cancel) {
                        if (i > 0 && i < colorCollection.length - 1 && heatMap.legendSettings.labelDisplayType === 'Edge') {
                            this.labelCollections.push('');
                        }
                        else {
                            if (!legendEventArg.cancel) {
                                this.labelCollections.push(legendEventArg.text);
                            }
                            else {
                                this.labelCollections.push('');
                            }
                        }
                    }
                    else {
                        this.labelCollections.push('');
                    }
                }
                else {
                    if (i > 0 && i < colorCollection.length - 1 && heatMap.legendSettings.labelDisplayType === 'Edge') {
                        this.labelCollections.push('');
                    }
                    else {
                        this.labelCollections.push(label);
                    }
                }
            }
        }
        if (heatMap.paletteSettings.type === 'Gradient' || (heatMap.paletteSettings.type === 'Fixed' &&
            heatMap.legendSettings.enableSmartLegend)) {
            this.maxLegendLabelSize = this.getMaxLabelSize();
            if (heatMap.horizontalGradient && legendSettings.height === '') {
                this.legendHeight = ((2 * this.legendRectPadding) + this.legendSize + this.maxLegendLabelSize.height).toString();
            }
            else if (!heatMap.horizontalGradient && legendSettings.width === '' && (legendSettings.textStyle.textOverflow === 'None' ||
                (heatMap.paletteSettings.type === 'Fixed' && heatMap.legendSettings.enableSmartLegend &&
                    heatMap.legendSettings.labelDisplayType === 'None'))) {
                this.legendWidth = ((2 * this.legendRectPadding) + this.legendSize + this.maxLegendLabelSize.width).toString();
            }
            this.calculateTitleBounds();
        }
        else {
            this.calculateListLegendBounds(rect);
        }
        this.legendHeight = this.legendHeight ? this.legendHeight : heatMap.horizontalGradient ? '50' : '100%';
        this.legendWidth = this.legendWidth ? this.legendWidth : heatMap.horizontalGradient ?
            '100%' : heatMap.paletteSettings.type === 'Fixed' && !heatMap.legendSettings.enableSmartLegend ? '70' : '50';
        this.height = stringToNumber(this.legendHeight, rect.height);
        this.width = stringToNumber(this.legendWidth, rect.width);
        if (heatMap.horizontalGradient) {
            this.height = heatMap.paletteSettings.type === 'Gradient' || heatMap.legendSettings.enableSmartLegend ?
                this.height < 50 ? 50 : this.height : this.height;
            if (legendSettings.position === 'Top') {
                rect.y += this.height;
            }
            rect.height -= this.height;
        }
        else {
            this.width = heatMap.paletteSettings.type === 'Gradient' || heatMap.legendSettings.enableSmartLegend ?
                this.width < 50 ? 50 : this.width : this.width;
            if (legendSettings.position === 'Left') {
                rect.x += this.width;
            }
            rect.width -= this.width;
        }
    };
    Legend.prototype.calculateTitleBounds = function () {
        var heatMap = this.heatMap;
        var title = heatMap.legendSettings.title;
        var titleSize = measureText(title.text, title.textStyle);
        if (heatMap.legendSettings.title.text) {
            if ((heatMap.legendSettings.position === 'Top' || heatMap.legendSettings.position === 'Bottom') &&
                heatMap.legendSettings.height === '') {
                this.legendHeight = (((2 * this.legendRectPadding) - titleSize.height) +
                    this.legendSize + this.maxLegendLabelSize.height).toString();
            }
            if (heatMap.legendSettings.width === '' && (heatMap.legendSettings.textStyle.textOverflow === 'None' ||
                (heatMap.paletteSettings.type === 'Fixed' && heatMap.legendSettings.enableSmartLegend &&
                    heatMap.legendSettings.labelDisplayType === 'None'))) {
                if (heatMap.legendSettings.position === 'Right') {
                    this.legendWidth = ((2 * this.legendRectPadding + titleSize.width) +
                        this.legendSize + this.maxLegendLabelSize.width).toString();
                }
                else if (heatMap.legendSettings.position === 'Left') {
                    titleSize.width = titleSize.width > this.maxLegendLabelSize.width ? titleSize.width : this.maxLegendLabelSize.width;
                    this.legendWidth = ((2 * this.legendRectPadding + titleSize.width) + this.legendSize).toString();
                }
            }
        }
    };
    Legend.prototype.calculateListLegendBounds = function (rect) {
        var heatMap = this.heatMap;
        this.listWidth = 0;
        this.listHeight = 0;
        this.currentPage = 1;
        var padding = 10; // padding of paging elements
        var title = heatMap.legendSettings.title;
        var titleSize = measureText(title.text, title.textStyle);
        var height = (titleSize.height + 50).toString();
        if (heatMap.horizontalGradient) {
            for (var i = 0; i < heatMap.colorCollection.length; i++) {
                var size = 0;
                if (heatMap.legendSettings.showLabel) {
                    var text = this.labelCollections[i];
                    size = measureText(text, heatMap.legendSettings.textStyle).width;
                }
                var perListWidth = this.legendSize + this.labelPadding + size + this.listInterval;
                this.listWidth += perListWidth;
            }
            this.listWidth += this.listInterval + padding;
            if (this.legendWidth === '') {
                this.legendWidth = this.listWidth > rect.width ? rect.width.toString() : this.listWidth.toString();
            }
            if (this.legendHeight === '') {
                this.numberOfRows = Math.ceil(this.listWidth / stringToNumber(this.legendWidth, rect.width));
                this.numberOfRows = this.numberOfRows > 3 ? 3 : this.numberOfRows;
                this.legendHeight = (this.listWidth > rect.width || this.listWidth > stringToNumber(this.legendWidth, rect.width)) &&
                    this.numberOfRows > 3 ? (((this.legendSize + this.listInterval) * this.numberOfRows) + this.legendRectPadding +
                    parseInt(heatMap.legendSettings.textStyle.size, 10) + padding).toString() :
                    (((this.legendSize + this.listInterval) * this.numberOfRows) + this.legendRectPadding).toString();
            }
        }
        else {
            this.listHeight = ((this.legendSize + this.listInterval) * heatMap.colorCollection.length)
                + this.listInterval + (heatMap.legendSettings.title.text ? titleSize.height : 0);
            if (this.legendHeight === '') {
                this.legendHeight = this.listHeight > rect.height ? rect.height.toString() : this.listHeight.toString();
            }
            if (this.legendWidth === '' && heatMap.legendSettings.textStyle.textOverflow !== 'Trim') {
                this.maxLegendLabelSize = this.getMaxLabelSize();
                this.maxLegendLabelSize.width = titleSize.width > this.maxLegendLabelSize.width ?
                    titleSize.width : this.maxLegendLabelSize.width;
                this.legendWidth = ((2 * this.legendRectPadding) + this.legendSize + this.labelPadding +
                    this.maxLegendLabelSize.width).toString();
            }
        }
        if (stringToNumber(this.legendHeight, rect.height) < 50) {
            this.legendHeight = height;
        }
        if (stringToNumber(this.legendWidth, rect.width) < 70) {
            this.legendWidth = '70';
        }
    };
    Legend.prototype.getMaxLabelSize = function () {
        var heatMap = this.heatMap;
        this.maxLegendLabelSize = new Size(0, 0);
        if (!heatMap.legendSettings.showLabel || (heatMap.horizontalGradient && heatMap.paletteSettings.type === 'Fixed' &&
            !heatMap.legendSettings.enableSmartLegend) || (heatMap.paletteSettings.type === 'Fixed' &&
            heatMap.legendSettings.labelDisplayType === 'None')) {
            return this.maxLegendLabelSize;
        }
        else {
            var labelSize = this.maxLegendLabelSize;
            for (var i = 0; i < heatMap.legendColorCollection.length; i++) {
                var size = measureText(this.labelCollections[i], heatMap.legendSettings.textStyle);
                labelSize.width = (labelSize.width > size.width) ? labelSize.width : size.width;
                labelSize.height = (labelSize.height > size.height) ? labelSize.height : size.height;
            }
            return labelSize;
        }
    };
    /**
     * @private
     */
    Legend.prototype.calculateLegendSize = function (rect, legendTop) {
        var heatMap = this.heatMap;
        var legendSettings = heatMap.legendSettings;
        var left;
        var top;
        var padding = 10; // inner padding for axis title and axil labels
        var alignment = legendSettings.alignment;
        var width;
        var height = stringToNumber(this.legendHeight, rect.height);
        if (!heatMap.legendSettings.title.text) {
            width = stringToNumber(this.legendWidth, rect.width);
        }
        else {
            width = this.width;
        }
        var axis = heatMap.axisCollections;
        var axisTitlePadding = 0;
        if (heatMap.horizontalGradient) {
            width = width > rect.width ? rect.width : width;
            height = heatMap.paletteSettings.type === 'Gradient' || heatMap.legendSettings.enableSmartLegend ?
                height > 50 ? height : 50 : this.height;
            left = alignment === 'Near' ? rect.x : alignment === 'Far' ? rect.x + rect.width - width :
                rect.x + (rect.width / 2) - (width / 2);
            if (heatMap.xAxis.title.text !== '') {
                axisTitlePadding = measureText(heatMap.xAxis.title.text, heatMap.xAxis.textStyle).height + padding;
            }
            var axisHeight = axis[0].opposedPosition ? 0 : sum(axis[0].xAxisMultiLabelHeight) + axis[0].maxLabelSize.height +
                axisTitlePadding + padding;
            top = legendSettings.position === 'Top' ? heatMap.titleSettings.text ? legendTop :
                heatMap.margin.top : rect.y + rect.height + axisHeight;
        }
        else {
            height = height > rect.height ? rect.height : height;
            width = heatMap.paletteSettings.type === 'Gradient' || heatMap.legendSettings.enableSmartLegend ?
                width > 50 ? width : 50 : width;
            top = alignment === 'Near' ? rect.y : alignment === 'Far' ? rect.y + rect.height - height :
                rect.y + (rect.height / 2) - (height / 2);
            if (heatMap.yAxis.title.text !== '') {
                axisTitlePadding = measureText(heatMap.yAxis.title.text, heatMap.yAxis.textStyle).height + padding;
            }
            var axisWidth = axis[1].opposedPosition ? sum(axis[1].yAxisMultiLabelHeight) +
                axis[1].maxLabelSize.width + axisTitlePadding + 2 * padding : 0;
            left = legendSettings.position === 'Right' ? rect.x + rect.width + axisWidth : heatMap.margin.left;
        }
        this.legendGroup = new Rect(left, top, width, height);
        this.calculateGradientScale(this.legendGroup);
    };
    // calculating number of lists per page
    Legend.prototype.measureListLegendBound = function (rect) {
        var heatMap = this.heatMap;
        var title = heatMap.legendSettings.title;
        var padding = 15; // padding of paging element
        this.numberOfPages = 1;
        var titleSize = measureText(title.text, title.textStyle);
        if (heatMap.horizontalGradient) {
            if (this.listWidth > this.width) {
                this.numberOfRows = Math.ceil(this.listWidth / this.width);
                this.listHeight = ((this.legendSize + this.listInterval) * this.numberOfRows);
                this.listPerPage = this.numberOfRows <= 3 ? this.numberOfRows : Math.ceil((this.height - padding -
                    parseInt(heatMap.legendSettings.textStyle.size, 10) -
                    this.legendRectPadding) / (this.legendSize + this.listInterval));
                this.numberOfPages = Math.ceil(this.numberOfRows / this.listPerPage);
            }
            else {
                this.listPerPage = 1;
            }
        }
        else {
            if (this.listHeight > rect.height || this.listHeight > this.height) {
                var maxHeight = stringToNumber(this.legendHeight, rect.height);
                maxHeight = maxHeight > rect.height ? rect.height : maxHeight;
                maxHeight = heatMap.legendSettings.title.text ? maxHeight - titleSize.height : maxHeight;
                this.listPerPage = Math.floor(maxHeight / (this.legendSize + this.listInterval) - 1);
                this.numberOfPages = Math.max(1, Math.ceil(heatMap.colorCollection.length / this.listPerPage));
            }
            else {
                this.listPerPage = heatMap.colorCollection.length;
                this.legendHeight = this.listHeight.toString();
            }
        }
    };
    Legend.prototype.renderPagingElements = function () {
        var heatMap = this.heatMap;
        if (this.numberOfPages > 1) {
            this.navigationCollections = [];
            this.legend.appendChild(this.paginggroup);
            var iconSize = 10;
            var rightArrowX = this.legendGroup.x + this.legendGroup.width - iconSize;
            var rightArrowY = this.legendGroup.y + this.legendGroup.height - iconSize;
            var text = this.currentPage + '/' + this.numberOfPages;
            var textSize = measureText(text, heatMap.legendSettings.textStyle);
            var textX = rightArrowX - textSize.width - 15;
            var textBasic = new TextBasic(textX, rightArrowY, 'start', text, 0, 'translate(0,0)', 'middle');
            var options = new TextOption(heatMap.element.id + '_paging', textBasic, heatMap.legendSettings.textStyle, heatMap.legendSettings.textStyle.color || heatMap.themeStyle.legendLabel);
            this.drawSvgCanvas.createText(options, this.paginggroup, text);
            if (Browser.isIE && !heatMap.enableCanvasRendering) {
                this.paginggroup.lastChild.setAttribute('dy', '0.6ex');
            }
            this.pagingRect = new Rect(textX, rightArrowY - textSize.height / 2, textSize.width, textSize.height);
            var pagingTextRect = new RectOption(heatMap.element.id + '_pagingText', 'none', { color: 'transparent', width: 0 }, 1, this.pagingRect);
            this.drawSvgCanvas.drawRectangle(pagingTextRect, this.paginggroup);
            var rightArrowRect = new RectOption(heatMap.element.id + '_rightArrow', 'none', { color: 'transparent', width: 0 }, 1, new Rect(rightArrowX - iconSize, rightArrowY - iconSize / 2, iconSize, iconSize));
            this.drawSvgCanvas.drawRectangle(rightArrowRect, this.paginggroup);
            var rightArrow = 'M' + ' ' + (rightArrowX) + ' ' + rightArrowY + ' ' +
                'L' + ' ' + (rightArrowX - iconSize) + ' ' + (rightArrowY - iconSize / 2) + ' ' + 'L' + ' ' +
                (rightArrowX - iconSize) + ' ' + (rightArrowY + (iconSize / 2)) + 'Z';
            var leftX = textX - 15;
            var leftArrow = 'M' + ' ' + leftX + ' ' + rightArrowY + ' ' +
                'L' + ' ' + (leftX + iconSize) + ' ' + (rightArrowY - iconSize / 2) + ' ' + 'L' + ' ' +
                (leftX + iconSize) + ' ' + (rightArrowY + (iconSize / 2)) + 'Z';
            var leftArrowRect = new RectOption(heatMap.element.id + '_leftArrow', 'none', { color: 'transparent', width: 0 }, 1, new Rect(leftX, rightArrowY - iconSize / 2, iconSize, iconSize));
            this.drawSvgCanvas.drawRectangle(leftArrowRect, this.paginggroup);
            var leftOption = new PathOption(heatMap.element.id + '_Legend_leftarrow', 'gray', 0.01, '#A0A0A0', 1, '0,0', leftArrow);
            var rightOption = new PathOption(heatMap.element.id + '_Legend_rightarrow', 'gray', 0.01, '#A0A0A0', 1, '0,0', rightArrow);
            this.navigationCollections.push(rightArrowRect);
            this.navigationCollections.push(leftArrowRect);
            if (!heatMap.enableCanvasRendering) {
                var arrow = heatMap.renderer.drawPath(leftOption);
                var rightarrow = heatMap.renderer.drawPath(rightOption);
                this.paginggroup.appendChild(arrow);
                this.paginggroup.appendChild(rightarrow);
            }
            else {
                var canvasTranslate = void 0;
                heatMap.canvasRenderer.drawPath(leftOption, canvasTranslate);
                heatMap.canvasRenderer.drawPath(rightOption, canvasTranslate);
            }
        }
    };
    Legend.prototype.calculateGradientScale = function (scale) {
        var heatMap = this.heatMap;
        var padding = 10; // padding between legend bounds and gradient scale
        var left;
        var top;
        var height;
        var width;
        var title = heatMap.legendSettings.title;
        var titleSize = measureText(title.text, title.textStyle);
        var titleHeight = heatMap.legendSettings.title.text ? titleSize.height : 0;
        if (heatMap.paletteSettings.type === 'Fixed' && !heatMap.legendSettings.enableSmartLegend) {
            this.measureListLegendBound(heatMap.initialClipRect);
        }
        if (heatMap.horizontalGradient) {
            left = scale.x + padding;
            top = scale.y + this.legendRectPadding;
            width = heatMap.paletteSettings.type === 'Fixed' && !heatMap.legendSettings.enableSmartLegend ?
                scale.width - (2 * this.listInterval) : scale.width - 2 * padding;
            height = heatMap.paletteSettings.type === 'Fixed' && !heatMap.legendSettings.enableSmartLegend ?
                (this.legendSize + this.listInterval) * this.listPerPage - this.listInterval : this.gradientScaleSize;
        }
        else {
            left = scale.x + this.legendRectPadding;
            top = scale.y + padding + titleHeight;
            width = (heatMap.paletteSettings.type === 'Fixed' && !heatMap.legendSettings.enableSmartLegend) ?
                scale.width - padding : this.gradientScaleSize;
            height = heatMap.paletteSettings.type === 'Fixed' && !heatMap.legendSettings.enableSmartLegend ?
                (this.legendSize + this.listInterval) * this.listPerPage - this.listInterval :
                scale.height - 2 * padding - titleHeight;
        }
        this.legendRectScale = new Rect(left, top, width, height);
        if (heatMap.paletteSettings.type === 'Gradient' || heatMap.paletteSettings.type === 'Fixed' &&
            heatMap.legendSettings.enableSmartLegend) {
            this.calculateColorAxisGrid(this.legendRectScale);
        }
    };
    Legend.prototype.calculateColorAxisGrid = function (legendRect) {
        var heatMap = this.heatMap;
        var rect = this.legendRectScale;
        var legendPart;
        var text;
        var maxTextWrapLength = 0;
        this.segmentCollectionsLabels = [];
        this.segmentCollections = [];
        this.textWrapCollections = [];
        var pathX1;
        var pathY1;
        var colorCollection = heatMap.paletteSettings.type === 'Gradient' ?
            heatMap.legendColorCollection : heatMap.colorCollection;
        var minValue = heatMap.bubbleSizeWithColor ? heatMap.minColorValue : heatMap.dataSourceMinValue;
        var maxValue = heatMap.bubbleSizeWithColor ? heatMap.maxColorValue : heatMap.dataSourceMaxValue;
        this.legendMinValue = this.heatMap.isColorRange ? (colorCollection[0].startValue > heatMap.dataSourceMinValue) ?
            heatMap.dataSourceMinValue : colorCollection[0].startValue : ((colorCollection[0].value > minValue) ? minValue :
            colorCollection[0].value);
        this.legendMaxValue = this.heatMap.isColorRange ? (colorCollection[colorCollection.length - 1].endValue <
            heatMap.dataSourceMaxValue) ? heatMap.dataSourceMaxValue : colorCollection[colorCollection.length - 1].endValue :
            (colorCollection[colorCollection.length - 1].value < maxValue ? maxValue : colorCollection[colorCollection.length - 1].value);
        if (heatMap.paletteSettings.type === 'Gradient') {
            for (var index = 0; index < colorCollection.length; index++) {
                var value = void 0;
                legendPart = (this.heatMap.isColorRange && heatMap.horizontalGradient ? rect.width : rect.height) / 100;
                if (this.heatMap.isColorRange) {
                    if (colorCollection[0].startValue !== this.heatMap.dataSourceMinValue && index === 0 &&
                        colorCollection[0].startValue > this.heatMap.dataSourceMinValue) {
                        value = (this.heatMap.dataSourceMinValue - this.legendMinValue) /
                            (this.legendMaxValue - this.legendMinValue) * 100;
                        pathY1 = (heatMap.horizontalGradient ? legendRect.x : legendRect.y) + (legendPart * value);
                        this.segmentCollections.push(pathY1);
                    }
                    value = ((((colorCollection[index].startValue < heatMap.dataSourceMinValue && colorCollection[index].endValue >
                        heatMap.dataSourceMaxValue) ? heatMap.dataSourceMinValue : colorCollection[index].startValue) -
                        this.legendMinValue) / (this.legendMaxValue - this.legendMinValue)) * 100;
                    value = isNaN(value) ? 0 : value;
                    pathY1 = (heatMap.horizontalGradient ? legendRect.x : legendRect.y) + (legendPart * value);
                    this.segmentCollections.push(pathY1);
                    this.segmentCollectionsLabels.push(pathY1);
                    if (colorCollection[index].endValue !== ((index === colorCollection.length - 1) ?
                        this.heatMap.dataSourceMaxValue : colorCollection[index + 1].startValue) &&
                        this.heatMap.legendColorCollection[index].endValue < this.heatMap.dataSourceMaxValue) {
                        if (index === colorCollection.length - 1) {
                            value = (colorCollection[index].endValue - this.legendMinValue) /
                                (this.legendMaxValue - this.legendMinValue) * 100;
                            pathY1 = (heatMap.horizontalGradient ? legendRect.x : legendRect.y) + (legendPart * value);
                            this.segmentCollections.push(pathY1);
                        }
                        value = ((index === colorCollection.length - 1 ? this.heatMap.dataSourceMaxValue :
                            colorCollection[index].endValue) - this.legendMinValue) /
                            (this.legendMaxValue - this.legendMinValue) * 100;
                        pathY1 = (heatMap.horizontalGradient ? legendRect.x : legendRect.y) + (legendPart * value);
                        this.segmentCollections.push(pathY1);
                    }
                }
                else {
                    value = ((colorCollection[index].value - this.legendMinValue) / (this.legendMaxValue - this.legendMinValue)) * 100;
                    value = isNaN(value) ? 0 : value;
                    if (!heatMap.horizontalGradient) {
                        legendPart = rect.height / 100;
                        pathY1 = legendRect.y + (legendPart * value);
                        this.segmentCollections.push(pathY1);
                    }
                    else {
                        legendPart = rect.width / 100;
                        pathX1 = legendRect.x + (legendPart * value);
                        this.segmentCollections.push(pathX1);
                    }
                }
            }
        }
        var textWrapWidth;
        if (heatMap.horizontalGradient) {
            var segmentWidth = this.heatMap.isColorRange ? this.segmentCollectionsLabels : this.segmentCollections;
            for (var i = 0; i < colorCollection.length; i++) {
                if (heatMap.paletteSettings.type === 'Gradient') {
                    var previousSegmentWidth = (segmentWidth[i] - segmentWidth[i - 1]) / 2;
                    var nextSegmentWidth = (segmentWidth[i + 1] - segmentWidth[i]) / 2;
                    if (i === colorCollection.length - 1) {
                        textWrapWidth = this.heatMap.isColorRange ? (legendRect.width - segmentWidth[i - 1]) / 2 : previousSegmentWidth;
                    }
                    else if (i === 0) {
                        textWrapWidth = nextSegmentWidth;
                    }
                    else {
                        textWrapWidth = (previousSegmentWidth < nextSegmentWidth && !this.heatMap.isColorRange) ?
                            previousSegmentWidth : nextSegmentWidth;
                    }
                }
                else {
                    var width = this.legendRectScale.width / heatMap.colorCollection.length;
                    textWrapWidth = heatMap.legendSettings.labelDisplayType === 'Edge' ? width : width / 2;
                }
                this.textWrapCollections.push(textWrapWidth);
                text = getTitle(this.labelCollections[i], heatMap.legendSettings.textStyle, textWrapWidth);
                maxTextWrapLength = text.length > maxTextWrapLength ? text.length : maxTextWrapLength;
            }
            if (heatMap.legendSettings.position === 'Bottom') {
                heatMap.initialClipRect.height -= (this.maxLegendLabelSize.height * (maxTextWrapLength - 1));
                this.legendGroup.y -= (this.maxLegendLabelSize.height * (maxTextWrapLength - 1));
                this.legendRectScale.y = this.legendGroup.y + this.legendRectPadding;
                this.legendGroup.height = parseInt(this.legendHeight, 10) + (this.maxLegendLabelSize.height * (maxTextWrapLength - 1));
            }
            else {
                heatMap.initialClipRect.y += (this.maxLegendLabelSize.height * (maxTextWrapLength - 1));
                heatMap.initialClipRect.height -= (this.maxLegendLabelSize.height * (maxTextWrapLength - 1));
                this.legendRectScale.y = this.legendGroup.y + this.legendRectPadding;
                this.legendGroup.height = parseInt(this.legendHeight, 10) + (this.maxLegendLabelSize.height * (maxTextWrapLength - 1));
            }
        }
    };
    Legend.prototype.renderColorAxisGrid = function (legendRect) {
        var heatMap = this.heatMap;
        var legendElement;
        var pathX1;
        var pathY1;
        var pathX2;
        var pathY2;
        if (!heatMap.enableCanvasRendering) {
            legendElement = this.heatMap.renderer.createGroup({ id: heatMap.element.id + '_ColorAxis_Grid' });
        }
        for (var i = 0; i < (heatMap.isColorRange ? this.segmentCollections.length : heatMap.legendColorCollection.length); i++) {
            if (!heatMap.horizontalGradient) {
                pathX1 = legendRect.x;
                pathY1 = pathY2 = this.segmentCollections[i];
                pathX2 = legendRect.x + legendRect.width;
            }
            else {
                pathX1 = pathX2 = this.segmentCollections[i];
                pathY1 = legendRect.y;
                pathY2 = legendRect.y + legendRect.height;
            }
            var direction = new Line(pathX1, pathY1, pathX2, pathY2);
            var line = new LineOption(this.heatMap.element.id + '_ColorAxis_Grid' + i, direction, '#EEEEEE', 1);
            this.drawSvgCanvas.drawLine(line, legendElement);
            if (!heatMap.enableCanvasRendering) {
                this.legend.appendChild(legendElement);
            }
        }
    };
    /**
     * @private
     */
    Legend.prototype.renderLegendTitleTooltip = function (e, pageX, pageY) {
        if (e.target.id.indexOf('_legendTitle') !== -1 && e.target.textContent.indexOf('...') > -1) {
            showTooltip(this.heatMap.legendSettings.title.text, pageX, pageY, this.heatMap.element.offsetWidth, this.heatMap.element.id + '_legendTitle_Tooltip', getElement(this.heatMap.element.id + '_Secondary_Element'), null, this.heatMap);
            document.getElementById(this.heatMap.element.id + '_legendTitle_Tooltip').style.visibility = 'visible';
        }
        else {
            var element = document.getElementById(this.heatMap.element.id + '_legendTitle_Tooltip');
            if (element) {
                element.style.visibility = 'hidden';
            }
        }
    };
    /**
     * @private
     */
    Legend.prototype.renderLegendLabelTooltip = function (e, pageX, pageY) {
        if (e.target.id.indexOf('_Legend_Label') !== -1 && e.target.textContent.indexOf('...') > -1) {
            var targetId = e.target.id.split(this.heatMap.element.id + '_Legend_Label');
            if (targetId.length === 2) {
                var index = void 0;
                if (targetId[1].length === 1 || this.heatMap.legendSettings.textStyle.textOverflow === 'Trim') {
                    index = parseInt(targetId[1], 10);
                }
                else {
                    index = parseInt(targetId[1].substring(0, targetId[1].length - 1), 10);
                }
                showTooltip(this.labelCollections[index], pageX, pageY, this.heatMap.element.offsetWidth, this.heatMap.element.id + '_LegendLabel_Tooltip', getElement(this.heatMap.element.id + '_Secondary_Element'), null, this.heatMap);
                document.getElementById(this.heatMap.element.id + '_LegendLabel_Tooltip').style.visibility = 'visible';
            }
        }
        else {
            var element = document.getElementById(this.heatMap.element.id + '_LegendLabel_Tooltip');
            if (element) {
                element.style.visibility = 'hidden';
            }
        }
    };
    Legend.prototype.calculateListPerPage = function (rect) {
        var heatMap = this.heatMap;
        if (heatMap.horizontalGradient) {
            this.lastList = [];
            var legendX = rect.x;
            var legendY = rect.y;
            var size = 0;
            var division = 0;
            var labelX = 0;
            var labelY = 0;
            var interval = 20;
            var i = void 0;
            var legendSize = 10;
            var padding = 5;
            this.labelXCollections = [];
            this.labelYCollections = [];
            this.legendXCollections = [];
            this.legendYCollections = [];
            for (i = 0; i < heatMap.colorCollection.length; i++) {
                if (heatMap.legendSettings.showLabel) {
                    var text = this.labelCollections[i];
                    size = measureText(text, heatMap.legendSettings.textStyle).width;
                }
                labelX = legendX + legendSize + padding;
                labelY = legendY + padding;
                var maxWidth = heatMap.legendSettings.showLabel ? labelX + size : legendX + this.legendSize + this.listInterval;
                if (i !== 0 && maxWidth > this.legendGroup.width + this.legendGroup.x - this.listInterval) {
                    division += 1;
                    legendX = rect.x;
                    legendY = rect.y + (division * interval);
                    labelX = legendX + legendSize + padding;
                    labelY = legendY + padding;
                    if (division % (this.listPerPage) === 0) {
                        this.lastList.push(i);
                        legendY = rect.y;
                        labelY = legendY + padding;
                        division = 0;
                    }
                }
                this.labelXCollections.push(labelX);
                this.labelYCollections.push(labelY);
                this.legendXCollections.push(legendX);
                this.legendYCollections.push(legendY);
                legendX = legendX + this.legendSize + this.labelPadding + size + this.listInterval;
            }
            this.lastList.push(i);
            this.numberOfPages = this.lastList.length;
        }
    };
    Legend.prototype.renderListLegendMode = function (rect, translate) {
        var heatMap = this.heatMap;
        var legendSize = 10;
        var tempBorder = {
            color: 'transparent', width: 0
        };
        var padding = 5; // padding for legend label from top
        this.legendLabelTooltip = [];
        var listRect;
        var size = new Size(0, 0);
        var labelX = 0;
        var labelY = 0;
        var legendX = rect.x;
        var legendY = rect.y;
        if (translate) {
            this.renderPagingElements();
        }
        var x;
        var y;
        var textWrapWidth = heatMap.legendSettings.title.text ? this.width - (2 * (this.legendSize + this.labelPadding)) :
            this.legendGroup.width - (this.legendSize + this.legendRectPadding + this.labelPadding);
        if (!heatMap.horizontalGradient) {
            x = (this.currentPage * (this.listPerPage)) - (this.listPerPage);
            y = x + this.listPerPage;
            y = y < heatMap.colorCollection.length ? y : heatMap.colorCollection.length;
        }
        else {
            x = this.currentPage === 1 ? 0 : this.lastList[this.currentPage - 2];
            y = this.lastList[this.currentPage - 1];
        }
        for (var i = x; i < y; i++) {
            if (heatMap.legendSettings.showLabel) {
                var text = this.labelCollections[i];
                size = measureText(text, heatMap.legendSettings.textStyle);
            }
            var legendEventArgs = {
                cancel: false, text: this.labelCollection[i], name: 'legendRender'
            };
            if (heatMap.horizontalGradient) {
                legendX = this.legendXCollections[i];
                legendY = this.legendYCollections[i];
                labelX = this.labelXCollections[i];
                labelY = this.labelYCollections[i];
            }
            labelX = legendX + this.legendSize + this.labelPadding;
            labelY = legendY + padding;
            this.heatMap.trigger('legendRender', legendEventArgs);
            if (translate && heatMap.rendering && this.legendRange.length <= heatMap.colorCollection.length) {
                var rectPosition = new LegendRange(legendX, legendY, legendSize, legendSize, heatMap.colorCollection[i].value, true, this.currentPage);
                rectPosition.visible = !isNullOrUndefined(this.visibilityCollections[i]) ? this.visibilityCollections[i] : true;
                if (!legendEventArgs.cancel) {
                    this.legendRange.push(rectPosition);
                }
                else {
                    var rectPosition_1 = new LegendRange(legendX, legendY, 0, 0, heatMap.colorCollection[i].value, true, this.currentPage);
                    this.legendRange.push(rectPosition_1);
                }
                if (heatMap.legendSettings.showLabel) {
                    var textPosition = new LegendRange(labelX, (labelY - size.height / 2), size.width, size.height, heatMap.colorCollection[i].value, true, this.currentPage);
                    textPosition.visible = !isNullOrUndefined(this.visibilityCollections[i]) ? this.visibilityCollections[i] : true;
                    this.legendTextRange.push(textPosition);
                }
            }
            if (!legendEventArgs.cancel) {
                if (heatMap.legendSettings.showLabel) {
                    var text = getTitle(this.labelCollections[i], heatMap.legendSettings.textStyle, textWrapWidth);
                    if (text[0].indexOf('...') !== -1 && heatMap.enableCanvasRendering) {
                        this.legendLabelTooltip.push(new CanvasTooltip(this.labelCollections[i], new Rect(labelX, labelY, size.width, size.height)));
                    }
                    var textBasic = new TextBasic(labelX, labelY, 'start', text, 0, 'translate(0,0)', 'middle');
                    var options = new TextOption(heatMap.element.id + '_Legend_Label' + i, textBasic, heatMap.legendSettings.textStyle, heatMap.legendSettings.textStyle.color || heatMap.themeStyle.legendLabel);
                    options.fill = heatMap.legendOnLoad ? options.fill : this.legendRange[i].visible ? options.fill : '#D3D3D3';
                    this.drawSvgCanvas.createText(options, this.translategroup, text[0]);
                    if (Browser.isIE && !heatMap.enableCanvasRendering) {
                        this.translategroup.lastChild.setAttribute('dy', '0.6ex');
                    }
                }
                listRect = new Rect(legendX, legendY, legendSize, legendSize);
                var listColor = heatMap.legendOnLoad ? this.heatMap.isColorRange ? heatMap.colorCollection[i].minColor :
                    heatMap.colorCollection[i].color :
                    this.legendRange[i].visible ? this.heatMap.isColorRange ? heatMap.colorCollection[i].minColor :
                        heatMap.colorCollection[i].color : '#D3D3D3';
                var rectItems = new RectOption(heatMap.element.id + '_legend_list' + i, listColor, tempBorder, 1, listRect);
                this.drawSvgCanvas.drawRectangle(rectItems, this.translategroup);
                if (heatMap.horizontalGradient) {
                    legendX = legendX + this.legendSize + this.labelPadding + size.width + this.listInterval;
                }
                else {
                    legendY += this.legendSize + this.listInterval;
                }
            }
        }
        if (!heatMap.enableCanvasRendering) {
            this.legendGroup.height = this.legendGroup.height > 0 ? this.legendGroup.height : 0;
            this.legendGroup.width = this.legendGroup.width > 0 ? this.legendGroup.width : 0;
            var clippath = heatMap.renderer.createClipPath({ id: heatMap.element.id + '_LegendScale_ClipPath' });
            var clipRect = heatMap.renderer.drawRectangle(this.legendGroup);
            clippath.appendChild(clipRect);
            this.translategroup.appendChild(clippath);
            this.legend.setAttribute('style', 'clip-path:url(#' + clippath.id + ')');
            this.legendScale.appendChild(this.translategroup);
            heatMap.svgObject.appendChild(this.legend);
        }
    };
    /**
     * @private
     */
    Legend.prototype.translatePage = function (heatMap, page, isNext) {
        var padding = 5;
        if ((isNext && page >= 1 && page < this.numberOfPages) || (!isNext && page > 1 && page <= this.numberOfPages)) {
            if (isNext) {
                this.currentPage += 1;
                this.legendRect.y += this.legendRect.height;
            }
            else {
                this.currentPage -= 1;
                this.legendRect.y -= this.legendRect.height;
            }
            if (!heatMap.enableCanvasRendering) {
                this.paginggroup.removeChild(this.paginggroup.firstChild);
                while (this.translategroup.childNodes.length) {
                    this.translategroup.removeChild(this.translategroup.firstChild);
                }
            }
            else {
                var ctx = heatMap.canvasRenderer.ctx;
                ctx.fillRect(this.legendRectScale.x - padding, this.legendRectScale.y - padding, this.legendRectScale.width +
                    padding, this.legendRectScale.height + (2 * padding));
                ctx.fillRect(this.pagingRect.x, this.pagingRect.y, this.pagingRect.width, this.pagingRect.height);
            }
            this.renderListLegendMode(this.legendRectScale, true);
        }
        if (heatMap.enableCanvasRendering && heatMap.allowSelection && heatMap.rectSelected) {
            var ctx = heatMap.secondaryCanvasRenderer.ctx;
            var position = heatMap.legendSettings.position;
            var initialRect = heatMap.initialClipRect;
            var rectX = position === 'Right' ? initialRect.x + initialRect.width : 0;
            var rectY = position === 'Bottom' ? initialRect.y + initialRect.height : 0;
            var rectWidth = position === 'Right' ? heatMap.availableSize.width - (initialRect.x +
                initialRect.width) : position === 'Left' ? initialRect.x : heatMap.availableSize.width;
            var rectHeight = position === 'Top' ? initialRect.y : position === 'Bottom' ?
                heatMap.availableSize.height - (initialRect.y + initialRect.height) : heatMap.availableSize.height;
            ctx.save();
            ctx.clearRect(rectX, rectY, rectWidth, rectHeight);
            ctx.restore();
            var oldCanvas = document.getElementById(heatMap.element.id + '_canvas');
            var newCanvas = document.getElementById(heatMap.element.id + '_secondary_canvas');
            var rectImage = oldCanvas.getContext('2d').getImageData(rectX, rectY, rectWidth, rectHeight);
            newCanvas.getContext('2d').putImageData(rectImage, rectX, rectY);
            oldCanvas.style.opacity = '0.3';
        }
    };
    /**
     * To create div container for tooltip which appears on hovering the smart legend.
     *
     * @param heatmap
     * @private
     */
    Legend.prototype.createTooltipDiv = function () {
        var element = createElement('div', {
            id: this.heatMap.element.id + 'legendLabelTooltipContainer',
            styles: 'position:absolute'
        });
        this.heatMap.element.appendChild(element);
    };
    /**
     * To render tooltip for smart legend.
     *
     * @private
     */
    Legend.prototype.renderTooltip = function (currentLegendRect) {
        var heatMap = this.heatMap;
        var tempTooltipText = [currentLegendRect.label];
        var offset = null;
        offset = parseInt(heatMap.legendSettings.textStyle.size, 10) / 2;
        this.tooltipObject = new tool({
            offset: offset,
            theme: heatMap.theme,
            content: tempTooltipText,
            location: {
                x: currentLegendRect.x + (currentLegendRect.width / 2),
                y: currentLegendRect.y + (currentLegendRect.height / 2)
            },
            inverted: heatMap.horizontalGradient ? false : true,
            areaBounds: {
                height: this.legendGroup.height + this.legendGroup.y,
                width: this.legendGroup.width + this.legendGroup.x,
                x: heatMap.legendSettings.position === 'Right' ? 0 : this.legendGroup.x,
                y: heatMap.legendSettings.position === 'Top' ? heatMap.titleSettings.text === '' ? this.legendGroup.height -
                    this.legendGroup.y : this.legendGroup.y : 0
            }
        }, '#' + this.heatMap.element.id + 'legendLabelTooltipContainer');
        this.tooltipObject.element.style.visibility = 'visible';
    };
    /**
     * To create tooltip for smart legend.
     *
     * @private
     */
    Legend.prototype.createTooltip = function (pageX, pageY) {
        var currentLegendRect;
        for (var i = 0; i < this.heatMap.colorCollection.length; i++) {
            var position = this.legendRectPositionCollection[i];
            if (position && pageX > position.x && pageX < position.width + position.x &&
                pageY > position.y && pageY < position.height + position.y) {
                currentLegendRect = this.legendRectPositionCollection[i];
                break;
            }
        }
        var ele = document.getElementById(this.heatMap.element.id + 'legendLabelTooltipContainer');
        if (ele && ele.style.visibility === 'visible' && this.tooltipObject && !this.heatMap.isTouch) {
            this.tooltipObject.fadeOut();
            ele.style.visibility = 'hidden';
        }
        if (currentLegendRect) {
            this.renderTooltip(currentLegendRect);
        }
    };
    /**
     * Toggle the visibility of cells based on legend selection
     *
     * @private
     */
    Legend.prototype.legendRangeSelection = function (index) {
        var heatMap = this.heatMap;
        var legendRange = this.legendRange;
        var padding = 5;
        var legendPadding = heatMap.horizontalGradient ? 10 : 0;
        var legendBound = this.legendRectScale;
        var ctx = heatMap.canvasRenderer.ctx;
        heatMap.rangeSelection = true;
        if (heatMap.enableCanvasRendering) {
            var ctx_2 = heatMap.canvasRenderer.ctx;
            if (heatMap.legendSettings.enableSmartLegend) {
                ctx_2.fillRect(legendBound.x - padding, legendBound.y - padding, (legendBound.width + this.labelPadding +
                    this.maxLegendLabelSize.width) + padding, legendBound.height + 2 * (padding + legendPadding));
            }
            else {
                ctx_2.fillRect(legendBound.x - padding, legendBound.y - padding, legendBound.width +
                    padding, legendBound.height + (2 * padding));
            }
        }
        else {
            if (heatMap.legendSettings.enableSmartLegend) {
                while (this.legend && this.legend.childNodes.length) {
                    this.legend.removeChild(this.legend.firstChild);
                }
            }
            else {
                while (this.translategroup && this.translategroup.childNodes.length) {
                    this.translategroup.removeChild(this.translategroup.firstChild);
                }
            }
            removeElement(heatMap.heatMapSeries.containerRectObject.id);
            if (heatMap.cellSettings.showLabel) {
                removeElement(heatMap.heatMapSeries.containerTextObject.id);
            }
        }
        if (heatMap.legendSettings.enableSmartLegend) {
            if (heatMap.colorCollection.length !== heatMap.legendColorCollection.length) {
                if (index === heatMap.legendColorCollection.length - 1) {
                    heatMap.toggleValue[index - 1].visible = this.visibilityCollections[index - 1] =
                        legendRange[index - 1].visible = !legendRange[index].visible;
                }
                else {
                    if (index === heatMap.colorCollection.length - 1) {
                        heatMap.toggleValue[index + 1].visible = this.visibilityCollections[index + 1] =
                            legendRange[index + 1].visible = !legendRange[index].visible;
                    }
                }
            }
        }
        heatMap.toggleValue[index].visible = this.visibilityCollections[index] = legendRange[index].visible = !legendRange[index].visible;
        heatMap.legendOnLoad = false;
        if (heatMap.legendSettings.enableSmartLegend) {
            this.renderSmartLegend();
            var rectItemsSvg = new Rect(legendBound.x, legendBound.y, legendBound.width, legendBound.height);
            this.renderLegendLabel(rectItemsSvg);
            if (heatMap.enableCanvasRendering) {
                ctx.save();
                ctx.clip();
            }
            if (heatMap.renderingMode === 'SVG') {
                this.renderTitle(rectItemsSvg);
            }
        }
        else {
            this.renderListLegendMode(this.legendRectScale, false);
        }
        if (heatMap.enableCanvasRendering) {
            ctx.restore();
        }
        heatMap.heatMapSeries.renderRectSeries();
        heatMap.clearSelection();
        if (heatMap.enableCanvasRendering && heatMap.allowSelection) {
            // heatMap.createSvg();
            // heatMap.refreshBound();
            // heatMap.createMultiCellDiv(false);
        }
    };
    /**
     * update visibility collections of legend and series
     *
     * @private
     */
    Legend.prototype.updateLegendRangeCollections = function () {
        var heatMap = this.heatMap;
        heatMap.rangeSelection = !heatMap.legendOnLoad ? true : false;
        this.visibilityCollections = !heatMap.legendOnLoad ? this.visibilityCollections : [];
        heatMap.toggleValue = !heatMap.legendOnLoad ? heatMap.toggleValue : [];
        this.legendRange = !heatMap.legendOnLoad ? this.legendRange : [];
        this.legendTextRange = !heatMap.legendOnLoad ? this.legendTextRange : [];
    };
    return Legend;
}());
export { Legend };
