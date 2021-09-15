import { NodeModel } from '../objects/node-model';
import { Node } from '../objects/node';
import { Diagram } from '../diagram';
import { ConnectorModel } from '../objects/connector-model';
import { PointModel } from '../primitives/point-model';
import { SelectorModel } from '../objects/node-model';
import { Rect } from '../primitives/rect';
import { DiagramElement } from '../core/elements/diagram-element';
import { Actions } from './actions';
/**
 * Interaction for Container
 */
/**
 * updateCanvasBounds method\
 *
 * @returns {  void }    updateCanvasBounds method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel | ConnectorModel} obj - provide the isVertical value.
 * @param {PointModel} position - provide the position value.
 * @param {boolean} isBoundsUpdate - provide the isBoundsUpdate value.
 * @private
 */
export declare function updateCanvasBounds(diagram: Diagram, obj: NodeModel | ConnectorModel, position: PointModel, isBoundsUpdate: boolean): boolean;
/**
 * removeChildInContainer method\
 *
 * @returns {  void }    removeChildInContainer method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel | ConnectorModel} obj - provide the isVertical value.
 * @param {PointModel} position - provide the position value.
 * @param {boolean} isBoundsUpdate - provide the isBoundsUpdate value.
 * @private
 */
export declare function removeChildInContainer(diagram: Diagram, obj: NodeModel | ConnectorModel, position: PointModel, isBoundsUpdate: boolean): void;
/**
 * findBounds method\
 *
 * @returns {  NodeModel | ConnectorModel  }    findBounds method .\
 * @param {NodeModel} obj - provide the diagram value.
 * @param {number} columnIndex - provide the isVertical value.
 * @param {boolean} isHeader - provide the isVertical value.
 * @private
 */
export declare function findBounds(obj: NodeModel, columnIndex: number, isHeader: boolean): Rect;
/**
 * createHelper method\
 *
 * @returns {  NodeModel | ConnectorModel  }    createHelper method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel | ConnectorModel} obj - provide the isVertical value.
 * @private
 */
export declare function createHelper(diagram: Diagram, obj: Node): Node;
/**
 * renderContainerHelper method\
 *
 * @returns {  NodeModel | ConnectorModel  }    renderContainerHelper method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel | ConnectorModel} obj - provide the isVertical value.
 * @private
 */
export declare function renderContainerHelper(diagram: Diagram, obj: SelectorModel | NodeModel | ConnectorModel): NodeModel | ConnectorModel;
/**
 * checkParentAsContainer method\
 *
 * @returns {  void  }    checkParentAsContainer method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel | ConnectorModel} obj - provide the isVertical value.
 * @param {boolean} isChild - provide the isChild value.
 * @private
 */
export declare function checkParentAsContainer(diagram: Diagram, obj: NodeModel | ConnectorModel, isChild?: boolean): boolean;
/**
 * checkChildNodeInContainer method\
 *
 * @returns {  void  }    checkChildNodeInContainer method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel} obj - provide the isVertical value.
 * @private
 */
export declare function checkChildNodeInContainer(diagram: Diagram, obj: NodeModel): void;
/**
 * addChildToContainer method\
 *
 * @returns {  void  }    addChildToContainer method .\
 * @param {DiagramElement} diagram - provide the element value.
 * @param {boolean} parent - provide the isVertical value.
 * @param {PointModel} node - provide the node value.
 * @param {Diagram} isUndo - provide the isUndo value.
 * @param {boolean} historyAction - provide the historyAction value.
 * @private
 */
export declare function addChildToContainer(diagram: Diagram, parent: NodeModel, node: NodeModel, isUndo?: boolean, historyAction?: boolean): void;
export declare function updateLaneBoundsAfterAddChild(container: NodeModel, swimLane: NodeModel, node: NodeModel, diagram: Diagram, isBoundsUpdate?: boolean): boolean;
/**
 * renderStackHighlighter method\
 *
 * @returns {  void  }    renderStackHighlighter method .\
 * @param {DiagramElement} element - provide the element value.
 * @param {boolean} isVertical - provide the isVertical value.
 * @param {PointModel} position - provide the position value.
 * @param {Diagram} diagram - provide the diagram value.
 * @param {boolean} isUml - provide the isUml value.
 * @param {boolean} isSwimlane - provide the isSwimlane value.
 * @private
 */
export declare function renderStackHighlighter(element: DiagramElement, isVertical: boolean, position: PointModel, diagram: Diagram, isUml?: boolean, isSwimlane?: boolean): void;
/**
 * moveChildInStack method\
 *
 * @returns {  void }    moveChildInStack method .\
 * @param {Node} sourceNode - provide the sourceNode value.
 * @param {Node} target - provide the target value.
 * @param {Diagram} diagram - provide the diagram value.
 * @param {Actions} action - provide the action value.
 * @private
 */
export declare function moveChildInStack(sourceNode: Node, target: Node, diagram: Diagram, action: Actions): void;
