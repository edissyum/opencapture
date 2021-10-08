import { PointModel } from '../primitives/point-model';
import { Rect } from '../primitives/rect';
import { Size } from '../primitives/size';
import { TextStyleModel } from './../core/appearance-model';
import { PathElement } from '../core/elements/path-element';
import { TextElement } from '../core/elements/text-element';
import { ITouches } from '../objects/interface/interfaces';
import { DiagramHtmlElement } from '../core/elements/html-element';
import { Node } from '../objects/node';
import { DiagramNativeElement } from '../core/elements/native-element';
import { BaseAttributes, TextAttributes, SubTextElement } from '../rendering/canvas-interface';
import { Annotation, PathAnnotation } from '../objects/annotation';
import { SelectorModel } from '../objects/node-model';
/**
 * Defines the functionalities that need to access DOM
 */
/**
 * removeElementsByClass method \
 *
 * @returns {void} removeElementsByClass method .\
 * @param { string } className - provide the element  value.
 * @param {string} id - provide the string  value.
 * @private
 */
export declare function removeElementsByClass(className: string, id?: string): void;
/**
 * findSegmentPoints method \
 *
 * @returns {PointModel[]} findSegmentPoints method .\
 * @param { PathElement } element - provide the element  value.
 * @private
 */
export declare function findSegmentPoints(element: PathElement): PointModel[];
/**
 * getChildNode method \
 *
 * @returns {SVGElement[] | HTMLCollection} findSegmentPoints method .\
 * @param { SVGElement } node - provide the element  value.
 * @private
 */
export declare function getChildNode(node: SVGElement): SVGElement[] | HTMLCollection;
/**
 * translatePoints method \
 *
 * @returns {PointModel[]} translatePoints method .\
 * @param { SVGElement } element - provide the element  value.
 * @param { PointModel[] } points - provide the element  value.
 * @private
 */
export declare function translatePoints(element: PathElement, points: PointModel[]): PointModel[];
/**
 * measurePath method \
 *
 * @returns {Rect} measurePath method .\
 * @param { string } data - provide the element  value.
 * @private
 */
export declare function measurePath(data: string): Rect;
/**
 * measureHtmlText method \
 *
 * @returns {TextBounds} measureHtmlText method .\
 * @param { TextStyleModel } style - provide the style  value.
 * @param { string } content - provide the content  value.
 * @param { string } width - provide the width  value.
 * @param { string } height - provide the height  value.
 * @param { string } maxWidth - provide the maxWidth  value.
 * @private
 */
export declare function measureHtmlText(style: TextStyleModel, content: string, width: number, height: number, maxWidth?: number): Size;
/**
 * measureText method \
 *
 * @returns {Size} measureText method .\
 * @param { TextStyleModel } text - provide the text  value.
 * @param { string } style - provide the style  value.
 * @param { string } content - provide the content  value.
 * @param { number } maxWidth - provide the maxWidth  value.
 * @param { string } textValue - provide the textValue  value.
 * @private
 */
export declare function measureText(text: TextElement, style: TextStyleModel, content: string, maxWidth?: number, textValue?: string): Size;
/**
 * measureImage method \
 *
 * @returns {Size} measureImage method .\
 * @param { string } source - provide the text  value.
 * @param { Size } contentSize - provide the style  value.
 * @param { string } id - provide the content  value.
 * @param { Function } callback - provide the maxWidth  value.
 * @private
 */
export declare function measureImage(source: string, contentSize: Size, id?: string, callback?: Function): Size;
/**
 * measureNativeContent method \
 *
 * @returns {Rect} measureNativeContent method .\
 * @param { SVGElement } nativeContent - provide the text  value.
 * @private
 */
export declare function measureNativeContent(nativeContent: SVGElement): Rect;
/**
 * measureNativeSvg method \
 *
 * @returns {Rect} measureNativeSvg method .\
 * @param { SVGElement } nativeContent - provide the text  value.
 * @private
 */
export declare function measureNativeSvg(nativeContent: SVGElement): Rect;
/**
 * updatePath method \
 *
 * @returns {string} updatePath method .\
 * @param { SVGElement } element - provide the element  value.
 * @param { Rect } bounds - provide the bounds  value.
 * @param { PathElement } child - provide the child  value.
 * @param { BaseAttributes } options - provide the options  value.
 * @private
 */
