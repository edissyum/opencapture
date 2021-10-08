import { ComboBox as EJ2ComboBox } from '@syncfusion/ej2-dropdowns';
import { InPlaceEditor } from '../base/inplace-editor';
import { NotifyParams, IComponent } from '../base/interface';
/**
 * The `ComboBox` module is used configure the properties of Combo box type editor.
 */
export declare class ComboBox implements IComponent {
    private base;
    protected parent: InPlaceEditor;
    compObj: EJ2ComboBox;
    constructor(parent?: InPlaceEditor);
    render(e: NotifyParams): void;
    focus(): void;
    /**
     * @hidden
     * @returns {void}
     */
    showPopup(): void;
    /**
     * Destroys the module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    updateValue(e: NotifyParams): void;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string
     */
    private getModuleName;
}
