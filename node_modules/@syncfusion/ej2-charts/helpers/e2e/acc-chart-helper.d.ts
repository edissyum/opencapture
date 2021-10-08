import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class AccumulationChartHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    getAccumulationContainer(): any;
    getAccumulationSecondaryElement(): any;
    getAccumulationTooltip(): any;
    getAccumulationSvgElement(): any;
    getAccumulationSeriesCollection(): any;
    getAccumulationSeries(): any;
    getAccumulationDatalabel(): any;
    getAccumulationTitle(): any;
    getAccumulationSubtitle(): any;
    getAccumulatioLegendCollection(): any;
    getAccumulationLegendBoundary(): any;
    getAccumulationBorder(): any;
    getAccumulationAnnotationCollection(): any;
}
