import { IRichTextEditor, NotifyArgs } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
/**
 * Content module is used to render Rich Text Editor content
 *
 * @hidden

 */
export declare class Render {
    private parent;
    private locator;
    private contentRenderer;
    private renderer;
    /**
     * Constructor for render module
     *
     * @param {IRichTextEditor} parent - specifies the parent
     * @param {ServiceLocator} locator - specifies the locator.
     * @returns {void}
     */
    constructor(parent?: IRichTextEditor, locator?: ServiceLocator);
    /**
     * To initialize Rich Text Editor header, content and footer rendering
     *
     * @returns {void}
     * @hidden

     */
    render(): void;
    /**
     * Refresh the entire RichTextEditor.
     *
     * @param {NotifyArgs} e - specifies the arguments.
     * @returns {void}
     */
    refresh(e?: NotifyArgs): void;
    /**
     * Destroy the entire RichTextEditor.
     *
     * @returns {void}
     */
    destroy(): void;
    private addEventListener;
    private removeEventListener;
    private keyUp;
}
