/**
 * ArabicShapeRenderer.ts class for EJ2-PDF
 */
import { Dictionary } from './../../../collections/dictionary';
var ArabicShapeRenderer = /** @class */ (function () {
    //#endregion
    //#region Constructor
    function ArabicShapeRenderer() {
        //#region Constants
        this.arabicCharTable = [['\u0621', '\uFE80'], ['\u0622', '\uFE81', '\uFE82'],
            ['\u0623', '\uFE83', '\uFE84'],
            ['\u0624', '\uFE85', '\uFE86'],
            ['\u0625', '\uFE87', '\uFE88'],
            ['\u0626', '\uFE89', '\uFE8A', '\uFE8B', '\uFE8C'],
            ['\u0627', '\uFE8D', '\uFE8E'],
            ['\u0628', '\uFE8F', '\uFE90', '\uFE91', '\uFE92'],
            ['\u0629', '\uFE93', '\uFE94'],
            ['\u062A', '\uFE95', '\uFE96', '\uFE97', '\uFE98'],
            ['\u062B', '\uFE99', '\uFE9A', '\uFE9B', '\uFE9C'],
            ['\u062C', '\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0'],
            ['\u062D', '\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4'],
            ['\u062E', '\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8'],
            ['\u062F', '\uFEA9', '\uFEAA'],
            ['\u0630', '\uFEAB', '\uFEAC'],
            ['\u0631', '\uFEAD', '\uFEAE'],
            ['\u0632', '\uFEAF', '\uFEB0'],
            ['\u0633', '\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4'],
            ['\u0634', '\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8'],
            ['\u0635', '\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC'],
            ['\u0636', '\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0'],
            ['\u0637', '\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4'],
            ['\u0638', '\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8'],
            ['\u0639', '\uFEC9', '\uFECA', '\uFECB', '\uFECC'],
            ['\u063A', '\uFECD', '\uFECE', '\uFECF', '\uFED0'],
            ['\u0640', '\u0640', '\u0640', '\u0640', '\u0640'],
            ['\u0641', '\uFED1', '\uFED2', '\uFED3', '\uFED4'],
            ['\u0642', '\uFED5', '\uFED6', '\uFED7', '\uFED8'],
            ['\u0643', '\uFED9', '\uFEDA', '\uFEDB', '\uFEDC'],
            ['\u0644', '\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0'],
            ['\u0645', '\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4'],
            ['\u0646', '\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8'],
            ['\u0647', '\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC'],
            ['\u0648', '\uFEED', '\uFEEE'],
            ['\u0649', '\uFEEF', '\uFEF0', '\uFBE8', '\uFBE9'],
            ['\u064A', '\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4'],
            ['\u0671', '\uFB50', '\uFB51'],
            ['\u0679', '\uFB66', '\uFB67', '\uFB68', '\uFB69'],
            ['\u067A', '\uFB5E', '\uFB5F', '\uFB60', '\uFB61'],
            ['\u067B', '\uFB52', '\uFB53', '\uFB54', '\uFB55'],
            ['\u067E', '\uFB56', '\uFB57', '\uFB58', '\uFB59'],
            ['\u067F', '\uFB62', '\uFB63', '\uFB64', '\uFB65'],
            ['\u0680', '\uFB5A', '\uFB5B', '\uFB5C', '\uFB5D'],
            ['\u0683', '\uFB76', '\uFB77', '\uFB78', '\uFB79'],
            ['\u0684', '\uFB72', '\uFB73', '\uFB74', '\uFB75'],
            ['\u0686', '\uFB7A', '\uFB7B', '\uFB7C', '\uFB7D'],
            ['\u0687', '\uFB7E', '\uFB7F', '\uFB80', '\uFB81'],
            ['\u0688', '\uFB88', '\uFB89'],
            ['\u068C', '\uFB84', '\uFB85'],
            ['\u068D', '\uFB82', '\uFB83'],
            ['\u068E', '\uFB86', '\uFB87'],
            ['\u0691', '\uFB8C', '\uFB8D'],
            ['\u0698', '\uFB8A', '\uFB8B'],
            ['\u06A4', '\uFB6A', '\uFB6B', '\uFB6C', '\uFB6D'],
            ['\u06A6', '\uFB6E', '\uFB6F', '\uFB70', '\uFB71'],
            ['\u06A9', '\uFB8E', '\uFB8F', '\uFB90', '\uFB91'],
            ['\u06AD', '\uFBD3', '\uFBD4', '\uFBD5', '\uFBD6'],
            ['\u06AF', '\uFB92', '\uFB93', '\uFB94', '\uFB95'],
            ['\u06B1', '\uFB9A', '\uFB9B', '\uFB9C', '\uFB9D'],
            ['\u06B3', '\uFB96', '\uFB97', '\uFB98', '\uFB99'],
            ['\u06BA', '\uFB9E', '\uFB9F'],
            ['\u06BB', '\uFBA0', '\uFBA1', '\uFBA2', '\uFBA3'],
            ['\u06BE', '\uFBAA', '\uFBAB', '\uFBAC', '\uFBAD'],
            ['\u06C0', '\uFBA4', '\uFBA5'],
            ['\u06C1', '\uFBA6', '\uFBA7', '\uFBA8', '\uFBA9'],
            ['\u06C5', '\uFBE0', '\uFBE1'],
            ['\u06C6', '\uFBD9', '\uFBDA'],
            ['\u06C7', '\uFBD7', '\uFBD8'],
            ['\u06C8', '\uFBDB', '\uFBDC'],
            ['\u06C9', '\uFBE2', '\uFBE3'],
            ['\u06CB', '\uFBDE', '\uFBDF'],
            ['\u06CC', '\uFBFC', '\uFBFD', '\uFBFE', '\uFBFF'],
            ['\u06D0', '\uFBE4', '\uFBE5', '\uFBE6', '\uFBE7'],
            ['\u06D2', '\uFBAE', '\uFBAF'],
            ['\u06D3', '\uFBB0', '\uFBB1']
        ];
        this.alef = '\u0627';
        this.alefHamza = '\u0623';
        this.alefHamzaBelow = '\u0625';
        this.alefMadda = '\u0622';
        this.lam = '\u0644';
        this.hamza = '\u0621';
        this.zeroWidthJoiner = '\u200D';
        this.hamzaAbove = '\u0654';
        this.hamzaBelow = '\u0655';
        this.wawHamza = '\u0624';
        this.yehHamza = '\u0626';
        this.waw = '\u0648';
        this.alefMaksura = '\u0649';
        this.yeh = '\u064A';
        this.farsiYeh = '\u06CC';
        this.shadda = '\u0651';
        this.madda = '\u0653';
        this.lwa = '\uFEFB';
        this.lwawh = '\uFEF7';
        this.lwawhb = '\uFEF9';
        this.lwawm = '\uFEF5';
        this.bwhb = '\u06D3';
        this.fathatan = '\u064B';
        this.superScriptalef = '\u0670';
        this.vowel = 0x1;
        // #endregion
        //#region Fields
        this.arabicMapTable = new Dictionary();
        for (var i = 0; i < this.arabicCharTable.length; i++) {
            this.arabicMapTable.setValue(this.arabicCharTable[i][0], this.arabicCharTable[i]);
        }
    }
    //#endregion
    //#region implementation
    ArabicShapeRenderer.prototype.getCharacterShape = function (input, index) {
        if ((input >= this.hamza) && (input <= this.bwhb)) {
            var value = [];
            if (this.arabicMapTable.getValue(input)) {
                value = this.arabicMapTable.getValue(input);
                return value[index + 1];
            }
        }
        else if (input >= this.lwawm && input <= this.lwa) {
            return (input);
        }
        return input;
    };
    ArabicShapeRenderer.prototype.shape = function (text, level) {
        var builder = '';
        var str2 = '';
        for (var i = 0; i < text.length; i++) {
            var c = text[i];
            if (c >= '؀' && c <= 'ۿ') {
                //if(c>= 0x0600.toString() && c<= 0x06FF.toString()) {
                str2 = str2 + c;
            }
            else {
                if (str2.length > 0) {
                    var st = this.doShape(str2.toString(), 0);
                    builder = builder + st;
                    str2 = '';
                }
                builder = builder + c;
            }
        }
        if (str2.length > 0) {
            var st = this.doShape(str2.toString(), 0);
            builder = builder + st;
        }
        return builder.toString();
    };
    ArabicShapeRenderer.prototype.doShape = function (input, level) {
        var str = '';
        var ligature = 0;
        var len = 0;
        var i = 0;
        var next = '';
        var previous = new ArabicShape();
        var present = new ArabicShape();
        while (i < input.length) {
            next = input[i++];
            ligature = this.ligature(next, present);
            if (ligature === 0) {
                var shapeCount = this.getShapeCount(next);
                len = (shapeCount === 1) ? 0 : 2;
                if (previous.Shapes > 2) {
                    len += 1;
                }
                len = len % (present.Shapes);
                present.Value = this.getCharacterShape(present.Value, len);
                str = this.append(str, previous, level);
                previous = present;
                present = new ArabicShape();
                present.Value = next;
                present.Shapes = shapeCount;
                present.Ligature++;
            }
        }
        len = (previous.Shapes > 2) ? 1 : 0;
        len = len % (present.Shapes);
        present.Value = this.getCharacterShape(present.Value, len);
        str = this.append(str, previous, level);
        str = this.append(str, present, level);
        return str.toString();
    };
    ArabicShapeRenderer.prototype.append = function (builder, shape, level) {
        if (shape.Value !== '') {
            builder = builder + shape.Value;
            shape.Ligature -= 1;
            if (shape.Type !== '') {
                if ((level & this.vowel) === 0) {
                    builder = builder + shape.Type;
                    shape.Ligature -= 1;
                }
                else {
                    shape.Ligature -= 1;
                }
            }
            if (shape.vowel !== '') {
                if ((level & this.vowel) === 0) {
                    builder = builder + shape.vowel;
                    shape.Ligature -= 1;
                }
                else {
                    shape.Ligature -= 1;
                }
            }
        }
        return builder;
    };
    ArabicShapeRenderer.prototype.ligature = function (value, shape) {
        if (shape.Value !== '') {
            var result = 0;
            if ((value >= this.fathatan && value <= this.hamzaBelow) || value === this.superScriptalef) {
                result = 1;
                if ((shape.vowel !== '') && (value !== this.shadda)) {
                    result = 2;
                }
                if (value === this.shadda) {
                    if (shape.Type == null) {
                        shape.Type = this.shadda;
                    }
                    else {
                        return 0;
                    }
                }
                else if (value === this.hamzaBelow) {
                    if (shape.Value === this.alef) {
                        shape.Value = this.alefHamzaBelow;
                        result = 2;
                    }
                    else if (value === this.lwa) {
                        shape.Value = this.lwawhb;
                        result = 2;
                    }
                    else {
                        shape.Type = this.hamzaBelow;
                    }
                }
                else if (value === this.hamzaAbove) {
                    if (shape.Value === this.alef) {
                        shape.Value = this.alefHamza;
                        result = 2;
                    }
                    else if (shape.Value === this.lwa) {
                        shape.Value = this.lwawh;
                        result = 2;
                    }
                    else if (shape.Value === this.waw) {
                        shape.Value = this.wawHamza;
                        result = 2;
                    }
                    else if (shape.Value === this.yeh || shape.Value === this.alefMaksura || shape.Value === this.farsiYeh) {
                        shape.Value = this.yehHamza;
                        result = 2;
                    }
                    else {
                        shape.Type = this.hamzaAbove;
                    }
                }
                else if (value === this.madda) {
                    if (shape.Value === this.alef) {
                        shape.Value = this.alefMadda;
                        result = 2;
                    }
                }
                else {
                    shape.vowel = value;
                }
                if (result === 1) {
                    shape.Ligature++;
                }
                return result;
            }
            if (shape.vowel !== '') {
                return 0;
            }
            if (shape.Value === this.lam) {
                if (value === this.alef) {
                    shape.Value = this.lwa;
                    shape.Shapes = 2;
                    result = 3;
                }
                else if (value === this.alefHamza) {
                    shape.Value = this.lwawh;
                    shape.Shapes = 2;
                    result = 3;
                }
                else if (value === this.alefHamzaBelow) {
                    shape.Value = this.lwawhb;
                    shape.Shapes = 2;
                    result = 3;
                }
                else if (value === this.alefMadda) {
                    shape.Value = this.lwawm;
                    shape.Shapes = 2;
                    result = 3;
                }
            }
            // else if (shape.Value === '') {
            //     shape.Value = value;
            //     shape.Shapes = this.getShapeCount(value);
            //     result = 1;
            // }
            return result;
        }
        else {
            return 0;
        }
    };
    ArabicShapeRenderer.prototype.getShapeCount = function (shape) {
        if ((shape >= this.hamza) && (shape <= this.bwhb) && !((shape >= this.fathatan && shape <= this.hamzaBelow)
            || shape === this.superScriptalef)) {
            var c = [];
            if (this.arabicMapTable.getValue(shape)) {
                c = this.arabicMapTable.getValue(shape);
                return c.length - 1;
            }
        }
        else if (shape === this.zeroWidthJoiner) {
            return 4;
        }
        return 1;
    };
    return ArabicShapeRenderer;
}());
export { ArabicShapeRenderer };
//#endregion
//#region Internals
var ArabicShape = /** @class */ (function () {
    function ArabicShape() {
        //#region Fields
        this.shapeValue = '';
        this.shapeType = '';
        this.shapeVowel = '';
        this.shapeLigature = 0;
        this.shapeShapes = 1;
        //#endregion
    }
    Object.defineProperty(ArabicShape.prototype, "Value", {
        //#endregion
        //#region Properties 
        /**
         * Gets or sets the values.
         * @private
         */
        get: function () {
            return this.shapeValue;
        },
        set: function (value) {
            this.shapeValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArabicShape.prototype, "Type", {
        /**
         * Gets or sets the values.
         * @private
         */
        get: function () {
            return this.shapeType;
        },
        set: function (value) {
            this.shapeType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArabicShape.prototype, "vowel", {
        /**
         * Gets or sets the values.
         * @private
         */
        get: function () {
            return this.shapeVowel;
        },
        set: function (value) {
            this.shapeVowel = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArabicShape.prototype, "Ligature", {
        /**
         * Gets or sets the values.
         * @private
         */
        get: function () {
            return this.shapeLigature;
        },
        set: function (value) {
            this.shapeLigature = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArabicShape.prototype, "Shapes", {
        /**
         * Gets or sets the values.
         * @private
         */
        get: function () {
            return this.shapeShapes;
        },
        set: function (value) {
            this.shapeShapes = value;
        },
        enumerable: true,
        configurable: true
    });
    return ArabicShape;
}());
export { ArabicShape };
//#endregion
