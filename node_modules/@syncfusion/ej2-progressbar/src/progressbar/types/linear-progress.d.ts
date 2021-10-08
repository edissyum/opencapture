import { ProgressBar } from '../../progressbar';
/**
 * Progress Bar of type Linear
 */
export declare class Linear {
    private progress;
    private delay;
    private segment;
    private animation;
    private isRange;
    private bufferWidth;
    constructor(progress: ProgressBar);
    /** To render the linear track  */
    renderLinearTrack(): void;
    /** To render the linear progress  */
    renderLinearProgress(refresh?: boolean, previousWidth?: number): void;
    /** To render the linear buffer */
    private renderLinearBuffer;
    /** Render the Linear Label */
    renderLinearLabel(isProgressRefresh?: boolean): void;
    /** To render a progressbar active state */
    private renderActiveState;
    /** To render a striped stroke */
    private renderLinearStriped;
    /** checking progress color */
    private checkingLinearProgressColor;
    /** Bootstrap 3 & Bootstrap 4 corner path */
    private cornerRadius;
    /** Bootstrap 3 & Bootstrap 4 corner segment */
    createRoundCornerSegment(id: string, stroke: string, thickness: number, isTrack: boolean, progressWidth: number, progress: ProgressBar, opacity?: number): Element;
}
