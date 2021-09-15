import { TextureStyle } from '../../base/types';
/**
 * @private
 */
export declare class WShading {
    private uniqueShadingFormat;
    private static uniqueShadingFormats;
    private static uniqueFormatType;
    ownerBase: Object;
    backgroundColor: string;
    foregroundColor: string;
    textureStyle: TextureStyle;
    constructor(node?: Object);
    private getPropertyValue;
    private setPropertyValue;
    private static getPropertyDefaultValue;
    private initializeUniqueShading;
    private addUniqueShading;
    destroy(): void;
    cloneFormat(): WShading;
    copyFormat(shading: WShading): void;
    hasValue(property: string): boolean;
    static clear(): void;
}
