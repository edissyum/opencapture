import { Rect } from '../../primitives/rect';
import { Quad } from './quad';
/**
 * Spatial search module helps to effectively find the objects over diagram
 */
export declare class SpatialSearch {
    private topElement;
    private bottomElement;
    private rightElement;
    private leftElement;
    private quadSize;
    private quadTable;
    private objectTable;
    /** @private */
    parentQuad: Quad;
    private pageLeft;
    private pageRight;
    private pageTop;
    private pageBottom;
    /** @private */
    childLeft: number;
    /** @private */
    childTop: number;
    /** @private */
    childRight: number;
    /** @private */
    childBottom: number;
    /** @private */
    childNode: IGroupable;
    /**
     *  Constructor for creating the spatial search
     *
     * @param {number} objectTable The objectTable.
     * @private
     */
    constructor(objectTable: Object);
    /**
     * removeFromAQuad method\
     *
     * @returns {void}    removeFromAQuad method .\
     * @param {IGroupable} node - provide the options value.
     * @private
     */
    removeFromAQuad(node: IGroupable): void;
    private update;
    private addIntoAQuad;
    private objectIndex;
    updateQuad(node: IGroupable): boolean;
    private isWithinPageBounds;
    /**
     * findQuads method\
     *
     * @returns {  Quad[] }    findQuads method .\
     * @param {Rect} region - provide the options value.
     * @private
     */
    findQuads(region: Rect): Quad[];
    /**
     * findObjects method\
     *
     * @returns {  IGroupable[] }    findObjects method .\
     * @param {Rect} region - provide the options value.
     * @private
     */
    findObjects(region: Rect): IGroupable[];
    /**
     * updateBounds method\
     *
     * @returns { boolean }    updateBounds method .\
     * @param {IGroupable} node - provide the options value.
     * @private
     */
    updateBounds(node: IGroupable): boolean;
    private findBottom;
    private findRight;
    private findLeft;
    private findTop;
    /**
     * setCurrentNode method\
     *
     * @returns { void }    setCurrentNode method .\
     * @param {IGroupable} node - provide the options value.
     * @private
     */
    setCurrentNode(node: IGroupable): void;
    /**
     * getPageBounds method\
     *
     * @returns { Rect }    getPageBounds method .\
     * @param {number} originX - provide the options value.
     * @param {number} originY - provide the options value.
     * @private
     */
    getPageBounds(originX?: number, originY?: number): Rect;
    /**
     * getQuad method\
     *
     * @returns { Quad }    getQuad method .\
     * @param {IGroupable} node - provide the options value.
     * @private
     */
    getQuad(node: IGroupable): Quad;
}
/** @private */
export interface IGroupable {
    id: string;
    outerBounds: Rect;
}
