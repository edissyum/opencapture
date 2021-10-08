import { NodeConstraints, AnnotationConstraints } from '../enum/enum';
import { Node } from '../objects/node';
import { randomId } from './../utility/base-util';
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
export function getULMClassifierShapes(content, node, diagram) {
    var classifier;
    var textWrap = 'NoWrap';
    if (node.shape.classifier === 'Class') {
        classifier = node.shape.classShape;
    }
    else if (node.shape.classifier === 'Enumeration') {
        classifier = node.shape.enumerationShape;
    }
    else if (node.shape.classifier === 'Interface') {
        classifier = node.shape.interfaceShape;
    }
    //let attributeText: string = '';
    node.container = { type: 'Stack', orientation: 'Vertical' };
    node.constraints = (NodeConstraints.Default | NodeConstraints.HideThumbs) &
        ~(NodeConstraints.Rotate | NodeConstraints.Resize);
    node.style = {
        fill: node.style.fill, strokeColor: node.style.strokeColor,
        strokeWidth: 1.5
    };
    node.children = [];
    if (node.maxWidth) {
        textWrap = 'Wrap';
    }
    var newObj = new Node(diagram, 'nodes', {
        id: node.id + '_umlClass_header',
        annotations: [
            {
                id: 'name', content: classifier.name,
                offset: { x: 0.5, y: 0.65 }, margin: { left: 10, right: 10 },
                style: {
                    bold: true, fontSize: 14, color: classifier.style.color, fill: classifier.style.fill,
                    textWrapping: textWrap
                }
            }, {
                content: '<<' + node.shape.classifier + '>>', margin: { left: 10, right: 10 },
                id: 'class', style: {
                    fontSize: classifier.style.fontSize,
                    color: classifier.style.color, fill: classifier.style.fill,
                    textWrapping: textWrap
                }, offset: { x: 0.5, y: 0.3 }, constraints: AnnotationConstraints.ReadOnly
            }
        ],
        constraints: (NodeConstraints.Default | NodeConstraints.HideThumbs) & ~(NodeConstraints.Rotate | NodeConstraints.Drag | NodeConstraints.Resize),
        verticalAlignment: 'Stretch',
        horizontalAlignment: 'Stretch',
        style: { fill: node.style.fill, strokeColor: (node.style.strokeColor === 'black') ? '#ffffff00' : node.style.strokeColor }
    }, true);
    diagram.initObject(newObj);
    diagram.nodes.push(newObj);
    diagram.UpdateBlazorDiagramModel(newObj, 'Node');
    node.children.push(newObj.id);
    getClassNodes(node, diagram, classifier, textWrap);
    getClassMembers(node, diagram, classifier, textWrap);
    /* eslint-disable */
    node.offsetX = node.offsetX;
    node.offsetY = node.offsetY;
    node.style.fill = node.style.fill;
    node.borderColor = node.borderColor;
    diagram.initObject(node);
    /* eslint-enable */
    return content;
}
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
export function getClassNodes(node, diagram, classifier, textWrap) {
    if (node.shape.classifier === 'Enumeration') {
        var member = classifier.members;
        if (member && member.length) {
            addSeparator(node, diagram);
            var memberText = '';
            for (var i = 0; i < member.length; i++) {
                var members = member[i];
                if (members.name !== '') {
                    memberText += members.name;
                }
                if (i !== member.length) {
                    var style = getStyle(node, members);
                    var temp = new Node(diagram, 'nodes', {
                        id: randomId() + '_umlMember',
                        annotations: [
                            {
                                id: 'name', content: memberText, offset: { x: 0, y: 0.5 },
                                style: {
                                    bold: true, fontSize: style.fontSize, color: style.color, fill: style.fill,
                                    textWrapping: textWrap
                                },
                                margin: { left: 14, right: 5 }, horizontalAlignment: 'Left'
                            }
                        ], verticalAlignment: 'Stretch', horizontalAlignment: 'Stretch',
                        style: {
                            fill: node.style.fill, strokeColor: (node.style.strokeColor === 'black') ?
                                '#ffffff00' : node.style.strokeColor, textWrapping: textWrap
                        },
                        constraints: (NodeConstraints.Default | NodeConstraints.HideThumbs) & ~(NodeConstraints.Rotate | NodeConstraints.Drag | NodeConstraints.Resize),
                        minHeight: 25
                    }, true);
                    diagram.initObject(temp);
                    diagram.nodes.push(temp);
                    diagram.UpdateBlazorDiagramModel(temp, 'Node');
                    node.children.push(temp.id);
                    memberText = '';
                    if (members.isSeparator && (i !== member.length - 1)) {
                        addSeparator(node, diagram);
                    }
                }
            }
        }
    }
    else {
        var attributes = classifier.attributes;
        if (attributes.length) {
            var attributeText = '';
            addSeparator(node, diagram);
            for (var i = 0; i < attributes.length; i++) {
                var text = void 0;
                var attribute = attributes[i];
                if (attribute.scope && (attribute).scope === 'Public') {
                    text = ' +';
                }
                else if (attribute.scope && attribute.scope === 'Private') {
                    text = '-';
                }
                else if (attribute.scope && attribute.scope === 'Protected') {
                    text = '#';
                }
                else {
                    text = '~';
                }
                if (attribute.name !== '') {
                    if (text) {
                        attributeText += text + ' ' + attribute.name + ' ' + ': ' + attribute.type;
                    }
                }
                if (i !== attributes.length) {
                    var style = getStyle(node, attribute);
                    var temp = new Node(diagram, 'nodes', {
                        id: randomId() + '_umlProperty', style: { fill: node.style.fill,
                            strokeColor: (node.style.strokeColor === 'black') ? '#ffffff00' : node.style.strokeColor },
                        annotations: [
                            {
                                id: 'name', content: attributeText, offset: { x: 0, y: 0.5 },
                                style: {
                                    bold: true, fontSize: style.fontSize, color: style.color, fill: style.fill,
                                    textWrapping: textWrap
                                },
                                margin: { left: 14, right: 5 }, horizontalAlignment: 'Left'
                            }
                        ], verticalAlignment: 'Stretch', horizontalAlignment: 'Stretch',
                        constraints: (NodeConstraints.Default | NodeConstraints.HideThumbs) & ~(NodeConstraints.Rotate | NodeConstraints.Drag | NodeConstraints.Resize),
                        minHeight: 25
                    }, true);
                    diagram.initObject(temp);
                    diagram.nodes.push(temp);
                    diagram.UpdateBlazorDiagramModel(temp, 'Node');
                    node.children.push(temp.id);
                    attributeText = '';
                    if (attribute.isSeparator && (i !== attributes.length - 1)) {
                        addSeparator(node, diagram);
                    }
                }
            }
        }
    }
}
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
export function getClassMembers(node, diagram, classifier, textWrap) {
    if (classifier.methods && classifier.methods.length) {
        var methods = classifier.methods;
        addSeparator(node, diagram);
        var argumentText = '';
        var methodText = '';
        var text = void 0;
        for (var i = 0; i < methods.length; i++) {
            var method = methods[i];
            if (method.scope && method.scope === 'Public') {
                text = ' +';
            }
            else if (method.scope && method.scope === 'Private') {
                text = '-';
            }
            else if (method.scope && method.scope === 'Protected') {
                text = '#';
            }
            else {
                text = '~';
            }
            if (method.parameters) {
                for (var j = 0; j < method.parameters.length; j++) {
                    if (method.parameters[j].type) {
                        argumentText += method.parameters[j].name + ':' + method.parameters[j].type;
                    }
                    else {
                        argumentText += method.parameters[j].name;
                    }
                    if (j !== method.parameters.length - 1) {
                        argumentText += ',';
                    }
                }
            }
            if (method.name !== '') {
                if (text) {
                    methodText += text + ' ' + method.name + '(' + argumentText + ')' + ' ' + ':' + ' ' + method.type;
                }
            }
            if (i !== methods.length) {
                var style = getStyle(node, method);
                var temp = new Node(diagram, 'nodes', {
                    id: randomId() + '_umlMethods', verticalAlignment: 'Stretch', horizontalAlignment: 'Stretch',
                    annotations: [
                        {
                            id: 'name', content: methodText, offset: { x: 0, y: 0.5 },
                            style: {
                                bold: true, fontSize: style.fontSize, color: style.color, fill: style.fill,
                                textWrapping: textWrap
                            },
                            margin: { left: 14, right: 5 }, horizontalAlignment: 'Left'
                        }
                    ],
                    style: {
                        fill: node.style.fill, strokeColor: (node.style.strokeColor === 'black') ?
                            '#ffffff00' : node.style.strokeColor
                    }, minHeight: 25,
                    constraints: (NodeConstraints.Default | NodeConstraints.HideThumbs) & ~(NodeConstraints.Rotate | NodeConstraints.Drag | NodeConstraints.Resize)
                }, true);
                diagram.initObject(temp);
                diagram.nodes.push(temp);
                diagram.UpdateBlazorDiagramModel(temp, 'Node');
                node.children.push(temp.id);
                methodText = '';
                if (method.isSeparator && (i !== methods.length - 1)) {
                    addSeparator(node, diagram);
                }
            }
        }
    }
}
/**
 * addSeparator method \
 *
 * @returns {void} addSeparator method .\
 * @param { Node} stack - provide the stack  value.
 * @param {Diagram} diagram - provide the diagram  value.
 * @private
 */
