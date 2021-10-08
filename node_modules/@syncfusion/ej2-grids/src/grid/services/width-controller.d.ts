import { IGrid } from '../base/interface';
import { Column } from '../models/column';
/**
 * ColumnWidthService
 *
 * @hidden
 */
export declare class ColumnWidthService {
    private parent;
    constructor(parent: IGrid);
    setWidthToColumns(): void;
    setMinwidthBycalculation(tWidth?: number): void;
    setUndefinedColumnWidth(collection?: Column[]): void;
    setColumnWidth(column: Column, index?: number, module?: string): void;
    private setWidth;
    private getColumnLevelFrozenColgroup;
    /**
     * @returns {void}
     * @hidden
     */
    refreshFrozenScrollbar(): void;
    getSiblingsHeight(element: HTMLElement): number;
    private getHeightFromDirection;
    isWidthUndefined(): boolean;
    getWidth(column: Column): string | number;
    getTableWidth(columns: Column[]): number;
    private calcMovableOrFreezeColWidth;
    private setWidthToFrozenRightTable;
    private setWidthToFrozenLeftTable;
    private setWidthToMovableTable;
    private setWidthToFrozenEditTable;
    private setWidthToMovableEditTable;
    setWidthToTable(): void;
    private isAutoResize;
}
