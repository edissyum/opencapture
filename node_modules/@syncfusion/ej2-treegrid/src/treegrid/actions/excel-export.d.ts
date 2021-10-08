import { TreeGrid } from '../base/treegrid';
import { ExcelExportProperties } from '@syncfusion/ej2-grids';
import { Ajax } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
/**
 * TreeGrid Excel Export module
 *
 * @hidden
 */
export declare class ExcelExport {
    private parent;
    private dataResults;
    private isCollapsedStatePersist;
    /**
     * Constructor for Excel Export module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns ExcelExport module name
     */
    protected getModuleName(): string;
    /**
     * @hidden
     * @returns {void}
     */
    addEventListener(): void;
    /**
     * To destroy the Excel Export
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    /**
     * @hidden
     * @returns {void}
     */
    removeEventListener(): void;
    private updateExcelResultModel;
    Map(excelExportProperties?: ExcelExportProperties, isMultipleExport?: boolean, workbook?: any, isBlob?: boolean, isCsv?: boolean): Promise<Object>;
    protected generateQuery(query: Query, property?: ExcelExportProperties): Query;
    protected manipulateExportProperties(property?: ExcelExportProperties, dtSrc?: Object, queryResult?: Ajax): Object;
    /**
     * TreeGrid Excel Export cell modifier
     *
     * @param {ExcelQueryCellInfoEventArgs} args - current cell details
     * @hidden
     * @returns {void}
     */
    private excelQueryCellInfo;
    private exportRowDataBound;
    private finalPageSetup;
    private isLocal;
}
