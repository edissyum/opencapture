import { Dictionary } from '../../base/dictionary';
import { DocumentEditor } from '../../document-editor';
import { IWidget, ImageElementBox, Page, ShapeElementBox } from '../viewer/page';
import { Point, ImagePointInfo } from './editor-helper';
import { BaseHistoryInfo } from '../editor-history/base-history-info';
import { DocumentHelper } from '../viewer';
/**
 * Image resizer implementation.
 */
export declare class ImageResizer {
    private documentHelper;
    /**
     * @private
     */
    owner: DocumentEditor;
    private currentImageElementBoxIn;
    /**
     * @private
     */
    resizeContainerDiv: HTMLDivElement;
    /**
     * @private
     */
    topLeftRect: HTMLDivElement;
    /**
     * @private
     */
    topMiddleRect: HTMLDivElement;
    /**
     * @private
     */
    topRightRect: HTMLDivElement;
    /**
     * @private
     */
    bottomLeftRect: HTMLDivElement;
    /**
     * @private
     */
    bottomMiddleRect: HTMLDivElement;
    /**
     * @private
     */
    bottomRightRect: HTMLDivElement;
    /**
     * @private
     */
    leftMiddleRect: HTMLDivElement;
    /**
     * @private
     */
    rightMiddleRect: HTMLDivElement;
    /**
     * @private
     */
    topLeftRectParent: HTMLDivElement;
    /**
     * @private
     */
    topMiddleRectParent: HTMLDivElement;
    /**
     * @private
     */
    topRightRectParent: HTMLDivElement;
    /**
     * @private
     */
    bottomLeftRectParent: HTMLDivElement;
    /**
     * @private
     */
    bottomMiddleRectParent: HTMLDivElement;
    /**
     * @private
     */
    bottomRightRectParent: HTMLDivElement;
    /**
     * @private
     */
    leftMiddleRectParent: HTMLDivElement;
    /**
     * @private
     */
    rightMiddleRectParent: HTMLDivElement;
    /**
     * @private
     */
    resizeMarkSizeIn: number;
    /**
     * @private
     */
    selectedImageWidget: Dictionary<IWidget, SelectedImageInfo>;
    /**
     * @private
     */
    baseHistoryInfo: BaseHistoryInfo;
    private imageResizerDiv;
    /**
     * @private
     */
    isImageResizing: boolean;
    /**
     * @private
     */
    isImageResizerVisible: boolean;
    /**
     * @private
     */
    currentPage: Page;
    /**
     * @private
     */
    isImageMoveToNextPage: boolean;
    /**
     * @private
     */
    imageResizerDivElement: HTMLDivElement;
    /**
     * @private
     */
    imageResizerPoints: ImageResizingPoints;
    /**
     * @private
     */
    selectedResizeElement: HTMLElement;
    /**
     * @private
     */
    topValue: number;
    /**
     * @private
     */
    leftValue: number;
    /**
     * Gets or Sets the current image element box.
     *
     * @private
     * @returns {ImageElementBox | ShapeElementBox} - Returns the image element.
     */
    /**
    * @param {ImageElementBox | ShapeElementBox} value - Specifies the current element box.
    */
    currentImageElementBox: ImageElementBox | ShapeElementBox;
    /**
     * Gets or Sets the resize mark size.
     *
     * @private
     * @returns {number} - Returns resize mark size
     */
    /**
    * @private
    * @param {number} value - Specifies resize mark size.
    */
    resizeMarkSize: number;
    /**
     * @returns {boolean} - Returns the shape size.
     */
    readonly isShapeResize: boolean;
    /**
     * Constructor for image resizer module.
     *
     * @param {DocumentEditor} node - Specfies the document editor
     * @param {DocumentHelper} documentHelper - Specified the document helper
     * @private
     */
    constructor(node: DocumentEditor, documentHelper: DocumentHelper);
    private readonly viewer;
    private getModuleName;
    /**
     * Sets image resizer position.
     *
     * @param {number} x - Specifies for image resizer left value.
     * @param {number} y - Specifies for image resizer top value.
     * @param {number} width - Specifies for image resizer width value.
     * @param {number} height - Specifies for image resizer height value.
     * @private
     * @returns {void}
     */
    setImageResizerPositions(x: number, y: number, width: number, height: number): void;
    /**
     * Creates image resizer DOM element.
     *
     * @private
     * @returns {void}
     */
    initializeImageResizer(): void;
    /**
     * Position an image resizer
     *
     * @private
     * @param {ImageElementBox} elementBox - Specifies the image position.
     * @returns {void}
     */
    positionImageResizer(elementBox: ImageElementBox | ShapeElementBox): void;
    /**
     * Shows the image resizer.
     *
     * @private
     * @returns {void}
     */
    showImageResizer(): void;
    /**
     * Hides the image resizer.
     *
     * @private
     * @returns {void}
     */
    hideImageResizer(): void;
    /**
     * Initialize the resize marks.
     *
     * @private
     * @param {HTMLElement} resizeDiv - Specifies to appending resizer container div element.
     * @param {ImageResizer} imageResizer - Specifies to creating div element of each position.
     * @returns {void}
     */
    initResizeMarks(resizeDiv: HTMLElement, imageResizer: ImageResizer): HTMLDivElement;
    /**
     * Sets the image resizer position.
     *
     * @private
     * @param {number} left - Specifies for image resizer left value.
     * @param {number} top - Specifies for image resizer top value.
     * @param {number} width - Specifies for image resizer width value.
     * @param {number} height - Specifies for image resizer height value.
     * @param {ImageResizer} imageResizer - Specifies for image resizer.
     * @returns {void}
     */
    setImageResizerPosition(left: number, top: number, width: number, height: number, imageResizer: ImageResizer): void;
    /**
     * Sets the image resizing points.
     *
     * @private
     * @param {ImageResizer} imageResizer - Specifies for position of each resizing elements.
     * @returns {void}
     */
    setImageResizingPoints(imageResizer: ImageResizer): void;
    /**
     * Initialize the resize container div element.
     *
     * @private
     * @param {ImageResizer} imageResizer - Specifies for creating resize container div element.
     * @returns {void}
     */
    initResizeContainerDiv(imageResizer: ImageResizer): void;
    /**
     * Apply the properties of each resize rectangle element.
     *
     * @private
     * @param {HTMLDivElement} resizeRectElement - Specifies for applying properties to resize rectangle element.
     * @returns {void}
     */
    applyProperties(resizeRectElement: HTMLDivElement): void;
    /**
     * Handles an image resizing.
     *
     * @private
     * @param {number} x  - Specifies for left value while resizing.
     * @param {number} y - Specifies for top value while resizing.
     * @returns {void}
     */
    private handleImageResizing;
    /**
     * Handles image resizing on mouse.
     *
     * @private
     * @param {MouseEvent} event - Specifies for image resizing using mouse event.
     * @returns {void}
     */
    handleImageResizingOnMouse(event: MouseEvent): void;
    private topMiddleResizing;
    private leftMiddleResizing;
    private topRightResizing;
    private topLeftResizing;
    private bottomRightResizing;
    private bottomLeftResizing;
    private getOuterResizingPoint;
    private getInnerResizingPoint;
    /**
     * Handles image resizing on touch.
     *
     * @private
     * @param {TouchEvent} touchEvent - Specifies for image resizing using touch event.
     * @returns {void}
     */
    handleImageResizingOnTouch(touchEvent: TouchEvent): void;
    /**
     * Gets the image point of mouse.
     *
     * @private
     * @param {Point} touchPoint - Specifies for resizer cursor position.
     * @returns {ImagePointInfo} - Returns image point
     */
    getImagePoint(touchPoint: Point): ImagePointInfo;
    private applyPropertiesForMouse;
    /**
     * Gets the image point of touch.
     *
     * @private
     * @param {Point} touchPoints - Specifies for resizer cursor position.
     * @returns {ImagePointInfo} - Returns image point info.
     */
    getImagePointOnTouch(touchPoints: Point): ImagePointInfo;
    private applyPropertiesForTouch;
    /**
     * @private
     * @returns {void}
     */
    mouseUpInternal(): void;
    /**
     * Initialize history for image resizer.
     *
     * @private
     * @param {ImageResizer} imageResizer - Specifies for image resizer.
     * @param {WImage} imageContainer - Specifies for an image.
     * @returns {void}
     */
    initHistoryForImageResizer(imageContainer: ImageElementBox): void;
    /**
     * Updates histroy for image resizer.
     *
     * @private
     * @returns {void}
     */
    updateHistoryForImageResizer(): void;
    /**
     * Updates image resize container when applying zooming
     *
     * @private
     * @returns {void}
     */
    updateImageResizerPosition(): void;
    /**
     * Dispose the internal objects which are maintained.
     *
     * @private
     * @returns {void}
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ImageResizingPoints {
    /**
     * @private
     */ resizeContainerDiv: Point;
    /**
     * @private
     */
    topLeftRectParent: Point;
    /**
     * @private
     */
    topMiddleRectParent: Point;
    /**
     * @private
     */
    topRightRectParent: Point;
    /**
     * @private
     */
    bottomLeftRectParent: Point;
    /**
     * @private
     */
    bottomMiddleRectParent: Point;
    /**
     * @private
     */
    bottomRightRectParent: Point;
    /**
     * @private
     */
    leftMiddleRectParent: Point;
    /**
     * @private
     */
    rightMiddleRectParent: Point;
}
/**
 * @private
 */
export declare class SelectedImageInfo {
    private heightIn;
    private widthIn;
    height: number;
    width: number;
    /**
     * Constructor for selected image info class.
     * @param {number} height - Specifies for height value.
     * @param {number} width - Specifies for width value.
     */
    constructor(height: number, width: number);
}
/**
 * @private
 */
export interface LeftTopInfo {
    left: number;
    top: number;
}
