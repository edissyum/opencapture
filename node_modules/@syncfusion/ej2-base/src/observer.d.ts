/**
 * Observer is used to perform event handling based the object.
 * ```
 * //Creating observer instance.
 * let observer:Observer = Observer(this);
 * let handler: Function = (a:number, b: number): number => {return a + b; }
 * //add handler to event.
 * observe.on('eventname', handler);
 * //remove handler from event.
 * observe.off('eventname', handler);
 * //notify the handlers in event.
 * observe.notify('eventname');
 * ```
 *
 */
export interface BoundOptions {
    handler?: Function;
    context?: Object;
    event?: string;
    id?: string;
}
export declare class Observer {
    private context;
    private ranArray;
    private boundedEvents;
    constructor(context?: Object);
    /**
     * To attach handler for given property in current context.
     *
     * @param {string} property - specifies the name of the event.
     * @param {Function} handler - Specifies the handler function to be called while event notified.
     * @param {Object} context - Specifies the context binded to the handler.
     * @param {string} id - specifies the random generated id.
     * @returns {void}
     */
    on(property: string, handler: Function, context?: Object, id?: string): void;
    /**
     * To remove handlers from a event attached using on() function.
     *
     * @param {string} property - specifies the name of the event.
     * @param {Function} handler - Optional argument specifies the handler function to be called while event notified.
     * @param {string} id - specifies the random generated id.
     * @returns {void} ?
     */
    off(property: string, handler?: Function, id?: string): void;
    /**
     * To notify the handlers in the specified event.
     *
     * @param {string} property - Specifies the event to be notify.
     * @param {Object} argument - Additional parameters to pass while calling the handler.
     * @param {Function} successHandler - this function will invoke after event successfully triggered
     * @param {Function} errorHandler - this function will invoke after event if it was failure to call.
     * @returns {void} ?
     */
    notify(property: string, argument?: Object, successHandler?: Function, errorHandler?: Function): void | Object;
    private blazorCallback;
    dateReviver(key: any, value: any): void | object;
    isJson(value: string): boolean;
    /**
     * To destroy handlers in the event
     *
     * @returns {void} ?
     */
    destroy(): void;
    /**
     * Returns if the property exists.
     *
     * @param {string} prop ?
     * @returns {boolean} ?
     */
    private notExist;
    /**
     * Returns if the handler is present.
     *
     * @param {BoundOptions[]} boundedEvents ?
     * @param {Function} handler ?
     * @returns {boolean} ?
     */
    private isHandlerPresent;
}
