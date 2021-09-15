import { Toolbar } from '@syncfusion/ej2-navigations';
import { DateRangePicker } from '@syncfusion/ej2-calendars';
import { Rect } from '@syncfusion/ej2-svg-base';
import { RangeIntervalType } from '../utils/enum';
import { RangeNavigator } from '../../range-navigator/index';
import { ISelectorRenderArgs, IPeriodSelectorControl } from '../../common/model/interface';
import { StockChart } from '../../stock-chart/stock-chart';
/**
 * Period selector class
 */
export declare class PeriodSelector {
    periodSelectorSize: Rect;
    periodSelectorDiv: Element;
    control: IPeriodSelectorControl;
    toolbar: Toolbar;
    datePicker: DateRangePicker;
    triggerChange: boolean;
    private nodes;
    calendarId: string;
    selectedIndex: number;
    datePickerTriggered: boolean;
    rootControl: StockChart | RangeNavigator;
    constructor(control: RangeNavigator | StockChart);
    /**
     * To set the control values
     *
     * @param control
     * @returns {void}
     */
    setControlValues(control: RangeNavigator | StockChart): void;
    /**
     * To initialize the period selector properties
     *
     * @param options
     * @param x
     * @param options
     * @param x
     */
    appendSelector(options: ISelectorRenderArgs, x?: number): void;
    /**
     * renderSelector div
     *
     * @param control
     * @param options
     * @param x
     * @param options
     * @param x
     */
    renderSelectorElement(control?: RangeNavigator, options?: ISelectorRenderArgs, x?: number): void;
    /**
     * renderSelector elements
     *
     * @returns {void}
     */
    renderSelector(): void;
    private updateCustomElement;
    /**
     * To set and deselect the acrive style
     *
     * @param buttons
     * @param selectedIndex
     * @returns {void}
     */
    private setSelectedStyle;
    /**
     * Button click handling
     *
     * @param args
     * @param control
     * @param args
     * @param control
     */
    private buttonClick;
    /**
     *
     * @param type updatedRange for selector
     * @param end
     * @param interval
     */
    changedRange(type: RangeIntervalType, end: number, interval: number): Date;
    /**
     * Get module name
     *
     * @returns {string}
     */
    protected getModuleName(): string;
    /**
     * To destroy the period selector.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
