import { DocumentHelper } from './viewer';
/**
 * @private
 */
export declare class Zoom {
    private documentHelper;
    setZoomFactor(): void;
    constructor(documentHelper: DocumentHelper);
    private readonly viewer;
    private onZoomFactorChanged;
    private zoom;
    /**
     * @private
     * @param {WheelEvent} event Specifies the mouse wheen event
     * @returns {void}
     */
    onMouseWheelInternal: (event: WheelEvent) => void;
}
