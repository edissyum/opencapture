import { PdfAnnotationBaseModel } from './pdf-annotation-model';
import { PointModel, PathElement, DrawingElement, TextElement, DecoratorShapes } from '@syncfusion/ej2-drawings';
import { MeasureAnnotation, PdfViewer } from '../index';
/**
 * @private
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {PointModel[]} points - Specified the annotation points.
 * @returns {PointModel[]} - Returns the annotation points model array.
 */
export declare function getConnectorPoints(obj: PdfAnnotationBaseModel, points?: PointModel[]): PointModel[];
/**
 * @private
 * @param {PdfAnnotationBaseModel} connector - Specified the annotation connector model.
 * @param {PointModel[]} points - Specified the annotation points.
 * @returns {string} - Returns the annotation path value.
 */
export declare function getSegmentPath(connector: PdfAnnotationBaseModel, points: PointModel[]): string;
/**
 * @private
 * @param {PdfAnnotationBaseModel} connector - Specified the annotation connector model.
 * @param {PointModel[]} points - Specified the annotation points.
 * @param {PathElement} element - Specified the annotation element.
 * @returns {PathElement} - Returns the annotation path element.
 */
export declare function updateSegmentElement(connector: PdfAnnotationBaseModel, points: PointModel[], element: PathElement): PathElement;
/**
 * @private
 * @param {PdfAnnotationBaseModel} connector - Specified the annotation connector model.
 * @param {PathElement} segmentElement - Specified the annotation segment element.
 * @returns {PathElement} - Returns the annotation path element.
 */
export declare function getSegmentElement(connector: PdfAnnotationBaseModel, segmentElement: PathElement): PathElement;
/**
 * @private
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {DrawingElement} element - Specified the annotation drawing element.
 * @param {PointModel} pt - Specified the annotation point.
 * @param {PointModel} adjacentPoint - Specified the annotation adjacent point.
 * @param {boolean} isSource - Specified the is source value or not.
 * @returns {void}
 */
export declare function updateDecoratorElement(obj: PdfAnnotationBaseModel, element: DrawingElement, pt: PointModel, adjacentPoint: PointModel, isSource: boolean): void;
/**
 * @private
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {PointModel} offsetPoint - Specified the annotation offset point.
 * @param {PointModel} adjacentPoint - Specified the annotation adjacent point.
 * @param {boolean} isSource - Specified the is source value or not.
 * @returns {PathElement} - Returns the annotation path element.
 */
export declare function getDecoratorElement(obj: PdfAnnotationBaseModel, offsetPoint: PointModel, adjacentPoint: PointModel, isSource: boolean): PathElement;
/**
 * @private
 * @param {PdfAnnotationBaseModel} connector - Specified the annotation object.
 * @param {PointModel[]} pts - Specified the annotation point model array.
 * @returns {PointModel[]} - Returns the annotation point model array.
 */
export declare function clipDecorators(connector: PdfAnnotationBaseModel, pts: PointModel[]): PointModel[];
/**
 * @private
 * @param {PdfAnnotationBaseModel} connector - Specified the annotation connector object.
 * @param {PointModel[]} points - Specified the annotation offset point.
 * @param {boolean} isSource - Specified the is source value or not.
 * @returns {PointModel} - Returns the annotation point model.
 */
export declare function clipDecorator(connector: PdfAnnotationBaseModel, points: PointModel[], isSource: boolean): PointModel;
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {PointModel[]} points - Specified the annotation point model array.
 * @param {MeasureAnnotation} measure - Specified the measure annotation object.
 * @param {PdfViewer} pdfviewer - Specified the pdfviewer element.
 * @hidden
 * @returns {TextElement[]} - Returns the text element collections.
 */
export declare function initDistanceLabel(obj: PdfAnnotationBaseModel, points: PointModel[], measure: MeasureAnnotation, pdfviewer: PdfViewer): TextElement[];
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {PointModel[]} points - Specified the annotation point model array.
 * @param {MeasureAnnotation} measure - Specified the measure annotation object.
 * @hidden
 * @returns {string} - Returns the distance value.
 */
export declare function updateDistanceLabel(obj: PdfAnnotationBaseModel, points: PointModel[], measure: MeasureAnnotation): string;
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {MeasureAnnotation} measure - Specified the measure annotation object.
 * @hidden
 * @returns {string} - Returns the radius label value.
 */
export declare function updateRadiusLabel(obj: PdfAnnotationBaseModel, measure: MeasureAnnotation): string;
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {PointModel[]} points - Specified the annotation point model array.
 * @param {MeasureAnnotation} measure - Specified the measure annotation object.
 * @param {PdfViewer} pdfviewer - Specified the pdfviewer element.
 * @hidden
 * @returns {TextElement[]} - Returns the text element collections.
 */
export declare function initPerimeterLabel(obj: PdfAnnotationBaseModel, points: PointModel[], measure: MeasureAnnotation, pdfviewer: PdfViewer): TextElement[];
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {PointModel[]} points - Specified the annotation point model array.
 * @param {MeasureAnnotation} measure - Specified the measure annotation object.
 * @hidden
 * @returns {string} - Returns the perimeter label value.
 */
export declare function updatePerimeterLabel(obj: PdfAnnotationBaseModel, points: PointModel[], measure: MeasureAnnotation): string;
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @hidden
 * @returns {void}
 */
export declare function removePerimeterLabel(obj: PdfAnnotationBaseModel): void;
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @hidden
 * @returns {void}
 */
export declare function updateCalibrateLabel(obj: PdfAnnotationBaseModel): void;
/**
 * Used to find the path for polygon shapes
 *
 * @param {PointModel[]} collection - Specified the polygon annotaion points collection.
 * @hidden
 * @returns {string} - Returns the polygon annotation path.
 */
export declare function getPolygonPath(collection: PointModel[]): string;
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {number} angle - Specified the annotaion rotation angle.
 * @hidden
 * @returns {TextElement} - Returns the annotation text element.
 */
export declare function textElement(obj: PdfAnnotationBaseModel, angle: number): TextElement;
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {PointModel[]} points - Specified the annotaion leader points.
 * @hidden
 * @returns {PathElement[]} - Returns the annotation path elements.
 */
export declare function initLeaders(obj: PdfAnnotationBaseModel, points: PointModel[]): PathElement[];
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {PointModel} point1 - Specified the annotaion leader point1.
 * @param {PointModel} point2 - Specified the annotaion leader point2.
 * @param {boolean} isSecondLeader - Specified the is second leader or not.
 * @hidden
 * @returns {PathElement} - Returns the annotation path element.
 */
export declare function initLeader(obj: PdfAnnotationBaseModel, point1: PointModel, point2: PointModel, isSecondLeader?: boolean): PathElement;
/**
 * @private
 * @param {PdfAnnotationBaseModel} connector - Specified the annotation connector object.
 * @param {PointModel} reference - Specified the pointer reference value.
 * @returns {boolean} - Returns true or false.
 */
export declare function isPointOverConnector(connector: PdfAnnotationBaseModel, reference: PointModel): boolean;
/**
 * @param {PointModel} reference - Specified the pointer reference value.
 * @param {PointModel} start - Specified the pointer start value.
 * @param {PointModel} end - Specified the pointer end value.
 * @private
 * @returns {PointModel} - Returns annotation point model.
 */
export declare function findNearestPoint(reference: PointModel, start: PointModel, end: PointModel): PointModel;
/**
 * @param {DecoratorShapes} shape - Specified the annotation decorator shapes.
 * @hidden
 * @returns {string} - Returns the annotation decorator shape value.
 */
export declare function getDecoratorShape(shape: DecoratorShapes): string;
