import { IGrid, PdfExportProperties } from '../base/interface';
/**
 * `PDF Export` module is used to handle the exportToPDF action.
 *
 * @hidden
 */
export declare class PdfExport {
    private parent;
    private isExporting;
    private data;
    private pdfDocument;
    private hideColumnInclude;
    private currentViewData;
    private customDataSource;
    private exportValueFormatter;
    private gridTheme;
    private isGrouping;
    private helper;
    private isBlob;
    private blobPromise;
    private globalResolve;
    private gridPool;
    private headerOnPages;
    private drawPosition;
    private pdfPageSettings;
    /**
     * Constructor for the Grid PDF Export module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @hidden
     */
    constructor(parent?: IGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     */
    private getModuleName;
    private init;
    private exportWithData;
    /**
     * Used to map the input data
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {PdfExportProperties} pdfExportProperties - specifies the PdfExportProperties
     * @param {boolean} isMultipleExport - specifies the isMultipleExport
     * @param {Object} pdfDoc - specifies the pdfDoc
     * @param {boolean} isBlob - speciies whether it is Blob or not
     * @returns {void}
     */
    Map(parent?: IGrid, pdfExportProperties?: PdfExportProperties, isMultipleExport?: boolean, pdfDoc?: Object, isBlob?: boolean): Promise<Object>;
    private processExport;
    private processSectionExportProperties;
    private processGridExport;
    private getSummaryCaptionThemeStyle;
    private getGridPdfFont;
    private getHeaderThemeStyle;
    private processGroupedRecords;
    private processGridHeaders;
    private processExportProperties;
    private drawHeader;
    private drawPageTemplate;
    private processContentValidation;
    private drawText;
    private drawPageNumber;
    private drawImage;
    private drawLine;
    private processAggregates;
    private getTemplateFunction;
    private getSummaryWithoutTemplate;
    /**
     * Set alignment, width and type of the values of the column
     *
     * @param {Column[]} gridColumns - specifies the grid column
     * @param {PdfGrid} pdfGrid - specifies the pdfGrid
     * @param {ExportHelper} helper - specifies the helper
     * @param {IGrid} gObj - specifies the IGrid
     * @param {boolean} allowHorizontalOverflow - specifies the allowHorizontalOverflow
     * @returns {void}
     */
    private setColumnProperties;
    /**
     * set default style properties of each rows in exporting grid
     *
     * @param {PdfGridRow} row - specifies the PdfGridRow
     * @param {PdfBorders} border - specifies the PdfBorders
     * @returns {PdfGrid} returns the pdfgrid
     * @private
     */
    private setRecordThemeStyle;
    /**
     * generate the formatted cell values
     *
     * @param {PdfBorders} border - specifies the border
     * @param {Column[]} columns - specifies the columns
     * @param {IGrid} gObj - specifies the IGrid
     * @param {Object[]} dataSource - specifies the datasource
     * @param {PdfGrid} pdfGrid - specifies the pdfGrid
     * @param {number} startIndex - specifies the startindex
     * @param {PdfExportProperties} pdfExportProperties - specifies the pdfExportProperties
     * @param {ExportHelper} helper - specifies the helper
     * @param {number} rowIndex - specifies the rowIndex
     * @returns {number} returns the number of records
     * @private
     */
    private processRecord;
    private setHyperLink;
    private childGridCell;
    private processCellStyle;
    /**
     * set text alignment of each columns in exporting grid
     *
     * @param {string} textAlign - specifies the textAlign
     * @param {PdfStringFormat} format - specifies the PdfStringFormat
     * @returns {PdfStringFormat} returns the PdfStringFormat
     * @private
     */
    private getHorizontalAlignment;
    /**
     * set vertical alignment of each columns in exporting grid
     *
     * @param {string} verticalAlign - specifies the verticalAlign
     * @param {PdfStringFormat} format - specifies the PdfStringFormat
     * @param {string} textAlign - specifies the text align
     * @returns {PdfStringFormat} returns the PdfStringFormat
     * @private
     */
    private getVerticalAlignment;
    private getFontFamily;
    private getFont;
    private getPageNumberStyle;
    private setContentFormat;
    private getPageSize;
    private getDashStyle;
    private getPenFromContent;
    private getBrushFromContent;
    private hexToRgb;
    private getFontStyle;
    private getBorderStyle;
    destroy(): void;
}
