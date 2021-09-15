import { RichTextEditor } from '@syncfusion/ej2-richtexteditor';
import { InPlaceEditor } from '../base/inplace-editor';
import { NotifyParams, IComponent } from '../base/interface';
/**
 * The `RTE` module is used configure the properties of RTE type editor.
 */
export declare class Rte implements IComponent {
    private base;
    protected parent: InPlaceEditor;
    compObj: RichTextEditor;
    constructor(parent?: InPlaceEditor);
    render(e: NotifyParams): void;
    focus(): void;
    updateValue(e: NotifyParams): void;
    private getRteValue;
    refresh(): void;
    /**
     * Destroys the rte module.
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
