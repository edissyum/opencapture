import { MultiSelect as EJ2MultiSelect } from '@syncfusion/ej2-dropdowns';
import { InPlaceEditor } from '../base/inplace-editor';
import { NotifyParams, IComponent } from '../base/interface';
/**
 * The `MultiSelect` module is used configure the properties of Multi select type editor.
 */
export declare class MultiSelect implements IComponent {
    private base;
    protected parent: InPlaceEditor;
    private isPopOpen;
    compObj: EJ2MultiSelect;
    private openEvent;
    private closeEvent;
    constructor(parent?: InPlaceEditor);
    render(e: NotifyParams): void;
    private openHandler;
    private closeHandler;
    focus(): void;
    updateValue(e: NotifyParams): void;
    getRenderValue(): void;
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
