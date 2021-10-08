import { Maps } from '../../index';
import { LayerSettings } from '../index';
/**
 * navigation-selected-line
 */
export declare class NavigationLine {
    private maps;
    constructor(maps: Maps);
    /**
     * To render navigation line for maps
     */
    renderNavigation(layer: LayerSettings, factor: number, layerIndex: number): Element;
    private convertRadius;
    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the layers.
     *
     * @param {Maps} maps - Specifies the instance of the map
     * @returns {void}
     * @private
     */
    destroy(maps: Maps): void;
}
