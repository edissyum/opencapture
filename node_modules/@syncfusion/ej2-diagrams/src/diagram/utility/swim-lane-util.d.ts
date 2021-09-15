import { Diagram } from '../diagram';
import { NodeModel, LaneModel, PhaseModel } from '../objects/node-model';
import { Node } from '../objects/node';
import { GridPanel, GridCell, RowDefinition, ColumnDefinition } from '../core/containers/grid';
import { Lane } from '../objects/node';
import { Container } from '../core/containers/container';
import { DiagramElement } from '../core/elements/diagram-element';
import { PointModel } from '../primitives/point-model';
import { Canvas } from '../core/containers/canvas';
import { Rect } from '../primitives/rect';
import { HistoryEntry } from '../diagram/history';
import { SelectorModel } from '../objects/node-model';
import { ClipBoardObject } from '../interaction/command-manager';
/**
 * SwimLane modules are used to rendering and interaction.
 */
/** @private */
/**
 * initSwimLane method \
 *
 * @returns {void} initSwimLane method .\
 * @param { GridPanel} grid - provide the grid  value.
 * @param { Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} node - provide the node  value.
 * @private
 */
export declare function initSwimLane(grid: GridPanel, diagram: Diagram, node: NodeModel): void;
/**
 * addObjectToGrid method \
 *
 * @returns {Container} addObjectToGrid method .\
 * @param { Diagram} diagram - provide the diagram  value.
 * @param { GridPanel} grid - provide the grid  value.
 * @param {NodeModel} parent - provide the parent  value.
 * @param {NodeModel} object - provide the object  value.
 * @param {boolean} isHeader - provide the isHeader  value.
 * @param {boolean} isPhase - provide the isPhase  value.
 * @param {boolean} isLane - provide the isLane  value.
 * @param {string} canvas - provide the canvas  value.
 * @private
 */
export declare function addObjectToGrid(diagram: Diagram, grid: GridPanel, parent: NodeModel, object: NodeModel, isHeader?: boolean, isPhase?: boolean, isLane?: boolean, canvas?: string): Container;
/**
 * headerDefine method \
 *
 * @returns {void} headerDefine method .\
 * @param { GridPanel} grid - provide the grid  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} object - provide the object  value.
 * @private
 */
export declare function headerDefine(grid: GridPanel, diagram: Diagram, object: NodeModel): void;
/**
 * phaseDefine method \
 *
 * @returns {void} phaseDefine method .\
 * @param { GridPanel} grid - provide the grid  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} object - provide the object  value.
 * @param {number} indexValue - provide the indexValue  value.
 * @param {boolean} orientation - provide the orientation  value.
 * @param {number} phaseIndex - provide the phaseIndex  value.
 * @private
 */
export declare function phaseDefine(grid: GridPanel, diagram: Diagram, object: NodeModel, indexValue: number, orientation: boolean, phaseIndex: number): void;
/**
 * laneCollection method \
 *
 * @returns {void} laneCollection method .\
 * @param { GridPanel} grid - provide the grid  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} object - provide the object  value.
 * @param {number} indexValue - provide the indexValue  value.
 * @param {number} laneIndex - provide the laneIndex  value.
 * @param {boolean} orientation - provide the orientation  value.
 * @private
 */
export declare function laneCollection(grid: GridPanel, diagram: Diagram, object: NodeModel, indexValue: number, laneIndex: number, orientation: boolean): void;
/**
 * createRow method \
 *
 * @returns {void} createRow method .\
 * @param { RowDefinition[]} row - provide the row  value.
 * @param {number} height - provide the height  value.
 * @private
 */
export declare function createRow(row: RowDefinition[], height: number): void;
/**
 * createColumn method \
 *
 * @returns {void} createColumn method .\
 * @param {number} width - provide the width  value.
 * @private
 */
export declare function createColumn(width: number): ColumnDefinition;
/**
 * initGridRow method \
 *
 * @returns {void} initGridRow method .\
 * @param {RowDefinition[]} row - provide the row  value.
 * @param {boolean} orientation - provide the row  value.
 * @param {NodeModel} object - provide the row  value.
 * @private
 */
export declare function initGridRow(row: RowDefinition[], orientation: boolean, object: NodeModel): void;
/**
 * initGridColumns method \
 *
 * @returns {void} initGridRow method .\
 * @param {ColumnDefinition[]} columns - provide the row  value.
 * @param {boolean} orientation - provide the row  value.
 * @param {NodeModel} object - provide the row  value.
 * @private
 */
export declare function initGridColumns(columns: ColumnDefinition[], orientation: boolean, object: NodeModel): void;
/**
 * getConnectors method \
 *
 * @returns {void} getConnectors method .\
 * @param {Diagram} diagram - provide the row  value.
 * @param {GridPanel} grid - provide the row  value.
 * @param {number} rowIndex - provide the row  value.
 * @param {boolean} isRowUpdate - provide the row  value.
 * @private
 */
