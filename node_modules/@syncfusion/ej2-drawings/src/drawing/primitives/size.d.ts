/**
 * Size defines and processes the size(width/height) of the objects
 */
export declare class Size {
    /**
     * Sets the height of an object
     * @default 0
     */
    height: number;
    /**
     * Sets the width of an object
     * @default 0
     */
    width: number;
    constructor(width?: number, height?: number);
    /**   @private  */
    clone(): Size;
}
