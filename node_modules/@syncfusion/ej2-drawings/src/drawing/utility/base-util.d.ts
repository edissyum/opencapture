import { DrawingElement } from '../core/elements/drawing-element';
import { Rect } from '../primitives/rect';
import { PointModel } from '../primitives/point-model';
import { TextAlign, TextWrap, WhiteSpace, TextDecoration } from '../enum/enum';
import { TextAttributes } from '../rendering/canvas-interface';
import { Size } from '../primitives/size';
/**
 * Implements the basic functionalities
 */
/** @private */
export declare function randomId(): string;
/** @private */
export declare function cornersPointsBeforeRotation(ele: DrawingElement): Rect;
/** @private */
export declare function rotateSize(size: Size, angle: number): Size;
/** @private */
export declare function getBounds(element: DrawingElement): Rect;
/** @private */
export declare function textAlignToString(value: TextAlign): string;
/** @private */
export declare function wordBreakToString(value: TextWrap | TextDecoration): string;
export declare function bBoxText(textContent: string, options: TextAttributes): number;
/** @private */
export declare function middleElement(i: number, j: number): number;
/** @private */
export declare function whiteSpaceToString(value: WhiteSpace, wrap: TextWrap): string;
/** @private */
export declare function rotatePoint(angle: number, pivotX: number, pivotY: number, point: PointModel): PointModel;
/** @private */
export declare function getOffset(topLeft: PointModel, obj: DrawingElement): PointModel;
