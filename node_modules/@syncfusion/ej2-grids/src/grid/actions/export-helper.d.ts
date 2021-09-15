import { Column } from './../models/column';
import { Row } from './../models/row';
import { IGrid, ExportHelperArgs, ForeignKeyFormat } from '../base/interface';
import { Query } from '@syncfusion/ej2-data';
import { Data } from '../actions/data';
import { Grid } from '../base/grid';
/**
 * @hidden
 * `ExportHelper` for `PdfExport` & `ExcelExport`
 */
export declare class ExportHelper {
    parent: IGrid;
    private colDepth;
    private hideColumnInclude;
    private foreignKeyData;
    constructor(parent: IGrid, foreignKeyData?: {
        [key: string]: Object[];
    });
    static getQuery(parent: IGrid, data: Data): Query;
    getFData(value: string, column: Column): Object;
    getGridRowModel(columns: Column[], dataSource: Object[], gObj: IGrid, startIndex?: number): Row<Column>[];
    private generateCells;
    getColumnData(gridObj: Grid): Promise<Object>;
    getHeaders(columns: Column[], isHideColumnInclude?: boolean): {
        rows: Row<Column>[];
        columns: Column[];
    };
    getConvertedWidth(input: string): number;
    private generateActualColumns;
    private processHeaderCells;
    private appendGridCells;
    private generateCell;
    private processColumns;
    private getCellCount;
    checkAndExport(gridPool: Object, globalResolve: Function): void;
    failureHandler(gridPool: Object, childGridObj: IGrid, resolve: Function): Function;
    createChildGrid(gObj: IGrid, row: Row<Column>, exportType: string, gridPool: Object): {
        childGrid: IGrid;
        element: HTMLElement;
    };
    getGridExportColumns(columns: Column[]): Column[];
    /**
     * Gets the foreignkey data.
     *
     * @returns {ForeignKeyFormat} returns the foreignkey data
     * @hidden
     */
    getForeignKeyData(): ForeignKeyFormat;
}
/**
 * @hidden
 * `ExportValueFormatter` for `PdfExport` & `ExcelExport`
 */
export declare class ExportValueFormatter {
    private internationalization;
    private valueFormatter;
    constructor(culture: string);
    private returnFormattedValue;
    /**
     * Used to format the exporting cell value
     *
     * @param  {ExportHelperArgs} args - Specifies cell details.
     * @returns {string} returns formated value
     * @hidden
     */
    formatCellValue(args: ExportHelperArgs): string;
}
