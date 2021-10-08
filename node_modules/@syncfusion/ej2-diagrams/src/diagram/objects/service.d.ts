/**
 * ServiceLocator
 *
 * @hidden
 */
export declare class ServiceLocator {
    private services;
    register<T>(name: string, type: T): void;
    getService<T>(name: string): T;
}
