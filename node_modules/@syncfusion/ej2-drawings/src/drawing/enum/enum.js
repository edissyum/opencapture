/**
 * enum module defines the public enumerations
 */
/**
 * Defines the container/canvas transform
 * Self - Sets the transform type as Self
 * Parent - Sets the transform type as Parent
 */
export var RotateTransform;
(function (RotateTransform) {
    /** Self - Sets the transform type as Self */
    RotateTransform[RotateTransform["Self"] = 1] = "Self";
    /** Parent - Sets the transform type as Parent */
    RotateTransform[RotateTransform["Parent"] = 2] = "Parent";
})(RotateTransform || (RotateTransform = {}));
/** Enables/Disables The element actions
 * None - Diables all element actions are none
 * ElementIsPort - Enable element action is port
 * ElementIsGroup - Enable element action as Group
 * @private
 */
export var ElementAction;
(function (ElementAction) {
    /** Disables all element actions are none  */
    ElementAction[ElementAction["None"] = 0] = "None";
    /** Enable the element action is Port  */
    ElementAction[ElementAction["ElementIsPort"] = 2] = "ElementIsPort";
    /** Enable the element action as Group  */
    ElementAction[ElementAction["ElementIsGroup"] = 4] = "ElementIsGroup";
})(ElementAction || (ElementAction = {}));
/**
 * Defines the constraints to enable/disable certain features of connector.
 * * None - Interaction of the connectors cannot be done.
 * * Select - Selects the connector.
 * * Delete - Delete the connector.
 * * Drag - Drag the connector.
 * * DragSourceEnd - Drag the source end of the connector.
 * * DragTargetEnd - Drag the target end of the connector.
 * * DragSegmentThump - Drag the segment thumb of the connector.
 * * AllowDrop - Allow to drop a node.
 * * Bridging - Creates bridge  on intersection of two connectors.
 * * BridgeObstacle -
 * * InheritBridging - Creates bridge  on intersection of two connectors.
 * * PointerEvents - Sets the pointer events.
 * * Tooltip - Displays a tooltip for the connectors.
 * * InheritToolTip - Displays a tooltip for the connectors.
 * * Interaction - Features of the connector used for interaction.
 * * ReadOnly - Enables ReadOnly
 * * Default - Default features of the connector.
 * @aspNumberEnum
 * @IgnoreSingular
 */
export var ConnectorConstraints;
(function (ConnectorConstraints) {
    /** Disable all connector Constraints. */
    ConnectorConstraints[ConnectorConstraints["None"] = 1] = "None";
    /** Enables connector to be selected. */
    ConnectorConstraints[ConnectorConstraints["Select"] = 2] = "Select";
    /** Enables connector to be Deleted. */
    ConnectorConstraints[ConnectorConstraints["Delete"] = 4] = "Delete";
    /** Enables connector to be Dragged. */
    ConnectorConstraints[ConnectorConstraints["Drag"] = 8] = "Drag";
    /** Enables connectors source end to be selected. */
    ConnectorConstraints[ConnectorConstraints["DragSourceEnd"] = 16] = "DragSourceEnd";
    /** Enables connectors target end to be selected. */
    ConnectorConstraints[ConnectorConstraints["DragTargetEnd"] = 32] = "DragTargetEnd";
    /** Enables control point and end point of every segment in a connector for editing. */
    ConnectorConstraints[ConnectorConstraints["DragSegmentThumb"] = 64] = "DragSegmentThumb";
    /** Enables AllowDrop constraints to the  connector. */
    ConnectorConstraints[ConnectorConstraints["AllowDrop"] = 128] = "AllowDrop";
    /** Enables bridging to the connector. */
    ConnectorConstraints[ConnectorConstraints["Bridging"] = 256] = "Bridging";
    /** Enables or Disables Bridge Obstacles with overlapping of connectors. */
    ConnectorConstraints[ConnectorConstraints["BridgeObstacle"] = 512] = "BridgeObstacle";
    /** Enables bridging to the connector. */
    ConnectorConstraints[ConnectorConstraints["InheritBridging"] = 1024] = "InheritBridging";
    /** Used to set the pointer events. */
    ConnectorConstraints[ConnectorConstraints["PointerEvents"] = 2048] = "PointerEvents";
    /** Enables or disables tool tip for the connectors */
    ConnectorConstraints[ConnectorConstraints["Tooltip"] = 4096] = "Tooltip";
    /** Enables or disables tool tip for the connectors */
    ConnectorConstraints[ConnectorConstraints["InheritTooltip"] = 8192] = "InheritTooltip";
    /** Enables Interaction. */
    ConnectorConstraints[ConnectorConstraints["Interaction"] = 4218] = "Interaction";
    /** Enables ReadOnly */
    ConnectorConstraints[ConnectorConstraints["ReadOnly"] = 16384] = "ReadOnly";
    /** Enables all constraints. */
    ConnectorConstraints[ConnectorConstraints["Default"] = 11838] = "Default";
})(ConnectorConstraints || (ConnectorConstraints = {}));
/** Enables/Disables the handles of the selector
 * Rotate - Enable Rotate Thumb
 * ConnectorSource - Enable Connector source point
 * ConnectorTarget - Enable Connector target point
 * ResizeNorthEast - Enable ResizeNorthEast Resize
 * ResizeEast - Enable ResizeEast Resize
 * ResizeSouthEast - Enable ResizeSouthEast Resize
 * ResizeSouth - Enable ResizeSouth Resize
 * ResizeSouthWest - Enable ResizeSouthWest Resize
 * ResizeWest - Enable ResizeWest Resize
 * ResizeNorthWest - Enable ResizeNorthWest Resize
 * ResizeNorth - Enable ResizeNorth Resize
 * Default - Enables all constraints
 * @private
 */
