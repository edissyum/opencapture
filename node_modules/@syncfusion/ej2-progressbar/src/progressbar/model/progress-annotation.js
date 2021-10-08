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
import { createElement } from '@syncfusion/ej2-base';
import { AnnotationBase } from './annotation';
import { ProgressAnimation } from '../utils/progress-animation';
/**
 * Class for progress annotation
 */
var ProgressAnnotation = /** @class */ (function (_super) {
    __extends(ProgressAnnotation, _super);
    /**
     * Constructor for ProgressBar annotation
     *
     * @private
     * @param {ProgressBar} control Passed the control
     * @param {annotations} annotations ProgressAnnotationSettings
     */
    function ProgressAnnotation(control, annotations) {
        var _this = _super.call(this, control) || this;
        _this.animation = new ProgressAnimation();
        _this.progress = control;
        _this.annotations = annotations;
        return _this;
    }
    /**
     * Method to render the annotation for ProgressBar
     *
     * @param {Element} element Annotation element.
     * @private
     */
    ProgressAnnotation.prototype.renderAnnotations = function (element) {
        var _this = this;
        this.annotations = this.progress.annotations;
        var parentElement = document.getElementById(this.progress.element.id + 'Annotation_collections');
        this.parentElement = parentElement ? parentElement : createElement('div', {
            id: this.progress.element.id + 'Annotation_collections',
            styles: 'position:absolute'
        });
        this.annotations.map(function (annotation, index) {
            _this.processAnnotation(annotation, index, _this.parentElement);
        });
        if (!parentElement) {
            element.appendChild(this.parentElement);
        }
        if (this.progress.animation.enable && !this.progress.isIndeterminate) {
            this.animation.doAnnotationAnimation(this.progress.clipPath, this.progress);
        }
    };
    /**
     * Get module name.
     */
    ProgressAnnotation.prototype.getModuleName = function () {
        return 'ProgressAnnotation';
    };
    /**
     * To destroy the annotation.
     *
     * @returns {void}
     * @private
     */
    ProgressAnnotation.prototype.destroy = function () {
        // Destroy method performed here
    };
    return ProgressAnnotation;
}(AnnotationBase));
export { ProgressAnnotation };
