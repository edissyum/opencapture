import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { Rect, measureText, textElement, PathOption } from '@syncfusion/ej2-svg-base';
import { RectOption, CircleOption } from '../../common/utils/helper';
import { Animation } from '@syncfusion/ej2-base';
import { getAnimationFunction } from '../../common/utils/helper';
/**
 * class for Bullet chart Scale Group
 */
var ScaleGroup = /** @class */ (function () {
    function ScaleGroup(bulletChart) {
        this.comparative = [];
        //super();
        this.dataSource = bulletChart.dataSource;
        this.isVertical = (bulletChart.orientation === 'Vertical');
        this.isTicksInside = (bulletChart.tickPosition === 'Inside');
        this.isLabelsInside = (bulletChart.labelPosition === 'Inside');
        this.isHorizontal = (bulletChart.orientation === 'Horizontal');
        this.isLeft = bulletChart.titlePosition === 'Left';
        this.isRight = bulletChart.titlePosition === 'Right';
        this.isTop = bulletChart.titlePosition === 'Top';
        this.location = 10;
        this.featureBarBounds = [];
        this.majorTickSize = bulletChart.majorTickLines.height;
        this.labelOffset = 15;
        this.labelSize = 12;
        this.bulletChart = bulletChart;
        this.isLabelBelow = !this.bulletChart.opposedPosition;
        this.scaleOrientation = this.bulletChart.orientation;
        this.rangeColor = [];
    }
    /**
     * To render range scale of the bulletChart graph
     *
     * @param {Element} scaleGroup
     */
    ScaleGroup.prototype.drawScaleGroup = function (scaleGroup) {
        var rangeGroup = this.bulletChart.renderer.createGroup({ 'id': this.bulletChart.svgObject.id + '_rangeGroup' });
        var max = this.bulletChart.maximum;
        var ranges = this.bulletChart.ranges;
        this.scaleSettingsGroup = scaleGroup;
        var rect;
        var bullet = this.bulletChart;
        var enableRtl = bullet.enableRtl;
        var initialRect = bullet.initialClipRect;
        var locX = initialRect.x + ((enableRtl && bullet.orientation === 'Horizontal') ? initialRect.width : 0);
        var locY = initialRect.y + ((!enableRtl && bullet.orientation === 'Vertical') ? initialRect.height : 0);
        var area = 0;
        bullet.rangeCollection = [];
        var start = 0;
        var range = (bullet.orientation === 'Horizontal') ? initialRect.width : initialRect.height;
        var fillRange = (bullet.orientation === 'Horizontal') ? initialRect.height : initialRect.width;
        for (var i = 0; i < ranges.length; i++) {
            area = (range) * ((ranges[i].end - start) / max);
            if (bullet.orientation === 'Horizontal') {
                locX -= (enableRtl) ? area : 0;
            }
            else {
                locY -= (!enableRtl) ? area : 0;
            }
            rect = new RectOption(bullet.svgObject.id + '_range_' + i, 
            // tslint:disable-next-line:no-string-literal
            ranges[i].color || this.bulletChart.themeStyle.rangeStrokes[i]['color'], { width: 1 }, ranges[i].opacity, new Rect(locX, locY, ((bullet.orientation === 'Horizontal') ? area : fillRange), ((bullet.orientation === 'Horizontal') ? fillRange : area)));
            var svgRect = bullet.renderer.drawRectangle(rect);
            rangeGroup.appendChild(svgRect);
            scaleGroup.appendChild(rangeGroup);
            if (bullet.orientation === 'Horizontal') {
                locX += (enableRtl) ? 0 : area;
            }
            else {
                locY += (!enableRtl) ? 0 : area;
            }
            bullet.rangeCollection.push(area);
            start = ranges[i].end;
        }
        return this.bulletChart.rangeCollection;
    };
    ScaleGroup.prototype.sortRangeCollection = function (a, b) {
        return (a - b);
    };
    /**
     * To render the feature bar of the bulletChart chart
     *
     * @param {number} dataCount Count of the bar.
     */
    ScaleGroup.prototype.renderFeatureBar = function (dataCount) {
        if (dataCount === 0) {
            return;
        }
        this.renderCommonFeatureBar(dataCount, this.isHorizontal);
    };
    /**
     * To render the horizontal feature bar of the bulletChart chart
     *
     * @param {number} dataCount Count of the bar.
     */
    ScaleGroup.prototype.renderCommonFeatureBar = function (dataCount, isHorizontal) {
        var categoryValue;
        var dotWidth = 6;
        var padding = 5;
        var bulletChart = this.bulletChart;
        var initialBoundsStart = isHorizontal ? (bulletChart.initialClipRect.y + bulletChart.initialClipRect.height) :
            bulletChart.initialClipRect.x;
        var lPoint;
        var featueGroup = bulletChart.renderer.createGroup({ 'id': bulletChart.svgObject.id + '_featureGroup' });
        var data;
        var featureBarSize = (isHorizontal ? bulletChart.initialClipRect.height : bulletChart.initialClipRect.width) / dataCount;
        var bounds;
        for (var i = 0; i < dataCount; i++) {
            data = bulletChart.dataSource[i];
            categoryValue = data[bulletChart.categoryField];
            if (isHorizontal) {
                lPoint = initialBoundsStart - (featureBarSize * i) - (featureBarSize + bulletChart.valueHeight) / 2;
            }
            else {
                lPoint = initialBoundsStart + (featureBarSize * i) + (featureBarSize / 2) - bulletChart.valueHeight / 2;
            }
            bounds = this.calculateFeatureMeasureBounds(data[bulletChart.valueField], categoryValue, isHorizontal);
            if (data && bulletChart.type === 'Dot') {
                var value = data[bulletChart.valueField];
                if (isHorizontal) {
                    bounds.pointX = bounds.pointX + (((value > 0) && !bulletChart.enableRtl) ||
                        ((value < 0) && bulletChart.enableRtl) ? (bounds.width) : 0) - dotWidth / 2;
                }
                else {
                    bounds.pointX = bounds.pointX + (((value > 0) && bulletChart.enableRtl) ||
                        ((value < 0) && !bulletChart.enableRtl) ? (bounds.width) : 0) - dotWidth / 2;
                }
                bounds.width = dotWidth;
            }
            // Drawing feature bar rect element
            if (bounds) {
                var svgRect = isHorizontal ? this.featureBar(bounds.pointX, lPoint, bounds.width, i) :
                    this.verticalFeatureBar(lPoint, bounds.pointX, bounds.width, i);
                featueGroup.appendChild(svgRect);
                this.feature = svgRect;
                this.scaleSettingsGroup.appendChild(featueGroup);
                this.featureBarBounds[i] = { x: bounds.pointX, y: lPoint, width: bounds.width, height: bulletChart.valueHeight };
                // Drawing category text element
                if (!isNullOrUndefined(categoryValue)) {
                    var categoryTextSize = measureText(categoryValue, bulletChart.categoryLabelStyle);
                    var categorySize = isHorizontal ? categoryTextSize.width : categoryTextSize.height;
                    var initialRect = bulletChart.initialClipRect;
                    var x = void 0;
                    var categoryOptions = void 0;
                    if (isHorizontal) {
                        x = (bulletChart.enableRtl) ? (initialRect.x + initialRect.width + padding + categorySize / 2) :
                            initialRect.x - padding - categorySize / 2;
                        categoryOptions = this.drawcategory(x, lPoint, categoryValue);
                    }
                    else {
                        x = (bulletChart.enableRtl) ? (initialRect.y - padding - categorySize / 2) :
                            initialRect.y + initialRect.height + padding + categorySize / 2;
                        categoryOptions = this.drawcategory(lPoint + bulletChart.valueHeight / 2, x, categoryValue);
                    }
                    textElement(categoryOptions, bulletChart.categoryLabelStyle, bulletChart.categoryLabelStyle.color || bulletChart.themeStyle.categoryFontColor, this.scaleSettingsGroup);
                }
            }
            if (bulletChart.animation.enable) {
                this.doValueBarAnimation();
            }
        }
    };
    ScaleGroup.prototype.featureBar = function (pointX, pointY, width, i) {
        var featureBarOptions = new RectOption(this.bulletChart.svgObject.id + '_FeatureMeasure_' + i, this.bulletChart.valueFill, this.bulletChart.valueBorder, 1, new Rect(pointX, pointY, width, this.bulletChart.valueHeight));
        var svgRect = this.bulletChart.renderer.drawRectangle(featureBarOptions);
        svgRect.setAttribute('class', this.bulletChart.svgObject.id + '_FeatureMeasure');
        svgRect.id = this.bulletChart.svgObject.id + '_FeatureMeasure_' + i;
        return svgRect;
    };
    ScaleGroup.prototype.verticalFeatureBar = function (pointX, pointY, width, i) {
        var featureBarOptions = new RectOption(this.bulletChart.svgObject.id + '_FeatureMeasure_' + i, this.bulletChart.valueFill, this.bulletChart.valueBorder, 1, new Rect(pointX, pointY, this.bulletChart.valueHeight, width));
        var svgRect = this.bulletChart.renderer.drawRectangle(featureBarOptions);
        svgRect.setAttribute('class', this.bulletChart.svgObject.id + '_FeatureMeasure');
        svgRect.id = this.bulletChart.svgObject.id + '_FeatureMeasure_' + i;
        return svgRect;
    };
    ScaleGroup.prototype.drawcategory = function (lPointX, lPointY, categoryValue) {
        var categoryOptions = {
            'id': '',
            'anchor': 'middle',
            'x': lPointX,
            'y': lPointY + (this.bulletChart.valueHeight),
            'transform': '',
            'text': categoryValue,
            'baseLine': '',
            'labelRotation': 0
        };
        return categoryOptions;
    };
    /**
     * To render comparative symbol of the bulletChart chart
     *
     * @param {number} dataCount Data count value.
     */
    ScaleGroup.prototype.renderComparativeSymbol = function (dataCount) {
        if (dataCount === 0) {
            return;
        }
        this.renderCommonComparativeSymbol(dataCount, this.isHorizontal);
    };
    ScaleGroup.prototype.renderCommonComparativeSymbol = function (dataCount, isHorizontal) {
        var bulletChart = this.bulletChart;
        var value;
        var rect = bulletChart.initialClipRect;
        var scaleLength = isHorizontal ? rect.width : rect.height;
        var y1;
        var y2;
        var x1;
        var pointY = isHorizontal ? (rect.y + rect.height) : rect.x;
        var comparativeGroup = bulletChart.renderer.createGroup({ 'id': bulletChart.svgObject.id + '_comparativeGroup' });
        var minimum = bulletChart.minimum;
        var maximum = bulletChart.maximum;
        var delta = maximum - minimum;
        var targetWidth = bulletChart.targetWidth;
        var pointX = isHorizontal ? (rect.x - (targetWidth / 2)) : (rect.y + rect.height);
        var temp;
        var values = [];
        var targetTypes = bulletChart.targetTypes;
        var targetType = 'Rect';
        var targetTypeLength = targetTypes.length;
        var featureBarSize = (isHorizontal ? rect.height : rect.width) / dataCount;
        var svgElement;
        for (var k = 0; k < dataCount; k++) {
            value = bulletChart.dataSource[k][bulletChart.targetField];
            values = values.concat(value);
            for (var i = 0; i < values.length; i++) {
                targetType = targetTypes[i % targetTypeLength];
                if (values[i] >= minimum && values[i] <= maximum) {
                    if (isHorizontal) {
                        temp = pointY - (featureBarSize * k) - (featureBarSize / 2);
                    }
                    else {
                        temp = pointY + (featureBarSize * k) + (featureBarSize / 2);
                    }
                    y1 = temp - targetWidth * 1.5;
                    y2 = temp + targetWidth * 1.5;
                    temp = (scaleLength / (delta / (delta - (maximum - values[i]))));
                    if (isHorizontal) {
                        x1 = pointX + (bulletChart.enableRtl ? (scaleLength - temp) : temp);
                    }
                    else {
                        x1 = pointX - (bulletChart.enableRtl ? (scaleLength - temp) : temp);
                    }
                    svgElement = this.getTargetElement(targetType, isHorizontal, x1, y1, y2, values[i], k);
                    this.comparative.push(svgElement);
                    comparativeGroup.appendChild(svgElement);
                    y1 = 0;
                    y2 = 0;
                }
                this.scaleSettingsGroup.appendChild(comparativeGroup);
            }
            values = [];
            if (bulletChart.animation.enable) {
                this.doTargetBarAnimation(0);
            }
        }
    };
    ScaleGroup.prototype.getTargetElement = function (targetType, isHorizontal, x1, y1, y2, value, k) {
        var shapeObject;
        var shapeElement;
        var bulletChart = this.bulletChart;
        var strokeWidth = (targetType === 'Cross') ? bulletChart.targetWidth - 1 : 1;
        var size = (targetType === 'Circle') ? bulletChart.targetWidth - 1 : bulletChart.targetWidth;
        var lx = isHorizontal ? x1 + (size / 2) : y1 + ((y2 - y1) / 2);
        var ly = isHorizontal ? y1 + ((y2 - y1) / 2) : x1;
        var id = bulletChart.svgObject.id + '_ComparativeMeasure_' + k;
        var className = bulletChart.svgObject.id + '_ComparativeMeasure';
        if (targetType === 'Rect') {
            shapeObject = isHorizontal ? this.compareMeasure(x1, y1, y2, k, value) : this.compareVMeasure(y1, y2, x1, k);
            shapeElement = bulletChart.renderer.drawLine(shapeObject);
        }
        else if (targetType === 'Circle') {
            shapeObject = new CircleOption(id, bulletChart.targetColor, { width: 1, color: bulletChart.targetColor || 'black' }, 1, lx, ly, size);
            shapeElement = bulletChart.renderer.drawCircle(shapeObject);
        }
        else {
            var crossDirection = 'M ' + (lx - size) + ' ' + (ly - size) + ' L ' + (lx + size) + ' ' + (ly + size) + ' M ' +
                (lx - size) + ' ' + (ly + size) + ' L ' + (lx + size) + ' ' + (ly - size);
            shapeObject = new PathOption(id, 'transparent', strokeWidth, bulletChart.targetColor, 1, '', crossDirection);
            shapeElement = bulletChart.renderer.drawPath(shapeObject);
        }
        shapeElement.setAttribute('class', className);
        return shapeElement;
    };
    ScaleGroup.prototype.compareMeasure = function (x1, y1, y2, i, value) {
        var bulletChart = this.bulletChart;
        var compareMeasureOptions = {
            'class': bulletChart.svgObject.id + '_ComparativeMeasure',
            'id': bulletChart.svgObject.id + '_ComparativeMeasure_' + i,
            'x1': (value === bulletChart.maximum) ? x1 - (bulletChart.targetWidth / 2) :
                (value === bulletChart.minimum) ? x1 + (bulletChart.targetWidth / 2) : x1,
            'y1': y1,
            'x2': (value === bulletChart.maximum) ? x1 - (bulletChart.targetWidth / 2) :
                (value === bulletChart.minimum) ? x1 + (bulletChart.targetWidth / 2) : x1,
            'y2': y2,
            'stroke-width': bulletChart.targetWidth,
            'stroke': bulletChart.targetColor || 'black'
        };
        return compareMeasureOptions;
    };
    ScaleGroup.prototype.compareVMeasure = function (x1, x2, y1, i) {
        var bulletChart = this.bulletChart;
        var compareMeasureOptions = {
            'class': bulletChart.svgObject.id + '_ComparativeMeasure',
            'id': bulletChart.svgObject.id + '_ComparativeMeasure_' + i,
            'x1': x1,
            'y1': y1,
            'x2': x2,
            'y2': y1,
            'stroke-width': bulletChart.targetWidth,
            'stroke': bulletChart.targetColor || 'black'
        };
        return compareMeasureOptions;
    };
    /**
     * To calculate the bounds on vertical and horizontal orientation changes
     *
     * @param {number} value Value of the scale.
     * @param {string} categoryValue Value of the category.
     * @param {boolean} isHorizontal Boolean value.
     * @returns {IFeatureMeasureType} calculateFeatureMeasureBounds
     */
    ScaleGroup.prototype.calculateFeatureMeasureBounds = function (value, categoryValue, isHorizontal) {
        var bulletChart = this.bulletChart;
        var min = bulletChart.minimum;
        value = (value < min && min <= 0) ? min : value;
        if (value >= min) {
            var pointX = void 0;
            var lastPointX = void 0;
            var width = void 0;
            var loc = isHorizontal ? bulletChart.initialClipRect.x : bulletChart.initialClipRect.y;
            var scaleLength = isHorizontal ? bulletChart.initialClipRect.width : bulletChart.initialClipRect.height;
            var delta = bulletChart.maximum - bulletChart.minimum;
            var valueDiff = bulletChart.maximum - value;
            var orientation_1 = ((!bulletChart.enableRtl) ? 'forward' : 'backward') + this.scaleOrientation.toLowerCase();
            categoryValue = isNullOrUndefined(categoryValue) ? '' : categoryValue;
            var stringLength = measureText(categoryValue.toString(), bulletChart.labelStyle).width;
            switch (orientation_1) {
                case 'forwardhorizontal':
                case 'backwardvertical':
                    pointX = loc + ((min > 0) ? 0 : scaleLength / delta * Math.abs(min));
                    width = scaleLength / (delta / ((min > 0) ? delta - valueDiff : value));
                    if (value < 0) {
                        width = Math.abs(width);
                        pointX -= width;
                    }
                    width = (pointX + width < loc + scaleLength) ? width : loc + scaleLength - pointX;
                    lastPointX = loc - ((orientation_1 === 'forwardhorizontal') ? (stringLength / 2 + 5) :
                        this.labelOffset);
                    break;
                default:
                    pointX = loc + (scaleLength - scaleLength / (delta / (delta - valueDiff)));
                    width = (min > 0) ? scaleLength / (delta / (delta - valueDiff)) : scaleLength / (delta / (value));
                    if (value < 0) {
                        width = Math.abs(width);
                        pointX -= width;
                    }
                    if (pointX < loc) {
                        width = pointX + width - loc;
                        pointX = loc;
                    }
                    lastPointX = loc + scaleLength + ((orientation_1 === 'backwardhorizontal') ? (stringLength / 2 +
                        5) : 5);
                    break;
            }
            return { pointX: pointX, width: width, lastPointX: lastPointX };
        }
        return null;
    };
    /**
     * Animates the feature bar.
     *
     * @returns {void}
     */
    ScaleGroup.prototype.doValueBarAnimation = function () {
        var valueBarElement = this.feature;
        if (!valueBarElement) {
            return null;
        }
        var animateOption = this.bulletChart.animation;
        var animateDuration = this.bulletChart.animateSeries ? this.bulletChart.animation.duration : animateOption.duration;
        var effectType = getAnimationFunction('Linear');
        var isValuePlot = this.bulletChart.dataSource < 0;
        var valueX;
        var valueY;
        var elementBarHeight = valueBarElement.getBoundingClientRect().height;
        var elementBarWidth = valueBarElement.getBoundingClientRect().width;
        var centerX;
        var centerY;
        var valueActual;
        if (this.bulletChart.orientation === 'Horizontal' && valueBarElement) {
            valueY = parseInt(valueBarElement.getAttribute('height'), 10);
            valueX = parseInt(valueBarElement.getAttribute('x'), 10);
            centerY = isValuePlot ? valueY : valueY + elementBarHeight;
            centerX = valueX;
        }
        valueBarElement.style.visibility = 'hidden';
        new Animation({}).animate(valueBarElement, {
            duration: animateDuration,
            delay: animateOption.delay,
            progress: function (args) {
                if (args.timeStamp >= args.delay) {
                    valueBarElement.style.visibility = 'visible';
                    elementBarWidth = elementBarWidth ? elementBarWidth : 1;
                    valueActual = effectType(args.timeStamp - args.delay, 0, elementBarWidth, args.duration);
                    valueBarElement.setAttribute('transform', 'translate(' + centerX + ' ' + centerY +
                        ') scale(' + (valueActual / elementBarWidth) + ', 1) translate(' + (-centerX) + ' ' + (-centerY) + ')');
                }
            },
            end: function () {
                valueBarElement.setAttribute('transform', 'translate(0,0)');
                valueBarElement.style.visibility = 'visible';
            }
        });
    };
    /**
     * Animates the comparative bar.
     *
     * @param {number} index Defines the feature bar to animate.
     * @returns {void}
     */
    ScaleGroup.prototype.doTargetBarAnimation = function (index) {
        var x;
        var y;
        var centerX;
        var centerY;
        var targetBarelement = this.comparative[index];
        if (!targetBarelement) {
            return null;
        }
        if (this.bulletChart.orientation === 'Horizontal' && targetBarelement) {
            y = parseFloat(targetBarelement.getAttribute('y1')) + parseFloat(targetBarelement.getAttribute('y2'));
            x = parseFloat(targetBarelement.getAttribute('x1'));
            centerY = y;
            centerX = x;
        }
        targetBarelement.style.visibility = 'hidden';
        this.animateRect(targetBarelement, centerX, centerY, index + 1);
    };
    ScaleGroup.prototype.animateRect = function (targetBarelement, centerX, centerY, index) {
        var _this = this;
        var effect = getAnimationFunction('Linear');
        var value;
        var option = this.bulletChart.animation;
        var threshold = this.comparative.length;
        var duration = this.bulletChart.animateSeries ? this.bulletChart.animation.duration : option.duration;
        new Animation({}).animate(targetBarelement, {
            duration: duration,
            delay: option.delay,
            progress: function (args) {
                if (args.timeStamp >= args.delay) {
                    targetBarelement.style.visibility = 'visible';
                    value = effect(args.timeStamp - args.delay, 0, 1, args.duration);
                    targetBarelement.setAttribute('transform', 'translate(' + centerX + ' ' + centerY / 2 +
                        ') scale(1,' + (value) + ') translate(' + (-centerX) + ' ' + (-centerY / 2) + ')');
                }
            },
            end: function () {
                targetBarelement.setAttribute('transform', 'translate(0,0)');
                if (index < threshold) {
                    _this.doTargetBarAnimation(index + 1);
                }
            }
        });
    };
    return ScaleGroup;
}());
export { ScaleGroup };
