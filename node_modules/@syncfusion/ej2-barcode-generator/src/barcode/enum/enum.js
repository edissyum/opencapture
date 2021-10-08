/**
 * Enum
 */
/**
 * Defines the event of the barcode
 * * BarcodeEvent - Throws when an invalid input was given.
 */
export var BarcodeEvent;
(function (BarcodeEvent) {
    BarcodeEvent[BarcodeEvent["invalid"] = 0] = "invalid";
})(BarcodeEvent || (BarcodeEvent = {}));
/**
 * Defines the quite zone for the Qr Code.
 */
/** @private */
export var QuietZone;
(function (QuietZone) {
    QuietZone[QuietZone["All"] = 2] = "All";
})(QuietZone || (QuietZone = {}));
/**
 * Defines the size for the datamatrix code. The defined size are
 * * Auto
 * * Size10x10
 * * Size12x12
 * * Size14x14
 * * Size16x16
 * * Size18x18
 * * Size20x20
 * * Size22x22
 * * Size24x24
 * * Size26x26
 * * Size32x32
 * * Size36x36
 * * Size40x40
 * * Size44x44
 * * Size48x48
 * * Size52x52
 * * Size64x64
 * * Size72x72
 * * Size80x80
 * * Size88x88
 * * Size96x96
 * * Size104x104
 * * Size120x120
 * * Size132x132
 * * Size144x144
 * * Size8x18
 * * Size8x32
 * * Size12x26
 * * Size12x36
 * * Size16x36
 * * Size16x48
 *
 * @aspNumberEnum
 * @IgnoreSingular
 */
export var DataMatrixSize;
(function (DataMatrixSize) {
    /**
     * modules will be generated automatically.
     */
    DataMatrixSize[DataMatrixSize["Auto"] = 0] = "Auto";
    /**
     * will generate 10*10 modules.
     */
    DataMatrixSize[DataMatrixSize["Size10x10"] = 1] = "Size10x10";
    /**
     * will generate 12*12 modules.
     */
    DataMatrixSize[DataMatrixSize["Size12x12"] = 2] = "Size12x12";
    /**
     * will generate 14*14 modules.
     */
    DataMatrixSize[DataMatrixSize["Size14x14"] = 3] = "Size14x14";
    /**
     * will generate 16*16 modules.
     */
    DataMatrixSize[DataMatrixSize["Size16x16"] = 4] = "Size16x16";
    /**
     * will generate 18*18 modules.
     */
    DataMatrixSize[DataMatrixSize["Size18x18"] = 5] = "Size18x18";
    /**
     * will generate 20*20 modules.
     */
    DataMatrixSize[DataMatrixSize["Size20x20"] = 6] = "Size20x20";
    /**
     * will generate 22*22 modules.
     */
    DataMatrixSize[DataMatrixSize["Size22x22"] = 7] = "Size22x22";
    /**
     * will generate 24*24 modules.
     */
    DataMatrixSize[DataMatrixSize["Size24x24"] = 8] = "Size24x24";
    /**
     * will generate 26*26 modules.
     */
    DataMatrixSize[DataMatrixSize["Size26x26"] = 9] = "Size26x26";
    /**
     * will generate 32*32 modules.
     */
    DataMatrixSize[DataMatrixSize["Size32x32"] = 10] = "Size32x32";
    /**
     * will generate 32*32 modules.
     */
    DataMatrixSize[DataMatrixSize["Size36x36"] = 11] = "Size36x36";
    /**
     * will generate 40*40 modules.
     */
    DataMatrixSize[DataMatrixSize["Size40x40"] = 12] = "Size40x40";
    /**
     * will generate 44*44 modules.
     */
    DataMatrixSize[DataMatrixSize["Size44x44"] = 13] = "Size44x44";
    /**
     * will generate 48*48 modules.
     */
    DataMatrixSize[DataMatrixSize["Size48x48"] = 14] = "Size48x48";
    /**
     * will generate 52*52 modules.
     */
    DataMatrixSize[DataMatrixSize["Size52x52"] = 15] = "Size52x52";
    /**
     * will generate 64*64 modules.
     */
    DataMatrixSize[DataMatrixSize["Size64x64"] = 16] = "Size64x64";
    /**
     * will generate 72*72 modules.
     */
    DataMatrixSize[DataMatrixSize["Size72x72"] = 17] = "Size72x72";
    /**
     * will generate 80*80 modules.
     */
    DataMatrixSize[DataMatrixSize["Size80x80"] = 18] = "Size80x80";
    /**
     * will generate 88*88 modules.
     */
    DataMatrixSize[DataMatrixSize["Size88x88"] = 19] = "Size88x88";
    /**
     * will generate 96*96 modules.
     */
    DataMatrixSize[DataMatrixSize["Size96x96"] = 20] = "Size96x96";
    /**
     * will generate 104*104 modules.
     */
    DataMatrixSize[DataMatrixSize["Size104x104"] = 21] = "Size104x104";
    /**
     * will generate 120*120 modules.
     */
    DataMatrixSize[DataMatrixSize["Size120x120"] = 22] = "Size120x120";
    /**
     * will generate 132*132 modules.
     */
    DataMatrixSize[DataMatrixSize["Size132x132"] = 23] = "Size132x132";
    /**
     * will generate 144*144 modules.
     */
    DataMatrixSize[DataMatrixSize["Size144x144"] = 24] = "Size144x144";
    /**
     * will generate 8*18 modules.
     */
    DataMatrixSize[DataMatrixSize["Size8x18"] = 25] = "Size8x18";
    /**
     * will generate 8*32 modules.
     */
    DataMatrixSize[DataMatrixSize["Size8x32"] = 26] = "Size8x32";
    /**
     * will generate 12*26 modules.
     */
    DataMatrixSize[DataMatrixSize["Size12x26"] = 27] = "Size12x26";
    /**
     * will generate 12*36 modules.
     */
    DataMatrixSize[DataMatrixSize["Size12x36"] = 28] = "Size12x36";
    /**
     * will generate 16*36 modules.
     */
    DataMatrixSize[DataMatrixSize["Size16x36"] = 29] = "Size16x36";
    /**
     * will generate 16*48 modules.
     */
    DataMatrixSize[DataMatrixSize["Size16x48"] = 30] = "Size16x48";
})(DataMatrixSize || (DataMatrixSize = {}));
/**
 * Defines the Qrcode QRCodeVersion. They are
 * * Auto
 * * Version01
 * * Version02
 * * Version03
 * * Version04
 * * Version05
 * * Version06
 * * Version07
 * * Version08
 * * Version09
 * * Version10
 * * Version11
 * * Version12
 * * Version13
 * * Version14
 * * Version15
 * * Version16
 * * Version17
 * * Version18
 * * Version19
 * * Version20
 * * Version21
 * * Version22
 * * Version23
 * * Version24
 * * Version25
 * * Version26
 * * Version27
 * * Version28
 * * Version29
 * * Version30
 * * Version31
 * * Version32
 * * Version33
 * * Version34
 * * Version35
 * * Version36
 * * Version37
 * * Version38
 * * Version39
 * * Version40
 *
 * @aspNumberEnum
 * @IgnoreSingular
 */
