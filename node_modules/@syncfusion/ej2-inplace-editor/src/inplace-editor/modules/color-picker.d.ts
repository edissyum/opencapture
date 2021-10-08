import { ColorPicker as EJ2ColorPicker } from '@syncfusion/ej2-inputs';
import { InPlaceEditor } from '../base/inplace-editor';
import { NotifyParams, IComponent } from '../base/interface';
/**
 * The `ColorPicker` module is used configure the properties of Color picker type editor.
 */
export declare class ColorPicker implements IComponent {
    private base;
    protected parent: InPlaceEditor;
    compObj: EJ2ColorPicker;
    constructor(parent?: InPlaceEditor);
    render(e: NotifyParams): void;
    focus(): void;
    updateValue(e: NotifyParams): void;
    /**
     * Destroys the module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - retunrs the string
     */
    private getModuleName;
}
