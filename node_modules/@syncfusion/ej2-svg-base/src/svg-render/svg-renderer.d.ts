import { LineAttributes, PathAttributes, CircleAttributes, SVGAttributes, EllipseAttributes, PolylineAttributes, BaseAttibutes, TextAttributes, ImageAttributes, SVGCanvasAttributes, PatternAttributes, LinearGradient, RadialGradient, RectAttributes, GradientColor } from './svg-canvas-interface';
export declare class SvgRenderer {
    private svgLink;
    private svgObj;
    private rootId;
    /**
     * Specifies the height of the canvas element.
     *
     * @default null
     */
    height: number;
    /**
     * Specifies the width of the canvas element.
     *
     * @default null
     */
    width: number;
    constructor(rootID: string);
    private getOptionValue;
    /**
     * To create a Html5 SVG element
     *
     * @param {SVGAttributes} options - Options to create SVG
     * @returns {Element} It returns a appropriate element
     */
    createSvg(options: SVGAttributes): Element;
    private setSVGSize;
    /**
     * To draw a path
     *
     * @param {PathAttributes} options - Options to draw a path in SVG
     * @returns {Element} It returns a appropriate path
     */
    drawPath(options: PathAttributes): Element;
    /**
     * To draw a line
     *
     * @param {LineAttributes} options - Options to draw a line in SVG
     * @returns {Element} It returns a appropriate element
     */
    drawLine(options: LineAttributes): Element;
    /**
     * To draw a rectangle
     *
     * @param {BaseAttibutes} options - Required options to draw a rectangle in SVG
     * @returns {Element} It returns a appropriate element
     */
    drawRectangle(options: RectAttributes): Element;
    /**
     * To draw a circle
     *
     * @param {CircleAttributes} options - Required options to draw a circle in SVG
     * @returns {Element} It returns a appropriate element
     */
    drawCircle(options: CircleAttributes): Element;
    /**
     * To draw a polyline
     *
     * @param {PolylineAttributes} options - Options required to draw a polyline
     * @returns {Element} It returns a appropriate element
     */
    drawPolyline(options: PolylineAttributes): Element;
    /**
     * To draw an ellipse
     *
     * @param {EllipseAttributes} options - Options required to draw an ellipse
     * @returns {Element} It returns a appropriate element
     */
    drawEllipse(options: EllipseAttributes): Element;
    /**
     * To draw a polygon
     *
     * @param {PolylineAttributes} options - Options needed to draw a polygon in SVG
     * @returns {Element} It returns a appropriate element
     */
    drawPolygon(options: PolylineAttributes): Element;
    /**
     * To draw an image
     *
     * @param {ImageAttributes} options - Required options to draw an image in SVG
     * @returns {Element} It returns a appropriate element
     */
    drawImage(options: ImageAttributes): Element;
    /**
     * To draw a text
     *
     * @param {TextAttributes} options - Options needed to draw a text in SVG
     * @param {string} label - Label of the text
     * @returns {Element} It returns a appropriate element
     */
    createText(options: TextAttributes, label: string): Element;
    /**
     * To create a tSpan
     *
     * @param {TextAttributes} options - Options to create tSpan
     * @param {string} label - The text content which is to be rendered in the tSpan
     * @returns {Element} It returns a appropriate element
     */
    createTSpan(options: TextAttributes, label: string): Element;
    /**
     * To create a title
     *
     * @param {string} text - The text content which is to be rendered in the title
     * @returns {Element} It returns a appropriate element
     */
    createTitle(text: string): Element;
    /**
     * To create defs element in SVG
     *
     * @returns {Element} It returns a appropriate element
     */
    createDefs(): Element;
    /**
     * To create clip path in SVG
     *
     * @param {BaseAttibutes} options - Options needed to create clip path
     * @returns {Element} It returns a appropriate element
     */
    createClipPath(options: BaseAttibutes): Element;
    /**
     * To create foreign object in SVG
     *
     * @param {BaseAttibutes} options - Options needed to create foreign object
     * @returns {Element} It returns a appropriate element
     */
    createForeignObject(options: BaseAttibutes): Element;
    /**
     * To create group element in SVG
     *
     * @param {BaseAttibutes} options - Options needed to create group
     * @returns {Element} It returns a appropriate element
     */
    createGroup(options: BaseAttibutes): Element;
    /**
     * To create pattern in SVG
     *
     * @param {PatternAttributes} options - Required options to create pattern in SVG
     * @param {string} element - Specifies the name of the pattern
     * @returns {Element} It returns a appropriate element
     */
    createPattern(options: PatternAttributes, element: string): Element;
    /**
     * To create radial gradient in SVG
     *
     * @param {string[]} colors - Specifies the colors required to create radial gradient
     * @param {string} name - Specifies the name of the gradient
     * @param {RadialGradient} options - value for radial gradient
     * @returns {string} It returns color name
     */
    createRadialGradient(colors: GradientColor[], name: string, options: RadialGradient): string;
    /**
     * To create linear gradient in SVG
     *
     * @param {GradientColor[]} colors - Array of string specifies the values for color
     * @param {string} name - Specifies the name of the gradient
     * @param {LinearGradient} options - Specifies the options for gradient
     * @returns {string} It returns color name
     */
    createLinearGradient(colors: GradientColor[], name: string, options: LinearGradient): string;
    /**
     * To render the gradient element in SVG
     *
     * @param {string} gradientType - Specifies the type of the gradient
     * @param {RadialGradient | LinearGradient} options - Options required to render a gradient
     * @param {string[]} colors - Array of string specifies the values for color
     * @returns {Element} It returns a appropriate element
     */
    drawGradient(gradientType: string, options: RadialGradient | LinearGradient, colors: GradientColor[]): Element;
    /**
     * To render a clip path
     *
     * @param {BaseAttibutes} options - Options required to render a clip path
     * @returns {Element} It returns a appropriate element
     */
    drawClipPath(options: BaseAttibutes): Element;
    /**
     * To create circular clip path in SVG
     *
     * @param {CircleAttributes} options - Options required to create circular clip path
     * @returns {Element} It returns a appropriate element
     */
    drawCircularClipPath(options: CircleAttributes): Element;
    /**
     * To set the attributes to the element
     *
     * @param {SVGCanvasAttributes} options - Attributes to set for the element
     * @param {Element} element - The element to which the attributes need to be set
     * @returns {Element} It returns a appropriate element
     */
    setElementAttributes(options: SVGCanvasAttributes, element: Element | HTMLElement): Element | HTMLElement;
    /**
     * To create a Html5 canvas element
     * Dummy method for using canvas/svg render in the same variable name in chart control
     */
    createCanvas(): HTMLCanvasElement;
}
