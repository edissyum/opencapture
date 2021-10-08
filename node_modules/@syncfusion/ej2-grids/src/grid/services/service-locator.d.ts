import { Filter } from '../actions/filter';
import { Sort } from '../actions/sort';
import { ResponsiveDialogAction } from '../base/enum';
/**
 * ServiceLocator
 *
 * @hidden
 */
export declare class ServiceLocator {
    private services;
    register<T>(name: string, type: T): void;
    getService<T>(name: string): T;
    registerAdaptiveService(type: Filter | Sort, isAdaptiveUI: boolean, action: ResponsiveDialogAction): void;
}