export declare function updatePath(element: PathElement, bounds: Rect, child: PathElement, options?: BaseAttributes): string;
/**
 * getDiagramLayerSvg method \
 *
 * @returns {string} getDiagramLayerSvg method .\
 * @param { string } diagramId - provide the element  value.
 * @private
 */
export declare function getDiagramLayerSvg(diagramId: string): SVGSVGElement;
/**
 * getDiagramElement method \
 *
 * @returns {HTMLElement} getDiagramElement method .\
 * @param { string } elementId - provide the elementId  value.
 * @param { string } contentId - provide the elementId  value.
 * @private
 */
export declare function getDiagramElement(elementId: string, contentId?: string): HTMLElement;
/**
 * getDomIndex method \
 *
 * @returns {HTMLElement} getDomIndex method .\
 * @param { string } viewId - provide the elementId  value.
 * @param { string } elementId - provide the elementId  value.
 * @param { string } layer - provide the elementId  value.
 * @private
 */
export declare function getDomIndex(viewId: string, elementId: string, layer: string): number;
/**
 * getAdornerLayerSvg method \
 *
 * @returns {SVGSVGElement} getAdornerLayerSvg method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getAdornerLayerSvg(diagramId: string): SVGSVGElement;
/**
 * getSelectorElement method \
 *
 * @returns {SVGSVGElement} getSelectorElement method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getSelectorElement(diagramId: string): SVGElement;
/**
 * getAdornerLayer method \
 *
 * @returns {SVGSVGElement} getAdornerLayer method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getAdornerLayer(diagramId: string): SVGElement;
/**
 * getUserHandleLayer method \
 *
 * @returns {HTMLElement} getUserHandleLayer method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getUserHandleLayer(diagramId: string): HTMLElement;
/**
 * getDiagramLayer method \
 *
 * @returns {HTMLElement} getDiagramLayer method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getDiagramLayer(diagramId: string): SVGElement;
/**
 * getPortLayerSvg method \
 *
 * @returns {SVGSVGElement} getPortLayerSvg method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getPortLayerSvg(diagramId: string): SVGSVGElement;
/**
 * getNativeLayerSvg method \
 *
 * @returns {SVGSVGElement} getNativeLayerSvg method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getNativeLayerSvg(diagramId: string): SVGSVGElement;
/**
 * getGridLayerSvg method \
 *
 * @returns {SVGSVGElement} getNativeLayerSvg method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getGridLayerSvg(diagramId: string): SVGSVGElement;
/**
 * getBackgroundLayerSvg method \
 *
 * @returns {SVGSVGElement} getBackgroundLayerSvg method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getBackgroundLayerSvg(diagramId: string): SVGSVGElement;
/**
 * getBackgroundImageLayer method \
 *
 * @returns {SVGSVGElement} getBackgroundImageLayer method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getBackgroundImageLayer(diagramId: string): SVGSVGElement;
/**
 * getBackgroundLayer method \
 *
 * @returns {SVGSVGElement} getBackgroundLayer method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getBackgroundLayer(diagramId: string): SVGSVGElement;
/**
 * getGridLayer method \
 *
 * @returns {SVGSVGElement} getGridLayer method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getGridLayer(diagramId: string): SVGElement;
/**
 * getNativeLayer method \
 *
 * @returns {SVGSVGElement} getNativeLayer method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getNativeLayer(diagramId: string): SVGElement;
/**
 * getHTMLLayer method \
 *
 * @returns {SVGSVGElement} getHTMLLayer method .\
 * @param { string } diagramId - provide the diagramId  value.
 * @private
 */
export declare function getHTMLLayer(diagramId: string): HTMLElement;
/**
 * createHtmlElement method \
 *
 * @returns {SVGSVGElement} createHtmlElement method .\
 * @param { string } elementType - provide the diagramId  value.
 * @param { Object } attribute - provide the diagramId  value.
 * @private
 */
export declare function createHtmlElement(elementType: string, attribute: Object): HTMLElement;
/**
 * createSvgElement method \
 *
 * @returns {SVGSVGElement} createSvgElement method .\
 * @param { string } elementType - provide the elementType  value.
 * @param { Object } attribute - provide the attribute  value.
 * @private
 */
