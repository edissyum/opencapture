/**
 * Is formatted or not.
 *
 * @hidden

 */
export declare class IsFormatted {
    static inlineTags: string[];
    /**
     * getFormattedNode method
     *
     * @param {Node} node - specifies the node.
     * @param {string} format - specifies the string value.
     * @param {Node} endNode - specifies the end node
     * @returns {Node} - returns the node
     * @hidden

     */
    getFormattedNode(node: Node, format: string, endNode: Node): Node;
    private getFormatParent;
    private isFormattedNode;
    /**
     * isBold method
     *
     * @param {Node} node - specifies the node value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    static isBold(node: Node): boolean;
    /**
     * isItalic method
     *
     * @param {Node} node - specifies the node value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    static isItalic(node: Node): boolean;
    /**
     * isUnderline method
     *
     * @param {Node} node - specifies the node value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    static isUnderline(node: Node): boolean;
    /**
     * isStrikethrough method
     *
     * @param {Node} node - specifies the node value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    static isStrikethrough(node: Node): boolean;
    /**
     * isSuperscript method
     *
     * @param {Node} node - specifies the node value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    static isSuperscript(node: Node): boolean;
    /**
     * isSubscript method
     *
     * @param {Node} node - specifies the node value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    static isSubscript(node: Node): boolean;
    private isFontColor;
    private isBackgroundColor;
    private isFontSize;
    private isFontName;
}
