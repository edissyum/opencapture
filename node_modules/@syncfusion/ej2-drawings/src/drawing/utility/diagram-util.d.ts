import { PointModel } from './../primitives/point-model';
import { Corners } from '../core/elements/drawing-element';
import { DrawingElement } from '../core/elements/drawing-element';
import { Container } from './../core/containers/container';
import { TextStyleModel } from './../core/appearance-model';
import { IElement } from '../objects/interface/IElement';
/**
 * Implements the drawing functionalities
 */
/** @private */
export declare function findNearestPoint(reference: PointModel, start: PointModel, end: PointModel): PointModel;
/** @private */
export declare function findElementUnderMouse(obj: IElement, position: PointModel, padding?: number): DrawingElement;
/** @private */
export declare function findTargetElement(container: Container, position: PointModel, padding?: number): DrawingElement;
/** @private */
export declare function intersect3(lineUtil1: Segment, lineUtil2: Segment): Intersection;
/** @private */
export declare function intersect2(start1: PointModel, end1: PointModel, start2: PointModel, end2: PointModel): PointModel;
/** @private */
export declare function getLineSegment(x1: number, y1: number, x2: number, y2: number): Segment;
/** @private */
export declare function getPoints(element: DrawingElement, corners: Corners, padding?: number): PointModel[];
/** @private */
export declare function getBezierDirection(src: PointModel, tar: PointModel): string;
/** @private */
export declare function updateStyle(changedObject: TextStyleModel, target: DrawingElement): void;
/** @private */
export declare function scaleElement(element: DrawingElement, sw: number, sh: number, refObject: DrawingElement): void;
/** @private */
export declare function contains(mousePosition: PointModel, corner: PointModel, padding: number): boolean;
/** @private */
export declare function getPoint(x: number, y: number, w: number, h: number, angle: number, offsetX: number, offsetY: number, cornerPoint: PointModel): PointModel;
export interface Segment {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
/** @private */
export interface Intersection {
    enabled: boolean;
    intersectPt: PointModel;
}
/** @private */
export interface Info {
    ctrlKey?: boolean;
    shiftKey?: boolean;
}
