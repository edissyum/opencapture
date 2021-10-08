import { ChildProperty } from '@syncfusion/ej2-base';
/**
 * Defines event marker collection in Gantt.
 */
export declare class EventMarker extends ChildProperty<EventMarker> {
    /**
     * Defines day of event marker.
     *
     * @default null
     */
    day: Date | string;
    /**
     * Defines label of event marker.
     *
     * @default null
     */
    label: string;
    /**
     * Define custom css class for event marker to customize line and label.
     *
     * @default null
     */
    cssClass: string;
}
