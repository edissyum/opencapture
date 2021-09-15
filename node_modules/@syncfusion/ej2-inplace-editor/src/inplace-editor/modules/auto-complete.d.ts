import { AutoComplete as EJ2AutoComplete } from '@syncfusion/ej2-dropdowns';
import { InPlaceEditor } from '../base/inplace-editor';
import { NotifyParams, IComponent } from '../base/interface';
/**
 * The `AutoComplete` module is used configure the properties of Auto complete type editor.
 */
export declare class AutoComplete implements IComponent {
    private base;
    protected parent: InPlaceEditor;
    compObj: EJ2AutoComplete;
    constructor(parent?: InPlaceEditor);
    render(e: NotifyParams): void;
    /**
     * @hidden
     * @returns {void}
     */
    showPopup(): void;
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
     * @returns {string} - returns the string
     */
    private getModuleName;
}
