import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class SparklineHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    getSparklineContainer(): any;
    getLinePathElement(): any;
    getAreaElement(): any;
    getColumnElement(): any;
    getWinlossElement(): any;
    getPieElement(): any;
    getMarkerGroupElement(): any;
    getLabelGroupElement(): any;
    getTooltipElement(): any;
}
