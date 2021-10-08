import { PointModel } from '../primitives/point-model';
import { Rect } from '../primitives/rect';
import { Size } from '../primitives/size';
import { TextStyleModel } from './../core/appearance-model';
import { PathElement } from '../core/elements/path-element';
import { TextElement } from '../core/elements/text-element';
/**
 * Defines the functionalities that need to access DOM
 */
export declare function getChildNode(node: SVGElement): SVGElement[] | HTMLCollection;
export declare function translatePoints(element: PathElement, points: PointModel[]): PointModel[];
/** @private */
export declare function measurePath(data: string): Rect;
/** @private */
export declare function measureText(text: TextElement, style: TextStyleModel, content: string, maxWidth?: number, textValue?: string): Size;
/** @private */
export declare function getDiagramElement(elementId: string, contentId?: string): HTMLElement;
/** @private */
export declare function createHtmlElement(elementType: string, attribute: Object): HTMLElement;
/** @private */
export declare function setAttributeHtml(element: HTMLElement, attributes: Object): void;
/**
 * @private
 */
export declare function getAdornerLayerSvg(diagramId: string, index?: number): SVGSVGElement;
/** @private */
export declare function getSelectorElement(diagramId: string, index?: number): SVGElement;
/** @private */
export declare function createMeasureElements(): void;
/** @private */
export declare function measureImage(source: string, contentSize: Size): Size;
