/**
 * Collision module.
 */
import { OffsetPosition } from './position';
/**
 * Provides information about a CollisionCoordinates.
 */
export interface CollisionCoordinates {
    X: boolean;
    Y: boolean;
}
export declare function fit(element: HTMLElement, viewPortElement?: HTMLElement, axis?: CollisionCoordinates, position?: OffsetPosition): OffsetPosition;
export declare function isCollide(element: HTMLElement, viewPortElement?: HTMLElement, x?: number, y?: number): string[];
export declare function flip(element: HTMLElement, target: HTMLElement, offsetX: number, offsetY: number, positionX: string, positionY: string, viewPortElement?: HTMLElement, axis?: CollisionCoordinates, fixedParent?: Boolean): void;
