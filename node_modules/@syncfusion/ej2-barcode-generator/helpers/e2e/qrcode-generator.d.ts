/**
 * QR Code Generator component
 */
import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * Represents the QR Code Generator helpers.
 */
export declare class QRCodeGeneratorHelper extends TestHelper {
    /**
     * Specifies the ID of the QR Code Generator.
     */
    id: string;
    /**
     * Specifies the current helper function of the QR Code Generator.
     */
    wrapperFn: Function;
    /**
     * Constructor for creating the helper object for QR Code Generator component.
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Gets the root element of the QR Code Generator component.
     */
    getElement(): any;
}
