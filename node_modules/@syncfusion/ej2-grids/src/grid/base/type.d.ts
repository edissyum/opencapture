import { ColumnModel, AggregateColumnModel } from '../models/models';
/**
 * Exports types used by Grid.
 */
export declare type ValueType = number | string | Date | boolean;
export declare type ValueAccessor = (field: string, data: Object, column: ColumnModel) => Object;
export declare type HeaderValueAccessor = (field: string, column: ColumnModel) => Object;
export declare type SortComparer = (x: ValueType, y: ValueType) => number;
export declare type CustomSummaryType = (data: Object[] | Object, column: AggregateColumnModel) => Object;
export declare type ReturnType = {
    result: Object[];
    count: number;
    aggregates?: Object;
    foreignColumnsData?: Object;
};
export declare type SentinelType = {
    check?: (rect: ClientRect, info: SentinelType) => boolean;
    top?: number;
    entered?: boolean;
    axis?: string;
};
export declare type SentinelInfo = {
    up?: SentinelType;
    down?: SentinelType;
    right?: SentinelType;
    left?: SentinelType;
};
export declare type Offsets = {
    top?: number;
    left?: number;
};
export declare type BatchChanges = {
    addedRecords?: Object[];
    changedRecords?: Object[];
    deletedRecords?: Object[];
};
