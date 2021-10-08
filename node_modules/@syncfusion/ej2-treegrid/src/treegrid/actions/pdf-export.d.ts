import { TreeGrid } from '../base/treegrid';
import { PdfExportProperties } from '@syncfusion/ej2-grids';
import { Ajax } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
/**
 * TreeGrid PDF Export module
 *
 * @hidden
 */
export declare class PdfExport {
    private parent;
    private dataResults;
    /**
     * Constructor for PDF export module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} PdfExport module name
     */
    protected getModuleName(): string;
    /**
     * @hidden
     * @returns {void}
     */
    addEventListener(): void;
    /**
     * @hidden
     * @returns {void}
     */
    removeEventListener(): void;
    /**
     * To destroy the PDF Export
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    private updatePdfResultModel;
    Map(pdfExportProperties?: PdfExportProperties, isMultipleExport?: boolean, pdfDoc?: Object, isBlob?: boolean): Promise<Object>;
    protected generateQuery(query: Query, prop?: PdfExportProperties): Query;
    protected manipulatePdfProperties(prop?: PdfExportProperties, dtSrc?: Object, queryResult?: Ajax): Object;
    /**
     * TreeGrid PDF Export cell modifier
     *
     * @param {PdfQueryCellInfoEventArgs} args - Current cell details
     * @hidden
     * @returns {void}
     */
    private pdfQueryCellInfo;
}
