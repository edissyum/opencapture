/**
 * Provides information about a Resize event.
 */
export interface ResizeArgs {
    element: HTMLElement | string;
    direction: string;
    minHeight: number;
    minWidth: number;
    maxHeight?: number;
    maxWidth?: number;
    boundary?: HTMLElement | string;
    resizeBegin(e: MouseEvent): void;
    resizing(e: MouseEvent): void;
    resizeComplete(e: MouseEvent): void;
    proxy: any;
}
export declare function createResize(args: ResizeArgs): void;
export declare function setMinHeight(minimumHeight: number): void;
export declare function setMaxWidth(value: number): void;
export declare function setMaxHeight(value: number): void;
export declare function removeResize(): void;
