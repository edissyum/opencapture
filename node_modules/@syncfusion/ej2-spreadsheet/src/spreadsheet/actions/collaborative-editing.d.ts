import { Spreadsheet } from '../base/index';
/**
 * Collaborative Editing module for real time changes in the Spreadsheet.
 */
export declare class CollaborativeEditing {
    private parent;
    constructor(parent: Spreadsheet);
    private refreshClients;
    private addEventListener;
    private removeEventListener;
    /**
     * Destroy collaborative editing module.
     *
     * @returns {void} - Destroy collaborative editing module.
     */
    destroy(): void;
    /**
     * Get the collaborative editing module name.
     *
     * @returns {string} - Get the collaborative editing module name.
     */
    getModuleName(): string;
}
