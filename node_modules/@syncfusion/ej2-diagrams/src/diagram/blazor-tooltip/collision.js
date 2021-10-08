/* eslint-disable valid-jsdoc */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param */
/**
 * Collision module.
 */
import { calculatePosition } from './position';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
var parentDocument;
var targetContainer;
/**
 * @private
 */
export function fit(element, viewPortElement, axis, position) {
    if (viewPortElement === void 0) { viewPortElement = null; }
    if (axis === void 0) { axis = { X: false, Y: false }; }
    if (!axis.Y && !axis.X) {
        return { left: 0, top: 0 };
    }
    var elemData = element.getBoundingClientRect();
    targetContainer = viewPortElement;
    parentDocument = element.ownerDocument;
    if (!position) {
        position = calculatePosition(element, 'left', 'top');
    }
    if (axis.X) {
        var containerWidth = targetContainer ? getTargetContainerWidth() : getViewPortWidth();
        var containerLeft = ContainerLeft();
        var containerRight = ContainerRight();
        var overLeft = containerLeft - position.left;
        var overRight = position.left + elemData.width - containerRight;
        if (elemData.width > containerWidth) {
            if (overLeft > 0 && overRight <= 0) {
                position.left = containerRight - elemData.width;
            }
            else if (overRight > 0 && overLeft <= 0) {
                position.left = containerLeft;
            }
            else {
                position.left = overLeft > overRight ? (containerRight - elemData.width) : containerLeft;
            }
        }
        else if (overLeft > 0) {
            position.left += overLeft;
        }
        else if (overRight > 0) {
            position.left -= overRight;
        }
    }
    if (axis.Y) {
        var containerHeight = targetContainer ? getTargetContainerHeight() : getViewPortHeight();
        var containerTop = ContainerTop();
        var containerBottom = ContainerBottom();
        var overTop = containerTop - position.top;
        var overBottom = position.top + elemData.height - containerBottom;
        if (elemData.height > containerHeight) {
            if (overTop > 0 && overBottom <= 0) {
                position.top = containerBottom - elemData.height;
            }
            else if (overBottom > 0 && overTop <= 0) {
                position.top = containerTop;
            }
            else {
                position.top = overTop > overBottom ? (containerBottom - elemData.height) : containerTop;
            }
        }
        else if (overTop > 0) {
            position.top += overTop;
        }
        else if (overBottom > 0) {
            position.top -= overBottom;
        }
    }
    return position;
}
/**
 * @private
 */
export function isCollide(element, viewPortElement, x, y) {
    if (viewPortElement === void 0) { viewPortElement = null; }
    var elemOffset = calculatePosition(element, 'left', 'top');
    if (x) {
        elemOffset.left = x;
    }
    if (y) {
        elemOffset.top = y;
    }
    var data = [];
    targetContainer = viewPortElement;
    parentDocument = element.ownerDocument;
    var elementRect = element.getBoundingClientRect();
    var top = elemOffset.top;
    var left = elemOffset.left;
    var right = elemOffset.left + elementRect.width;
    var bottom = elemOffset.top + elementRect.height;
    var topData = '';
    var leftData = '';
    var yAxis = topCollideCheck(top, bottom);
    var xAxis = leftCollideCheck(left, right);
    if (yAxis.topSide) {
        data.push('top');
    }
    if (xAxis.rightSide) {
        data.push('right');
    }
    if (xAxis.leftSide) {
        data.push('left');
    }
    if (yAxis.bottomSide) {
        data.push('bottom');
    }
    return data;
}
/**
 * @private
 */
export function flip(element, target, offsetX, offsetY, positionX, positionY, viewPortElement, axis, 
// eslint-disable-next-line @typescript-eslint/ban-types
fixedParent) {
    if (viewPortElement === void 0) { viewPortElement = null; }
    if (axis === void 0) { axis = { X: true, Y: true }; }
    if (!target || !element || !positionX || !positionY || (!axis.X && !axis.Y)) {
        return;
    }
    var tEdge = { TL: null,
        TR: null,
        BL: null,
        BR: null };
    var eEdge = {
        TL: null,
        TR: null,
        BL: null,
        BR: null
    };
    var elementRect = element.getBoundingClientRect();
    var pos = {
        posX: positionX, posY: positionY, offsetX: offsetX, offsetY: offsetY, position: { left: 0, top: 0 }
    };
    targetContainer = viewPortElement;
    parentDocument = target.ownerDocument;
    updateElementData(target, tEdge, pos, fixedParent, elementRect);
    setPosition(eEdge, pos, elementRect);
    if (axis.X) {
        leftFlip(target, eEdge, tEdge, pos, elementRect, true);
    }
    if (axis.Y && tEdge.TL.top > -1) {
        topFlip(target, eEdge, tEdge, pos, elementRect, true);
    }
    setPopup(element, pos, elementRect);
}
/**
 * @private
 */
function setPopup(element, pos, elementRect) {
    var left = 0;
    var top = 0;
    if (element.offsetParent != null
        && (getComputedStyle(element.offsetParent).position === 'absolute' ||
            getComputedStyle(element.offsetParent).position === 'relative')) {
        var data = calculatePosition(element.offsetParent, 'left', 'top', false, elementRect);
        left = data.left;
        top = data.top;
    }
    element.style.top = (pos.position.top + pos.offsetY - (top)) + 'px';
    element.style.left = (pos.position.left + pos.offsetX - (left)) + 'px';
}
/**
 * @private
 */
