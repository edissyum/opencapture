import { Maps } from '../../index';
import { LayerSettings } from '../index';
/**
 * DataLabel Module used to render the maps datalabel
 */
export declare class DataLabel {
    private maps;
    private dataLabelObject;
    /**
     * Datalabel collections
     *
     * @private
     */
    dataLabelCollections: any[];
    private value;
    constructor(maps: Maps);
    private getDataLabel;
    /**
     * To render label for maps
     *
     * @param {LayerSettings} layer - Specifies the layer settings
     * @param {number} layerIndex - Specifies the layer index.
     * @param {any} shape - Specifies the shape.
     * @param {any[]} layerData - Specifies the layer data.
     * @param {Element} group Specifies the element.
     * @param {HTMLElement} labelTemplateElement - Specifies the template element.
     * @param {number} index - Specifies the index number.
     * @param {any[]} intersect - Specifies the intersect.
     * @returns {void}
     */
    renderLabel(layer: LayerSettings, layerIndex: number, shape: any, layerData: any[], group: Element, labelTemplateElement: HTMLElement, index: number, intersect: any[]): void;
    private getPoint;
    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the layers.
     *
     * @param {Maps} maps - Specifies the instance of the maps.
     * @returns {void}
     * @private
     */
    destroy(maps: Maps): void;
}
