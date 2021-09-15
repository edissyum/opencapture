import { TimePicker as EJ2TimePicker } from '@syncfusion/ej2-calendars';
import { InPlaceEditor } from '../base/inplace-editor';
import { NotifyParams, IComponent } from '../base/interface';
/**
 * The `TimePicker` module is used configure the properties of Time picker type editor.
 */
export declare class TimePicker implements IComponent {
    private base;
    protected parent: InPlaceEditor;
    compObj: EJ2TimePicker;
    constructor(parent?: InPlaceEditor);
    render(e: NotifyParams): void;
    focus(): void;
    updateValue(e: NotifyParams): void;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string
     */
    private getModuleName;
    /**
     * Destroys the module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
