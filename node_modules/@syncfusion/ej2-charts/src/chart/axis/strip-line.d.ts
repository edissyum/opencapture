import { Chart } from '../chart';
import { Axis } from '../axis/axis';
import { ZIndex } from '../utils/enum';
/**
 * `StripLine` module is used to render the stripLine in chart.
 */
export declare class StripLine {
    /**
     * Finding x, y, width and height of the strip line
     *
     * @param {Axis} axis axis
     * @param {StripLineSettingsModel} stripline stripline
     * @param {Rect} seriesClipRect seriesClipRect
     * @param {number} startValue startValue
     * @param {Axis} segmentAxis segmentAxis
     * @param {Chart} chart chart instance
     */
    private measureStripLine;
    /**
     * To get from to value from start, end, size, start from axis
     *
     * @param {number} start start
     * @param {number} end end
     * @param {number} size size
     * @param {boolean} startFromAxis startFromAxis
     * @param {Axis} axis axis
     * @param {StripLineSettingsModel} stripline stripline
     */
    private getFromTovalue;
    /**
     * Finding end value of the strip line
     *
     * @param {number} to to
     * @param {number} from from
     * @param {number} size size
     * @param {Axis} axis axis
     * @param {number} end end
     * @param {StripLineSettingsModel} stripline stripline
     */
    private getToValue;
    /**
     * To check the strip line values within range
     *
     * @param {number} value value
     * @param {Axis} axis axis
     */
    private findValue;
    /**
     * Date parse
     *
     * @param {Date} value date
     * @param {Chart} chart chart instance
     * @returns {Date} parsed date
     */
    private dateParse;
    /**
     * To render strip lines based start and end.
     *
     * @param {Chart} chart chart
     * @param {ZIndex} position position
     * @param {Axis[]} axes axes
     * @private
     */
    renderStripLine(chart: Chart, position: ZIndex, axes: Axis[]): void;
    /**
     * To convert the C# date to js date
     *
     * @param {string | number | Object} value date value
     * @returns {boolean} returns true if datetime value type is string(for asp platform)
     */
    private isCoreDate;
    /**
     * To get the total milli seconds
     *
     * @param {Date | number | Object} value date value
     * @param {Chart} chart chart instance
     * @returns {number} returns milliseconds
     */
    private dateToMilliSeconds;
    /**
     * To draw the single line strip line
     *
     * @param {StripLineSettingsModel} stripline stripline
     * @param {Rect} rect rect
     * @param {string} id id
     * @param {Element} parent parent
     * @param {Chart} chart chart
     * @param {Axis} axis axis
     */
    private renderPath;
    /**
     * To draw the rectangle
     *
     * @param {StripLineSettingsModel} stripline stripline
     * @param {Rect} rect rect
     * @param {string} id id
     * @param {Element} parent parent
     * @param {Chart} chart chart
     */
    private renderRectangle;
    /**
     * To create the text on strip line
     *
     * @param {StripLineSettingsModel} stripline stripline
     * @param {Rect} rect rect
     * @param {string} id id
     * @param {Element} parent parent
     * @param {Chart} chart chart
     * @param {Axis} axis axis
     */
    private renderText;
    private invertAlignment;
    /**
     * To find the next value of the recurrence strip line
     *
     * @param {Axis} axis axis
     * @param {StripLineSettingsModel} stripline stripline
     * @param {number} startValue startValue
     * @param {Chart} chart chart instance
     * @returns {number} next start value of the recurrence strip line
     */
    private getStartValue;
    /**
     * Finding segment axis for segmented strip line
     *
     * @param {Axis[]} axes axes collection
     * @param {Axis} axis axis
     * @param {StripLineSettingsModel} stripline stripline
     */
    private getSegmentAxis;
    /**
     * To render strip line on chart
     *
     * @param {Axis} axis axis
     * @param {StripLineSettingsModel} stripline stripline
     * @param {Rect} seriesClipRect seriesClipRect
     * @param {string} id id
     * @param {Element} striplineGroup striplineGroup
     * @param {Chart} chart chart
     * @param {number} startValue startValue
     * @param {Axis} segmentAxis segmentAxis
     * @param {number} count count
     */
    private renderStripLineElement;
    /**
     * To find the factor of the text
     *
     * @param {Anchor} anchor text anchor
     */
    private factor;
    /**
     * To find the start value of the text
     *
     * @param {number} xy xy values
     * @param {number} size text size
     * @param {Anchor} textAlignment text alignment
     */
    private getTextStart;
    /**
     * To get the module name for `StripLine`.
     *
     * @private
     */
    getModuleName(): string;
    /**
     * To destroy the `StripLine` module.
     *
     * @private
     */
    destroy(): void;
}
