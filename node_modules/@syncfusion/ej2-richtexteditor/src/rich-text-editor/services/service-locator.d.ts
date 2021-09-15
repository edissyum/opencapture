/**
 * ServiceLocator
 *
 * @hidden

 */
export declare class ServiceLocator {
    private services;
    /**
     * register method
     *
     * @param {string} name - specifies the name.
     * @param {T} type - specifies the type.
     * @returns {void}
     * @hidden

     */
    register<T>(name: string, type: T): void;
    /**
     * getService method
     *
     * @param {string} name - specifies the name.
     * @returns {void}
     * @hidden

     */
    getService<T>(name: string): T;
}
