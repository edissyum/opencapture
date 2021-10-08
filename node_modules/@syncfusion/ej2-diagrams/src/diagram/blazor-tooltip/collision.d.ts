/**
 * Collision module.
 */
import { OffsetPosition } from './position';
/**
 * Provides information about a CollisionCoordinates.
 *
 * @private
 */
export interface CollisionCoordinates {
    X: boolean;
    Y: boolean;
}
/**
 * @private
 */
export declare function fit(element: HTMLElement, viewPortElement?: HTMLElement, axis?: CollisionCoordinates, position?: OffsetPosition): OffsetPosition;
/**
 * @private
 */
export declare function isCollide(element: HTMLElement, viewPortElement?: HTMLElement, x?: number, y?: number): string[];
/**
 * @private
 */
export declare function flip(element: HTMLElement, target: HTMLElement, offsetX: number, offsetY: number, positionX: string, positionY: string, viewPortElement?: HTMLElement, axis?: CollisionCoordinates, fixedParent?: Boolean): void;
