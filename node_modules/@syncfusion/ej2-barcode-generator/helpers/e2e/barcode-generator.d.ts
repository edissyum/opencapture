/**
 * Barcode Generator component
 */
import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * Represents the Barcode Generator helpers.
 */
export declare class BarcodeGeneratorHelper extends TestHelper {
    /**
     * Specifies the ID of the Barcode Generator.
     */
    id: string;
    /**
     * Specifies the current helper function of the Barcode Generator.
     */
    wrapperFn: Function;
    /**
     * Constructor for creating the helper object for Barcode Generator component.
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Gets the root element of the Barcode Generator component.
     */
    getElement(): any;
}