export declare function createSvgElement(elementType: string, attribute: Object): SVGElement;
/** @hidden */
/**
 * parentsUntil method \
 *
 * @returns {SVGSVGElement} parentsUntil method .\
 * @param { Element } elem - provide the elementType  value.
 * @param { string } selector - provide the attribute  value.
 * @param { boolean } isID - provide the attribute  value.
 * @private
 */
export declare function parentsUntil(elem: Element, selector: string, isID?: boolean): Element;
/**
 * hasClass method \
 *
 * @returns {SVGSVGElement} hasClass method .\
 * @param { HTMLElement } element - provide the element  value.
 * @param { string } className - provide the className  value.
 * @private
 */
export declare function hasClass(element: HTMLElement, className: string): boolean;
/**
 * getScrollerWidth method \
 *
 * @returns {number} getScrollerWidth method .\
 * @private
 */
export declare function getScrollerWidth(): number;
/**
 * addTouchPointer method \
 *
 * @returns {ITouches[]} addTouchPointer method .\
 * @param { ITouches[] } touchList - provide the touchList  value.
 * @param { PointerEvent } e - provide the e  value.
 * @param { TouchList } touches - provide the touches  value.
 * @private
 */
export declare function addTouchPointer(touchList: ITouches[], e: PointerEvent, touches: TouchList): ITouches[];
/**
 * removes the element from dom \
 *
 * @returns {void} removes the element from dom .\
 * @param { ITouches[] } elementId - provide the elementId  value.
 * @param { PointerEvent } contentId - provide the contentId  value.
 * @private
 */
export declare function removeElement(elementId: string, contentId?: string): void;
/**
 * getContent method   \
 *
 * @returns {void} getContent method .\
 * @param { DiagramHtmlElement | DiagramNativeElement } element - provide the elementId  value.
 * @param { boolean } isHtml - provide the boolean  value.
 * @param { Node | Annotation | PathAnnotation } nodeObject - provide the nodeObject  value.
 * @private
 */
export declare function getContent(element: DiagramHtmlElement | DiagramNativeElement, isHtml: boolean, nodeObject?: Node | Annotation | PathAnnotation): HTMLElement | SVGElement;
/**
 * setAttributeSvg method   \
 *
 * @returns {void} setAttributeSvg method .\
 * @param { SVGElement } svg - provide the svg  value.
 * @param { Object } attributes - provide the boolean  value.
 * @private
 */
export declare function setAttributeSvg(svg: SVGElement, attributes: Object): void;
/**
 * applyStyleAgainstCsp method   \
 *
 * @returns {void} applyStyleAgainstCsp method .\
 * @param { SVGElement } svg - provide the svg  value.
 * @param { string } attributes - provide the boolean  value.
 * @private
 */
export declare function applyStyleAgainstCsp(svg: SVGElement | HTMLElement, attributes: string): void;
/**
 * setAttributeHtml method   \
 *
 * @returns {void} setAttributeHtml method .\
 * @param { HTMLElement } element - provide the svg  value.
 * @param { Object } attributes - provide the boolean  value.
 * @private
 */
export declare function setAttributeHtml(element: HTMLElement, attributes: Object): void;
/**
 * createMeasureElements method   \
 *
 * @returns {void} createMeasureElements method .\
 * @private
 */
export declare function createMeasureElements(): void;
/**
 * setChildPosition method   \
 *
 * @returns {number} setChildPosition method .\
 * @param {SubTextElement} temp - provide the temp  value.
 * @param {SubTextElement[]} childNodes - provide the childNodes  value.
 * @param {number} i - provide the i  value.
 * @param {TextAttributes} options - provide the options  value.
 * @private
 */
export declare function setChildPosition(temp: SubTextElement, childNodes: SubTextElement[], i: number, options: TextAttributes): number;
/**
 * getTemplateContent method   \
 *
 * @returns {DiagramHtmlElement} getTemplateContent method .\
 * @param {DiagramHtmlElement} annotationcontent - provide the annotationcontent  value.
 * @param {Annotation} annotation - provide the annotation  value.
 * @param {number} annotationTemplate - provide the annotationTemplate  value.
 * @private
 */
export declare function getTemplateContent(annotationcontent: DiagramHtmlElement, annotation: Annotation, annotationTemplate?: string | Function): DiagramHtmlElement;
/** @private */
export declare function createUserHandleTemplates(userHandleTemplate: string, template: HTMLCollection, selectedItems: SelectorModel, diagramID: string): void;
