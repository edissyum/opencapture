import { Pager, IRender } from './pager';
/**
 * `ExternalMessage` module is used to display user provided message.
 */
export declare class ExternalMessage implements IRender {
    private element;
    private pagerModule;
    /**
     * Constructor for externalMessage module
     *
     * @param {Pager} pagerModule - specifies the pagermodule
     * @hidden
     */
    constructor(pagerModule?: Pager);
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    protected getModuleName(): string;
    /**
     * The function is used to render pager externalMessage
     *
     * @returns {void}
     * @hidden
     */
    render(): void;
    /**
     * Refreshes the external message of Pager.
     *
     * @returns {void}
     */
    refresh(): void;
    /**
     * Hides the external message of Pager.
     *
     * @returns {void}
     */
    hideMessage(): void;
    /**
     * Shows the external message of the Pager.
     *
     * @returns {void}s
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
}
