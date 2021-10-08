import { ChildProperty } from '@syncfusion/ej2-base';
import { SortDirection, SortOrderBy } from '../base/type';
/**
 * Holds the configuration of sort settings in kanban board.
 */
export declare class SortSettings extends ChildProperty<SortSettings> {
    /**
     * Sort the cards. The possible values are:
     * * DataSourceOrder
     * * Index
     * * Custom
     *
     * @default 'Index'
     */
    sortBy: SortOrderBy;
    /**
     * Defines the sort field
     *
     * @default null
     */
    field: string;
    /**
     * Sort the cards. The possible values are:
     * * Ascending
     * * Descending
     *
     * @default 'Ascending'
     */
    direction: SortDirection;
}
