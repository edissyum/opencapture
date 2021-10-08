import { measureText, TextOption, renderTextElement, CircleOption, PathOption, RectOption } from '../../smithchart/utils/helper';
import { SmithchartRect } from '../../smithchart/utils/utils';
import { legendRender } from '../model/constant';
var SmithchartLegend = /** @class */ (function () {
    function SmithchartLegend() {
        this.legendSeries = [];
    }
    SmithchartLegend.prototype.renderLegend = function (smithchart) {
        this.calculateLegendBounds(smithchart);
        this._drawLegend(smithchart);
        return this.legendActualBounds;
    };
    SmithchartLegend.prototype.calculateLegendBounds = function (smithchart) {
        this.legendSeries = [];
        var padding = 10;
        var legend = smithchart.legendSettings;
        var legendSizeHeight = legend.height;
        var legendSizeWidth = legend.width;
        var itemPadding = legend.itemPadding > 0 ? legend.itemPadding : 0;
        var position = legend.position.toLowerCase();
        var font = legend.title.textStyle;
        var width = 0;
        var height = 0;
        var legendItemWidth = 0;
        var legendItemHeight = 0;
        var legendHeight = 0;
        var svgObjectWidth = smithchart.availableSize.width - ((smithchart.elementSpacing * 4) - (legend.border.width * 2)
            + (smithchart.border.width * 2));
        var rowCount = legend.rowCount;
        var columnCount = legend.columnCount;
        var titleSize = measureText(smithchart.legendSettings['title']['text'], font);
        var maxRowWidth = 0;
        var totalRowHeight = 0;
        var curRowWidth = 0;
        var curRowHeight = 0;
        var allowItems;
        var itemsCountRow = 0;
        var length = smithchart.series.length;
        var legendBounds;
        if (smithchart.legendSettings.visible && length !== 0) {
            if (position === 'bottom' || position === 'top' || position === 'custom') {
                if ((rowCount && columnCount) && (rowCount <= columnCount)) {
                    rowCount = length / columnCount;
                }
                else if (rowCount == null && columnCount != null) {
                    rowCount = length / columnCount;
                }
                else if (rowCount == null && columnCount == null) {
                    rowCount = 1;
                }
                if (rowCount) {
                    allowItems = Math.ceil(length / rowCount);
                }
            }
            else {
                if ((rowCount && columnCount) && (rowCount <= columnCount)) {
                    columnCount = length / rowCount;
                }
                else if (rowCount != null && columnCount == null) {
                    columnCount = length / rowCount;
                }
                else if (rowCount == null && columnCount == null) {
                    columnCount = 1;
                }
                if (columnCount) {
                    allowItems = columnCount;
                }
            }
            for (var i = 0; i < length; i++) {
                this.legendSeries.push({
                    text: smithchart.series[i]['name'] ? smithchart.series[i]['name'] : 'series' + i,
                    seriesIndex: i,
                    shape: smithchart.legendSettings.shape,
                    fill: smithchart.series[i].fill || smithchart.seriesColors[i % smithchart.seriesColors.length],
                    bounds: null
                });
                var legendsize = this._getLegendSize(smithchart, this.legendSeries[i]);
                legendItemWidth = Math.max(legendsize['width'], legendItemWidth);
                legendItemHeight = Math.max(legendsize['height'], legendItemHeight);
                this.legendSeries[i]['bounds'] = { width: legendItemWidth, height: legendItemHeight };
                itemsCountRow = itemsCountRow + 1;
                curRowWidth = curRowWidth + legendItemWidth + itemPadding;
                curRowHeight = Math.max(legendItemHeight, curRowHeight);
                if (position === 'top' || position === 'bottom' || position === 'custom') {
                    if (curRowWidth > svgObjectWidth) {
                        curRowWidth -= legendsize.width + itemPadding;
                        maxRowWidth = Math.max(maxRowWidth, curRowWidth);
                        curRowWidth = legendsize.width + itemPadding;
                        totalRowHeight = totalRowHeight + curRowHeight + itemPadding;
                    }
                }
                if (itemsCountRow === allowItems || i === length - 1) {
                    maxRowWidth = Math.max(maxRowWidth, curRowWidth);
                    totalRowHeight = totalRowHeight + curRowHeight + itemPadding;
                    legendHeight = totalRowHeight;
                    itemsCountRow = 0;
                    curRowHeight = 0;
                    curRowWidth = 0;
                }
            }
            width = (titleSize.width) > maxRowWidth - itemPadding ? (titleSize.width + padding * 2 + itemPadding) :
                maxRowWidth + padding * 2 - (smithchart.border.width * 2);
            height = legendHeight + smithchart.elementSpacing;
            legendBounds = { x: 0, y: 0, width: width, height: height };
        }
        this.legendActualBounds = legendBounds;
        if (legendSizeWidth != null) {
            this.legendActualBounds.width = legendSizeWidth;
        }
        if (legendSizeHeight != null) {
            this.legendActualBounds.height = legendSizeHeight;
        }
    };
    SmithchartLegend.prototype._getLegendSize = function (smithchart, series) {
        var legend = smithchart.legendSettings;
        var symbolWidth = legend.itemStyle.width;
        var symbolHeight = legend.itemStyle.height;
        var textSize = measureText(series.text, legend.textStyle);
        var width = symbolWidth + textSize.width + legend.shapePadding;
        var height = Math.max(symbolHeight, textSize.height);
        return { width: width, height: height };
    };
    /* eslint-disable  */
    SmithchartLegend.prototype._drawLegend = function (smithchart) {
        var legend = smithchart.legendSettings;
        var legendPosition = legend.position.toLowerCase();
        var alignment = legend.alignment;
        var legendBounds = this.legendActualBounds;
        var maxWidth = 0;
        var startX;
        var startY;
        var titleFont = smithchart.title.font ? smithchart.title.font : smithchart.title.textStyle;
        var smithchartTitleHeight = measureText(smithchart.title.text, titleFont).height;
        var smithchartSubtitleHeight = measureText(smithchart.title.subtitle.text, smithchart.title.subtitle.textStyle).height;
        var elementSpacing = smithchart.elementSpacing;
        var offset = smithchartTitleHeight + smithchartSubtitleHeight + elementSpacing + smithchart.margin.top;
        var itemPadding = legend.itemPadding > 0 ? legend.itemPadding : 0;
        var svgObjectWidth = smithchart.availableSize.width;
        var svgObjectHeight = smithchart.availableSize.height;
        var legendBorder = legend.border.width;
        var legendWidth = 0;
        var titleSize = measureText(legend['title']['text'], legend.title.textStyle);
        var legendTitleHeight = titleSize.height;
        var borderSize = smithchart.border.width;
        var svgWidth = svgObjectWidth - ((borderSize * 2));
        var svgHeight = svgObjectHeight - ((borderSize * 2));
        legendBounds.height += legendTitleHeight;
        if (legendPosition !== 'custom') {
            switch (legendPosition) {
                case 'bottom':
                    legendBounds.y = svgHeight - (legendBounds.height + (legendBorder) + elementSpacing);
                    break;
                case 'top':
                    legendBounds.y = borderSize + offset;
                    break;
                case 'right':
                    legendBounds.x = svgWidth - legendBounds.width - (elementSpacing * 2);
                    break;
                case 'left':
                    legendBounds.x = borderSize + (elementSpacing * 2);
                    break;
            }
            if (legendPosition === 'left' || legendPosition === 'right') {
                switch (alignment) {
                    case 'Center':
                        legendBounds.y = (svgHeight / 2) - ((legendBounds.height + legendBorder * 2) / 2) + (elementSpacing / 2);
                        break;
                    case 'Near':
                        legendBounds.y = borderSize + (elementSpacing * 2) + offset;
                        break;
                    case 'Far':
                        legendBounds.y = svgHeight - (legendBounds.height + (legendBorder)) - (elementSpacing * 2);
                        break;
                }
            }
            else {
                switch (alignment) {
                    case 'Center':
                        legendBounds.x = (svgWidth / 2) - ((legendBounds.width + legendBorder * 2) / 2) + (elementSpacing / 2);
                        break;
                    case 'Near':
                        legendBounds.x = borderSize + (elementSpacing * 2);
                        break;
                    case 'Far':
                        legendBounds.x = svgWidth - (legendBounds.width + (legendBorder)) - (elementSpacing * 2);
                        break;
                }
            }
        }
        else {
            legendBounds.y = (legend.location.y < svgHeight) ? legend.location.y : 0;
            legendBounds.x = (legend.location.x < svgWidth) ? legend.location.x : 0;
        }
        if (legendPosition === 'bottom' || legendPosition === 'top') {
            for (var i = 0; i < this.legendSeries.length; i++) {
                legendWidth += this.legendSeries[i].bounds.width + itemPadding;
                if (legendWidth > svgWidth) {
                    legendBounds.x = (svgWidth / 2) - ((legendBounds.width + legendBorder * 2) / 2) + (elementSpacing / 2);
                    break;
                }
            }
        }
        var gLegendEle = smithchart.renderer.createGroup({ 'id': smithchart.element.id + '_legend_group' });
        smithchart.svgObject.appendChild(gLegendEle);
        this.legendItemGroup = smithchart.renderer.createGroup({ 'id': smithchart.element.id + 'legendItem_Group' });
        var currentX = startX = elementSpacing;
        var currentY = startY = elementSpacing;
        if (legend.title.text !== '' && legend.title.visible) {
            gLegendEle.appendChild(this.drawLegendTitle(smithchart, legend, legendBounds, gLegendEle));
            currentY = startY = elementSpacing + legendTitleHeight;
        }
        for (var k = 0; k < this.legendSeries.length; k++) {
            if ((legend.rowCount < legend.columnCount || legend.rowCount === legend.columnCount) &&
                (legendPosition === 'top' || legendPosition === 'bottom' || legendPosition === 'custom')) {
                if ((currentX + this.legendSeries[k]['bounds'].width) > legendBounds.width + startX) {
                    currentX = elementSpacing;
                    currentY += this.legendSeries[k]['bounds'].height + itemPadding;
                }
                this.legendGroup = this.drawLegendItem(smithchart, legend, this.legendSeries[k], k, currentX, (currentY), legendBounds);
                gLegendEle.appendChild(this.legendGroup);
                currentX += this.legendSeries[k]['bounds'].width + itemPadding;
            }
            else {
                if (((currentY + this.legendSeries[k]['bounds'].height + itemPadding) +
                    legendTitleHeight + borderSize > legendBounds.height + startY)) {
                    currentY = startY;
                    currentX += maxWidth + (itemPadding);
                }
                this.legendGroup = this.drawLegendItem(smithchart, legend, this.legendSeries[k], k, (currentX), (currentY), legendBounds);
                gLegendEle.appendChild(this.legendGroup);
                currentY += this.legendSeries[k]['bounds'].height + itemPadding;
                maxWidth = Math.max(maxWidth, this.legendSeries[k]['bounds'].width);
            }
        }
        gLegendEle.setAttribute('transform', 'translate(' + legendBounds.x.toString() + ',' + legendBounds.y.toString() + ')');
        this.drawLegendBorder(gLegendEle, smithchart, legend, legendBounds);
    };
    SmithchartLegend.prototype.drawLegendBorder = function (gLegendEle, smithchart, legend, legendBounds) {
        var borderRect = new RectOption(smithchart.element.id + '_svg' + '_legendRect', 'none', legend.border, 1, new SmithchartRect(0, 0, legendBounds.width, legendBounds.height));
        gLegendEle.appendChild(smithchart.renderer.drawRectangle(borderRect));
    };
    SmithchartLegend.prototype.drawLegendTitle = function (smithchart, legend, legendBounds, gLegendEle) {
        var elementSpacing = smithchart.elementSpacing;
        var titleSize = measureText(legend.title.text, legend.title.textStyle);
        var titleWidth = titleSize.width;
        var titleHeight = titleSize.height;
        var textAlignment = legend.title.textAlignment;
        var startX = 0;
        var legendBoundsWidth = legendBounds.width;
        var startY = elementSpacing + (titleHeight / 2);
        switch (textAlignment) {
            case 'Far':
                startX = legendBoundsWidth - titleWidth - startX;
                break;
            case 'Center':
                startX = legendBoundsWidth / 2 - (titleWidth) / 2;
                break;
        }
        if (startX < 0) {
            startX = 0;
            legendBoundsWidth = titleWidth;
        }
        if (legendBoundsWidth < titleWidth + startX) {
            legendBoundsWidth = titleWidth + startX;
        }
        var options = new TextOption(smithchart.element.id + '_LegendTitleText', startX, startY, 'start', legend.title.text);
        var element = renderTextElement(options, legend.title.textStyle, smithchart.themeStyle.legendLabel, gLegendEle);
        element.setAttribute('aria-label', legend.title.description || legend.title.text);
        return element;
    };
    SmithchartLegend.prototype.drawLegendItem = function (smithchart, legend, legendSeries, k, x, y, legendBounds) {
        var _this = this;
        var location;
        var radius;
        var symbol = legend.itemStyle;
        var itemPadding = legend.itemPadding;
        var textHeight;
        radius = Math.sqrt(symbol['width'] * symbol['width'] + symbol['height'] * symbol['height']) / 2;
        textHeight = measureText(legendSeries['text'], legend.textStyle).height;
        location = {
            x: x + symbol['width'] / 2,
            y: (y + (textHeight > symbol['height'] ? textHeight : symbol['height']) / 2)
        };
        var legendGroup = smithchart.renderer.createGroup({ id: smithchart.element.id + '_svg' + '_Legend' + k.toString() });
        legendGroup['style']['cursor'] = legend.toggleVisibility ? 'pointer' : 'default';
        var legendEventArgs = {
            text: legendSeries['text'],
            fill: legendSeries['fill'],
            shape: legendSeries['shape'],
            name: legendRender,
            cancel: false
        };
        var legendRenderSuccess = function (args) {
            if (!args.cancel) {
                var shape = _this.drawLegendShape(smithchart, legendSeries, location.x, location.y, k, legend, args);
                legendGroup.appendChild(shape);
                var options = new TextOption(smithchart.element.id + '_LegendItemText' + k.toString(), location.x + symbol['width'] / 2 + legend.shapePadding, location.y + textHeight / 4, 'start', args.text);
                legend.textStyle.fontFamily = smithchart.themeStyle.fontFamily || legend.textStyle.fontFamily;
                legend.textStyle.size = smithchart.themeStyle.fontSize || legend.textStyle.size;
                var element = renderTextElement(options, legend.textStyle, smithchart.themeStyle.legendLabel, legendGroup);
                element.setAttribute('aria-label', legend.description || 'Click to show or hide the ' + options.text + ' series');
                legendGroup.appendChild(element);
                _this.legendItemGroup.appendChild(legendGroup);
            }
        };
        legendRenderSuccess.bind(this);
        smithchart.trigger(legendRender, legendEventArgs, legendRenderSuccess);
        return this.legendItemGroup;
    };
    SmithchartLegend.prototype.drawLegendShape = function (smithchart, legendSeries, locX, locY, index, legend, legendEventArgs) {
        var element;
        var circleOptions;
        var pathOptions;
        var path;
        var symbol = legend.itemStyle;
        var width = symbol['width'];
        var height = symbol['height'];
        var x = locX + (-width / 2);
        var y = locY + (-height / 2);
        var border = { color: symbol.border.color, width: symbol.border.width };
        var opacity = 1;
        var fill = (smithchart.series[index].visibility === 'visible') ? legendEventArgs.fill : 'grey';
        var shape = legendEventArgs.shape.toLowerCase();
        var radius = Math.sqrt(height * height + width * width) / 2;
        switch (shape) {
            case 'circle':
                circleOptions = new CircleOption(smithchart.element.id + '_svg' + '_LegendItemShape' + index.toString(), fill, border, opacity, locX, locY, radius, null);
                element = smithchart.renderer.drawCircle(circleOptions);
                break;
            case 'rectangle':
                path = 'M' + ' ' + x + ' ' + (locY + (-height / 2)) + ' ' +
                    'L' + ' ' + ((width / 2) + locX) + ' ' + (locY + (-height / 2)) + ' ' +
                    'L' + ' ' + (locX + (width / 2)) + ' ' + (locY + (height / 2)) + ' ' +
                    'L' + ' ' + x + ' ' + (locY + (height / 2)) + ' ' +
                    'L' + ' ' + x + ' ' + (locY + (-height / 2)) + ' z';
                pathOptions = new PathOption(smithchart.element.id + '_svg' + '_LegendItemShape' + index.toString(), fill, border.width, border.color, 1, '', path);
                element = smithchart.renderer.drawPath(pathOptions);
                break;
            case 'diamond':
                path = 'M' + ' ' + x + ' ' + locY + ' ' +
                    'L' + ' ' + locX + ' ' + (locY + (-height / 2)) + ' ' +
                    'L' + ' ' + ((width / 2) + locX) + ' ' + locY + ' ' +
                    'L' + ' ' + locX + ' ' + (locY + (height / 2)) + ' ' +
                    'L' + ' ' + x + ' ' + locY + ' z';
                pathOptions = new PathOption(smithchart.element.id + '_svg' + '_LegendItemShape' + index.toString(), fill, border.width, border.color, 1, '', path);
                element = smithchart.renderer.drawPath(pathOptions);
                break;
            case 'pentagon':
                var eq = 72;
                for (var j = 0; j <= 5; j++) {
                    var xValue = radius * Math.cos((Math.PI / 180) * (j * eq));
                    var yValue = radius * Math.sin((Math.PI / 180) * (j * eq));
                    if (j === 0) {
                        path = 'M' + ' ' + (xValue + locX) + ' ' + (locY + yValue) + ' ';
                    }
                    else {
                        path = path.concat('L' + ' ' + (locX + xValue) + ' ' + (locY + yValue) + ' ');
                    }
                }
                path = path.concat('Z');
                pathOptions = new PathOption(smithchart.element.id + '_svg' + '_LegendItemShape' + index.toString(), fill, border.width, border.color, 1, '', path);
                element = smithchart.renderer.drawPath(pathOptions);
                break;
            case 'triangle':
                path = 'M' + ' ' + x + ' ' + ((height / 2) + locY) + ' ' +
                    'L' + ' ' + locX + ' ' + (locY + (-height / 2)) + ' ' +
                    'L' + ' ' + (locX + (width / 2)) + ' ' + (locY + (height / 2)) + ' ' +
                    'L' + ' ' + x + ' ' + (locY + (height / 2)) + ' Z';
                pathOptions = new PathOption(smithchart.element.id + '_svg' + '_LegendItemShape' + index.toString(), fill, border.width, border.color, 1, '', path);
                element = smithchart.renderer.drawPath(pathOptions);
                break;
        }
        return element;
    };
    /**
     * Get module name.
     */
    SmithchartLegend.prototype.getModuleName = function () {
        return 'SmithchartLegend';
    };
    /**
     * To destroy the legend.
     * @return {void}
     * @private
     */
    SmithchartLegend.prototype.destroy = function (smithchart) {
        /**
         * Destroy method performed here
         */
    };
    return SmithchartLegend;
}());
export { SmithchartLegend };
