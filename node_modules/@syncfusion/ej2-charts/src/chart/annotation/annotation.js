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
import { AnnotationBase } from '../../common/annotation/annotation';
import { appendElement, redrawElement } from '../../common/utils/helper';
import { createElement } from '@syncfusion/ej2-base';
/**
 * `ChartAnnotation` module handles the annotation for chart.
 */
var ChartAnnotation = /** @class */ (function (_super) {
    __extends(ChartAnnotation, _super);
    /**
     * Constructor for chart annotation.
     *
     * @private
     */
    function ChartAnnotation(control, annotations) {
        var _this = _super.call(this, control) || this;
        _this.chart = control;
        _this.annotations = annotations;
        return _this;
    }
    /**
     * Method to render the annotation for chart
     *
     * @param {Element} element annotation element
     * @private
     */
    ChartAnnotation.prototype.renderAnnotations = function (element) {
        var _this = this;
        this.annotations = this.chart.annotations;
        this.parentElement = redrawElement(this.chart.redraw, this.chart.element.id + '_Annotation_Collections') ||
            createElement('div', {
                id: this.chart.element.id + '_Annotation_Collections'
            });
        this.annotations.map(function (annotation, index) {
            _this.processAnnotation(annotation, index, _this.parentElement);
        });
        appendElement(this.parentElement, element, this.chart.redraw);
    };
    /**
     * To destroy the annotation.
     *
     * @returns {void}
     * @private
     */
    ChartAnnotation.prototype.destroy = function () {
        // Destroy method performed here
    };
    /**
     * Get module name.
     */
    ChartAnnotation.prototype.getModuleName = function () {
        // Returns te module name
        return 'Annotation';
    };
    return ChartAnnotation;
}(AnnotationBase));
export { ChartAnnotation };
