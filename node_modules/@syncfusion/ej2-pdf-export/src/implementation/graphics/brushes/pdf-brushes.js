/**
 * PdfBrushes.ts class for EJ2-PDF
 */
import { PdfColor } from './../pdf-color';
import { Dictionary } from './../../collections/dictionary';
import { KnownColor } from './enum';
import { PdfSolidBrush } from './pdf-solid-brush';
/**
 * `PdfBrushes` class provides objects used to fill the interiors of graphical shapes such as rectangles,
 * ellipses, pies, polygons, and paths.
 * @private
 */
var PdfBrushes = /** @class */ (function () {
    function PdfBrushes() {
    }
    Object.defineProperty(PdfBrushes, "AliceBlue", {
        //Static Properties
        /**
         * Gets the AliceBlue brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.AliceBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.AliceBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.AliceBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "AntiqueWhite", {
        /**
         * Gets the antique white brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.AntiqueWhite)) {
                brush = (this.sBrushes.getValue(KnownColor.AntiqueWhite));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.AntiqueWhite);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Aqua", {
        /**
         * Gets the Aqua default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Aqua)) {
                brush = (this.sBrushes.getValue(KnownColor.Aqua));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Aqua);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Aquamarine", {
        /**
         * Gets the Aquamarine default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Aquamarine)) {
                brush = (this.sBrushes.getValue(KnownColor.Aquamarine));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Aquamarine);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Azure", {
        /**
         * Gets the Azure default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Azure)) {
                brush = (this.sBrushes.getValue(KnownColor.Azure));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Azure);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Beige", {
        /**
         * Gets the Beige default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Beige)) {
                brush = (this.sBrushes.getValue(KnownColor.Beige));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Beige);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Bisque", {
        /**
         * Gets the Bisque default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Bisque)) {
                brush = (this.sBrushes.getValue(KnownColor.Bisque));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Bisque);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Black", {
        /**
         * Gets the Black default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Black)) {
                brush = (this.sBrushes.getValue(KnownColor.Black));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Black);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "BlanchedAlmond", {
        /**
         * Gets the BlanchedAlmond default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.BlanchedAlmond)) {
                brush = (this.sBrushes.getValue(KnownColor.BlanchedAlmond));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.BlanchedAlmond);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Blue", {
        /**
         * Gets the Blue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Blue)) {
                brush = (this.sBrushes.getValue(KnownColor.Blue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Blue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "BlueViolet", {
        /**
         * Gets the BlueViolet default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.BlueViolet)) {
                brush = (this.sBrushes.getValue(KnownColor.BlueViolet));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.BlueViolet);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Brown", {
        /**
         * Gets the Brown default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Brown)) {
                brush = (this.sBrushes.getValue(KnownColor.Brown));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Brown);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "BurlyWood", {
        /**
         * Gets the BurlyWood default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.BurlyWood)) {
                brush = (this.sBrushes.getValue(KnownColor.BurlyWood));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.BurlyWood);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "CadetBlue", {
        /**
         * Gets the CadetBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.CadetBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.CadetBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.CadetBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Chartreuse", {
        /**
         * Gets the Chartreuse default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Chartreuse)) {
                brush = (this.sBrushes.getValue(KnownColor.Chartreuse));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Chartreuse);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Chocolate", {
        /**
         * Gets the Chocolate default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Chocolate)) {
                brush = (this.sBrushes.getValue(KnownColor.Chocolate));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Chocolate);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Coral", {
        /**
         * Gets the Coral default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Coral)) {
                brush = (this.sBrushes.getValue(KnownColor.Coral));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Coral);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "CornflowerBlue", {
        /**
         * Gets the CornflowerBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.CornflowerBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.CornflowerBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.CornflowerBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Cornsilk", {
        /**
         * Gets the Corn silk default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Cornsilk)) {
                brush = (this.sBrushes.getValue(KnownColor.Cornsilk));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Cornsilk);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Crimson", {
        /**
         *  Gets the Crimson default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Crimson)) {
                brush = (this.sBrushes.getValue(KnownColor.Crimson));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Crimson);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Cyan", {
        /**
         * Gets the Cyan default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Cyan)) {
                brush = (this.sBrushes.getValue(KnownColor.Cyan));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Cyan);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkBlue", {
        /**
         * Gets the DarkBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkCyan", {
        /**
         * Gets the DarkCyan default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkCyan)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkCyan));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkCyan);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkGoldenrod", {
        /**
         * Gets the DarkGoldenrod default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkGoldenrod)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkGoldenrod));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkGoldenrod);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkGray", {
        /**
         * Gets the DarkGray default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkGray)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkGray));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkGray);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkGreen", {
        /**
         * Gets the DarkGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkKhaki", {
        /**
         * Gets the DarkKhaki default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkKhaki)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkKhaki));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkKhaki);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkMagenta", {
        /**
         * Gets the DarkMagenta default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkMagenta)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkMagenta));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkMagenta);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkOliveGreen", {
        /**
         * Gets the DarkOliveGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkOliveGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkOliveGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkOliveGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkOrange", {
        /**
         * Gets the DarkOrange default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkOrange)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkOrange));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkOrange);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkOrchid", {
        /**
         * Gets the DarkOrchid default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkOrchid)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkOrchid));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkOrchid);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkRed", {
        /**
         * Gets the DarkRed default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkRed)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkRed));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkRed);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkSalmon", {
        /**
         * Gets the DarkSalmon default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkSalmon)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkSalmon));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkSalmon);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkSeaGreen", {
        /**
         * Gets the DarkSeaGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkSeaGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkSeaGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkSeaGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkSlateBlue", {
        /**
         * Gets the DarkSlateBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkSlateBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkSlateBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkSlateBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkSlateGray", {
        /**
         * Gets the DarkSlateGray default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkSlateGray)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkSlateGray));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkSlateGray);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkTurquoise", {
        /**
         * Gets the DarkTurquoise default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkTurquoise)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkTurquoise));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkTurquoise);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DarkViolet", {
        /**
         * Gets the DarkViolet default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DarkViolet)) {
                brush = (this.sBrushes.getValue(KnownColor.DarkViolet));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DarkViolet);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DeepPink", {
        /**
         * Gets the DeepPink default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DeepPink)) {
                brush = (this.sBrushes.getValue(KnownColor.DeepPink));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DeepPink);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DeepSkyBlue", {
        /**
         * Gets the DeepSkyBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DeepSkyBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.DeepSkyBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DeepSkyBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DimGray", {
        /**
         * Gets the DimGray default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DimGray)) {
                brush = (this.sBrushes.getValue(KnownColor.DimGray));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DimGray);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "DodgerBlue", {
        /**
         * Gets the DodgerBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.DodgerBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.DodgerBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.DodgerBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Firebrick", {
        /**
         * Gets the Firebrick default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Firebrick)) {
                brush = (this.sBrushes.getValue(KnownColor.Firebrick));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Firebrick);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "FloralWhite", {
        /**
         * Gets the FloralWhite default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.FloralWhite)) {
                brush = (this.sBrushes.getValue(KnownColor.FloralWhite));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.FloralWhite);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "ForestGreen", {
        /**
         * Gets the ForestGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.ForestGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.ForestGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.ForestGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Fuchsia", {
        /**
         * Gets the Fuchsia default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Fuchsia)) {
                brush = (this.sBrushes.getValue(KnownColor.Fuchsia));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Fuchsia);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Gainsboro", {
        /**
         * Gets the Gainsborough default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Gainsboro)) {
                brush = (this.sBrushes.getValue(KnownColor.Gainsboro));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Gainsboro);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "GhostWhite", {
        /**
         * Gets the GhostWhite default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.GhostWhite)) {
                brush = (this.sBrushes.getValue(KnownColor.GhostWhite));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.GhostWhite);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Gold", {
        /**
         * Gets the Gold default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Gold)) {
                brush = (this.sBrushes.getValue(KnownColor.Gold));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Gold);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Goldenrod", {
        /**
         * Gets the Goldenrod default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Goldenrod)) {
                brush = (this.sBrushes.getValue(KnownColor.Goldenrod));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Goldenrod);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Gray", {
        /**
         * Gets the Gray default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Gray)) {
                brush = (this.sBrushes.getValue(KnownColor.Gray));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Gray);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Green", {
        /**
         * Gets the Green default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Green)) {
                brush = (this.sBrushes.getValue(KnownColor.Green));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Green);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "GreenYellow", {
        /**
         * Gets the GreenYellow default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.GreenYellow)) {
                brush = (this.sBrushes.getValue(KnownColor.GreenYellow));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.GreenYellow);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Honeydew", {
        /**
         * Gets the Honeydew default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Honeydew)) {
                brush = (this.sBrushes.getValue(KnownColor.Honeydew));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Honeydew);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "HotPink", {
        /**
         * Gets the HotPink default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.HotPink)) {
                brush = (this.sBrushes.getValue(KnownColor.HotPink));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.HotPink);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "IndianRed", {
        /**
         * Gets the IndianRed default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.IndianRed)) {
                brush = (this.sBrushes.getValue(KnownColor.IndianRed));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.IndianRed);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Indigo", {
        /**
         * Gets the Indigo default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Indigo)) {
                brush = (this.sBrushes.getValue(KnownColor.Indigo));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Indigo);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Ivory", {
        /**
         * Gets the Ivory default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Ivory)) {
                brush = (this.sBrushes.getValue(KnownColor.Ivory));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Ivory);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Khaki", {
        /**
         * Gets the Khaki default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Khaki)) {
                brush = (this.sBrushes.getValue(KnownColor.Khaki));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Khaki);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Lavender", {
        /**
         * Gets the Lavender default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Lavender)) {
                brush = (this.sBrushes.getValue(KnownColor.Lavender));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Lavender);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LavenderBlush", {
        /**
         * Gets the LavenderBlush default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LavenderBlush)) {
                brush = (this.sBrushes.getValue(KnownColor.LavenderBlush));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LavenderBlush);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LawnGreen", {
        /**
         * Gets the LawnGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LawnGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.LawnGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LawnGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LemonChiffon", {
        /**
         * Gets the LemonChiffon default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LemonChiffon)) {
                brush = (this.sBrushes.getValue(KnownColor.LemonChiffon));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LemonChiffon);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightBlue", {
        /**
         * Gets the LightBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.LightBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightCoral", {
        /**
         * Gets the LightCoral default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightCoral)) {
                brush = (this.sBrushes.getValue(KnownColor.LightCoral));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightCoral);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightCyan", {
        /**
         * Gets the LightCyan default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightCyan)) {
                brush = (this.sBrushes.getValue(KnownColor.LightCyan));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightCyan);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightGoldenrodYellow", {
        /**
         * Gets the LightGoldenrodYellow default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightGoldenrodYellow)) {
                brush = (this.sBrushes.getValue(KnownColor.LightGoldenrodYellow));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightGoldenrodYellow);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightGray", {
        /**
         * Gets the LightGray default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightGray)) {
                brush = (this.sBrushes.getValue(KnownColor.LightGray));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightGray);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightGreen", {
        /**
         * Gets the LightGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.LightGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightPink", {
        /**
         * Gets the LightPink default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightPink)) {
                brush = (this.sBrushes.getValue(KnownColor.LightPink));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightPink);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightSalmon", {
        /**
         * Gets the LightSalmon default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightSalmon)) {
                brush = (this.sBrushes.getValue(KnownColor.LightSalmon));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightSalmon);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightSeaGreen", {
        /**
         * Gets the LightSeaGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightSeaGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.LightSeaGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightSeaGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightSkyBlue", {
        /**
         * Gets the LightSkyBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightSkyBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.LightSkyBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightSkyBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightSlateGray", {
        /**
         * Gets the LightSlateGray default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightSlateGray)) {
                brush = (this.sBrushes.getValue(KnownColor.LightSlateGray));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightSlateGray);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightSteelBlue", {
        /**
         * Gets the LightSteelBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightSteelBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.LightSteelBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightSteelBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LightYellow", {
        /**
         * Gets the LightYellow default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LightYellow)) {
                brush = (this.sBrushes.getValue(KnownColor.LightYellow));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LightYellow);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Lime", {
        /**
         * Gets the Lime default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Lime)) {
                brush = (this.sBrushes.getValue(KnownColor.Lime));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Lime);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "LimeGreen", {
        /**
         * Gets the LimeGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.LimeGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.LimeGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.LimeGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Linen", {
        /**
         * Gets the Linen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Linen)) {
                brush = (this.sBrushes.getValue(KnownColor.Linen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Linen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Magenta", {
        /**
         * Gets the Magenta default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Magenta)) {
                brush = (this.sBrushes.getValue(KnownColor.Magenta));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Magenta);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Maroon", {
        /**
         * Gets the Maroon default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Maroon)) {
                brush = (this.sBrushes.getValue(KnownColor.Maroon));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Maroon);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MediumAquamarine", {
        /**
         * Gets the MediumAquamarine default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MediumAquamarine)) {
                brush = (this.sBrushes.getValue(KnownColor.MediumAquamarine));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MediumAquamarine);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MediumBlue", {
        /**
         * Gets the MediumBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MediumBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.MediumBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MediumBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MediumOrchid", {
        /**
         * Gets the MediumOrchid default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MediumOrchid)) {
                brush = (this.sBrushes.getValue(KnownColor.MediumOrchid));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MediumOrchid);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MediumPurple", {
        /**
         * Gets the MediumPurple default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MediumPurple)) {
                brush = (this.sBrushes.getValue(KnownColor.MediumPurple));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MediumPurple);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MediumSeaGreen", {
        /**
         * Gets the MediumSeaGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MediumSeaGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.MediumSeaGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MediumSeaGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MediumSlateBlue", {
        /**
         * Gets the MediumSlateBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MediumSlateBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.MediumSlateBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MediumSlateBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MediumSpringGreen", {
        /**
         * Gets the MediumSpringGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MediumSpringGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.MediumSpringGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MediumSpringGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MediumTurquoise", {
        /**
         * Gets the MediumTurquoise default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MediumTurquoise)) {
                brush = (this.sBrushes.getValue(KnownColor.MediumTurquoise));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MediumTurquoise);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MediumVioletRed", {
        /**
         * Gets the MediumVioletRed default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MediumVioletRed)) {
                brush = (this.sBrushes.getValue(KnownColor.MediumVioletRed));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MediumVioletRed);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MidnightBlue", {
        /**
         * Gets the MidnightBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MidnightBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.MidnightBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MidnightBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MintCream", {
        /**
         * Gets the MintCream default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MintCream)) {
                brush = (this.sBrushes.getValue(KnownColor.MintCream));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MintCream);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "MistyRose", {
        /**
         * Gets the MistyRose default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.MistyRose)) {
                brush = (this.sBrushes.getValue(KnownColor.MistyRose));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.MistyRose);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Moccasin", {
        /**
         * Gets the Moccasin default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Moccasin)) {
                brush = (this.sBrushes.getValue(KnownColor.Moccasin));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Moccasin);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "NavajoWhite", {
        /**
         * Gets the NavajoWhite default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.NavajoWhite)) {
                brush = (this.sBrushes.getValue(KnownColor.NavajoWhite));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.NavajoWhite);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Navy", {
        /**
         * Gets the Navy default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Navy)) {
                brush = (this.sBrushes.getValue(KnownColor.Navy));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Navy);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "OldLace", {
        /**
         * Gets the OldLace default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.OldLace)) {
                brush = (this.sBrushes.getValue(KnownColor.OldLace));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.OldLace);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Olive", {
        /**
         * Gets the Olive default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Olive)) {
                brush = (this.sBrushes.getValue(KnownColor.Olive));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Olive);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "OliveDrab", {
        /**
         * Gets the OliveDrab default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.OliveDrab)) {
                brush = (this.sBrushes.getValue(KnownColor.OliveDrab));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.OliveDrab);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Orange", {
        /**
         * Gets the Orange default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Orange)) {
                brush = (this.sBrushes.getValue(KnownColor.Orange));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Orange);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "OrangeRed", {
        /**
         * Gets the OrangeRed default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.OrangeRed)) {
                brush = (this.sBrushes.getValue(KnownColor.OrangeRed));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.OrangeRed);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Orchid", {
        /**
         * Gets the Orchid default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Orchid)) {
                brush = (this.sBrushes.getValue(KnownColor.Orchid));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Orchid);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "PaleGoldenrod", {
        /**
         * Gets the PaleGoldenrod default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.PaleGoldenrod)) {
                brush = (this.sBrushes.getValue(KnownColor.PaleGoldenrod));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.PaleGoldenrod);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "PaleGreen", {
        /**
         * Gets the PaleGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.PaleGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.PaleGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.PaleGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "PaleTurquoise", {
        /**
         * Gets the PaleTurquoise default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.PaleTurquoise)) {
                brush = (this.sBrushes.getValue(KnownColor.PaleTurquoise));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.PaleTurquoise);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "PaleVioletRed", {
        /**
         * Gets the PaleVioletRed default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.PaleVioletRed)) {
                brush = (this.sBrushes.getValue(KnownColor.PaleVioletRed));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.PaleVioletRed);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "PapayaWhip", {
        /**
         * Gets the PapayaWhip default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.PapayaWhip)) {
                brush = (this.sBrushes.getValue(KnownColor.PapayaWhip));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.PapayaWhip);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "PeachPuff", {
        /**
         * Gets the PeachPuff default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.PeachPuff)) {
                brush = (this.sBrushes.getValue(KnownColor.PeachPuff));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.PeachPuff);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Peru", {
        /**
         * Gets the Peru default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Peru)) {
                brush = (this.sBrushes.getValue(KnownColor.Peru));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Peru);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Pink", {
        /**
         * Gets the Pink default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Pink)) {
                brush = (this.sBrushes.getValue(KnownColor.Pink));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Pink);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Plum", {
        /**
         * Gets the Plum default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Plum)) {
                brush = (this.sBrushes.getValue(KnownColor.Plum));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Plum);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "PowderBlue", {
        /**
         * Gets the PowderBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.PowderBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.PowderBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.PowderBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Purple", {
        /**
         * Gets the Purple default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Purple)) {
                brush = (this.sBrushes.getValue(KnownColor.Purple));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Purple);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Red", {
        /**
         * Gets the Red default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Red)) {
                brush = (this.sBrushes.getValue(KnownColor.Red));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Red);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "RosyBrown", {
        /**
         * Gets the RosyBrown default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.RosyBrown)) {
                brush = (this.sBrushes.getValue(KnownColor.RosyBrown));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.RosyBrown);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "RoyalBlue", {
        /**
         * Gets the RoyalBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.RoyalBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.RoyalBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.RoyalBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "SaddleBrown", {
        /**
         * Gets the SaddleBrown default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.SaddleBrown)) {
                brush = (this.sBrushes.getValue(KnownColor.SaddleBrown));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.SaddleBrown);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Salmon", {
        /**
         * Gets the Salmon default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Salmon)) {
                brush = (this.sBrushes.getValue(KnownColor.Salmon));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Salmon);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "SandyBrown", {
        /**
         * Gets the SandyBrown default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.SandyBrown)) {
                brush = (this.sBrushes.getValue(KnownColor.SandyBrown));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.SandyBrown);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "SeaGreen", {
        /**
         * Gets the SeaGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.SeaGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.SeaGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.SeaGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "SeaShell", {
        /**
         * Gets the SeaShell default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.SeaShell)) {
                brush = (this.sBrushes.getValue(KnownColor.SeaShell));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.SeaShell);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Sienna", {
        /**
         * Gets the Sienna default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Sienna)) {
                brush = (this.sBrushes.getValue(KnownColor.Sienna));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Sienna);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Silver", {
        /**
         * Gets the Silver default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Silver)) {
                brush = (this.sBrushes.getValue(KnownColor.Silver));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Silver);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "SkyBlue", {
        /**
         * Gets the SkyBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.SkyBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.SkyBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.SkyBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "SlateBlue", {
        /**
         * Gets the SlateBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.SlateBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.SlateBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.SlateBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "SlateGray", {
        /**
         * Gets the SlateGray default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.SlateGray)) {
                brush = (this.sBrushes.getValue(KnownColor.SlateGray));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.SlateGray);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Snow", {
        /**
         * Gets the Snow default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Snow)) {
                brush = (this.sBrushes.getValue(KnownColor.Snow));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Snow);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "SpringGreen", {
        /**
         * Gets the SpringGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.SpringGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.SpringGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.SpringGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "SteelBlue", {
        /**
         * Gets the SteelBlue default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.SteelBlue)) {
                brush = (this.sBrushes.getValue(KnownColor.SteelBlue));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.SteelBlue);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Tan", {
        /**
         * Gets the Tan default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Tan)) {
                brush = (this.sBrushes.getValue(KnownColor.Tan));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Tan);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Teal", {
        /**
         * Gets the Teal default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Teal)) {
                brush = (this.sBrushes.getValue(KnownColor.Teal));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Teal);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Thistle", {
        /**
         * Gets the Thistle default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Thistle)) {
                brush = (this.sBrushes.getValue(KnownColor.Thistle));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Thistle);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Tomato", {
        /**
         * Gets the Tomato default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Tomato)) {
                brush = (this.sBrushes.getValue(KnownColor.Tomato));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Tomato);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Transparent", {
        /**
         * Gets the Transparent default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Transparent)) {
                brush = (this.sBrushes.getValue(KnownColor.Transparent));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Transparent);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Turquoise", {
        /**
         * Gets the Turquoise default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Turquoise)) {
                brush = (this.sBrushes.getValue(KnownColor.Turquoise));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Turquoise);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Violet", {
        /**
         * Gets the Violet default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Violet)) {
                brush = (this.sBrushes.getValue(KnownColor.Violet));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Violet);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Wheat", {
        /**
         * Gets the Wheat default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Wheat)) {
                brush = (this.sBrushes.getValue(KnownColor.Wheat));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Wheat);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "White", {
        /**
         * Gets the White default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.White)) {
                brush = (this.sBrushes.getValue(KnownColor.White));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.White);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "WhiteSmoke", {
        /**
         * Gets the WhiteSmoke default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.WhiteSmoke)) {
                brush = (this.sBrushes.getValue(KnownColor.WhiteSmoke));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.WhiteSmoke);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "Yellow", {
        /**
         * Gets the Yellow default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.Yellow)) {
                brush = (this.sBrushes.getValue(KnownColor.Yellow));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.Yellow);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBrushes, "YellowGreen", {
        /**
         * Gets the YellowGreen default brush.
         * @public
         */
        get: function () {
            var brush = null;
            if (this.sBrushes.containsKey(KnownColor.YellowGreen)) {
                brush = (this.sBrushes.getValue(KnownColor.YellowGreen));
            }
            if ((brush == null)) {
                brush = this.getBrush(KnownColor.YellowGreen);
            }
            return brush;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the brush.
     */
    PdfBrushes.getBrush = function (colorName) {
        var pdfColor = this.getColorValue(colorName);
        var brush = new PdfSolidBrush(pdfColor);
        this.sBrushes.setValue(colorName, brush);
        return brush;
    };
    /**
     * Get the color value.
     * @param colorName The KnownColor name.
     */
    /* tslint:disable */
    PdfBrushes.getColorValue = function (colorName) {
        var color = new PdfColor();
        switch (colorName) {
            case KnownColor.Transparent:
                color = new PdfColor(0, 255, 255, 255);
                break;
            case KnownColor.AliceBlue:
                color = new PdfColor(255, 240, 248, 255);
                break;
            case KnownColor.AntiqueWhite:
                color = new PdfColor(255, 250, 235, 215);
                break;
            case KnownColor.Aqua:
                color = new PdfColor(255, 0, 255, 255);
                break;
            case KnownColor.Aquamarine:
                color = new PdfColor(255, 127, 255, 212);
                break;
            case KnownColor.Azure:
                color = new PdfColor(255, 240, 255, 255);
                break;
            case KnownColor.Beige:
                color = new PdfColor(255, 245, 245, 220);
                break;
            case KnownColor.Bisque:
                color = new PdfColor(255, 255, 228, 196);
                break;
            case KnownColor.Black:
                color = new PdfColor(255, 0, 0, 0);
                break;
            case KnownColor.BlanchedAlmond:
                color = new PdfColor(255, 255, 235, 205);
                break;
            case KnownColor.Blue:
                color = new PdfColor(255, 0, 0, 255);
                break;
            case KnownColor.BlueViolet:
                color = new PdfColor(255, 138, 43, 226);
                break;
            case KnownColor.Brown:
                color = new PdfColor(255, 165, 42, 42);
                break;
            case KnownColor.BurlyWood:
                color = new PdfColor(255, 222, 184, 135);
                break;
            case KnownColor.CadetBlue:
                color = new PdfColor(255, 95, 158, 160);
                break;
            case KnownColor.Chartreuse:
                color = new PdfColor(255, 127, 255, 0);
                break;
            case KnownColor.Chocolate:
                color = new PdfColor(255, 210, 105, 30);
                break;
            case KnownColor.Coral:
                color = new PdfColor(255, 255, 127, 80);
                break;
            case KnownColor.CornflowerBlue:
                color = new PdfColor(255, 100, 149, 237);
                break;
            case KnownColor.Cornsilk:
                color = new PdfColor(255, 255, 248, 220);
                break;
            case KnownColor.Crimson:
                color = new PdfColor(255, 220, 20, 60);
                break;
            case KnownColor.Cyan:
                color = new PdfColor(255, 0, 255, 255);
                break;
            case KnownColor.DarkBlue:
                color = new PdfColor(255, 0, 0, 139);
                break;
            case KnownColor.DarkCyan:
                color = new PdfColor(255, 0, 139, 139);
                break;
            case KnownColor.DarkGoldenrod:
                color = new PdfColor(255, 184, 134, 11);
                break;
            case KnownColor.DarkGray:
                color = new PdfColor(255, 169, 169, 169);
                break;
            case KnownColor.DarkGreen:
                color = new PdfColor(255, 0, 100, 0);
                break;
            case KnownColor.DarkKhaki:
                color = new PdfColor(255, 189, 183, 107);
                break;
            case KnownColor.DarkMagenta:
                color = new PdfColor(255, 139, 0, 139);
                break;
            case KnownColor.DarkOliveGreen:
                color = new PdfColor(255, 85, 107, 47);
                break;
            case KnownColor.DarkOrange:
                color = new PdfColor(255, 255, 140, 0);
                break;
            case KnownColor.DarkOrchid:
                color = new PdfColor(255, 153, 50, 204);
                break;
            case KnownColor.DarkRed:
                color = new PdfColor(255, 139, 0, 0);
                break;
            case KnownColor.DarkSalmon:
                color = new PdfColor(255, 233, 150, 122);
                break;
            case KnownColor.DarkSeaGreen:
                color = new PdfColor(255, 143, 188, 139);
                break;
            case KnownColor.DarkSlateBlue:
                color = new PdfColor(255, 72, 61, 139);
                break;
            case KnownColor.DarkSlateGray:
                color = new PdfColor(255, 47, 79, 79);
                break;
            case KnownColor.DarkTurquoise:
                color = new PdfColor(255, 0, 206, 209);
                break;
            case KnownColor.DarkViolet:
                color = new PdfColor(255, 148, 0, 211);
                break;
            case KnownColor.DeepPink:
                color = new PdfColor(255, 255, 20, 147);
                break;
            case KnownColor.DeepSkyBlue:
                color = new PdfColor(255, 0, 191, 255);
                break;
            case KnownColor.DimGray:
                color = new PdfColor(255, 105, 105, 105);
                break;
            case KnownColor.DodgerBlue:
                color = new PdfColor(255, 30, 144, 255);
                break;
            case KnownColor.Firebrick:
                color = new PdfColor(255, 178, 34, 34);
                break;
            case KnownColor.FloralWhite:
                color = new PdfColor(255, 255, 250, 240);
                break;
            case KnownColor.ForestGreen:
                color = new PdfColor(255, 34, 139, 34);
                break;
            case KnownColor.Fuchsia:
                color = new PdfColor(255, 255, 0, 255);
                break;
            case KnownColor.Gainsboro:
                color = new PdfColor(255, 220, 220, 220);
                break;
            case KnownColor.GhostWhite:
                color = new PdfColor(255, 248, 248, 255);
                break;
            case KnownColor.Gold:
                color = new PdfColor(255, 255, 215, 0);
                break;
            case KnownColor.Goldenrod:
                color = new PdfColor(255, 218, 165, 32);
                break;
            case KnownColor.Gray:
                color = new PdfColor(255, 128, 128, 128);
                break;
            case KnownColor.Green:
                color = new PdfColor(255, 0, 128, 0);
                break;
            case KnownColor.GreenYellow:
                color = new PdfColor(255, 173, 255, 47);
                break;
            case KnownColor.Honeydew:
                color = new PdfColor(255, 240, 255, 240);
                break;
            case KnownColor.HotPink:
                color = new PdfColor(255, 255, 105, 180);
                break;
            case KnownColor.IndianRed:
                color = new PdfColor(255, 205, 92, 92);
                break;
            case KnownColor.Indigo:
                color = new PdfColor(255, 75, 0, 130);
                break;
            case KnownColor.Ivory:
                color = new PdfColor(255, 255, 255, 240);
                break;
            case KnownColor.Khaki:
                color = new PdfColor(255, 240, 230, 140);
                break;
            case KnownColor.Lavender:
                color = new PdfColor(255, 230, 230, 250);
                break;
            case KnownColor.LavenderBlush:
                color = new PdfColor(255, 255, 240, 245);
                break;
            case KnownColor.LawnGreen:
                color = new PdfColor(255, 124, 252, 0);
                break;
            case KnownColor.LemonChiffon:
                color = new PdfColor(255, 255, 250, 205);
                break;
            case KnownColor.LightBlue:
                color = new PdfColor(255, 173, 216, 230);
                break;
            case KnownColor.LightCoral:
                color = new PdfColor(255, 240, 128, 128);
                break;
            case KnownColor.LightCyan:
                color = new PdfColor(255, 224, 255, 255);
                break;
            case KnownColor.LightGoldenrodYellow:
                color = new PdfColor(255, 250, 250, 210);
                break;
            case KnownColor.LightGreen:
                color = new PdfColor(255, 144, 238, 144);
                break;
            case KnownColor.LightGray:
                color = new PdfColor(255, 211, 211, 211);
                break;
            case KnownColor.LightPink:
                color = new PdfColor(255, 255, 182, 193);
                break;
            case KnownColor.LightSalmon:
                color = new PdfColor(255, 255, 160, 122);
                break;
            case KnownColor.LightSeaGreen:
                color = new PdfColor(255, 32, 178, 170);
                break;
            case KnownColor.LightSkyBlue:
                color = new PdfColor(255, 135, 206, 250);
                break;
            case KnownColor.LightSlateGray:
                color = new PdfColor(255, 119, 136, 153);
                break;
            case KnownColor.LightSteelBlue:
                color = new PdfColor(255, 176, 196, 222);
                break;
            case KnownColor.LightYellow:
                color = new PdfColor(255, 255, 255, 224);
                break;
            case KnownColor.Lime:
                color = new PdfColor(255, 0, 255, 0);
                break;
            case KnownColor.LimeGreen:
                color = new PdfColor(255, 50, 205, 50);
                break;
            case KnownColor.Linen:
                color = new PdfColor(255, 250, 240, 230);
                break;
            case KnownColor.Magenta:
                color = new PdfColor(255, 255, 0, 255);
                break;
            case KnownColor.Maroon:
                color = new PdfColor(255, 128, 0, 0);
                break;
            case KnownColor.MediumAquamarine:
                color = new PdfColor(255, 102, 205, 170);
                break;
            case KnownColor.MediumBlue:
                color = new PdfColor(255, 0, 0, 205);
                break;
            case KnownColor.MediumOrchid:
                color = new PdfColor(255, 186, 85, 211);
                break;
            case KnownColor.MediumPurple:
                color = new PdfColor(255, 147, 112, 219);
                break;
            case KnownColor.MediumSeaGreen:
                color = new PdfColor(255, 60, 179, 113);
                break;
            case KnownColor.MediumSlateBlue:
                color = new PdfColor(255, 123, 104, 238);
                break;
            case KnownColor.MediumSpringGreen:
                color = new PdfColor(255, 0, 250, 154);
                break;
            case KnownColor.MediumTurquoise:
                color = new PdfColor(255, 72, 209, 204);
                break;
            case KnownColor.MediumVioletRed:
                color = new PdfColor(255, 199, 21, 133);
                break;
            case KnownColor.MidnightBlue:
                color = new PdfColor(255, 25, 25, 112);
                break;
            case KnownColor.MintCream:
                color = new PdfColor(255, 245, 255, 250);
                break;
            case KnownColor.MistyRose:
                color = new PdfColor(255, 255, 228, 225);
                break;
            case KnownColor.Moccasin:
                color = new PdfColor(255, 255, 228, 181);
                break;
            case KnownColor.NavajoWhite:
                color = new PdfColor(255, 255, 222, 173);
                break;
            case KnownColor.Navy:
                color = new PdfColor(255, 0, 0, 128);
                break;
            case KnownColor.OldLace:
                color = new PdfColor(255, 253, 245, 230);
                break;
            case KnownColor.Olive:
                color = new PdfColor(255, 128, 128, 0);
                break;
            case KnownColor.OliveDrab:
                color = new PdfColor(255, 107, 142, 35);
                break;
            case KnownColor.Orange:
                color = new PdfColor(255, 255, 165, 0);
                break;
            case KnownColor.OrangeRed:
                color = new PdfColor(255, 255, 69, 0);
                break;
            case KnownColor.Orchid:
                color = new PdfColor(255, 218, 112, 214);
                break;
            case KnownColor.PaleGoldenrod:
                color = new PdfColor(255, 238, 232, 170);
                break;
            case KnownColor.PaleGreen:
                color = new PdfColor(255, 152, 251, 152);
                break;
            case KnownColor.PaleTurquoise:
                color = new PdfColor(255, 175, 238, 238);
                break;
            case KnownColor.PaleVioletRed:
                color = new PdfColor(255, 219, 112, 147);
                break;
            case KnownColor.PapayaWhip:
                color = new PdfColor(255, 255, 239, 213);
                break;
            case KnownColor.PeachPuff:
                color = new PdfColor(255, 255, 218, 185);
                break;
            case KnownColor.Peru:
                color = new PdfColor(255, 205, 133, 63);
                break;
            case KnownColor.Pink:
                color = new PdfColor(255, 255, 192, 203);
                break;
            case KnownColor.Plum:
                color = new PdfColor(255, 221, 160, 221);
                break;
            case KnownColor.PowderBlue:
                color = new PdfColor(255, 176, 224, 230);
                break;
            case KnownColor.Purple:
                color = new PdfColor(255, 128, 0, 128);
                break;
            case KnownColor.Red:
                color = new PdfColor(255, 255, 0, 0);
                break;
            case KnownColor.RosyBrown:
                color = new PdfColor(255, 188, 143, 143);
                break;
            case KnownColor.RoyalBlue:
                color = new PdfColor(255, 65, 105, 225);
                break;
            case KnownColor.SaddleBrown:
                color = new PdfColor(255, 139, 69, 19);
                break;
            case KnownColor.Salmon:
                color = new PdfColor(255, 250, 128, 114);
                break;
            case KnownColor.SandyBrown:
                color = new PdfColor(255, 244, 164, 96);
                break;
            case KnownColor.SeaGreen:
                color = new PdfColor(255, 46, 139, 87);
                break;
            case KnownColor.SeaShell:
                color = new PdfColor(255, 255, 245, 238);
                break;
            case KnownColor.Sienna:
                color = new PdfColor(255, 160, 82, 45);
                break;
            case KnownColor.Silver:
                color = new PdfColor(255, 192, 192, 192);
                break;
            case KnownColor.SkyBlue:
                color = new PdfColor(255, 135, 206, 235);
                break;
            case KnownColor.SlateBlue:
                color = new PdfColor(255, 106, 90, 205);
                break;
            case KnownColor.SlateGray:
                color = new PdfColor(255, 112, 128, 144);
                break;
            case KnownColor.Snow:
                color = new PdfColor(255, 255, 250, 250);
                break;
            case KnownColor.SpringGreen:
                color = new PdfColor(255, 0, 255, 127);
                break;
            case KnownColor.SteelBlue:
                color = new PdfColor(255, 70, 130, 180);
                break;
            case KnownColor.Tan:
                color = new PdfColor(255, 210, 180, 140);
                break;
            case KnownColor.Teal:
                color = new PdfColor(255, 0, 128, 128);
                break;
            case KnownColor.Thistle:
                color = new PdfColor(255, 216, 191, 216);
                break;
            case KnownColor.Tomato:
                color = new PdfColor(255, 255, 99, 71);
                break;
            case KnownColor.Turquoise:
                color = new PdfColor(255, 64, 224, 208);
                break;
            case KnownColor.Violet:
                color = new PdfColor(255, 238, 130, 238);
                break;
            case KnownColor.Wheat:
                color = new PdfColor(255, 245, 222, 179);
                break;
            case KnownColor.White:
                color = new PdfColor(255, 255, 255, 255);
                break;
            case KnownColor.WhiteSmoke:
                color = new PdfColor(255, 245, 245, 245);
                break;
            case KnownColor.Yellow:
                color = new PdfColor(255, 255, 255, 0);
                break;
            case KnownColor.YellowGreen:
                color = new PdfColor(255, 154, 205, 50);
                break;
        }
        return color;
    };
    //Static Fields
    /**
     * Local variable to store the brushes.
     */
    PdfBrushes.sBrushes = new Dictionary();
    return PdfBrushes;
}());
export { PdfBrushes };
