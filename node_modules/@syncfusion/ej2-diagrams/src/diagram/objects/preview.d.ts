import { ChildProperty } from '@syncfusion/ej2-base';
import { SymbolDescription } from '../../symbol-palette/symbol-palette';
import { DiagramElement } from '..';
/**
 * customize the size of the individual palette items.
 */
export declare class SymbolSize extends ChildProperty<SymbolSize> {
    /**
     * Sets the width of the symbols
     *
     * @aspDefaultValueIgnore
     * @default undefined
     */
    width: number;
    /**
     * Sets the height of the symbols
     *
     * @aspDefaultValueIgnore
     * @default undefined
     */
    height: number;
}
/**
 * Defines the size and description of a symbol
 */
export declare class SymbolPaletteInfo extends ChildProperty<SymbolPaletteInfo> {
    /**
     * Defines the width of the symbol description
     *
     * @aspDefaultValueIgnore
     * @default undefined
     */
    width: number;
    /**
     * Defines the height of the symbol description
     *
     * @aspDefaultValueIgnore
     * @default undefined
     */
    height: number;
    /**
     * Defines whether the symbol has to be fit inside the size, that is defined by the symbol palette
     *
     * @default true
     */
    fit: boolean;
    /**
     * Define the text to be displayed and how that is to be handled.
     *
     * @default null
     */
    description: SymbolDescription;
    /**
     * Define the template of the symbol that is to be drawn over the palette
     *
     * @default null
     */
    template: DiagramElement;
    /**
     * Define the text to be displayed when mouse hover on the shape.
     *
     * @default ''
     */
    tooltip: string;
}
