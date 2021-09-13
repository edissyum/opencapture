export declare function calculateRelativeBasedPosition(anchor: HTMLElement, element: HTMLElement): OffsetPosition;
export declare function calculatePosition(currentElement: Element, positionX?: string, positionY?: string, parentElement?: Boolean, targetValues?: ClientRect): OffsetPosition;
/**
 * Provides information about a OffsetPosition.
 */
export interface OffsetPosition {
    left: number;
    top: number;
}
