import { PointModel } from './../primitives/point-model';
import { RectAttributes, TextAttributes, LineAttributes, PathAttributes } from './canvas-interface';
import { StyleAttributes } from './canvas-interface';
import { CircleAttributes, SubTextElement, TextBounds } from './canvas-interface';
import { IRenderer } from './../rendering/IRenderer';
import { DrawingElement } from '../core/elements/drawing-element';
/**
 * SVG Renderer
 */
/** @private */
export declare class SvgRenderer implements IRenderer {
    /**   @private  */
    parseDashArray(dashArray: string): number[];
    /**   @private  */
    drawRectangle(svg: SVGElement, options: RectAttributes, diagramId: string, onlyRect?: boolean, isSelector?: Boolean, parentSvg?: SVGSVGElement, ariaLabel?: Object): void;
    /**   @private  */
    updateSelectionRegion(gElement: SVGElement, options: RectAttributes): void;
    /**   @private  */
    createGElement(elementType: string, attribute: Object): SVGGElement;
    /** @private */
    drawCircle(gElement: SVGElement, options: CircleAttributes, enableSelector?: number, ariaLabel?: Object): void;
    /**   @private  */
    setSvgStyle(svg: SVGElement, style: StyleAttributes, diagramId?: string): void;
    /**   @private  */
    svgLabelAlign(text: TextAttributes, wrapBound: TextBounds, childNodes: SubTextElement[]): PointModel;
    /** @private */
    drawLine(gElement: SVGElement, options: LineAttributes): void;
    /**   @private  */
    drawPath(svg: SVGElement, options: PathAttributes, diagramId: string, isSelector?: Boolean, parentSvg?: SVGSVGElement, ariaLabel?: Object): void;
    /**   @private  */
    renderPath(svg: SVGElement, options: PathAttributes, collection: Object[]): void;
}
/** @private */
export declare function setAttributeSvg(svg: SVGElement, attributes: Object): void;
/** @private */
export declare function createSvgElement(elementType: string, attribute: Object): SVGElement;
/** @private */
export declare function createSvg(id: string, width: string | Number, height: string | Number): SVGElement;
export declare function getParentSvg(element: DrawingElement, targetElement?: string, canvas?: HTMLCanvasElement | SVGElement): SVGElement;
