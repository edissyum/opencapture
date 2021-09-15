import { Connector } from '../objects/connector';
import { Node } from '../objects/node';
import { Rect } from '../primitives/rect';
import { identityMatrix, transformPointByMatrix, rotateMatrix } from '../primitives/matrix';
import { getUserHandlePosition, checkPortRestriction } from '../utility/diagram-util';
import { canMove, canDragSourceEnd, canDragTargetEnd, canContinuousDraw, canDragSegmentThumb } from '../utility/constraints-util';
import { canZoomPan, defaultTool, canDrawOnce, canDrag, canDraw, canSelect, canRotate } from '../utility/constraints-util';
import { canShowCorner, canResizeCorner } from '../utility/diagram-util';
import { Point } from '../primitives/point';
import { TextElement } from '../core/elements/text-element';
import { PortConstraints, DiagramTools, PortVisibility, ThumbsConstraints } from '../enum/enum';
import { Selector } from '../objects/node';
import { PointPort } from './../objects/port';
import { ShapeAnnotation, PathAnnotation } from '../objects/annotation';
import { checkParentAsContainer } from '../interaction/container-interaction';
/**
 * Finds the action to be taken for the object under mouse
 *
 */
/* tslint:disable */
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
export function findToolToActivate(obj, wrapper, position, diagram, touchStart, touchMove, target) {
    //let conn: Connector = diagram.selectedItems.connectors[0] as Connector;
    if (touchMove && touchMove.length > 1 && touchStart && touchStart.length > 1) {
        return 'PinchZoom';
    }
    if (diagram.currentSymbol) {
        return 'Drag';
    }
    var eventHandler = 'eventHandler';
    if (diagram[eventHandler].action === 'PortDraw') {
        diagram.tool &= ~DiagramTools.DrawOnce;
    }
    //Drawing Tools
    if ((canDrawOnce(diagram) || canContinuousDraw(diagram)) && diagram.drawingObject) {
        return 'Draw';
    }
    if (hasSelection(diagram)) {
        var handle = diagram.selectedItems;
        if (handle.wrapper && canShowCorner(handle.constraints, 'UserHandle')) {
            for (var _i = 0, _a = handle.userHandles; _i < _a.length; _i++) {
                var obj_1 = _a[_i];
                if (obj_1.visible) {
                    var paddedBounds = getUserHandlePosition(handle, obj_1, diagram.scroller.transform);
                    if (contains(position, paddedBounds, obj_1.size / (2 * diagram.scroller.transform.scale))) {
                        return obj_1.name;
                    }
                }
            }
        }
    }
    if (hasSelection(diagram)) {
        var element = (diagram.selectedItems.annotation) ?
            diagram.selectedItems.wrapper.children[0] : diagram.selectedItems.wrapper;
        var selectorBnds = element.bounds;
        var handle = diagram.selectedItems;
        var paddedBounds = new Rect(selectorBnds.x, selectorBnds.y, selectorBnds.width, selectorBnds.height);
        if (hasSingleConnection(diagram) && !diagram.selectedItems.annotation) {
            var conn = diagram.selectedItems.connectors[0];
            var sourcePaddingValue = 10 / diagram.scrollSettings.currentZoom;
            var targetPaddingValue = 10 / diagram.scrollSettings.currentZoom;
            if (canShowCorner(handle.constraints, 'ResizeAll')) {
                if ((canShowCorner(handle.constraints, 'ConnectorSourceThumb'))
                    && canDragSourceEnd(conn) && contains(position, conn.sourcePoint, sourcePaddingValue)) {
                    return 'ConnectorSourceEnd';
                }
                if ((canShowCorner(handle.constraints, 'ConnectorTargetThumb'))
                    && canDragTargetEnd(conn) && contains(position, conn.targetPoint, targetPaddingValue)) {
                    return 'ConnectorTargetEnd';
                }
                var action = checkForConnectorSegment(conn, handle, position, diagram);
                if (action !== 'OrthoThumb') {
                    if ((canShowCorner(handle.constraints, 'ConnectorSourceThumb'))
                        && canDragSourceEnd(conn)) {
                        if (action) {
                            return action;
                        }
                    }
                    if ((canShowCorner(handle.constraints, 'ConnectorTargetThumb'))
                        && canDragTargetEnd(conn)) {
                        if (action) {
                            return action;
                        }
                    }
                }
                else {
                    return action;
                }
            }
        }
        else {
            var ten = 10 / diagram.scroller.currentZoom;
            var matrix = identityMatrix();
            rotateMatrix(matrix, element.rotateAngle + element.parentTransform, element.offsetX, element.offsetY);
            //check for resizing tool
            var x = element.offsetX - element.pivot.x * element.actualSize.width;
            var y = element.offsetY - element.pivot.y * element.actualSize.height;
            var rotateThumb = {
                x: x + ((element.pivot.x === 0.5 ? element.pivot.x * 2 : element.pivot.x) * element.actualSize.width / 2),
                y: y - 30 / diagram.scroller.currentZoom
            };
            rotateThumb = transformPointByMatrix(matrix, rotateThumb);
            var labelSelection = diagram.selectedItems.annotation ? true : false;
            var labelRotate = (labelSelection && (canRotate(diagram.selectedItems.annotation))) ? true : false;
            if (canShowCorner(handle.constraints, 'Rotate') && contains(position, rotateThumb, ten) &&
                (diagram.selectedItems.thumbsConstraints & ThumbsConstraints.Rotate)) {
                if (labelSelection && labelRotate) {
                    return 'LabelRotate';
                }
                else if (!labelSelection) {
                    return 'Rotate';
                }
            }
            paddedBounds.Inflate(ten);
            if (paddedBounds.containsPoint(position)) {
                var action = checkResizeHandles(diagram, element, position, matrix, x, y);
                if (action) {
                    return action;
                }
            }
        }
    }
    //Panning
    if (canZoomPan(diagram) && !obj) {
        return 'Pan';
    }
    if (target instanceof PointPort && (!canZoomPan(diagram))) {
        var action = findPortToolToActivate(diagram, target);
        if (action !== 'None') {
            return action;
        }
    }
    if ((target instanceof ShapeAnnotation || target instanceof PathAnnotation) && (!canZoomPan(diagram) && (canSelect(target)))) {
        if (isSelected(diagram, target, undefined, wrapper) && canMove(target)) {
            return 'LabelDrag';
        }
        return 'LabelSelect';
    }
    if (obj !== null) {
        if (obj instanceof Node || obj instanceof Connector) {
            if (wrapper && wrapper.id) {
                var id = wrapper.id.split(obj.id)[1];
                if (id && id.match('^_icon')) {
                    return 'LayoutAnimation';
                }
            }
            if (wrapper && wrapper.id) {
                var userid = void 0;
                for (var i = 0; i < obj.fixedUserHandles.length; i++) {
                    userid = obj.fixedUserHandles[i].id;
                    if (wrapper.id && (wrapper.id.indexOf(userid) > -1)) {
                        return 'FixedUserHandle';
                    }
                }
            }
            if (wrapper instanceof TextElement && wrapper.hyperlink.link) {
                return 'Hyperlink';
            }
            if (canMove(obj) && isSelected(diagram, obj, false) && diagram.selectedItems.annotation === undefined) {
                if ((obj instanceof Connector && !(contains(position, obj.sourcePoint, obj.hitPadding) ||
                    contains(position, obj.targetPoint, obj.hitPadding))) ||
                    !(obj instanceof Connector)) {
                    return 'Drag';
                }
            }
            else if (obj && canZoomPan(diagram) && !defaultTool(diagram)) {
                return 'Pan';
            }
            else if (diagram.selectedItems.nodes.length && diagram.selectedItems.nodes[0].isLane &&
                diagram.selectedItems.wrapper && diagram.selectedItems.wrapper.bounds.containsPoint(position)) {
                return 'Drag';
            }
            else {
                return 'Select';
            }
        }
        else {
            return 'Select';
        }
    }
    return 'Select';
}
/* tslint:enable */
function checkResizeHandles(diagram, element, position, matrix, x, y) {
    var action;
    if ((diagram.selectedItems.nodes.length === 1 && diagram.selectedItems.connectors.length === 0)
        && diagram.selectedItems.nodes[0].container) {
        action = checkResizeHandleForContainer(diagram, element, position, x, y);
    }
    if (!action && (!diagram.selectedItems.nodes[0] || (!diagram.selectedItems.nodes[0].isPhase &&
        !diagram.selectedItems.nodes[0].isLane && diagram.selectedItems.nodes[0].shape.type !== 'SwimLane'))) {
        action = checkForResizeHandles(diagram, element, position, matrix, x, y);
    }
    if (action) {
        return action;
    }
    return null;
}
/**
 * checkForConnectorSegment method\
 *
 * @returns {Actions}    checkForConnectorSegment method .\
 * @param {Connector} conn - provide the options value.
 * @param {SelectorModel} handle - provide the options value.
 * @param {PointModel} position - provide the options value.
 * @param {Diagram} diagram - provide the options value.
 * @private
 */
