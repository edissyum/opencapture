import { Popup } from '@syncfusion/ej2-popups';
import { Kanban } from '../base/kanban';
/**
 * Kanban touch module
 */
export declare class KanbanTouch {
    mobilePopup: Popup;
    private element;
    private parent;
    private touchObj;
    tabHold: boolean;
    /**
     * Constructor for touch module
     *
     * @param {Kanban} parent Accepts the kanban instance
     * @private
     */
    constructor(parent: Kanban);
    wireTouchEvents(): void;
    private tapHoldHandler;
    private renderMobilePopup;
    private getPopupContent;
    updatePopupContent(): void;
    private closeClick;
    private popupClose;
    private popupDestroy;
    unWireTouchEvents(): void;
    destroy(): void;
}
