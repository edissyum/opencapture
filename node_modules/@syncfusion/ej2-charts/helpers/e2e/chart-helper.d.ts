import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class ChartHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    getChartContainer(): any;
    getAxisInsideElement(): any;
    getAxisOutsideElement(): any;
    getSeriesElement(): any;
    getTooltipElement(): any;
    getLegendElement(): any;
    getAnnotationElement(): any;
    getUserInteractionElement(): any;
    getTrendLineElement(): any;
    getIndicatorElement(): any;
    getZoomingKitElement(): any;
    getStriplineBehindCollection(): any;
    getStriplineOverCollection(): any;
}
