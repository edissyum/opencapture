import { Pager, IRender } from './pager';
/**
 * `PagerMessage` module is used to display pager information.
 */
export declare class PagerMessage implements IRender {
    private pageNoMsgElem;
    private pageCountMsgElem;
    private pagerModule;
    /**
     * Constructor for externalMessage module
     *
     * @param {Pager} pagerModule - specifies the pager Module
     * @hidden
     */
    constructor(pagerModule?: Pager);
    /**
     * The function is used to render pager message
     *
     * @returns {void}
     * @hidden
     */
    render(): void;
    /**
     * Refreshes the pager information.
     *
     * @returns {void}
     */
    refresh(): void;
    /**
     * Hides the Pager information.
     *
     * @returns {void}
     */
    hideMessage(): void;
    /**
     * Shows the Pager information.
     *
     * @returns {void}
     */
    showMessage(): void;
    /**
     * To destroy the PagerMessage
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    private format;
}
