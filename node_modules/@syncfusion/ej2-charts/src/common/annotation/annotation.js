import { createTemplate, measureElementRect, logBase, removeElement } from '../utils/helper';
import { ChartLocation, stringToNumber, appendElement, withIn } from '../utils/helper';
import { Rect } from '@syncfusion/ej2-svg-base';
import { getPoint } from '../utils/helper';
import { createElement, updateBlazorTemplate } from '@syncfusion/ej2-base';
import { annotationRender } from '../model/constants';
import { DataUtil } from '@syncfusion/ej2-data';
/**
 * Annotation Module handles the Annotation for chart and accumulation series.
 */
var AnnotationBase = /** @class */ (function () {
    /**
     * Constructor for chart and accumulation annotation
     *
     * @param control
     */
    function AnnotationBase(control) {
        this.control = control;
    }
    /**
     * Method to render the annotation for chart and accumulation series.
     *
     * @private
     * @param annotation
     * @param index
     */
    AnnotationBase.prototype.render = function (annotation, index) {
        this.isChart = this.control.getModuleName() === 'chart';
        this.annotation = annotation;
        var childElement = createTemplate(createElement('div', {
            id: this.control.element.id + '_Annotation_' + index,
            styles: 'position: absolute; z-index: 1' //by default z-index set for annotation elements
        }), index, annotation.content, this.control);
        return childElement;
    };
    /**
     * Method to calculate the location for annotation - coordinate unit as pixel.
     *
     * @private
     * @param location
     */
    AnnotationBase.prototype.setAnnotationPixelValue = function (location) {
        var rect = this.annotation.region === 'Chart' ?
            new Rect(0, 0, this.control.availableSize.width, this.control.availableSize.height) :
            this.isChart ?
                this.control.chartAxisLayoutPanel.seriesClipRect :
                this.control.series[0].accumulationBound;
        location.x = ((typeof this.annotation.x !== 'string') ?
            ((typeof this.annotation.x === 'number') ? this.annotation.x : 0) :
            stringToNumber(this.annotation.x, rect.width)) + rect.x;
        location.y = ((typeof this.annotation.y === 'number') ? this.annotation.y :
            stringToNumber(this.annotation.y, rect.height)) + rect.y;
        return true;
    };
    /**
     * Method to calculate the location for annotation - coordinate unit as point.
     *
     * @private
     * @param location
     */
    AnnotationBase.prototype.setAnnotationPointValue = function (location) {
        var symbolLocation = new ChartLocation(0, 0);
        if (this.isChart) {
            var chart = this.control;
            var annotation = this.annotation;
            var xAxisName = annotation.xAxisName;
            var yAxisName = annotation.yAxisName;
            var isInverted = chart.requireInvertedAxis;
            var stockChart = this.control.stockChart;
            var xAxis = void 0;
            var yAxis = void 0;
            var xValue = void 0;
            for (var _i = 0, _a = chart.axisCollections; _i < _a.length; _i++) {
                var axis = _a[_i];
                if (xAxisName === axis.name || (xAxisName == null && axis.name === 'primaryXAxis')) {
                    xAxis = axis;
                    if (xAxis.valueType.indexOf('Category') > -1) {
                        var xAnnotation = xAxis.valueType === 'DateTimeCategory' ? (annotation.x.getTime()).toString() :
                            annotation.x;
                        if (xAxis.labels.indexOf(xAnnotation) < 0) {
                            return false;
                        }
                        else {
                            xValue = xAxis.labels.indexOf(xAnnotation);
                        }
                    }
                    else if (xAxis.valueType === 'DateTime') {
                        var option = { skeleton: 'full', type: 'dateTime' };
                        xValue = (typeof this.annotation.x === 'object' || typeof new Date(this.annotation.x) === 'object') ?
                            Date.parse(chart.intl.getDateParser(option)(chart.intl.getDateFormat(option)(new Date(DataUtil.parse.parseJson({ val: annotation.x }).val)))) : 0;
                    }
                    else {
                        xValue = +annotation.x;
                    }
                }
                else if (yAxisName === axis.name || (yAxisName == null && axis.name === 'primaryYAxis')) {
                    yAxis = axis;
                }
            }
            if (xAxis && yAxis && withIn(xAxis.valueType === 'Logarithmic' ? logBase(xValue, xAxis.logBase) : xValue, xAxis.visibleRange) && withIn(yAxis.valueType === 'Logarithmic' ? logBase(+annotation.y, yAxis.logBase) : +annotation.y, yAxis.visibleRange)) {
                symbolLocation = getPoint(xValue, +annotation.y, xAxis, yAxis, isInverted);
                location.x = symbolLocation.x + (isInverted ? yAxis.rect.x : xAxis.rect.x);
                // for stockchart, stockchart's toolbar height and title size is added for annotation content
                location.y = symbolLocation.y + (isInverted ? xAxis.rect.y : yAxis.rect.y) +
                    ((stockChart && stockChart.enablePeriodSelector) ? stockChart.toolbarHeight + stockChart.titleSize.height : 0);
            }
            else {
                return false;
            }
            return true;
        }
        else {
            return this.setAccumulationPointValue(location);
        }
    };
    /**
     * To process the annotation for accumulation chart
     *
     * @param annotation
     * @param index
     * @param parentElement
     */
    AnnotationBase.prototype.processAnnotation = function (annotation, index, parentElement) {
        var chart = this.control;
        var location = new ChartLocation(0, 0);
        var annotationElement = this.render(annotation, index);
        var annotationRendered = function () {
            annotationElement.style.transform = 'translate(-50%, -50%)';
        };
        annotationRendered.bind(location, this);
        if (this['setAnnotation' + annotation.coordinateUnits + 'Value'](location)) {
            this.setElementStyle(location, annotationElement, parentElement);
        }
        else if (this.control.redraw) {
            removeElement(annotationElement.id);
        }
        updateBlazorTemplate((this.control.element.id + 'Annotation' + index).replace(/[^a-zA-Z0-9]/g, ''), 'ContentTemplate', chart.stockChart ? chart.stockChart.annotations[index] : this.control.annotations[index], undefined, annotationRendered);
    };
    /**
     * Method to calculate the location for annotation - coordinate unit as point in accumulation chart.
     *
     * @private
     * @param location
     */
    AnnotationBase.prototype.setAccumulationPointValue = function (location) {
        var accumulation = this.control;
        var point;
        for (var _i = 0, _a = accumulation.visibleSeries[0].points; _i < _a.length; _i++) {
            var accPoint = _a[_i];
            if (typeof accPoint.x === 'object') {
                if (Date.parse(accPoint.x) === Date.parse(this.annotation.x) &&
                    accPoint.y === this.annotation.y) {
                    point = accPoint;
                    break;
                }
            }
            else {
                if (accPoint.x == this.annotation.x && accPoint.y == this.annotation.y) {
                    point = accPoint;
                    break;
                }
            }
        }
        if (point && point.visible) {
            location.x = point.symbolLocation.x;
            location.y = point.symbolLocation.y;
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Method to set the element style for accumulation / chart annotation.
     *
     * @private
     * @param location
     * @param element
     * @param parentElement
     */
    AnnotationBase.prototype.setElementStyle = function (location, element, parentElement) {
        var elementRect = measureElementRect(element, this.control.redraw);
        var argsData = {
            cancel: false, name: annotationRender, content: element,
            location: location
        };
        this.control.trigger(annotationRender, argsData);
        if (!argsData.cancel) {
            argsData.content.style.left = this.setAlignmentValue(this.annotation.horizontalAlignment, elementRect.width, argsData.location.x) + 'px';
            argsData.content.style.top = this.setAlignmentValue(this.annotation.verticalAlignment, elementRect.height, argsData.location.y) + 'px';
            argsData.content.setAttribute('aria-label', this.annotation.description || 'Annotation');
            appendElement(argsData.content, parentElement, this.control.redraw, true, 'left', 'top');
        }
    };
    /**
     * Method to calculate the alignment value for annotation.
     *
     * @private
     * @param alignment
     * @param size
     * @param value
     */
    AnnotationBase.prototype.setAlignmentValue = function (alignment, size, value) {
        switch (alignment) {
            case 'Top':
            case 'Near':
                value -= size;
                break;
            case 'Bottom':
            case 'Far':
                value += 0;
                break;
            case 'Middle':
            case 'Center':
                value -= (size / 2);
                break;
        }
        return value;
    };
    return AnnotationBase;
}());
export { AnnotationBase };
