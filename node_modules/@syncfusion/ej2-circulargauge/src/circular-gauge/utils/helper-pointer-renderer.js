/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/**
 * Specifies Circular-Gauge pointer-render Helper methods
 */
import { getLocationFromAngle, isCompleteAngle, getDegree } from './helper-common';
/**
 * Function to calculate the value for linear animation effect
 *
 * @param {number} currentTime - Specifies the currentTime.
 * @param {number} startValue - Specifies the startValue.
 * @param {number} endValue - Specifies the endValue.
 * @param {number} duration - Specifies the duration.
 * @returns {number} - Returns the number.
 * @private
 */
export function linear(currentTime, startValue, endValue, duration) {
    return -endValue * Math.cos(currentTime / duration * (Math.PI / 2)) + endValue + startValue;
}
/**
 * Function to calculate the complete path arc of the circular gauge.
 *
 * @param {GaugeLocation} center - Specifies the center value.
 * @param {number} start - Specifies the start value.
 * @param {number} end - Specifies the end value.
 * @param {number} radius - Specifies the radius value.
 * @param {number} innerRadius - Specifies the innerRadius value.
 * @param {boolean} checkMinValue - Specifies the checkMinValue value.
 * @returns {string} - Returns the path value.
 * @private
 */
export function getCompleteArc(center, start, end, radius, innerRadius, checkMinValue) {
    end -= isCompleteAngle(start, end) && !checkMinValue ? 0.0001 : 0;
    var degree = getDegree(start, end);
    return getCompletePath(center, getLocationFromAngle(start, radius, center), getLocationFromAngle(end, radius, center), radius, getLocationFromAngle(start, innerRadius, center), getLocationFromAngle(end, innerRadius, center), innerRadius, (degree < 180) ? 0 : 1);
}
/**
 * Function to get the complete path direction of the circular gauge.
 *
 * @param {GaugeLocation} center - Specifies the center value.
 * @param {GaugeLocation} start - Specifies the start value.
 * @param {GaugeLocation} end - Specifies the end value.
 * @param {number} radius - Specifies the radius value.
 * @param {GaugeLocation} innerStart - Specifies the innerStart value.
 * @param {GaugeLocation} innerEnd - Specifies the innerEnd value.
 * @param {number} innerRadius - Specifies the innerRadius value.
 * @param {number} clockWise - Specifies the clockWise.
 * @returns {string} - Returns the path.
 * @private
 */
export function getCompletePath(center, start, end, radius, innerStart, innerEnd, innerRadius, clockWise) {
    return 'M ' + start.x + ' ' + start.y + ' A ' + radius + ' ' + radius + ' 0 ' + clockWise +
        ' 1 ' + end.x + ' ' + end.y + ' L ' + innerEnd.x + ' ' + innerEnd.y + ' A ' + innerRadius +
        ' ' + innerRadius + ' 0 ' + clockWise + ',0 ' + innerStart.x + ' ' + innerStart.y + ' Z';
}
