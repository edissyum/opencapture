/**
 * PdfGradientBrush.ts class for EJ2-PDF
 */
import { PdfStreamWriter } from './../../input-output/pdf-stream-writer';
import { GetResourceEventHandler } from './../pdf-graphics';
import { PdfColorSpace } from './../enum';
import { PdfColor } from './../pdf-color';
import { PdfBrush } from './pdf-brush';
import { IPdfWrapper } from '../../../interfaces/i-pdf-wrapper';
import { PdfDictionary } from '../../primitives/pdf-dictionary';
import { PdfTransformationMatrix } from './../pdf-transformation-matrix';
import { PdfArray } from './../../primitives/pdf-array';
import { IPdfPrimitive } from './../../../interfaces/i-pdf-primitives';
import { PdfFunction } from './../../general/functions/pdf-function';
/**
 * `PdfGradientBrush` class provides objects used to fill the interiors of graphical shapes such as rectangles,
 * ellipses, pies, polygons, and paths.
 * @private
 */
export declare abstract class PdfGradientBrush extends PdfBrush implements IPdfWrapper {
    /**
     * Local variable to store the background color.
     * @private
     */
    private mbackground;
    /**
     * Local variable to store the stroking color.
     * @private
     */
    private mbStroking;
    /**
     * Local variable to store the dictionary.
     * @private
     */
    private mpatternDictionary;
    /**
     * Local variable to store the shading.
     * @private
     */
    private mshading;
    /**
     * Local variable to store the Transformation Matrix.
     * @private
     */
    private mmatrix;
    /**
     * Local variable to store the colorSpace.
     * @private
     */
    private mcolorSpace;
    /**
     * Local variable to store the function.
     * @private
     */
    private mfunction;
    /**
     * Local variable to store the DictionaryProperties.
     * @private
     */
    private dictionaryProperties;
    /**
     * Initializes a new instance of the `PdfGradientBrush` class.
     * @public
     */
    constructor(shading: PdfDictionary);
    /**
     * Gets or sets the background color of the brush.
     * @public
     */
    background: PdfColor;
    /**
     * Gets or sets a value indicating whether use anti aliasing algorithm.
     * @public
     */
    antiAlias: boolean;
    /**
     * Gets or sets the function of the brush.
     * @protected
     */
    protected function: PdfFunction;
    /**
     * Gets or sets the boundary box of the brush.
     * @protected
     */
    protected bBox: PdfArray;
    /**
     * Gets or sets the color space of the brush.
     * @public
     */
    colorSpace: PdfColorSpace;
    /**
     * Gets or sets a value indicating whether this PdfGradientBrush is stroking.
     * @public
     */
    stroking: boolean;
    /**
     * Gets the pattern dictionary.
     * @protected
     */
    protected readonly patternDictionary: PdfDictionary;
    /**
     * Gets or sets the shading dictionary.
     * @protected
     */
    protected shading: PdfDictionary;
    /**
     * Gets or sets the transformation matrix.
     * @public
     */
    matrix: PdfTransformationMatrix;
    /**
     * Monitors the changes of the brush and modify PDF state respectfully.
     * @param brush The brush.
     * @param streamWriter The stream writer.
     * @param getResources The get resources delegate.
     * @param saveChanges if set to true the changes should be saved anyway.
     * @param currentColorSpace The current color space.
     */
    monitorChanges(brush: PdfBrush, streamWriter: PdfStreamWriter, getResources: GetResourceEventHandler, saveChanges: boolean, currentColorSpace: PdfColorSpace): boolean;
    /**
     * Resets the changes, which were made by the brush.
     * In other words resets the state to the initial one.
     * @param streamWriter The stream writer.
     */
    resetChanges(streamWriter: PdfStreamWriter): void;
    /**
     * Converts colorspace enum to a PDF name.
     * @param colorSpace The color space enum value.
     */
    private colorSpaceToDeviceName;
    /**
     * Resets the pattern dictionary.
     * @param dictionary A new pattern dictionary.
     */
    protected resetPatternDictionary(dictionary: PdfDictionary): void;
    /**
     * Resets the function.
     */
    abstract resetFunction(): void;
    /**
     * Clones the anti aliasing value.
     * @param brush The brush.
     */
    protected cloneAntiAliasingValue(brush: PdfGradientBrush): void;
    /**
     * Clones the background value.
     * @param brush The brush.
     */
    protected cloneBackgroundValue(brush: PdfGradientBrush): void;
    /**
     * Gets the `element`.
     * @private
     */
    readonly element: IPdfPrimitive;
}
