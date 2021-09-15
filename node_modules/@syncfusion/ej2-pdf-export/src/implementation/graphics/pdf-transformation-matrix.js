/**
 * PdfTransformationMatrix.ts class for EJ2-PDF
 */
import { PointF } from './../drawing/pdf-drawing';
import { PdfNumber } from './../primitives/pdf-number';
/**
 * Class for representing Root `transformation matrix`.
 */
var PdfTransformationMatrix = /** @class */ (function () {
    function PdfTransformationMatrix(value) {
        /**
         * Value for `angle converting`.
         * @default 180.0 / Math.PI
         * @private
         */
        this.radDegFactor = 180.0 / Math.PI;
        if (typeof value === 'undefined') {
            this.transformationMatrix = new Matrix(1.00, 0.00, 0.00, 1.00, 0.00, 0.00);
        }
        else {
            this.transformationMatrix = new Matrix(1.00, 0.00, 0.00, -1.00, 0.00, 0.00);
        }
    }
    Object.defineProperty(PdfTransformationMatrix.prototype, "matrix", {
        // Properties
        /**
         * Gets or sets the `internal matrix object`.
         * @private
         */
        get: function () {
            return this.transformationMatrix;
        },
        set: function (value) {
            this.transformationMatrix = value;
        },
        enumerable: true,
        configurable: true
    });
    // Public methods
    /**
     * `Translates` coordinates by specified coordinates.
     * @private
     */
    PdfTransformationMatrix.prototype.translate = function (offsetX, offsetY) {
        this.transformationMatrix.translate(offsetX, offsetY);
    };
    /**
     * `Scales` coordinates by specified coordinates.
     * @private
     */
    PdfTransformationMatrix.prototype.scale = function (scaleX, scaleY) {
        this.transformationMatrix.elements[0] = scaleX;
        this.transformationMatrix.elements[3] = scaleY;
    };
    /**
     * `Rotates` coordinate system in counterclockwise direction.
     * @private
     */
    PdfTransformationMatrix.prototype.rotate = function (angle) {
        //Convert from degree to radian 
        angle = (angle * Math.PI) / 180;
        //Rotation 
        this.transformationMatrix.elements[0] = Math.cos(angle);
        this.transformationMatrix.elements[1] = Math.sin(angle);
        this.transformationMatrix.elements[2] = -Math.sin(angle);
        this.transformationMatrix.elements[3] = Math.cos(angle);
    };
    // Overrides
    /**
     * Gets `PDF representation`.
     * @private
     */
    PdfTransformationMatrix.prototype.toString = function () {
        var builder = '';
        var whitespace = ' ';
        for (var i = 0, len = this.transformationMatrix.elements.length; i < len; i++) {
            var temp = this.matrix.elements[i];
            builder += PdfNumber.floatToString(this.transformationMatrix.elements[i]);
            builder += whitespace;
        }
        return builder;
    };
    // Implementation
    /**
     * `Multiplies` matrices (changes coordinate system.)
     * @private
     */
    PdfTransformationMatrix.prototype.multiply = function (matrix) {
        this.transformationMatrix.multiply(matrix.matrix);
    };
    /**
     * Converts `degrees to radians`.
     * @private
     */
    PdfTransformationMatrix.degreesToRadians = function (degreesX) {
        return this.degRadFactor * degreesX;
    };
    /**
     * Converts `radians to degrees`.
     * @private
     */
    PdfTransformationMatrix.prototype.radiansToDegrees = function (radians) {
        return this.radDegFactor * radians;
    };
    /**
     * `Clones` this instance of PdfTransformationMatrix.
     * @private
     */
    PdfTransformationMatrix.prototype.clone = function () {
        return this;
    };
    // Constants
    /**
     * Value for `angle converting`.
     * @default Math.PI / 180.0
     * @private
     */
    PdfTransformationMatrix.degRadFactor = Math.PI / 180.0;
    return PdfTransformationMatrix;
}());
export { PdfTransformationMatrix };
var Matrix = /** @class */ (function () {
    function Matrix(arg1, arg2, arg3, arg4, arg5, arg6) {
        if (typeof arg1 === 'undefined') {
            this.metrixElements = [];
        }
        else if (typeof arg1 === 'number') {
            this.metrixElements = [];
            this.metrixElements.push(arg1);
            this.metrixElements.push(arg2);
            this.metrixElements.push(arg3);
            this.metrixElements.push(arg4);
            this.metrixElements.push(arg5);
            this.metrixElements.push(arg6);
        }
        else {
            this.metrixElements = arg1;
        }
    }
    Object.defineProperty(Matrix.prototype, "elements", {
        // Properties
        /**
         * Gets the `elements`.
         * @private
         */
        get: function () {
            return this.metrixElements;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "offsetX", {
        /**
         * Gets the off set `X`.
         * @private
         */
        get: function () {
            return this.metrixElements[4];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "offsetY", {
        /**
         * Gets the off set `Y`.
         * @private
         */
        get: function () {
            return this.metrixElements[5];
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * `Translates` coordinates by specified coordinates.
     * @private
     */
    Matrix.prototype.translate = function (offsetX, offsetY) {
        this.metrixElements[4] = offsetX;
        this.metrixElements[5] = offsetY;
    };
    /**
     * `Translates` the specified offset X.
     * @private
     */
    Matrix.prototype.transform = function (point) {
        var x = point.x;
        var y = point.y;
        var x2 = x * this.elements[0] + y * this.elements[2] + this.offsetX;
        var y2 = x * this.elements[1] + y * this.elements[3] + this.offsetY;
        return new PointF(x2, y2);
    };
    /**
     * `Multiplies matrices` (changes coordinate system.)
     * @private
     */
    Matrix.prototype.multiply = function (matrix) {
        var tempMatrix = [];
        tempMatrix.push(this.elements[0] * matrix.elements[0] + this.elements[1] * matrix.elements[2]);
        tempMatrix[1] = (this.elements[0] * matrix.elements[1] + this.elements[1] * matrix.elements[3]);
        tempMatrix[2] = (this.elements[2] * matrix.elements[0] + this.elements[3] * matrix.elements[2]);
        tempMatrix[3] = (this.elements[2] * matrix.elements[1] + this.elements[3] * matrix.elements[3]);
        tempMatrix[4] = (this.offsetX * matrix.elements[0] + this.offsetY * matrix.elements[2] + matrix.offsetX);
        tempMatrix[5] = (this.offsetX * matrix.elements[1] + this.offsetY * matrix.elements[3] + matrix.offsetY);
        for (var i = 0; i < tempMatrix.length; i++) {
            this.elements[i] = tempMatrix[i];
        }
    };
    // IDisposable Members
    /**
     * `Dispose` this instance of PdfTransformationMatrix class.
     * @private
     */
    Matrix.prototype.dispose = function () {
        this.metrixElements = null;
    };
    // ICloneable Members
    /**
     * `Clones` this instance of PdfTransformationMatrix class.
     * @private
     */
    Matrix.prototype.clone = function () {
        var m = new Matrix(this.metrixElements);
        return m;
    };
    return Matrix;
}());
export { Matrix };
