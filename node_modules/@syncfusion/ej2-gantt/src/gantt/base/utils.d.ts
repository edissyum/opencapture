import { ITaskData, IGanttData, ITaskAddedEventArgs } from './interface';
import { Gantt } from './gantt';
/**
 * @param {Element} elem .
 * @param {string} selector .
 * @param {boolean} isID .
 * @returns {Element} .
 * @hidden
 */
export declare function parentsUntil(elem: Element, selector: string, isID?: boolean): Element;
/**
 * @param {ITaskData} ganttProp .
 * @returns {boolean} .
 * @hidden
 */
export declare function isScheduledTask(ganttProp: ITaskData): boolean;
/**
 * @param {Gantt} parent .
 * @returns {boolean} .
 * @hidden
 */
export declare function isCountRequired(parent: Gantt): boolean;
/**
 * @param {object} obj .
 * @returns {object} .
 * @hidden
 */
export declare function getSwapKey(obj: Object): object;
/**
 * @param {object} dataSource .
 * @returns {boolean} .
 * @hidden
 */
export declare function isRemoteData(dataSource: object): boolean;
/**
 * @param {IGanttData[]} records .
 * @param {boolean} isNotExtend .
 * @param {ITaskAddedEventArgs} eventArgs .
 * @param {Gantt} parent .
 * @returns {object[]} .
 * @hidden
 */
export declare function getTaskData(records: IGanttData[], isNotExtend?: boolean, eventArgs?: ITaskAddedEventArgs, parent?: Gantt): object[] | object;
/**
 * @param {IGanttData} record .
 * @param {Gantt} parent .
 * @returns {null} .
 * @hidden
 */
export declare function updateDates(record: IGanttData, parent: Gantt): void;
/**
 * @param {string} str .
 * @param {string[]} args .
 * @returns {string} .
 * @hidden
 */
export declare function formatString(str: string, args: string[]): string;
/**
 * @param {any} value .
 * @param {string} key1 .
 * @param {any} collection .
 * @param {string} key2
 * @returns {number} .
 * @hidden
 */
export declare function getIndex(value: any, key1: string, collection: any, key2?: string): number;
/**
 * @param {number} value .
 * @returns {number} .
 * @hidden
 */
export declare function pixelToPoint(value: number): number;
/**
 * @param {number} value .
 * @returns {number} .
 * @hidden
 */
export declare function pointToPixel(value: number): number;
/**
 * @returns {number} .
 * @hidden
 */
export declare function getUid(): number;
