import { WListLevel } from './list-level';
/**
 * @private
 */
export declare class WLevelOverride {
    startAt: number;
    levelNumber: number;
    overrideListLevel: WListLevel;
    destroy(): void;
    clone(): WLevelOverride;
}
