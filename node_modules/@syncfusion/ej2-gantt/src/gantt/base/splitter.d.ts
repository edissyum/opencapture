import { Gantt } from '../base/gantt';
import { Splitter as SplitterLayout } from '@syncfusion/ej2-layouts';
import { SplitterSettingsModel } from '../models/models';
/**
 * Splitter module is used to define the splitter position in Gantt layout.
 */
export declare class Splitter {
    private parent;
    splitterObject: SplitterLayout;
    splitterPreviousPositionGrid: string;
    splitterPreviousPositionChart: string;
    constructor(ganttObj?: Gantt);
    /**
     * @returns {void} .
     * @private
     */
    renderSplitter(): void;
    /**
     * @param {SplitterSettingsModel} splitter .
     * @param {boolean} isDynamic .
     * @returns {string} .
     * @private
     */
    calculateSplitterPosition(splitter: SplitterSettingsModel, isDynamic?: boolean): string;
    /**
     * @param {string} position .
     * @returns {string} .
     */
    private getSpliterPositionInPercentage;
    /**
     * @param {number} index .
     * @returns {number} .
     */
    private getTotalColumnWidthByIndex;
    /**
     * @returns {void} .
     * @private
     */
    updateSplitterPosition(): void;
    /**
     * @returns {void} .
     * @private
     */
    triggerCustomResizedEvent(): void;
    private destroy;
}
