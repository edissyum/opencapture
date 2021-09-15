import { ProgressBar } from '../progressbar';
/**
 * Progressbar Segment
 */
export declare class Segment {
    /** To render the linear segment */
    createLinearSegment(progress: ProgressBar, id: string, width: number, opacity: number, thickness: number, progressWidth: number): Element;
    private getLinearSegmentPath;
    /** To render the circular segment */
    createCircularSegment(progress: ProgressBar, id: string, x: number, y: number, r: number, value: number, opacity: number, thickness: number, totalAngle: number, progressWidth: number): Element;
    private widthToAngle;
    createLinearRange(totalWidth: number, progress: ProgressBar): Element;
    createCircularRange(centerX: number, centerY: number, radius: number, progress: ProgressBar): Element;
    private setLinearGradientColor;
    private setCircularGradientColor;
}
