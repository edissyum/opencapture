import { WListLevel } from './list-level';
/**
 * @private
 */
export declare class WAbstractList {
    private abstractListIdIn;
    levels: WListLevel[];
    abstractListId: number;
    destroy(): void;
    clone(): WAbstractList;
}
