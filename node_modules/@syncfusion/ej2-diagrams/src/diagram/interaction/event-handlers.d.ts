import { PointModel } from '../primitives/point-model';
import { IElement } from '../objects/interface/IElement';
import { DiagramElement } from '../core/elements/diagram-element';
import { Diagram } from '../diagram';
import { Connector } from '../objects/connector';
import { Node } from '../objects/node';
import { ConnectorModel } from '../objects/connector-model';
import { PointPortModel } from '../objects/port-model';
import { NodeModel } from '../objects/node-model';
import { ToolBase } from './tool';
import { CommandHandler } from './command-manager';
import { Actions } from './actions';
import { InputArgs } from '@syncfusion/ej2-inputs';
import { ITouches } from '../objects/interface/interfaces';
import { ShapeAnnotationModel, PathAnnotationModel } from '../objects/annotation-model';
/**
 * This module handles the mouse and touch events
 */
export declare class DiagramEventHandler {
    private currentAction;
    private previousAction;
    /**   @private  */
    focus: boolean;
    private action;
    private isBlocked;
    private blocked;
    private commandHandler;
    private isMouseDown;
    private inAction;
    private resizeTo;
    private currentPosition;
    private timeOutValue;
    private doingAutoScroll;
    private prevPosition;
    private diagram;
    private objectFinder;
    private tool;
    private eventArgs;
    private userHandleObject;
    private lastObjectUnderMouse;
    private hoverElement;
    private hoverNode;
    private isScrolling;
    private initialEventArgs;
    /** @private */
    touchStartList: ITouches[] | TouchList;
    /** @private */
    touchMoveList: ITouches[] | TouchList;
    /** @private */
    constructor(diagram: Diagram, commandHandler: CommandHandler);
    /** @private */
    getMousePosition(e: MouseEvent | PointerEvent | TouchEvent): PointModel;
    /**
     * @private
     */
    windowResize(evt: Event): boolean;
    /**
     * @private
     */
    updateViewPortSize(element: HTMLElement): void;
    /** @private */
    canHideResizers(): boolean;
    /** @private */
    private updateCursor;
    private isForeignObject;
    private isMetaKey;
    private renderUmlHighLighter;
    private isDeleteKey;
    private isMouseOnScrollBar;
    /**   @private  */
    updateVirtualization(): void;
    private checkPreviousAction;
    private checkUserHandleEvent;
    mouseDown(evt: PointerEvent): void;
    /**   @private  */
    mouseMoveExtend(e: PointerEvent | TouchEvent, obj: IElement): void;
    /** @private */
    checkAction(obj: IElement): void;
    private isSwimlaneElements;
    /** @private */
    mouseMove(e: PointerEvent | TouchEvent, touches: TouchList): void;
    private getContent;
    private checkAutoScroll;
    /** @private */
    mouseUp(evt: PointerEvent): void;
    private getConnectorPadding;
    private getBlazorClickEventArgs;
    addSwimLaneObject(selectedNode: NodeModel): void;
    /** @private */
    mouseLeave(evt: PointerEvent): void;
    /** @private */
    mouseWheel(evt: WheelEvent): void;
    private keyArgs;
    /** @private */
    keyDown(evt: KeyboardEvent): void;
    private getlabel;
    private getKeyModifier;
    keyUp(evt: KeyboardEvent): void;
    private startAutoScroll;
    private doAutoScroll;
    private mouseEvents;
    private getBlazorCollectionObject;
    private elementEnter;
    private elementLeave;
    private altKeyPressed;
    private ctrlKeyPressed;
    private shiftKeyPressed;
    /** @private */
    scrolled(evt: PointerEvent): void;
    /** @private */
    doubleClick(evt: PointerEvent): void;
    /**
     * @private
     */
    itemClick(actualTarget: NodeModel, diagram: Diagram): NodeModel;
    /**
     * @private
     */
    inputChange(evt: InputArgs): void;
    /**
     * @private
     */
    isAddTextNode(node: Node | Connector, focusOut?: boolean): boolean;
    private checkEditBoxAsTarget;
    private getMouseEventArgs;
    /** @private */
    resetTool(): void;
    /** @private */
    getTool(action: Actions): ToolBase;
    /** @private */
    getCursor(action: Actions): string;
    /** @private */
    findElementUnderMouse(obj: IElement, position: PointModel, padding?: number): DiagramElement;
    /** @private */
    findObjectsUnderMouse(position: PointModel, source?: IElement): IElement[];
    /** @private */
    findObjectUnderMouse(objects: (NodeModel | ConnectorModel)[], action: Actions, inAction: boolean): IElement;
    /** @private */
    findTargetUnderMouse(objects: (NodeModel | ConnectorModel)[], action: Actions, inAction: boolean, position: PointModel, source?: IElement): IElement;
    /** @private */
    findActionToBeDone(obj: NodeModel | ConnectorModel, wrapper: DiagramElement, position: PointModel, target?: NodeModel | PointPortModel | ShapeAnnotationModel | PathAnnotationModel): Actions;
    private updateContainerBounds;
    private updateContainerProperties;
    private updateLaneChildNode;
    private updateContainerPropertiesExtend;
    private addUmlNode;
}
/** @private */
export interface Info {
    ctrlKey?: boolean;
    shiftKey?: boolean;
}
/** @private */
export interface MouseEventArgs {
    position?: PointModel;
    source?: IElement;
    sourceWrapper?: DiagramElement;
    target?: IElement;
    targetWrapper?: DiagramElement;
    info?: Info;
    startTouches?: TouchList | ITouches[];
    moveTouches?: TouchList | ITouches[];
    clickCount?: number;
    actualObject?: IElement;
    portId?: string;
}
/** @private */
export interface HistoryLog {
    hasStack?: boolean;
    isPreventHistory?: boolean;
}