export declare function getConnectors(diagram: Diagram, grid: GridPanel, rowIndex: number, isRowUpdate: boolean): string[];
/**
 * swimLaneMeasureAndArrange method \
 *
 * @returns {void} swimLaneMeasureAndArrange method .\
 * @param {NodeModel} obj - provide the row  value.
 * @private
 */
export declare function swimLaneMeasureAndArrange(obj: NodeModel): void;
/**
 * ChangeLaneIndex method \
 *
 * @returns {void} ChangeLaneIndex method .\
 * @param {Diagram} diagram - provide the row  value.
 * @param {NodeModel} obj - provide the row  value.
 * @param {number} startRowIndex - provide the row  value.
 * @private
 */
export declare function ChangeLaneIndex(diagram: Diagram, obj: NodeModel, startRowIndex: number): void;
/**
 * arrangeChildNodesInSwimLane method \
 *
 * @returns {void} arrangeChildNodesInSwimLane method .\
 * @param {Diagram} diagram - provide the row  value.
 * @param {NodeModel} obj - provide the row  value.
 * @private
 */
export declare function arrangeChildNodesInSwimLane(diagram: Diagram, obj: NodeModel): void;
/**
 * updateChildOuterBounds method \
 *
 * @returns {void} updateChildOuterBounds method .\
 * @param {GridPanel} grid - provide the row  value.
 * @param {NodeModel} obj - provide the row  value.
 * @private
 */
export declare function updateChildOuterBounds(grid: GridPanel, obj: NodeModel): void;
/**
 * checkLaneSize method \
 *
 * @returns {void} checkLaneSize method .\
 * @param {NodeModel} obj - provide the row  value.
 * @private
 */
export declare function checkLaneSize(obj: NodeModel): void;
/**
 * checkPhaseOffset method \
 *
 * @returns {void} checkPhaseOffset method .\
 * @param {NodeModel} obj - provide the obj  value.
 * @param {Diagram} diagram - provide the obj  value.
 * @private
 */
export declare function checkPhaseOffset(obj: NodeModel, diagram: Diagram): void;
/**
 * updateConnectorsProperties method \
 *
 * @returns {void} checkPhaseOffset method .\
 * @param {string[]} connectors - provide the obj  value.
 * @param {Diagram} diagram - provide the obj  value.
 * @private
 */
export declare function updateConnectorsProperties(connectors: string[], diagram: Diagram): void;
/**
 * laneInterChanged method \
 *
 * @returns {void} laneInterChanged method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} obj - provide the obj  value.
 * @param {NodeModel} target - provide the target  value.
 * @param {PointModel} position - provide the position  value.
 * @private
 */
export declare function laneInterChanged(diagram: Diagram, obj: NodeModel, target: NodeModel, position?: PointModel): void;
/**
 * updateSwimLaneObject method \
 *
 * @returns {void} updateSwimLaneObject method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {Node} obj - provide the obj  value.
 * @param {NodeModel} swimLane - provide the target  value.
 * @param {NodeModel} helperObject - provide the position  value.
 * @private
 */
export declare function updateSwimLaneObject(diagram: Diagram, obj: Node, swimLane: NodeModel, helperObject: NodeModel): void;
/**
 * findLaneIndex method \
 *
 * @returns {number} findLaneIndex method .\
 * @param {NodeModel} swimLane - provide the diagram  value.
 * @param {NodeModel} laneObj - provide the obj  value.
 * @private
 */
export declare function findLaneIndex(swimLane: NodeModel, laneObj: NodeModel): number;
/**
 * findPhaseIndex method \
 *
 * @returns {number} findPhaseIndex method .\
 * @param {NodeModel} phase - provide the diagram  value.
 * @param {NodeModel} swimLane - provide the obj  value.
 * @private
 */
export declare function findPhaseIndex(phase: NodeModel, swimLane: NodeModel): number;
/**
 * findStartLaneIndex method \
 *
 * @returns {number} findStartLaneIndex method .\
 * @param {NodeModel} swimLane - provide the obj  value.
 * @private
 */
export declare function findStartLaneIndex(swimLane: NodeModel): number;
/**
 * updatePhaseMaxWidth method \
 *
 * @returns {void} updatePhaseMaxWidth method .\
 * @param {NodeModel} parent - provide the obj  value.
 * @param {Diagram} diagram - provide the obj  value.
 * @param {Canvas} wrapper - provide the obj  value.
 * @param {number} columnIndex - provide the obj  value.
 * @private
 */
