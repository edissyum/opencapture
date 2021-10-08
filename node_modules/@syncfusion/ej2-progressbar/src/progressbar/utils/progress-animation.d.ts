import { ProgressBar } from '../progressbar';
/**
 * Animation for progress bar
 */
export declare class ProgressAnimation {
    /** Linear Animation */
    doLinearAnimation(element: Element, progress: ProgressBar, delay: number, previousWidth?: number, active?: Element): void;
    /** Linear Indeterminate */
    doLinearIndeterminate(element: Element, progressWidth: number, thickness: number, progress: ProgressBar, clipPath: Element): void;
    /** Linear striped */
    doStripedAnimation(element: Element, progress: ProgressBar, value: number): void;
    /** Circular animation */
    doCircularAnimation(x: number, y: number, radius: number, progressEnd: number, totalEnd: number, element: Element, progress: ProgressBar, thickness: number, delay: number, startValue?: number, previousTotal?: number, active?: Element): void;
    /** Circular indeterminate */
    doCircularIndeterminate(circularProgress: Element, progress: ProgressBar, start: number, end: number, x: number, y: number, radius: number, thickness: number, clipPath: Element): void;
    /** To do the label animation for progress bar */
    doLabelAnimation(labelPath: Element, start: number, end: number, progress: ProgressBar, delay: number, textSize?: number): void;
    /** To do the annotation animation for circular progress bar */
    doAnnotationAnimation(circularPath: Element, progress: ProgressBar, previousEnd?: number, previousTotal?: number): void;
    private activeAnimate;
}
