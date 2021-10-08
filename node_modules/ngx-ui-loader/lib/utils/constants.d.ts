import { NgxUiLoaderConfig, Time } from '../utils/interfaces';
/**
 * The default value of foreground task id
 */
export declare const DEFAULT_FG_TASK_ID = "fg-default";
/**
 * The default value of background task id
 */
export declare const DEFAULT_BG_TASK_ID = "bg-default";
/**
 * The default value of loader id
 */
export declare const DEFAULT_MASTER_LOADER_ID = "master";
export declare const DEFAULT_TIME: Time;
export declare const MIN_DELAY = 0;
export declare const MIN_TIME = 0;
export declare const CLOSING_TIME = 1001;
export declare const FAST_CLOSING_TIME = 601;
export declare const BACKGROUND = false;
export declare const FOREGROUND = true;
export declare const OVERLAY_DISAPPEAR_TIME = 500;
export declare const FAST_OVERLAY_DISAPPEAR_TIME = 300;
/**
 * Http loader taskId
 */
export declare const HTTP_LOADER_TASK_ID = "$_http-loader";
/**
 * Router loader taskId
 */
export declare const ROUTER_LOADER_TASK_ID = "$_router_loader";
/**
 * The configuration of spinners
 */
export declare const SPINNER_CONFIG: {
    'ball-scale-multiple': {
        divs: number;
        class: string;
    };
    'ball-spin': {
        divs: number;
        class: string;
    };
    'ball-spin-clockwise': {
        divs: number;
        class: string;
    };
    'ball-spin-clockwise-fade-rotating': {
        divs: number;
        class: string;
    };
    'ball-spin-fade-rotating': {
        divs: number;
        class: string;
    };
    'chasing-dots': {
        divs: number;
        class: string;
    };
    circle: {
        divs: number;
        class: string;
    };
    'cube-grid': {
        divs: number;
        class: string;
    };
    'double-bounce': {
        divs: number;
        class: string;
    };
    'fading-circle': {
        divs: number;
        class: string;
    };
    'folding-cube': {
        divs: number;
        class: string;
    };
    pulse: {
        divs: number;
        class: string;
    };
    'rectangle-bounce': {
        divs: number;
        class: string;
    };
    'rectangle-bounce-party': {
        divs: number;
        class: string;
    };
    'rectangle-bounce-pulse-out': {
        divs: number;
        class: string;
    };
    'rectangle-bounce-pulse-out-rapid': {
        divs: number;
        class: string;
    };
    'rotating-plane': {
        divs: number;
        class: string;
    };
    'square-jelly-box': {
        divs: number;
        class: string;
    };
    'square-loader': {
        divs: number;
        class: string;
    };
    'three-bounce': {
        divs: number;
        class: string;
    };
    'three-strings': {
        divs: number;
        class: string;
    };
    'wandering-cubes': {
        divs: number;
        class: string;
    };
};
/**
 * The default configuration of ngx-ui-loader
 */
export declare const DEFAULT_CONFIG: NgxUiLoaderConfig;
