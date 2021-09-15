import { IGroupable, SpatialSearch } from './spatial-search';
import { Rect } from '../../primitives/rect';
/**
 * Quad helps to maintain a set of objects that are contained within the particular region
 */
/** @private */
export declare class Quad {
    /** @private */
    objects: IGroupable[];
    /** @private */
    left: number;
    /** @private */
    top: number;
    /** @private */
    width: number;
    /** @private */
    height: number;
    /** @private */
    first: Quad;
    /** @private */
    second: Quad;
    /** @private */
    third: Quad;
    /** @private */
    fourth: Quad;
    /** @private */
    parent: Quad;
    private spatialSearch;
    /**
     *  Constructor for creating the Quad class
     *
     * @param {number} left The symbol palette model.
     * @param {number} top The symbol palette element.
     * @param {number} width The symbol palette element.
     * @param {number} height The symbol palette element.
     * @param {SpatialSearch} spatialSearching The symbol palette element.
     * @private
     */
    constructor(left: number, top: number, width: number, height: number, spatialSearching: SpatialSearch);
    /**
     * findQuads method\
     *
     * @returns {  void}    findQuads method .\
     * @param {Rect} currentViewPort - provide the options value.
     * @param {Quad[]} quads - provide the options value.
     * @private
     */
    findQuads(currentViewPort: Rect, quads: Quad[]): void;
    private isIntersect;
    /**
     * selectQuad method\
     *
     * @returns {  Quad }    selectQuad method .\
     * @private
     */
    selectQuad(): Quad;
    private getQuad;
    /**
     * isContained method\
     *
     * @returns {  boolean }    isContained method .\
     * @private
     */
    isContained(): boolean;
    /**
     * addIntoAQuad method\
     *
     * @returns {  Quad }    addIntoAQuad method .\
     * @param {IGroupable} node - provide the options value.
     * @private
     */
    addIntoAQuad(node: IGroupable): Quad;
    private add;
}
/** @private */
export interface QuadSet {
    target?: Quad;
    source?: Quad;
}
/** @private */
export interface QuadAddition {
    quad?: Quad;
    isAdded?: boolean;
}
