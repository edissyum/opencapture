import { IModelGenerator, IGrid } from '../base/interface';
import { Row } from '../models/row';
import { Column } from '../models/column';
import { Action } from '../base/enum';
import { RowModelGenerator } from '../services/row-model-generator';
/**
 * GroupModelGenerator is used to generate group caption rows and data rows.
 *
 * @hidden
 */
export declare class GroupModelGenerator extends RowModelGenerator implements IModelGenerator<Column> {
    private rows;
    /** @hidden */
    index: number;
    private infiniteChildCount;
    private isInfiniteScroll;
    private renderInfiniteAgg;
    private summaryModelGen;
    private captionModelGen;
    constructor(parent?: IGrid);
    generateRows(data: {
        length: number;
    }, args?: {
        startIndex?: number;
        requestType?: Action;
    }): Row<Column>[];
    private getGroupedRecords;
    private isRenderAggregate;
    private getPreCaption;
    private getCaptionRowCells;
    /**
     * @param {GroupedData} data - specifies the data
     * @param {number} indent - specifies the indent
     * @param {number} parentID - specifies the parentID
     * @param {number} childID - specifies the childID
     * @param {number} tIndex - specifies the TIndex
     * @param {string} parentUid - specifies the ParentUid
     * @returns {Row<Column>} returns the Row object
     * @hidden
     */
    generateCaptionRow(data: GroupedData, indent: number, parentID?: number, childID?: number, tIndex?: number, parentUid?: string): Row<Column>;
    private getForeignKeyData;
    /**
     * @param {Object[]} data - specifies the data
     * @param {number} indent - specifies the indent
     * @param {number} childID - specifies the childID
     * @param {number} tIndex - specifies the tIndex
     * @param {string} parentUid - specifies the ParentUid
     * @returns {Row<Column>[]} returns the row object
     * @hidden
     */
    generateDataRows(data: Object[], indent: number, childID?: number, tIndex?: number, parentUid?: string): Row<Column>[];
    private generateIndentCell;
    refreshRows(input?: Row<Column>[]): Row<Column>[];
    private setInfiniteRowVisibility;
    ensureRowVisibility(): void;
}
export interface GroupedData {
    GroupGuid?: string;
    items?: GroupedData;
    field?: string;
    isDataRow?: boolean;
    level?: number;
    key?: string;
    foreignKey?: string;
    count?: number;
    headerText?: string;
}
