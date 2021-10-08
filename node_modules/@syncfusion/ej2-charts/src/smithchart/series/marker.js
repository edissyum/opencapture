import { CircleOption, PathOption } from '../../smithchart/utils/helper';
import { SmithchartSize, MarkerOptions } from '../../smithchart/utils/utils';
var Marker = /** @class */ (function () {
    function Marker() {
    }
    Marker.prototype.drawMarker = function (smithchart, seriesindex, groupElement, pointsRegion) {
        if (smithchart.series[seriesindex].marker.visible) {
            var marker = smithchart.series[seriesindex].marker;
            var count = smithchart.series[seriesindex].points.length - 1;
            var width = marker.width;
            var height = marker.height;
            var symbolName = marker.shape;
            var gmEle = smithchart.renderer.createGroup({ 'id': smithchart.element.id + '_svg' +
                    '_series' + seriesindex + '_Marker' });
            groupElement.appendChild(gmEle);
            var borderWidth = marker.border.width;
            var borderColor = marker.border.color;
            var opacity = marker.opacity;
            var fill = marker.fill ? marker.fill : (smithchart.series[seriesindex].fill ||
                smithchart.seriesColors[seriesindex % smithchart.seriesColors.length]);
            for (var i = 0; i < count + 1; i++) {
                var location_1 = pointsRegion[i]['point'];
                var pointIndex = i;
                var options = new MarkerOptions(smithchart.element.id + '_Series' + seriesindex + '_Points' + pointIndex + '_Marker' + pointIndex, fill, borderColor, borderWidth, opacity);
                gmEle.appendChild(this.drawSymbol(symbolName, marker.imageUrl, location_1, new SmithchartSize(width, height), options, smithchart));
            }
        }
    };
    Marker.prototype.drawSymbol = function (symbolName, url, location, size, options, smithchart) {
        var markerEle;
        var shape = symbolName.toLowerCase();
        var circleOptions;
        var pathOptions;
        var path;
        var border = { color: options['borderColor'], width: options['borderWidth'] };
        var opacity = options.opacity;
        var startX = location.x;
        var startY = location.y;
        var radius = Math.sqrt(size.height * size.height + size.width * size.width) / 2;
        var eq = 72;
        switch (shape) {
            case 'circle':
                circleOptions = new CircleOption(options['id'], options['fill'], border, opacity, location.x, location.y, radius, null);
                markerEle = smithchart.renderer.drawCircle(circleOptions);
                break;
            case 'rectangle':
                path = 'M' + ' ' + (startX + (-size.width / 2)) + ' ' + (startY + (-size.height / 2)) +
                    ' ' + 'L' + ' ' + (startX + (size.width / 2)) + ' ' + (startY + (-size.height / 2)) + ' ' +
                    'L' + ' ' + (startX + (size.width / 2)) + ' ' + (startY + (size.height / 2)) +
                    ' ' + 'L' + ' ' + (startX + (-size.width / 2)) +
                    ' ' + (startY + (size.height / 2)) + ' ' + 'L' + ' ' +
                    (startX + (-size.width / 2)) + ' ' + (startY + (-size.height / 2)) + 'z';
                pathOptions = new PathOption(options['id'], options['fill'], border.width, border.color, opacity, '', path);
                markerEle = smithchart.renderer.drawPath(pathOptions);
                break;
            case 'triangle':
                path = 'M' + ' ' + (startX + (-size.width / 2)) + ' ' + (startY + (size.height / 2)) + ' ' + 'L' + ' ' + (startX) + ' ' +
                    (startY + (-size.height / 2)) + ' ' + 'L' + ' ' + (startX + (size.width / 2)) + ' ' +
                    (startY + (size.height / 2)) + ' ' + 'L' + ' ' +
                    (startX + (-size.width / 2)) + ' ' + (startY + (size.height / 2)) + 'z';
                pathOptions = new PathOption(options['id'], options['fill'], border.width, border.color, opacity, '', path);
                markerEle = smithchart.renderer.drawPath(pathOptions);
                break;
            case 'diamond':
                path = 'M' + ' ' + (startX + (-size.width / 2)) + ' ' + (startY) + ' ' + 'L' + ' ' +
                    (startX) + ' ' + (startY + (-size.height / 2)) + ' ' + 'L' + ' ' + (startX + (size.width / 2)) + ' ' +
                    (startY) + ' ' + 'L' + ' ' + (startX) + ' ' + (startY + (size.height / 2)) + ' ' + 'L' + ' ' +
                    (startX + (-size.width / 2)) + ' ' + (startY) + 'z';
                pathOptions = new PathOption(options['id'], options['fill'], border.width, border.color, opacity, '', path);
                markerEle = smithchart.renderer.drawPath(pathOptions);
                break;
            case 'pentagon':
                for (var i = 0; i <= 5; i++) {
                    var xValue = radius * Math.cos((Math.PI / 180) * (i * eq));
                    var yValue = radius * Math.sin((Math.PI / 180) * (i * eq));
                    if (i === 0) {
                        path = 'M' + ' ' + (startX + xValue) + ' ' + (startY + yValue) + ' ';
                    }
                    else {
                        path = path.concat('L' + ' ' + (startX + xValue) + ' ' + (startY + yValue) + ' ');
                    }
                }
                path = path.concat('Z');
                pathOptions = new PathOption(options['id'], options['fill'], border.width, border.color, opacity, '', path);
                markerEle = smithchart.renderer.drawPath(pathOptions);
                break;
        }
        return markerEle;
    };
    return Marker;
}());
export { Marker };