export var ThumbsConstraints;
(function (ThumbsConstraints) {
    /** Enable Rotate Thumb  */
    ThumbsConstraints[ThumbsConstraints["Rotate"] = 2] = "Rotate";
    /** Enable Connector source point  */
    ThumbsConstraints[ThumbsConstraints["ConnectorSource"] = 4] = "ConnectorSource";
    /** Enable Connector target point  */
    ThumbsConstraints[ThumbsConstraints["ConnectorTarget"] = 8] = "ConnectorTarget";
    /** Enable ResizeNorthEast Resize  */
    ThumbsConstraints[ThumbsConstraints["ResizeNorthEast"] = 16] = "ResizeNorthEast";
    /** Enable ResizeEast Resize  */
    ThumbsConstraints[ThumbsConstraints["ResizeEast"] = 32] = "ResizeEast";
    /** Enable ResizeSouthEast Resize */
    ThumbsConstraints[ThumbsConstraints["ResizeSouthEast"] = 64] = "ResizeSouthEast";
    /** Enable ResizeSouth Resize */
    ThumbsConstraints[ThumbsConstraints["ResizeSouth"] = 128] = "ResizeSouth";
    /** Enable ResizeSouthWest Resize */
    ThumbsConstraints[ThumbsConstraints["ResizeSouthWest"] = 256] = "ResizeSouthWest";
    /** Enable ResizeWest Resize */
    ThumbsConstraints[ThumbsConstraints["ResizeWest"] = 512] = "ResizeWest";
    /** Enable ResizeNorthWest Resize */
    ThumbsConstraints[ThumbsConstraints["ResizeNorthWest"] = 1024] = "ResizeNorthWest";
    /** Enable ResizeNorth Resize */
    ThumbsConstraints[ThumbsConstraints["ResizeNorth"] = 2048] = "ResizeNorth";
    /** Enables all constraints */
    ThumbsConstraints[ThumbsConstraints["Default"] = 4094] = "Default";
})(ThumbsConstraints || (ThumbsConstraints = {}));
/**
 * Defines the visibility of the selector handles
 * None - Hides all the selector elements
 * ConnectorSourceThumb - Shows/hides the source thumb of the connector
 * ConnectorTargetThumb - Shows/hides the target thumb of the connector
 * ResizeSouthEast - Shows/hides the bottom right resize handle of the selector
 * ResizeSouthWest - Shows/hides the bottom left resize handle of the selector
 * ResizeNorthEast - Shows/hides the top right resize handle of the selector
 * ResizeNorthWest - Shows/hides the top left resize handle of the selector
 * ResizeEast - Shows/hides the middle right resize handle of the selector
 * ResizeWest - Shows/hides the middle left resize handle of the selector
 * ResizeSouth - Shows/hides the bottom center resize handle of the selector
 * ResizeNorth - Shows/hides the top center resize handle of the selector
 * Rotate - Shows/hides the rotate handle of the selector
 * UserHandles - Shows/hides the user handles of the selector
 * Resize - Shows/hides all resize handles of the selector
 * @aspNumberEnum
 * @IgnoreSingular
 */
