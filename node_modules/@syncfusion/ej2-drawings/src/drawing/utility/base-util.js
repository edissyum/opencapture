import { Rect } from '../primitives/rect';
import { identityMatrix, transformPointByMatrix, rotateMatrix } from '../primitives/matrix';
import { getChildNode } from './dom-util';
import { Size } from '../primitives/size';
/**
 * Implements the basic functionalities
 */
/** @private */
export function randomId() {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    var id = '';
    var num;
    for (var i = 0; i < 5; i++) {
        if ('crypto' in window && 'getRandomValues' in crypto) {
            var count = new Uint16Array(1);
            // tslint:disable-next-line:no-any
            var intCrypto = window.msCrypto || window.crypto;
            num = intCrypto.getRandomValues(count)[0] % (chars.length - 1);
        }
        else {
            num = Math.floor(Math.random() * chars.length);
        }
        if (i === 0 && num < 10) {
            i--;
            continue;
        }
        id += chars.substring(num, num + 1);
    }
    return id;
}
/** @private */
export function cornersPointsBeforeRotation(ele) {
    var bounds = new Rect();
    var top = ele.offsetY - ele.actualSize.height * ele.pivot.y;
    var bottom = ele.offsetY + ele.actualSize.height * (1 - ele.pivot.y);
    var left = ele.offsetX - ele.actualSize.width * ele.pivot.x;
    var right = ele.offsetX + ele.actualSize.width * (1 - ele.pivot.x);
    var topLeft = { x: left, y: top };
    var topCenter = { x: (left + right) / 2, y: top };
    var topRight = { x: right, y: top };
    var middleLeft = { x: left, y: (top + bottom) / 2 };
    var middleRight = { x: right, y: (top + bottom) / 2 };
    var bottomLeft = { x: left, y: bottom };
    var bottomCenter = { x: (left + right) / 2, y: bottom };
    var bottomRight = { x: right, y: bottom };
    bounds = Rect.toBounds([topLeft, topRight, bottomLeft, bottomRight]);
    return bounds;
}
/** @private */
export function rotateSize(size, angle) {
    var matrix = identityMatrix();
    rotateMatrix(matrix, angle, 0, 0);
    var topLeft = transformPointByMatrix(matrix, { x: 0, y: 0 });
    var topRight = transformPointByMatrix(matrix, { x: size.width, y: 0 });
    var bottomLeft = transformPointByMatrix(matrix, { x: 0, y: size.height });
    var bottomRight = transformPointByMatrix(matrix, { x: size.width, y: size.height });
    var minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    var minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
    var maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    var maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
    return new Size(maxX - minX, maxY - minY);
}
/** @private */
export function getBounds(element) {
    var bounds = new Rect();
    var corners;
    corners = cornersPointsBeforeRotation(element);
    var middleLeft = corners.middleLeft;
    var topCenter = corners.topCenter;
    var bottomCenter = corners.bottomCenter;
    var middleRight = corners.middleRight;
    var topLeft = corners.topLeft;
    var topRight = corners.topRight;
    var bottomLeft = corners.bottomLeft;
    var bottomRight = corners.bottomRight;
    element.corners = {
        topLeft: topLeft, topCenter: topCenter, topRight: topRight, middleLeft: middleLeft,
        middleRight: middleRight, bottomLeft: bottomLeft, bottomCenter: bottomCenter, bottomRight: bottomRight
    };
    if (element.rotateAngle !== 0 || element.parentTransform !== 0) {
        var matrix = identityMatrix();
        rotateMatrix(matrix, element.rotateAngle + element.parentTransform, element.offsetX, element.offsetY);
        element.corners.topLeft = topLeft = transformPointByMatrix(matrix, topLeft);
        element.corners.topCenter = topCenter = transformPointByMatrix(matrix, topCenter);
        element.corners.topRight = topRight = transformPointByMatrix(matrix, topRight);
        element.corners.middleLeft = middleLeft = transformPointByMatrix(matrix, middleLeft);
        element.corners.middleRight = middleRight = transformPointByMatrix(matrix, middleRight);
        element.corners.bottomLeft = bottomLeft = transformPointByMatrix(matrix, bottomLeft);
        element.corners.bottomCenter = bottomCenter = transformPointByMatrix(matrix, bottomCenter);
        element.corners.bottomRight = bottomRight = transformPointByMatrix(matrix, bottomRight);
        //Set corners based on rotate angle
    }
    bounds = Rect.toBounds([topLeft, topRight, bottomLeft, bottomRight]);
    element.corners.left = bounds.left;
    element.corners.right = bounds.right;
    element.corners.top = bounds.top;
    element.corners.bottom = bounds.bottom;
    element.corners.center = bounds.center;
    element.corners.width = bounds.width;
    element.corners.height = bounds.height;
    return bounds;
}
/** @private */
export function textAlignToString(value) {
    var state = '';
    switch (value) {
        case 'Center':
            state = 'center';
            break;
        case 'Left':
            state = 'left';
            break;
        case 'Right':
            state = 'right';
            break;
    }
    return state;
}
/** @private */
export function wordBreakToString(value) {
    var state = '';
    switch (value) {
        case 'Wrap':
            state = 'breakall';
            break;
        case 'NoWrap':
            state = 'keepall';
            break;
        case 'WrapWithOverflow':
            state = 'normal';
            break;
        case 'LineThrough':
            state = 'line-through';
            break;
    }
    return state;
}
export function bBoxText(textContent, options) {
    var measureElement = 'measureElement';
    window[measureElement].style.visibility = 'visible';
    var svg = window[measureElement].children[2];
    var text = getChildNode(svg)[1];
    text.textContent = textContent;
    text.setAttribute('style', 'font-size:' + options.fontSize + 'px; font-family:'
        + options.fontFamily + ';font-weight:' + (options.bold ? 'bold' : 'normal'));
    var bBox = text.getBBox().width;
    window[measureElement].style.visibility = 'hidden';
    return bBox;
}
/** @private */
export function middleElement(i, j) {
    var m = 0;
    m = (i + j) / 2;
    return m;
}
/** @private */
export function whiteSpaceToString(value, wrap) {
    if (wrap === 'NoWrap' && value === 'PreserveAll') {
        return 'pre';
    }
    var state = '';
    switch (value) {
        case 'CollapseAll':
            state = 'nowrap';
            break;
        case 'CollapseSpace':
            state = 'pre-line';
            break;
        case 'PreserveAll':
            state = 'pre-wrap';
            break;
    }
    return state;
}
/** @private */
export function rotatePoint(angle, pivotX, pivotY, point) {
    if (angle !== 0) {
        var matrix = identityMatrix();
        rotateMatrix(matrix, angle, pivotX, pivotY);
        return transformPointByMatrix(matrix, point);
    }
    return point;
}
/** @private */
export function getOffset(topLeft, obj) {
    var offX = topLeft.x + obj.desiredSize.width * obj.pivot.x;
    var offY = topLeft.y + obj.desiredSize.height * obj.pivot.y;
    return {
        x: offX, y: offY
    };
}
