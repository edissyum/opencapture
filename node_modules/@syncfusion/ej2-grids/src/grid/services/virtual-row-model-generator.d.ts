import { IModelGenerator, IGrid, VirtualInfo, NotifyArgs } from '../base/interface';
import { Row } from '../models/row';
import { Cell } from '../models/cell';
import { Column } from '../models/column';
/**
 * Content module is used to render grid content
 */
export declare class VirtualRowModelGenerator implements IModelGenerator<Column> {
    private model;
    rowModelGenerator: IModelGenerator<Column>;
    parent: IGrid;
    cOffsets: {
        [x: number]: number;
    };
    cache: {
        [x: number]: Row<Column>[];
    };
    movableCache: {
        [x: number]: Row<Column>[];
    };
    frozenRightCache: {
        [x: number]: Row<Column>[];
    };
    rowCache: {
        [x: number]: Row<Column>;
    };
    data: {
        [x: number]: Object[];
    };
    groups: {
        [x: number]: Object;
    };
    currentInfo: VirtualInfo;
    includePrevPage: boolean;
    startIndex: number;
    constructor(parent: IGrid);
    generateRows(data: Object[], e?: NotifyArgs): Row<Column>[];
    private setBlockForManualRefresh;
    getBlockIndexes(page: number): number[];
    getPage(block: number): number;
    isBlockAvailable(value: number): boolean;
    isMovableBlockAvailable(value: number): boolean;
    isFrozenRightBlockAvailable(value: number): boolean;
    getData(): VirtualInfo;
    private getStartIndex;
    getColumnIndexes(content?: HTMLElement): number[];
    private addFrozenIndex;
    checkAndResetCache(action: string): boolean;
    refreshColOffsets(): void;
    updateGroupRow(current: Row<Column>[], block: number): Row<Column>[];
    private iterateGroup;
    getRows(): Row<Column>[];
    generateCells(foreignKeyData?: Object): Cell<Column>[];
    private getGroupVirtualRecordsByIndex;
}
