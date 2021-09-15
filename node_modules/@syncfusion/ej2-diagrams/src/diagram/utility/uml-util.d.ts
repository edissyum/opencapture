import { Diagram } from '../diagram';
import { NodeModel, UmlClassModel } from '../objects/node-model';
import { DiagramElement } from '../core/elements/diagram-element';
import { TextStyleModel } from '../core/appearance-model';
import { TextWrap } from '../enum/enum';
import { Node } from '../objects/node';
/**
 * These utility methods help to process the data and to convert it to desired dimensions
 */
/**
 * getULMClassifierShapes method \
 *
 * @returns {DiagramElement} getULMClassifierShapes method .\
 * @param { DiagramElement} content - provide the content  value.
 * @param {NodeModel} node - provide the node  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @private
 */
export declare function getULMClassifierShapes(content: DiagramElement, node: NodeModel, diagram: Diagram): DiagramElement;
/**
 * getClassNodes method \
 *
 * @returns {void} getClassNodes method .\
 * @param { Node} node - provide the node  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {UmlClassModel} classifier - provide the classifier  value.
 * @param {TextWrap} textWrap - provide the textWrap  value.
 * @private
 */
export declare function getClassNodes(node: Node, diagram: Diagram, classifier: UmlClassModel, textWrap: TextWrap): void;
/**
 * getClassMembers method \
 *
 * @returns {void} getClassMembers method .\
 * @param { Node} node - provide the node  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @param {UmlClassModel} classifier - provide the classifier  value.
 * @param {TextWrap} textWrap - provide the textWrap  value.
 * @private
 */
export declare function getClassMembers(node: Node, diagram: Diagram, classifier: UmlClassModel, textWrap: TextWrap): void;
/**
 * addSeparator method \
 *
 * @returns {void} addSeparator method .\
 * @param { Node} stack - provide the stack  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @private
 */
export declare function addSeparator(stack: Node, diagram: Diagram): void;
/**
 * getStyle method \
 *
 * @returns {TextStyleModel} addSeparator method .\
 * @param { Node} stack - provide the stack  value.
 * @param {UmlClassModel} node - provide the node  value.
 * @private
 */
export declare function getStyle(stack: Node, node: UmlClassModel): TextStyleModel;
