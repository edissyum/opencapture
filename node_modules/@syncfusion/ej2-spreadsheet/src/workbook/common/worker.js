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
export function executeTaskAsync(context, taskFn, callbackFn, data, preventCallback) {
    return new WorkerHelper(context, taskFn, callbackFn, data, preventCallback);
}
/**
 * @hidden
 *
 * The `WorkerHelper` module is used to perform multiple actions using Web Worker asynchronously.
 */
var WorkerHelper = /** @class */ (function () {
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
    function WorkerHelper(context, task, defaultListener, taskData, preventCallback) {
        this.preventCallback = false;
        this.context = context;
        this.workerTask = task;
        this.defaultListener = defaultListener;
        this.workerData = taskData;
        if (preventCallback) {
            this.preventCallback = true;
        }
        this.initWorker();
    }
    /**
     * To terminate the worker task.
     *
     * @private
     * @returns {void} - To terminate the worker task.
     */
    WorkerHelper.prototype.terminate = function () {
        this.worker.terminate();
        URL.revokeObjectURL(this.workerUrl);
    };
    /**
     * To initiate the worker.
     *
     * @private
     * @returns {void} - To initiate the worker.
     */
    WorkerHelper.prototype.initWorker = function () {
        var taskBlob = new Blob([this.getFnCode()], { type: 'text/javascript' });
        this.workerUrl = URL.createObjectURL(taskBlob);
        this.worker = new Worker(this.workerUrl);
        this.worker.onmessage = this.messageFromWorker.bind(this);
        this.worker.onerror = this.onError.bind(this);
        this.worker.postMessage(this.workerData);
    };
    /**
     * Method for getting response from worker.
     *
     * @param {MessageEvent} args - Specify the args.
     * @returns {void} - Method for getting response from worker.
     * @private
     */
    WorkerHelper.prototype.messageFromWorker = function (args) {
        this.terminate();
        this.defaultListener.apply(this.context, [args.data]);
    };
    /**
     * Method for getting error message from worker if failed.
     *
     * @param {ErrorEvent} args - Specify the args.
     * @returns {void} - Method for getting error message from worker if failed.
     * @private
     */
    WorkerHelper.prototype.onError = function (args) {
        this.terminate();
        throw args.message || args;
    };
    /**
     * Construct function code for worker.
     *
     * @private
     * @returns {string} -  Construct function code for worker.
     */
    WorkerHelper.prototype.getFnCode = function () {
        var workerCode = '';
        var i;
        var keys;
        var workerFunction = '';
        var isHaveFunction = false;
        if (typeof this.workerTask === 'function') {
            if (this.workerTask.toString().indexOf('function') < 0) {
                workerFunction = 'function ' + this.workerTask.toString();
            }
            else {
                workerFunction = this.workerTask.toString();
                isHaveFunction = true;
            }
            workerCode += ('self.workerTask = ' + workerFunction + '; \n');
        }
        else {
            if (typeof this.workerTask === 'object') {
                keys = Object.keys(this.workerTask);
                for (i = 0; i < keys.length; i++) {
                    if (this.workerTask[keys[i]].toString().indexOf('function') < 0) {
                        workerFunction = 'function ' + this.workerTask[keys[i]].toString();
                    }
                    else {
                        workerFunction = this.workerTask[keys[i]].toString();
                        isHaveFunction = true;
                    }
                    workerCode += ((i === 0 ? 'self.workerTask' : keys[i]) + '= ' + workerFunction + '; \n');
                }
            }
        }
        workerCode += 'self.onmessage = ' + (isHaveFunction ? '' : ' function ') +
            (this.preventCallback ? this.getMessageFn.toString() : this.getCallbackMessageFn.toString()) + '; \n';
        return workerCode;
    };
    /**
     * Get default worker task with callback.
     *
     * @private
     * @param {MessageEvent} args - Specify the args.
     * @returns {void} - Get default worker task without callback.
     */
    WorkerHelper.prototype.getCallbackMessageFn = function (args) {
        postMessage(this.workerTask.apply(this, args.data));
    };
    /**
     * Get default worker task without callback.
     *
     * @private
     * @param {MessageEvent} args - Specify the args.
     * @returns {void} - Get default worker task without callback.
     */
    WorkerHelper.prototype.getMessageFn = function (args) {
        this.workerTask.apply(this, args.data);
    };
    return WorkerHelper;
}());
