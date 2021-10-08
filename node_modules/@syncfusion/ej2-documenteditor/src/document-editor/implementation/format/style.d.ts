import { StyleType } from '../../base/index';
import { WParagraphFormat } from './paragraph-format';
import { WCharacterFormat } from './character-format';
/**
 * @private
 */
export declare abstract class WStyle {
    ownerBase: Object;
    type: StyleType;
    next: WStyle;
    basedOn: WStyle;
    link: WStyle;
    name: string;
}
/**
 * @private
 */
export declare class WParagraphStyle extends WStyle {
    /**
     * Specifies the paragraph format
     *
     * @default undefined
     */
    paragraphFormat: WParagraphFormat;
    /**
     * Specifies the character format
     *
     * @default undefined
     */
    characterFormat: WCharacterFormat;
    constructor(node?: Object);
    destroy(): void;
    copyStyle(paraStyle: WParagraphStyle): void;
}
/**
 * @private
 */
export declare class WCharacterStyle extends WStyle {
    /**
     * Specifies the character format
     *
     * @default undefined
     */
    characterFormat: WCharacterFormat;
    constructor(node?: Object);
    destroy(): void;
    copyStyle(charStyle: WCharacterStyle): void;
}
/**
 * @private
 */
export declare class WStyles {
    private collection;
    readonly length: number;
    remove(item: WParagraphStyle | WCharacterStyle): void;
    push(item: WParagraphStyle | WCharacterStyle): number;
    getItem(index: number): Object;
    indexOf(item: WParagraphStyle | WCharacterStyle): number;
    contains(item: WParagraphStyle | WCharacterStyle): boolean;
    clear(): void;
    findByName(name: string, type?: StyleType): Object;
    getStyleNames(type?: StyleType): string[];
    getStyles(type?: StyleType): Object[];
}
