import { TitleModel } from '../../smithchart/title/title-model';
import { Smithchart } from '../../smithchart';
import { SmithchartRect } from '../../smithchart/utils/utils';
export declare class AreaBounds {
    yOffset: number;
    calculateAreaBounds(smithchart: Smithchart, title: TitleModel, bounds: SmithchartRect): SmithchartRect;
    private getLegendSpace;
}
