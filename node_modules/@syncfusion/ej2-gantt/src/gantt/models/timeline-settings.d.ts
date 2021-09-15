import { ChildProperty } from '@syncfusion/ej2-base';
import { TimelineViewMode } from '../base/enum';
import { TimelineTierSettingsModel } from './timeline-settings-model';
import { ITimelineFormatter } from '../base/interface';
/**
 * Configures timeline settings of Gantt.
 */
export declare class TimelineTierSettings extends ChildProperty<TimelineTierSettings> {
    /**
     * Defines timeline cell format.
     *
     * @default ''
     */
    format: string;
    /**
     * Defines timeline mode of Gantt header.
     * * `None` - Default.
     * * `Week` - Define the week mode header.
     * * `Day` - Define the day mode header.
     * * `Hour` - Define the hour mode header.
     * * `Month` - Define the month mode header.
     * * `Year` - Define the year mode header.
     * * `Minutes` - Define the minutes mode header.
     *
     * @default 'None'
     */
    unit: TimelineViewMode;
    /**
     * Defines number of timeline units combined for single cell.
     *
     * @default 1
     */
    count: number;
    /**
     * Defines method to get custom formatted values of timeline cells.
     *
     * @default null
     */
    formatter: string | ITimelineFormatter;
}
/**
 * Configures the timeline settings property in the Gantt.
 */
export declare class TimelineSettings extends ChildProperty<TimelineSettings> {
    /**
     * Defines timeline mode of Gantt header.
     * * `None` - Default.
     * * `Week` - Define the week mode header.
     * * `Day` - Define the day mode header.
     * * `Hour` - Define the hour mode header.
     * * `Month` - Define the month mode header.
     * * `Year` - Define the year mode header.
     * * `Minutes` - Define the minutes mode header.
     *
     * @default 'None'
     */
    timelineViewMode: TimelineViewMode;
    /**
     * Defines top tier setting in timeline.
     */
    topTier: TimelineTierSettingsModel;
    /**
     * Defines bottom tier settings in timeline.
     */
    bottomTier: TimelineTierSettingsModel;
    /**
     * Defines width of timeline cell.
     *
     * @default 33
     */
    timelineUnitSize: number;
    /**
     * Defines week start day in timeline.
     *
     * @default 0
     */
    weekStartDay: number;
    /**
     * Defines background color of weekend cell in week - day timeline mode.
     *
     * @default null
     */
    weekendBackground: string;
    /**
     * Enables or disables tooltip for timeline cells.
     *
     * @default true
     */
    showTooltip: boolean;
    /**
     * Enables or disables timeline auto update on editing action.
     *
     * @default true
     */
    updateTimescaleView: boolean;
}
