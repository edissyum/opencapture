import { Maps } from '../maps';
import { Tile, BingMapType } from '../index';
/**
 * Bing map src doc
 */
export declare class BingMap {
    /**
     * map instance
     */
    private maps;
    subDomains: string[];
    imageUrl: string;
    maxZoom: string;
    constructor(maps: Maps);
    getBingMap(tile: Tile, key: string, type: BingMapType, language: string, imageUrl: string, subDomains: string[]): string;
}
