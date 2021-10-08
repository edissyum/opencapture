import { Diagram } from '../diagram';
import { NodeModel } from './../objects/node-model';
import { ConnectorModel } from './../objects/connector-model';
import { DiagramAction, RendererAction } from '../enum/enum';
import { Connector } from './../objects/connector';
import { AnnotationModel, PathAnnotationModel, ShapeAnnotationModel } from './../objects/annotation-model';
import { PointPortModel } from './../objects/port-model';
import { SelectorModel } from './../objects/node-model';
/**
 * constraints-util module contains the common constraints \
 *
 * @returns { number }   constraints-util module contains the common constraints  .\
 *
 * @param {ConnectorModel | NodeModel | PathAnnotationModel | ShapeAnnotationModel} node - Provide the DiagramElement value.
 * @private
 */
export declare function canSelect(node: ConnectorModel | NodeModel | PathAnnotationModel | ShapeAnnotationModel): number;
/**
 * Used to check whether we can move the objects ot not\
 *
 * @returns { number }   Used to check whether we can move the objects ot not  .\
 *
 * @param {ConnectorModel | NodeModel | PathAnnotationModel | ShapeAnnotationModel} node - Used to check whether we can move the objects ot not.
 * @private
 */
export declare function canMove(node: ConnectorModel | NodeModel | SelectorModel | ShapeAnnotationModel | PathAnnotationModel): number;
/**
 * Used to check the canEnablePointerEvents\
 *
 * @returns { number }   Used to check whether we can move the objects ot not  .\
 *
 * @param {ConnectorModel | NodeModel} node - Used to check whether we can move the objects ot not.
 * @param {Diagram} diagram - Used to check whether we can move the objects ot not.
 * @private
 */
export declare function canEnablePointerEvents(node: ConnectorModel | NodeModel, diagram: Diagram): number;
/**
 * Used to check the canDelete of the element \
 *
 * @returns { number }   Used to check the canDelete of the element   .\
 *
 * @param {ConnectorModel | NodeModel} node - Used to check whether we can move the objects ot not.
 * @private
 */
export declare function canDelete(node: ConnectorModel | NodeModel): number;
/**
 * Used to check the bridging of the element \
 *
 * @returns { number }   Used to check the bridging of the element   .\
 *
 * @param {ConnectorModel | NodeModel} connector - provide the connector value.
 * @param {ConnectorModel | NodeModel} diagram - provide the diagram value.
 * @private
 */
export declare function canBridge(connector: Connector, diagram: Diagram): number;
/**
 * Used to check the routing  of the element \
 *
 * @returns { number }   Used to check the routing  of the element .\
 *
 * @param {ConnectorModel | NodeModel} connector - provide the connector value.
 * @param {ConnectorModel | NodeModel} diagram - provide the diagram value.
 * @private
 */
export declare function canEnableRouting(connector: Connector, diagram: Diagram): number;
/**
 * Used to check the  source end dragof the element \
 *
 * @returns { number }   Used to check the  source end dragof the element. \
 *
 * @param {ConnectorModel | NodeModel} connector - provide the connector value.
 * @private
 */
export declare function canDragSourceEnd(connector: Connector): number;
/**
 * Used to check the target end drag   of the element \
 *
 * @returns { number }   Used to check the target end drag   of the element .\
 *
 * @param {ConnectorModel | NodeModel} connector - provide the connector value.
 * @private
 */
export declare function canDragTargetEnd(connector: Connector): number;
/**
 * Used to check the segment  drag   of the element \
 *
 * @returns { number }   Used to check the segment  drag   of the element .\
 *
 * @param {ConnectorModel | NodeModel} connector - provide the connector value.
 * @private
 */
export declare function canDragSegmentThumb(connector: Connector): number;
/**
 * Used to check the routing  drag   of the element \
 *
 * @returns { number }   Used to check the segment  drag   of the element .\
 *
 * @param {NodeModel | ShapeAnnotationModel | PathAnnotationModel} node - provide the connector value.
 * @private
 */
export declare function canRotate(node: NodeModel | ShapeAnnotationModel | PathAnnotationModel): number;
/**
 * Used to check shadown constraints   of the element \
 *
 * @returns { number }   Used to check shadown constraints   of the element .\
 *
 * @param {NodeModel} node - provide the connector value.
 * @private
 */
export declare function canShadow(node: NodeModel): number;
/**
 * Used to check canInConnect constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {NodeModel} node - provide the node value.
 * @private
 */
export declare function canInConnect(node: NodeModel): number;
/**
 * Used to check canPortInConnect constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {PointPortModel} port - provide the PointPortModel value.
 * @private
 */
