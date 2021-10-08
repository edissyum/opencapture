import { measureText } from '../../smithchart/utils/helper';
import { HorizontalLabelCollection, LabelRegion, Point, Direction } from '../../smithchart/utils/utils';
import { GridArcPoints, RadialLabelCollections } from '../../smithchart/utils/utils';
import { PathOption, TextOption, renderTextElement, _getEpsilonValue } from '../../smithchart/utils/helper';
import { axisLabelRender } from '../model/constant';
var AxisRender = /** @class */ (function () {
    function AxisRender() {
        this.radialLabels = [-50, -20, -10, -5, -4, -3, -2, -1.5, -1, -0.8, -0.6, -0.4, -0.2,
            0, 0.2, 0.4, 0.6, 0.8, 1, 1.5, 2, 3, 4, 5, 10, 20, 50];
        this.radialLabelCollections = [];
        this.horizontalLabelCollections = [];
        this.labelCollections = [];
        this.direction = new Direction();
    }
    AxisRender.prototype.renderArea = function (smithchart, bounds) {
        this.calculateChartArea(smithchart, bounds);
        this.calculateCircleMargin(smithchart, bounds);
        this.calculateXAxisRange(smithchart);
        this.calculateRAxisRange(smithchart);
        this.measureHorizontalAxis(smithchart);
        this.measureRadialAxis(smithchart);
        if (smithchart.horizontalAxis.visible) {
            this.updateHAxis(smithchart);
        }
        if (smithchart.radialAxis.visible) {
            this.updateRAxis(smithchart);
        }
        if (smithchart.horizontalAxis.visible) {
            this.drawHAxisLabels(smithchart);
        }
        if (smithchart.radialAxis.visible) {
            this.drawRAxisLabels(smithchart);
        }
    };
    AxisRender.prototype.updateHAxis = function (smithchart) {
        var majorGridLines = smithchart.horizontalAxis.majorGridLines;
        var minorGridLines = smithchart.horizontalAxis.minorGridLines;
        var axisLine = smithchart.horizontalAxis.axisLine;
        if (majorGridLines.visible) {
            this.updateHMajorGridLines(smithchart);
        }
        if (minorGridLines.visible) {
            this.updateHMinorGridLines(smithchart);
        }
        if (axisLine.visible) {
            this.updateHAxisLine(smithchart);
        }
    };
    AxisRender.prototype.updateRAxis = function (smithchart) {
        var majorGridLines = smithchart.radialAxis.majorGridLines;
        var minorGridLines = smithchart.radialAxis.minorGridLines;
        var axisLine = smithchart.radialAxis.axisLine;
        if (majorGridLines.visible) {
            this.updateRMajorGridLines(smithchart);
        }
        if (minorGridLines.visible) {
            this.updateRMinorGridLines(smithchart);
        }
        if (axisLine.visible) {
            this.updateRAxisLine(smithchart);
        }
    };
    AxisRender.prototype.measureHorizontalAxis = function (smithchart) {
        var minorGridLines = smithchart.horizontalAxis.minorGridLines;
        this.measureHMajorGridLines(smithchart);
        if (minorGridLines.visible) {
            this.measureHMinorGridLines(smithchart);
        }
    };
    AxisRender.prototype.measureRadialAxis = function (smithchart) {
        var minorGridLines = smithchart.radialAxis.minorGridLines;
        this.measureRMajorGridLines(smithchart);
        if (minorGridLines.visible) {
            this.measureRMinorGridLines(smithchart);
        }
    };
    AxisRender.prototype.calculateChartArea = function (smithchart, bounds) {
        var width = smithchart.availableSize.width;
        var height = smithchart.availableSize.height;
        width = bounds.width;
        height = bounds.height;
        var chartAreaWidth = Math.min(width, height);
        var chartAreaHeight = Math.min(width, height);
        var x = bounds.x + (bounds.width / 2 - chartAreaWidth / 2);
        var y = bounds.y + ((height - chartAreaHeight) / 2 > 0 ? (height - chartAreaHeight) / 2 : 0);
        smithchart.chartArea = { x: x, y: y, width: chartAreaWidth, height: chartAreaHeight };
    };
    AxisRender.prototype.calculateCircleMargin = function (smithchart, bounds) {
        var padding = 10;
        var maxLabelWidth = 0;
        var width = smithchart.chartArea.width;
        var radius = smithchart.radius;
        maxLabelWidth = this.maximumLabelLength(smithchart);
        var labelMargin = (smithchart.radialAxis.labelPosition === 'Outside') ? (maxLabelWidth + padding) : padding;
        var diameter = width - labelMargin * 2 > 0 ? width - labelMargin * 2 : 0;
        var actualRadius = diameter / 2;
        var circleCoefficient = radius > 1 ? 1 : (radius < 0.1 ? 0.1 : radius);
        this.areaRadius = actualRadius * circleCoefficient;
        this.circleLeftX = smithchart.chartArea.x + labelMargin + (actualRadius * (1 - circleCoefficient));
        this.circleTopY = smithchart.chartArea.y + labelMargin + (actualRadius * (1 - circleCoefficient));
        this.circleCenterX = this.circleLeftX + this.areaRadius;
        this.circleCenterY = bounds.y + bounds.height / 2;
    };
    AxisRender.prototype.maximumLabelLength = function (smithchart) {
        var maximumLabelLength = 0;
        var font = smithchart.horizontalAxis.labelStyle;
        var label;
        var textSize;
        for (var i = 0; i < this.radialLabels.length; i++) {
            label = this.radialLabels[i].toString();
            textSize = measureText(label, font);
            if (maximumLabelLength < textSize.width) {
                maximumLabelLength = textSize.width;
            }
        }
        return maximumLabelLength;
    };
    AxisRender.prototype.calculateAxisLabels = function () {
        var spacingBetweenGridLines = 30;
        var previousR = 0;
        var j = 0;
        var labels = [];
        var diameter = this.areaRadius * 2;
        for (var i = 0; i < 2; i = i + 0.1) {
            i = Math.round(i * 10) / 10;
            var coeff = 1 / (i + 1);
            var isOverlap1 = false;
            var isOverlap2 = false;
            var radius = ((diameter * coeff) / 2) * 2;
            if (previousR === 0.0 || i === 1) {
                previousR = radius;
                labels[j] = i;
                j++;
                continue;
            }
            if (i < 1) {
                isOverlap1 = this.isOverlap(1, diameter, radius, spacingBetweenGridLines);
            }
            if (i > 1) {
                isOverlap2 = this.isOverlap(2, diameter, radius, spacingBetweenGridLines);
            }
            if (isOverlap1 || isOverlap2) {
                continue;
            }
            if (previousR - radius >= spacingBetweenGridLines) {
                labels[j] = i;
                j++;
                previousR = radius;
            }
        }
        var staticlabels = [2, 3, 4, 5, 10, 20, 50];
        for (var k = 0; k < staticlabels.length; k++) {
            labels[j] = staticlabels[k];
            j++;
        }
        return labels;
    };
    AxisRender.prototype.isOverlap = function (x, d, previousR, spacingBetweenGridLines) {
        var coeff = 1 / (x + 1); // (1 / 1+r) find the radius for the x value
        var radius = ((d * coeff) / 2) * 2;
        return previousR - radius < spacingBetweenGridLines;
    };
    AxisRender.prototype.calculateXAxisRange = function (smithchart) {
        var x;
        var coeff;
        var radius;
        var cx;
        var diameter = this.areaRadius * 2;
        var horizontalAxisLabels = this.calculateAxisLabels();
        var cy = this.circleCenterY;
        var circleStartX = this.circleLeftX;
        var leftX = this.circleLeftX;
        for (var i = 0; i < horizontalAxisLabels.length; i++) {
            x = horizontalAxisLabels[i];
            coeff = 1 / (x + 1);
            radius = (diameter * coeff) / 2;
            if (smithchart.renderType === 'Impedance') {
                leftX = circleStartX + diameter - (radius * 2);
            }
            cx = leftX + radius;
            this.horizontalLabelCollections.push({
                centerX: cx, centerY: cy, radius: radius, value: x, region: null
            });
        }
    };
    AxisRender.prototype.calculateRAxisRange = function (smithchart) {
        var arcCy;
        var arcRadius;
        var diameter = this.areaRadius * 2;
        var y;
        var point = new Point();
        if (smithchart.renderType === 'Impedance') {
            point.x = this.circleLeftX + diameter;
            point.y = this.circleTopY + this.areaRadius;
        }
        else {
            point.x = this.circleLeftX;
            point.y = this.circleTopY + this.areaRadius;
        }
        for (var i = 0; i < this.radialLabels.length; i++) {
            y = this.radialLabels[i];
            arcRadius = Math.abs(((1 / y) * diameter) / 2);
            if (smithchart.renderType === 'Impedance') {
                arcCy = y > 0 ? point.y - arcRadius : point.y + arcRadius;
            }
            else {
                arcCy = y < 0 ? point.y - arcRadius : point.y + arcRadius;
            }
            this.radialLabelCollections.push({
                centerX: point.x, centerY: arcCy, radius: arcRadius, value: y
            });
        }
    };
    AxisRender.prototype.measureHMajorGridLines = function (smithchart) {
        var arcPoints = [];
        var startPoint;
        var endPoint;
        var radialPoint1;
        var radialPoint2;
        var size;
        this.majorHGridArcPoints = [];
        for (var i = 0; i < this.horizontalLabelCollections.length; i++) {
            var circlePoint = new HorizontalLabelCollection();
            circlePoint = this.horizontalLabelCollections[i];
            arcPoints = this.calculateHMajorArcStartEndPoints(circlePoint.value);
            if (smithchart.renderType === 'Impedance') {
                radialPoint1 = arcPoints[0];
                radialPoint2 = arcPoints[1];
            }
            else {
                radialPoint1 = arcPoints[1];
                radialPoint2 = arcPoints[0];
            }
            size = { width: circlePoint.radius, height: circlePoint.radius };
            if (circlePoint.value !== 0.0 && circlePoint.value !== 50.0) {
                startPoint = this.intersectingCirclePoints(radialPoint1[0].centerX, radialPoint1[0].centerY, radialPoint1[0].radius, circlePoint.centerX, circlePoint.centerY, circlePoint.radius, smithchart.renderType);
                endPoint = this.intersectingCirclePoints(radialPoint2[0].centerX, radialPoint2[0].centerY, radialPoint2[0].radius, circlePoint.centerX, circlePoint.centerY, circlePoint.radius, smithchart.renderType);
                this.majorHGridArcPoints.push({
                    startPoint: startPoint,
                    endPoint: endPoint,
                    rotationAngle: 2 * Math.PI,
                    sweepDirection: (smithchart.renderType === 'Impedance') ?
                        this.direction['counterclockwise'] : this.direction['clockwise'],
                    isLargeArc: true,
                    size: size
                });
            }
            else {
                startPoint = { x: circlePoint.centerX + circlePoint.radius, y: circlePoint.centerY };
                endPoint = { x: circlePoint.centerX + circlePoint.radius, y: circlePoint.centerY - 0.05 };
                this.majorHGridArcPoints.push({
                    startPoint: startPoint,
                    endPoint: endPoint,
                    rotationAngle: 2 * Math.PI,
                    sweepDirection: this.direction['clockwise'],
                    isLargeArc: true,
                    size: size
                });
            }
        }
    };
    AxisRender.prototype.measureRMajorGridLines = function (smithchart) {
        var radialPoint;
        var y;
        var arcPoints = [];
        var innerInterSectPoint;
        var outerInterSectPoint;
        var outterInterSectRadian;
        var outterInterSectAngle;
        var startPoint;
        var endPoint;
        var size;
        var sweepDirection;
        this.majorRGridArcPoints = [];
        this.labelCollections = [];
        var epsilon = _getEpsilonValue();
        for (var i = 0; i < this.radialLabelCollections.length; i++) {
            radialPoint = this.radialLabelCollections[i];
            if (radialPoint.radius <= epsilon) {
                continue;
            }
            y = radialPoint.value;
            arcPoints = this.calculateMajorArcStartEndPoints(radialPoint, Math.abs(y), smithchart);
            innerInterSectPoint = arcPoints[0];
            outerInterSectPoint = arcPoints[1];
            outterInterSectRadian = this.circleXYRadianValue(this.circleCenterX, this.circleCenterY, outerInterSectPoint.x, outerInterSectPoint.y);
            outterInterSectAngle = outterInterSectRadian * (180 / Math.PI);
            if (y !== 0.0) {
                startPoint = { x: innerInterSectPoint.x, y: innerInterSectPoint.y };
                endPoint = { x: outerInterSectPoint.x, y: outerInterSectPoint.y };
                size = { width: radialPoint.radius, height: radialPoint.radius };
                sweepDirection = y > 0 ? this.direction['clockwise'] : this.direction['counterclockwise'];
                this.majorRGridArcPoints.push({
                    startPoint: startPoint,
                    endPoint: endPoint,
                    size: size,
                    rotationAngle: 2 * Math.PI,
                    isLargeArc: false,
                    sweepDirection: sweepDirection
                });
                this.labelCollections.push({
                    centerX: outerInterSectPoint.x,
                    centerY: outerInterSectPoint.y,
                    angle: outterInterSectAngle,
                    value: y,
                    radius: this.areaRadius,
                    region: null
                });
            }
            else {
                startPoint = { x: this.circleLeftX, y: this.circleCenterY };
                endPoint = { x: this.circleCenterX + this.areaRadius, y: this.circleCenterY };
                this.majorRGridArcPoints.push({
                    startPoint: startPoint,
                    endPoint: endPoint,
                    size: null,
                    rotationAngle: null,
                    isLargeArc: null,
                    sweepDirection: null
                });
                this.labelCollections.push({
                    centerX: (smithchart.renderType === 'Impedance') ?
                        (this.circleCenterX - this.areaRadius) : (this.circleCenterX + this.areaRadius),
                    centerY: this.circleCenterY,
                    angle: (smithchart.renderType === 'Impedance') ?
                        180 : 360,
                    value: y,
                    radius: this.areaRadius,
                    region: null
                });
            }
        }
    };
    AxisRender.prototype.circleXYRadianValue = function (centerX, centerY, outterX, outterY) {
        var radian;
        radian = Math.atan2(outterY - centerY, outterX - centerX);
        radian = radian < 0 ? (radian + (360 * Math.PI / 180)) : radian;
        return radian;
    };
    AxisRender.prototype.calculateMajorArcStartEndPoints = function (radialPoint, value, smithchart) {
        var arcPoints = [];
        var circlePoint = [];
        var cx = this.circleCenterX;
        var cy = this.circleCenterY;
        if (value >= 10) {
            arcPoints[0] = (smithchart.renderType === 'Impedance') ?
                { x: cx + this.areaRadius, y: cy } : { x: cx - this.areaRadius, y: cy };
        }
        else if (value >= 3) {
            circlePoint = this.horizontalLabelCollections.filter(function (c) { return c.value === 10; });
        }
        else if (value >= 1) {
            circlePoint = this.horizontalLabelCollections.filter(function (c) { return c.value === 5; });
        }
        else {
            circlePoint = this.horizontalLabelCollections.filter(function (c) { return c.value === 3; });
        }
        if (circlePoint.length > 0) {
            arcPoints[0] = this.intersectingCirclePoints(radialPoint.centerX, radialPoint.centerY, radialPoint.radius, circlePoint[0].centerX, circlePoint[0].centerY, circlePoint[0].radius, smithchart.renderType);
        }
        arcPoints[1] = this.intersectingCirclePoints(radialPoint.centerX, radialPoint.centerY, radialPoint.radius, cx, cy, this.areaRadius, smithchart.renderType);
        return arcPoints;
    };
    AxisRender.prototype.calculateHMajorArcStartEndPoints = function (value) {
        var arcHPoints = [];
        var calValue1;
        var calValue2;
        if (value <= 0.3) {
            calValue1 = 2.0;
            calValue2 = -2.0;
        }
        else if (value <= 1.0) {
            calValue1 = 3.0;
            calValue2 = -3.0;
        }
        else if (value <= 2.0) {
            calValue1 = 5.0;
            calValue2 = -5.0;
        }
        else if (value <= 5.0) {
            calValue1 = 10.0;
            calValue2 = -10.0;
        }
        else {
            calValue1 = 50.0;
            calValue2 = -50.0;
        }
        arcHPoints[0] = this.radialLabelCollections.filter(function (c) { return c.value === calValue1; });
        arcHPoints[1] = this.radialLabelCollections.filter(function (c) { return c.value === calValue2; });
        return arcHPoints;
    };
    AxisRender.prototype.calculateMinorArcStartEndPoints = function (value) {
        var calValue1;
        var calValue2;
        var marcHPoints = [];
        if (value <= 0.1) {
            calValue1 = 1.0;
            calValue2 = -1.0;
        }
        else if (value <= 0.2) {
            calValue1 = 0.8;
            calValue2 = -0.8;
        }
        else if (value <= 0.3) {
            calValue1 = 0.4;
            calValue2 = -0.4;
        }
        else if (value <= 0.6) {
            calValue1 = 1.0;
            calValue2 = -1.0;
        }
        else if (value <= 1.0) {
            calValue1 = 1.5;
            calValue2 = -1.5;
        }
        else if (value <= 1.5) {
            calValue1 = 2.0;
            calValue2 = -2.0;
        }
        else if (value <= 2.0) {
            calValue1 = 1.0;
            calValue2 = -1.0;
        }
        else if (value <= 5.0) {
            calValue1 = 3.0;
            calValue2 = -3.0;
        }
        else {
            calValue1 = 10.0;
            calValue2 = -10.0;
        }
        marcHPoints[0] = this.radialLabelCollections.filter(function (c) { return c['value'] === calValue1; });
        marcHPoints[1] = this.radialLabelCollections.filter(function (c) { return c['value'] === calValue2; });
        return marcHPoints;
    };
    AxisRender.prototype.intersectingCirclePoints = function (x1, y1, r1, x2, y2, r2, renderType) {
        var point = { x: 0, y: 0 };
        var cx = x1 - x2;
        var cy = y1 - y2;
        var midRadius = Math.sqrt(cx * cx + cy * cy);
        var radiusSquare = midRadius * midRadius;
        var a = (r1 * r1 - r2 * r2) / (2 * radiusSquare);
        var radiusSquare2 = (r1 * r1 - r2 * r2);
        var c = Math.sqrt(2 * (r1 * r1 + r2 * r2) / radiusSquare - (radiusSquare2 * radiusSquare2) / (radiusSquare * radiusSquare) - 1);
        var fx = (x1 + x2) / 2 + a * (x2 - x1);
        var gx = c * (y2 - y1) / 2;
        var ix1 = fx + gx;
        var ix2 = fx - gx;
        var fy = (y1 + y2) / 2 + a * (y2 - y1);
        var gy = c * (x1 - x2) / 2;
        var iy1 = fy + gy;
        var iy2 = fy - gy;
        if (renderType === 'Impedance') {
            if (ix2 < ix1) {
                point.x = ix2;
                point.y = iy2;
            }
            else {
                point.x = ix1;
                point.y = iy1;
            }
        }
        else {
            if (ix1 > ix2) {
                point.x = ix1;
                point.y = iy1;
            }
            else {
                point.x = ix2;
                point.y = iy2;
            }
        }
        return { x: point.x, y: point.y };
    };
    AxisRender.prototype.updateHMajorGridLines = function (smithchart) {
        var majorGridLine = smithchart.horizontalAxis.majorGridLines;
        var groupElement = smithchart.renderer.createGroup({ 'id': smithchart.element.id + '_svg' + '_horizontalAxisMajorGridLines' });
        var path = this.calculateGridLinesPath(this.majorHGridArcPoints);
        var haxismgoptions = new PathOption(smithchart.element.id + '_horizontalAxisMajorGridLines', 'none', majorGridLine['width'], majorGridLine.color ? majorGridLine.color : smithchart.themeStyle.majorGridLine, majorGridLine['opacity'], majorGridLine['dashArray'], path);
        var element = smithchart.renderer.drawPath(haxismgoptions);
        groupElement.appendChild(element);
        smithchart.svgObject.appendChild(groupElement);
    };
    AxisRender.prototype.updateRMajorGridLines = function (smithchart) {
        var majorGridLine = smithchart.radialAxis.majorGridLines;
        var groupElement = smithchart.renderer.createGroup({ 'id': smithchart.element.id + '_svg' + '_radialAxisMajorGridLines' });
        var path = this.calculateGridLinesPath(this.majorRGridArcPoints);
        var raxismgoptions = new PathOption(smithchart.element.id + '_radialAxisMajorGridLines', 'none', majorGridLine['width'], majorGridLine.color ? majorGridLine.color : smithchart.themeStyle.majorGridLine, majorGridLine['opacity'], majorGridLine['dashArray'], path);
        var element = smithchart.renderer.drawPath(raxismgoptions);
        groupElement.appendChild(element);
        smithchart.svgObject.appendChild(groupElement);
    };
    AxisRender.prototype.updateHAxisLine = function (smithchart) {
        var radius = this.areaRadius;
        var axisLine = smithchart.horizontalAxis.axisLine;
        var groupElement = smithchart.renderer.createGroup({ 'id': smithchart.element.id + '_svg' + '_hAxisLine' });
        var point1 = { x: this.circleCenterX + radius, y: this.circleCenterY };
        var point2 = { x: this.circleCenterX + radius, y: (this.circleCenterY - 0.05) };
        var size = { width: radius, height: radius };
        var sweep = this.direction['clockwise'];
        var isLargeArc = 1;
        var angle = Math.PI * 2;
        var direction = 'M' + '' + point1.x + ' ' + point1.y + ' ' + 'A' + ' ' + size.width +
            ' ' + size.height + ' ' + angle + ' ' + isLargeArc + ' ' + sweep + ' ' + point2.x + ' ' + point2.y + '';
        var options = new PathOption(smithchart.element.id + '_horizontalAxisLine', 'none', axisLine.width, axisLine.color ? axisLine.color : smithchart.themeStyle.axisLine, 1, axisLine.dashArray, direction);
        var element = smithchart.renderer.drawPath(options);
        groupElement.appendChild(element);
        smithchart.svgObject.appendChild(groupElement);
    };
    AxisRender.prototype.updateRAxisLine = function (smithchart) {
        var radius = this.areaRadius;
        var axisLine = smithchart.radialAxis.axisLine;
        var point1 = { x: this.circleCenterX - radius, y: this.circleCenterY };
        var point2 = { x: this.circleCenterX + radius, y: this.circleCenterY };
        var size = { width: 0, height: 0 };
        var sweep = this.direction['counterclockwise'];
        var isLargeArc = 0;
        var angle = 0;
        var direction = 'M' + ' ' + point1.x + ' ' + point1.y + ' ' + 'A' + ' ' +
            size.width + ' ' + size.height + ' ' + angle + ' ' + isLargeArc + ' ' + sweep + ' ' +
            point2.x + ' ' + point2.y + '';
        var options = new PathOption(smithchart.element.id + '_radialAxisLine', 'none', axisLine.width, axisLine.color ? axisLine.color : smithchart.themeStyle.axisLine, 1, axisLine.dashArray, direction);
        var groupElement = smithchart.renderer.createGroup({ 'id': smithchart.element.id + '_svg' + '_rAxisLine' });
        var element = smithchart.renderer.drawPath(options);
        groupElement.appendChild(element);
        smithchart.svgObject.appendChild(groupElement);
    };
    AxisRender.prototype.drawHAxisLabels = function (smithchart) {
        var hAxis = smithchart.horizontalAxis;
        smithchart.radialAxis.labelStyle.fontFamily = smithchart.themeStyle.fontFamily || smithchart.radialAxis.labelStyle.fontFamily;
        var font = smithchart.horizontalAxis.labelStyle;
        var circleAxis;
        var label;
        var x;
        var y;
        var textSize;
        var curLabel;
        var curLabelBounds;
        var curWidth;
        var curX;
        var preLabel;
        var preLabelBounds;
        var preWidth;
        var preX;
        var groupEle = smithchart.renderer.createGroup({ id: smithchart.element.id + '_HAxisLabels' });
        var _loop_1 = function (i) {
            circleAxis = this_1.horizontalLabelCollections[i];
            label = this_1.horizontalLabelCollections[i].value.toString();
            if (circleAxis.value !== 0.0) {
                x = (smithchart.renderType === 'Impedance') ?
                    circleAxis.centerX - circleAxis.radius : circleAxis.centerX + circleAxis.radius;
                y = circleAxis.centerY;
                textSize = measureText(label, font);
                x = (smithchart.renderType === 'Impedance') ? x - textSize.width : x;
                if (hAxis.labelPosition === 'Outside') {
                    y -= textSize.height / 4;
                }
                else {
                    y += textSize.height;
                }
                this_1.horizontalLabelCollections[i].region = this_1.calculateRegion(label, textSize, x, y);
                if (hAxis.labelIntersectAction === 'Hide') {
                    curLabel = this_1.horizontalLabelCollections[i];
                    curLabelBounds = curLabel.region.bounds;
                    curWidth = curLabelBounds.width;
                    curX = curLabelBounds.x;
                    for (var j = 1; j < i; j++) {
                        preLabel = this_1.horizontalLabelCollections[j];
                        preLabelBounds = preLabel.region.bounds;
                        preWidth = preLabelBounds.width;
                        preX = preLabelBounds.x;
                        if ((smithchart.renderType === 'Impedance') &&
                            (preX + preWidth) > (curX)) {
                            label = '';
                        }
                        if ((smithchart.renderType === 'Admittance') &&
                            (preX) < curX + curWidth) {
                            label = '';
                        }
                    }
                }
                var axisLabelRenderEventArgs_1 = {
                    text: label.toString(),
                    x: x,
                    y: y,
                    name: axisLabelRender,
                    cancel: false
                };
                var axisLabelRenderSuccess = function (args) {
                    if (!args.cancel) {
                        var options = new TextOption(smithchart.element.id + '_HLabel_' + i, axisLabelRenderEventArgs_1.x, axisLabelRenderEventArgs_1.y, 'none', axisLabelRenderEventArgs_1.text);
                        var color = font.color ? font.color : smithchart.themeStyle.axisLabel;
                        font.fontFamily = font.fontFamily || smithchart.themeStyle.labelFontFamily;
                        var element = renderTextElement(options, font, color, groupEle);
                        groupEle.appendChild(element);
                    }
                };
                axisLabelRenderSuccess.bind(this_1);
                smithchart.trigger(axisLabelRender, axisLabelRenderEventArgs_1, axisLabelRenderSuccess);
            }
        };
        var this_1 = this;
        for (var i = 0; i < this.horizontalLabelCollections.length; i++) {
            _loop_1(i);
        }
        smithchart.svgObject.appendChild(groupEle);
    };
    AxisRender.prototype.drawRAxisLabels = function (smithchart) {
        var paddingRadius = 2;
        smithchart.radialAxis.labelStyle.fontFamily = smithchart.themeStyle.fontFamily || smithchart.radialAxis.labelStyle.fontFamily;
        var font = smithchart.radialAxis.labelStyle;
        var interSectPoint = new RadialLabelCollections();
        var label;
        var textSize;
        var angle;
        var position;
        var textPosition;
        var curX;
        var curY;
        var curWidth;
        var curHeight;
        var curLabel;
        var curLabelBounds;
        var preX;
        var preY;
        var preWidth;
        var preHeight;
        var preLabel;
        var preLabelBounds;
        var rAxis = smithchart.radialAxis;
        var groupEle = smithchart.renderer.createGroup({ id: smithchart.element.id + '_RAxisLabels' });
        var _loop_2 = function (i) {
            interSectPoint = this_2.labelCollections[i];
            label = interSectPoint.value.toString();
            textSize = measureText(label, font);
            angle = Math.round(interSectPoint.angle * 100) / 100;
            if (rAxis.labelPosition === 'Outside') {
                position = this_2.circlePointPosition(this_2.circleCenterX, this_2.circleCenterY, interSectPoint['angle'], this_2.areaRadius + paddingRadius);
                textPosition = this_2.setLabelsOutsidePosition(angle, position.x, position.y, textSize);
            }
            else {
                position = this_2.circlePointPosition(this_2.circleCenterX, this_2.circleCenterY, interSectPoint['angle'], this_2.areaRadius - paddingRadius);
                textPosition = this_2.setLabelsInsidePosition(angle, position.x, position.y, textSize);
            }
            this_2.labelCollections[i]['region'] = this_2.calculateRegion(label, textSize, textPosition.x, textPosition.y);
            if (rAxis.labelIntersectAction === 'Hide') {
                curLabel = this_2.labelCollections[i];
                curLabelBounds = curLabel['region']['bounds'];
                curWidth = curLabelBounds['width'];
                curHeight = curLabelBounds['height'];
                curX = curLabelBounds['x'];
                curY = curLabelBounds['y'];
                for (var j = 0; j < i; j++) {
                    preLabel = this_2.labelCollections[j];
                    preLabelBounds = preLabel['region']['bounds'];
                    preWidth = preLabelBounds['width'];
                    preHeight = preLabelBounds['height'];
                    preX = preLabelBounds['x'];
                    preY = preLabelBounds['y'];
                    if ((preX <= curX + curWidth) && (curX <= preX + preWidth) && (preY <= curY + curHeight)
                        && (curY <= preY + preHeight)) {
                        label = ' ';
                    }
                }
            }
            var axisLabelRenderEventArgs = {
                text: label.toString(),
                x: textPosition.x,
                y: textPosition.y,
                name: axisLabelRender,
                cancel: false
            };
            var axisLabelRenderSuccess = function (args) {
                if (!args.cancel) {
                    var options = new TextOption(smithchart.element.id + '_RLabel_' + i, axisLabelRenderEventArgs.x, axisLabelRenderEventArgs.y, 'none', axisLabelRenderEventArgs.text);
                    var color = font.color ? font.color : smithchart.themeStyle.axisLabel;
                    font.fontFamily = smithchart.themeStyle.labelFontFamily ? smithchart.themeStyle.labelFontFamily : font.fontFamily;
                    var element = renderTextElement(options, font, color, groupEle);
                    groupEle.appendChild(element);
                }
            };
            axisLabelRenderSuccess.bind(this_2);
            smithchart.trigger(axisLabelRender, axisLabelRenderEventArgs, axisLabelRenderSuccess);
        };
        var this_2 = this;
        for (var i = 0; i < this.labelCollections.length; i++) {
            _loop_2(i);
        }
        smithchart.svgObject.appendChild(groupEle);
    };
    AxisRender.prototype.calculateRegion = function (label, textSize, textPositionX, textPositionY) {
        var xAxisLabelRegions = new LabelRegion();
        var bounds = { x: textPositionX, y: textPositionY, width: textSize.width, height: textSize.height };
        xAxisLabelRegions = { bounds: bounds, labelText: label };
        return xAxisLabelRegions;
    };
    AxisRender.prototype.updateHMinorGridLines = function (smithchart) {
        var minorGridLine = smithchart.horizontalAxis.minorGridLines;
        var groupElement = smithchart.renderer.createGroup({ 'id': smithchart.element.id + '_svg' + '_horizontalAxisMinorGridLines' });
        var path = this.calculateGridLinesPath(this.minorHGridArcPoints);
        var haxismioptions = new PathOption(smithchart.element.id + '_horizontalAxisMinorGridLines', 'none', minorGridLine['width'], minorGridLine.color ? minorGridLine.color : smithchart.themeStyle.minorGridLine, minorGridLine['opacity'], minorGridLine['dashArray'], path);
        var element = smithchart.renderer.drawPath(haxismioptions);
        groupElement.appendChild(element);
        smithchart.svgObject.appendChild(groupElement);
    };
    AxisRender.prototype.updateRMinorGridLines = function (smithchart) {
        var minorGridLine = smithchart.radialAxis.minorGridLines;
        var groupElement = smithchart.renderer.createGroup({ 'id': smithchart.element.id + '_svg' + '_radialAxisMinorGridLines' });
        var path = this.calculateGridLinesPath(this.minorGridArcPoints);
        var raxismioptions = new PathOption(smithchart.element.id + '_radialAxisMinorGridLines', 'none', minorGridLine['width'], minorGridLine.color ? minorGridLine.color : smithchart.themeStyle.minorGridLine, minorGridLine['opacity'], minorGridLine['dashArray'], path);
        var element = smithchart.renderer.drawPath(raxismioptions);
        groupElement.appendChild(element);
        smithchart.svgObject.appendChild(groupElement);
    };
    AxisRender.prototype.calculateGridLinesPath = function (points) {
        var x1;
        var y1;
        var x2;
        var y2;
        var r1;
        var r2;
        var pathSegment = new GridArcPoints();
        var angle;
        var isLargeArc;
        var sweep;
        var sb = '';
        for (var i = 0; i < points.length; i++) {
            pathSegment = points[i];
            x1 = pathSegment.startPoint.x;
            y1 = pathSegment.startPoint.y;
            x2 = pathSegment.endPoint.x;
            y2 = pathSegment.endPoint.y;
            r1 = pathSegment.size ? pathSegment.size.width : 0;
            r2 = pathSegment.size ? pathSegment.size.height : 0;
            angle = pathSegment.rotationAngle ? pathSegment.rotationAngle : 0;
            isLargeArc = pathSegment.isLargeArc ? 1 : 0;
            sweep = pathSegment.sweepDirection ? pathSegment.sweepDirection : 0;
            sb = sb + ('M' + ' ' + x1 + ' ' + y1 + ' ' + 'A' + ' ' + r1 + ' ' + r2 + ' ' +
                angle + ' ' + isLargeArc + ' ' + sweep + ' ' + x2 + ' ' + y2 + ' ');
        }
        var path = sb.toString();
        return path;
    };
    AxisRender.prototype.measureHMinorGridLines = function (smithchart) {
        var radialPoint1;
        var radialPoint2;
        var arcPoints = [];
        var isLargeArc;
        var startPoint;
        var endPoint;
        var size;
        var cx;
        var maxCount = smithchart.horizontalAxis.minorGridLines.count;
        var previous;
        var next;
        var space;
        var count;
        var interval;
        var radius;
        var leftX;
        this.minorHGridArcPoints = [];
        var diameter = this.areaRadius * 2;
        for (var i = 0; i < this.horizontalLabelCollections.length - 3; i++) {
            previous = this.horizontalLabelCollections[i];
            next = this.horizontalLabelCollections[i + 1];
            space = (previous['radius'] - next['radius']) * 2;
            count = Math.floor((maxCount / 100) * space);
            interval = space / count;
            for (var j = 0; j < count; j++) {
                radius = next['radius'] + (j * interval) / 2;
                leftX = (smithchart.renderType === 'Impedance') ?
                    (this.circleLeftX + diameter) - (radius * 2) : this.circleLeftX;
                cx = leftX + radius;
                isLargeArc = next['value'] > 5;
                arcPoints = this.calculateMinorArcStartEndPoints(next['value']);
                if (smithchart.renderType === 'Impedance') {
                    radialPoint1 = arcPoints[0];
                    radialPoint2 = arcPoints[1];
                }
                else {
                    radialPoint1 = arcPoints[1];
                    radialPoint2 = arcPoints[0];
                }
                startPoint = this.intersectingCirclePoints(radialPoint1[0].centerX, radialPoint1[0].centerY, radialPoint1[0].radius, cx, previous['centerY'], radius, smithchart.renderType);
                endPoint = this.intersectingCirclePoints(radialPoint2[0].centerX, radialPoint2[0].centerY, radialPoint2[0].radius, cx, previous['centerY'], radius, smithchart.renderType);
                size = { width: radius, height: radius };
                this.minorHGridArcPoints.push({
                    startPoint: startPoint,
                    endPoint: endPoint,
                    rotationAngle: 2 * Math.PI,
                    sweepDirection: (smithchart.renderType === 'Impedance') ?
                        this.direction['counterclockwise'] : this.direction['clockwise'],
                    isLargeArc: isLargeArc,
                    size: size
                });
            }
        }
    };
    AxisRender.prototype.measureRMinorGridLines = function (smithchart) {
        var maxCount = smithchart.radialAxis.minorGridLines.count;
        var arcCx;
        var nextAngle;
        var k = 0;
        var betweenAngle;
        var circlePoint;
        var previous;
        var next;
        var size;
        var distance;
        var count;
        var interval;
        var centerValue;
        var circumference = Math.PI * (this.areaRadius * 2);
        var arcStartX = arcCx = (smithchart.renderType === 'Impedance') ?
            this.circleCenterX + this.areaRadius : this.circleCenterX - this.areaRadius;
        var arcStartY = this.circleCenterY;
        this.minorGridArcPoints = [];
        var arcStartPoint = { x: arcStartX, y: arcStartY };
        for (var i = 2; i < this.labelCollections.length - 3; i++) {
            previous = this.labelCollections[i];
            next = this.labelCollections[i + 1];
            if (smithchart.renderType === 'Impedance') {
                nextAngle = next['angle'] === 360 ? 0 : next['angle'];
                betweenAngle = Math.abs(nextAngle - previous['angle']);
            }
            else {
                nextAngle = previous['angle'] === 360 ? 0 : previous['angle'];
                betweenAngle = Math.abs(nextAngle - next['angle']);
            }
            distance = (circumference / 360) * betweenAngle;
            count = Math.floor((maxCount / 100) * distance);
            interval = betweenAngle / count;
            centerValue = next['value'] > 0 ? next['value'] : previous['value'];
            circlePoint = this.minorGridLineArcIntersectCircle(Math.abs(centerValue));
            for (var j = 1; j < count; j++) {
                var outterInterSectAngle = (interval * j) + (previous['angle'] === 360 ? nextAngle : previous['angle']);
                var outerInterSectPoint = this.circlePointPosition(this.circleCenterX, this.circleCenterY, outterInterSectAngle, this.areaRadius);
                var radius = this.arcRadius(arcStartPoint, outerInterSectPoint, outterInterSectAngle);
                var arcCy = outterInterSectAngle > 180 ? this.circleCenterY - radius : this.circleCenterY + radius;
                var innerInterSectPoint = this.intersectingCirclePoints(arcCx, arcCy, radius, circlePoint[0].centerX, circlePoint[0].centerY, circlePoint[0].radius, smithchart.renderType);
                var startPoint = { x: innerInterSectPoint.x, y: innerInterSectPoint.y };
                var endPoint = { x: outerInterSectPoint.x, y: outerInterSectPoint.y };
                size = { width: radius, height: radius };
                var sweepDirection = previous['value'] >= 0 ? this.direction['clockwise'] : this.direction['counterclockwise'];
                this.minorGridArcPoints.push({
                    startPoint: startPoint,
                    endPoint: endPoint,
                    rotationAngle: 2 * Math.PI,
                    sweepDirection: sweepDirection,
                    isLargeArc: false,
                    size: size
                });
                k++;
            }
        }
    };
    AxisRender.prototype.minorGridLineArcIntersectCircle = function (centerValue) {
        var calValue;
        if (centerValue >= 3) {
            calValue = 20;
        }
        else if (centerValue >= 1.5) {
            calValue = 10;
        }
        else if (centerValue >= 0.6) {
            calValue = 3;
        }
        else {
            calValue = 2;
        }
        var circlePoint = this.horizontalLabelCollections.filter(function (c) { return c['value'] === calValue; });
        return circlePoint;
    };
    AxisRender.prototype.circlePointPosition = function (cx, cy, angle, r) {
        var radian = angle * (Math.PI / 180);
        var pointX = cx + r * Math.cos(radian);
        var pointY = cy + r * Math.sin(radian);
        return { x: pointX, y: pointY };
    };
    AxisRender.prototype.setLabelsInsidePosition = function (angle, px, py, textSize) {
        var x = px;
        var y = py;
        if (angle === 0 || angle === 360) {
            x -= textSize.width;
            y -= textSize.height / 2;
        }
        else if (angle === 90) {
            x -= textSize.width;
            y += textSize.height / 8;
        }
        else if (angle === 180) {
            y += textSize.height;
        }
        else if (angle === 270) {
            y += textSize.height / 2;
        }
        else if (angle > 0 && angle <= 20) {
            x -= (textSize.width);
        }
        else if (angle > 20 && angle <= 60) {
            x -= (textSize.width + textSize.width / 2);
            y += textSize.height / 2;
        }
        else if (angle > 60 && angle < 90) {
            x -= (textSize.width + textSize.width / 4);
            y += textSize.height / 4;
        }
        else if (angle > 90 && angle <= 135) {
            x -= (textSize.width / 2);
            y += (textSize.height) / 16;
        }
        else if (angle > 135 && angle <= 150) {
            x += (textSize.width / 2);
            y += (textSize.height / 2);
        }
        else if (angle > 150 && angle < 180) {
            x += (textSize.width / 2);
            y += (textSize.height);
        }
        else if (angle > 180 && angle <= 210) {
            x += (textSize.width / 6);
            y += (textSize.height / 6);
        }
        else if (angle > 210 && angle < 240) {
            y += (textSize.height / 4);
        }
        else if (angle > 225 && angle < 270) {
            y += (textSize.height / 3);
        }
        else if (angle > 270 && angle <= 300) {
            x -= (textSize.width + textSize.width / 4);
            y += (textSize.height / 4);
        }
        else if (angle > 300 && angle <= 330) {
            x -= (textSize.width + textSize.width / 3);
            y += (textSize.height / 4);
        }
        else if (angle > 330 && angle <= 340) {
            x -= (textSize.width + textSize.width / 2);
            y += textSize.height / 4;
        }
        else if (angle > 340) {
            x -= textSize.width;
            y += textSize.height / 8;
        }
        return { x: x, y: y };
    };
    AxisRender.prototype.setLabelsOutsidePosition = function (angle, px, py, textSize) {
        var x = px;
        var y = py;
        if (angle === 90) {
            x -= textSize.width / 2;
            y += textSize.height;
        }
        else if (angle === 180) {
            x -= (textSize.width + 5);
            y -= textSize.height / 4;
        }
        else if (angle === 270) {
            x -= textSize.width / 2;
            y -= textSize.height / 4;
        }
        else if (angle === 360) {
            x += 5;
            y -= textSize.height / 2;
        }
        else if (angle > 0 && angle <= 30) {
            x += textSize.width / 4;
            y += textSize.height / 8;
        }
        else if (angle > 30 && angle <= 60) {
            x += textSize.width / 2;
            y += textSize.height / 4;
        }
        else if (angle > 60 && angle <= 90) {
            x -= textSize.width / 2;
            y += textSize.height;
        }
        else if (angle > 90 && angle <= 135) {
            x -= textSize.width;
            y += textSize.height;
        }
        else if (angle > 135 && angle <= 180) {
            x -= (textSize.width + textSize.width / 4);
            y += textSize.height / 4;
        }
        else if (angle > 180 && angle <= 210) {
            x -= textSize.width + textSize.width / 4;
            y -= textSize.height / 4;
        }
        else if (angle > 210 && angle <= 270) {
            x -= textSize.width;
            y -= textSize.height / 4;
        }
        else if (angle > 270 && angle <= 340) {
            y -= textSize.height / 4;
        }
        else if (angle > 340) {
            y += textSize.height / 4;
            x += textSize.width / 6;
        }
        return { x: x, y: y };
    };
    AxisRender.prototype.arcRadius = function (startPoint, endPoint, angle) {
        var radian = angle > 180 ? (90 * Math.PI / 180) : (270 * Math.PI / 180); // Angle 90 and 270 used for calculating upper and lower circle
        var mx = (endPoint.x - startPoint.x) / 2;
        var my = (endPoint.y - startPoint.y) / 2;
        var u = (Math.cos(radian) * my - Math.sin(radian) * mx) / (Math.cos(radian) * mx + Math.sin(radian) * my);
        var t = (my - mx * u) / Math.sin(radian);
        var cy = startPoint.y + Math.sin(radian) * t;
        var radius = Math.abs(startPoint.y - cy);
        return radius;
    };
    return AxisRender;
}());
export { AxisRender };
