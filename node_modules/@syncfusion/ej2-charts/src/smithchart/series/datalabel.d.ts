import { Smithchart } from '../../smithchart';
import { SmithchartRect, PointRegion } from '../../smithchart/utils/utils';
import { DataLabelTextOptions, LabelOption } from '../../smithchart/utils/utils';
export declare class DataLabel {
    textOptions: DataLabelTextOptions[];
    labelOptions: LabelOption[];
    private connectorFlag;
    private prevLabel;
    private allPoints;
    drawDataLabel(smithchart: Smithchart, seriesindex: number, groupElement: Element, pointsRegion: PointRegion[], bounds: SmithchartRect): void;
    calculateSmartLabels(points: object, seriesIndex: number): void;
    private compareDataLabels;
    private isCollide;
    private resetValues;
    drawConnectorLines(smithchart: Smithchart, seriesIndex: number, index: number, currentPoint: DataLabelTextOptions, groupElement: Element): void;
    private drawDatalabelSymbol;
}