export var SelectorConstraints;
(function (SelectorConstraints) {
    /** Hides all the selector elements */
    SelectorConstraints[SelectorConstraints["None"] = 1] = "None";
    /** Shows/hides the source thumb of the connector */
    SelectorConstraints[SelectorConstraints["ConnectorSourceThumb"] = 2] = "ConnectorSourceThumb";
    /** Shows/hides the target thumb of the connector */
    SelectorConstraints[SelectorConstraints["ConnectorTargetThumb"] = 4] = "ConnectorTargetThumb";
    /** Shows/hides the bottom right resize handle of the selector */
    SelectorConstraints[SelectorConstraints["ResizeSouthEast"] = 8] = "ResizeSouthEast";
    /** Shows/hides the bottom left resize handle of the selector */
    SelectorConstraints[SelectorConstraints["ResizeSouthWest"] = 16] = "ResizeSouthWest";
    /** Shows/hides the top right resize handle of the selector */
    SelectorConstraints[SelectorConstraints["ResizeNorthEast"] = 32] = "ResizeNorthEast";
    /** Shows/hides the top left resize handle of the selector */
    SelectorConstraints[SelectorConstraints["ResizeNorthWest"] = 64] = "ResizeNorthWest";
    /** Shows/hides the middle right resize handle of the selector  */
    SelectorConstraints[SelectorConstraints["ResizeEast"] = 128] = "ResizeEast";
    /** Shows/hides the middle left resize handle of the selector */
    SelectorConstraints[SelectorConstraints["ResizeWest"] = 256] = "ResizeWest";
    /** Shows/hides the bottom center resize handle of the selector */
    SelectorConstraints[SelectorConstraints["ResizeSouth"] = 512] = "ResizeSouth";
    /** Shows/hides the top center resize handle of the selector */
    SelectorConstraints[SelectorConstraints["ResizeNorth"] = 1024] = "ResizeNorth";
    /**  Shows/hides the rotate handle of the selector */
    SelectorConstraints[SelectorConstraints["Rotate"] = 2048] = "Rotate";
    /** Shows/hides the user handles of the selector */
    SelectorConstraints[SelectorConstraints["UserHandle"] = 4096] = "UserHandle";
    /** Shows/hides the default tooltip of nodes and connectors */
    SelectorConstraints[SelectorConstraints["ToolTip"] = 8192] = "ToolTip";
    /** Shows/hides all resize handles of the selector */
    SelectorConstraints[SelectorConstraints["ResizeAll"] = 2046] = "ResizeAll";
    /** Shows all handles of the selector  */
    SelectorConstraints[SelectorConstraints["All"] = 16382] = "All";
})(SelectorConstraints || (SelectorConstraints = {}));
/** @private */
export var NoOfSegments;
(function (NoOfSegments) {
    NoOfSegments[NoOfSegments["Zero"] = 0] = "Zero";
    NoOfSegments[NoOfSegments["One"] = 1] = "One";
    NoOfSegments[NoOfSegments["Two"] = 2] = "Two";
    NoOfSegments[NoOfSegments["Three"] = 3] = "Three";
    NoOfSegments[NoOfSegments["Four"] = 4] = "Four";
    NoOfSegments[NoOfSegments["Five"] = 5] = "Five";
})(NoOfSegments || (NoOfSegments = {}));
