import { Slider as EJ2Slider } from '@syncfusion/ej2-inputs';
import { InPlaceEditor } from '../base/inplace-editor';
import { NotifyParams, IComponent } from '../base/interface';
/**
 * The `Slider` module is used configure the properties of Slider type editor.
 */
export declare class Slider implements IComponent {
    private base;
    protected parent: InPlaceEditor;
    compObj: EJ2Slider;
    constructor(parent?: InPlaceEditor);
    render(e: NotifyParams): void;
    focus(): void;
    updateValue(e: NotifyParams): void;
    refresh(): void;
    /**
     * Destroys the slider module.
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
