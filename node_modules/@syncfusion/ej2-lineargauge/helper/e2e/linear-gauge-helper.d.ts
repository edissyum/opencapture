import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class LinearGaugeHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    getGaugeContainer(): any;
    getTitlegroupElement(): any;
    getRangesGroupElement(): any;
    getAxisCollectionsElement(): any;
    getAnnotationElement(): any;
    getAxisGroupElement(): any;
    getMinorTicksLineElement(): any;
    getMajorTicksLineElement(): any;
    getSecondaryElement(): any;
    getTooltipElement(): any;
}
