import { createElement } from '@syncfusion/ej2-base';
import { annotationRender, removeElement, ProgressLocation } from '../utils/helper';
/**
 * Base file for annotation
 */
var AnnotationBase = /** @class */ (function () {
    /**
     * Constructor for progress annotation
     *
     * @param {ProgressBar} control It called constructor
     */
    function AnnotationBase(control) {
        this.control = control;
    }
    AnnotationBase.prototype.render = function (annotation, index) {
        this.annotation = annotation;
        var childElement = createElement('div', {
            id: this.control.element.id + 'Annotation' + index,
            styles: 'position:absolute;z-index:1', innerHTML: annotation.content
        });
        return childElement;
    };
    /**
     * To process the annotation
     *
     * @param {ProgressAnnotationSettings} annotation One of the parameter called annotation
     * @param {number} index Index of the annotation
     * @param {HTMLElement} parentElement Parent element of the annotation
     */
    AnnotationBase.prototype.processAnnotation = function (annotation, index, parentElement) {
        var location = new ProgressLocation(0, 0);
        var annotationElement = this.render(annotation, index);
        if (annotationElement) {
            this.setElementStyle(location, annotationElement, parentElement);
        }
        else if (this.control.redraw) {
            removeElement(annotationElement.id);
            // tslint:disable-next-line:no-any
            if (this.control.isReact) {
                this.control.clearTemplate();
            }
        }
    };
    AnnotationBase.prototype.setElementStyle = function (location, element, parentElement) {
        var argsData = {
            cancel: false, name: annotationRender, content: element,
            location: location
        };
        this.control.trigger(annotationRender, argsData);
        if (!argsData.cancel) {
            var result = this.Location(this.annotation.annotationRadius, this.annotation.annotationAngle);
            argsData.content.style.left = result.left + 'px';
            argsData.content.style.top = result.top + 'px';
            argsData.content.style.transform = 'translate(-50%, -50%)';
            argsData.content.setAttribute('aria-label', 'Annotation');
            parentElement.appendChild(argsData.content);
            // tslint:disable-next-line:no-any
            if (this.control.isReact) {
                this.control.renderReactTemplates();
            }
        }
    };
    AnnotationBase.prototype.Location = function (radius, angle) {
        var top;
        var left;
        var radius1 = parseFloat(radius);
        if (radius1 === 0 && angle === 0) {
            var rect = this.control.progressRect;
            left = rect.x + (rect.width / 2);
            top = rect.y + (rect.height / 2);
        }
        else {
            var degToRadFactor = Math.PI / 180;
            angle = angle - 90;
            angle = angle * degToRadFactor;
            var x = Math.round(this.control.progressSize.width / 2.25);
            var y = Math.round(this.control.progressSize.height / 2.25);
            left = (radius1 * Math.cos(angle)) + x;
            top = (radius1 * Math.sin(angle)) + y;
        }
        return {
            top: top, left: left
        };
    };
    return AnnotationBase;
}());
export { AnnotationBase };
