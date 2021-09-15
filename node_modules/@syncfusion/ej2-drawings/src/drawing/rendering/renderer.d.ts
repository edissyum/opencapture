import { DrawingElement } from '../core/elements/drawing-element';
import { PathElement } from '../core/elements/path-element';
import { TextElement } from '../core/elements/text-element';
import { Container } from '../core/containers/container';
import { BaseAttributes } from './canvas-interface';
import { CanvasRenderer } from './canvas-renderer';
import { ImageElement } from '../core/elements/image-element';
/**
 * Renderer module is used to render basic diagram elements
 */
/** @private */
export declare class DrawingRenderer {
    /**   @private  */
    renderer: CanvasRenderer;
    private diagramId;
    /** @private */
    adornerSvgLayer: SVGSVGElement;
    /** @private */
    isSvgMode: Boolean;
    /** @private */
    private element;
    constructor(name: string, isSvgMode: Boolean);
    /**   @private  */
    renderElement(element: DrawingElement, canvas: HTMLCanvasElement | SVGElement, htmlLayer: HTMLElement, transform?: Transforms, parentSvg?: SVGSVGElement, createParent?: boolean, fromPalette?: boolean, indexValue?: number): void;
    /**   @private  */
    renderImageElement(element: ImageElement, canvas: HTMLCanvasElement | SVGElement, transform?: Transforms, parentSvg?: SVGSVGElement, fromPalette?: boolean): void;
    /**   @private  */
    renderPathElement(element: PathElement, canvas: HTMLCanvasElement | SVGElement, transform?: Transforms, parentSvg?: SVGSVGElement, fromPalette?: boolean): void;
    /**   @private  */
    renderTextElement(element: TextElement, canvas: HTMLCanvasElement | SVGElement, transform?: Transforms, parentSvg?: SVGSVGElement, fromPalette?: boolean): void;
    /**   @private  */
    renderContainer(group: Container, canvas: HTMLCanvasElement | SVGElement, htmlLayer: HTMLElement, transform?: Transforms, parentSvg?: SVGSVGElement, createParent?: boolean, fromPalette?: boolean, indexValue?: number): void;
    /**   @private  */
    renderRect(element: DrawingElement, canvas: HTMLCanvasElement | SVGElement, transform?: Transforms, parentSvg?: SVGSVGElement): void;
    /**   @private  */
    getBaseAttributes(element: DrawingElement, transform?: Transforms): BaseAttributes;
}
interface Transforms {
    tx: number;
    ty: number;
    scale: number;
}
export {};