export var QRCodeVersion;
(function (QRCodeVersion) {
    /**
     * Specifies the default version.
     */
    QRCodeVersion[QRCodeVersion["Auto"] = 0] = "Auto";
    /**
     * Specifies version 1 (21 x 21 modules).
     */
    QRCodeVersion[QRCodeVersion["Version01"] = 1] = "Version01";
    /**
     * Specifies version 2 (25 x 25 modules).
     */
    QRCodeVersion[QRCodeVersion["Version02"] = 2] = "Version02";
    /**
     * Specifies version 3 (29 x 29 modules).
     */
    QRCodeVersion[QRCodeVersion["Version03"] = 3] = "Version03";
    /**
     * Specifies version 4 (33 x 33 modules).
     */
    QRCodeVersion[QRCodeVersion["Version04"] = 4] = "Version04";
    /**
     * Specifies version 5 (37 x 37 modules).
     */
    QRCodeVersion[QRCodeVersion["Version05"] = 5] = "Version05";
    /**
     * Specifies version 6 (41 x 41 modules).
     */
    QRCodeVersion[QRCodeVersion["Version06"] = 6] = "Version06";
    /**
     * Specifies version 7 (45 x 45 modules).
     */
    QRCodeVersion[QRCodeVersion["Version07"] = 7] = "Version07";
    /**
     * Specifies version 8 (49 x 49 modules).
     */
    QRCodeVersion[QRCodeVersion["Version08"] = 8] = "Version08";
    /**
     * Specifies version 9 (53 x 53 modules).
     */
    QRCodeVersion[QRCodeVersion["Version09"] = 9] = "Version09";
    /**
     * Specifies version 10 (57 x 57 modules).
     */
    QRCodeVersion[QRCodeVersion["Version10"] = 10] = "Version10";
    /**
     * Specifies version 11 (61 x 61 modules).
     */
    QRCodeVersion[QRCodeVersion["Version11"] = 11] = "Version11";
    /**
     * Specifies version 12 (65 x 65 modules).
     */
    QRCodeVersion[QRCodeVersion["Version12"] = 12] = "Version12";
    /**
     * Specifies version 13 (69 x 69 modules).
     */
    QRCodeVersion[QRCodeVersion["Version13"] = 13] = "Version13";
    /**
     * Specifies version 14 (73 x 73 modules).
     */
    QRCodeVersion[QRCodeVersion["Version14"] = 14] = "Version14";
    /**
     * Specifies version 15 (77 x 77 modules).
     */
    QRCodeVersion[QRCodeVersion["Version15"] = 15] = "Version15";
    /**
     * Specifies version 17 (85 x 85 modules).
     */
    QRCodeVersion[QRCodeVersion["Version16"] = 16] = "Version16";
    /**
     * Specifies version 17 (85 x 85 modules).
     */
    QRCodeVersion[QRCodeVersion["Version17"] = 17] = "Version17";
    /**
     * Specifies version 18 (89 x 89 modules).
     */
    QRCodeVersion[QRCodeVersion["Version18"] = 18] = "Version18";
    /**
     * Specifies version 19 (93 x 93 modules).
     */
    QRCodeVersion[QRCodeVersion["Version19"] = 19] = "Version19";
    /**
     * Specifies version 20 (97 x 97 modules).
     */
    QRCodeVersion[QRCodeVersion["Version20"] = 20] = "Version20";
    /**
     * Specifies version 21 (101 x 101 modules).
     */
    QRCodeVersion[QRCodeVersion["Version21"] = 21] = "Version21";
    /**
     * Specifies version 22 (105 x 105 modules).
     */
    QRCodeVersion[QRCodeVersion["Version22"] = 22] = "Version22";
    /**
     * Specifies version 23 (109 x 109 modules).
     */
    QRCodeVersion[QRCodeVersion["Version23"] = 23] = "Version23";
    /**
     * Specifies version 24 (113 x 113 modules).
     */
    QRCodeVersion[QRCodeVersion["Version24"] = 24] = "Version24";
    /**
     * Specifies version 25 (117 x 117 modules).
     */
    QRCodeVersion[QRCodeVersion["Version25"] = 25] = "Version25";
    /**
     * Specifies version 26 (121 x 121 modules).
     */
    QRCodeVersion[QRCodeVersion["Version26"] = 26] = "Version26";
    /**
     * Specifies version 27 (125 x 125 modules).
     */
    QRCodeVersion[QRCodeVersion["Version27"] = 27] = "Version27";
    /**
     * Specifies version 28 (129 x 129 modules).
     */
    QRCodeVersion[QRCodeVersion["Version28"] = 28] = "Version28";
    /**
     * Specifies version 29 (133 x 133 modules).
     */
    QRCodeVersion[QRCodeVersion["Version29"] = 29] = "Version29";
    /**
     * Specifies version 30 (137 x 137 modules).
     */
    QRCodeVersion[QRCodeVersion["Version30"] = 30] = "Version30";
    /**
     * Specifies version 31 (141 x 141 modules).
     */
    QRCodeVersion[QRCodeVersion["Version31"] = 31] = "Version31";
    /**
     * Specifies version 32 (145 x 145 modules).
     */
    QRCodeVersion[QRCodeVersion["Version32"] = 32] = "Version32";
    /**
     * Specifies version 33 (149 x 149 modules).
     */
    QRCodeVersion[QRCodeVersion["Version33"] = 33] = "Version33";
    /**
     * Specifies version 34 (153 x 153 modules).
     */
    QRCodeVersion[QRCodeVersion["Version34"] = 34] = "Version34";
    /**
     * Specifies version 35 (157 x 157 modules).
     */
    QRCodeVersion[QRCodeVersion["Version35"] = 35] = "Version35";
    /**
     * Specifies version 36 (161 x 161 modules).
     */
    QRCodeVersion[QRCodeVersion["Version36"] = 36] = "Version36";
    /**
     * Specifies version 37 (165 x 165 modules).
     */
    QRCodeVersion[QRCodeVersion["Version37"] = 37] = "Version37";
    /**
     * Specifies version 38 (169 x 169 modules).
     */
    QRCodeVersion[QRCodeVersion["Version38"] = 38] = "Version38";
    /**
     * Specifies version 39 (173 x 173 modules).
     */
    QRCodeVersion[QRCodeVersion["Version39"] = 39] = "Version39";
    /**
     * Specifies version 40 (177 x 177 modules).
     */
    QRCodeVersion[QRCodeVersion["Version40"] = 40] = "Version40";
})(QRCodeVersion || (QRCodeVersion = {}));
/**
 * Indicated the recovery capacity of the qrcode. The default capacity levels are
 * * Low
 * * Medium
 * * Quartile
 * * High
 *
 * @aspNumberEnum
 * @IgnoreSingular
 */
export var ErrorCorrectionLevel;
(function (ErrorCorrectionLevel) {
    /**
     * The Recovery capacity is 7%(approx.)
     */
    ErrorCorrectionLevel[ErrorCorrectionLevel["Low"] = 7] = "Low";
    /**
     * The Recovery capacity is 15%(approx.)
     */
    ErrorCorrectionLevel[ErrorCorrectionLevel["Medium"] = 15] = "Medium";
    /**
     * The Recovery capacity is 25%(approx.)
     */
    ErrorCorrectionLevel[ErrorCorrectionLevel["Quartile"] = 25] = "Quartile";
    /**
     * The Recovery capacity is 30%(approx.)
     */
    ErrorCorrectionLevel[ErrorCorrectionLevel["High"] = 30] = "High";
})(ErrorCorrectionLevel || (ErrorCorrectionLevel = {}));
