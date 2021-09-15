import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class CircularGaugeHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    getGaugeContainer(): any;
    getTitlegroupElement(): any;
    getAxesCollectionElement(): any;
    gethAxisGroupElement(): any;
    getAxisLabelElement(): any;
    getAxisPointerElement(): any;
    getAxisRangesElement(): any;
    getMajorLineElement(): any;
    getAnnotationElement(): any;
    getMinorTickElement(): any;
    getSecondaryElement(): any;
    getRangeBarElement(): any;
    getNeedleElement(): any;
}
