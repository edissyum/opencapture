import { convertTileLatLongToPoint } from '../index';
import { convertGeoToPoint, Point, PathOption, maintainSelection } from '../utils/helper';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * navigation-selected-line
 */
var NavigationLine = /** @class */ (function () {
    function NavigationLine(maps) {
        this.maps = maps;
    }
    // eslint-disable-next-line valid-jsdoc
    /**
     * To render navigation line for maps
     */
    NavigationLine.prototype.renderNavigation = function (layer, factor, layerIndex) {
        var navigationEle;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var navigation = layer.navigationLineSettings;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var longitude;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var point = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var latitude;
        var visible;
        var angle;
        var width;
        var color;
        var dashArray;
        var pathOption;
        var direction;
        var markerWidth;
        var arcId;
        var radius;
        var showArrow;
        var arrowColor;
        var arrowSize;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var arrowSettings;
        var arrowPosition;
        var startArrow;
        var endArrow;
        var offSet;
        var offSetValue;
        var navigationGroup;
        var d;
        var group = (this.maps.renderer.createGroup({
            id: this.maps.element.id + '_LayerIndex_' + layerIndex + '_line_Group'
        }));
        for (var i = 0; i < navigation.length; i++) {
            latitude = navigation[i]['properties']['latitude'];
            longitude = navigation[i]['properties']['longitude'];
            visible = navigation[i]['properties']['visible'];
            angle = navigation[i]['angle'];
            width = navigation[i]['width'] || 1;
            color = navigation[i]['color'];
            dashArray = navigation[i]['properties']['dashArray'];
            arrowSettings = navigation[i]['properties']['arrowSettings'];
            showArrow = (isNullOrUndefined(arrowSettings)) ? false : arrowSettings['properties']['showArrow'];
            if (longitude['length'] === latitude['length'] && visible) {
                for (var i_1 = 0; i_1 < longitude['length']; i_1++) {
                    var location_1 = (this.maps.isTileMap) ? convertTileLatLongToPoint(new Point(longitude[i_1], latitude[i_1]), factor, this.maps.tileTranslatePoint, true) : convertGeoToPoint(latitude[i_1], longitude[i_1], factor, layer, this.maps);
                    point.push(location_1);
                }
            }
            navigationGroup = (this.maps.renderer.createGroup({
                id: this.maps.element.id + '_LayerIndex_' + layerIndex + '_NavigationGroup' + i + ''
            }));
            for (var j = 0; j < point['length'] - 1; j++) {
                angle = (-1 > angle) ? -1 : angle;
                angle = (1 < angle) ? 1 : angle;
                var arcId_1 = this.maps.element.id + '_LayerIndex_' + layerIndex + '_NavigationIndex_' + i + '_Line' + j + '';
                var radius_1 = this.convertRadius(point[j], point[j + 1]);
                if (angle <= 1 && angle > 0) {
                    direction = 0;
                    if (point[j]['x'] > point[j + 1]['x']) {
                        direction = 1;
                    }
                }
                if (angle >= -1 && angle < 0) {
                    direction = 1;
                    if (point[j]['x'] > point[j + 1]['x']) {
                        direction = 0;
                    }
                }
                if (point[j]['x'] !== point[j + 1]['x']) {
                    if (showArrow) {
                        arrowColor = arrowSettings['properties']['color'];
                        arrowSize = arrowSettings['properties']['size'];
                        offSetValue = (arrowSettings['properties']['offSet'] === undefined) ? 0 : arrowSettings['properties']['offSet'];
                        var divide = (Math.round(arrowSize / 2));
                        arrowPosition = arrowSettings['properties']['position'];
                        startArrow = (arrowPosition === 'Start') ? 'url(#triangle' + i + ')' : null;
                        endArrow = (arrowPosition === 'End') ? 'url(#triangle' + i + ')' : null;
                        if (offSet !== 0 && angle === 0) {
                            offSet = (arrowPosition === 'Start') ? offSetValue : -(offSetValue);
                        }
                        offSet = (isNullOrUndefined(offSet)) ? 0 : offSet;
                        var triId = this.maps.element.id + '_triangle';
                        var defElement = this.maps.renderer.createDefs();
                        defElement.innerHTML += '<marker id="' + 'triangle' + i + '"></marker>';
                        var markerEle = defElement.querySelector('#' + 'triangle' + i);
                        markerEle.setAttribute('markerWidth', (arrowSize.toString()));
                        markerEle.setAttribute('markerHeight', (arrowSize.toString()));
                        markerEle.setAttribute('refX', (divide - offSet).toString());
                        markerEle.setAttribute('refY', divide.toString());
                        markerEle.setAttribute('orient', 'auto');
                        var d2 = 'M 0,0  L 0,' + arrowSize + ' L ' + divide + ', ' + divide + ' Z';
                        pathOption = new PathOption(triId, arrowColor, width, color, 1, 1, dashArray, d2);
                        navigationEle = this.maps.renderer.drawPath(pathOption);
                        markerEle.appendChild(navigationEle);
                        defElement.appendChild(markerEle);
                        navigationGroup.appendChild(defElement);
                    }
                    angle = Math.abs(angle);
                    d = (angle === 0) ? 'M ' + point[j]['x'] + ',' + point[j]['y'] + 'L ' + point[j + 1]['x']
                        + ',' + point[j + 1]['y'] + ' ' :
                        'M ' + point[j]['x'] + ',' + point[j]['y'] + ' A ' + (radius_1 / 2 + (1 - angle) * radius_1 / (angle * 10)) +
                            ' ' + (radius_1 / 2 + (1 - angle) * radius_1 / (angle * 10)) + ' ' + 0 + ',' + 0 + ','
                            + direction + ' , ' + point[j + 1]['x'] + ',' + point[j + 1]['y'] + ' ';
                    pathOption = new PathOption(arcId_1, 'none', width, color, 1, 1, dashArray, d);
                    navigationEle = this.maps.renderer.drawPath(pathOption);
                    if (!isNullOrUndefined(arrowPosition)) {
                        var position = (arrowPosition === 'Start') ? navigationEle.setAttribute('marker-start', startArrow)
                            : navigationEle.setAttribute('marker-end', endArrow);
                    }
                    maintainSelection(this.maps.selectedNavigationElementId, this.maps.navigationSelectionClass, navigationEle, 'navigationlineselectionMapStyle');
                    navigationGroup.appendChild(navigationEle);
                    group.appendChild(navigationGroup);
                }
            }
            point = [];
        }
        return group;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NavigationLine.prototype.convertRadius = function (point1, point2) {
        var value1 = point2['x'] - point1['x'];
        var value2 = point2['y'] - point1['y'];
        var value = Math.sqrt((Math.pow(value1, 2) + Math.pow(value2, 2)));
        return value;
    };
    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name
     */
    NavigationLine.prototype.getModuleName = function () {
        return 'NavigationLine';
    };
    /**
     * To destroy the layers.
     *
     * @param {Maps} maps - Specifies the instance of the map
     * @returns {void}
     * @private
     */
    NavigationLine.prototype.destroy = function (maps) {
        /**
         * Destroy method performed here
         */
    };
    return NavigationLine;
}());
export { NavigationLine };
