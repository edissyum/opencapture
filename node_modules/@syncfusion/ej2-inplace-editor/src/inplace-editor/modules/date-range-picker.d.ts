import { DateRangePicker as EJ2DateRangePicker } from '@syncfusion/ej2-calendars';
import { InPlaceEditor } from '../base/inplace-editor';
import { NotifyParams, IComponent } from '../base/interface';
/**
 * The `DateRangePicker` module is used configure the properties of Date range picker type editor.
 */
export declare class DateRangePicker implements IComponent {
    private base;
    compObj: EJ2DateRangePicker;
    protected parent: InPlaceEditor;
    constructor(parent?: InPlaceEditor);
    render(e: NotifyParams): void;
    focus(): void;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string
     */
    private getModuleName;
    updateValue(e: NotifyParams): void;
    /**
     * Destroys the module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