function checkForConnectorSegment(conn, handle, position, diagram) {
    var targetPaddingValue = 10 / diagram.scrollSettings.currentZoom;
    var sourcePaddingValue = 10 / diagram.scrollSettings.currentZoom;
    if (conn.type === 'Bezier') {
        for (var i = 0; i < conn.segments.length; i++) {
            var segment = (conn.segments)[i];
            if (contains(position, !Point.isEmptyPoint(segment.point1) ? segment.point1 : segment.bezierPoint1, sourcePaddingValue)) {
                return 'BezierSourceThumb';
            }
            if (contains(position, !Point.isEmptyPoint(segment.point2) ? segment.point2 : segment.bezierPoint2, targetPaddingValue)) {
                return 'BezierTargetThumb';
            }
        }
    }
    if (diagram.connectorEditingToolModule && canDragSegmentThumb(conn)) {
        if (conn.type === 'Straight' || conn.type === 'Bezier') {
            for (var i = 0; i < conn.segments.length; i++) {
                //let segment: StraightSegmentModel | BezierSegmentModel;
                var segment = (conn.segments)[i];
                if (contains(position, segment.point, 10)) {
                    return 'SegmentEnd';
                }
            }
        }
        else {
            for (var i = 0; i < conn.segments.length; i++) {
                var segPoint = { x: 0, y: 0 };
                var segment = (conn.segments)[i];
                if (segment.allowDrag) {
                    for (var j = 0; j < segment.points.length - 1; j++) {
                        var length_1 = Point.distancePoints(segment.points[j], segment.points[j + 1]);
                        if (length_1 >= 50) {
                            segPoint.x = ((segment.points[j].x + segment.points[j + 1].x) / 2);
                            segPoint.y = ((segment.points[j].y + segment.points[j + 1].y) / 2);
                            if (contains(position, segPoint, 30)) {
                                return 'OrthoThumb';
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}
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
export function findPortToolToActivate(diagram, target, 
// eslint-disable-next-line
touchStart, touchMove) {
    if (canDrag(target, diagram) && (checkPortRestriction(target, PortVisibility.Hover)
        || (checkPortRestriction(target, PortVisibility.Visible)))) {
        if ((target.constraints & PortConstraints.Drag)) {
            return 'PortDrag';
        }
    }
    else if (canDraw(target, diagram) && (checkPortRestriction(target, PortVisibility.Hover)
        || (checkPortRestriction(target, PortVisibility.Visible)))) {
        if (target.constraints & PortConstraints.Draw) {
            diagram.drawingObject = {};
            var connector = { type: 'Orthogonal', sourcePortID: target.id };
            diagram.drawingObject = connector;
            diagram.tool |= DiagramTools.DrawOnce;
            diagram.currentDrawingObject = connector;
            return 'PortDraw';
        }
    }
    return 'None';
}
/**
 * Resize handle for container and also object.
 * @private
 */
function checkResizeHandleForContainer(diagram, element, position, x, y) {
    var ten = 10 / diagram.scroller.currentZoom;
    var forty = 40 / diagram.scroller.currentZoom;
    var selectedItems = diagram.selectedItems;
    var width = element.actualSize.width;
    var height = element.actualSize.height;
    var left = new Rect(x, y + 20, element.style.strokeWidth, height - 40);
    var right = new Rect(x + width, y + 20, element.style.strokeWidth, height - 40);
    var top = new Rect(x + 20, y, width - 40, element.style.strokeWidth);
    var bottom = new Rect(x + 20, y + height, width - 40, element.style.strokeWidth);
    var container = checkParentAsContainer(diagram, diagram.selectedItems.nodes[0], true) ?
        diagram.nameTable[diagram.selectedItems.nodes[0].parentId] : diagram.selectedItems.nodes[0];
    if (width >= forty && height >= forty) {
        if (canResizeCorner(selectedItems.constraints, 'ResizeEast', selectedItems.thumbsConstraints, selectedItems) &&
            right.containsPoint(position, ten)) {
            return 'ResizeEast';
        }
        if (canResizeCorner(selectedItems.constraints, 'ResizeSouth', selectedItems.thumbsConstraints, selectedItems) &&
            bottom.containsPoint(position, ten)) {
            return 'ResizeSouth';
        }
        if (container.container.type !== 'Grid') {
            if (canResizeCorner(selectedItems.constraints, 'ResizeWest', selectedItems.thumbsConstraints, selectedItems) &&
                left.containsPoint(position, ten)) {
                return 'ResizeWest';
            }
            if (canResizeCorner(selectedItems.constraints, 'ResizeNorth', selectedItems.thumbsConstraints, selectedItems) &&
                top.containsPoint(position, ten)) {
                return 'ResizeNorth';
            }
        }
    }
    return null;
}
function checkForResizeHandles(diagram, element, position, matrix, x, y) {
    var forty = 40 / diagram.scroller.currentZoom;
    var ten = 10 / diagram.scroller.currentZoom;
    var selectedItems = diagram.selectedItems;
    var labelSelection = (selectedItems.annotation) ? true : false;
    if (element.actualSize.width >= forty && element.actualSize.height >= forty) {
        if (canResizeCorner(selectedItems.constraints, 'ResizeSouthEast', selectedItems.thumbsConstraints, selectedItems) && contains(position, transformPointByMatrix(matrix, { x: x + element.actualSize.width, y: y + element.actualSize.height }), ten)) {
            return (labelSelection) ? 'LabelResizeSouthEast' : 'ResizeSouthEast';
        }
        if (canResizeCorner(selectedItems.constraints, 'ResizeSouthWest', selectedItems.thumbsConstraints, selectedItems) &&
            contains(position, transformPointByMatrix(matrix, { x: x, y: y + element.actualSize.height }), ten)) {
            return (labelSelection) ? 'LabelResizeSouthWest' : 'ResizeSouthWest';
        }
        if (canResizeCorner(selectedItems.constraints, 'ResizeNorthEast', selectedItems.thumbsConstraints, selectedItems) &&
            contains(position, transformPointByMatrix(matrix, { x: x + element.actualSize.width, y: y }), ten)) {
            return (labelSelection) ? 'LabelResizeNorthEast' : 'ResizeNorthEast';
        }
        if (canResizeCorner(selectedItems.constraints, 'ResizeNorthWest', selectedItems.thumbsConstraints, selectedItems) &&
            contains(position, transformPointByMatrix(matrix, { x: x, y: y }), ten)) {
            return (labelSelection) ? 'LabelResizeNorthWest' : 'ResizeNorthWest';
        }
    }
    if (canResizeCorner(selectedItems.constraints, 'ResizeEast', selectedItems.thumbsConstraints, selectedItems) && contains(position, transformPointByMatrix(matrix, { x: x + element.actualSize.width, y: y + element.actualSize.height / 2 }), ten)) {
        return (labelSelection) ? 'LabelResizeEast' : 'ResizeEast';
    }
    if (canResizeCorner(selectedItems.constraints, 'ResizeWest', selectedItems.thumbsConstraints, selectedItems) &&
        contains(position, transformPointByMatrix(matrix, { x: x, y: y + element.actualSize.height / 2 }), ten)) {
        return (labelSelection) ? 'LabelResizeWest' : 'ResizeWest';
    }
    if (canResizeCorner(selectedItems.constraints, 'ResizeSouth', selectedItems.thumbsConstraints, selectedItems) && contains(position, transformPointByMatrix(matrix, { x: x + element.actualSize.width / 2, y: y + element.actualSize.height }), ten)) {
        return (labelSelection) ? 'LabelResizeSouth' : 'ResizeSouth';
    }
    if (canResizeCorner(selectedItems.constraints, 'ResizeNorth', selectedItems.thumbsConstraints, selectedItems) &&
        contains(position, transformPointByMatrix(matrix, { x: x + element.actualSize.width / 2, y: y }), ten)) {
        return (labelSelection) ? 'LabelResizeNorth' : 'ResizeNorth';
    }
    return null;
}
/**
 * contains method\
 *
 * @returns {boolean}    contains method .\
 * @param {PointModel} mousePosition - provide the options value.
 * @param {PointModel} corner - provide the corner value.
 * @param {number} padding - provide the padding value.
 * @private
 */
export function contains(mousePosition, corner, padding) {
    if (mousePosition.x >= corner.x - padding && mousePosition.x <= corner.x + padding) {
        if (mousePosition.y >= corner.y - padding && mousePosition.y <= corner.y + padding) {
            return true;
        }
    }
    return false;
}
/**
 * hasSelection method\
 *
 * @returns {boolean}    hasSelection method .\
 * @param {Diagram} diagram - provide the options value.
 * @private
 */
export function hasSelection(diagram) {
    if (diagram.selectedItems.nodes.length > 0 || diagram.selectedItems.connectors.length > 0) {
        return true;
    }
    return false;
}
/**
 * hasSingleConnection method\
 *
 * @returns {boolean}    hasSingleConnection method .\
 * @param {Diagram} diagram - provide the options value.
 * @private
 */
export function hasSingleConnection(diagram) {
    if (diagram.selectedItems.connectors.length === 1 && !diagram.selectedItems.nodes.length) {
        return true;
    }
    return false;
}
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
export function isSelected(diagram, element, firstLevel, wrapper) {
    if (firstLevel === void 0) { firstLevel = true; }
    if (element instanceof Selector) {
        return true;
    }
    if (element instanceof Node) {
        while (element) {
            if (diagram.selectedItems.nodes.indexOf(element) !== -1 && diagram.selectedItems.annotation === undefined) {
                return true;
            }
            if (!firstLevel) {
                element = diagram.nameTable[element.parentId];
            }
            else {
                break;
            }
        }
    }
    else if (element instanceof Connector) {
        if (diagram.selectedItems.connectors.indexOf(element) !== -1 && diagram.selectedItems.annotation === undefined) {
            return true;
        }
    }
    else if (element instanceof ShapeAnnotation || element instanceof PathAnnotation) {
        if (diagram.selectedItems.annotation && diagram.selectedItems.wrapper.children[0].id === wrapper.id) {
            return true;
        }
    }
    return false;
}
/**
 * getCursor method\
 *
 * @returns {boolean}    getCursor method .\
 * @param {Actions} cursor - provide the options value.
 * @param {number} angle - provide the options value.
 * @private
 */
export function getCursor(cursor, angle) {
    //to avoid angles less than 0 & angles greater than 360
    angle += 360;
    angle %= 360;
    if (cursor.indexOf('Resize') === -1) {
        return cursors[cursor];
    }
    else {
        var dir = cursors[cursor];
        if ((angle >= 0 && angle < 25) || (angle >= 160 && angle <= 205) || (angle >= 340 && angle <= 360)) {
            return dir;
        }
        else if ((angle >= 25 && angle <= 70) || (angle >= 205 && angle <= 250)) {
            if (dir === 'n-resize' || dir === 's-resize') {
                return 'ne-resize';
            }
            else if (dir === 'nw-resize' || dir === 'se-resize') {
                return 'n-resize';
            }
            else if (dir === 'e-resize' || dir === 'w-resize') {
                return 'nw-resize';
            }
            else {
                return 'e-resize';
            }
        }
        else if ((angle >= 70 && angle <= 115) || (angle >= 250 && angle <= 295)) {
            if (dir === 'n-resize' || dir === 's-resize') {
                return 'e-resize';
            }
            else if (dir === 'nw-resize' || dir === 'se-resize') {
                return 'ne-resize';
            }
            else if (dir === 'e-resize' || dir === 'w-resize') {
                return 'n-resize';
            }
            else {
                return 'nw-resize';
            }
        }
        else if ((angle >= 115 && angle <= 155) || (angle >= 295 && angle <= 340)) {
            if (dir === 'n-resize' || dir === 's-resize') {
                return 'nw-resize';
            }
            else if (dir === 'nw-resize' || dir === 'se-resize') {
                return 'e-resize';
            }
            else if (dir === 'e-resize' || dir === 'w-resize') {
                return 'ne-resize';
            }
        }
        else {
            return 'n-resize';
        }
    }
    return cursors[cursor];
}
var cursors = {
    'None': 'default',
    'Rotate': 'crosshair',
    'Select': 'default',
    'Drag': 'move',
    'ResizeWest': 'w-resize',
    'ResizeEast': 'e-resize',
    'ResizeSouth': 's-resize',
    'ResizeNorth': 'n-resize',
    'Draw': 'crosshair',
    'PortDraw': 'crosshair',
    'ResizeNorthEast': 'ne-resize',
    'ResizeNorthWest': 'nw-resize',
    'ResizeSouthEast': 'se-resize',
    'ResizeSouthWest': 'sw-resize',
    'ConnectorSourceEnd': 'move',
    'ConnectorTargetEnd': 'move',
    'BezierSourceThumb': 'move',
    'BezierTargetThumb': 'move',
    'OrthoThumb': 'move',
    'SegmentEnd': 'move',
    'Pan': 'grab',
    'Hyperlink': 'pointer',
    'PortDrag': 'pointer',
    'LabelSelect': 'pointer',
    'LabelDrag': 'move',
    'LabelRotate': 'crosshair',
    'LabelResizeWest': 'w-resize',
    'LabelResizeEast': 'e-resize',
    'LabelResizeSouth': 's-resize',
    'LabelResizeNorth': 'n-resize',
    'LabelResizeNorthEast': 'ne-resize',
    'LabelResizeNorthWest': 'nw-resize',
    'LabelResizeSouthEast': 'se-resize',
    'LabelResizeSouthWest': 'sw-resize'
};