export declare function updatePhaseMaxWidth(parent: NodeModel, diagram: Diagram, wrapper: Canvas, columnIndex: number): void;
/**
 * updateHeaderMaxWidth method \
 *
 * @returns {void} updateHeaderMaxWidth method .\
 * @param {NodeModel} diagram - provide the obj  value.
 * @param {NodeModel} swimLane - provide the obj  value.
 * @private
 */
export declare function updateHeaderMaxWidth(diagram: Diagram, swimLane: NodeModel): void;
/**
 * addLane method \
 *
 * @returns {void} addLane method .\
 * @param {Diagram} diagram - provide the obj  value.
 * @param {NodeModel} parent - provide the obj  value.
 * @param {LaneModel} lane - provide the obj  value.
 * @param {number} count - provide the obj  value.
 * @private
 */
export declare function addLane(diagram: Diagram, parent: NodeModel, lane: LaneModel, count?: number): void;
/**
 * addPhase method \
 *
 * @returns {void} addPhase method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} parent - provide the cell  value.
 * @param {PhaseModel} newPhase - provide the point  value.
 * @private
 */
export declare function addPhase(diagram: Diagram, parent: NodeModel, newPhase: PhaseModel): void;
/**
 * addLastPhase method \
 *
 * @returns {void} addLastPhase method .\
 * @param {number} phaseIndex - provide the diagram  value.
 * @param {NodeModel} parent - provide the cell  value.
 * @param {HistoryEntry} entry - provide the point  value.
 * @param {GridPanel} grid - provide the grid  value.
 * @param {boolean} orientation - provide the orientation  value.
 * @param {PhaseModel} newPhase - provide the newPhase  value.
 * @private
 */
export declare function addLastPhase(phaseIndex: number, parent: NodeModel, entry: HistoryEntry, grid: GridPanel, orientation: boolean, newPhase: PhaseModel): void;
/**
 * addHorizontalPhase method \
 *
 * @returns {void} addHorizontalPhase method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} node - provide the cell  value.
 * @param {GridPanel} grid - provide the point  value.
 * @param {number} index - provide the point  value.
 * @param {boolean} orientation - provide the point  value.
 * @private
 */
export declare function addHorizontalPhase(diagram: Diagram, node: NodeModel, grid: GridPanel, index: number, orientation: boolean): void;
/**
 * addVerticalPhase method \
 *
 * @returns {void} addVerticalPhase method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} node - provide the cell  value.
 * @param {GridPanel} grid - provide the point  value.
 * @param {number} rowIndex - provide the point  value.
 * @param {boolean} orientation - provide the point  value.
 * @private
 */
export declare function addVerticalPhase(diagram: Diagram, node: NodeModel, grid: GridPanel, rowIndex: number, orientation: boolean): void;
/**
 * arrangeChildInGrid method \
 *
 * @returns {void} arrangeChildInGrid method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {GridCell} nextCell - provide the nextCell  value.
 * @param {GridPanel} gridCell - provide the gridCell  value.
 * @param {Rect} rect - provide the rect  value.
 * @param {Container} parentWrapper - provide the parentWrapper  value.
 * @param {boolean} orientation - provide the orientation  value.
 * @param {GridCell} prevCell - provide the prevCell  value.
 * @private
 */
export declare function arrangeChildInGrid(diagram: Diagram, nextCell: GridCell, gridCell: GridCell, rect: Rect, parentWrapper: Container, orientation: boolean, prevCell?: GridCell): void;
/**
 * swimLaneSelection method \
 *
 * @returns {void} swimLaneSelection method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} node - provide the node  value.
 * @param {string} corner - provide the corner  value.
 * @private
 */
export declare function swimLaneSelection(diagram: Diagram, node: NodeModel, corner: string): void;
/**
 * pasteSwimLane method \
 *
 * @returns {void} pasteSwimLane method .\
 * @param {Diagram} swimLane - provide the diagram  value.
 * @param {NodeModel} diagram - provide the diagram  value.
 * @param {string} clipboardData - provide the clipboardData  value.
 * @param {string} laneNode - provide the laneNode  value.
 * @param {string} isLane - provide the isLane  value.
 * @param {string} isUndo - provide the isUndo  value.
 * @private
 */
export declare function pasteSwimLane(swimLane: NodeModel, diagram: Diagram, clipboardData?: ClipBoardObject, laneNode?: NodeModel, isLane?: boolean, isUndo?: boolean): NodeModel;
/**
 * gridSelection method \
 *
 * @returns {void} gridSelection method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {SelectorModel} selectorModel - provide the selectorModel  value.
 * @param {string} id - provide the id  value.
 * @param {boolean} isSymbolDrag - provide the isSymbolDrag  value.
 * @private
 */
