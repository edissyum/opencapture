import { MarkdownParser } from './../base/markdown-parser';
/**
 * Link internal component
 *
 * @hidden

 */
export declare class MDLink {
    private parent;
    private selection;
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {MarkdownParser} parent - specifies the parent element
     * @hidden

     */
    constructor(parent: MarkdownParser);
    private addEventListener;
    private createLink;
    private restore;
}
