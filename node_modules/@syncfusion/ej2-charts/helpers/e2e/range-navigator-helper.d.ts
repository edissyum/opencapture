import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class RangeNavigatorHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    getRangeNavigatorContainer(): any;
    getRangeSecondaryElement(): any;
    getRangeLeftTooltip(): any;
    getRangeRightTooltip(): any;
    getRangeSvgElement(): any;
    getRangeChartBorder(): any;
    getRangeGridLines(): any;
    getRangeAxisLabels(): any;
    getRangeChart(): any;
    getRangeChartSeriesBorder(): any;
    getRangeSliders(): any;
    getRangeLeftUnselectedArea(): any;
    getRangeRightUnselectedArea(): any;
    getRangeSelectedArea(): any;
    getRangeLeftSlider(): any;
    getRangeRightSlider(): any;
}
