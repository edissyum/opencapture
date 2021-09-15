import { LinearGauge } from '../../linear-gauge';
import { Axis, Pointer } from './axis';
/**
 * @private
 * To handle the animation for gauge
 */
export declare class Animations {
    gauge: LinearGauge;
    constructor(gauge: LinearGauge);
    /**
     * To do the marker pointer animation.
     *
     * @return {void}
     * @private
     */
    performMarkerAnimation(element: Element, axis: Axis, pointer: Pointer): void;
    /**
     * Perform the bar pointer animation
     *
     * @param element
     * @param axis
     * @param pointer
     */
    performBarAnimation(element: Element, axis: Axis, pointer: Pointer): void;
}
