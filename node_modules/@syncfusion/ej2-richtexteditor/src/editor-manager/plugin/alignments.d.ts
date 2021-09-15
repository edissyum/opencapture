import { EditorManager } from './../base/editor-manager';
/**
 * Formats internal component
 *
 * @hidden

 */
export declare class Alignments {
    private parent;
    private alignments;
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {EditorManager} parent - specifies the parent element.
     * @returns {void}
     * @hidden

     */
    constructor(parent: EditorManager);
    private addEventListener;
    private onKeyDown;
    private getTableNode;
    private applyAlignment;
}
