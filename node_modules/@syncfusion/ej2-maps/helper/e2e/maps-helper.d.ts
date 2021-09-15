import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class MapsHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    getMapsContainer(): any;
    getTitlegroupElement(): any;
    getTitleElement(): any;
    getSubTitleElement(): any;
    getMarkerGroupElement(): any;
    getLayerCollectionElement(): any;
    getLayerIndexGroupElement(): any;
    getSubLayerGroupElement(): any;
    getSecondaryElement(): any;
    getTooltipGroupElement(): any;
    getLegendGroupElement(): any;
    getbubbleGroupElement(): any;
    getnavigationLineGroupElement(): any;
    getTileElement(): any;
    getAnnotationElement(): any;
}
