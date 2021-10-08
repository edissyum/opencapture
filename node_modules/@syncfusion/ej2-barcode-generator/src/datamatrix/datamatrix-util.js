import { QuietZone, DataMatrixSize } from '../barcode/enum/enum';
import { BarcodeRenderer } from '../barcode/rendering/renderer';
import { createMeasureElements, measureText } from '../barcode/utility/dom-util';
import { getBaseAttributes } from '../barcode/utility/barcode-util';
/**
 * DataMatrix used to calculate the DataMatrix barcode
 */
var DataMatrix = /** @class */ (function () {
    function DataMatrix() {
        this.mXDimension = 1;
        this.mDataMatrixArray = [];
    }
    Object.defineProperty(DataMatrix.prototype, "XDimension", {
        // eslint-disable-next-line
        /** @private */
        set: function (value) {
            this.mXDimension = value;
        },
        enumerable: true,
        configurable: true
    });
    DataMatrix.prototype.GetData = function () {
        var givenString = this.value;
        var asciiValue = [];
        for (var i = 0; i < givenString.length; i++) {
            asciiValue.push(givenString.charCodeAt(i));
        }
        return asciiValue;
    };
    DataMatrix.prototype.fillZero = function (destinationArray) {
        for (var i = 0; i < destinationArray.length; i++) {
            destinationArray[i] = 0;
        }
        return destinationArray;
    };
    DataMatrix.prototype.DataMatrixNumericEncoder = function (dataCodeword) {
        var destinationArray = dataCodeword;
        var isEven = true;
        if ((destinationArray.length % 2) === 1) {
            isEven = false;
            destinationArray = Array(dataCodeword.length + 1);
            destinationArray = this.fillZero(destinationArray);
            destinationArray = this.copy(dataCodeword, 0, destinationArray, 0, dataCodeword.length);
        }
        var result = Array(destinationArray.length / 2);
        result = this.fillZero(result);
        for (var i = 0; i < result.length; i++) {
            if (!isEven && i === result.length - 1) {
                result[i] = (destinationArray[2 * i] + 1);
            }
            else {
                result[i] = ((((destinationArray[2 * i] - 48) * 10) + (destinationArray[(2 * i) + 1] - 48)) + 130);
            }
        }
        return result;
    };
    DataMatrix.prototype.ComputeBase256Codeword = function (val, index) {
        var num = ((149 * (index + 1)) % 255) + 1;
        var num2 = val + num;
        if (num2 <= 255) {
            return num2;
        }
        return (num2 - 256);
    };
    DataMatrix.prototype.DataMatrixBaseEncoder = function (dataCodeword) {
        var num = 1;
        if (dataCodeword.length > 249) {
            num++;
        }
        var result = Array((1 + num) + dataCodeword.length);
        result = this.fillZero(result);
        result[0] = 231;
        if (dataCodeword.length <= 249) {
            result[1] = dataCodeword.length;
        }
        else {
            result[1] = ((dataCodeword.length / 250) + 249);
            result[2] = (dataCodeword.length % 250);
        }
        result = this.copy(dataCodeword, 0, result, 1 + num, dataCodeword.length);
        for (var i = 1; i < result.length; i++) {
            result[i] = this.ComputeBase256Codeword(result[i], i);
        }
        return result;
    };
    DataMatrix.prototype.copy = function (sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
        for (var i = 0; i < length; i++) {
            destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
        }
        return destinationArray;
    };
    DataMatrix.prototype.DataMatrixEncoder = function (dataCodeword) {
        var result = dataCodeword;
        var index = 0;
        for (var i = 0; i < dataCodeword.length; i++) {
            //checks the codeword is digit or not.
            if (dataCodeword[i] >= 48 && dataCodeword[i] <= 57) {
                var prevIndex = 0;
                if (i !== 0) {
                    prevIndex = index - 1;
                }
                var prevValue = (result[prevIndex] - 1);
                var priorValue = 0;
                if (i !== 0 && index !== 1) {
                    priorValue = result[prevIndex - 1];
                }
                //Check the prevValue is digit or non convertable value
                //if it is true ,then combine the 2 digits
                if (priorValue !== 235 && prevValue >= 48 && prevValue <= 57) {
                    result[prevIndex] = (10 * (prevValue - 0) + (dataCodeword[i] - 0) + 130);
                }
                else {
                    result[index++] = (dataCodeword[i] + 1);
                }
            }
            else if (dataCodeword[i] < 127) {
                result[index++] = (dataCodeword[i] + 1);
            }
            else {
                result[index] = 235;
                result[index++] = (((dataCodeword[i] - 127)));
            }
        }
        var encodedData = Array(index);
        encodedData = this.fillZero(encodedData);
        encodedData = result;
        return encodedData;
    };
    DataMatrix.prototype.PrepareDataCodeword = function (dataCodeword) {
        if (this.encodingValue === 'Auto' || this.encodingValue === 'ASCIINumeric') {
            var number = true;
            // eslint-disable-next-line
            var extended = false;
            // eslint-disable-next-line
            var num = 0;
            var data = dataCodeword;
            var encoding = 'ASCII';
            for (var i = 0; i < data.length; i++) {
                if ((data[i] < 48) || (data[i] > 57)) {
                    number = false;
                }
            }
            if (number) {
                encoding = 'ASCIINumeric';
            }
            if (this.encodingValue === 'ASCIINumeric' && this.encodingValue !== encoding) {
                return 'Data contains invalid characters and cannot be encoded as ASCIINumeric.';
            }
            this.encodingValue = encoding;
        }
        var result = [];
        switch (this.encodingValue) {
            case 'ASCII':
                result = this.DataMatrixEncoder(dataCodeword);
                break;
            case 'ASCIINumeric':
                result = this.DataMatrixNumericEncoder(dataCodeword);
                break;
            case 'Base256':
                result = this.DataMatrixBaseEncoder(dataCodeword);
                break;
        }
        return result;
    };
    DataMatrix.prototype.PdfDataMatrixSymbolAttribute = function (symbolRow, symbolColumn, horizontalDataRegion, verticalDataRegion, dataCodewords, correctionCodewords, interleavedBlock, interleavedDataBlock) {
        var mSymbolAttribute = {
            SymbolRow: symbolRow,
            SymbolColumn: symbolColumn,
            HorizontalDataRegion: horizontalDataRegion,
            VerticalDataRegion: verticalDataRegion,
            DataCodewords: dataCodewords,
            CorrectionCodewords: correctionCodewords,
            InterleavedBlock: interleavedBlock,
            InterleavedDataBlock: interleavedDataBlock
        };
        return mSymbolAttribute;
    };
    DataMatrix.prototype.getmSymbolAttributes = function () {
        var getmSymbolAttributeValue = [];
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(10, 10, 1, 1, 3, 5, 1, 3));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(12, 12, 1, 1, 5, 7, 1, 5));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(14, 14, 1, 1, 8, 10, 1, 8));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(16, 16, 1, 1, 12, 12, 1, 12));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(18, 18, 1, 1, 18, 14, 1, 18));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(20, 20, 1, 1, 22, 18, 1, 22));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(22, 22, 1, 1, 30, 20, 1, 30));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(24, 24, 1, 1, 36, 24, 1, 36));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(26, 26, 1, 1, 44, 28, 1, 44));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(32, 32, 2, 2, 62, 36, 1, 62));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(36, 36, 2, 2, 86, 42, 1, 86));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(40, 40, 2, 2, 114, 48, 1, 114));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(44, 44, 2, 2, 144, 56, 1, 144));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(48, 48, 2, 2, 174, 68, 1, 174));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(52, 52, 2, 2, 204, 84, 2, 102));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(64, 64, 4, 4, 280, 112, 2, 140));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(72, 72, 4, 4, 368, 144, 4, 92));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(80, 80, 4, 4, 456, 192, 4, 114));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(88, 88, 4, 4, 576, 224, 4, 144));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(96, 96, 4, 4, 696, 272, 4, 174));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(104, 104, 4, 4, 816, 336, 6, 136));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(120, 120, 6, 6, 1050, 408, 6, 175));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(132, 132, 6, 6, 1304, 496, 8, 163));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(144, 144, 6, 6, 1558, 620, 10, 156));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(8, 18, 1, 1, 5, 7, 1, 5));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(8, 32, 2, 1, 10, 11, 1, 10));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(12, 26, 1, 1, 16, 14, 1, 16));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(12, 36, 2, 1, 22, 18, 1, 22));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(16, 36, 2, 1, 32, 24, 1, 32));
        getmSymbolAttributeValue.push(this.PdfDataMatrixSymbolAttribute(16, 48, 2, 1, 49, 28, 1, 49));
        return getmSymbolAttributeValue;
    };
    DataMatrix.prototype.PadCodewords = function (dataCWLength, temp, codeword) {
        var l = temp.length;
        var ms = [];
        for (var i = 0; i < l; i++) {
            ms.push(temp[i]);
        }
        if (l < dataCWLength) {
            ms.push(129);
        }
        l = ms.length;
        while (l < dataCWLength) { // more padding
            var v = 129 + (((l + 1) * 149) % 253) + 1; // see Annex H
            if (v > 254) {
                v -= 254;
            }
            ms.push(v);
            l = ms.length;
        }
        codeword = Array(ms.length);
        codeword = ms;
        return codeword;
    };
    DataMatrix.prototype.EccProduct = function (a, b) {
        if (a === 0 || b === 0) {
            return 0;
        }
        var mLog = Array(256);
        mLog = this.CreateLogArrays(true);
        var mALog = Array(256);
        mALog = this.CreateLogArrays(false);
        return mALog[(mLog[a] + mLog[b]) % 255];
    };
    /**
     *  Validate the given input to check whether the input is valid one or not.\
     *
     * @returns {boolean | string}  Validate the given input to check whether the input is valid one or not .
     * @param {HTMLElement} char - Provide the canvas element .
     * @param {HTMLElement} characters - Provide the canvas element .
     * @private
     */
    // eslint-disable-next-line
    DataMatrix.prototype.validateInput = function (char, characters) {
        return char;
    };
    DataMatrix.prototype.ComputeErrorCorrection = function () {
        var dataLength = this.encodedCodeword.length;
        this.mSymbolAttribute = this.PdfDataMatrixSymbolAttribute(0, 0, 0, 0, 0, 0, 0, 0);
        var mSymbolAttributes = this.getmSymbolAttributes();
        if (!this.size) {
            mSymbolAttributes = this.getmSymbolAttributes();
            for (var i = 0; i < mSymbolAttributes.length; i++) {
                var attr = mSymbolAttributes[i];
                if (attr.DataCodewords >= dataLength) {
                    this.mSymbolAttribute = attr;
                    break;
                }
            }
        }
        else {
            this.mSymbolAttribute = mSymbolAttributes[this.size - 1];
        }
        var temp;
        if (this.mSymbolAttribute.DataCodewords > dataLength) {
            temp = this.PadCodewords(this.mSymbolAttribute.DataCodewords, this.encodedCodeword, temp);
            this.encodedCodeword = Array(temp.length);
            this.encodedCodeword = temp;
            dataLength = this.encodedCodeword.length;
        }
        else if (this.mSymbolAttribute.DataCodewords === 0) {
            return this.validateInput('Data cannot be encoded as barcode', undefined);
        }
        else if (this.mSymbolAttribute.DataCodewords < dataLength) {
            // eslint-disable-next-line
            var r = this.mSymbolAttribute.SymbolRow.toString();
            // eslint-disable-next-line
            var c = this.mSymbolAttribute.SymbolColumn.toString();
            return 'Data too long for {0}x{1} barcode.';
        }
        var k = this.mSymbolAttribute.CorrectionCodewords;
        var ctArray = [];
        ctArray = this.create1DMatrixArray(k + this.mSymbolAttribute.DataCodewords, ctArray);
        var step = this.mSymbolAttribute.InterleavedBlock;
        var symbolDataWords = this.mSymbolAttribute.DataCodewords;
        var blockErrorWords = this.mSymbolAttribute.CorrectionCodewords / step;
        var total = symbolDataWords + blockErrorWords * step;
        var mrsPolynomial = this.CreateRSPolynomial(step, this.mSymbolAttribute);
        var mBlockLength = 68;
        var b = [];
        b = this.create1DMatrixArray(mBlockLength, b);
        for (var block = 0; block < step; block++) {
            for (var bI = 0; bI < b.length; bI++) {
                b[bI] = 0;
            }
            for (var i = block; i < symbolDataWords; i += step) {
                var val = this.EccSum(b[blockErrorWords - 1], this.encodedCodeword[i]);
                for (var j = blockErrorWords - 1; j > 0; j--) {
                    b[j] = this.EccSum(b[j - 1], this.EccProduct(mrsPolynomial[j], val));
                }
                b[0] = this.EccProduct(mrsPolynomial[0], val);
            }
            var blockDataWords = 0;
            if (block >= 8 && this.size & DataMatrixSize.Size144x144) {
                blockDataWords = this.mSymbolAttribute.DataCodewords / step;
            }
            else {
                blockDataWords = this.mSymbolAttribute.InterleavedDataBlock;
                var bIndex = blockErrorWords;
                for (var i = block + (step * blockDataWords); i < total; i += step) {
                    ctArray[i] = b[--bIndex];
                }
                if (bIndex !== 0) {
                    return 'Error in error correction code generation!';
                }
            }
        }
        if (ctArray.length > k) {
            var tmp = ctArray;
            ctArray = [];
            ctArray = this.create1DMatrixArray(k, ctArray);
            var z = 0;
            for (var i = tmp.length - 1; i > this.mSymbolAttribute.DataCodewords; i--) {
                ctArray[z++] = tmp[i];
            }
        }
        return ctArray.reverse();
    };
    DataMatrix.prototype.CreateLogArrays = function (value) {
        var mLog = Array(256);
        var maLog = Array(256);
        mLog[0] = -255;
        maLog[0] = 1;
        for (var i = 1; i <= 255; i++) {
            maLog[i] = maLog[i - 1] * 2;
            if (maLog[i] >= 256) {
                maLog[i] = maLog[i] ^ 301;
            }
            mLog[maLog[i]] = i;
        }
        if (value) {
            return mLog;
        }
        else {
            return maLog;
        }
    };
    DataMatrix.prototype.EccSum = function (a, b) {
        return (a ^ b);
    };
    DataMatrix.prototype.EccDoublify = function (a, b) {
        if (a === 0) {
            return 0;
        }
        if (b === 0) {
            return a;
        }
        var mLog = Array(256);
        mLog = this.CreateLogArrays(true);
        var maLog = Array(256);
        maLog = this.CreateLogArrays(false);
        return maLog[(mLog[a] + b) % 255];
    };
    DataMatrix.prototype.CreateRSPolynomial = function (step, mSymbolAttribute) {
        var mBlockLength = 69;
        var mrsPolynomial = Array(mBlockLength);
        var blockErrorWords = mSymbolAttribute.CorrectionCodewords / step;
        for (var i = 0; i < mrsPolynomial.length; i++) {
            mrsPolynomial[i] = 0x01;
        }
        for (var i = 1; i <= blockErrorWords; i++) {
            for (var j = i - 1; j >= 0; j--) {
                mrsPolynomial[j] = this.EccDoublify(mrsPolynomial[j], i);
                if (j > 0) {
                    mrsPolynomial[j] = this.EccSum(mrsPolynomial[j], mrsPolynomial[j - 1]);
                }
            }
        }
        return mrsPolynomial;
    };
    DataMatrix.prototype.PrepareCodeword = function (dataCodeword) {
        this.encodedCodeword = this.PrepareDataCodeword(dataCodeword);
        if (isNaN(this.encodedCodeword[0])) {
            return this.encodedCodeword;
        }
        var correctCodeword = this.ComputeErrorCorrection();
        if ((isNaN(correctCodeword[0]))) {
            return correctCodeword;
        }
        this.encodedCodeword = this.encodedCodeword;
        var finalCodeword = Array(this.encodedCodeword.length + correctCodeword.length);
        this.copyArray(finalCodeword, 0, this.encodedCodeword);
        this.copyArray(finalCodeword, this.encodedCodeword.length, correctCodeword);
        return finalCodeword;
    };
    DataMatrix.prototype.copyArray = function (array, index, correctCodeword) {
        for (var i = 0; i < correctCodeword.length; i++) {
            array[index + i] = correctCodeword[i];
        }
    };
    DataMatrix.prototype.ecc200placementbit = function (array, NR, NC, r, c, p, b) {
        if (r < 0) {
            r += NR;
            c += 4 - ((NR + 4) % 8);
        }
        if (c < 0) {
            c += NC;
            r += 4 - ((NC + 4) % 8);
        }
        array[r * NC + c] = (p << 3) + b;
    };
    DataMatrix.prototype.ecc200placementblock = function (array, NR, NC, r, c, p) {
        this.ecc200placementbit(array, NR, NC, r - 2, c - 2, p, 7);
        this.ecc200placementbit(array, NR, NC, r - 2, c - 1, p, 6);
        this.ecc200placementbit(array, NR, NC, r - 1, c - 2, p, 5);
        this.ecc200placementbit(array, NR, NC, r - 1, c - 1, p, 4);
        this.ecc200placementbit(array, NR, NC, r - 1, c - 0, p, 3);
        this.ecc200placementbit(array, NR, NC, r - 0, c - 2, p, 2);
        this.ecc200placementbit(array, NR, NC, r - 0, c - 1, p, 1);
        this.ecc200placementbit(array, NR, NC, r - 0, c - 0, p, 0);
    };
    DataMatrix.prototype.ecc200placementcornerD = function (array, NR, NC, p) {
        this.ecc200placementbit(array, NR, NC, NR - 1, 0, p, 7);
        this.ecc200placementbit(array, NR, NC, NR - 1, NC - 1, p, 6);
        this.ecc200placementbit(array, NR, NC, 0, NC - 3, p, 5);
        this.ecc200placementbit(array, NR, NC, 0, NC - 2, p, 4);
        this.ecc200placementbit(array, NR, NC, 0, NC - 1, p, 3);
        this.ecc200placementbit(array, NR, NC, 1, NC - 3, p, 2);
        this.ecc200placementbit(array, NR, NC, 1, NC - 2, p, 1);
        this.ecc200placementbit(array, NR, NC, 1, NC - 1, p, 0);
    };
    DataMatrix.prototype.ecc200placementcornerA = function (array, NR, NC, p) {
        this.ecc200placementbit(array, NR, NC, NR - 1, 0, p, 7);
        this.ecc200placementbit(array, NR, NC, NR - 1, 1, p, 6);
        this.ecc200placementbit(array, NR, NC, NR - 1, 2, p, 5);
        var value = 4;
        this.ecc200placementbit(array, NR, NC, 0, NC - 2, p, value);
        this.ecc200placementbit(array, NR, NC, 0, NC - 1, p, 3);
        var value1 = 2;
        this.ecc200placementbit(array, NR, NC, 1, NC - 1, p, value1);
        this.ecc200placementbit(array, NR, NC, 2, NC - 1, p, 1);
        this.ecc200placementbit(array, NR, NC, 3, NC - 1, p, 0);
    };
    DataMatrix.prototype.ecc200placementcornerB = function (array, NR, NC, p) {
        var value = 7;
        this.ecc200placementbit(array, NR, NC, NR - 3, 0, p, value);
        this.ecc200placementbit(array, NR, NC, NR - 2, 0, p, 6);
        this.ecc200placementbit(array, NR, NC, NR - 1, 0, p, 5);
        this.ecc200placementbit(array, NR, NC, 0, NC - 4, p, 4);
        this.ecc200placementbit(array, NR, NC, 0, NC - 3, p, 3);
        this.ecc200placementbit(array, NR, NC, 0, NC - 2, p, 2);
        this.ecc200placementbit(array, NR, NC, 0, NC - 1, p, 1);
        this.ecc200placementbit(array, NR, NC, 1, NC - 1, p, 0);
    };
    DataMatrix.prototype.ecc200placementcornerC = function (array, NR, NC, p) {
        this.ecc200placementbit(array, NR, NC, NR - 3, 0, p, 7);
        this.ecc200placementbit(array, NR, NC, NR - 2, 0, p, 6);
        this.ecc200placementbit(array, NR, NC, NR - 1, 0, p, 5);
        this.ecc200placementbit(array, NR, NC, 0, NC - 2, p, 4);
        this.ecc200placementbit(array, NR, NC, 0, NC - 1, p, 3);
        this.ecc200placementbit(array, NR, NC, 1, NC - 1, p, 2);
        this.ecc200placementbit(array, NR, NC, 2, NC - 1, p, 1);
        this.ecc200placementbit(array, NR, NC, 3, NC - 1, p, 0);
    };
    DataMatrix.prototype.ecc200placement = function (array, NR, NC) {
        var r;
        var c;
        var p;
        for (var r_1 = 0; r_1 < NR; r_1++) {
            for (var c_1 = 0; c_1 < NC; c_1++) {
                array[r_1 * NC + c_1] = 0;
            }
        }
        p = 1;
        r = 4;
        c = 0;
        do {
            // check corner
            if (r === NR && !(c !== 0)) {
                this.ecc200placementcornerA(array, NR, NC, p++);
            }
            if ((r === NR - 2) && !(c !== 0) && ((NC % 4) !== 0)) {
                this.ecc200placementcornerB(array, NR, NC, p++);
            }
            if (r === NR - 2 && !(c !== 0) && (NC % 8) === 4) {
                this.ecc200placementcornerC(array, NR, NC, p++);
            }
            if (r === NR + 4 && c === 2 && !((NC % 8) !== 0)) {
                this.ecc200placementcornerD(array, NR, NC, p++);
            }
            // up/right
            do {
                if (r < NR && c >= 0 && !(array[r * NC + c] !== 0)) {
                    this.ecc200placementblock(array, NR, NC, r, c, p++);
                }
                r -= 2;
                c += 2;
            } while (r >= 0 && c < NC);
            r++;
            c += 3;
            // down/left
            do {
                if (r >= 0 && c < NC && !(array[r * NC + c] !== 0)) {
                    this.ecc200placementblock(array, NR, NC, r, c, p++);
                }
                r += 2;
                c -= 2;
            } while (r < NR && c >= 0);
            r += 3;
            c++;
        } while (r < NR || c < NC);
        // unfilled corner
        if (!(array[NR * NC - 1] !== 0)) {
            array[NR * NC - 1] = array[NR * NC - NC - 2] = 1;
        }
    };
    DataMatrix.prototype.getActualRows = function () {
        return this.mSymbolAttribute.SymbolRow + (QuietZone.All);
    };
    DataMatrix.prototype.getActualColumns = function () {
        return this.mSymbolAttribute.SymbolColumn + (QuietZone.All);
    };
    DataMatrix.prototype.AddQuiteZone = function (tempArray2) {
        this.actualRows = this.getActualRows();
        this.actualColumns = this.getActualColumns();
        var w = this.actualRows;
        var h = this.actualColumns;
        var quietZone = QuietZone.All - 1;
        this.mDataMatrixArray = this.create2DMartixArray(w, h, this.mDataMatrixArray);
        // Top quietzone.
        for (var i = 0; i < h; i++) {
            this.mDataMatrixArray[0][i] = 0;
        }
        for (var i = quietZone; i < w - quietZone; i++) {
            // Left quietzone.
            this.mDataMatrixArray[i][0] = 0;
            for (var j = quietZone; j < h - quietZone; j++) {
                this.mDataMatrixArray[i][j] = tempArray2[i - quietZone][j - quietZone];
            }
            // Right quietzone.
            this.mDataMatrixArray[i][h - quietZone] = 0;
        }
        //Bottom quietzone.
        for (var i = 0; i < h; i++) {
            this.mDataMatrixArray[w - quietZone][i] = 0;
        }
    };
    DataMatrix.prototype.drawImage = function (canvas, options) {
        // render image for the datamtrix generator
        var barcodeRenderer = this.getInstance(canvas.id);
        for (var i = 0; i < options.length; i++) {
            barcodeRenderer.renderRectElement(canvas, options[i]);
        }
    };
    DataMatrix.prototype.CreateMatrix = function (codeword) {
        var x;
        var y;
        // let NC: number;
        // let NR: number;
        // const places: number[];
        var W = this.mSymbolAttribute.SymbolColumn;
        var H = this.mSymbolAttribute.SymbolRow;
        var FW = W / this.mSymbolAttribute.HorizontalDataRegion;
        var FH = H / this.mSymbolAttribute.VerticalDataRegion;
        var NC = W - 2 * (W / FW);
        var NR = H - 2 * (H / FH);
        var places = Array(NC * NR);
        this.ecc200placement(places, NR, NC);
        var matrix = [];
        matrix = this.create1DMatrixArray(W * H, matrix);
        for (var y_1 = 0; y_1 < H; y_1 += FH) {
            for (var x_1 = 0; x_1 < W; x_1++) {
                matrix[y_1 * W + x_1] = 1;
            }
            for (var x_2 = 0; x_2 < W; x_2 += 2) {
                matrix[(y_1 + FH - 1) * W + x_2] = 1;
            }
        }
        for (x = 0; x < W; x += FW) {
            for (y = 0; y < H; y++) {
                matrix[y * W + x] = 1;
            }
            for (y = 0; y < H; y += 2) {
                matrix[y * W + x + FW - 1] = 1;
            }
        }
        for (var y_2 = 0; y_2 < NR; y_2++) {
            for (var x_3 = 0; x_3 < NC; x_3++) {
                var v = places[(NR - y_2 - 1) * NC + x_3];
                if (v === 1 || v > 7 && (codeword[(v >> 3) - 1] & (1 << (v & 7))) !== 0) {
                    matrix[(1 + Math.floor(y_2) + 2 * Math.floor(Math.floor(y_2) / Math.floor(FH - 2))) * Math.floor(W) +
                        1 + Math.floor(x_3) + 2 * Math.floor(Math.floor(x_3) / Math.floor(FW - 2))] = 1;
                }
            }
        }
        var w = this.mSymbolAttribute.SymbolColumn;
        var h = this.mSymbolAttribute.SymbolRow;
        var tempArray = [];
        tempArray = this.create2DMartixArray(w, h, tempArray);
        for (var x1 = 0; x1 < w; x1++) {
            for (var y1 = 0; y1 < h; y1++) {
                tempArray[x1][y1] = matrix[w * y1 + x1];
            }
        }
        var tempArray2 = [];
        tempArray2 = this.create2DMartixArray(w, h, tempArray2);
        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                tempArray2[h - 1 - i][j] = tempArray[j][i];
            }
        }
        this.AddQuiteZone(tempArray2);
    };
    DataMatrix.prototype.create1DMatrixArray = function (w, tempArray) {
        for (var i = 0; i < w; i++) {
            tempArray[i] = 0;
        }
        return tempArray;
    };
    DataMatrix.prototype.create2DMartixArray = function (w, h, tempArray) {
        for (var i = 0; i < w; i++) {
            tempArray.push([i]);
            for (var j = 0; j < h; j++) {
                tempArray[i][j] = 0;
            }
        }
        return tempArray;
    };
    /**
     * Build the datamatrix.\
     *
     * @returns {number[] | string} Build the datamatrix .
     * @private
     */
    DataMatrix.prototype.BuildDataMatrix = function () {
        var codeword = [];
        codeword = (this.PrepareCodeword(this.GetData()));
        if ((isNaN(codeword[0]))) {
            return codeword;
        }
        else {
            this.CreateMatrix(codeword);
            return this.mDataMatrixArray[0];
        }
    };
    DataMatrix.prototype.drawText = function (canvas, options) {
        var barcodeRenderer = this.getInstance(canvas.id);
        barcodeRenderer.renderTextElement(canvas, options);
    };
    DataMatrix.prototype.getInstance = function (id) {
        var barCode = document.getElementById(id);
        var barcodeRenderer = new BarcodeRenderer(barCode.id, this.isSvgMode);
        return barcodeRenderer;
    };
    DataMatrix.prototype.drawDisplayText = function (canvas, x, y, width, height, scaleValue, foreColor) {
        var displayText = this.displayText;
        createMeasureElements();
        var textOptions = getBaseAttributes(width, height, x, y, 'black');
        textOptions.string = (displayText.text ? displayText.text : this.value);
        textOptions.fontStyle = displayText.font;
        textOptions.color = foreColor;
        textOptions.stringSize = displayText.size;
        textOptions.visibility = displayText.visibility;
        var textSize = measureText(textOptions);
        if (!this.isSvgMode) {
            textSize = { width: textSize.width * scaleValue, height: textSize.height * scaleValue };
        }
        var textHeight = (textSize.height / 2) + (this.isSvgMode ? 2 : 2 * 1.5);
        textOptions.height = textHeight;
        if (width > textSize.width) {
            if (this.displayText.alignment === 'Center') {
                textOptions.x += (((x + width - x)) / 2) - textSize.width * .5;
            }
            else if (this.displayText.alignment === 'Left') {
                textOptions.x = x + this.displayText.margin.left;
            }
            else {
                textOptions.x = ((this.width - this.margin.left) - textSize.width) - this.displayText.margin.right;
            }
        }
        if (textOptions.x < x) {
            textOptions.x = x;
        }
        if (this.displayText.position === 'Bottom') {
            if (this.displayText.margin.top > 0) {
                textOptions.y = ((y + height));
            }
            if (this.displayText.margin.bottom > 0) {
                textOptions.y = ((y + height)) - displayText.margin.bottom;
            }
            else {
                if (this.margin.top < 10) {
                    textOptions.y = height + textSize.height / 2;
                }
                else {
                    textOptions.y = height + this.margin.top;
                }
            }
        }
        else {
            if (this.displayText.margin.top > 0) {
                textOptions.y = y + this.displayText.margin.top + textSize.height / 2;
            }
            else {
                textOptions.y = y + textSize.height / 2;
            }
        }
        if (this.displayText.visibility) {
            if (!this.isSvgMode) {
                textOptions.stringSize = textOptions.stringSize * 1.5;
            }
            this.drawText(canvas, textOptions);
        }
        return textOptions;
    };
    DataMatrix.prototype.getDrawableSize = function (margin, actualWidth, actualHeight) {
        var barcodeSize = (actualWidth >= actualHeight) ? actualHeight : actualWidth;
        return barcodeSize;
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    DataMatrix.prototype.draw = function (canvas) {
        var scaleValue = 1.5;
        var isSvg = this.isSvgMode;
        var isSquareMatrix = this.size < 25;
        var dimension = this.mDataMatrixArray.length;
        var width = this.width;
        var height = this.height;
        var dimensionX;
        var dimensionY;
        var leftValue = this.margin.left;
        var rightValue = this.margin.right;
        var topValue = this.margin.top;
        var bottomVal = this.margin.bottom;
        var actualWidth = width - ((isSvg ? leftValue : leftValue * scaleValue) + (isSvg ? rightValue : rightValue * scaleValue));
        var actualHeight = height - ((isSvg ? topValue : topValue * scaleValue) + (isSvg ? bottomVal : bottomVal * scaleValue));
        var size = this.getDrawableSize(this.margin, actualWidth, actualHeight);
        size = (actualWidth >= actualHeight) ? actualHeight : actualWidth;
        var x = (actualWidth - size) / 2;
        var y = (actualHeight - size) / 2;
        y += isSvg ? this.margin.top : this.margin.top * scaleValue;
        x += isSvg ? this.margin.left : this.margin.left * scaleValue;
        var textBounds = this.drawDisplayText(canvas, x, y, size, actualHeight, scaleValue, this.foreColor);
        actualHeight -= (textBounds.height);
        if (this.displayText.margin.bottom > 0) {
            if (this.displayText.position === 'Top') {
                y += (this.displayText.margin.bottom);
                actualHeight -= (this.displayText.margin.bottom);
            }
            else {
                actualHeight -= this.displayText.margin.bottom;
            }
        }
        if (this.displayText.margin.top > 0) {
            if (this.displayText.position === 'Top') {
                y += (this.displayText.margin.top);
                actualHeight -= (this.displayText.margin.top);
            }
            else {
                actualHeight -= this.displayText.margin.top;
            }
        }
        size = (actualWidth >= actualHeight) ? actualHeight : actualWidth;
        if (!isSquareMatrix) {
            dimensionX = size / this.mDataMatrixArray[0].length;
            dimensionY = size / this.mDataMatrixArray.length;
        }
        dimension = size / this.mDataMatrixArray.length;
        var w = this.actualRows;
        var h = this.actualColumns;
        var option;
        var options = [];
        for (var i = 0; i < w; i++) {
            for (var j = 0; j < h; j++) {
                var color = void 0;
                if (this.mDataMatrixArray[i][j] === 1) {
                    color = this.foreColor;
                }
                else {
                    color = 'white';
                }
                if (color !== 'white') {
                    option = getBaseAttributes(isSquareMatrix ? dimension : dimensionX, isSquareMatrix ? dimension : dimensionY, x, this.displayText.position === 'Bottom' ? y : y + textBounds.height / 2, color);
                    options.push(option);
                }
                x = x + (isSquareMatrix ? dimension : dimensionX);
            }
            y = y + (isSquareMatrix ? dimension : dimensionY);
            x = ((actualWidth - size) / 2) + (isSvg ? this.margin.left : this.margin.left * scaleValue);
        }
        this.drawImage(canvas, options);
        this.mDataMatrixArray = undefined;
    };
    return DataMatrix;
}());
export { DataMatrix };
