import { measureText } from '../../smithchart/utils/helper';
var AreaBounds = /** @class */ (function () {
    function AreaBounds() {
    }
    AreaBounds.prototype.calculateAreaBounds = function (smithchart, title, bounds) {
        var margin = smithchart.margin;
        var border = smithchart.border;
        var spaceValue = this.getLegendSpace(smithchart, bounds);
        var x = spaceValue['leftLegendWidth'] + margin.left + border.width;
        var rightSpace = spaceValue['rightLegendWidth'] + margin.left + margin.right + (2 * border.width);
        var width = smithchart.availableSize['width'] - (x + rightSpace);
        var y = margin['top'] + (2 * smithchart.elementSpacing) + spaceValue['modelTitleHeight'] +
            spaceValue['modelsubTitleHeight'] + spaceValue['topLegendHeight'] + border.width;
        var height = smithchart.availableSize['height'] - (spaceValue['modelTitleHeight'] +
            (2 * smithchart.elementSpacing) + spaceValue['modelsubTitleHeight'] + margin['top'] +
            spaceValue['topLegendHeight'] + spaceValue['bottomLegendHeight']);
        return { x: x, y: y, width: width, height: height };
    };
    AreaBounds.prototype.getLegendSpace = function (smithchart, bounds) {
        var title = smithchart.title;
        var legend = smithchart.legendSettings;
        var position = legend.position.toLowerCase();
        var subtitleHeight = 0;
        var modelsubTitleHeight = 0;
        var titleHeight = 0;
        var font = smithchart.font;
        var modelTitleHeight = 0;
        var itemPadding = 10;
        var legendBorder = legend.border.width;
        var leftLegendWidth = 0;
        var rightLegendWidth = 0;
        var topLegendHeight = 0;
        var bottomLegendHeight = 0;
        var ltheight = 0;
        var space;
        if (legend['visible']) {
            space = (bounds.width + (itemPadding / 2) + smithchart.elementSpacing + (2 * legendBorder));
            leftLegendWidth = position === 'left' ? space : 0;
            rightLegendWidth = position === 'right' ? space : 0;
            ltheight = legend['title'].visible ? measureText(legend['title'].text, font)['height'] : 0;
            topLegendHeight = position === 'top' ? smithchart.elementSpacing + bounds.height + ltheight : 0;
            bottomLegendHeight = position === 'bottom' ? smithchart.elementSpacing + bounds.height + ltheight : 0;
        }
        subtitleHeight = measureText(title.subtitle.text, font)['height'];
        modelTitleHeight = (title.text === '' || !title['visible']) ? 0 : (titleHeight);
        modelsubTitleHeight = (title['subtitle'].text === '' || !title['subtitle'].visible) ? 0 : (subtitleHeight);
        return {
            leftLegendWidth: leftLegendWidth, rightLegendWidth: rightLegendWidth,
            topLegendHeight: topLegendHeight, bottomLegendHeight: bottomLegendHeight,
            modelTitleHeight: modelTitleHeight, modelsubTitleHeight: modelsubTitleHeight
        };
    };
    return AreaBounds;
}());
export { AreaBounds };
