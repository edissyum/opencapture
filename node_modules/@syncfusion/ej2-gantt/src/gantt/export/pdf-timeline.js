import { PointF, PdfColor, PdfPen, PdfSolidBrush, PdfStandardFont, PdfStringFormat, PdfVerticalAlignment, PdfTextAlignment, PdfWordWrapType } from '@syncfusion/ej2-pdf-export';
import { extend, isNullOrUndefined } from '@syncfusion/ej2-base';
import { pixelToPoint } from '../base/utils';
/**
 */
var PdfTimeline = /** @class */ (function () {
    function PdfTimeline(gantt) {
        this.width = 0;
        this.gantt = gantt;
        this.parent = gantt.parent;
        this.topTierPoint = new PointF();
        this.bottomTierPoint = new PointF();
        this.topTierIndex = 0;
        this.bottomTierIndex = 0;
        this.prevTopTierIndex = 0;
        this.prevBottomTierIndex = 0;
    }
    /**
     * @private
     * @param {PdfPage} page .
     * @param {PointF} startPoint .
     * @param {TimelineDetails} detail .
     * @returns {void}
     */
    PdfTimeline.prototype.drawTimeline = function (page, startPoint, detail) {
        var remainWidth = Math.floor(detail.totalWidth);
        var renderWidth = 0;
        this.topTierPoint.x = startPoint.x;
        this.topTierPoint.y = startPoint.y;
        this.prevTopTierIndex = this.topTierIndex;
        this.prevBottomTierIndex = this.bottomTierIndex;
        while (remainWidth > 0) {
            var pHeader = this.topTier[this.topTierIndex];
            if (this.topTier.length > this.topTierIndex) {
                var isCompleted = false;
                if (!this.topTier[this.topTierIndex].isFinished) {
                    if (remainWidth >= pHeader.width) {
                        renderWidth = pHeader.width;
                        pHeader.isFinished = true;
                        pHeader.completedWidth = renderWidth;
                        isCompleted = true;
                    }
                    else {
                        renderWidth = remainWidth;
                        isCompleted = false;
                        pHeader.isFinished = false;
                        pHeader.width = pHeader.width - remainWidth;
                        pHeader.completedWidth = renderWidth;
                    }
                }
                //Primary header Event Arguments
                /* eslint-disable-next-line */
                this.triggerQueryTimelinecell(page, this.topTierPoint.x, this.topTierPoint.y, this.topTierHeight, renderWidth, pHeader.value, true);
                this.topTierPoint.x += pixelToPoint(renderWidth);
                remainWidth -= renderWidth;
                if (isCompleted) {
                    this.topTierIndex++;
                }
            }
            else {
                remainWidth = 0;
            }
        }
        remainWidth = Math.floor(detail.totalWidth);
        var height = this.parent.timelineModule.isSingleTier ? 0 : this.topTierHeight;
        this.bottomTierPoint = new PointF(startPoint.x, pixelToPoint(startPoint.y + height));
        while (remainWidth > 0) {
            var secondHeader = this.bottomTier[this.bottomTierIndex];
            if (this.bottomTier.length > this.bottomTierIndex) {
                var isCompleted = true;
                var width = secondHeader.width;
                if (remainWidth < width) {
                    width = remainWidth;
                    isCompleted = false;
                    secondHeader.completedWidth = width;
                }
                //Secondary header Event Arguments
                /* eslint-disable-next-line */
                this.triggerQueryTimelinecell(page, this.bottomTierPoint.x, this.bottomTierPoint.y, this.bottomTierHeight, width, secondHeader.value, false);
                this.bottomTierPoint.x = this.bottomTierPoint.x + pixelToPoint(width);
                remainWidth -= width;
                secondHeader.completedWidth = width;
                if (isCompleted) {
                    this.bottomTierIndex++;
                }
            }
            else {
                remainWidth = 0;
            }
        }
    };
    /**
     *
     * @param {PdfPage} page .
     * @param {PointF} startPoint .
     * @param {TimelineDetails}  detail .
     * @returns {void} .
     * Draw the specific gantt chart side header when the taskbar exceeds the page
     * @private
     */
    /* eslint-disable-next-line */
    PdfTimeline.prototype.drawPageTimeline = function (page, startPoint, detail) {
        this.topTierPoint = extend({}, {}, startPoint, true);
        for (var index = this.prevTopTierIndex; index <= this.topTierIndex; index++) {
            if (this.topTier.length > index) {
                var pHeader = this.topTier[index];
                if (pHeader.completedWidth > 0) {
                    //Primary header Event Arguments
                    /* eslint-disable-next-line */
                    this.triggerQueryTimelinecell(page, this.topTierPoint.x, this.topTierPoint.y, this.topTierHeight, pHeader.completedWidth, pHeader.value, true);
                    this.topTierPoint.x += pixelToPoint(pHeader.completedWidth);
                }
            }
        }
        this.bottomTierPoint.x = startPoint.x;
        this.bottomTierPoint.y = pixelToPoint(startPoint.y + this.topTierHeight);
        for (var index = this.prevBottomTierIndex; index <= this.bottomTierIndex; index++) {
            if (this.bottomTier.length > index) {
                var secondHeader = this.bottomTier[index];
                if (secondHeader.completedWidth > 0) {
                    //Secondary header Event Arguments
                    /* eslint-disable-next-line */
                    this.triggerQueryTimelinecell(page, this.bottomTierPoint.x, this.bottomTierPoint.y, this.bottomTierHeight, secondHeader.width, secondHeader.value, false);
                    this.bottomTierPoint.x = this.bottomTierPoint.x + pixelToPoint(secondHeader.width);
                }
            }
        }
    };
    /**
     * Method to trigger pdf query timelinecell event
     */
    /* eslint-disable-next-line */
    PdfTimeline.prototype.triggerQueryTimelinecell = function (page, x, y, height, width, value, isTopTier) {
        var graphics = page.graphics;
        var timelineStyle = {};
        var ganttStyle = this.gantt.ganttStyle;
        timelineStyle.borderColor = new PdfColor(ganttStyle.timeline.borderColor);
        timelineStyle.fontColor = new PdfColor(ganttStyle.timeline.fontColor);
        timelineStyle.fontSize = ganttStyle.timeline.fontSize;
        timelineStyle.fontStyle = ganttStyle.timeline.fontStyle;
        timelineStyle.backgroundColor = new PdfColor(ganttStyle.timeline.backgroundColor);
        if (ganttStyle.timeline.padding) {
            timelineStyle.padding = ganttStyle.timeline.padding;
        }
        var format = new PdfStringFormat();
        if (isNullOrUndefined(ganttStyle.timeline.format)) {
            if (isTopTier) {
                format.lineAlignment = PdfVerticalAlignment.Middle;
                format.alignment = PdfTextAlignment.Left;
            }
            else {
                format.lineAlignment = PdfVerticalAlignment.Middle;
                format.alignment = PdfTextAlignment.Center;
                format.wordWrap = PdfWordWrapType.Character;
            }
        }
        else {
            format = ganttStyle.timeline.format;
        }
        timelineStyle.format = format;
        var eventArgs = {
            timelineCell: timelineStyle,
            value: value
        };
        if (this.parent.pdfQueryTimelineCellInfo) {
            this.parent.trigger('pdfQueryTimelineCellInfo', eventArgs);
        }
        var e = eventArgs.timelineCell;
        var rectPen = new PdfPen(eventArgs.timelineCell.borderColor);
        var rectBrush = new PdfSolidBrush(eventArgs.timelineCell.backgroundColor);
        graphics.drawRectangle(rectPen, rectBrush, x, y, pixelToPoint(width), pixelToPoint(height));
        var font = new PdfStandardFont(ganttStyle.fontFamily, e.fontSize, e.fontStyle);
        var textBrush = new PdfSolidBrush(eventArgs.timelineCell.fontColor);
        var pLeft = ganttStyle.timeline.padding ? eventArgs.timelineCell.padding.left : 0;
        var pTop = ganttStyle.timeline.padding ? eventArgs.timelineCell.padding.top : 0;
        /* eslint-disable-next-line */
        graphics.drawString(eventArgs.value, font, null, textBrush, x + pLeft, y + pTop, pixelToPoint(width), pixelToPoint(height), e.format);
    };
    return PdfTimeline;
}());
export { PdfTimeline };
