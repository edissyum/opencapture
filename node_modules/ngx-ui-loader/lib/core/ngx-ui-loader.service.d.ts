import { Observable } from 'rxjs';
import { NgxUiLoaderConfig } from '../utils/interfaces';
import { Loaders, Loader, ShowEvent, Time } from '../utils/interfaces';
export declare class NgxUiLoaderService {
    private config;
    /**
     * For internal use only.
     *
     * @docs-private
     */
    backgroundClosing$: Observable<ShowEvent>;
    /**
     * For internal use only.
     *
     * @docs-private
     */
    foregroundClosing$: Observable<ShowEvent>;
    /**
     * For internal use only.
     *
     * @docs-private
     */
    showBackground$: Observable<ShowEvent>;
    /**
     * For internal use only.
     *
     * @docs-private
     */
    showForeground$: Observable<ShowEvent>;
    private bgClosing;
    private defaultConfig;
    private fgClosing;
    private loaders;
    private showBackground;
    private showForeground;
    /**
     * Constructor
     */
    constructor(config: NgxUiLoaderConfig);
    /**
     * For internal use only.
     *
     * @docs-private
     */
    bindLoaderData(loaderId: string): void;
    /**
     * For internal use only.
     *
     * @docs-private
     */
    destroyLoaderData(loaderId: string): void;
    /**
     * Get default loader configuration
     *
     * @returns default configuration object
     */
    getDefaultConfig(): NgxUiLoaderConfig;
    /**
     * Get all the loaders
     */
    getLoaders(): Loaders;
    /**
     * Get data of a specified loader. If loaderId is not provided, it will return data of
     * master loader(if existed). Otherwise null is returned.
     */
    getLoader(loaderId?: string): Loader;
    /**
     * Start the foreground loading of loader having `loaderId` with a specified `taskId`.
     * The loading is only closed off when all taskIds of that loader are called with stopLoader() method.
     *
     * @param loaderId the loader Id
     * @param taskId the optional task Id of the loading. taskId is set to 'fd-default' by default.
     */
    startLoader(loaderId: string, taskId?: string, time?: Time): void;
    /**
     * Start the foreground loading of master loader with a specified `taskId`.
     * The loading is only closed off when all taskIds of that loader are called with stop() method.
     * NOTE: Really this function just wraps startLoader() function
     *
     * @param taskId the optional task Id of the loading. taskId is set to 'fd-default' by default.
     */
    start(taskId?: string, time?: Time): void;
    /**
     * Start the background loading of loader having `loaderId` with a specified `taskId`.
     * The loading is only closed off when all taskIds of that loader are called with stopLoaderBackground() method.
     *
     * @param loaderId the loader Id
     * @param taskId the optional task Id of the loading. taskId is set to 'bg-default' by default.
     */
    startBackgroundLoader(loaderId: string, taskId?: string, time?: Time): void;
    /**
     * Start the background loading of master loader with a specified `taskId`.
     * The loading is only closed off when all taskIds of that loader are called with stopBackground() method.
     * NOTE: Really this function just wraps startBackgroundLoader() function
     *
     * @param taskId the optional task Id of the loading. taskId is set to 'bg-default' by default.
     */
    startBackground(taskId?: string, time?: Time): void;
    /**
     * Stop a foreground loading of loader having `loaderId` with specific `taskId`
     *
     * @param loaderId the loader Id
     * @param taskId the optional task Id to stop. If not provided, 'fg-default' is used.
     * @returns Object
     */
    stopLoader(loaderId: string, taskId?: string): void;
    /**
     * Stop a foreground loading of master loader with specific `taskId`
     *
     * @param taskId the optional task Id to stop. If not provided, 'fg-default' is used.
     * @returns Object
     */
    stop(taskId?: string): void;
    /**
     * Stop a background loading of loader having `loaderId` with specific `taskId`
     *
     * @param loaderId the loader Id
     * @param taskId the optional task Id to stop. If not provided, 'bg-default' is used.
     * @returns Object
     */
    stopBackgroundLoader(loaderId: string, taskId?: string): void;
    /**
     * Stop a background loading of master loader with specific taskId
     *
     * @param taskId the optional task Id to stop. If not provided, 'bg-default' is used.
     * @returns Object
     */
    stopBackground(taskId?: string): void;
    /**
     * Stop all the background and foreground loadings of loader having `loaderId`
     *
     * @param loaderId the loader Id
     */
    stopAllLoader(loaderId: string): void;
    /**
     * Stop all the background and foreground loadings of master loader
     */
    stopAll(): void;
    /**
     * Check whether the specified loader has a running task with the given `taskId`.
     * If no `taskId` specified, it will check whether the loader has any running tasks.
     * For internal use only.
     *
     * @docs-private
     * @param isForeground foreground task or background task
     * @param loaderId the loader Id
     * @param taskId the optional task Id
     * @returns boolean
     */
    hasRunningTask(isForeground: boolean, loaderId: string, taskId?: string): boolean;
    /**
     * Create loader data if it does not exist
     *
     * @docs-private
     */
    private createLoaderData;
    /**
     * Manage to close foreground loading
     *
     * @docs-private
     * @param loaderId the loader id
     */
    private foregroundCloseout;
    /**
     * Manage to close background loading
     *
     * @docs-private
     * @param loaderId the loader id
     */
    private backgroundCloseout;
    /**
     * Clear all timers of the given task
     *
     * @docs-private
     */
    private clearTimers;
    /**
     * Clear all timers of the given tasks
     *
     * @docs-private
     */
    private clearAllTimers;
    /**
     * @docs-private
     */
    private readyToStart;
    /**
     * @docs-private
     */
    private readyToStop;
    /**
     * Set delay timer, if `delay` > 0
     *
     * @docs-private
     * @returns boolean
     */
    private setDelayTimer;
    /**
     * Set maxTimer if `maxTime` > `minTime`
     *
     * @docs-private
     * @returns boolean
     */
    private setMaxTimer;
    /**
     * Set minTimer if `startAt` + `minTime` > `Date.now()`
     *
     * @docs-private
     * @returns boolean
     */
    private setMinTimer;
}
