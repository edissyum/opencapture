import { PointModel } from './../primitives/point-model';
import { ImageAttributes } from './canvas-interface';
import { RectAttributes, PathAttributes, TextAttributes, SubTextElement, TextBounds } from './canvas-interface';
import { DrawingElement } from '../core/elements/drawing-element';
import { DrawingRenderer } from './renderer';
/**
 * Canvas Renderer
 */
/** @private */
export declare class CanvasRenderer {
    /**   @private  */
    static getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D;
    private setStyle;
    private rotateContext;
    private setFontStyle;
    /**   @private  */
    parseDashArray(dashArray: string): number[];
    /**   @private  */
    drawRectangle(canvas: HTMLCanvasElement, options: RectAttributes): void;
    /**   @private  */
    drawPath(canvas: HTMLCanvasElement, options: PathAttributes): void;
    /**   @private  */
    renderPath(canvas: HTMLCanvasElement, options: PathAttributes, collection: Object[]): void;
    /**   @private  */
    drawText(canvas: HTMLCanvasElement, options: TextAttributes): void;
    private m;
    private r;
    private a;
    private getMeetOffset;
    private getSliceOffset;
    private image;
    private loadImage;
    /**   @private  */
    drawImage(canvas: HTMLCanvasElement, obj: ImageAttributes, parentSvg?: SVGSVGElement, fromPalette?: boolean): void;
    /**   @private  */
    labelAlign(text: TextAttributes, wrapBounds: TextBounds, childNodes: SubTextElement[]): PointModel;
}
export declare function refreshDiagramElements(canvas: HTMLCanvasElement, drawingObjects: DrawingElement[], renderer: DrawingRenderer): void;