export declare function canPortInConnect(port: PointPortModel): number;
/**
 * Used to check canOutConnect constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {NodeModel} node - provide the node value.
 * @private
 */
export declare function canOutConnect(node: NodeModel): number;
/**
 * Used to check canPortOutConnect constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {PointPortModel} port - provide the node value.
 * @private
 */
export declare function canPortOutConnect(port: PointPortModel): number;
/**
 * Used to check canResize constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {NodeModel | ShapeAnnotationModel | PathAnnotationModel} node - provide the node value.
 * @param {NodeModel | ShapeAnnotationModel | PathAnnotationModel} direction - provide the node value.
 * @private
 */
export declare function canResize(node: NodeModel | ShapeAnnotationModel | PathAnnotationModel, direction?: string): number;
/**
 * Used to check canAllowDrop constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {ConnectorModel | NodeModel} node - provide the node value.
 * @private
 */
export declare function canAllowDrop(node: ConnectorModel | NodeModel): number;
/**
 * Used to check canVitualize constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} diagram - provide the Diagram value.
 * @private
 */
export declare function canVitualize(diagram: Diagram): number;
/**
 * Used to check canEnableToolTip constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {ConnectorModel | NodeModel} node - provide the node value.
 * @param {Diagram} diagram - provide the Diagram value.
 * @private
 */
export declare function canEnableToolTip(node: ConnectorModel | NodeModel, diagram: Diagram): number;
/**
 * Used to check canSingleSelect constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canSingleSelect(model: Diagram): number;
/**
 * Used to check canMultiSelect constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canMultiSelect(model: Diagram): number;
/**
 * Used to check canZoomPan constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canZoomPan(model: Diagram): number;
/**
 * Used to check canContinuousDraw constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canContinuousDraw(model: Diagram): number;
/**
 * Used to check canDrawOnce constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canDrawOnce(model: Diagram): number;
/**
 * Used to check defaultTool constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function defaultTool(model: Diagram): number;
/**
 * Used to check canZoom constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canZoom(model: Diagram): number;
/**
 * Used to check canPan constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canPan(model: Diagram): number;
/**
 * Used to check canUserInteract constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canUserInteract(model: Diagram): number;
/**
 * Used to check canApiInteract constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canApiInteract(model: Diagram): number;
/**
 * Used to check canPanX constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canPanX(model: Diagram): number;
/**
 * Used to check canPanY constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canPanY(model: Diagram): number;
/**
 * Used to check canZoomTextEdit constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} diagram - provide the Diagram value.
 * @private
 */
export declare function canZoomTextEdit(diagram: Diagram): number;
/**
 * Used to check canPageEditable constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} model - provide the Diagram value.
 * @private
 */
export declare function canPageEditable(model: Diagram): number;
/**
 * Used to check enableReadOnly constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {Diagram} annotation - provide the annotation value.
 * @param {Diagram} node - provide the node value.
 * @private
 */
export declare function enableReadOnly(annotation: AnnotationModel, node: NodeModel | ConnectorModel): number;
/**
 * Used to check canDraw constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {PointPortModel | NodeModel} port - provide the Diagram value.
 * @param {Diagram} diagram - provide the Diagram value.
 * @private
 */
export declare function canDraw(port: PointPortModel | NodeModel, diagram: Diagram): number;
/**
 * Used to check canDrag constraints   of the element \
 *
 * @returns { number }   Used to check canInConnect constraints   of the element .\
 *
 * @param {PointPortModel | NodeModel} port - provide the Diagram value.
 * @param {Diagram} diagram - provide the Diagram value.
 * @private
 */
export declare function canDrag(port: PointPortModel | NodeModel, diagram: Diagram): number;
/**
 * Used to check canPreventClearSelection constraints   of the element \
 *
 * @returns { boolean }   Used to check canInConnect constraints   of the element .\
 *
 * @param {PointPortModel | NodeModel} diagramActions - provide the diagramActions value.
 * @private
 */
export declare function canPreventClearSelection(diagramActions: DiagramAction): boolean;
/**
 * Used to check canDrawThumbs \
 *
 * @returns { boolean }   Used to check canInConnect constraints   of the element .\
 *
 * @param {RendererAction} rendererActions - provide the RendererAction value.
 * @private
 */
export declare function canDrawThumbs(rendererActions: RendererAction): boolean;
/**
 * Used to check avoidDrawSelector \
 *
 * @returns { boolean }   Used to check canInConnect constraints   of the element .\
 *
 * @param {RendererAction} rendererActions - provide the RendererAction value.
 * @private
 */
export declare function avoidDrawSelector(rendererActions: RendererAction): boolean;
