import { ChildProperty } from '@syncfusion/ej2-base';
/**
 * Defines working time of day in project.
 */
export declare class DayWorkingTime extends ChildProperty<DayWorkingTime> {
    /**
     * Defines start time of working time range.
     *
     * @default null
     */
    from: number;
    /**
     * Defines end time of working time range.
     *
     * @default null
     */
    to: number;
}
