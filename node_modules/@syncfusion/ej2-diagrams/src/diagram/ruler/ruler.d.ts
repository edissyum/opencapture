import { Diagram } from '../../diagram';
import { Size } from '../primitives/size';
import { PointModel } from '../primitives/point-model';
/**
 * defines the helper methods for the ruler
 */
/**
 * renderOverlapElement method \
 *
 * @returns {void} renderOverlapElement method .\
 * @param { Diagram} diagram - provide the content  value.
 * @private
 */
export declare function renderOverlapElement(diagram: Diagram): void;
/**
 * renderRuler method \
 *
 * @returns {void} renderRuler method .\
 * @param { Diagram} diagram - provide the content  value.
 * @param { boolean} isHorizontal - provide the content  value.
 * @private
 */
export declare function renderRuler(diagram: Diagram, isHorizontal: boolean): void;
/**
 * updateRuler method \
 *
 * @returns {void} updateRuler method .\
 * @param { Diagram} diagram - provide the diagram  value.
 * @private
 */
export declare function updateRuler(diagram: Diagram): void;
/**
 * removeRulerElements method \
 *
 * @returns {void} removeRulerElements method .\
 * @param { Diagram} diagram - provide the diagram  value.
 * @private
 */
export declare function removeRulerElements(diagram: Diagram): void;
/**
 * getRulerSize method \
 *
 * @returns {void} getRulerSize method .\
 * @param { Diagram} diagram - provide the diagram  value.
 * @private
 */
export declare function getRulerSize(diagram: Diagram): Size;
/**
 * getRulerGeometry method \
 *
 * @returns {void} getRulerGeometry method .\
 * @param { Diagram} diagram - provide the diagram  value.
 * @private
 */
export declare function getRulerGeometry(diagram: Diagram): Size;
/**
 * removeRulerMarkers method \
 *
 * @returns {void} removeRulerMarkers method .\
 * @private
 */
export declare function removeRulerMarkers(): void;
/**
 * drawRulerMarkers method \
 *
 * @returns {void} drawRulerMarkers method .\
 * @param { Diagram} diagram - provide the content  value.
 * @param { PointModel} currentPoint - provide the content  value.
 * @private
 */
export declare function drawRulerMarkers(diagram: Diagram, currentPoint: PointModel): void;
