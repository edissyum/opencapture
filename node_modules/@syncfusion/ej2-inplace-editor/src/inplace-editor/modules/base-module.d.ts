import { InPlaceEditor } from '../base/inplace-editor';
import { IComponent } from '../base/interface';
/**
 * The `Base` module.
 */
export declare class Base {
    protected parent: InPlaceEditor;
    protected module: IComponent;
    constructor(parent: InPlaceEditor, module: IComponent);
    private render;
    private showPopup;
    private focus;
    private update;
    private getValue;
    private destroyComponent;
    destroy(): void;
    protected addEventListener(): void;
    protected removeEventListener(): void;
}