export function addSeparator(stack, diagram) {
    var lineObject = new Node(diagram, 'nodes', {
        id: randomId() + '_path', height: 1, constraints: NodeConstraints.Default & ~(NodeConstraints.Select),
        verticalAlignment: 'Stretch', horizontalAlignment: 'Stretch',
        style: { strokeColor: (stack.style.strokeColor === 'black') ? '#ffffff00' : stack.style.strokeColor }
    }, true);
    diagram.initObject(lineObject);
    diagram.nodes.push(lineObject);
    stack.children.push(lineObject.id);
}
/**
 * getStyle method \
 *
 * @returns {TextStyleModel} addSeparator method .\
 * @param { Node} stack - provide the stack  value.
 * @param {UmlClassModel} node - provide the node  value.
 * @private
 */
export function getStyle(stack, node) {
    var newStyle = {};
    var style = node.style;
    newStyle.fill = (style.fill !== 'transparent') ? style.fill : stack.style.fill;
    newStyle.color = style.color;
    newStyle.fontSize = (style.fontSize !== 12) ? style.fontSize : stack.style.fontSize;
    newStyle.strokeColor = (style.strokeColor !== 'black') ? style.strokeColor : stack.style.strokeColor;
    newStyle.strokeWidth = (style.strokeWidth !== 1) ? style.strokeWidth : stack.style.strokeWidth;
    return newStyle;
}
