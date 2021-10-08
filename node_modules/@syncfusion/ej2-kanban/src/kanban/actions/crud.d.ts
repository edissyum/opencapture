import { Kanban } from '../base/kanban';
/**
 * Kanban CRUD module
 */
export declare class Crud {
    private parent;
    /**
     * Constructor for CRUD module
     *
     * @param {Kanban} parent Accepts the kanban instance
     * @private
     */
    constructor(parent: Kanban);
    addCard(cardData: Record<string, any> | Record<string, any>[], index?: number): void;
    private getIndexFromData;
    updateCard(cardData: Record<string, any> | Record<string, any>[], index?: number): void;
    deleteCard(cardData: string | number | Record<string, any> | Record<string, any>[]): void;
    private priorityOrder;
}