function updateElementData(target, edge, pos, 
// eslint-disable-next-line @typescript-eslint/ban-types
fixedParent, elementRect) {
    pos.position = calculatePosition(target, pos.posX, pos.posY, fixedParent, elementRect);
    edge.TL = calculatePosition(target, 'left', 'top', fixedParent, elementRect);
    edge.TR = calculatePosition(target, 'right', 'top', fixedParent, elementRect);
    edge.BR = calculatePosition(target, 'left', 'bottom', fixedParent, elementRect);
    edge.BL = calculatePosition(target, 'right', 'bottom', fixedParent, elementRect);
}
/**
 * @private
 */
function setPosition(eStatus, pos, elementRect) {
    eStatus.TL = { top: pos.position.top + pos.offsetY, left: pos.position.left + pos.offsetX };
    eStatus.TR = { top: eStatus.TL.top, left: eStatus.TL.left + elementRect.width };
    eStatus.BL = { top: eStatus.TL.top + elementRect.height,
        left: eStatus.TL.left };
    eStatus.BR = { top: eStatus.TL.top + elementRect.height,
        left: eStatus.TL.left + elementRect.width };
}
/**
 * @private
 */
function leftCollideCheck(left, right) {
    var leftSide = false;
    var rightSide = false;
    if (((left - getBodyScrollLeft()) < ContainerLeft())) {
        leftSide = true;
    }
    if (right > ContainerRight()) {
        rightSide = true;
    }
    return { leftSide: leftSide, rightSide: rightSide };
}
/**
 * @private
 */
function leftFlip(target, edge, tEdge, pos, elementRect, deepCheck) {
    var collideSide = leftCollideCheck(edge.TL.left, edge.TR.left);
    if ((tEdge.TL.left - getBodyScrollLeft()) <= ContainerLeft()) {
        collideSide.leftSide = false;
    }
    if (tEdge.TR.left >= ContainerRight()) {
        collideSide.rightSide = false;
    }
    if ((collideSide.leftSide && !collideSide.rightSide) || (!collideSide.leftSide && collideSide.rightSide)) {
        if (pos.posX === 'right') {
            pos.posX = 'left';
        }
        else {
            pos.posX = 'right';
        }
        pos.offsetX = pos.offsetX + elementRect.width;
        pos.offsetX = -1 * pos.offsetX;
        pos.position = calculatePosition(target, pos.posX, pos.posY, false);
        setPosition(edge, pos, elementRect);
        if (deepCheck) {
            leftFlip(target, edge, tEdge, pos, elementRect, false);
        }
    }
}
/**
 * @private
 */
function topFlip(target, edge, tEdge, pos, elementRect, deepCheck) {
    var collideSide = topCollideCheck(edge.TL.top, edge.BL.top);
    if ((tEdge.TL.top - getBodyScrollTop()) <= ContainerTop()) {
        collideSide.topSide = false;
    }
    if (tEdge.BL.top >= ContainerBottom()) {
        collideSide.bottomSide = false;
    }
    if ((collideSide.topSide && !collideSide.bottomSide) || (!collideSide.topSide && collideSide.bottomSide)) {
        if (pos.posY === 'top') {
            pos.posY = 'bottom';
        }
        else {
            pos.posY = 'top';
        }
        pos.offsetY = pos.offsetY + elementRect.height;
        pos.offsetY = -1 * pos.offsetY;
        pos.position = calculatePosition(target, pos.posX, pos.posY, false, elementRect);
        setPosition(edge, pos, elementRect);
        if (deepCheck) {
            topFlip(target, edge, tEdge, pos, elementRect, false);
        }
    }
}
/**
 * @private
 */
function topCollideCheck(top, bottom) {
    var topSide = false;
    var bottomSide = false;
    if ((top - getBodyScrollTop()) < ContainerTop()) {
        topSide = true;
    }
    if (bottom > ContainerBottom()) {
        bottomSide = true;
    }
    return { topSide: topSide, bottomSide: bottomSide };
}
/**
 * @private
 */
function getTargetContainerWidth() {
    return targetContainer.getBoundingClientRect().width;
}
/**
 * @private
 */
function getTargetContainerHeight() {
    return targetContainer.getBoundingClientRect().height;
}
/**
 * @private
 */
function getTargetContainerLeft() {
    return targetContainer.getBoundingClientRect().left;
}
/**
 * @private
 */
function getTargetContainerTop() {
    return targetContainer.getBoundingClientRect().top;
}
/**
 * @private
 */
function ContainerTop() {
    if (targetContainer) {
        return getTargetContainerTop();
    }
    return 0;
}
/**
 * @private
 */
function ContainerLeft() {
    if (targetContainer) {
        return getTargetContainerLeft();
    }
    return 0;
}
/**
 * @private
 */
function ContainerRight() {
    if (targetContainer) {
        return (getBodyScrollLeft() + getTargetContainerLeft() + getTargetContainerWidth());
    }
    return (getBodyScrollLeft() + getViewPortWidth());
}
/**
 * @private
 */
function ContainerBottom() {
    if (targetContainer) {
        return (getBodyScrollTop() + getTargetContainerTop() + getTargetContainerHeight());
    }
    return (getBodyScrollTop() + getViewPortHeight());
}
/**
 * @private
 */
function getBodyScrollTop() {
    // if(targetContainer)
    //     return targetContainer.scrollTop;
    return parentDocument.documentElement.scrollTop || parentDocument.body.scrollTop;
}
/**
 * @private
 */
function getBodyScrollLeft() {
    // if(targetContainer)
    //     return targetContainer.scrollLeft;
    return parentDocument.documentElement.scrollLeft || parentDocument.body.scrollLeft;
}
/**
 * @private
 */
function getViewPortHeight() {
    return window.innerHeight;
}
/**
 * @private
 */
function getViewPortWidth() {
    var windowWidth = window.innerWidth;
    var offsetWidth = (isNullOrUndefined(document.documentElement)) ? 0 : document.documentElement.offsetWidth;
    return windowWidth - (windowWidth - offsetWidth);
}
