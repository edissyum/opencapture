import { identityMatrix, rotateMatrix, transformPointByMatrix } from './../primitives/matrix';
import { Container } from './../core/containers/container';
import { StrokeStyle } from './../core/appearance';
import { Point } from './../primitives/point';
import { TextElement } from '../core/elements/text-element';
import { rotatePoint } from './base-util';
/**
 * Implements the drawing functionalities
 */
/** @private */
export function findNearestPoint(reference, start, end) {
    var shortestPoint;
    var shortest = Point.findLength(start, reference);
    var shortest1 = Point.findLength(end, reference);
    if (shortest > shortest1) {
        shortestPoint = end;
    }
    else {
        shortestPoint = start;
    }
    var angleBWStAndEnd = Point.findAngle(start, end);
    var angleBWStAndRef = Point.findAngle(shortestPoint, reference);
    var r = Point.findLength(shortestPoint, reference);
    var vaAngle = angleBWStAndRef + ((angleBWStAndEnd - angleBWStAndRef) * 2);
    return {
        x: (shortestPoint.x + r * Math.cos(vaAngle * Math.PI / 180)),
        y: (shortestPoint.y + r * Math.sin(vaAngle * Math.PI / 180))
    };
}
/** @private */
export function findElementUnderMouse(obj, position, padding) {
    return findTargetElement(obj.wrapper, position, padding);
}
/** @private */
export function findTargetElement(container, position, padding) {
    for (var i = container.children.length - 1; i >= 0; i--) {
        var element = container.children[i];
        if (element && element.bounds.containsPoint(position, 0)) {
            if (element instanceof Container) {
                var target = this.findTargetElement(element, position);
                if (target) {
                    return target;
                }
            }
            if (element.bounds.containsPoint(position, 0)) {
                return element;
            }
        }
    }
    if (container.bounds.containsPoint(position, padding) && container.style.fill !== 'none') {
        return container;
    }
    return null;
}
/** @private */
export function intersect3(lineUtil1, lineUtil2) {
    var point = { x: 0, y: 0 };
    var l1 = lineUtil1;
    var l2 = lineUtil2;
    var d = (l2.y2 - l2.y1) * (l1.x2 - l1.x1) - (l2.x2 - l2.x1) * (l1.y2 - l1.y1);
    var na = (l2.x2 - l2.x1) * (l1.y1 - l2.y1) - (l2.y2 - l2.y1) * (l1.x1 - l2.x1);
    var nb = (l1.x2 - l1.x1) * (l1.y1 - l2.y1) - (l1.y2 - l1.y1) * (l1.x1 - l2.x1);
    if (d === 0) {
        return { enabled: false, intersectPt: point };
    }
    var ua = na / d;
    var ub = nb / d;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        point.x = l1.x1 + (ua * (l1.x2 - l1.x1));
        point.y = l1.y1 + (ua * (l1.y2 - l1.y1));
        return { enabled: true, intersectPt: point };
    }
    return { enabled: false, intersectPt: point };
}
/** @private */
export function intersect2(start1, end1, start2, end2) {
    var point = { x: 0, y: 0 };
    var lineUtil1 = getLineSegment(start1.x, start1.y, end1.x, end1.y);
    var lineUtil2 = getLineSegment(start2.x, start2.y, end2.x, end2.y);
    var line3 = intersect3(lineUtil1, lineUtil2);
    if (line3.enabled) {
        return line3.intersectPt;
    }
    else {
        return point;
    }
}
/** @private */
export function getLineSegment(x1, y1, x2, y2) {
    return { 'x1': Number(x1) || 0, 'y1': Number(y1) || 0, 'x2': Number(x2) || 0, 'y2': Number(y2) || 0 };
}
/** @private */
export function getPoints(element, corners, padding) {
    var line = [];
    padding = padding || 0;
    var left = { x: corners.topLeft.x - padding, y: corners.topLeft.y };
    var right = { x: corners.topRight.x + padding, y: corners.topRight.y };
    var top = { x: corners.bottomRight.x, y: corners.bottomRight.y - padding };
    var bottom = { x: corners.bottomLeft.x, y: corners.bottomLeft.y + padding };
    line.push(left);
    line.push(right);
    line.push(top);
    line.push(bottom);
    return line;
}
/** @private */
export function getBezierDirection(src, tar) {
    if (Math.abs(tar.x - src.x) > Math.abs(tar.y - src.y)) {
        return src.x < tar.x ? 'right' : 'left';
    }
    else {
        return src.y < tar.y ? 'bottom' : 'top';
    }
}
/** @private */
export function updateStyle(changedObject, target) {
    //since text style model is the super set of shape style model, we used text style model
    var style = target.style;
    var textElement = target;
    for (var _i = 0, _a = Object.keys(changedObject); _i < _a.length; _i++) {
        var key = _a[_i];
        switch (key) {
            case 'fill':
                style.fill = changedObject.fill;
                if (style instanceof StrokeStyle) {
                    /* tslint:disable:no-string-literal */
                    style['fill'] = 'transparent';
                }
                break;
            case 'textOverflow':
                style.textOverflow = changedObject.textOverflow;
                break;
            case 'opacity':
                style.opacity = changedObject.opacity;
                break;
            case 'strokeColor':
                style.strokeColor = changedObject.strokeColor;
                break;
            case 'strokeDashArray':
                style.strokeDashArray = changedObject.strokeDashArray;
                break;
            case 'strokeWidth':
                style.strokeWidth = changedObject.strokeWidth;
                break;
            case 'bold':
                style.bold = changedObject.bold;
                break;
            case 'color':
                style.color = changedObject.color;
                break;
            case 'textWrapping':
                style.textWrapping = changedObject.textWrapping;
                break;
            case 'fontFamily':
                style.fontFamily = changedObject.fontFamily;
                break;
            case 'fontSize':
                style.fontSize = changedObject.fontSize;
                break;
            case 'italic':
                style.italic = changedObject.italic;
                break;
            case 'textAlign':
                style.textAlign = changedObject.textAlign;
                break;
            case 'whiteSpace':
                style.whiteSpace = changedObject.whiteSpace;
                break;
            case 'textDecoration':
                style.textDecoration = changedObject.textDecoration;
                break;
        }
    }
    if (target instanceof TextElement) {
        textElement.refreshTextElement();
    }
}
/** @private */
export function scaleElement(element, sw, sh, refObject) {
    if (element.width !== undefined && element.height !== undefined) {
        element.width *= sw;
        element.height *= sh;
    }
    if (element instanceof Container) {
        var matrix = identityMatrix();
        var width = refObject.width || refObject.actualSize.width;
        var height = refObject.height || refObject.actualSize.height;
        if (width !== undefined && height !== undefined) {
            var x = refObject.offsetX - width * refObject.pivot.x;
            var y = refObject.offsetY - height * refObject.pivot.y;
            var refPoint = {
                x: x + width * refObject.pivot.x,
                y: y + height * refObject.pivot.y
            };
            refPoint = rotatePoint(refObject.rotateAngle, refObject.offsetX, refObject.offsetY, refPoint);
            rotateMatrix(matrix, -refObject.rotateAngle, refPoint.x, refPoint.y);
            //    scaleMatrix(matrix, sw, sh, refPoint.x, refPoint.y);
            rotateMatrix(matrix, refObject.rotateAngle, refPoint.x, refPoint.y);
            for (var _i = 0, _a = element.children; _i < _a.length; _i++) {
                var child = _a[_i];
                if (child.width !== undefined && child.height !== undefined) {
                    var newPosition = transformPointByMatrix(matrix, { x: child.offsetX, y: child.offsetY });
                    child.offsetX = newPosition.x;
                    child.offsetY = newPosition.y;
                    scaleElement(child, sw, sh, refObject);
                }
            }
        }
    }
}
/** @private */
export function contains(mousePosition, corner, padding) {
    if (mousePosition.x >= corner.x - padding && mousePosition.x <= corner.x + padding) {
        if (mousePosition.y >= corner.y - padding && mousePosition.y <= corner.y + padding) {
            return true;
        }
    }
    return false;
}
/** @private */
export function getPoint(x, y, w, h, angle, offsetX, offsetY, cornerPoint) {
    var pivot = { x: 0, y: 0 };
    var trans = identityMatrix();
    rotateMatrix(trans, angle, offsetX, offsetY);
    switch (cornerPoint.x) {
        case 0:
            switch (cornerPoint.y) {
                case 0:
                    pivot = transformPointByMatrix(trans, ({ x: x, y: y }));
                    break;
                case 0.5:
                    pivot = transformPointByMatrix(trans, ({ x: x, y: y + h / 2 }));
                    break;
                case 1:
                    pivot = transformPointByMatrix(trans, ({ x: x, y: y + h }));
                    break;
            }
            break;
        case 0.5:
            switch (cornerPoint.y) {
                case 0:
                    pivot = transformPointByMatrix(trans, ({ x: x + w / 2, y: y }));
                    break;
                case 0.5:
                    pivot = transformPointByMatrix(trans, ({ x: x + w / 2, y: y + h / 2 }));
                    break;
                case 1:
                    pivot = transformPointByMatrix(trans, ({ x: x + w / 2, y: y + h }));
                    break;
            }
            break;
        case 1:
            switch (cornerPoint.y) {
                case 0:
                    pivot = transformPointByMatrix(trans, ({ x: x + w, y: y }));
                    break;
                case 0.5:
                    pivot = transformPointByMatrix(trans, ({ x: x + w, y: y + h / 2 }));
                    break;
                case 1:
                    pivot = transformPointByMatrix(trans, ({ x: x + w, y: y + h }));
                    break;
            }
            break;
    }
    return { x: pivot.x, y: pivot.y };
}
