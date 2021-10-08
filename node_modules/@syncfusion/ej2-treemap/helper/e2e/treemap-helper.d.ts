import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class TreeMapHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    getTreeMapContainer(): any;
    getTitlegroupElement(): any;
    getSquarifiedLayoutElement(): any;
    getSliceAndDiceHorizontalLayoutElement(): any;
    getSliceAndDiceVerticaLayoutElement(): any;
    getSliceAndDiceAutoLayoutElement(): any;
    getLegendGroupElement(): any;
    getLevelGroupElement(): any;
    getLevelTextGroupElement(): any;
}
