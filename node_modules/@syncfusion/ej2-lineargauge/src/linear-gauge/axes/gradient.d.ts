import { Pointer, Range } from '../axes/axis';
import { LinearGauge } from '../../linear-gauge';
import { ChildProperty } from '@syncfusion/ej2-base';
import { ColorStopModel, GradientPositionModel } from '../axes/gradient-model';
/**
 * Specified the color information for the gradient in the linear gauge.
 */
export declare class ColorStop extends ChildProperty<ColorStop> {
    /**
     * Specifies the color of the gradient.
     *
     * @default "#000000"
     */
    color: string;
    /**
     * Specifies the opacity of the gradient.
     *
     * @default 1
     */
    opacity?: number;
    /**
     * Specifies the offset of the gradient.
     *
     * @default "0%"
     */
    offset: string;
    /**
     * Specifies the style of the gradient.
     *
     * @default ""
     */
    style?: string;
}
/**
 * Specifies the position in percentage from which the radial gradient must be applied.
 */
export declare class GradientPosition extends ChildProperty<GradientPosition> {
    /**
     * Specifies the horizontal position of the gradient.
     *
     * @default "0%"
     */
    x: string;
    /**
     * Specifies the vertical position of the gradient.
     *
     * @default "0%"
     */
    y: string;
}
/**
 * This specifies the properties of the linear gradient colors for the linear gauge.
 */
export declare class LinearGradient extends ChildProperty<LinearGradient> {
    /**
     * Specifies the start value of the linear gradient.
     *
     * @default "0%"
     */
    startValue: string;
    /**
     * Specifies the end value of the linear gradient.
     *
     * @default "100%"
     */
    endValue: string;
    /**
     * Specifies the color, opacity, offset and style of the linear gradient.
     */
    colorStop: ColorStopModel[];
}
/**
 * This specifies the properties of the radial gradient colors for the linear gauge.
 */
export declare class RadialGradient extends ChildProperty<RadialGradient> {
    /**
     * Specifies the radius of the radial gradient.
     *
     * @default "0%"
     */
    radius: string;
    /**
     * Specifies the outer position of the radial gradient.
     */
    outerPosition: GradientPositionModel;
    /**
     * Specifies the inner position of the radial gradient.
     */
    innerPosition: GradientPositionModel;
    /**
     * Specifies the color, opacity, offset and style of the radial gradient.
     */
    colorStop: ColorStopModel[];
}
/**
 * To get the gradient support for pointers and ranges in the linear gauge.
 *
 * @hidden
 */
export declare class Gradient {
    private gauge;
    constructor(control: LinearGauge);
    /**
     * To get the linear gradient string.
     *
     * @private
     */
    private getLinearGradientColor;
    /**
     * To get the radial gradient string.
     *
     * @private
     */
    private getRadialGradientColor;
    /**
     * To get the color, offset, opacity and style.
     *
     * @private
     */
    private getGradientColor;
    /**
     * To get the gradient color string.
     *
     * @private
     */
    getGradientColorString(element: Pointer | Range): string;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the gradient.
     *
     * @return {void}
     * @private
     */
    destroy(control: LinearGauge): void;
}