export declare function gridSelection(diagram: Diagram, selectorModel: SelectorModel, id?: string, isSymbolDrag?: boolean): Canvas;
/**
 * removeLaneChildNode method \
 *
 * @returns {void} removeLaneChildNode method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} swimLaneNode - provide the diagram  value.
 * @param {NodeModel} currentObj - provide the currentObj  value.
 * @param {NodeModel} isChildNode - provide the isChildNode  value.
 * @param {number} laneIndex - provide the laneIndex  value.
 * @private
 */
export declare function removeLaneChildNode(diagram: Diagram, swimLaneNode: NodeModel, currentObj: NodeModel, isChildNode?: NodeModel, laneIndex?: number): void;
/**
 * getGridChildren method \
 *
 * @returns {DiagramElement} getGridChildren method .\
 * @param {Diagram} obj - provide the obj  value.
 * @private
 */
export declare function getGridChildren(obj: DiagramElement): DiagramElement;
/**
 * removeSwimLane method \
 *
 * @returns {void} removeSwimLane method .\
 * @param {Diagram} diagram - provide the obj  value.
 * @param {NodeModel} obj - provide the obj  value.
 * @private
 */
export declare function removeSwimLane(diagram: Diagram, obj: NodeModel): void;
/**
 * removeLane method \
 *
 * @returns {void} removeLane method .\
 * @param {Diagram} diagram - provide the obj  value.
 * @param {NodeModel} lane - provide the obj  value.
 * @param {NodeModel} swimLane - provide the obj  value.
 * @param {LaneModel} lanes - provide the obj  value.
 * @private
 */
export declare function removeLane(diagram: Diagram, lane: NodeModel, swimLane: NodeModel, lanes?: LaneModel): void;
/**
 * removeChildren method \
 *
 * @returns {void} removeChildren method .\
 * @param {Diagram} diagram - provide the obj  value.
 * @param {Canvas} canvas - provide the obj  value.
 * @private
 */
export declare function removeChildren(diagram: Diagram, canvas: Canvas): void;
/**
 * removePhase method \
 *
 * @returns {void} removePhase method .\
 * @param {Diagram} diagram - provide the obj  value.
 * @param {NodeModel} phase - provide the obj  value.
 * @param {NodeModel} swimLane - provide the obj  value.
 * @param {PhaseModel} swimLanePhases - provide the obj  value.
 * @private
 */
export declare function removePhase(diagram: Diagram, phase: NodeModel, swimLane: NodeModel, swimLanePhases?: PhaseModel): void;
/**
 * removeHorizontalPhase method \
 *
 * @returns {void} removeHorizontalPhase method .\
 * @param {Diagram} diagram - provide the obj  value.
 * @param {GridPanel} grid - provide the obj  value.
 * @param {NodeModel} phase - provide the obj  value.
 * @param {number} phaseIndex - provide the obj  value.
 * @private
 */
export declare function removeHorizontalPhase(diagram: Diagram, grid: GridPanel, phase: NodeModel, phaseIndex?: number): void;
/**
 * removeVerticalPhase method \
 *
 * @returns {void} removeVerticalPhase method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {GridPanel} grid - provide the grid  value.
 * @param {NodeModel} phase - provide the phase  value.
 * @param {number} phaseIndex - provide the phaseIndex  value.
 * @param {number} swimLane - provide the swimLane  value.
 * @private
 */
export declare function removeVerticalPhase(diagram: Diagram, grid: GridPanel, phase: NodeModel, phaseIndex: number, swimLane: NodeModel): void;
/**
 * considerSwimLanePadding method \
 *
 * @returns {void} considerSwimLanePadding method .\
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {NodeModel} node - provide the grid  value.
 * @param {number} padding - provide the phase  value.
 * @private
 */
export declare function considerSwimLanePadding(diagram: Diagram, node: NodeModel, padding: number): void;
/**
 * checkLaneChildrenOffset method \
 *
 * @returns {void} checkLaneChildrenOffset method .\
 * @param {NodeModel} swimLane - provide the diagram  value.
 * @private
 */
export declare function checkLaneChildrenOffset(swimLane: NodeModel): void;
/**
 * findLane method \
 *
 * @returns {LaneModel} findLane method .\
 * @param {Node} laneNode - provide the laneNode  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @private
 */
export declare function findLane(laneNode: Node, diagram: Diagram): LaneModel;
/**
 * canLaneInterchange method \
 *
 * @returns {boolean} canLaneInterchange method .\
 * @param {Node} laneNode - provide the laneNode  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @private
 */
export declare function canLaneInterchange(laneNode: Node, diagram: Diagram): boolean;
/**
 * updateSwimLaneChildPosition method \
 *
 * @returns {void} updateSwimLaneChildPosition method .\
 * @param {Lane[]} lanes - provide the laneNode  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @private
 */
export declare function updateSwimLaneChildPosition(lanes: Lane[], diagram: Diagram): void;
