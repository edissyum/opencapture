import { ChildProperty } from '@syncfusion/ej2-base';
/**
 * Defines holidays of project.
 */
export declare class Holiday extends ChildProperty<Holiday> {
    /**
     * Defines start date of holiday.
     *
     * @default null
     */
    from: Date | string;
    /**
     * Defines end date of holiday.
     *
     * @default null
     */
    to: Date | string;
    /**
     * Defines label of holiday.
     *
     * @default null
     */
    label: string;
    /**
     * Defines custom css class of holiday to customize background and label.
     *
     * @default null
     */
    cssClass: string;
}
