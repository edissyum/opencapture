import { OlapEngine } from './engine';
import { IFieldOptions, IDataOptions, IDrillOptions, IDrilledItem } from '../engine';
/**
 * This is a file to create MDX query for the provided OLAP datasource
 * @hidden
 */
/** @hidden */
export declare class MDXQuery {
    /** @hidden */
    private static engine;
    /** @hidden */
    private static rows;
    /** @hidden */
    private static columns;
    /** @hidden */
    private static values;
    /** @hidden */
    private static filters;
    /** @hidden */
    private static calculatedFieldSettings;
    /** @hidden */
    private static valueSortSettings;
    /** @hidden */
    static drilledMembers: IDrillOptions[];
    /** @hidden */
    private static filterMembers;
    /** @hidden */
    private static fieldDataObj;
    /** @hidden */
    private static fieldList;
    /** @hidden */
    private static valueAxis;
    /** @hidden */
    private static cellSetInfo;
    /** @hidden */
    private static isMeasureAvail;
    /** @hidden */
    private static isMondrian;
    /** @hidden */
    private static isPaging;
    /** @hidden */
    private static pageSettings;
    /** @hidden */
    private static allowLabelFilter;
    /** @hidden */
    private static allowValueFilter;
    static getCellSets(dataSourceSettings: IDataOptions, olapEngine: OlapEngine, refPaging?: boolean, drillInfo?: IDrilledItem, isQueryUpdate?: boolean): any;
    private static getTableCellData;
    static frameMDXQuery(rowQuery: string, columnQuery: string, slicerQuery: string, filterQuery: string, caclQuery: string, refPaging?: boolean): string;
    private static getPagingQuery;
    private static getPagingCountQuery;
    static getDimensionsQuery(dimensions: IFieldOptions[], measureQuery: string, axis: string, drillInfo?: IDrilledItem): string;
    private static getAttributeDrillQuery;
    static getDimensionPos(axis: string, field: string): number;
    static getMeasurePos(axis: string): number;
    private static getDrillLevel;
    private static getHierarchyQuery;
    private static isAttributeMemberExist;
    private static getDrillQuery;
    private static updateValueSortQuery;
    static getSlicersQuery(slicers: IFieldOptions[], axis: string): string;
    private static getDimensionQuery;
    private static getDimensionUniqueName;
    static getMeasuresQuery(measures: IFieldOptions[]): string;
    private static getfilterQuery;
    private static getAdvancedFilterQuery;
    private static getAdvancedFilterCondtions;
    private static getCalculatedFieldQuery;
}
/**
 * @hidden
 */
export interface PagingQuery {
    rowQuery: string;
    columnQuery: string;
}
