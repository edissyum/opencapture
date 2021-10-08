import { PathElement } from '../core/elements/path-element';
import { TextElement } from '../core/elements/text-element';
import { Container } from '../core/containers/container';
import { wordBreakToString, whiteSpaceToString, textAlignToString } from '../utility/base-util';
import { getDiagramElement } from '../utility/dom-util';
import { CanvasRenderer } from './canvas-renderer';
import { ImageElement } from '../core/elements/image-element';
/**
 * Renderer module is used to render basic diagram elements
 */
/** @private */
var DrawingRenderer = /** @class */ (function () {
    function DrawingRenderer(name, isSvgMode) {
        /**   @private  */
        this.renderer = null;
        // private svgRenderer: SvgRenderer;
        /** @private */
        this.isSvgMode = true;
        this.diagramId = name;
        this.element = getDiagramElement(this.diagramId);
        this.isSvgMode = isSvgMode;
        this.renderer = new CanvasRenderer();
        //  this.svgRenderer = new SvgRenderer();
    }
    // /** @private */
    // public setLayers(): void {
    //     this.adornerSvgLayer = this.element.getElementsByClassName('e-adorner-layer')[0] as SVGSVGElement;
    // }
    /**   @private  */
    DrawingRenderer.prototype.renderElement = function (element, canvas, htmlLayer, transform, parentSvg, createParent, fromPalette, indexValue) {
        var isElement = true;
        if (element instanceof Container) {
            isElement = false;
            this.renderContainer(element, canvas, htmlLayer, transform, parentSvg, createParent, fromPalette, indexValue);
        }
        else if (element instanceof ImageElement) {
            this.renderImageElement(element, canvas, transform, parentSvg, fromPalette);
        }
        else if (element instanceof PathElement) {
            this.renderPathElement(element, canvas, transform, parentSvg, fromPalette);
        }
        else if (element instanceof TextElement) {
            this.renderTextElement(element, canvas, transform, parentSvg, fromPalette);
        }
        else {
            this.renderRect(element, canvas, transform, parentSvg);
        }
    };
    /**   @private  */
    DrawingRenderer.prototype.renderImageElement = function (element, canvas, transform, parentSvg, fromPalette) {
        var options = this.getBaseAttributes(element, transform);
        options.cornerRadius = 0;
        this.renderer.drawRectangle(canvas, options);
        // let sx: number; let sy: number;
        var imageWidth;
        var imageHeight;
        var sourceWidth;
        var sourceHeight;
        if (element.stretch === 'Stretch') {
            imageWidth = element.actualSize.width;
            imageHeight = element.actualSize.height;
        }
        else {
            var contentWidth = element.contentSize.width;
            var contentHeight = element.contentSize.height;
            var widthRatio = options.width / contentWidth;
            var heightRatio = options.height / contentHeight;
            var ratio = void 0;
            switch (element.stretch) {
                case 'Meet':
                    ratio = Math.min(widthRatio, heightRatio);
                    imageWidth = contentWidth * ratio;
                    imageHeight = contentHeight * ratio;
                    options.x += Math.abs(options.width - imageWidth) / 2;
                    options.y += Math.abs(options.height - imageHeight) / 2;
                    break;
                case 'Slice':
                    widthRatio = options.width / contentWidth;
                    heightRatio = options.height / contentHeight;
                    ratio = Math.max(widthRatio, heightRatio);
                    imageWidth = contentWidth * ratio;
                    imageHeight = contentHeight * ratio;
                    sourceWidth = options.width / imageWidth * contentWidth;
                    sourceHeight = options.height / imageHeight * contentHeight;
                    break;
                case 'None':
                    imageWidth = contentWidth;
                    imageHeight = contentHeight;
                    break;
            }
        }
        options.width = imageWidth;
        options.height = imageHeight;
        //Commented for code coverage
        //(options as ImageAttributes).sourceX = sx;
        //(options as ImageAttrib                                                                           utes).sourceY = sy;
        options.sourceWidth = sourceWidth;
        options.sourceHeight = sourceHeight;
        options.source = element.source;
        options.alignment = element.imageAlign;
        options.scale = element.imageScale;
        this.renderer.drawImage(canvas, options, parentSvg, fromPalette);
    };
    /**   @private  */
    DrawingRenderer.prototype.renderPathElement = function (element, canvas, transform, parentSvg, fromPalette) {
        var options = this.getBaseAttributes(element, transform);
        options.data = element.absolutePath;
        options.data = element.absolutePath;
        var ariaLabel = element.id;
        if (!this.isSvgMode) {
            options.x = options.x;
            options.y = options.y;
        }
        this.renderer.drawPath(canvas, options);
    };
    /**   @private  */
    DrawingRenderer.prototype.renderTextElement = function (element, canvas, transform, parentSvg, fromPalette) {
        var options = this.getBaseAttributes(element, transform);
        options.cornerRadius = 0;
        options.whiteSpace = whiteSpaceToString(element.style.whiteSpace, element.style.textWrapping);
        options.content = element.content;
        options.breakWord = wordBreakToString(element.style.textWrapping);
        options.textAlign = textAlignToString(element.style.textAlign);
        options.color = element.style.color;
        options.italic = element.style.italic;
        options.bold = element.style.bold;
        options.fontSize = element.style.fontSize;
        options.fontFamily = element.style.fontFamily;
        options.textOverflow = element.style.textOverflow;
        options.textDecoration = element.style.textDecoration;
        options.doWrap = element.doWrap;
        options.wrapBounds = element.wrapBounds;
        options.childNodes = element.childNodes;
        options.dashArray = '';
        options.strokeWidth = 0;
        options.fill = element.style.fill;
        var ariaLabel = element.content ? element.content : element.id;
        this.renderer.drawRectangle(canvas, options);
        this.renderer.drawText(canvas, options);
    };
    /**   @private  */
    DrawingRenderer.prototype.renderContainer = function (group, canvas, htmlLayer, transform, parentSvg, createParent, fromPalette, indexValue) {
        transform = { tx: 0, ty: 0, scale: 1 };
        var svgParent = { svg: parentSvg, g: canvas };
        if (this.diagramId) {
            parentSvg = parentSvg;
        }
        this.renderRect(group, canvas, transform, parentSvg);
        if (group.hasChildren()) {
            var parentG = void 0;
            var svgParent_1;
            for (var _i = 0, _a = group.children; _i < _a.length; _i++) {
                var child = _a[_i];
                this.renderElement(child, parentG || canvas, htmlLayer, transform, parentSvg, true, fromPalette, indexValue);
            }
        }
    };
    /**   @private  */
    DrawingRenderer.prototype.renderRect = function (element, canvas, transform, parentSvg) {
        var options = this.getBaseAttributes(element, transform);
        options.cornerRadius = element.cornerRadius || 0;
        var ariaLabel = element.id;
        this.renderer.drawRectangle(canvas, options);
    };
    /**   @private  */
    DrawingRenderer.prototype.getBaseAttributes = function (element, transform) {
        var options = {
            width: element.actualSize.width, height: element.actualSize.height,
            x: element.offsetX - element.actualSize.width * element.pivot.x + 0.5,
            y: element.offsetY - element.actualSize.height * element.pivot.y + 0.5,
            fill: element.style.fill, stroke: element.style.strokeColor, angle: element.rotateAngle + element.parentTransform,
            pivotX: element.pivot.x, pivotY: element.pivot.y, strokeWidth: element.style.strokeWidth,
            dashArray: element.style.strokeDashArray || '', opacity: element.style.opacity,
            visible: element.visible, id: element.id, gradient: element.style.gradient,
        };
        if (transform) {
            options.x += transform.tx;
            options.y += transform.ty;
        }
        return options;
    };
    return DrawingRenderer;
}());
export { DrawingRenderer };
