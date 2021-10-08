import { ChildProperty } from '@syncfusion/ej2-base';
import { SortDescriptorModel } from './sort-settings-model';
import { SortDirection } from '../base/enum';
/**
 * Represents the field name and direction of sort column.
 */
export declare class SortDescriptor extends ChildProperty<SortDescriptor> {
    /**
     * Defines the field name of sort column.
     *
     * @default ''
     */
    field: string;
    /**
     * Defines the direction of sort column.
     *
     * @default null
     * @isEnumeration true
     *
     */
    direction: SortDirection;
}
/**
 * Configures the sorting behavior of Gantt.
 */
export declare class SortSettings extends ChildProperty<SortSettings> {
    /**
     * Specifies the columns to sort at initial rendering of Gantt.
     * Also user can get current sorted columns.
     *
     * @default []
     */
    columns: SortDescriptorModel[];
    /**
     * If `allowUnsort` set to false the user can not get the Tree grid in unsorted state by clicking the sorted column header.
     *
     * @default true
     */
    allowUnsort: boolean;
}
