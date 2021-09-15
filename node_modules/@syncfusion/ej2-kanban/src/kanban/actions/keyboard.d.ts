import { Kanban } from '../base';
/**
 * Kanban keyboard module
 */
export declare class Keyboard {
    private parent;
    private keyboardModule;
    private multiSelection;
    private keyConfigs;
    /**
     * Constructor for keyboard module
     *
     * @param {Kanban} parent Accepts the kanban instance
     */
    constructor(parent: Kanban);
    private keyActionHandler;
    private processCardSelection;
    private processLeftRightArrow;
    private processUpDownArrow;
    private removeSelection;
    cardTabIndexRemove(): void;
    private processEnter;
    addRemoveTabIndex(action: string): void;
    destroy(): void;
}
