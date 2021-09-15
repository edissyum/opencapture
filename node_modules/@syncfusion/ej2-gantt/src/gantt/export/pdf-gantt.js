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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { PdfGanttTaskbarCollection } from './pdf-taskbar';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { PointF, PdfPen, PdfColor } from '@syncfusion/ej2-pdf-export';
import { PdfTreeGrid } from './pdf-treegrid';
import { PdfTimeline } from './pdf-timeline';
import { pixelToPoint, pointToPixel } from '../base/utils';
import { PdfGanttPredecessor } from './pdf-connector-line';
/**
 *
 */
var PdfGantt = /** @class */ (function (_super) {
    __extends(PdfGantt, _super);
    function PdfGantt(parent) {
        var _this = _super.call(this) || this;
        _this.exportProps = {};
        _this.parent = parent;
        _this.chartHeader = new PdfTimeline(_this);
        _this.predecessor = new PdfGanttPredecessor(parent, _this);
        _this.headerDetails = [];
        _this.pdfPageDetail = [];
        _this.taskbarCollection = [];
        _this.predecessorCollection = [];
        return _this;
    }
    Object.defineProperty(PdfGantt.prototype, "taskbar", {
        get: function () {
            if (isNullOrUndefined(this.taskbars)) {
                this.taskbars = new PdfGanttTaskbarCollection(this.parent);
            }
            return this.taskbars;
        },
        enumerable: true,
        configurable: true
    });
    PdfGantt.prototype.drawChart = function (result) {
        this.result = result;
        this.totalPages = this.result.page.section.count;
        this.perColumnPages = this.totalPages / this.layouter.columnRanges.length;
        this.calculateRange();
        this.drawGantttChart();
        this.drawPageBorder();
    };
    //Calcualte the header range for each pdf page based on schedule start and end date.
    PdfGantt.prototype.calculateRange = function () {
        var lastColumnRange = this.layouter.columnRanges[this.layouter.columnRanges.length - 1];
        var totalColumnWidth = 0;
        var isPageFinished = true;
        var pageWidth = 0;
        var remainWidth = 0;
        var point = 0;
        var headerWidth = pixelToPoint(this.chartHeader.width);
        var timelineSettings = this.parent.timelineModule;
        for (var index = lastColumnRange[0]; index <= lastColumnRange[1]; index++) {
            totalColumnWidth += this.layouter.treegrid.columns.getColumn(index).width;
        }
        totalColumnWidth += 0.5;
        if (totalColumnWidth + 100 < this.result.page.getClientSize().width) {
            remainWidth = this.result.page.getClientSize().width - totalColumnWidth;
            this.chartPageIndex = this.startPageIndex = this.totalPages - this.perColumnPages;
            isPageFinished = false;
            this.startPoint = new PointF(totalColumnWidth, 0);
        }
        else {
            this.result.page.section.add();
            this.chartPageIndex = this.startPageIndex = this.totalPages;
            isPageFinished = true;
            this.startPoint = new PointF(point, 0);
        }
        while (Math.round(point) < Math.round(headerWidth)) {
            if (isPageFinished) {
                pageWidth = this.result.page.getClientSize().width;
            }
            else {
                pageWidth = remainWidth;
                isPageFinished = true;
            }
            var detail = {};
            var range = [];
            var convertedWidth = pixelToPoint(this.chartHeader.bottomTierCellWidth);
            var width = 0;
            if (this.chartHeader.bottomTierCellWidth !== 0) {
                width = (Math.floor(pageWidth / convertedWidth) * convertedWidth);
            }
            range[0] = point;
            if (headerWidth - point <= width) {
                range[1] = headerWidth;
                detail.totalWidth = pointToPixel(headerWidth - point);
            }
            else {
                range[1] = point + width;
                detail.totalWidth = pointToPixel(width);
            }
            detail.startPoint = range[0];
            detail.endPoint = range[1];
            if (this.parent.cloneProjectStartDate.getHours() === 0 && this.parent.cloneProjectStartDate.getMinutes() === 0
                && this.parent.cloneProjectStartDate.getSeconds() === 0) {
                this.parent.cloneProjectStartDate.setHours(8);
            }
            var timelineStartDate = this.parent.dataOperation.getDateFromFormat(this.parent.cloneProjectStartDate);
            var count = isNullOrUndefined(timelineSettings.customTimelineSettings.bottomTier.count) ?
                timelineSettings.customTimelineSettings.topTier.count : timelineSettings.customTimelineSettings.bottomTier.count;
            var scheduleType = timelineSettings.customTimelineSettings.bottomTier.unit === 'None' ?
                timelineSettings.customTimelineSettings.topTier.unit : timelineSettings.customTimelineSettings.bottomTier.unit;
            switch (scheduleType) {
                case 'Minutes':
                    {
                        detail.startDate = new Date(timelineStartDate.getTime());
                        var sDays = Math.floor(pointToPixel(detail.startPoint) / (this.chartHeader.bottomTierCellWidth));
                        detail.startDate.setMinutes(detail.startDate.getMinutes() + sDays * count);
                        detail.startDate.setSeconds(detail.startDate.getSeconds() + 1);
                        detail.endDate = new Date(detail.startDate.getTime());
                        var eDays = Math.floor(pointToPixel(detail.endPoint - detail.startPoint)
                            / (this.chartHeader.bottomTierCellWidth));
                        detail.endDate.setMinutes(detail.endDate.getMinutes() + eDays * count);
                        break;
                    }
                case 'Hour':
                    {
                        detail.startDate = new Date(timelineStartDate.getTime());
                        var sDays1 = Math.floor(pointToPixel(detail.startPoint) / (this.chartHeader.bottomTierCellWidth));
                        detail.startDate.setHours(detail.startDate.getHours() + sDays1 * count);
                        detail.startDate.setMinutes(detail.startDate.getMinutes() + 1);
                        detail.endDate = new Date(detail.startDate.getTime());
                        var eDays1 = Math.floor(pointToPixel(detail.endPoint - detail.startPoint)
                            / (this.chartHeader.bottomTierCellWidth));
                        detail.endDate.setHours(detail.endDate.getHours() + eDays1 * count);
                        break;
                    }
                case 'Day':
                    {
                        detail.startDate = new Date(timelineStartDate.getTime());
                        var startDays = (Math.round(detail.startPoint / pixelToPoint(this.chartHeader.bottomTierCellWidth)));
                        detail.startDate.setDate(detail.startDate.getDate() + startDays * count);
                        var endDays = Math.round(((detail.endPoint - detail.startPoint)
                            / pixelToPoint(this.chartHeader.bottomTierCellWidth))) - 1;
                        detail.endDate = new Date(detail.startDate.getTime());
                        detail.endDate.setDate(detail.startDate.getDate() + endDays * count);
                        break;
                    }
                case 'Week':
                    {
                        detail.startDate = new Date(timelineStartDate.getTime());
                        var startDays1 = (detail.startPoint / pixelToPoint(this.chartHeader.bottomTierCellWidth) * 7);
                        detail.startDate.setDate(detail.startDate.getDate() + startDays1 * count);
                        var endDays1 = Math.round((detail.endPoint - detail.startPoint)
                            / pixelToPoint(this.chartHeader.bottomTierCellWidth)) * 7 - 1;
                        detail.endDate = new Date(detail.startDate.getTime());
                        detail.endDate.setDate(detail.startDate.getDate() + endDays1 * count);
                        break;
                    }
                case 'Month':
                    {
                        detail.startDate = new Date(timelineStartDate.getTime());
                        var startDays2 = (detail.startPoint / pixelToPoint(this.chartHeader.bottomTierCellWidth) * 31);
                        detail.startDate.setDate(detail.startDate.getDate() + startDays2 * count);
                        var endDays2 = Math.round((detail.endPoint - detail.startPoint)
                            / pixelToPoint(this.chartHeader.bottomTierCellWidth)) * 31 - 1;
                        detail.endDate = new Date(detail.startDate.getTime());
                        detail.endDate.setDate(detail.startDate.getDate() + endDays2 * count);
                        break;
                    }
                case 'Year':
                    {
                        detail.startDate = new Date(timelineStartDate.getTime());
                        var startDays3 = (detail.startPoint / pixelToPoint(this.chartHeader.bottomTierCellWidth) * 365);
                        detail.startDate.setDate(detail.startDate.getDate() + startDays3 * count);
                        var endDays3 = Math.round((detail.endPoint - detail.startPoint)
                            / pixelToPoint(this.chartHeader.bottomTierCellWidth)) * 365 - 1;
                        detail.endDate = new Date(detail.startDate.getTime());
                        detail.endDate.setDate(detail.startDate.getDate() + endDays3 * count);
                        break;
                    }
            }
            this.headerDetails.push(detail);
            point += width;
        }
    };
    PdfGantt.prototype.drawPageBorder = function () {
        var pages = this.result.page.section.getPages();
        for (var index = 0; index < pages.length; index++) {
            var page = pages[index];
            var graphics = page.graphics;
            var pageSize = page.getClientSize();
            var pen = new PdfPen(new PdfColor(206, 206, 206));
            graphics.drawRectangle(pen, 0, 0, pageSize.width, pageSize.height);
        }
    };
    //Draw the gantt chart side
    PdfGantt.prototype.drawGantttChart = function () {
        var _this = this;
        var taskbarPoint = this.startPoint;
        var pagePoint = new PointF();
        var pageStartX = 0;
        var cumulativeWidth = 0;
        var cumulativeHeight = 0;
        var totalHeight = 0;
        var pageData;
        this.headerDetails.forEach(function (detail, index) {
            var page = _this.result.page.section.getPages()[_this.startPageIndex];
            _this.chartHeader.drawTimeline(page, _this.startPoint, detail);
            taskbarPoint.y = taskbarPoint.y + pixelToPoint(_this.parent.timelineModule.isSingleTier ? 45 : 60); // headerHeight
            pageStartX = taskbarPoint.x;
            cumulativeHeight = pixelToPoint(_this.parent.timelineModule.isSingleTier ? 45 : 60); // headerHeight
            _this.headerDetails[_this.headerDetails.indexOf(detail)].startIndex = _this.startPageIndex;
            _this.headerDetails[_this.headerDetails.indexOf(detail)].pageStartPoint = taskbarPoint;
            for (var i = 0; i < _this.taskbarCollection.length; i++) {
                var task = _this.taskbarCollection[i];
                var rowHeight = _this.rows.getRow(i + 1).height;
                var pdfPage = _this.result.page.section.getPages()[_this.startPageIndex];
                /* eslint-disable-next-line */
                var isNextPage = task.drawTaskbar(pdfPage, taskbarPoint, detail, cumulativeWidth, rowHeight, _this.taskbarCollection[i]);
                if (isNextPage) {
                    if (_this.enableHeader) {
                        taskbarPoint.y = pixelToPoint(_this.parent.timelineModule.isSingleTier ? 45 : 60);
                    }
                    else {
                        taskbarPoint.y = 0;
                    }
                    _this.startPageIndex++;
                    pageData = {};
                    pageData.height = cumulativeHeight;
                    pageData.pageStartX = pageStartX;
                    pageData.startPoint = __assign({}, pagePoint);
                    pageData.width = pixelToPoint(detail.totalWidth);
                    _this.pdfPageDetail.push(pageData);
                    pagePoint.y += pageData.height;
                    if (_this.enableHeader) {
                        cumulativeHeight = _this.chartHeader.height;
                    }
                    else {
                        taskbarPoint.y = 0;
                        cumulativeHeight = 0;
                    }
                }
                taskbarPoint.y += rowHeight;
                cumulativeHeight += rowHeight;
                // eslint-disable-next-line
                totalHeight += rowHeight;
            }
            _this.headerDetails[index].endIndex = _this.startPageIndex;
            cumulativeWidth += detail.totalWidth;
            pageData = {};
            pageData.height = cumulativeHeight;
            pageData.pageStartX = pageStartX;
            pageData.startPoint = __assign({}, pagePoint);
            pageData.width = pixelToPoint(detail.totalWidth);
            _this.pdfPageDetail.push(pageData);
            pagePoint.x += pageData.width;
            pagePoint.y = 0;
            if (_this.enableHeader) {
                cumulativeHeight = _this.chartHeader.height;
            }
            else {
                taskbarPoint.y = 0;
            }
            if (_this.headerDetails.indexOf(detail) !== _this.headerDetails.length - 1) {
                _this.result.page.section.add();
                _this.startPageIndex = _this.result.page.section.count - 1;
                taskbarPoint = _this.startPoint = new PointF(0, 0);
            }
        });
        // Draw predecessor line.
        for (var i = 0; i < this.predecessorCollection.length; i++) {
            var predecessor = this.predecessorCollection[i];
            predecessor.drawPredecessor(this);
        }
    };
    return PdfGantt;
}(PdfTreeGrid));
export { PdfGantt };
