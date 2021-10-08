/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable valid-jsdoc */
/**
 * AccumulationChart annotation properties
 */
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
 * `AccumulationAnnotation` module handles the annotation for accumulation chart.
 */
var AccumulationAnnotation = /** @class */ (function (_super) {
    __extends(AccumulationAnnotation, _super);
    /**
     * Constructor for accumulation chart annotation.
     *
     * @private
     */
    function AccumulationAnnotation(control) {
        var _this = _super.call(this, control) || this;
        _this.pie = control;
        return _this;
    }
    /**
     * Method to render the annotation for accumulation chart
     *
     * @param {Element} element Annotation element.
     */
    AccumulationAnnotation.prototype.renderAnnotations = function (element) {
        var _this = this;
        this.annotations = this.pie.annotations;
        var redraw = this.pie.redraw;
        this.parentElement = (redrawElement(redraw, this.pie.element.id + '_Annotation_Collections') ||
            createElement('div', {
                id: this.pie.element.id + '_Annotation_Collections'
            }));
        this.annotations.map(function (annotation, index) {
            _this.processAnnotation(annotation, index, _this.parentElement);
        });
        appendElement(this.parentElement, element, redraw);
    };
    /**
     * Get module name.
     */
    AccumulationAnnotation.prototype.getModuleName = function () {
        // Returns te module name
        return 'Annotation';
    };
    /**
     * To destroy the annotation.
     *
     * @returns {void}
     *
     * @private
     */
    AccumulationAnnotation.prototype.destroy = function () {
        // Destroy method performed here
    };
    return AccumulationAnnotation;
}(AnnotationBase));
export { AccumulationAnnotation };
