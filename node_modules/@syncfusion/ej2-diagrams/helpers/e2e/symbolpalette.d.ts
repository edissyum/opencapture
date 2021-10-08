/**
 * Symbolpalette component
 */
import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * Represents the symbol palette helpers.
 */
export declare class SymbolpaletteHelper extends TestHelper {
    /**
     * Specifies the ID of the symbol palette component.
     */
    id: string;
    /**
     * Specifies the current helper function of the symbol palette component.
     */
    wrapperFn: Function;
    /**
     * Constructor for creating the helper object for symbol palette component.
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Gets the root element of the symbol palette component.
     */
    getElement(): any;
    /**
     * Gets the search box element of the symbol palette component.
     */
    getSearchElement(): any;
    /**
     * Gets the header element of the specific palette in the symbol palette.
     */
    getHeadderElement(): any;
    /**
     * Gets the palette content of the specific palette in the symbol palette.
     * @param paletteId Defines the ID of the specific palette.
     */
    getPaletteElement(paletteId: string): any;
    /**
     * Gets the specific palette item of the specific palette in the symbol palette.
     * @param paletteId Defines the ID of the specific palette.
     */
    getSymbolElement(symbolId: string): any;
}
