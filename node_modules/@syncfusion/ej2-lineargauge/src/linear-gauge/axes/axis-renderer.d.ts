import { LinearGauge } from '../../linear-gauge';
import { Axis, Tick, Pointer } from './axis';
import { AxisModel } from './axis-model';
import { Animations } from './animation';
import { Rect } from '../utils/helper';
/**
 * @private
 * To render the axis elements
 */
export declare class AxisRenderer extends Animations {
    private htmlObject;
    private axisObject;
    private axisElements;
    constructor(gauge: LinearGauge);
    renderAxes(): void;
    axisAlign(axes: AxisModel[]): void;
    drawAxisLine(axis: Axis, axisObject: Element, axisIndex: number): void;
    drawTicks(axis: Axis, ticks: Tick, axisObject: Element, tickID: string, tickBounds: Rect): void;
    drawAxisLabels(axis: Axis, axisObject: Element): void;
    drawPointers(axis: Axis, axisObject: Element, axisIndex: number): void;
    drawMarkerPointer(axis: Axis, axisIndex: number, pointer: Pointer, pointerIndex: number, parentElement: Element): void;
    drawBarPointer(axis: Axis, axisIndex: number, pointer: Pointer, pointerIndex: number, parentElement: Element): void;
    drawRanges(axis: Axis, axisObject: Element, axisIndex: number): void;
}
