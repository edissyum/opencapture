import { Column } from '../models/column';
import { Row } from '../models/row';
import { QueryCellInfoEventArgs, IGrid } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
/**
 * `CellMergeRender` module.
 *
 * @hidden
 */
export declare class CellMergeRender<T> {
    private serviceLocator;
    protected parent: IGrid;
    constructor(serviceLocator?: ServiceLocator, parent?: IGrid);
    render(cellArgs: QueryCellInfoEventArgs, row: Row<T>, i: number, td: Element): Element;
    private backupMergeCells;
    private generteKey;
    private splitKey;
    private containsKey;
    private getMergeCells;
    private setMergeCells;
    updateVirtualCells(rows: Row<Column>[]): Row<Column>[];
    private getIndexFromAllColumns;
}
