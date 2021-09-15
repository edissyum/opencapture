/**
 * Enum for comment status of the annotation
 */
export var CommentStatus;
(function (CommentStatus) {
    CommentStatus[CommentStatus["None"] = 1] = "None";
    CommentStatus[CommentStatus["Accepted"] = 2] = "Accepted";
    CommentStatus[CommentStatus["Canceled"] = 3] = "Canceled";
    CommentStatus[CommentStatus["Completed"] = 4] = "Completed";
    CommentStatus[CommentStatus["Rejected"] = 5] = "Rejected";
})(CommentStatus || (CommentStatus = {}));
/**
 * Enum for font styles
 */
export var FontStyle;
(function (FontStyle) {
    FontStyle[FontStyle["None"] = 0] = "None";
    FontStyle[FontStyle["Bold"] = 1] = "Bold";
    FontStyle[FontStyle["Italic"] = 2] = "Italic";
    FontStyle[FontStyle["Underline"] = 4] = "Underline";
    FontStyle[FontStyle["Strikethrough"] = 8] = "Strikethrough";
})(FontStyle || (FontStyle = {}));
/**
 * enum for context menu items
 */
export var ContextMenuItem;
(function (ContextMenuItem) {
    ContextMenuItem[ContextMenuItem["Copy"] = 0] = "Copy";
    ContextMenuItem[ContextMenuItem["Highlight"] = 1] = "Highlight";
    ContextMenuItem[ContextMenuItem["Cut"] = 2] = "Cut";
    ContextMenuItem[ContextMenuItem["Underline"] = 4] = "Underline";
    ContextMenuItem[ContextMenuItem["Paste"] = 8] = "Paste";
    ContextMenuItem[ContextMenuItem["Delete"] = 16] = "Delete";
    ContextMenuItem[ContextMenuItem["ScaleRatio"] = 32] = "ScaleRatio";
    ContextMenuItem[ContextMenuItem["Strikethrough"] = 64] = "Strikethrough";
    ContextMenuItem[ContextMenuItem["Properties"] = 128] = "Properties";
    ContextMenuItem[ContextMenuItem["Comment"] = 256] = "Comment";
})(ContextMenuItem || (ContextMenuItem = {}));
/**
 * Enum for signature type
 */
export var SignatureType;
(function (SignatureType) {
    SignatureType["Draw"] = "Draw";
    SignatureType["Type"] = "Type";
    SignatureType["Image"] = "Image";
})(SignatureType || (SignatureType = {}));
/**
 * Enum for annotation resizer location
 */
export var AnnotationResizerLocation;
(function (AnnotationResizerLocation) {
    AnnotationResizerLocation[AnnotationResizerLocation["Corners"] = 1] = "Corners";
    AnnotationResizerLocation[AnnotationResizerLocation["Edges"] = 2] = "Edges";
})(AnnotationResizerLocation || (AnnotationResizerLocation = {}));
export var DisplayMode;
(function (DisplayMode) {
    /** Draw - Display only the draw option in the signature dialog. */
    DisplayMode[DisplayMode["Draw"] = 1] = "Draw";
    /** Text - Display only the type option in the signature dialog. */
    DisplayMode[DisplayMode["Text"] = 2] = "Text";
    /** Upload - Display only the upload option in the signature dialog. */
    DisplayMode[DisplayMode["Upload"] = 4] = "Upload";
})(DisplayMode || (DisplayMode = {}));
/**
 * Enum for cursor type
 */
export var CursorType;
(function (CursorType) {
    CursorType["auto"] = "auto";
    CursorType["crossHair"] = "crosshair";
    // eslint-disable-next-line
    CursorType["e_resize"] = "e-resize";
    // eslint-disable-next-line
    CursorType["ew_resize"] = "ew-resize";
    CursorType["grab"] = "grab";
    CursorType["grabbing"] = "grabbing";
    CursorType["move"] = "move";
    // eslint-disable-next-line
    CursorType["n_resize"] = "n-resize";
    // eslint-disable-next-line
    CursorType["ne_resize"] = "ne-resize";
    // eslint-disable-next-line
    CursorType["ns_resize"] = "ns-resize";
    // eslint-disable-next-line
    CursorType["nw_resize"] = "nw-resize";
    CursorType["pointer"] = "pointer";
    // eslint-disable-next-line
    CursorType["s_resize"] = "s-resize";
    // eslint-disable-next-line
    CursorType["se_resize"] = "se-resize";
    // eslint-disable-next-line
    CursorType["sw_resize"] = "sw-resize";
    CursorType["text"] = "text";
    // eslint-disable-next-line
    CursorType["w_resize"] = "w-resize";
})(CursorType || (CursorType = {}));
/**
 * Enum type for Dynamic Stamp Items
 */
export var DynamicStampItem;
(function (DynamicStampItem) {
    DynamicStampItem["Revised"] = "Revised";
    DynamicStampItem["Reviewed"] = "Reviewed";
    DynamicStampItem["Received"] = "Received";
    DynamicStampItem["Approved"] = "Approved";
    DynamicStampItem["Confidential"] = "Confidential";
    DynamicStampItem["NotApproved"] = "NotApproved";
})(DynamicStampItem || (DynamicStampItem = {}));
/**
 * Enum type for Sign Stamp Items
 */
export var SignStampItem;
(function (SignStampItem) {
    SignStampItem["Witness"] = "Witness";
    SignStampItem["InitialHere"] = "InitialHere";
    SignStampItem["SignHere"] = "SignHere";
    SignStampItem["Accepted"] = "Accepted";
    SignStampItem["Rejected"] = "Rejected";
})(SignStampItem || (SignStampItem = {}));
/**
 * Enum type for Standard Business Stamp Items
 */
export var StandardBusinessStampItem;
(function (StandardBusinessStampItem) {
    StandardBusinessStampItem["Approved"] = "Approved";
    StandardBusinessStampItem["NotApproved"] = "NotApproved";
    StandardBusinessStampItem["Draft"] = "Draft";
    StandardBusinessStampItem["Final"] = "Final";
    StandardBusinessStampItem["Completed"] = "Completed";
    StandardBusinessStampItem["Confidential"] = "Confidential";
    StandardBusinessStampItem["ForPublicRelease"] = "ForPublicRelease";
    StandardBusinessStampItem["NotForPublicRelease"] = "NotForPublicRelease";
    StandardBusinessStampItem["ForComment"] = "ForComment";
    StandardBusinessStampItem["Void"] = "Void";
    StandardBusinessStampItem["PreliminaryResults"] = "PreliminaryResults";
    StandardBusinessStampItem["InformationOnly"] = "InformationOnly";
})(StandardBusinessStampItem || (StandardBusinessStampItem = {}));
/**
 * Enum type for allowed interactions for locked annotations
 */
export var AllowedInteraction;
(function (AllowedInteraction) {
    AllowedInteraction["Select"] = "Select";
    AllowedInteraction["Move"] = "Move";
    AllowedInteraction["Resize"] = "Resize";
    AllowedInteraction["Delete"] = "Delete";
    AllowedInteraction["None"] = "None";
    AllowedInteraction["PropertyChange"] = "PropertyChange";
})(AllowedInteraction || (AllowedInteraction = {}));
/**
 * Enum type for export annotation file types
 */
export var AnnotationDataFormat;
(function (AnnotationDataFormat) {
    AnnotationDataFormat["Json"] = "Json";
    AnnotationDataFormat["Xfdf"] = "Xfdf";
})(AnnotationDataFormat || (AnnotationDataFormat = {}));
