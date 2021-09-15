import { EditorManager } from './../base/editor-manager';
/**
 * Indents internal component
 *
 * @hidden

 */
export declare class Indents {
    private parent;
    private indentValue;
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {EditorManager} parent - specifies the parent element
     * @hidden

     */
    constructor(parent: EditorManager);
    private addEventListener;
    private onKeyDown;
    private applyIndents;
}
