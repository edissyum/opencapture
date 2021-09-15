import { Diagram } from '../diagram';
import { PointModel } from '../primitives/point-model';
import { DiagramElement } from '../core/elements/diagram-element';
import { NodeModel } from './../objects/node-model';
import { ITouches } from '../objects/interface/interfaces';
import { PointPortModel } from './../objects/port-model';
import { ShapeAnnotationModel, PathAnnotationModel } from '../objects/annotation-model';
/**
 * Finds the action to be taken for the object under mouse
 *
 */
/**
 * findToolToActivate method\
 *
 * @returns {Actions}    findToolToActivate method .\
 * @param {Object} obj - provide the options value.
 * @param {DiagramElement} wrapper - provide the options value.
 * @param {PointModel} position - provide the options value.
 * @param {Diagram} diagram - provide the options value.
 * @param {ITouches[] | TouchList} touchStart - provide the options value.
 * @param {ITouches[] | TouchList} touchMove - provide the options value.
 * @param {NodeModel | PointPortModel | ShapeAnnotationModel | PathAnnotationModel} target - provide the options value.
 * @private
 */
export declare function findToolToActivate(obj: Object, wrapper: DiagramElement, position: PointModel, diagram: Diagram, touchStart?: ITouches[] | TouchList, touchMove?: ITouches[] | TouchList, target?: NodeModel | PointPortModel | ShapeAnnotationModel | PathAnnotationModel): Actions;
/**
 * findPortToolToActivate method\
 *
 * @returns {boolean}    findPortToolToActivate method .\
 * @param {Diagram} diagram - provide the options value.
 * @param {NodeModel | PointPortModel} target - provide the options value.
 * @param {ITouches[] | TouchList} touchStart - provide the options value.
 * @param {ITouches[] | TouchList} touchMove - provide the options value.
 * @private
 */
export declare function findPortToolToActivate(diagram: Diagram, target?: NodeModel | PointPortModel, touchStart?: ITouches[] | TouchList, touchMove?: ITouches[] | TouchList): Actions;
/**
 * contains method\
 *
 * @returns {boolean}    contains method .\
 * @param {PointModel} mousePosition - provide the options value.
 * @param {PointModel} corner - provide the corner value.
 * @param {number} padding - provide the padding value.
 * @private
 */
export declare function contains(mousePosition: PointModel, corner: PointModel, padding: number): boolean;
/**
 * hasSelection method\
 *
 * @returns {boolean}    hasSelection method .\
 * @param {Diagram} diagram - provide the options value.
 * @private
 */
export declare function hasSelection(diagram: Diagram): boolean;
/**
 * hasSingleConnection method\
 *
 * @returns {boolean}    hasSingleConnection method .\
 * @param {Diagram} diagram - provide the options value.
 * @private
 */
export declare function hasSingleConnection(diagram: Diagram): boolean;
/**
 * isSelected method\
 *
 * @returns {boolean}    isSelected method .\
 * @param {Diagram} diagram - provide the options value.
 * @param {Object} element - provide the options value.
 * @param {boolean} firstLevel - provide the options value.
 * @param {DiagramElement} wrapper - provide the options value.
 * @private
 */
export declare function isSelected(diagram: Diagram, element: Object, firstLevel?: boolean, wrapper?: DiagramElement): boolean;
/** @private */
export declare type Actions = 'None' | 'Select' | 'Drag' | 'FixedUserHandle' | 'ResizeWest' | 'ConnectorSourceEnd' | 'ConnectorTargetEnd' | 'ResizeEast' | 'ResizeSouth' | 'ResizeNorth' | 'ResizeSouthEast' | 'ResizeSouthWest' | 'ResizeNorthEast' | 'ResizeNorthWest' | 'Rotate' | 'ConnectorEnd' | 'Custom' | 'Draw' | 'Pan' | 'BezierSourceThumb' | 'BezierTargetThumb' | 'LayoutAnimation' | 'PinchZoom' | 'Hyperlink' | 'SegmentEnd' | 'OrthoThumb' | 'PortDrag' | 'PortDraw' | 'LabelSelect' | 'LabelDrag' | 'LabelResizeSouthEast' | 'LabelResizeSouthWest' | 'LabelResizeNorthEast' | 'LabelResizeNorthWest' | 'LabelResizeSouth' | 'LabelResizeNorth' | 'LabelResizeWest' | 'LabelResizeEast' | 'LabelRotate';
/**
 * getCursor method\
 *
 * @returns {boolean}    getCursor method .\
 * @param {Actions} cursor - provide the options value.
 * @param {number} angle - provide the options value.
 * @private
 */
export declare function getCursor(cursor: Actions, angle: number): string;
