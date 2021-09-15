import { PdfQRBarcodeValues } from './qr-barcode-values';
/**
 * Qrcode used to calculate the Qrcode control
 */
var ErrorCorrectionCodewords = /** @class */ (function () {
    /**
     * Initializes Error correction code word
     *
     * @param {QRCodeVersion} version - version of the qr code
     * @param {ErrorCorrectionLevel} correctionLevel - defines the level of error correction.
     */
    function ErrorCorrectionCodewords(version, correctionLevel) {
        /**
         * Holds all the values of Alpha
         */
        this.alpha = [1, 2, 4, 8, 16, 32, 64, 128, 29, 58, 116, 232, 205, 135, 19, 38, 76, 152, 45, 90, 180, 117, 234, 201, 143,
            3, 6, 12, 24, 48, 96, 192, 157, 39, 78, 156, 37, 74, 148, 53, 106, 212, 181, 119, 238, 193, 159, 35, 70, 140, 5, 10, 20, 40, 80,
            160, 93, 186, 105, 210, 185, 111, 222, 161, 95, 190, 97, 194, 153, 47, 94, 188, 101, 202, 137, 15, 30, 60, 120, 240, 253, 231,
            211, 187, 107, 214, 177, 127, 254, 225, 223, 163, 91, 182, 113, 226, 217, 175, 67, 134, 17, 34, 68, 136, 13, 26, 52, 104, 208,
            189, 103, 206, 129, 31, 62, 124, 248, 237, 199, 147, 59, 118, 236, 197, 151, 51, 102, 204, 133, 23, 46, 92, 184, 109, 218, 169,
            79, 158, 33, 66, 132, 21, 42, 84, 168, 77, 154, 41, 82, 164, 85, 170, 73, 146, 57, 114, 228, 213, 183, 115, 230, 209, 191, 99,
            198, 145, 63, 126, 252, 229, 215, 179, 123, 246, 241, 255, 227, 219, 171, 75, 150, 49, 98, 196, 149, 55, 110, 220, 165, 87,
            174, 65, 130, 25, 50, 100, 200, 141, 7, 14, 28, 56, 112, 224, 221, 167, 83, 166, 81, 162, 89, 178, 121, 242, 249, 239, 195,
            155, 43, 86, 172, 69, 138, 9, 18, 36, 72, 144, 61, 122, 244, 245, 247, 243, 251, 235, 203, 139, 11, 22, 44, 88, 176, 125,
            250, 233, 207, 131, 27, 54, 108, 216, 173, 71, 142];
        this.mQrBarcodeValues = new PdfQRBarcodeValues(version, correctionLevel);
        var variable = 'DataCapacity';
        this.mLength = this.mQrBarcodeValues[variable];
        variable = 'NumberOfErrorCorrectingCodeWords';
        this.eccw = this.mQrBarcodeValues[variable];
    }
    Object.defineProperty(ErrorCorrectionCodewords.prototype, "DC", {
        /**
         * Sets and Gets the Data code word
         *
         * @param {string} value - Sets and Gets the Data code word
         * @private
         */
        set: function (value) {
            this.mDataCodeWord = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ErrorCorrectionCodewords.prototype, "DataBits", {
        /**
         * Sets and Gets the DataBits
         *
         * @param {string} value - Sets and Gets the DataBits
         * @private
         */
        set: function (value) {
            this.databits = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ErrorCorrectionCodewords.prototype, "Eccw", {
        /**
         * Sets and Gets the Error Correction Code Words
         *
         * @param {string} value - Sets and Gets the Error Correction Code Words
         * @private
         */
        set: function (value) {
            this.eccw = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     *  Gets the Error correction code word
     *
     * @returns { number} Gets the Error correction code word
     * @private
     */
    ErrorCorrectionCodewords.prototype.getErcw = function () {
        //const decimalRepresentation: number[];
        //let ecw: string[];
        this.decimalValue = [this.databits];
        switch (this.eccw) {
            case 7:
                this.gx = [0, 87, 229, 146, 149, 238, 102, 21];
                break;
            case 10:
                this.gx = [0, 251, 67, 46, 61, 118, 70, 64, 94, 32, 45];
                break;
            case 13:
                this.gx = [0, 74, 152, 176, 100, 86, 100, 106, 104, 130, 218, 206, 140, 78];
                break;
            case 15:
                this.gx = [0, 8, 183, 61, 91, 202, 37, 51, 58, 58, 237, 140, 124, 5, 99, 105];
                break;
            case 16:
                this.gx = [0, 120, 104, 107, 109, 102, 161, 76, 3, 91, 191, 147, 169, 182, 194, 225, 120];
                break;
            case 17:
                this.gx = [0, 43, 139, 206, 78, 43, 239, 123, 206, 214, 147, 24, 99, 150, 39, 243, 163, 136];
                break;
            case 18:
                this.gx = [0, 215, 234, 158, 94, 184, 97, 118, 170, 79, 187, 152, 148, 252, 179, 5, 98, 96, 153];
                break;
            case 20:
                this.gx = [0, 17, 60, 79, 50, 61, 163, 26, 187, 202, 180, 221, 225, 83, 239, 156, 164, 212, 212, 188, 190];
                break;
            case 22:
                this.gx = [0, 210, 171, 247, 242, 93, 230, 14, 109, 221, 53, 200, 74, 8, 172, 98, 80, 219, 134, 160, 105, 165, 231];
                break;
            case 24:
                this.gx = [0, 229, 121, 135, 48, 211, 117, 251, 126, 159, 180, 169, 152, 192, 226, 228, 218, 111, 0, 117, 232, 87,
                    96, 227, 21];
                break;
            case 26:
                this.gx = [0, 173, 125, 158, 2, 103, 182, 118, 17, 145, 201, 111, 28, 165, 53, 161, 21, 245, 142, 13, 102, 48, 227, 153,
                    145, 218, 70];
                break;
            case 28:
                this.gx = [0, 168, 223, 200, 104, 224, 234, 108, 180, 110, 190, 195, 147, 205, 27, 232, 201, 21, 43, 245, 87, 42, 195,
                    212, 119, 242, 37, 9, 123];
                break;
            case 30:
                this.gx = [0, 41, 173, 145, 152, 216, 31, 179, 182, 50, 48, 110, 86, 239, 96, 222, 125, 42, 173, 226, 193, 224, 130,
                    156, 37, 251, 216, 238, 40, 192, 180];
                break;
        }
        this.gx = this.getElement(this.gx, this.alpha);
        this.toDecimal(this.mDataCodeWord);
        var decimalRepresentation = this.divide();
        var ecw = this.toBinary(decimalRepresentation);
        return ecw;
    };
    /* tslint:enable */
    /**
     * Convert to decimal
     *
     * @returns {void}Convert to decimal.
     * @param {string[]} inString - Provide the version for the QR code
     * @private
     */
    ErrorCorrectionCodewords.prototype.toDecimal = function (inString) {
        for (var i = 0; i < inString.length; i++) {
            this.decimalValue[i] = parseInt(inString[i], 2);
        }
    };
    /**
     * Convert decimal to binary.
     *
     * @returns {string[]}Convert decimal to binary.
     * @param {number[]} decimalRepresentation - Provide the version for the QR code
     * @private
     */
    ErrorCorrectionCodewords.prototype.toBinary = function (decimalRepresentation) {
        var toBinary = [];
        for (var i = 0; i < this.eccw; i++) {
            var str = '';
            var temp = decimalRepresentation[i].toString(2);
            if (temp.length < 8) {
                for (var j = 0; j < 8 - temp.length; j++) {
                    str += '0';
                }
            }
            toBinary[i] = str + temp;
        }
        return toBinary;
    };
    /**
     * Polynomial division.
     *
     * @returns {string[]}Polynomial division.
     * @private
     */
    ErrorCorrectionCodewords.prototype.divide = function () {
        var messagePolynom = {};
        for (var i = 0; i < this.decimalValue.length; i++) {
            messagePolynom[this.decimalValue.length - 1 - i] = this.decimalValue[i];
        }
        var generatorPolynom = {};
        for (var i = 0; i < this.gx.length; i++) {
            generatorPolynom[this.gx.length - 1 - i] = this.findElement(this.gx[i], this.alpha);
        }
        var tempMessagePolynom = {};
        for (var _i = 0, _a = Object.keys(messagePolynom); _i < _a.length; _i++) {
            var poly = _a[_i];
            tempMessagePolynom[Number(poly) + this.eccw] = messagePolynom[poly];
        }
        messagePolynom = tempMessagePolynom;
        var genLeadtermFactor = this.decimalValue.length + this.eccw - this.gx.length;
        tempMessagePolynom = {};
        for (var _b = 0, _c = Object.keys(generatorPolynom); _b < _c.length; _b++) {
            var poly = _c[_b];
            tempMessagePolynom[Number(poly) + genLeadtermFactor] = generatorPolynom[poly];
        }
        generatorPolynom = tempMessagePolynom;
        var leadTermSource = messagePolynom;
        for (var i = 0; i < Object.keys(messagePolynom).length; i++) {
            var largestExponent = this.findLargestExponent(leadTermSource);
            if (leadTermSource[largestExponent] === 0) {
                // First coefficient is already 0, simply remove it and continue
                delete leadTermSource[largestExponent];
            }
            else {
                var alphaNotation = this.convertToAlphaNotation(leadTermSource);
                var resPoly = this.multiplyGeneratorPolynomByLeadterm(generatorPolynom, alphaNotation[this.findLargestExponent(alphaNotation)], i);
                resPoly = this.convertToDecNotation(resPoly);
                resPoly = this.xORPolynoms(leadTermSource, resPoly);
                leadTermSource = resPoly;
            }
        }
        //Add the error correction word count according to polynomial values.
        this.eccw = Object.keys(leadTermSource).length;
        var returnValue = [];
        for (var _d = 0, _e = Object.keys(leadTermSource); _d < _e.length; _d++) {
            var temp = _e[_d];
            returnValue.push(leadTermSource[temp]);
        }
        return returnValue.reverse();
    };
    ErrorCorrectionCodewords.prototype.xORPolynoms = function (messagePolynom, resPolynom) {
        var resultPolynom = {};
        var longPoly = {};
        var shortPoly = {};
        if (Object.keys(messagePolynom).length >= Object.keys(resPolynom).length) {
            longPoly = messagePolynom;
            shortPoly = resPolynom;
        }
        else {
            longPoly = resPolynom;
            shortPoly = messagePolynom;
        }
        var messagePolyExponent = this.findLargestExponent(messagePolynom);
        var shortPolyExponent = this.findLargestExponent(shortPoly);
        var i = Object.keys(longPoly).length - 1;
        for (var _i = 0, _a = Object.keys(longPoly); _i < _a.length; _i++) {
            var longPolySingle = _a[_i];
            resultPolynom[messagePolyExponent - i] = longPoly[longPolySingle] ^ (Object.keys(shortPoly).length > i ?
                shortPoly[shortPolyExponent - i] : 0);
            i--;
        }
        var resultPolyExponent = this.findLargestExponent(resultPolynom);
        delete resultPolynom[resultPolyExponent];
        return resultPolynom;
    };
    ErrorCorrectionCodewords.prototype.multiplyGeneratorPolynomByLeadterm = function (genPolynom, leadTermCoefficient, lowerExponentBy) {
        var tempPolynom = {};
        for (var _i = 0, _a = Object.keys(genPolynom); _i < _a.length; _i++) {
            var treeNode = _a[_i];
            tempPolynom[Number(treeNode) - lowerExponentBy] = (genPolynom[treeNode] + leadTermCoefficient) % 255;
        }
        return tempPolynom;
    };
    ErrorCorrectionCodewords.prototype.convertToDecNotation = function (poly) {
        var tempPolynom = {};
        for (var _i = 0, _a = Object.keys(poly); _i < _a.length; _i++) {
            var treeNode = _a[_i];
            tempPolynom[treeNode] = this.getIntValFromAlphaExp(poly[treeNode], this.alpha);
        }
        return tempPolynom;
    };
    ErrorCorrectionCodewords.prototype.convertToAlphaNotation = function (polynom) {
        var tempPolynom = {};
        for (var _i = 0, _a = Object.keys(polynom); _i < _a.length; _i++) {
            var poly = _a[_i];
            if (polynom[poly] !== 0) {
                tempPolynom[poly] = this.findElement(polynom[poly], this.alpha);
            }
        }
        return tempPolynom;
    };
    ErrorCorrectionCodewords.prototype.findLargestExponent = function (polynom) {
        var largCo = 0;
        for (var _i = 0, _a = Object.keys(polynom); _i < _a.length; _i++) {
            var poly = _a[_i];
            if (Number(poly) > largCo) {
                largCo = Number(poly);
            }
        }
        return largCo;
    };
    ErrorCorrectionCodewords.prototype.getIntValFromAlphaExp = function (element, alpha) {
        if (element > 255) {
            element = element - 255;
        }
        return alpha[element];
    };
    /**
     * Find the element in the alpha
     *
     * @returns {number}Find the element in the alpha.
     * @param {QRCodeVersion} element - Provide the element for the Qr code
     * @param {ErrorCorrectionLevel} alpha -provide the number
     * @private
     */
    ErrorCorrectionCodewords.prototype.findElement = function (element, alpha) {
        var j;
        for (j = 0; j < alpha.length; j++) {
            if (element === alpha[j]) {
                break;
            }
        }
        return j;
    };
    /**
     * Gets g(x) of the element
     */
    /**
     * Gets g(x) of the element
     *
     * @returns {number}Gets g(x) of the element .
     * @param {QRCodeVersion} element - Provide the element for the Qr code
     * @param {ErrorCorrectionLevel} alpha -provide the number
     * @private
     */
    ErrorCorrectionCodewords.prototype.getElement = function (element, alpha) {
        var gx = [element.length];
        for (var i = 0; i < element.length; i++) {
            if (element[i] > 255) {
                element[i] = element[i] - 255;
            }
            gx[i] = alpha[element[i]];
        }
        return gx;
    };
    return ErrorCorrectionCodewords;
}());
export { ErrorCorrectionCodewords };
