import { ProgressAnimation } from '../utils/progress-animation';
import { PathOption, getElement, measureText } from '@syncfusion/ej2-svg-base';
import { stringToNumber, getPathArc } from '../utils/helper';
import { Segment } from './segment-progress';
import { TextOption } from '../utils/helper';
/**
 * Progressbar of type circular
 */
var Circular = /** @class */ (function () {
    function Circular(progress) {
        this.segment = new Segment();
        this.animation = new ProgressAnimation();
        this.progress = progress;
    }
    /** To render the circular track */
    Circular.prototype.renderCircularTrack = function () {
        var progress = this.progress;
        var circularTrackGroup = progress.renderer.createGroup({ 'id': progress.element.id + '_CircularTrackGroup' });
        var radius;
        var endAngle;
        var startAngle = progress.startAngle;
        progress.totalAngle = (progress.endAngle - progress.startAngle) % 360;
        progress.totalAngle = (progress.totalAngle <= 0 ? (360 + progress.totalAngle) : progress.totalAngle);
        progress.totalAngle -= (progress.totalAngle === 360) ? 0.01 : 0;
        this.trackEndAngle = endAngle = (progress.startAngle + ((progress.enableRtl) ? -progress.totalAngle : +progress.totalAngle)) % 360;
        this.centerX = progress.progressRect.x + (progress.progressRect.width / 2);
        this.centerY = progress.progressRect.y + (progress.progressRect.height / 2);
        this.maxThickness = Math.max(progress.trackThickness, progress.progressThickness) ||
            Math.max(progress.themeStyle.circularProgressThickness, progress.themeStyle.circularTrackThickness);
        this.availableSize = (Math.min(progress.progressRect.height, progress.progressRect.width) / 2) - this.maxThickness / 2;
        radius = stringToNumber(progress.radius, this.availableSize);
        radius = (radius === null) ? 0 : radius;
        var stroke = (progress.argsData.trackColor || progress.themeStyle.circularTrackColor);
        var fill = (progress.enablePieProgress) ? (progress.argsData.trackColor || progress.themeStyle.circularTrackColor) : 'none';
        var strokeWidth = (progress.enablePieProgress) ? 0 :
            (progress.trackThickness || progress.themeStyle.circularTrackThickness);
        var circularPath = getPathArc(this.centerX, this.centerY, radius, startAngle, endAngle, progress.enableRtl, progress.enablePieProgress);
        this.isRange = (this.progress.rangeColors[0].color !== '' || this.progress.rangeColors[0].start !== null ||
            this.progress.rangeColors[0].end !== null);
        var option = new PathOption(progress.element.id + '_Circulartrack', fill, strokeWidth, stroke, progress.themeStyle.trackOpacity, '0', circularPath);
        var circularTrack = progress.renderer.drawPath(option);
        progress.trackWidth = circularTrack.getTotalLength();
        if (progress.segmentCount > 1 && !progress.enableProgressSegments && !progress.enablePieProgress && !this.isRange) {
            progress.segmentSize = progress.calculateSegmentSize(progress.trackWidth, strokeWidth);
            circularTrack.setAttribute('stroke-dasharray', progress.segmentSize);
        }
        if (progress.cornerRadius === 'Round' && !progress.enablePieProgress && !this.isRange) {
            circularTrack.setAttribute('stroke-linecap', 'round');
        }
        circularTrackGroup.appendChild(circularTrack);
        progress.svgObject.appendChild(circularTrackGroup);
    };
    /** To render the circular progress */
    Circular.prototype.renderCircularProgress = function (previousEnd, previousTotalEnd, refresh) {
        var progress = this.progress;
        var startAngle = progress.startAngle;
        var endAngle;
        var totalAngle;
        var radius;
        var previousPath;
        var progressTotalAngle;
        var progressEnd;
        var circularProgress;
        var linearClipPath;
        var circularProgressGroup;
        var segmentWidth;
        if (!refresh) {
            circularProgressGroup = progress.renderer.createGroup({ 'id': progress.element.id + '_CircularProgressGroup' });
        }
        else {
            circularProgressGroup = getElement(progress.element.id + '_CircularProgressGroup');
        }
        radius = stringToNumber(progress.innerRadius, this.availableSize);
        radius = (radius === null) ? 0 : radius;
        progress.previousTotalEnd = progressEnd = progress.calculateProgressRange(progress.argsData.value);
        var progressEndAngle = (progress.startAngle + ((progress.enableRtl) ? -progressEnd : progressEnd)) % 360;
        progress.previousEndAngle = endAngle = ((progress.isIndeterminate && !progress.enableProgressSegments) ? (progress.startAngle + ((progress.enableRtl) ? -progress.totalAngle : progress.totalAngle)) % 360 : progressEndAngle);
        progressTotalAngle = (progressEnd - progress.startAngle) % 360;
        progressTotalAngle = (progressTotalAngle <= 0 ? (360 + progressTotalAngle) : progressTotalAngle);
        progressTotalAngle -= (progressTotalAngle === 360) ? 0.01 : 0;
        var circularPath = getPathArc(this.centerX, this.centerY, radius, startAngle, endAngle, progress.enableRtl, progress.enablePieProgress);
        var stroke = this.checkingCircularProgressColor();
        var fill = (progress.enablePieProgress) ? stroke : 'none';
        var thickness = (progress.progressThickness || progress.themeStyle.circularProgressThickness);
        var strokeWidth = (progress.enablePieProgress) ? 0 : thickness;
        var option = new PathOption(progress.element.id + '_Circularprogress', fill, strokeWidth, stroke, progress.themeStyle.progressOpacity, '0', circularPath);
        progress.progressWidth = progress.renderer.drawPath(option).getTotalLength();
        progress.segmentSize = this.validateSegmentSize(progress, thickness);
        if (progress.secondaryProgress !== null && !progress.isIndeterminate) {
            this.renderCircularBuffer(progress, radius, progressTotalAngle);
        }
        if (progress.argsData.value !== null) {
            if (progress.segmentColor.length !== 0 && !progress.isIndeterminate && !progress.enablePieProgress) {
                totalAngle = (!progress.enableProgressSegments) ? progress.totalAngle : progressTotalAngle;
                segmentWidth = (!progress.enableProgressSegments) ? progress.trackWidth : progress.progressWidth;
                circularProgress = this.segment.createCircularSegment(progress, '_CircularProgressSegment', this.centerX, this.centerY, radius, progress.argsData.value, progress.themeStyle.progressOpacity, thickness, totalAngle, segmentWidth);
            }
            else if (this.isRange && !progress.isIndeterminate) {
                circularProgress = this.segment.createCircularRange(this.centerX, this.centerY, radius, progress);
            }
            else {
                if (!refresh) {
                    circularProgress = progress.renderer.drawPath(option);
                }
                else {
                    circularProgress = getElement(progress.element.id + '_Circularprogress');
                    previousPath = circularProgress.getAttribute('d');
                    circularProgress.setAttribute('stroke', stroke);
                    circularProgress.setAttribute('d', circularPath);
                }
                if (progress.segmentCount > 1 && !progress.enablePieProgress) {
                    circularProgress.setAttribute('stroke-dasharray', progress.segmentSize);
                }
                if (progress.cornerRadius === 'Round' && startAngle !== endAngle) {
                    circularProgress.setAttribute('stroke-linecap', 'round');
                }
            }
            circularProgressGroup.appendChild(circularProgress);
            if (progress.isActive && !progress.isIndeterminate && !progress.enablePieProgress) {
                this.renderActiveState(circularProgressGroup, radius, strokeWidth, circularPath, progressEndAngle, progressEnd, refresh);
            }
            if (progress.animation.enable || progress.isIndeterminate) {
                this.delay = (progress.secondaryProgress !== null) ? 300 : progress.animation.delay;
                linearClipPath = progress.createClipPath(progress.clipPath, null, refresh ? previousPath : '', refresh);
                circularProgressGroup.appendChild(progress.clipPath);
                if (progress.animation.enable && !progress.isIndeterminate && !progress.isActive) {
                    circularProgress.setAttribute('style', 'clip-path:url(#' + progress.element.id + '_clippath)');
                    this.animation.doCircularAnimation(this.centerX, this.centerY, radius, progressEndAngle, progressEnd, linearClipPath, progress, thickness, this.delay, refresh ? previousEnd : null, refresh ? previousTotalEnd : null);
                }
                if (progress.isIndeterminate) {
                    if (progress.enableProgressSegments) {
                        linearClipPath.setAttribute('d', getPathArc(this.centerX, this.centerY, radius + (thickness / 2), progress.startAngle, this.trackEndAngle, progress.enableRtl, true));
                    }
                    circularProgress.setAttribute('style', 'clip-path:url(#' + progress.element.id + '_clippath)');
                    this.animation.doCircularIndeterminate((!progress.enableProgressSegments) ? linearClipPath : circularProgress, progress, startAngle, progressEndAngle, this.centerX, this.centerY, radius, thickness, linearClipPath);
                }
            }
            progress.svgObject.appendChild(circularProgressGroup);
        }
    };
    /** To render the circular buffer */
    Circular.prototype.renderCircularBuffer = function (progress, radius, progressTotalAngle) {
        var bufferClipPath;
        var circularBuffer;
        var segmentWidth;
        var totalAngle;
        var circularBufferGroup = progress.renderer.createGroup({ 'id': progress.element.id + '_ CircularBufferGroup' });
        var bufferEnd = progress.calculateProgressRange(progress.secondaryProgress);
        var endAngle = (progress.startAngle + ((progress.enableRtl) ? -bufferEnd : bufferEnd)) % 360;
        var circularPath = getPathArc(this.centerX, this.centerY, radius, progress.startAngle, endAngle, progress.enableRtl, progress.enablePieProgress);
        var stroke = this.checkingCircularProgressColor();
        var fill = (progress.enablePieProgress) ? stroke : 'none';
        var strokeWidth = (progress.enablePieProgress) ? 0 :
            (progress.progressThickness || progress.themeStyle.circularProgressThickness);
        var option = new PathOption(progress.element.id + '_Circularbuffer', fill, strokeWidth, stroke, progress.themeStyle.bufferOpacity, '0', circularPath);
        if (progress.segmentColor.length !== 0 && !progress.isIndeterminate && !progress.enablePieProgress && !this.isRange) {
            totalAngle = (!progress.enableProgressSegments) ? progress.totalAngle : progressTotalAngle;
            segmentWidth = (!progress.enableProgressSegments) ? progress.trackWidth : progress.progressWidth;
            circularBuffer = this.segment.createCircularSegment(progress, '_CircularBufferSegment', this.centerX, this.centerY, radius, progress.secondaryProgress, progress.themeStyle.bufferOpacity, strokeWidth, totalAngle, segmentWidth);
        }
        else {
            circularBuffer = progress.renderer.drawPath(option);
            if (progress.segmentCount > 1 && !progress.enablePieProgress && !this.isRange) {
                circularBuffer.setAttribute('stroke-dasharray', progress.segmentSize);
            }
            if (progress.cornerRadius === 'Round' && !this.isRange) {
                circularBuffer.setAttribute('stroke-linecap', 'round');
            }
        }
        circularBufferGroup.appendChild(circularBuffer);
        if (progress.animation.enable && !progress.isActive) {
            bufferClipPath = progress.createClipPath(progress.bufferClipPath, null, '', false);
            circularBufferGroup.appendChild(progress.bufferClipPath);
            circularBuffer.setAttribute('style', 'clip-path:url(#' + progress.element.id + '_clippathBuffer)');
            this.animation.doCircularAnimation(this.centerX, this.centerY, radius, endAngle, bufferEnd, bufferClipPath, progress, (progress.progressThickness || progress.themeStyle.circularProgressThickness), progress.animation.delay);
        }
        progress.svgObject.appendChild(circularBufferGroup);
    };
    /** To render the circular Label */
    Circular.prototype.renderCircularLabel = function (isProgressRefresh) {
        if (isProgressRefresh === void 0) { isProgressRefresh = false; }
        var end;
        var circularLabel;
        var centerY;
        var textSize;
        var option;
        var percentage = 100;
        var progress = this.progress;
        var labelText = progress.labelStyle.text;
        var circularLabelGroup = progress.renderer.createGroup({ 'id': progress.element.id + '_CircularLabelGroup' });
        if (document.getElementById(circularLabelGroup.id)) {
            document.getElementById(circularLabelGroup.id).remove();
        }
        var labelValue = ((progress.value - progress.minimum) / (progress.maximum - progress.minimum)) * percentage;
        var circularValue = (progress.value < progress.minimum || progress.value > progress.maximum) ? 0 : Math.round(labelValue);
        var argsData = {
            cancel: false, text: labelText ? labelText : String(circularValue) + '%', color: progress.labelStyle.color
        };
        progress.trigger('textRender', argsData);
        if (!argsData.cancel) {
            textSize = measureText(argsData.text, progress.labelStyle);
            centerY = this.centerY + (textSize.height / 2);
            option = new TextOption(progress.element.id + '_circularLabel', progress.labelStyle.size || progress.themeStyle.circularFontSize, progress.labelStyle.fontStyle || progress.themeStyle.circularFontStyle, progress.labelStyle.fontFamily || progress.themeStyle.circularFontFamily, progress.labelStyle.fontWeight, 'middle', argsData.color || progress.themeStyle.fontColor, this.centerX, centerY, progress.progressRect.width, progress.progressRect.height);
            circularLabel = progress.renderer.createText(option, argsData.text);
            circularLabelGroup.appendChild(circularLabel);
            if (progress.animation.enable && !progress.isIndeterminate) {
                end = ((progress.value - progress.minimum) / (progress.maximum - progress.minimum)) * progress.totalAngle;
                end = (progress.value < progress.minimum || progress.value > progress.maximum) ? 0 : end;
                this.animation.doLabelAnimation(circularLabel, isProgressRefresh ? progress.previousWidth : progress.startAngle, end, progress, this.delay);
            }
            progress.svgObject.appendChild(circularLabelGroup);
            progress.previousWidth = end;
        }
    };
    /** To render a progressbar active state */
    Circular.prototype.renderActiveState = function (progressGroup, radius, strokeWidth, circularPath, endAngle, totalEnd, refresh) {
        var circularActive;
        var option;
        var progress = this.progress;
        var thickness = strokeWidth + 1;
        if (!refresh) {
            option = new PathOption(progress.element.id + '_CircularActiveProgress', 'none', thickness, '#ffffff', 0.5, '0', circularPath);
            circularActive = progress.renderer.drawPath(option);
        }
        else {
            circularActive = getElement(progress.element.id + '_CircularActiveProgress');
            circularActive.setAttribute('d', circularPath);
        }
        if (progress.segmentCount > 1) {
            circularActive.setAttribute('stroke-dasharray', progress.segmentSize);
        }
        if (progress.cornerRadius === 'Round') {
            circularActive.setAttribute('stroke-linecap', 'round');
        }
        var activeClip = progress.createClipPath(progress.clipPath, null, '', refresh);
        circularActive.setAttribute('style', 'clip-path:url(#' + progress.element.id + '_clippath)');
        progressGroup.appendChild(circularActive);
        progressGroup.appendChild(progress.clipPath);
        this.animation.doCircularAnimation(this.centerX, this.centerY, radius, endAngle, totalEnd, activeClip, progress, thickness, 0, null, null, circularActive);
    };
    /** Checking the segment size */
    Circular.prototype.validateSegmentSize = function (progress, thickness) {
        var validSegment;
        var progressSegment;
        var rDiff = parseInt(progress.radius, 10) - parseInt(progress.innerRadius, 10);
        if (rDiff !== 0 && !progress.enableProgressSegments) {
            progressSegment = progress.trackWidth + ((rDiff < 0) ? (progress.trackWidth * Math.abs(rDiff)) / parseInt(progress.radius, 10) :
                -(progress.trackWidth * Math.abs(rDiff)) / parseInt(progress.radius, 10));
            validSegment = progress.calculateSegmentSize(progressSegment, thickness);
        }
        else if (progress.enableProgressSegments) {
            validSegment = progress.calculateSegmentSize(progress.progressWidth, thickness);
        }
        else {
            validSegment = progress.segmentSize;
        }
        return validSegment;
    };
    /** checking progress color */
    Circular.prototype.checkingCircularProgressColor = function () {
        var circularColor;
        var progress = this.progress;
        var role = progress.role;
        switch (role) {
            case 'Success':
                circularColor = progress.themeStyle.success;
                break;
            case 'Info':
                circularColor = progress.themeStyle.info;
                break;
            case 'Warning':
                circularColor = progress.themeStyle.warning;
                break;
            case 'Danger':
                circularColor = progress.themeStyle.danger;
                break;
            default:
                circularColor = (progress.argsData.progressColor || progress.themeStyle.circularProgressColor);
        }
        return circularColor;
    };
    return Circular;
}());
export { Circular };
