import { TreeView } from '@syncfusion/ej2-navigations';
import { Popup } from '@syncfusion/ej2-popups';
import { Kanban } from './kanban';
/**
 * Kanban mobile layout rendering module
 *
 */
export declare class MobileLayout {
    parent: Kanban;
    popupOverlay: HTMLElement;
    treeViewObj: TreeView;
    treePopup: Popup;
    constructor(parent: Kanban);
    renderSwimlaneHeader(): void;
    renderSwimlaneTree(): void;
    private menuClick;
    private treeSwimlaneClick;
    hidePopup(): void;
    getWidth(): number;
    private drawNode;
}
