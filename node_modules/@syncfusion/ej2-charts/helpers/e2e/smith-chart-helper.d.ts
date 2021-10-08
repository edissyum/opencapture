import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class SmithChartHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    getSmithchartContainer(): any;
    getTitlegroupElement(): any;
    getHorizontalAxisMajorGridLinesElement(): any;
    gethAxisLineElement(): any;
    getRadialAxisMajorGridLinesElement(): any;
    getRAxisLineElement(): any;
    getHAxisLabelsElement(): any;
    getRAxisLabelsElement(): any;
    getseriesCollectionsElement(): any;
    getMarkerElement(): any;
    getSecondaryElement(): any;
    getLegendElement(): any;
}
