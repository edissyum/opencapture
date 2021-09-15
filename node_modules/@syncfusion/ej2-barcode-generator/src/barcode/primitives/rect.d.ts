/**
 * Rect defines and processes rectangular regions
 */
export declare class Rect {
    /**
     * Sets the x-coordinate of the starting point of a rectangular region
     *
     * @default 0
     */
    x: number;
    /**
     * Sets the y-coordinate of the starting point of a rectangular region
     *
     * @default 0
     */
    y: number;
    /**
     * Sets the width of a rectangular region
     *
     * @default 0
     */
    width: number;
    /**
     * Sets the height of a rectangular region
     *
     * @default 0
     */
    height: number;
    constructor(x?: number, y?: number, width?: number, height?: number);
}
