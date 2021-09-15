import { lineCapRadius, completeAngle } from '../model/constant';
import { getPathArc, degreeToLocation } from '../utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
/**
 * Progressbar Segment
 */
var Segment = /** @class */ (function () {
    function Segment() {
    }
    /** To render the linear segment */
    Segment.prototype.createLinearSegment = function (progress, id, width, opacity, thickness, progressWidth) {
        var locX = (progress.enableRtl) ? ((progress.cornerRadius === 'Round') ?
            (progress.progressRect.x + progress.progressRect.width) - ((lineCapRadius / 2) * thickness) :
            (progress.progressRect.x + progress.progressRect.width)) :
            ((progress.cornerRadius === 'Round') ? (progress.progressRect.x + (lineCapRadius / 2) * thickness) : progress.progressRect.x);
        var locY = (progress.progressRect.y + (progress.progressRect.height / 2));
        var gapWidth = (progress.gapWidth || progress.themeStyle.linearGapWidth);
        var avlWidth = progressWidth / progress.segmentCount;
        var avlSegWidth = (progressWidth - ((progress.segmentCount - 1) * gapWidth));
        avlSegWidth = (avlSegWidth -
            ((progress.cornerRadius === 'Round') ? progress.segmentCount * (lineCapRadius * thickness) : 0)) / progress.segmentCount;
        var gap = (progress.cornerRadius === 'Round') ? (gapWidth + (lineCapRadius * thickness)) : gapWidth;
        var segmentGroup = progress.renderer.createGroup({ 'id': progress.element.id + id });
        var count = Math.ceil(width / avlWidth);
        var segWidth;
        var color;
        var j = 0;
        var option;
        var segmentPath;
        var tolWidth = (progress.cornerRadius === 'Round') ? (width - (lineCapRadius * thickness)) : width;
        var linearThickness = progress.progressThickness || progress.themeStyle.linearProgressThickness;
        for (var i = 0; i < count; i++) {
            segWidth = (tolWidth < avlSegWidth) ? tolWidth : avlSegWidth;
            if (j < progress.segmentColor.length) {
                color = progress.segmentColor[j];
                j++;
            }
            else {
                j = 0;
                color = progress.segmentColor[j];
                j++;
            }
            option = new PathOption(progress.element.id + id + i, 'none', linearThickness, color, opacity, '0', this.getLinearSegmentPath(locX, locY, segWidth, progress.enableRtl));
            segmentPath = progress.renderer.drawPath(option);
            if (progress.cornerRadius === 'Round') {
                segmentPath.setAttribute('stroke-linecap', 'round');
            }
            segmentGroup.appendChild(segmentPath);
            locX += (progress.enableRtl) ? -avlSegWidth - gap : avlSegWidth + gap;
            tolWidth -= avlSegWidth + gap;
            tolWidth = (tolWidth < 0) ? 0 : tolWidth;
        }
        return segmentGroup;
    };
    Segment.prototype.getLinearSegmentPath = function (x, y, width, enableRtl) {
        return 'M' + ' ' + x + ' ' + y + ' ' + 'L' + (x + ((enableRtl) ? -width : width)) + ' ' + y;
    };
    /** To render the circular segment */
    Segment.prototype.createCircularSegment = function (progress, id, x, y, r, value, opacity, thickness, totalAngle, progressWidth) {
        var start = progress.startAngle;
        var end = this.widthToAngle(progress.minimum, progress.maximum, value, progress.totalAngle);
        end -= (progress.cornerRadius === 'Round' && progress.totalAngle === completeAngle) ?
            this.widthToAngle(0, progressWidth, ((lineCapRadius / 2) * thickness), totalAngle) : 0;
        var size = (progressWidth - ((progress.totalAngle === completeAngle) ? progress.segmentCount :
            progress.segmentCount - 1) * (progress.gapWidth || progress.themeStyle.circularGapWidth));
        size = (size -
            ((progress.cornerRadius === 'Round') ?
                (((progress.totalAngle === completeAngle) ?
                    progress.segmentCount : progress.segmentCount - 1) * lineCapRadius * thickness) : 0)) / progress.segmentCount;
        var avlTolEnd = this.widthToAngle(0, progressWidth, (progressWidth / progress.segmentCount), totalAngle);
        avlTolEnd -= (progress.cornerRadius === 'Round' && progress.totalAngle === completeAngle) ?
            this.widthToAngle(0, progressWidth, ((lineCapRadius / 2) * thickness), totalAngle) : 0;
        var avlEnd = this.widthToAngle(0, progressWidth, size, totalAngle);
        var gap = this.widthToAngle(0, progressWidth, (progress.gapWidth || progress.themeStyle.circularGapWidth), totalAngle);
        gap += (progress.cornerRadius === 'Round') ? this.widthToAngle(0, progressWidth, (lineCapRadius * thickness), totalAngle) : 0;
        var segmentGroup = progress.renderer.createGroup({ 'id': progress.element.id + id });
        var gapCount = Math.floor(end / avlTolEnd);
        var count = Math.ceil((end - gap * gapCount) / avlEnd);
        var segmentPath;
        var circularSegment;
        var segmentEnd;
        var avlSegEnd = (start + ((progress.enableRtl) ? -avlEnd : avlEnd)) % 360;
        var color;
        var j = 0;
        var option;
        var circularThickness = progress.progressThickness || progress.themeStyle.circularProgressThickness;
        for (var i = 0; i < count; i++) {
            segmentEnd = (progress.enableRtl) ? ((progress.startAngle - end > avlSegEnd) ? progress.startAngle - end : avlSegEnd) :
                ((progress.startAngle + end < avlSegEnd) ? progress.startAngle + end : avlSegEnd);
            segmentPath = getPathArc(x, y, r, start, segmentEnd, progress.enableRtl);
            if (j < progress.segmentColor.length) {
                color = progress.segmentColor[j];
                j++;
            }
            else {
                j = 0;
                color = progress.segmentColor[j];
                j++;
            }
            option = new PathOption(progress.element.id + id + i, 'none', circularThickness, color, opacity, '0', segmentPath);
            circularSegment = progress.renderer.drawPath(option);
            if (progress.cornerRadius === 'Round') {
                circularSegment.setAttribute('stroke-linecap', 'round');
            }
            segmentGroup.appendChild(circularSegment);
            start = segmentEnd + ((progress.enableRtl) ? -gap : gap);
            avlSegEnd += (progress.enableRtl) ? -avlEnd - gap : avlEnd + gap;
        }
        return segmentGroup;
    };
    Segment.prototype.widthToAngle = function (min, max, value, totalAngle) {
        var angle = ((value - min) / (max - min)) * totalAngle;
        return angle;
    };
    Segment.prototype.createLinearRange = function (totalWidth, progress) {
        var posX = progress.progressRect.x + ((progress.enableRtl) ? progress.progressRect.width : 0);
        var startY = (progress.progressRect.y + (progress.progressRect.height / 2));
        var rangeGroup = progress.renderer.createGroup({ 'id': progress.element.id + '_LinearRangeGroup' });
        var range = progress.rangeColors;
        var thickness = progress.progressThickness || progress.themeStyle.linearProgressThickness;
        var opacity = progress.themeStyle.progressOpacity;
        var rangeMin = progress.minimum;
        var rangeMax = progress.value;
        var gradX = (progress.enableRtl) ? 0.1 : -0.1;
        var gradient;
        var validRange;
        var rangePath;
        var option;
        var startPos;
        var endPos;
        var startX;
        var endX;
        var color;
        var endColor;
        for (var i = 0; i < range.length; i++) {
            validRange = (range[i].start >= rangeMin && range[i].start <= rangeMax &&
                range[i].end >= rangeMin && range[i].end <= rangeMax);
            startPos = totalWidth * progress.calculateProgressRange(range[i].start, rangeMin, rangeMax);
            endPos = totalWidth * progress.calculateProgressRange(range[i].end, rangeMin, rangeMax);
            startX = posX + ((progress.enableRtl) ? -startPos : startPos);
            endX = posX + ((progress.enableRtl) ? -endPos : endPos);
            startX = (validRange) ? ((progress.isGradient && i > 0) ? startX + gradX : startX) : posX;
            endX = (validRange) ? endX : posX;
            color = (progress.isGradient) ? 'url(#lineRangeGrad_' + i + ')' : range[i].color;
            option = new PathOption(progress.element.id + '_LinearRange_' + i, 'none', thickness, color, opacity, '0', 'M' + ' ' + startX + ' ' + startY + ' ' + 'L' + endX + ' ' + startY);
            rangePath = progress.renderer.drawPath(option);
            rangeGroup.appendChild(rangePath);
            if (progress.isGradient) {
                if (range.length - 1 === i) {
                    endColor = range[i].color;
                }
                else {
                    endColor = range[i + 1].color;
                }
                gradient = this.setLinearGradientColor(i, range[i].color, endColor, startX, endX, progress);
                rangeGroup.appendChild(gradient);
            }
        }
        return rangeGroup;
    };
    Segment.prototype.createCircularRange = function (centerX, centerY, radius, progress) {
        var rangeGroup = progress.renderer.createGroup({ 'id': progress.element.id + '_CircularRangeGroup' });
        var range = progress.rangeColors;
        var thickness = progress.progressThickness || progress.themeStyle.linearProgressThickness;
        var opacity = progress.themeStyle.progressOpacity;
        var rangeMin = progress.minimum;
        var rangeMax = progress.value;
        var start = progress.startAngle;
        var tolAngle = this.widthToAngle(progress.minimum, progress.maximum, progress.value, progress.totalAngle);
        var gradient;
        var startAngle;
        var endAngle;
        var rangePath;
        var isValidRange;
        var option;
        var color;
        var endColor;
        for (var i = 0; i < range.length; i++) {
            isValidRange = (range[i].start >= rangeMin && range[i].start <= rangeMax &&
                range[i].end >= rangeMin && range[i].end <= rangeMax);
            startAngle = this.widthToAngle(rangeMin, rangeMax, range[i].start, tolAngle);
            endAngle = this.widthToAngle(rangeMin, rangeMax, range[i].end, tolAngle);
            startAngle = (isValidRange) ? (start + ((progress.enableRtl) ? -startAngle : startAngle)) % 360 : start;
            endAngle = (isValidRange) ? (start + ((progress.enableRtl) ? -endAngle : endAngle)) % 360 : start;
            color = (progress.isGradient) ? 'url(#circleRangeGrad_' + i + ')' : range[i].color;
            option = new PathOption(progress.element.id + '_CircularRange_' + i, 'none', thickness, color, opacity, '0', getPathArc(centerX, centerY, radius, startAngle, endAngle, progress.enableRtl));
            rangePath = progress.renderer.drawPath(option);
            rangeGroup.appendChild(rangePath);
            if (progress.isGradient) {
                if (range.length - 1 === i) {
                    endColor = range[i].color;
                }
                else {
                    endColor = range[i + 1].color;
                }
                gradient = this.setCircularGradientColor(i, range[i].color, endColor, startAngle, endAngle, radius, centerX, centerY, progress);
                rangeGroup.appendChild(gradient);
            }
        }
        return rangeGroup;
    };
    Segment.prototype.setLinearGradientColor = function (id, startColor, endColor, start, end, progress) {
        var stopColor = [];
        var option = { id: 'lineRangeGrad_' + id + '', x1: start.toString(), x2: end.toString() };
        stopColor[0] = { color: startColor, colorStop: '50%' };
        stopColor[1] = { color: endColor, colorStop: '100%' };
        var linearGradient = progress.renderer.drawGradient('linearGradient', option, stopColor);
        linearGradient.firstElementChild.setAttribute('gradientUnits', 'userSpaceOnUse');
        return linearGradient;
    };
    Segment.prototype.setCircularGradientColor = function (id, startColor, endColor, start, end, rad, x, y, progress) {
        var stopColor = [];
        var pos1 = degreeToLocation(x, y, rad, start);
        var pos2 = degreeToLocation(x, y, rad, end);
        var option = {
            id: 'circleRangeGrad_' + id + '', x1: pos1.x.toString(), x2: pos2.x.toString(),
            y1: pos1.y.toString(), y2: pos2.y.toString()
        };
        stopColor[0] = { color: startColor, colorStop: '50%' };
        stopColor[1] = { color: endColor, colorStop: '100%' };
        var linearGradient = progress.renderer.drawGradient('linearGradient', option, stopColor);
        linearGradient.firstElementChild.setAttribute('gradientUnits', 'userSpaceOnUse');
        return linearGradient;
    };
    return Segment;
}());
export { Segment };
