/**
 * TtfReader.ts class for EJ2-PDF
 */
import { TtfTableInfo } from './ttf-table-info';
import { Dictionary } from './../../collections/dictionary';
import { TtfNameTable } from './ttf-name-table';
import { TtfNameRecord } from './ttf-name-record';
import { TtfHeadTable } from './ttf-head-table';
import { TtfMetrics } from './ttf-metrics';
import { TtfHorizontalHeaderTable } from './ttf-horizontal-header-table';
import { TtfOS2Table } from './ttf-OS2-Table';
import { TtfPostTable } from './ttf-post-table';
import { TtfLongHorMetric } from './ttf-long-hor-metric';
import { TtfCmapSubTable } from './ttf-cmap-sub-table';
import { TtfCmapTable } from './ttf-cmap-table';
import { TtfGlyphInfo } from './ttf-glyph-info';
import { TtfLocaTable } from './ttf-loca-table';
import { TtfAppleCmapSubTable } from './ttf-apple-cmap-sub-table';
import { TtfMicrosoftCmapSubTable } from './ttf-microsoft-cmap-sub-table';
import { TtfTrimmedCmapSubTable } from './ttf-trimmed-cmap-sub-table';
import { TtfGlyphHeader } from './ttf-glyph-header';
import { Rectangle } from './../../drawing/pdf-drawing';
import { StringTokenizer } from './string-tokenizer';
import { TtfCmapFormat, TtfCmapEncoding, TtfPlatformID } from './enum';
import { TtfMicrosoftEncodingID, TtfMacintoshEncodingID, TtfCompositeGlyphFlags } from './enum';
import { BigEndianWriter } from './../../input-output/big-endian-writer';
var TtfReader = /** @class */ (function () {
    //Constructors
    function TtfReader(fontData) {
        this.int32Size = 4;
        this.isTtcFont = false;
        this.isMacTtf = false;
        this.metricsName = '';
        this.isMacTTF = false;
        this.missedGlyphs = 0;
        this.tableNames = ['cvt ', 'fpgm', 'glyf', 'head', 'hhea', 'hmtx', 'loca', 'maxp', 'prep'];
        this.entrySelectors = [0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4];
        this.fontData = fontData;
        this.initialize();
    }
    Object.defineProperty(TtfReader.prototype, "macintosh", {
        //Properties
        /**
         * Gets glyphs for Macintosh or Symbol fonts (char - key, glyph - value).
         */
        get: function () {
            if (this.macintoshDictionary === null || this.macintoshDictionary === undefined) {
                this.macintoshDictionary = new Dictionary();
            }
            return this.macintoshDictionary;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TtfReader.prototype, "microsoft", {
        /**
         * Gets glyphs for Microsoft or Symbol fonts (char - key, glyph - value).
         */
        get: function () {
            if (this.microsoftDictionary === null || this.microsoftDictionary === undefined) {
                this.microsoftDictionary = new Dictionary();
            }
            return this.microsoftDictionary;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TtfReader.prototype, "macintoshGlyphs", {
        /**
         * Gets glyphs for Macintosh or Symbol fonts (glyph index - key, glyph - value).
         */
        get: function () {
            if (this.internalMacintoshGlyphs === null || this.internalMacintoshGlyphs === undefined) {
                this.internalMacintoshGlyphs = new Dictionary();
            }
            return this.internalMacintoshGlyphs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TtfReader.prototype, "microsoftGlyphs", {
        /**
         * Gets glyphs for Microsoft Unicode fonts (glyph index - key, glyph - value).
         */
        get: function () {
            if (this.internalMicrosoftGlyphs === null || this.internalMicrosoftGlyphs === undefined) {
                this.internalMicrosoftGlyphs = new Dictionary();
            }
            return this.internalMicrosoftGlyphs;
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    TtfReader.prototype.initialize = function () {
        if (this.metrics === undefined) {
            this.metrics = new TtfMetrics();
        }
        this.readFontDictionary();
        var nameTable = this.readNameTable();
        var headTable = this.readHeadTable();
        this.initializeFontName(nameTable);
        this.metrics.macStyle = headTable.macStyle;
    };
    TtfReader.prototype.readFontDictionary = function () {
        this.offset = 0;
        var version = this.checkPreambula();
        //this.offset += 4;
        var numTables = this.readInt16(this.offset);
        var searchRange = this.readInt16(this.offset);
        var entrySelector = this.readInt16(this.offset);
        var rangeShift = this.readInt16(this.offset);
        if (this.tableDirectory === undefined) {
            this.tableDirectory = new Dictionary();
        }
        for (var i = 0; i < numTables; ++i) {
            var table = new TtfTableInfo();
            var tableKey = this.readString(this.int32Size);
            table.checksum = this.readInt32(this.offset);
            table.offset = this.readInt32(this.offset);
            table.length = this.readInt32(this.offset);
            this.tableDirectory.setValue(tableKey, table);
        }
        this.lowestPosition = this.offset;
        if (!this.isTtcFont) {
            this.fixOffsets();
        }
    };
    TtfReader.prototype.fixOffsets = function () {
        var minOffset = Number.MAX_VALUE;
        // Search for a smallest offset and compare it with the lowest position found.
        var tableKeys = this.tableDirectory.keys();
        for (var i = 0; i < tableKeys.length; i++) {
            var value = this.tableDirectory.getValue(tableKeys[i]);
            var offset = value.offset;
            if (minOffset > offset) {
                minOffset = offset;
                if (minOffset <= this.lowestPosition) {
                    break;
                }
            }
        }
        var shift = minOffset - this.lowestPosition;
        if (shift !== 0) {
            var table = new Dictionary();
            for (var i = 0; i < tableKeys.length; i++) {
                var value = this.tableDirectory.getValue(tableKeys[i]);
                value.offset -= shift;
                table.setValue(tableKeys[i], value);
            }
            this.tableDirectory = table;
        }
    };
    TtfReader.prototype.checkPreambula = function () {
        var version = this.readInt32(this.offset);
        this.isMacTtf = (version === 0x74727565) ? true : false;
        if (version !== 0x10000 && version !== 0x74727565 && version !== 0x4f54544f) {
            this.isTtcFont = true;
            this.offset = 0;
            var fontTag = this.readString(4);
            if (fontTag !== 'ttcf') {
                throw new Error('Can not read TTF font data');
            }
            //skip 4
            this.offset += 4;
            var ttcIdentificationNumber = this.readInt32(this.offset);
            if (ttcIdentificationNumber < 0) {
                throw new Error('Can not read TTF font data');
            }
            this.offset = this.readInt32(this.offset);
            version = this.readInt32(this.offset);
        }
        return version;
    };
    TtfReader.prototype.readNameTable = function () {
        var tableInfo = this.getTable('name');
        this.offset = tableInfo.offset;
        var table = new TtfNameTable();
        table.formatSelector = this.readUInt16(this.offset);
        table.recordsCount = this.readUInt16(this.offset);
        table.offset = this.readUInt16(this.offset);
        table.nameRecords = [];
        var recordSize = 12;
        var position = this.offset;
        for (var i = 0; i < table.recordsCount; i++) {
            this.offset = position;
            var record = new TtfNameRecord();
            record.platformID = this.readUInt16(this.offset);
            record.encodingID = this.readUInt16(this.offset);
            record.languageID = this.readUInt16(this.offset);
            record.nameID = this.readUInt16(this.offset);
            record.length = this.readUInt16(this.offset);
            record.offset = this.readUInt16(this.offset);
            this.offset = tableInfo.offset + table.offset + record.offset;
            var unicode = (record.platformID === 0 || record.platformID === 3);
            record.name = this.readString(record.length, unicode);
            table.nameRecords[i] = record;
            position += recordSize;
        }
        return table;
    };
    TtfReader.prototype.readHeadTable = function () {
        var tableInfo = this.getTable('head');
        this.offset = tableInfo.offset;
        var table = new TtfHeadTable();
        table.version = this.readFixed(this.offset);
        table.fontRevision = this.readFixed(this.offset);
        table.checkSumAdjustment = this.readUInt32(this.offset);
        table.magicNumber = this.readUInt32(this.offset);
        table.flags = this.readUInt16(this.offset);
        table.unitsPerEm = this.readUInt16(this.offset);
        table.created = this.readInt64(this.offset);
        table.modified = this.readInt64(this.offset);
        table.xMin = this.readInt16(this.offset);
        table.yMin = this.readInt16(this.offset);
        table.xMax = this.readInt16(this.offset);
        table.yMax = this.readInt16(this.offset);
        table.macStyle = this.readUInt16(this.offset);
        table.lowestReadableSize = this.readUInt16(this.offset);
        table.fontDirectionHint = this.readInt16(this.offset);
        table.indexToLocalFormat = this.readInt16(this.offset);
        table.glyphDataFormat = this.readInt16(this.offset);
        return table;
    };
    TtfReader.prototype.readHorizontalHeaderTable = function () {
        var tableInfo = this.getTable('hhea');
        this.offset = tableInfo.offset;
        var table = new TtfHorizontalHeaderTable();
        table.version = this.readFixed(this.offset);
        table.ascender = this.readInt16(this.offset);
        table.descender = this.readInt16(this.offset);
        table.lineGap = this.readInt16(this.offset);
        table.advanceWidthMax = this.readUInt16(this.offset);
        table.minLeftSideBearing = this.readInt16(this.offset);
        table.minRightSideBearing = this.readInt16(this.offset);
        table.xMaxExtent = this.readInt16(this.offset);
        table.caretSlopeRise = this.readInt16(this.offset);
        table.caretSlopeRun = this.readInt16(this.offset);
        //skip 2 * 5
        this.offset += 10;
        table.metricDataFormat = this.readInt16(this.offset);
        table.numberOfHMetrics = this.readUInt16(this.offset);
        return table;
    };
    TtfReader.prototype.readOS2Table = function () {
        var tableInfo = this.getTable('OS/2');
        this.offset = tableInfo.offset;
        var table = new TtfOS2Table();
        table.version = this.readUInt16(this.offset);
        table.xAvgCharWidth = this.readInt16(this.offset);
        table.usWeightClass = this.readUInt16(this.offset);
        table.usWidthClass = this.readUInt16(this.offset);
        table.fsType = this.readInt16(this.offset);
        table.ySubscriptXSize = this.readInt16(this.offset);
        table.ySubscriptYSize = this.readInt16(this.offset);
        table.ySubscriptXOffset = this.readInt16(this.offset);
        table.ySubscriptYOffset = this.readInt16(this.offset);
        table.ySuperscriptXSize = this.readInt16(this.offset);
        table.ySuperscriptYSize = this.readInt16(this.offset);
        table.ySuperscriptXOffset = this.readInt16(this.offset);
        table.ySuperscriptYOffset = this.readInt16(this.offset);
        table.yStrikeoutSize = this.readInt16(this.offset);
        table.yStrikeoutPosition = this.readInt16(this.offset);
        table.sFamilyClass = this.readInt16(this.offset);
        table.panose = this.readBytes(10);
        table.ulUnicodeRange1 = this.readUInt32(this.offset);
        table.ulUnicodeRange2 = this.readUInt32(this.offset);
        table.ulUnicodeRange3 = this.readUInt32(this.offset);
        table.ulUnicodeRange4 = this.readUInt32(this.offset);
        table.vendorIdentifier = this.readBytes(4);
        table.fsSelection = this.readUInt16(this.offset);
        table.usFirstCharIndex = this.readUInt16(this.offset);
        table.usLastCharIndex = this.readUInt16(this.offset);
        table.sTypoAscender = this.readInt16(this.offset);
        table.sTypoDescender = this.readInt16(this.offset);
        table.sTypoLineGap = this.readInt16(this.offset);
        table.usWinAscent = this.readUInt16(this.offset);
        table.usWinDescent = this.readUInt16(this.offset);
        table.ulCodePageRange1 = this.readUInt32(this.offset);
        table.ulCodePageRange2 = this.readUInt32(this.offset);
        if (table.version > 1) {
            table.sxHeight = this.readInt16(this.offset);
            table.sCapHeight = this.readInt16(this.offset);
            table.usDefaultChar = this.readUInt16(this.offset);
            table.usBreakChar = this.readUInt16(this.offset);
            table.usMaxContext = this.readUInt16(this.offset);
        }
        else {
            table.sxHeight = 0;
            table.sCapHeight = 0;
            table.usDefaultChar = 0;
            table.usBreakChar = 0;
            table.usMaxContext = 0;
        }
        return table;
    };
    TtfReader.prototype.readPostTable = function () {
        var tableInfo = this.getTable('post');
        this.offset = tableInfo.offset;
        var table = new TtfPostTable();
        table.formatType = this.readFixed(this.offset);
        table.italicAngle = this.readFixed(this.offset);
        table.underlinePosition = this.readInt16(this.offset);
        table.underlineThickness = this.readInt16(this.offset);
        table.isFixedPitch = this.readUInt32(this.offset);
        table.minType42 = this.readUInt32(this.offset);
        table.maxType42 = this.readUInt32(this.offset);
        table.minType1 = this.readUInt32(this.offset);
        table.maxType1 = this.readUInt32(this.offset);
        return table;
    };
    /**
     * Reads Width of the glyphs.
     */
    TtfReader.prototype.readWidthTable = function (glyphCount, unitsPerEm) {
        var tableInfo = this.getTable('hmtx');
        this.offset = tableInfo.offset;
        var width = [];
        for (var i = 0; i < glyphCount; i++) {
            var glyph = new TtfLongHorMetric();
            glyph.advanceWidth = this.readUInt16(this.offset);
            glyph.lsb = this.readInt16(this.offset);
            var glyphWidth = glyph.advanceWidth * 1000 / unitsPerEm;
            width.push(Math.floor(glyphWidth));
        }
        return width;
    };
    /**
     * Reads the cmap table.
     */
    TtfReader.prototype.readCmapTable = function () {
        var tableInfo = this.getTable('cmap');
        this.offset = tableInfo.offset;
        var table = new TtfCmapTable();
        table.version = this.readUInt16(this.offset);
        table.tablesCount = this.readUInt16(this.offset);
        var position = this.offset;
        var subTables = [];
        for (var i = 0; i < table.tablesCount; i++) {
            this.offset = position;
            var subTable = new TtfCmapSubTable();
            subTable.platformID = this.readUInt16(this.offset);
            subTable.encodingID = this.readUInt16(this.offset);
            subTable.offset = this.readUInt32(this.offset);
            position = this.offset;
            this.readCmapSubTable(subTable);
            subTables[i] = subTable;
        }
        return subTables;
    };
    /**
     * Reads the cmap sub table.
     */
    TtfReader.prototype.readCmapSubTable = function (subTable) {
        var tableInfo = this.getTable('cmap');
        this.offset = tableInfo.offset + subTable.offset;
        var format = this.readUInt16(this.offset);
        var encoding = this.getCmapEncoding(subTable.platformID, subTable.encodingID);
        var platform = (encoding === TtfCmapEncoding.Macintosh) ? TtfPlatformID.Macintosh : TtfPlatformID.Microsoft;
        if (encoding !== TtfCmapEncoding.Unknown) {
            switch (format) {
                case TtfCmapFormat.Apple:
                    this.readAppleCmapTable(subTable, encoding);
                    break;
                case TtfCmapFormat.Microsoft:
                    this.readMicrosoftCmapTable(subTable, encoding);
                    break;
                case TtfCmapFormat.Trimmed:
                    this.readTrimmedCmapTable(subTable, encoding);
                    break;
            }
        }
    };
    /**
     * Reads Symbol cmap table.
     */
    TtfReader.prototype.readAppleCmapTable = function (subTable, encoding) {
        var tableInfo = this.getTable('cmap');
        this.offset = tableInfo.offset + subTable.offset;
        var table = new TtfAppleCmapSubTable();
        table.format = this.readUInt16(this.offset);
        table.length = this.readUInt16(this.offset);
        table.version = this.readUInt16(this.offset);
        if (this.maxMacIndex === null || this.maxMacIndex === undefined) {
            this.maxMacIndex = 0;
        }
        for (var i = 0; i < 256; ++i) {
            var glyphInfo = new TtfGlyphInfo();
            glyphInfo.index = this.readByte(this.offset);
            glyphInfo.width = this.getWidth(glyphInfo.index);
            glyphInfo.charCode = i;
            this.macintosh.setValue(i, glyphInfo);
            this.addGlyph(glyphInfo, encoding);
            // NOTE: this code fixes char codes that extends 0x100. However, it might corrupt something.
            this.maxMacIndex = Math.max(i, this.maxMacIndex);
        }
    };
    /**
     * Reads Symbol cmap table.
     */
    TtfReader.prototype.readMicrosoftCmapTable = function (subTable, encoding) {
        var tableInfo = this.getTable('cmap');
        this.offset = tableInfo.offset + subTable.offset;
        var collection = (encoding === TtfCmapEncoding.Unicode) ? this.microsoft : this.macintosh;
        var table = new TtfMicrosoftCmapSubTable();
        table.format = this.readUInt16(this.offset);
        table.length = this.readUInt16(this.offset);
        table.version = this.readUInt16(this.offset);
        table.segCountX2 = this.readUInt16(this.offset);
        table.searchRange = this.readUInt16(this.offset);
        table.entrySelector = this.readUInt16(this.offset);
        table.rangeShift = this.readUInt16(this.offset);
        var segCount = table.segCountX2 / 2;
        table.endCount = this.readUshortArray(segCount);
        table.reservedPad = this.readUInt16(this.offset);
        table.startCount = this.readUshortArray(segCount);
        table.idDelta = this.readUshortArray(segCount);
        table.idRangeOffset = this.readUshortArray(segCount);
        var length = (table.length / 2 - 8) - (segCount * 4);
        table.glyphID = this.readUshortArray(length);
        // Process glyphIdArray array.
        var codeOffset = 0;
        var index = 0;
        for (var j = 0; j < segCount; j++) {
            for (var k = table.startCount[j]; k <= table.endCount[j] && k !== 65535; k++) {
                if (table.idRangeOffset[j] === 0) {
                    codeOffset = (k + table.idDelta[j]) & 65535;
                }
                else {
                    index = j + table.idRangeOffset[j] / 2 - segCount + k - table.startCount[j];
                    if (index >= table.glyphID.length) {
                        continue;
                    }
                    codeOffset = (table.glyphID[index] + table.idDelta[j]) & 65535;
                }
                var glyph = new TtfGlyphInfo();
                glyph.index = codeOffset;
                glyph.width = this.getWidth(glyph.index);
                var id = (encoding === TtfCmapEncoding.Symbol) ? ((k & 0xff00) === 0xf000 ? k & 0xff : k) : k;
                glyph.charCode = id;
                collection.setValue(id, glyph);
                this.addGlyph(glyph, encoding);
            }
        }
    };
    /**
     * Reads Trimed cmap table.
     */
    TtfReader.prototype.readTrimmedCmapTable = function (subTable, encoding) {
        var tableInfo = this.getTable('cmap');
        this.offset = tableInfo.offset + subTable.offset;
        var table = new TtfTrimmedCmapSubTable();
        table.format = this.readUInt16(this.offset);
        table.length = this.readUInt16(this.offset);
        table.version = this.readUInt16(this.offset);
        table.firstCode = this.readUInt16(this.offset);
        table.entryCount = this.readUInt16(this.offset);
        for (var i = 0; i < table.entryCount; ++i) {
            var glyphInfo = new TtfGlyphInfo();
            glyphInfo.index = this.readUInt16(this.offset);
            glyphInfo.width = this.getWidth(glyphInfo.index);
            glyphInfo.charCode = i + table.firstCode;
            this.macintosh.setValue(i, glyphInfo);
            this.addGlyph(glyphInfo, encoding);
            // NOTE: this code fixes char codes that extends 0x100. However, it might corrupt something.
            this.maxMacIndex = Math.max(i, this.maxMacIndex);
        }
    };
    TtfReader.prototype.initializeFontName = function (nameTable) {
        for (var i = 0; i < nameTable.recordsCount; i++) {
            var record = nameTable.nameRecords[i];
            if (record.nameID === 1) {
                //font family
                this.metrics.fontFamily = record.name;
            }
            else if (record.nameID === 6) {
                //post script name
                this.metrics.postScriptName = record.name;
            }
            /* tslint:disable */
            if (this.metrics.fontFamily !== null && this.metrics.fontFamily !== undefined && this.metrics.postScriptName !== null && this.metrics.postScriptName !== undefined) {
                break;
            }
            /* tslint:disable */
        }
    };
    TtfReader.prototype.getTable = function (name) {
        // if (name === null) {
        //     throw new Error('Argument Null Exception : name');
        // }
        var table = new TtfTableInfo();
        var obj;
        if (this.tableDirectory.containsKey(name)) {
            obj = this.tableDirectory.getValue(name);
        }
        if (obj !== null && obj !== undefined) {
            table = obj;
        }
        return table;
    };
    /**
     * Returns width of the glyph.
     */
    TtfReader.prototype.getWidth = function (glyphCode) {
        glyphCode = (glyphCode < this.width.length) ? glyphCode : this.width.length - 1;
        return this.width[glyphCode];
    };
    /**
     * Gets CMAP encoding based on platform ID and encoding ID.
     */
    /* tslint:disable */
    TtfReader.prototype.getCmapEncoding = function (platformID, encodingID) {
        var format = TtfCmapEncoding.Unknown;
        if (platformID == TtfPlatformID.Microsoft && encodingID == TtfMicrosoftEncodingID.Undefined) {
            // When building a symbol font for Windows,
            // the platform ID should be 3 and the encoding ID should be 0.
            format = TtfCmapEncoding.Symbol;
        }
        else if (platformID == TtfPlatformID.Microsoft && encodingID == TtfMicrosoftEncodingID.Unicode) {
            // When building a Unicode font for Windows,
            // the platform ID should be 3 and the encoding ID should be 1.
            format = TtfCmapEncoding.Unicode;
        }
        else if (platformID == TtfPlatformID.Macintosh && encodingID == TtfMacintoshEncodingID.Roman) {
            // When building a font that will be used on the Macintosh,
            // the platform ID should be 1 and the encoding ID should be 0.
            format = TtfCmapEncoding.Macintosh;
        }
        return format;
    };
    /* tslint:enable */
    /**
     * Adds glyph to the collection.
     */
    TtfReader.prototype.addGlyph = function (glyph, encoding) {
        var collection = null;
        switch (encoding) {
            case TtfCmapEncoding.Unicode:
                collection = this.microsoftGlyphs;
                break;
            case TtfCmapEncoding.Macintosh:
            case TtfCmapEncoding.Symbol:
                collection = this.macintoshGlyphs;
                break;
        }
        collection.setValue(glyph.index, glyph);
    };
    /**
     * Initializes metrics.
     */
    /* tslint:disable */
    TtfReader.prototype.initializeMetrics = function (nameTable, headTable, horizontalHeadTable, os2Table, postTable, cmapTables) {
        /* tslint:enable */
        // if (cmapTables === null) {
        //     throw new Error('ArgumentNullException : cmapTables');
        // }
        this.initializeFontName(nameTable);
        // Get font encoding.
        var bSymbol = false;
        for (var i = 0; i < cmapTables.length; i++) {
            var subTable = cmapTables[i];
            var encoding = this.getCmapEncoding(subTable.platformID, subTable.encodingID);
            if (encoding === TtfCmapEncoding.Symbol) {
                bSymbol = true;
                break;
            }
        }
        this.metrics.isSymbol = bSymbol;
        this.metrics.macStyle = headTable.macStyle;
        this.metrics.isFixedPitch = (postTable.isFixedPitch !== 0);
        this.metrics.italicAngle = postTable.italicAngle;
        var factor = 1000 / headTable.unitsPerEm;
        this.metrics.winAscent = os2Table.sTypoAscender * factor;
        this.metrics.macAscent = horizontalHeadTable.ascender * factor;
        //m_metrics.MacAscent = os2Table.UsWinAscent * factor;
        // NOTE: This is stange workaround. The value is good if os2Table.SCapHeight != 0, otherwise it should be properly computed.
        this.metrics.capHeight = (os2Table.sCapHeight !== 0) ? os2Table.sCapHeight : 0.7 * headTable.unitsPerEm * factor;
        this.metrics.winDescent = os2Table.sTypoDescender * factor;
        this.metrics.macDescent = horizontalHeadTable.descender * factor;
        //m_metrics.MacDescent = -os2Table.UsWinDescent * factor;
        this.metrics.leading = (os2Table.sTypoAscender - os2Table.sTypoDescender + os2Table.sTypoLineGap) * factor;
        this.metrics.lineGap = Math.ceil(horizontalHeadTable.lineGap * factor);
        var left = headTable.xMin * factor;
        var top = Math.ceil(this.metrics.macAscent + this.metrics.lineGap);
        var right = headTable.xMax * factor;
        var bottom = this.metrics.macDescent;
        this.metrics.fontBox = new Rectangle(left, top, right, bottom);
        // NOTE: Strange!
        this.metrics.stemV = 80;
        this.metrics.widthTable = this.updateWidth();
        this.metrics.contains = this.tableDirectory.containsKey('CFF');
        this.metrics.subScriptSizeFactor = headTable.unitsPerEm / os2Table.ySubscriptYSize;
        this.metrics.superscriptSizeFactor = headTable.unitsPerEm / os2Table.ySuperscriptYSize;
    };
    /**
     * Updates chars structure which is used in the case of ansi encoding (256 bytes).
     */
    TtfReader.prototype.updateWidth = function () {
        var count = 256;
        var bytes = [];
        if (this.metrics.isSymbol) {
            for (var i = 0; i < count; i++) {
                var glyphInfo = this.getGlyph(String.fromCharCode(i));
                bytes[i] = (glyphInfo.empty) ? 0 : glyphInfo.width;
            }
        }
        else {
            var byteToProcess = [];
            var unknown = '?';
            var space = String.fromCharCode(32);
            for (var i = 0; i < count; i++) {
                byteToProcess[0] = i;
                var text = this.getString(byteToProcess, 0, byteToProcess.length);
                var ch = (text.length > 0) ? text[0] : unknown;
                var glyphInfo = this.getGlyph(ch);
                if (!glyphInfo.empty) {
                    bytes[i] = glyphInfo.width;
                }
                else {
                    glyphInfo = this.getGlyph(space);
                    bytes[i] = (glyphInfo.empty) ? 0 : glyphInfo.width;
                }
            }
        }
        return bytes;
    };
    /**
     * Returns default glyph.
     */
    TtfReader.prototype.getDefaultGlyph = function () {
        var glyph = this.getGlyph(StringTokenizer.whiteSpace);
        return glyph;
    };
    /**
     * Reads unicode string from byte array.
     */
    TtfReader.prototype.getString = function (byteToProcess, start, length) {
        var result = '';
        for (var index = 0; index < length; index++) {
            result += String.fromCharCode(byteToProcess[index + start]);
        }
        return result;
    };
    /**
     * Reads loca table.
     */
    TtfReader.prototype.readLocaTable = function (bShort) {
        var tableInfo = this.getTable('loca');
        this.offset = tableInfo.offset;
        var table = new TtfLocaTable();
        var buffer = null;
        if (bShort) {
            var len = tableInfo.length / 2;
            buffer = [];
            for (var i = 0; i < len; i++) {
                buffer[i] = this.readUInt16(this.offset) * 2;
            }
        }
        else {
            var len = tableInfo.length / 4;
            buffer = [];
            for (var i = 0; i < len; i++) {
                buffer[i] = this.readUInt32(this.offset);
            }
        }
        table.offsets = buffer;
        return table;
    };
    /**
     * Updates hash table of used glyphs.
     */
    TtfReader.prototype.updateGlyphChars = function (glyphChars, locaTable) {
        // if (glyphChars === null) {
        //     throw new Error('Argument Null Exception : glyphChars');
        // }
        // Add zero key.
        if (!glyphChars.containsKey(0)) {
            glyphChars.setValue(0, 0);
        }
        var clone = new Dictionary();
        var glyphCharKeys = glyphChars.keys();
        for (var i = 0; i < glyphCharKeys.length; i++) {
            clone.setValue(glyphCharKeys[i], glyphChars.getValue(glyphCharKeys[i]));
        }
        for (var i = 0; i < glyphCharKeys.length; i++) {
            var nextKey = glyphCharKeys[i];
            this.processCompositeGlyph(glyphChars, nextKey, locaTable);
        }
    };
    /**
     * Checks if glyph is composite or not.
     */
    TtfReader.prototype.processCompositeGlyph = function (glyphChars, glyph, locaTable) {
        // if (glyphChars === null) {
        //     throw new Error('Argument Null Exception : glyphChars');
        // }
        // Is in range.
        if (glyph < locaTable.offsets.length - 1) {
            var glyphOffset = locaTable.offsets[glyph];
            if (glyphOffset !== locaTable.offsets[glyph + 1]) {
                var tableInfo = this.getTable('glyf');
                this.offset = tableInfo.offset + glyphOffset;
                var glyphHeader = new TtfGlyphHeader();
                glyphHeader.numberOfContours = this.readInt16(this.offset);
                glyphHeader.xMin = this.readInt16(this.offset);
                glyphHeader.yMin = this.readInt16(this.offset);
                glyphHeader.xMax = this.readInt16(this.offset);
                glyphHeader.yMax = this.readInt16(this.offset);
                // Glyph is composite.
                if (glyphHeader.numberOfContours < 0) {
                    var skipBytes = 0;
                    var entry = true;
                    while (entry) {
                        var flags = this.readUInt16(this.offset);
                        var glyphIndex = this.readUInt16(this.offset);
                        if (!glyphChars.containsKey(glyphIndex)) {
                            glyphChars.setValue(glyphIndex, 0);
                        }
                        if ((flags & TtfCompositeGlyphFlags.MoreComponents) === 0) {
                            break;
                        }
                        skipBytes = ((flags & TtfCompositeGlyphFlags.Arg1And2AreWords) !== 0) ? 4 : 2;
                        if ((flags & TtfCompositeGlyphFlags.WeHaveScale) !== 0) {
                            skipBytes += 2;
                        }
                        else if ((flags & TtfCompositeGlyphFlags.WeHaveAnXyScale) !== 0) {
                            skipBytes += 4;
                        }
                        else if ((flags & TtfCompositeGlyphFlags.WeHaveTwoByTwo) !== 0) {
                            skipBytes += 2 * 4;
                        }
                        this.offset += skipBytes;
                    }
                }
            }
        }
    };
    /**
     * Creates new glyph tables based on chars that are used for output.
     */
    /* tslint:disable */
    TtfReader.prototype.generateGlyphTable = function (glyphChars, locaTable, newLocaTable, newGlyphTable) {
        /* tslint:enable */
        // if (glyphChars === null) {
        //     throw new Error('Argument Null Exception : glyphChars');
        // }
        newLocaTable = [];
        // Sorting used glyphs keys.
        var activeGlyphs = glyphChars.keys();
        activeGlyphs.sort(function (a, b) { return a - b; });
        var glyphSize = 0;
        for (var i = 0; i < activeGlyphs.length; i++) {
            var glyphIndex = activeGlyphs[i];
            if (locaTable.offsets.length > 0) {
                glyphSize += locaTable.offsets[glyphIndex + 1] - locaTable.offsets[glyphIndex];
            }
        }
        var glyphSizeAligned = this.align(glyphSize);
        newGlyphTable = [];
        for (var i = 0; i < glyphSizeAligned; i++) {
            newGlyphTable.push(0);
        }
        var nextGlyphOffset = 0;
        var nextGlyphIndex = 0;
        var table = this.getTable('glyf');
        // Creating NewLocaTable - that would hold offsets for filtered glyphs.
        for (var i = 0; i < locaTable.offsets.length; i++) {
            newLocaTable.push(nextGlyphOffset);
            if (nextGlyphIndex < activeGlyphs.length && activeGlyphs[nextGlyphIndex] === i) {
                ++nextGlyphIndex;
                newLocaTable[i] = nextGlyphOffset;
                var oldGlyphOffset = locaTable.offsets[i];
                var oldNextGlyphOffset = locaTable.offsets[i + 1] - oldGlyphOffset;
                if (oldNextGlyphOffset > 0) {
                    this.offset = table.offset + oldGlyphOffset;
                    var result = this.read(newGlyphTable, nextGlyphOffset, oldNextGlyphOffset);
                    newGlyphTable = result.buffer;
                    nextGlyphOffset += oldNextGlyphOffset;
                }
            }
        }
        return { glyphTableSize: glyphSize, newLocaTable: newLocaTable, newGlyphTable: newGlyphTable };
    };
    /**
     * Updates new Loca table.
     */
    /* tslint:disable */
    TtfReader.prototype.updateLocaTable = function (newLocaTable, bLocaIsShort, newLocaTableOut) {
        /* tslint:enable */
        if (newLocaTable === null) {
            throw new Error('Argument Null Exception : newLocaTable');
        }
        var size = (bLocaIsShort) ? newLocaTable.length * 2 : newLocaTable.length * 4;
        var count = this.align(size);
        //BigEndianWiter
        var writer = new BigEndianWriter(count);
        for (var i = 0; i < newLocaTable.length; i++) {
            var value = newLocaTable[i];
            if (bLocaIsShort) {
                value /= 2;
                writer.writeShort(value);
            }
            else {
                writer.writeInt(value);
            }
        }
        return { newLocaUpdated: writer.data, newLocaSize: size };
    };
    /**
     * Aligns number to be divisible on 4.
     */
    TtfReader.prototype.align = function (value) {
        return (value + 3) & (~3);
    };
    /**
     * Returns font program data.
     */
    /* tslint:disable */
    TtfReader.prototype.getFontProgram = function (newLocaTableOut, newGlyphTable, glyphTableSize, locaTableSize) {
        /* tslint:enable */
        if (newLocaTableOut === null) {
            throw new Error('Argument Null Exception : newLocaTableOut');
        }
        if (newGlyphTable === null) {
            throw new Error('Argument Null Exception : newGlyphTable');
        }
        var tableNames = this.tableNames;
        var result = this.getFontProgramLength(newLocaTableOut, newGlyphTable, 0);
        var fontProgramLength = result.fontProgramLength;
        var numTables = result.numTables;
        var writer = new BigEndianWriter(fontProgramLength);
        writer.writeInt(0x10000);
        writer.writeShort(numTables);
        var entrySelector = this.entrySelectors[numTables];
        writer.writeShort((1 << (entrySelector & 31)) * 16);
        writer.writeShort(entrySelector);
        writer.writeShort((numTables - (1 << (entrySelector & 31))) * 16);
        // Writing to destination buffer - checksums && sizes of used tables.
        this.writeCheckSums(writer, numTables, newLocaTableOut, newGlyphTable, glyphTableSize, locaTableSize);
        // // Writing to destination buffer - used glyphs.
        this.writeGlyphs(writer, newLocaTableOut, newGlyphTable);
        return writer.data;
    };
    /* tslint:disable */
    TtfReader.prototype.getFontProgramLength = function (newLocaTableOut, newGlyphTable, numTables) {
        /* tslint:enable */
        if (newLocaTableOut === null) {
            throw new Error('Argument Null Exception : newLocaTableOut');
        }
        if (newGlyphTable === null) {
            throw new Error('Argument Null Exception : newGlyphTable');
        }
        // glyf and loca are used by default;
        numTables = 2;
        var tableNames = this.tableNames;
        var fontProgramLength = 0;
        for (var i = 0; i < tableNames.length; i++) {
            var tableName = tableNames[i];
            if (tableName !== 'glyf' && tableName !== 'loca') {
                var table = this.getTable(tableName);
                if (!table.empty) {
                    ++numTables;
                    fontProgramLength += this.align(table.length);
                }
            }
        }
        fontProgramLength += newLocaTableOut.length;
        fontProgramLength += newGlyphTable.length;
        var usedTablesSize = numTables * 16 + (3 * 4);
        fontProgramLength += usedTablesSize;
        return { fontProgramLength: fontProgramLength, numTables: numTables };
    };
    /**
     * Writing to destination buffer - checksums and sizes of used tables.
     */
    /* tslint:disable */
    TtfReader.prototype.writeCheckSums = function (writer, numTables, newLocaTableOut, newGlyphTable, glyphTableSize, locaTableSize) {
        /* tslint:enable */
        if (writer === null) {
            throw new Error('Argument Null Exception : writer');
        }
        if (newLocaTableOut === null) {
            throw new Error('Argument Null Exception : newLocaTableOut');
        }
        if (newGlyphTable === null) {
            throw new Error('Argument Null Exception : newGlyphTable');
        }
        var tableNames = this.tableNames;
        var usedTablesSize = numTables * 16 + (3 * 4);
        var nextTableSize = 0;
        for (var i = 0; i < tableNames.length; i++) {
            var tableName = tableNames[i];
            var tableInfo = this.getTable(tableName);
            if (tableInfo.empty) {
                continue;
            }
            writer.writeString(tableName);
            if (tableName === 'glyf') {
                var checksum = this.calculateCheckSum(newGlyphTable);
                writer.writeInt(checksum);
                nextTableSize = glyphTableSize;
            }
            else if (tableName === 'loca') {
                var checksum = this.calculateCheckSum(newLocaTableOut);
                writer.writeInt(checksum);
                nextTableSize = locaTableSize;
            }
            else {
                writer.writeInt(tableInfo.checksum);
                nextTableSize = tableInfo.length;
            }
            writer.writeUInt(usedTablesSize);
            writer.writeUInt(nextTableSize);
            usedTablesSize += this.align(nextTableSize);
        }
    };
    /**
     * Gets checksum from source buffer.
     */
    TtfReader.prototype.calculateCheckSum = function (bytes) {
        if (bytes === null) {
            throw new Error('Argument Null Exception : bytes');
        }
        var pos = 0;
        var byte1 = 0;
        var byte2 = 0;
        var byte3 = 0;
        var byte4 = 0;
        for (var i = 0; i < (bytes.length + 1) / 4; i++) {
            byte4 += (bytes[pos++] & 255);
            byte3 += (bytes[pos++] & 255);
            byte2 += (bytes[pos++] & 255);
            byte1 += (bytes[pos++] & 255);
        }
        var result = byte1;
        result += (byte2 << 8);
        result += (byte3 << 16);
        result += (byte4 << 24);
        return result;
    };
    /**
     * Writing to destination buffer - used glyphs.
     */
    TtfReader.prototype.writeGlyphs = function (writer, newLocaTable, newGlyphTable) {
        if (writer === null) {
            throw new Error('Argument Null Exception : writer');
        }
        if (newLocaTable === null) {
            throw new Error('Argument Null Exception : newLocaTableOut');
        }
        if (newGlyphTable === null) {
            throw new Error('Argument Null Exception : newGlyphTable');
        }
        var tableNames = this.tableNames;
        for (var i = 0; i < tableNames.length; i++) {
            var tableName = tableNames[i];
            var tableInfo = this.getTable(tableName);
            if (tableInfo.empty) {
                continue;
            }
            if (tableName === 'glyf') {
                writer.writeBytes(newGlyphTable);
            }
            else if (tableName === 'loca') {
                writer.writeBytes(newLocaTable);
            }
            else {
                var count = this.align(tableInfo.length);
                var buff = [];
                for (var i_1 = 0; i_1 < count; i_1++) {
                    buff.push(0);
                }
                this.offset = tableInfo.offset;
                var result = this.read(buff, 0, tableInfo.length);
                writer.writeBytes(result.buffer);
            }
        }
    };
    //public methods
    /**
     * Sets position value of font data.
     */
    TtfReader.prototype.setOffset = function (offset) {
        this.offset = offset;
    };
    /**
     * Creates font Internals
     * @private
     */
    TtfReader.prototype.createInternals = function () {
        this.metrics = new TtfMetrics();
        var nameTable = this.readNameTable();
        var headTable = this.readHeadTable();
        this.bIsLocaShort = (headTable.indexToLocalFormat === 0);
        var horizontalHeadTable = this.readHorizontalHeaderTable();
        var os2Table = this.readOS2Table();
        var postTable = this.readPostTable();
        this.width = this.readWidthTable(horizontalHeadTable.numberOfHMetrics, headTable.unitsPerEm);
        var subTables = this.readCmapTable();
        this.initializeMetrics(nameTable, headTable, horizontalHeadTable, os2Table, postTable, subTables);
    };
    TtfReader.prototype.getGlyph = function (charCode) {
        if (typeof charCode === 'number') {
            var obj1 = null;
            if (!this.metrics.isSymbol && this.microsoftGlyphs != null) {
                if (this.microsoftGlyphs.containsKey(charCode)) {
                    obj1 = this.microsoftGlyphs.getValue(charCode);
                }
            }
            else if (this.metrics.isSymbol && this.macintoshGlyphs != null) {
                if (this.macintoshGlyphs.containsKey(charCode)) {
                    obj1 = this.macintoshGlyphs.getValue(charCode);
                }
            }
            var glyph = (obj1 != null) ? obj1 : this.getDefaultGlyph();
            return glyph;
        }
        else {
            var obj = null;
            var code = charCode.charCodeAt(0);
            if (!this.metrics.isSymbol && this.microsoft !== null) {
                if (this.microsoft.containsKey(code)) {
                    obj = this.microsoft.getValue(code);
                    if (code !== StringTokenizer.whiteSpace.charCodeAt(0)) {
                        this.isFontPresent = true;
                    }
                }
                else if (code !== StringTokenizer.whiteSpace.charCodeAt(0)) {
                    this.isFontPresent = false;
                }
            }
            else if (this.metrics.isSymbol && this.macintosh !== null || this.isMacTTF) {
                // NOTE: this code fixes char codes that extends 0x100. However, it might corrupt something.
                if (this.maxMacIndex !== 0) {
                    code %= this.maxMacIndex + 1;
                }
                else {
                    code = ((code & 0xff00) === 0xf000 ? code & 0xff : code);
                }
                if (this.macintosh.containsKey(code)) {
                    obj = this.macintosh.getValue(code);
                    this.isFontPresent = true;
                }
            }
            // Fix for StackOverFlow exception in XPS to PDF converter
            if (charCode === StringTokenizer.whiteSpace && obj === null) {
                obj = new TtfGlyphInfo();
            }
            var glyph = (obj !== null) ? obj : this.getDefaultGlyph();
            return glyph;
        }
    };
    /**
     * Gets hash table with chars indexed by glyph index.
     */
    TtfReader.prototype.getGlyphChars = function (chars) {
        if (chars === null || chars === undefined) {
            throw new Error('Argument Null Exception : chars');
        }
        var dictionary = new Dictionary();
        var charKeys = chars.keys();
        for (var i = 0; i < charKeys.length; i++) {
            var ch = charKeys[i];
            var glyph = this.getGlyph(ch);
            if (!glyph.empty) {
                dictionary.setValue(glyph.index, ch.charCodeAt(0));
            }
        }
        return dictionary;
    };
    /**
     * Gets all glyphs.
     */
    TtfReader.prototype.getAllGlyphs = function () {
        var allGlyphInfo = [];
        var info = new TtfGlyphInfo();
        var index = 0;
        for (var i = 0; i < this.width.length; i++) {
            var width = this.width[i];
            info.index = index;
            info.width = width;
            allGlyphInfo.push(info);
            index++;
        }
        return allGlyphInfo;
    };
    /**
     * Reads a font's program.
     * @private
     */
    TtfReader.prototype.readFontProgram = function (chars) {
        var glyphChars = this.getGlyphChars(chars);
        var locaTable = this.readLocaTable(this.bIsLocaShort);
        if (glyphChars.size() < chars.size()) {
            this.missedGlyphs = chars.size() - glyphChars.size();
        }
        this.updateGlyphChars(glyphChars, locaTable);
        /* tslint:disable */
        var result1 = this.generateGlyphTable(glyphChars, locaTable, null, null);
        /* tslint:enable */
        var glyphTableSize = result1.glyphTableSize;
        var newLocaTable = result1.newLocaTable;
        var newGlyphTable = result1.newGlyphTable;
        var result2 = this.updateLocaTable(newLocaTable, this.bIsLocaShort, null);
        var newLocaSize = result2.newLocaSize;
        var newLocaUpdated = result2.newLocaUpdated;
        var fontProgram = this.getFontProgram(newLocaUpdated, newGlyphTable, glyphTableSize, newLocaSize);
        return fontProgram;
    };
    /**
     * Reconverts string to be in proper format saved into PDF file.
     */
    TtfReader.prototype.convertString = function (text) {
        if (text === null) {
            throw new Error('Argument Null Exception : text');
        }
        var glyph = '';
        var i = 0;
        for (var k = 0; k < text.length; k++) {
            var ch = text[k];
            var glyphInfo = this.getGlyph(ch);
            if (!glyphInfo.empty) {
                glyph += String.fromCharCode(glyphInfo.index);
                i++;
            }
        }
        return glyph;
    };
    /**
     * Gets char width.
     */
    TtfReader.prototype.getCharWidth = function (code) {
        var glyphInfo = this.getGlyph(code);
        glyphInfo = (!glyphInfo.empty) ? glyphInfo : this.getDefaultGlyph();
        var codeWidth = (!glyphInfo.empty) ? glyphInfo.width : 0;
        return codeWidth;
    };
    TtfReader.prototype.readString = function (length, isUnicode) {
        if (isUnicode === undefined) {
            return this.readString(length, false);
        }
        else {
            //let buffer : number[] = this.readBytes(length);
            var result = '';
            if (isUnicode) {
                for (var i = 0; i < length; i++) {
                    if (i % 2 !== 0) {
                        result += String.fromCharCode(this.fontData[this.offset]);
                    }
                    this.offset += 1;
                }
            }
            else {
                for (var i = 0; i < length; i++) {
                    result += String.fromCharCode(this.fontData[this.offset]);
                    this.offset += 1;
                }
            }
            return result;
        }
    };
    TtfReader.prototype.readFixed = function (offset) {
        var integer = this.readInt16(offset);
        var sFraction = this.readInt16(offset + 2);
        var fraction = sFraction / 16384;
        return integer + fraction;
    };
    TtfReader.prototype.readInt32 = function (offset) {
        var i1 = this.fontData[offset + 3];
        var i2 = this.fontData[offset + 2];
        var i3 = this.fontData[offset + 1];
        var i4 = this.fontData[offset];
        this.offset += 4;
        return i1 + (i2 << 8) + (i3 << 16) + (i4 << 24);
    };
    TtfReader.prototype.readUInt32 = function (offset) {
        var i1 = this.fontData[offset + 3];
        var i2 = this.fontData[offset + 2];
        var i3 = this.fontData[offset + 1];
        var i4 = this.fontData[offset];
        this.offset += 4;
        return (i1 | i2 << 8 | i3 << 16 | i4 << 24);
    };
    // private readInt16(offset : number) : number {
    //     let result : number = (this.fontData[offset] << 8) + this.fontData[offset + 1];
    //     this.offset += 2;
    //     return result;
    // }
    TtfReader.prototype.readInt16 = function (offset) {
        var result = (this.fontData[offset] << 8) + this.fontData[offset + 1];
        result = result & (1 << 15) ? result - 0x10000 : result;
        this.offset += 2;
        return result;
    };
    TtfReader.prototype.readInt64 = function (offset) {
        var low = this.readInt32(offset + 4);
        var n = this.readInt32(offset) * 4294967296.0 + low;
        if (low < 0) {
            n += 4294967296;
        }
        return n;
    };
    TtfReader.prototype.readUInt16 = function (offset) {
        var result = (this.fontData[offset] << 8) | this.fontData[offset + 1];
        this.offset += 2;
        return result;
    };
    /**
     * Reads ushort array.
     */
    TtfReader.prototype.readUshortArray = function (length) {
        var buffer = [];
        for (var i = 0; i < length; i++) {
            buffer[i] = this.readUInt16(this.offset);
        }
        return buffer;
    };
    TtfReader.prototype.readBytes = function (length) {
        var result = [];
        for (var i = 0; i < length; i++) {
            result.push(this.fontData[this.offset]);
            this.offset += 1;
        }
        return result;
    };
    TtfReader.prototype.readByte = function (offset) {
        var result = this.fontData[offset];
        this.offset += 1;
        return result;
    };
    /**
     * Reads bytes to array in BigEndian order.
     * @private
     */
    TtfReader.prototype.read = function (buffer, index, count) {
        if (buffer === null) {
            throw new Error('Argument Null Exception : buffer');
        }
        var written = 0;
        var read = 0;
        do {
            for (var i = 0; (i < count - written) && (this.offset + i < this.fontData.length); i++) {
                buffer[index + i] = this.fontData[this.offset + i];
            }
            read = count - written;
            this.offset += read;
            written += read;
        } while (written < count);
        return { buffer: buffer, written: written };
    };
    return TtfReader;
}());
export { TtfReader };
