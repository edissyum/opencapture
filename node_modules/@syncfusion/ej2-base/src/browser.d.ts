/**
 * Get configuration details for Browser
 *
 * @private
 */
export declare class Browser {
    private static uA;
    private static extractBrowserDetail;
    /**
     * To get events from the browser
     *
     * @param {string} event - type of event triggered.
     * @returns {boolean}
     */
    private static getEvent;
    /**
     * To get the Touch start event from browser
     *
     * @returns {string}
     */
    private static getTouchStartEvent;
    /**
     * To get the Touch end event from browser
     *
     * @returns {string}
     */
    private static getTouchEndEvent;
    /**
     * To get the Touch move event from browser
     *
     * @returns {string}
     */
    private static getTouchMoveEvent;
    /**
     * To cancel the touch event from browser
     *
     * @returns {string}
     */
    private static getTouchCancelEvent;
    /**
     * To get the value based on provided key and regX
     *
     * @param {string} key ?
     * @param {RegExp} regX ?
     * @returns {Object} ?
     */
    private static getValue;
    /**
     * Property specifies the userAgent of the browser. Default userAgent value is based on the browser.
     * Also we can set our own userAgent.
     *
     * @param {string} uA ?
     */
    static userAgent: string;
    /**
     * Property is to get the browser information like Name, Version and Language
     *
     * @returns {BrowserInfo} ?
     */
    static readonly info: BrowserInfo;
    /**
     * Property is to get whether the userAgent is based IE.
     *
     * @returns {boolean} ?
     */
    static readonly isIE: boolean;
    /**
     * Property is to get whether the browser has touch support.
     *
     * @returns {boolean} ?
     */
    static readonly isTouch: boolean;
    /**
     * Property is to get whether the browser has Pointer support.
     *
     * @returns {boolean} ?
     */
    static readonly isPointer: boolean;
    /**
     * Property is to get whether the browser has MSPointer support.
     *
     * @returns {boolean} ?
     */
    static readonly isMSPointer: boolean;
    /**
     * Property is to get whether the userAgent is device based.
     *
     * @returns {boolean} ?
     */
    static readonly isDevice: boolean;
    /**
     * Property is to get whether the userAgent is IOS.
     *
     * @returns {boolean} ?
     */
    static readonly isIos: boolean;
    /**
     * Property is to get whether the userAgent is Ios7.
     *
     * @returns {boolean} ?
     */
    static readonly isIos7: boolean;
    /**
     * Property is to get whether the userAgent is Android.
     *
     * @returns {boolean} ?
     */
    static readonly isAndroid: boolean;
    /**
     * Property is to identify whether application ran in web view.
     *
     * @returns {boolean} ?
     */
    static readonly isWebView: boolean;
    /**
     * Property is to get whether the userAgent is Windows.
     *
     * @returns {boolean} ?
     */
    static readonly isWindows: boolean;
    /**
     * Property is to get the touch start event. It returns event name based on browser.
     *
     * @returns {string} ?
     */
    static readonly touchStartEvent: string;
    /**
     * Property is to get the touch move event. It returns event name based on browser.
     *
     * @returns {string} ?
     */
    static readonly touchMoveEvent: string;
    /**
     * Property is to get the touch end event. It returns event name based on browser.
     *
     * @returns {string} ?
     */
    static readonly touchEndEvent: string;
    /**
     * Property is to cancel the touch end event.
     *
     * @returns {string} ?
     */
    static readonly touchCancelEvent: string;
}
export interface BrowserDetails {
    isAndroid?: boolean;
    isDevice?: boolean;
    isIE?: boolean;
    isIos?: boolean;
    isIos7?: boolean;
    isMSPointer?: boolean;
    isPointer?: boolean;
    isTouch?: boolean;
    isWebView?: boolean;
    isWindows?: boolean;
    info?: BrowserInfo;
    touchStartEvent?: string;
    touchMoveEvent?: string;
    touchEndEvent?: string;
    touchCancelEvent?: string;
}
export interface BrowserInfo {
    name?: string;
    version?: string;
    culture?: {
        name?: string;
        language?: string;
    };
}
