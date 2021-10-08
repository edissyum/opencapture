import { IModelGenerator, IRow, IGrid } from '../base/interface';
import { Row } from '../models/row';
import { CellType, Action } from '../base/enum';
import { Column } from '../models/column';
import { Cell } from '../models/cell';
/**
 * RowModelGenerator is used to generate grid data rows.
 *
 * @hidden
 */
export declare class RowModelGenerator implements IModelGenerator<Column> {
    protected parent: IGrid;
    /**
     * Constructor for header renderer module
     *
     * @param {IGrid} parent - specifies the IGrid
     */
    constructor(parent?: IGrid);
    generateRows(data: Object, args?: {
        startIndex?: number;
        requestType?: Action;
    }): Row<Column>[];
    protected ensureColumns(): Cell<Column>[];
    protected generateRow(data: Object, index: number, cssClass?: string, indent?: number, pid?: number, tIndex?: number, parentUid?: string): Row<Column>;
    protected refreshForeignKeyRow(options: IRow<Column>): void;
    protected generateCells(options: IRow<Column>): Cell<Column>[];
    /**
     *
     * @param {Column} column - Defines column details
     * @param {string} rowId - Defines row id
     * @param {CellType} cellType  - Defines cell type
     * @param {number} colSpan - Defines colSpan
     * @param {number} oIndex - Defines index
     * @param {Object} foreignKeyData - Defines foreign key data
     * @returns {Cell<Column>} returns cell model
     * @hidden
     */
    generateCell(column: Column, rowId?: string, cellType?: CellType, colSpan?: number, oIndex?: number, foreignKeyData?: Object): Cell<Column>;
    refreshRows(input?: Row<Column>[]): Row<Column>[];
    private getInfiniteIndex;
}
