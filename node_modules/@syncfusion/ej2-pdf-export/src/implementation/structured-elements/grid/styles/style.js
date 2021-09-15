var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { PdfBorders, PdfPaddings } from './pdf-borders';
import { PdfBorderOverlapStyle } from './../../tables/light-tables/enum';
/**
 * Base class for the `grid style`,
 */
var PdfGridStyleBase = /** @class */ (function () {
    function PdfGridStyleBase() {
    }
    Object.defineProperty(PdfGridStyleBase.prototype, "backgroundBrush", {
        // Properties
        /**
         * Gets or sets the `background brush`.
         * @private
         */
        get: function () {
            return this.gridBackgroundBrush;
        },
        set: function (value) {
            this.gridBackgroundBrush = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridStyleBase.prototype, "textBrush", {
        /**
         * Gets or sets the `text brush`.
         * @private
         */
        get: function () {
            return this.gridTextBrush;
        },
        set: function (value) {
            this.gridTextBrush = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridStyleBase.prototype, "textPen", {
        /**
         * Gets or sets the `text pen`.
         * @private
         */
        get: function () {
            return this.gridTextPen;
        },
        set: function (value) {
            this.gridTextPen = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridStyleBase.prototype, "font", {
        /**
         * Gets or sets the `font`.
         * @private
         */
        get: function () {
            return this.gridFont;
        },
        set: function (value) {
            this.gridFont = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridStyleBase.prototype, "backgroundImage", {
        /**
         * Gets or sets the `background Image`.
         * @private
         */
        get: function () {
            return this.gridBackgroundImage;
        },
        set: function (value) {
            this.gridBackgroundImage = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfGridStyleBase;
}());
export { PdfGridStyleBase };
/**
 * `PdfGridStyle` class provides customization of the appearance for the 'PdfGrid'.
 */
var PdfGridStyle = /** @class */ (function (_super) {
    __extends(PdfGridStyle, _super);
    //constructor
    /**
     * Initialize a new instance for `PdfGridStyle` class.
     * @private
     */
    function PdfGridStyle() {
        var _this = _super.call(this) || this;
        _this.gridBorderOverlapStyle = PdfBorderOverlapStyle.Overlap;
        _this.bAllowHorizontalOverflow = false;
        _this.gridHorizontalOverflowType = PdfHorizontalOverflowType.LastPage;
        return _this;
    }
    Object.defineProperty(PdfGridStyle.prototype, "cellSpacing", {
        //Properties
        /**
         * Gets or sets the `cell spacing` of the 'PdfGrid'.
         * @private
         */
        get: function () {
            if (typeof this.gridCellSpacing === 'undefined') {
                this.gridCellSpacing = 0;
            }
            return this.gridCellSpacing;
        },
        set: function (value) {
            this.gridCellSpacing = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridStyle.prototype, "horizontalOverflowType", {
        /**
         * Gets or sets the type of the `horizontal overflow` of the 'PdfGrid'.
         * @private
         */
        get: function () {
            return this.gridHorizontalOverflowType;
        },
        set: function (value) {
            this.gridHorizontalOverflowType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridStyle.prototype, "allowHorizontalOverflow", {
        /**
         * Gets or sets a value indicating whether to `allow horizontal overflow`.
         * @private
         */
        get: function () {
            return this.bAllowHorizontalOverflow;
        },
        set: function (value) {
            this.bAllowHorizontalOverflow = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridStyle.prototype, "cellPadding", {
        /**
         * Gets or sets the `cell padding`.
         * @private
         */
        get: function () {
            if (typeof this.gridCellPadding === 'undefined') {
                this.gridCellPadding = new PdfPaddings();
            }
            return this.gridCellPadding;
        },
        set: function (value) {
            if (typeof this.gridCellPadding === 'undefined') {
                this.gridCellPadding = new PdfPaddings();
                this.gridCellPadding = value;
            }
            else {
                this.gridCellPadding = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridStyle.prototype, "borderOverlapStyle", {
        /**
         * Gets or sets the `border overlap style` of the 'PdfGrid'.
         * @private
         */
        get: function () {
            return this.gridBorderOverlapStyle;
        },
        set: function (value) {
            this.gridBorderOverlapStyle = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfGridStyle;
}(PdfGridStyleBase));
export { PdfGridStyle };
/**
 * `PdfGridCellStyle` class provides customization of the appearance for the 'PdfGridCell'.
 */
var PdfGridCellStyle = /** @class */ (function (_super) {
    __extends(PdfGridCellStyle, _super);
    /**
     * Initializes a new instance of the `PdfGridCellStyle` class.
     * @private
     */
    function PdfGridCellStyle() {
        var _this = _super.call(this) || this;
        /**
         * @hidden
         * @private
         */
        _this.gridCellBorders = PdfBorders.default;
        return _this;
    }
    Object.defineProperty(PdfGridCellStyle.prototype, "stringFormat", {
        //Properties
        /**
         * Gets the `string format` of the 'PdfGridCell'.
         * @private
         */
        get: function () {
            return this.format;
        },
        set: function (value) {
            this.format = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCellStyle.prototype, "borders", {
        /**
         * Gets or sets the `border` of the 'PdfGridCell'.
         * @private
         */
        get: function () {
            return this.gridCellBorders;
        },
        set: function (value) {
            this.gridCellBorders = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCellStyle.prototype, "cellPadding", {
        /**
         * Gets or sets the `cell padding`.
         * @private
         */
        get: function () {
            return this.gridCellPadding;
        },
        set: function (value) {
            if (this.gridCellPadding == null || typeof this.gridCellPadding === 'undefined') {
                this.gridCellPadding = new PdfPaddings();
            }
            this.gridCellPadding = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfGridCellStyle;
}(PdfGridStyleBase));
export { PdfGridCellStyle };
/**
 * `PdfGridRowStyle` class provides customization of the appearance for the `PdfGridRow`.
 */
var PdfGridRowStyle = /** @class */ (function () {
    // Constructor
    /**
     * Initializes a new instance of the `PdfGridRowStyle` class.
     * @private
     */
    function PdfGridRowStyle() {
        //
    }
    Object.defineProperty(PdfGridRowStyle.prototype, "backgroundBrush", {
        // Properties
        /**
         * Gets or sets the `background brush`.
         * @private
         */
        get: function () {
            return this.gridRowBackgroundBrush;
        },
        enumerable: true,
        configurable: true
    });
    PdfGridRowStyle.prototype.setBackgroundBrush = function (value) {
        this.gridRowBackgroundBrush = value;
        if (typeof this.parent !== 'undefined') {
            for (var i = 0; i < this.parent.cells.count; i++) {
                this.parent.cells.getCell(i).style.backgroundBrush = value;
            }
        }
    };
    Object.defineProperty(PdfGridRowStyle.prototype, "textBrush", {
        /**
         * Gets or sets the `text brush`.
         * @private
         */
        get: function () {
            return this.gridRowTextBrush;
        },
        enumerable: true,
        configurable: true
    });
    PdfGridRowStyle.prototype.setTextBrush = function (value) {
        this.gridRowTextBrush = value;
        if (typeof this.parent !== 'undefined') {
            for (var i = 0; i < this.parent.cells.count; i++) {
                this.parent.cells.getCell(i).style.textBrush = value;
            }
        }
    };
    Object.defineProperty(PdfGridRowStyle.prototype, "textPen", {
        /**
         * Gets or sets the `text pen`.
         * @private
         */
        get: function () {
            return this.gridRowTextPen;
        },
        enumerable: true,
        configurable: true
    });
    PdfGridRowStyle.prototype.setTextPen = function (value) {
        this.gridRowTextPen = value;
        if (typeof this.parent !== 'undefined') {
            for (var i = 0; i < this.parent.cells.count; i++) {
                this.parent.cells.getCell(i).style.textPen = value;
            }
        }
    };
    Object.defineProperty(PdfGridRowStyle.prototype, "font", {
        /**
         * Gets or sets the `font`.
         * @private
         */
        get: function () {
            return this.gridRowFont;
        },
        enumerable: true,
        configurable: true
    });
    PdfGridRowStyle.prototype.setFont = function (value) {
        this.gridRowFont = value;
        if (typeof this.parent !== 'undefined') {
            for (var i = 0; i < this.parent.cells.count; i++) {
                this.parent.cells.getCell(i).style.font = value;
            }
        }
    };
    Object.defineProperty(PdfGridRowStyle.prototype, "border", {
        /**
         * Gets or sets the `border` of the current row.
         * @private
         */
        get: function () {
            if (typeof this.gridRowBorder === 'undefined') {
                this.setBorder(new PdfBorders());
            }
            return this.gridRowBorder;
        },
        enumerable: true,
        configurable: true
    });
    PdfGridRowStyle.prototype.setBorder = function (value) {
        this.gridRowBorder = value;
        if (typeof this.parent !== 'undefined') {
            for (var i = 0; i < this.parent.cells.count; i++) {
                this.parent.cells.getCell(i).style.borders = value;
            }
        }
    };
    /**
     * sets the `parent row` of the current object.
     * @private
     */
    PdfGridRowStyle.prototype.setParent = function (parent) {
        this.parent = parent;
    };
    Object.defineProperty(PdfGridRowStyle.prototype, "backgroundImage", {
        /**
         * Gets or sets the `backgroundImage` of the 'PdfGridCell'.
         * @private
         */
        get: function () {
            return this.gridRowBackgroundImage;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * sets the `backgroundImage` of the 'PdfGridCell'.
     * @private
     */
    PdfGridRowStyle.prototype.setBackgroundImage = function (value) {
        this.gridRowBackgroundImage = value;
    };
    return PdfGridRowStyle;
}());
export { PdfGridRowStyle };
/**
 * public Enum for `PdfHorizontalOverflowType`.
 * @private
 */
export var PdfHorizontalOverflowType;
(function (PdfHorizontalOverflowType) {
    /**
     * Specifies the type of `NextPage`.
     * @private
     */
    PdfHorizontalOverflowType[PdfHorizontalOverflowType["NextPage"] = 0] = "NextPage";
    /**
     * Specifies the type of `LastPage`.
     * @private
     */
    PdfHorizontalOverflowType[PdfHorizontalOverflowType["LastPage"] = 1] = "LastPage";
})(PdfHorizontalOverflowType || (PdfHorizontalOverflowType = {}));
