import { ChildProperty } from '@syncfusion/ej2-base';
/**
 * Defines labels for task, this will be placed right, left and inner side of taskbar.
 */
export declare class LabelSettings extends ChildProperty<LabelSettings> {
    /**
     * Defines right side label of task.
     *
     * @default null
     */
    rightLabel: string;
    /**
     * Defines left side label of task.
     *
     * @default null
     */
    leftLabel: string;
    /**
     * Defines label which is placed inside the taskbar.
     *
     * @default null
     */
    taskLabel: string;
}
