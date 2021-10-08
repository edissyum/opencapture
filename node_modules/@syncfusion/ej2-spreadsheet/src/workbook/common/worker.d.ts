/**
 * Worker task.
 *
 * @param {Object} context - Specify the context.
 * @param {Function | Object} taskFn - Specify the task.
 * @param {Function} callbackFn - Specify the callbackFn.
 * @param {Object[]} data - Specify the data.
 * @param {boolean} preventCallback - Specify the preventCallback.
 * @returns {WorkerHelper} - Worker task.
 */
export declare function executeTaskAsync(context: Object, taskFn: Function | {
    [key: string]: Function | string[];
}, callbackFn: Function, data?: Object[], preventCallback?: boolean): WorkerHelper;
/**
 * @hidden
 *
 * The `WorkerHelper` module is used to perform multiple actions using Web Worker asynchronously.
 */
declare class WorkerHelper {
    private context;
    private worker;
    private workerTask;
    private defaultListener;
    private workerData;
    private preventCallback;
    private workerUrl;
    /**
     * Constructor for WorkerHelper module in Workbook library.
     *
     * @private
     * @param {Object} context - Specify the context.
     * @param {Function | Object} task - Specify the task.
     * @param {Function} defaultListener - Specify the defaultListener.
     * @param {Object[]} taskData - Specify the taskData.
     * @param {boolean} preventCallback - Specify the preventCallback.
     */
    constructor(context: Object, task: Function | {
        [key: string]: Function | string[];
    }, defaultListener: Function, taskData?: Object[], preventCallback?: boolean);
    /**
     * To terminate the worker task.
     *
     * @private
     * @returns {void} - To terminate the worker task.
     */
    terminate(): void;
    /**
     * To initiate the worker.
     *
     * @private
     * @returns {void} - To initiate the worker.
     */
    private initWorker;
    /**
     * Method for getting response from worker.
     *
     * @param {MessageEvent} args - Specify the args.
     * @returns {void} - Method for getting response from worker.
     * @private
     */
    private messageFromWorker;
    /**
     * Method for getting error message from worker if failed.
     *
     * @param {ErrorEvent} args - Specify the args.
     * @returns {void} - Method for getting error message from worker if failed.
     * @private
     */
    private onError;
    /**
     * Construct function code for worker.
     *
     * @private
     * @returns {string} -  Construct function code for worker.
     */
    private getFnCode;
    /**
     * Get default worker task with callback.
     *
     * @private
     * @param {MessageEvent} args - Specify the args.
     * @returns {void} - Get default worker task without callback.
     */
    private getCallbackMessageFn;
    /**
     * Get default worker task without callback.
     *
     * @private
     * @param {MessageEvent} args - Specify the args.
     * @returns {void} - Get default worker task without callback.
     */
    private getMessageFn;
}
export {};
