/**
 * public Enum for `PdfLayoutType`.
 * @private
 */
export var PdfLayoutType;
(function (PdfLayoutType) {
    /**
     * Specifies the type of `Paginate`.
     * @private
     */
    PdfLayoutType[PdfLayoutType["Paginate"] = 0] = "Paginate";
    /**
     * Specifies the type of `OnePage`.
     * @private
     */
    PdfLayoutType[PdfLayoutType["OnePage"] = 1] = "OnePage";
})(PdfLayoutType || (PdfLayoutType = {}));
/**
 * public Enum for `PdfLayoutBreakType`.
 * @private
 */
export var PdfLayoutBreakType;
(function (PdfLayoutBreakType) {
    /**
     * Specifies the type of `FitPage`.
     * @private
     */
    PdfLayoutBreakType[PdfLayoutBreakType["FitPage"] = 0] = "FitPage";
    /**
     * Specifies the type of `FitElement`.
     * @private
     */
    PdfLayoutBreakType[PdfLayoutBreakType["FitElement"] = 1] = "FitElement";
    /**
     * Specifies the type of `FitColumnsToPage`.
     * @private
     */
    PdfLayoutBreakType[PdfLayoutBreakType["FitColumnsToPage"] = 2] = "FitColumnsToPage";
})(PdfLayoutBreakType || (PdfLayoutBreakType = {}));
export var PathPointType;
(function (PathPointType) {
    /**
     * Specifies the path point type of `Start`.
     * @private
     */
    PathPointType[PathPointType["Start"] = 0] = "Start";
    /**
     * Specifies the path point type of `Line`.
     * @private
     */
    PathPointType[PathPointType["Line"] = 1] = "Line";
    /**
     * Specifies the path point type of `Bezier3`.
     * @private
     */
    PathPointType[PathPointType["Bezier3"] = 3] = "Bezier3";
    /**
     * Specifies the path point type of `Bezier`.
     * @private
     */
    PathPointType[PathPointType["Bezier"] = 3] = "Bezier";
    /**
     * Specifies the path point type of `PathTypeMask`.
     * @private
     */
    PathPointType[PathPointType["PathTypeMask"] = 7] = "PathTypeMask";
    /**
     * Specifies the path point type of `DashMode`.
     * @private
     */
    PathPointType[PathPointType["DashMode"] = 16] = "DashMode";
    /**
     * Specifies the path point type of `PathMarker`.
     * @private
     */
    PathPointType[PathPointType["PathMarker"] = 32] = "PathMarker";
    /**
     * Specifies the path point type of `CloseSubpath`.
     * @private
     */
    PathPointType[PathPointType["CloseSubpath"] = 128] = "CloseSubpath";
})(PathPointType || (PathPointType = {}));
