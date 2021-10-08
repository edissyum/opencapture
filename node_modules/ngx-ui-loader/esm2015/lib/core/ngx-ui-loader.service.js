import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BACKGROUND, CLOSING_TIME, DEFAULT_BG_TASK_ID, DEFAULT_CONFIG, DEFAULT_FG_TASK_ID, DEFAULT_TIME, FAST_CLOSING_TIME, FOREGROUND, MIN_DELAY, MIN_TIME, OVERLAY_DISAPPEAR_TIME, FAST_OVERLAY_DISAPPEAR_TIME, } from '../utils/constants';
import { NGX_UI_LOADER_CONFIG_TOKEN } from './ngx-ui-loader-config.token';
import * as i0 from "@angular/core";
import * as i1 from "./ngx-ui-loader-config.token";
export class NgxUiLoaderService {
    /**
     * Constructor
     */
    constructor(config) {
        this.config = config;
        this.defaultConfig = Object.assign({}, DEFAULT_CONFIG);
        if (this.config) {
            if (this.config.minTime && this.config.minTime < MIN_TIME) {
                this.config.minTime = MIN_TIME;
            }
            this.defaultConfig = Object.assign(Object.assign({}, this.defaultConfig), this.config);
        }
        this.loaders = {};
        this.showForeground = new BehaviorSubject({
            loaderId: '',
            isShow: false,
        });
        this.showForeground$ = this.showForeground.asObservable();
        this.showBackground = new BehaviorSubject({
            loaderId: '',
            isShow: false,
        });
        this.showBackground$ = this.showBackground.asObservable();
        this.fgClosing = new BehaviorSubject({
            loaderId: '',
            isShow: false,
        });
        this.foregroundClosing$ = this.fgClosing.asObservable();
        this.bgClosing = new BehaviorSubject({
            loaderId: '',
            isShow: false,
        });
        this.backgroundClosing$ = this.bgClosing.asObservable();
    }
    /**
     * For internal use only.
     *
     * @docs-private
     */
    bindLoaderData(loaderId) {
        const isMaster = loaderId === this.defaultConfig.masterLoaderId;
        if (this.loaders[loaderId]) {
            if (this.loaders[loaderId].isBound) {
                throw new Error(`[ngx-ui-loader] - loaderId "${loaderId}" is duplicated.`);
            }
            this.loaders[loaderId].isBound = true;
            this.loaders[loaderId].isMaster = isMaster;
            // emit showEvent after data loader is bound
            if (this.hasRunningTask(FOREGROUND, loaderId)) {
                this.showForeground.next({ loaderId, isShow: true });
            }
            else {
                if (this.hasRunningTask(BACKGROUND, loaderId)) {
                    this.showBackground.next({ loaderId, isShow: true });
                }
            }
        }
        else {
            this.createLoaderData(loaderId, isMaster, true);
        }
    }
    /**
     * For internal use only.
     *
     * @docs-private
     */
    destroyLoaderData(loaderId) {
        this.stopAllLoader(loaderId);
        delete this.loaders[loaderId];
    }
    /**
     * Get default loader configuration
     *
     * @returns default configuration object
     */
    getDefaultConfig() {
        return Object.assign({}, this.defaultConfig);
    }
    /**
     * Get all the loaders
     */
    getLoaders() {
        return JSON.parse(JSON.stringify(this.loaders));
    }
    /**
     * Get data of a specified loader. If loaderId is not provided, it will return data of
     * master loader(if existed). Otherwise null is returned.
     */
    getLoader(loaderId) {
        loaderId = loaderId ? loaderId : this.defaultConfig.masterLoaderId;
        if (this.loaders[loaderId]) {
            return JSON.parse(JSON.stringify(this.loaders[loaderId]));
        }
        return null;
    }
    /**
     * Start the foreground loading of loader having `loaderId` with a specified `taskId`.
     * The loading is only closed off when all taskIds of that loader are called with stopLoader() method.
     *
     * @param loaderId the loader Id
     * @param taskId the optional task Id of the loading. taskId is set to 'fd-default' by default.
     */
    startLoader(loaderId, taskId = DEFAULT_FG_TASK_ID, time) {
        if (!this.readyToStart(loaderId, taskId, true, time)) {
            return;
        }
        if (!this.loaders[loaderId].tasks[taskId].isOtherRunning) {
            // no other foreground task running
            if (this.hasRunningTask(BACKGROUND, loaderId)) {
                this.backgroundCloseout(loaderId);
                this.showBackground.next({ loaderId, isShow: false });
            }
            this.showForeground.next({ loaderId, isShow: true });
        }
    }
    /**
     * Start the foreground loading of master loader with a specified `taskId`.
     * The loading is only closed off when all taskIds of that loader are called with stop() method.
     * NOTE: Really this function just wraps startLoader() function
     *
     * @param taskId the optional task Id of the loading. taskId is set to 'fd-default' by default.
     */
    start(taskId = DEFAULT_FG_TASK_ID, time) {
        this.startLoader(this.defaultConfig.masterLoaderId, taskId, time);
    }
    /**
     * Start the background loading of loader having `loaderId` with a specified `taskId`.
     * The loading is only closed off when all taskIds of that loader are called with stopLoaderBackground() method.
     *
     * @param loaderId the loader Id
     * @param taskId the optional task Id of the loading. taskId is set to 'bg-default' by default.
     */
    startBackgroundLoader(loaderId, taskId = DEFAULT_BG_TASK_ID, time) {
        if (!this.readyToStart(loaderId, taskId, false, time)) {
            return;
        }
        if (!this.hasRunningTask(FOREGROUND, loaderId) &&
            !this.loaders[loaderId].tasks[taskId].isOtherRunning) {
            this.showBackground.next({ loaderId, isShow: true });
        }
    }
    /**
     * Start the background loading of master loader with a specified `taskId`.
     * The loading is only closed off when all taskIds of that loader are called with stopBackground() method.
     * NOTE: Really this function just wraps startBackgroundLoader() function
     *
     * @param taskId the optional task Id of the loading. taskId is set to 'bg-default' by default.
     */
    startBackground(taskId = DEFAULT_BG_TASK_ID, time) {
        this.startBackgroundLoader(this.defaultConfig.masterLoaderId, taskId, time);
    }
    /**
     * Stop a foreground loading of loader having `loaderId` with specific `taskId`
     *
     * @param loaderId the loader Id
     * @param taskId the optional task Id to stop. If not provided, 'fg-default' is used.
     * @returns Object
     */
    stopLoader(loaderId, taskId = DEFAULT_FG_TASK_ID) {
        if (!this.readyToStop(loaderId, taskId)) {
            return;
        }
        if (!this.hasRunningTask(FOREGROUND, loaderId)) {
            this.foregroundCloseout(loaderId);
            this.showForeground.next({ loaderId, isShow: false });
            if (this.hasRunningTask(BACKGROUND, loaderId)) {
                setTimeout(() => {
                    if (this.hasRunningTask(BACKGROUND, loaderId)) {
                        // still have background tasks
                        this.showBackground.next({ loaderId, isShow: true });
                    }
                }, this.defaultConfig.fastFadeOut
                    ? FAST_OVERLAY_DISAPPEAR_TIME
                    : OVERLAY_DISAPPEAR_TIME);
            }
        }
    }
    /**
     * Stop a foreground loading of master loader with specific `taskId`
     *
     * @param taskId the optional task Id to stop. If not provided, 'fg-default' is used.
     * @returns Object
     */
    stop(taskId = DEFAULT_FG_TASK_ID) {
        this.stopLoader(this.defaultConfig.masterLoaderId, taskId);
    }
    /**
     * Stop a background loading of loader having `loaderId` with specific `taskId`
     *
     * @param loaderId the loader Id
     * @param taskId the optional task Id to stop. If not provided, 'bg-default' is used.
     * @returns Object
     */
    stopBackgroundLoader(loaderId, taskId = DEFAULT_BG_TASK_ID) {
        if (!this.readyToStop(loaderId, taskId)) {
            return;
        }
        if (!this.hasRunningTask(FOREGROUND, loaderId) &&
            !this.hasRunningTask(BACKGROUND, loaderId)) {
            this.backgroundCloseout(loaderId);
            this.showBackground.next({ loaderId, isShow: false });
        }
    }
    /**
     * Stop a background loading of master loader with specific taskId
     *
     * @param taskId the optional task Id to stop. If not provided, 'bg-default' is used.
     * @returns Object
     */
    stopBackground(taskId = DEFAULT_BG_TASK_ID) {
        this.stopBackgroundLoader(this.defaultConfig.masterLoaderId, taskId);
    }
    /**
     * Stop all the background and foreground loadings of loader having `loaderId`
     *
     * @param loaderId the loader Id
     */
    stopAllLoader(loaderId) {
        if (!this.loaders[loaderId]) {
            console.warn(`[ngx-ui-loader] - loaderId "${loaderId}" does not exist.`);
            return;
        }
        if (this.hasRunningTask(FOREGROUND, loaderId)) {
            this.foregroundCloseout(loaderId);
            this.showForeground.next({ loaderId, isShow: false });
        }
        else if (this.hasRunningTask(BACKGROUND, loaderId)) {
            this.backgroundCloseout(loaderId);
            this.showBackground.next({ loaderId, isShow: false });
        }
        this.clearAllTimers(this.loaders[loaderId].tasks);
        this.loaders[loaderId].tasks = {};
    }
    /**
     * Stop all the background and foreground loadings of master loader
     */
    stopAll() {
        this.stopAllLoader(this.defaultConfig.masterLoaderId);
    }
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
    hasRunningTask(isForeground, loaderId, taskId) {
        if (this.loaders[loaderId]) {
            const tasks = this.loaders[loaderId].tasks;
            if (taskId) {
                return tasks[taskId] ? (tasks[taskId].startAt ? true : false) : false;
            }
            return Object.keys(tasks).some((id) => !!tasks[id].startAt && tasks[id].isForeground === isForeground);
        }
        return false;
    }
    /**
     * Create loader data if it does not exist
     *
     * @docs-private
     */
    createLoaderData(loaderId, isMaster, isBound) {
        if (!this.loaders[loaderId]) {
            this.loaders[loaderId] = {
                loaderId,
                tasks: {},
                isMaster,
                isBound,
            };
        }
    }
    /**
     * Manage to close foreground loading
     *
     * @docs-private
     * @param loaderId the loader id
     */
    foregroundCloseout(loaderId) {
        this.fgClosing.next({ loaderId, isShow: true });
        setTimeout(() => {
            this.fgClosing.next({ loaderId, isShow: false });
        }, this.defaultConfig.fastFadeOut ? FAST_CLOSING_TIME : CLOSING_TIME);
    }
    /**
     * Manage to close background loading
     *
     * @docs-private
     * @param loaderId the loader id
     */
    backgroundCloseout(loaderId) {
        this.bgClosing.next({ loaderId, isShow: true });
        setTimeout(() => {
            this.bgClosing.next({ loaderId, isShow: false });
        }, this.defaultConfig.fastFadeOut ? FAST_CLOSING_TIME : CLOSING_TIME);
    }
    /**
     * Clear all timers of the given task
     *
     * @docs-private
     */
    clearTimers(task) {
        clearTimeout(task.delayTimer);
        clearTimeout(task.maxTimer);
        clearTimeout(task.minTimer);
    }
    /**
     * Clear all timers of the given tasks
     *
     * @docs-private
     */
    clearAllTimers(tasks) {
        Object.keys(tasks).map((id) => {
            this.clearTimers(tasks[id]);
        });
    }
    /**
     * @docs-private
     */
    readyToStart(loaderId, taskId, isForeground, time = DEFAULT_TIME) {
        this.createLoaderData(loaderId, undefined, false);
        const isOtherRunning = this.hasRunningTask(isForeground, loaderId);
        if (!this.loaders[loaderId].tasks[taskId]) {
            this.loaders[loaderId].tasks[taskId] = {
                taskId,
                isForeground,
                minTime: time.minTime >= MIN_TIME ? time.minTime : this.defaultConfig.minTime,
                maxTime: time.maxTime ? time.maxTime : this.defaultConfig.maxTime,
                delay: time.delay >= MIN_DELAY ? time.delay : this.defaultConfig.delay,
            };
        }
        else {
            if (this.loaders[loaderId].tasks[taskId].isForeground !== isForeground) {
                throw new Error(`[ngx-ui-loader] - taskId "${taskId}" is duplicated.`);
            }
        }
        if (this.setDelayTimer(this.loaders[loaderId].tasks[taskId], loaderId)) {
            return false;
        }
        this.loaders[loaderId].tasks[taskId] = Object.assign(Object.assign({}, this.loaders[loaderId].tasks[taskId]), { isOtherRunning, startAt: Date.now() });
        this.setMaxTimer(this.loaders[loaderId].tasks[taskId], loaderId);
        if (!this.loaders[loaderId].isBound) {
            return false;
        }
        return true;
    }
    /**
     * @docs-private
     */
    readyToStop(loaderId, taskId) {
        if (!this.loaders[loaderId]) {
            console.warn(`[ngx-ui-loader] - loaderId "${loaderId}" does not exist.`);
            return false;
        }
        const task = this.loaders[loaderId].tasks[taskId];
        if (!task) {
            return false;
        }
        if (task.isDelayed) {
            this.clearTimers(task);
            delete this.loaders[loaderId].tasks[taskId];
            return false;
        }
        if (this.setMinTimer(task, loaderId)) {
            return false;
        }
        this.clearTimers(task);
        delete this.loaders[loaderId].tasks[taskId];
        return true;
    }
    /**
     * Set delay timer, if `delay` > 0
     *
     * @docs-private
     * @returns boolean
     */
    setDelayTimer(task, loaderId) {
        if (task.delay > MIN_DELAY) {
            if (task.isDelayed) {
                return true;
            }
            if (!task.delayTimer) {
                task.isDelayed = true;
                task.delayTimer = setTimeout(() => {
                    task.isDelayed = false;
                    if (task.isForeground) {
                        this.startLoader(loaderId, task.taskId);
                    }
                    else {
                        this.startBackgroundLoader(loaderId, task.taskId);
                    }
                }, task.delay);
                return true;
            }
        }
        return false;
    }
    /**
     * Set maxTimer if `maxTime` > `minTime`
     *
     * @docs-private
     * @returns boolean
     */
    setMaxTimer(task, loaderId) {
        if (task.maxTime > task.minTime) {
            // restart the task, reset maxTimer
            clearTimeout(task.maxTimer);
            task.maxTimer = setTimeout(() => {
                if (task.isForeground) {
                    this.stopLoader(loaderId, task.taskId);
                }
                else {
                    this.stopBackgroundLoader(loaderId, task.taskId);
                }
            }, task.maxTime);
        }
    }
    /**
     * Set minTimer if `startAt` + `minTime` > `Date.now()`
     *
     * @docs-private
     * @returns boolean
     */
    setMinTimer(task, loaderId) {
        const now = Date.now();
        if (task.startAt) {
            if (task.startAt + task.minTime > now) {
                task.minTimer = setTimeout(() => {
                    if (task.isForeground) {
                        this.stopLoader(loaderId, task.taskId);
                    }
                    else {
                        this.stopBackgroundLoader(loaderId, task.taskId);
                    }
                }, task.startAt + task.minTime - now);
                return true;
            }
        }
        return false;
    }
}
NgxUiLoaderService.ɵprov = i0.ɵɵdefineInjectable({ factory: function NgxUiLoaderService_Factory() { return new NgxUiLoaderService(i0.ɵɵinject(i1.NGX_UI_LOADER_CONFIG_TOKEN, 8)); }, token: NgxUiLoaderService, providedIn: "root" });
NgxUiLoaderService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
NgxUiLoaderService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [NGX_UI_LOADER_CONFIG_TOKEN,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXVpLWxvYWRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXVpLWxvYWRlci9zcmMvbGliL2NvcmUvbmd4LXVpLWxvYWRlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3RCxPQUFPLEVBQUUsZUFBZSxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBRW5ELE9BQU8sRUFDTCxVQUFVLEVBQ1YsWUFBWSxFQUNaLGtCQUFrQixFQUNsQixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixpQkFBaUIsRUFDakIsVUFBVSxFQUNWLFNBQVMsRUFDVCxRQUFRLEVBQ1Isc0JBQXNCLEVBQ3RCLDJCQUEyQixHQUM1QixNQUFNLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7QUFjMUUsTUFBTSxPQUFPLGtCQUFrQjtJQW9DN0I7O09BRUc7SUFDSCxZQUdVLE1BQXlCO1FBQXpCLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBRWpDLElBQUksQ0FBQyxhQUFhLHFCQUFRLGNBQWMsQ0FBRSxDQUFDO1FBQzNDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxFQUFFO2dCQUN6RCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7YUFDaEM7WUFDRCxJQUFJLENBQUMsYUFBYSxtQ0FBUSxJQUFJLENBQUMsYUFBYSxHQUFLLElBQUksQ0FBQyxNQUFNLENBQUUsQ0FBQztTQUNoRTtRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUks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U0FBQztnQkFDVixVQUFVLEVBQUUsTUFBTTthQUNuQjs7OzRDQXlDSSxRQUFRLFlBQ1IsTUFBTSxTQUFDLDBCQUEwQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge1xuICBCQUNLR1JPVU5ELFxuICBDTE9TSU5HX1RJTUUsXG4gIERFRkFVTFRfQkdfVEFTS19JRCxcbiAgREVGQVVMVF9DT05GSUcsXG4gIERFRkFVTFRfRkdfVEFTS19JRCxcbiAgREVGQVVMVF9USU1FLFxuICBGQVNUX0NMT1NJTkdfVElNRSxcbiAgRk9SRUdST1VORCxcbiAgTUlOX0RFTEFZLFxuICBNSU5fVElNRSxcbiAgT1ZFUkxBWV9ESVNBUFBFQVJfVElNRSxcbiAgRkFTVF9PVkVSTEFZX0RJU0FQUEVBUl9USU1FLFxufSBmcm9tICcuLi91dGlscy9jb25zdGFudHMnO1xuaW1wb3J0IHsgTkdYX1VJX0xPQURFUl9DT05GSUdfVE9LRU4gfSBmcm9tICcuL25neC11aS1sb2FkZXItY29uZmlnLnRva2VuJztcbmltcG9ydCB7IE5neFVpTG9hZGVyQ29uZmlnIH0gZnJvbSAnLi4vdXRpbHMvaW50ZXJmYWNlcyc7XG5pbXBvcnQge1xuICBMb2FkZXJzLFxuICBMb2FkZXIsXG4gIFNob3dFdmVudCxcbiAgVGFza3MsXG4gIFRhc2ssXG4gIFRpbWUsXG59IGZyb20gJy4uL3V0aWxzL2ludGVyZmFjZXMnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5leHBvcnQgY2xhc3MgTmd4VWlMb2FkZXJTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICpcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgYmFja2dyb3VuZENsb3NpbmckOiBPYnNlcnZhYmxlPFNob3dFdmVudD47XG5cbiAgLyoqXG4gICAqIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICpcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgZm9yZWdyb3VuZENsb3NpbmckOiBPYnNlcnZhYmxlPFNob3dFdmVudD47XG5cbiAgLyoqXG4gICAqIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICpcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgc2hvd0JhY2tncm91bmQkOiBPYnNlcnZhYmxlPFNob3dFdmVudD47XG5cbiAgLyoqXG4gICAqIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICpcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgc2hvd0ZvcmVncm91bmQkOiBPYnNlcnZhYmxlPFNob3dFdmVudD47XG5cbiAgcHJpdmF0ZSBiZ0Nsb3Npbmc6IEJlaGF2aW9yU3ViamVjdDxTaG93RXZlbnQ+O1xuICBwcml2YXRlIGRlZmF1bHRDb25maWc6IE5neFVpTG9hZGVyQ29uZmlnO1xuICBwcml2YXRlIGZnQ2xvc2luZzogQmVoYXZpb3JTdWJqZWN0PFNob3dFdmVudD47XG4gIHByaXZhdGUgbG9hZGVyczogTG9hZGVycztcbiAgcHJpdmF0ZSBzaG93QmFja2dyb3VuZDogQmVoYXZpb3JTdWJqZWN0PFNob3dFdmVudD47XG4gIHByaXZhdGUgc2hvd0ZvcmVncm91bmQ6IEJlaGF2aW9yU3ViamVjdDxTaG93RXZlbnQ+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKClcbiAgICBASW5qZWN0KE5HWF9VSV9MT0FERVJfQ09ORklHX1RPS0VOKVxuICAgIHByaXZhdGUgY29uZmlnOiBOZ3hVaUxvYWRlckNvbmZpZ1xuICApIHtcbiAgICB0aGlzLmRlZmF1bHRDb25maWcgPSB7IC4uLkRFRkFVTFRfQ09ORklHIH07XG4gICAgaWYgKHRoaXMuY29uZmlnKSB7XG4gICAgICBpZiAodGhpcy5jb25maWcubWluVGltZSAmJiB0aGlzLmNvbmZpZy5taW5UaW1lIDwgTUlOX1RJTUUpIHtcbiAgICAgICAgdGhpcy5jb25maWcubWluVGltZSA9IE1JTl9USU1FO1xuICAgICAgfVxuICAgICAgdGhpcy5kZWZhdWx0Q29uZmlnID0geyAuLi50aGlzLmRlZmF1bHRDb25maWcsIC4uLnRoaXMuY29uZmlnIH07XG4gICAgfVxuICAgIHRoaXMubG9hZGVycyA9IHt9O1xuICAgIHRoaXMuc2hvd0ZvcmVncm91bmQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFNob3dFdmVudD4oe1xuICAgICAgbG9hZGVySWQ6ICcnLFxuICAgICAgaXNTaG93OiBmYWxzZSxcbiAgICB9KTtcbiAgICB0aGlzLnNob3dGb3JlZ3JvdW5kJCA9IHRoaXMuc2hvd0ZvcmVncm91bmQuYXNPYnNlcnZhYmxlKCk7XG4gICAgdGhpcy5zaG93QmFja2dyb3VuZCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8U2hvd0V2ZW50Pih7XG4gICAgICBsb2FkZXJJZDogJycsXG4gICAgICBpc1Nob3c6IGZhbHNlLFxuICAgIH0pO1xuICAgIHRoaXMuc2hvd0JhY2tncm91bmQkID0gdGhpcy5zaG93QmFja2dyb3VuZC5hc09ic2VydmFibGUoKTtcbiAgICB0aGlzLmZnQ2xvc2luZyA9IG5ldyBCZWhhdmlvclN1YmplY3Q8U2hvd0V2ZW50Pih7XG4gICAgICBsb2FkZXJJZDogJycsXG4gICAgICBpc1Nob3c6IGZhbHNlLFxuICAgIH0pO1xuICAgIHRoaXMuZm9yZWdyb3VuZENsb3NpbmckID0gdGhpcy5mZ0Nsb3NpbmcuYXNPYnNlcnZhYmxlKCk7XG4gICAgdGhpcy5iZ0Nsb3NpbmcgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFNob3dFdmVudD4oe1xuICAgICAgbG9hZGVySWQ6ICcnLFxuICAgICAgaXNTaG93OiBmYWxzZSxcbiAgICB9KTtcbiAgICB0aGlzLmJhY2tncm91bmRDbG9zaW5nJCA9IHRoaXMuYmdDbG9zaW5nLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICpcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgYmluZExvYWRlckRhdGEobG9hZGVySWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGlzTWFzdGVyID0gbG9hZGVySWQgPT09IHRoaXMuZGVmYXVsdENvbmZpZy5tYXN0ZXJMb2FkZXJJZDtcbiAgICBpZiAodGhpcy5sb2FkZXJzW2xvYWRlcklkXSkge1xuICAgICAgaWYgKHRoaXMubG9hZGVyc1tsb2FkZXJJZF0uaXNCb3VuZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFtuZ3gtdWktbG9hZGVyXSAtIGxvYWRlcklkIFwiJHtsb2FkZXJJZH1cIiBpcyBkdXBsaWNhdGVkLmBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubG9hZGVyc1tsb2FkZXJJZF0uaXNCb3VuZCA9IHRydWU7XG4gICAgICB0aGlzLmxvYWRlcnNbbG9hZGVySWRdLmlzTWFzdGVyID0gaXNNYXN0ZXI7XG4gICAgICAvLyBlbWl0IHNob3dFdmVudCBhZnRlciBkYXRhIGxvYWRlciBpcyBib3VuZFxuICAgICAgaWYgKHRoaXMuaGFzUnVubmluZ1Rhc2soRk9SRUdST1VORCwgbG9hZGVySWQpKSB7XG4gICAgICAgIHRoaXMuc2hvd0ZvcmVncm91bmQubmV4dCh7IGxvYWRlcklkLCBpc1Nob3c6IHRydWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW5uaW5nVGFzayhCQUNLR1JPVU5ELCBsb2FkZXJJZCkpIHtcbiAgICAgICAgICB0aGlzLnNob3dCYWNrZ3JvdW5kLm5leHQoeyBsb2FkZXJJZCwgaXNTaG93OiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3JlYXRlTG9hZGVyRGF0YShsb2FkZXJJZCwgaXNNYXN0ZXIsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXG4gICAqXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGRlc3Ryb3lMb2FkZXJEYXRhKGxvYWRlcklkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3BBbGxMb2FkZXIobG9hZGVySWQpO1xuICAgIGRlbGV0ZSB0aGlzLmxvYWRlcnNbbG9hZGVySWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBkZWZhdWx0IGxvYWRlciBjb25maWd1cmF0aW9uXG4gICAqXG4gICAqIEByZXR1cm5zIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3RcbiAgICovXG4gIGdldERlZmF1bHRDb25maWcoKTogTmd4VWlMb2FkZXJDb25maWcge1xuICAgIHJldHVybiB7IC4uLnRoaXMuZGVmYXVsdENvbmZpZyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgdGhlIGxvYWRlcnNcbiAgICovXG4gIGdldExvYWRlcnMoKTogTG9hZGVycyB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5sb2FkZXJzKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGRhdGEgb2YgYSBzcGVjaWZpZWQgbG9hZGVyLiBJZiBsb2FkZXJJZCBpcyBub3QgcHJvdmlkZWQsIGl0IHdpbGwgcmV0dXJuIGRhdGEgb2ZcbiAgICogbWFzdGVyIGxvYWRlcihpZiBleGlzdGVkKS4gT3RoZXJ3aXNlIG51bGwgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBnZXRMb2FkZXIobG9hZGVySWQ/OiBzdHJpbmcpOiBMb2FkZXIge1xuICAgIGxvYWRlcklkID0gbG9hZGVySWQgPyBsb2FkZXJJZCA6IHRoaXMuZGVmYXVsdENvbmZpZy5tYXN0ZXJMb2FkZXJJZDtcbiAgICBpZiAodGhpcy5sb2FkZXJzW2xvYWRlcklkXSkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5sb2FkZXJzW2xvYWRlcklkXSkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgZm9yZWdyb3VuZCBsb2FkaW5nIG9mIGxvYWRlciBoYXZpbmcgYGxvYWRlcklkYCB3aXRoIGEgc3BlY2lmaWVkIGB0YXNrSWRgLlxuICAgKiBUaGUgbG9hZGluZyBpcyBvbmx5IGNsb3NlZCBvZmYgd2hlbiBhbGwgdGFza0lkcyBvZiB0aGF0IGxvYWRlciBhcmUgY2FsbGVkIHdpdGggc3RvcExvYWRlcigpIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIGxvYWRlcklkIHRoZSBsb2FkZXIgSWRcbiAgICogQHBhcmFtIHRhc2tJZCB0aGUgb3B0aW9uYWwgdGFzayBJZCBvZiB0aGUgbG9hZGluZy4gdGFza0lkIGlzIHNldCB0byAnZmQtZGVmYXVsdCcgYnkgZGVmYXVsdC5cbiAgICovXG4gIHN0YXJ0TG9hZGVyKFxuICAgIGxvYWRlcklkOiBzdHJpbmcsXG4gICAgdGFza0lkOiBzdHJpbmcgPSBERUZBVUxUX0ZHX1RBU0tfSUQsXG4gICAgdGltZT86IFRpbWVcbiAgKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnJlYWR5VG9TdGFydChsb2FkZXJJZCwgdGFza0lkLCB0cnVlLCB0aW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRoaXMubG9hZGVyc1tsb2FkZXJJZF0udGFza3NbdGFza0lkXS5pc090aGVyUnVubmluZykge1xuICAgICAgLy8gbm8gb3RoZXIgZm9yZWdyb3VuZCB0YXNrIHJ1bm5pbmdcbiAgICAgIGlmICh0aGlzLmhhc1J1bm5pbmdUYXNrKEJBQ0tHUk9VTkQsIGxvYWRlcklkKSkge1xuICAgICAgICB0aGlzLmJhY2tncm91bmRDbG9zZW91dChsb2FkZXJJZCk7XG4gICAgICAgIHRoaXMuc2hvd0JhY2tncm91bmQubmV4dCh7IGxvYWRlcklkLCBpc1Nob3c6IGZhbHNlIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5zaG93Rm9yZWdyb3VuZC5uZXh0KHsgbG9hZGVySWQsIGlzU2hvdzogdHJ1ZSB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdGhlIGZvcmVncm91bmQgbG9hZGluZyBvZiBtYXN0ZXIgbG9hZGVyIHdpdGggYSBzcGVjaWZpZWQgYHRhc2tJZGAuXG4gICAqIFRoZSBsb2FkaW5nIGlzIG9ubHkgY2xvc2VkIG9mZiB3aGVuIGFsbCB0YXNrSWRzIG9mIHRoYXQgbG9hZGVyIGFyZSBjYWxsZWQgd2l0aCBzdG9wKCkgbWV0aG9kLlxuICAgKiBOT1RFOiBSZWFsbHkgdGhpcyBmdW5jdGlvbiBqdXN0IHdyYXBzIHN0YXJ0TG9hZGVyKCkgZnVuY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHRhc2tJZCB0aGUgb3B0aW9uYWwgdGFzayBJZCBvZiB0aGUgbG9hZGluZy4gdGFza0lkIGlzIHNldCB0byAnZmQtZGVmYXVsdCcgYnkgZGVmYXVsdC5cbiAgICovXG4gIHN0YXJ0KHRhc2tJZDogc3RyaW5nID0gREVGQVVMVF9GR19UQVNLX0lELCB0aW1lPzogVGltZSk6IHZvaWQge1xuICAgIHRoaXMuc3RhcnRMb2FkZXIodGhpcy5kZWZhdWx0Q29uZmlnLm1hc3RlckxvYWRlcklkLCB0YXNrSWQsIHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBiYWNrZ3JvdW5kIGxvYWRpbmcgb2YgbG9hZGVyIGhhdmluZyBgbG9hZGVySWRgIHdpdGggYSBzcGVjaWZpZWQgYHRhc2tJZGAuXG4gICAqIFRoZSBsb2FkaW5nIGlzIG9ubHkgY2xvc2VkIG9mZiB3aGVuIGFsbCB0YXNrSWRzIG9mIHRoYXQgbG9hZGVyIGFyZSBjYWxsZWQgd2l0aCBzdG9wTG9hZGVyQmFja2dyb3VuZCgpIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIGxvYWRlcklkIHRoZSBsb2FkZXIgSWRcbiAgICogQHBhcmFtIHRhc2tJZCB0aGUgb3B0aW9uYWwgdGFzayBJZCBvZiB0aGUgbG9hZGluZy4gdGFza0lkIGlzIHNldCB0byAnYmctZGVmYXVsdCcgYnkgZGVmYXVsdC5cbiAgICovXG4gIHN0YXJ0QmFja2dyb3VuZExvYWRlcihcbiAgICBsb2FkZXJJZDogc3RyaW5nLFxuICAgIHRhc2tJZDogc3RyaW5nID0gREVGQVVMVF9CR19UQVNLX0lELFxuICAgIHRpbWU/OiBUaW1lXG4gICk6IHZvaWQge1xuICAgIGlmICghdGhpcy5yZWFkeVRvU3RhcnQobG9hZGVySWQsIHRhc2tJZCwgZmFsc2UsIHRpbWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChcbiAgICAgICF0aGlzLmhhc1J1bm5pbmdUYXNrKEZPUkVHUk9VTkQsIGxvYWRlcklkKSAmJlxuICAgICAgIXRoaXMubG9hZGVyc1tsb2FkZXJJZF0udGFza3NbdGFza0lkXS5pc090aGVyUnVubmluZ1xuICAgICkge1xuICAgICAgdGhpcy5zaG93QmFja2dyb3VuZC5uZXh0KHsgbG9hZGVySWQsIGlzU2hvdzogdHJ1ZSB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdGhlIGJhY2tncm91bmQgbG9hZGluZyBvZiBtYXN0ZXIgbG9hZGVyIHdpdGggYSBzcGVjaWZpZWQgYHRhc2tJZGAuXG4gICAqIFRoZSBsb2FkaW5nIGlzIG9ubHkgY2xvc2VkIG9mZiB3aGVuIGFsbCB0YXNrSWRzIG9mIHRoYXQgbG9hZGVyIGFyZSBjYWxsZWQgd2l0aCBzdG9wQmFja2dyb3VuZCgpIG1ldGhvZC5cbiAgICogTk9URTogUmVhbGx5IHRoaXMgZnVuY3Rpb24ganVzdCB3cmFwcyBzdGFydEJhY2tncm91bmRMb2FkZXIoKSBmdW5jdGlvblxuICAgKlxuICAgKiBAcGFyYW0gdGFza0lkIHRoZSBvcHRpb25hbCB0YXNrIElkIG9mIHRoZSBsb2FkaW5nLiB0YXNrSWQgaXMgc2V0IHRvICdiZy1kZWZhdWx0JyBieSBkZWZhdWx0LlxuICAgKi9cbiAgc3RhcnRCYWNrZ3JvdW5kKHRhc2tJZDogc3RyaW5nID0gREVGQVVMVF9CR19UQVNLX0lELCB0aW1lPzogVGltZSk6IHZvaWQge1xuICAgIHRoaXMuc3RhcnRCYWNrZ3JvdW5kTG9hZGVyKHRoaXMuZGVmYXVsdENvbmZpZy5tYXN0ZXJMb2FkZXJJZCwgdGFza0lkLCB0aW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIGEgZm9yZWdyb3VuZCBsb2FkaW5nIG9mIGxvYWRlciBoYXZpbmcgYGxvYWRlcklkYCB3aXRoIHNwZWNpZmljIGB0YXNrSWRgXG4gICAqXG4gICAqIEBwYXJhbSBsb2FkZXJJZCB0aGUgbG9hZGVyIElkXG4gICAqIEBwYXJhbSB0YXNrSWQgdGhlIG9wdGlvbmFsIHRhc2sgSWQgdG8gc3RvcC4gSWYgbm90IHByb3ZpZGVkLCAnZmctZGVmYXVsdCcgaXMgdXNlZC5cbiAgICogQHJldHVybnMgT2JqZWN0XG4gICAqL1xuICBzdG9wTG9hZGVyKGxvYWRlcklkOiBzdHJpbmcsIHRhc2tJZDogc3RyaW5nID0gREVGQVVMVF9GR19UQVNLX0lEKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnJlYWR5VG9TdG9wKGxvYWRlcklkLCB0YXNrSWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy5oYXNSdW5uaW5nVGFzayhGT1JFR1JPVU5ELCBsb2FkZXJJZCkpIHtcbiAgICAgIHRoaXMuZm9yZWdyb3VuZENsb3Nlb3V0KGxvYWRlcklkKTtcbiAgICAgIHRoaXMuc2hvd0ZvcmVncm91bmQubmV4dCh7IGxvYWRlcklkLCBpc1Nob3c6IGZhbHNlIH0pO1xuICAgICAgaWYgKHRoaXMuaGFzUnVubmluZ1Rhc2soQkFDS0dST1VORCwgbG9hZGVySWQpKSB7XG4gICAgICAgIHNldFRpbWVvdXQoXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzUnVubmluZ1Rhc2soQkFDS0dST1VORCwgbG9hZGVySWQpKSB7XG4gICAgICAgICAgICAgIC8vIHN0aWxsIGhhdmUgYmFja2dyb3VuZCB0YXNrc1xuICAgICAgICAgICAgICB0aGlzLnNob3dCYWNrZ3JvdW5kLm5leHQoeyBsb2FkZXJJZCwgaXNTaG93OiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdGhpcy5kZWZhdWx0Q29uZmlnLmZhc3RGYWRlT3V0XG4gICAgICAgICAgICA/IEZBU1RfT1ZFUkxBWV9ESVNBUFBFQVJfVElNRVxuICAgICAgICAgICAgOiBPVkVSTEFZX0RJU0FQUEVBUl9USU1FXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgYSBmb3JlZ3JvdW5kIGxvYWRpbmcgb2YgbWFzdGVyIGxvYWRlciB3aXRoIHNwZWNpZmljIGB0YXNrSWRgXG4gICAqXG4gICAqIEBwYXJhbSB0YXNrSWQgdGhlIG9wdGlvbmFsIHRhc2sgSWQgdG8gc3RvcC4gSWYgbm90IHByb3ZpZGVkLCAnZmctZGVmYXVsdCcgaXMgdXNlZC5cbiAgICogQHJldHVybnMgT2JqZWN0XG4gICAqL1xuICBzdG9wKHRhc2tJZDogc3RyaW5nID0gREVGQVVMVF9GR19UQVNLX0lEKTogdm9pZCB7XG4gICAgdGhpcy5zdG9wTG9hZGVyKHRoaXMuZGVmYXVsdENvbmZpZy5tYXN0ZXJMb2FkZXJJZCwgdGFza0lkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIGEgYmFja2dyb3VuZCBsb2FkaW5nIG9mIGxvYWRlciBoYXZpbmcgYGxvYWRlcklkYCB3aXRoIHNwZWNpZmljIGB0YXNrSWRgXG4gICAqXG4gICAqIEBwYXJhbSBsb2FkZXJJZCB0aGUgbG9hZGVyIElkXG4gICAqIEBwYXJhbSB0YXNrSWQgdGhlIG9wdGlvbmFsIHRhc2sgSWQgdG8gc3RvcC4gSWYgbm90IHByb3ZpZGVkLCAnYmctZGVmYXVsdCcgaXMgdXNlZC5cbiAgICogQHJldHVybnMgT2JqZWN0XG4gICAqL1xuICBzdG9wQmFja2dyb3VuZExvYWRlcihcbiAgICBsb2FkZXJJZDogc3RyaW5nLFxuICAgIHRhc2tJZDogc3RyaW5nID0gREVGQVVMVF9CR19UQVNLX0lEXG4gICk6IHZvaWQge1xuICAgIGlmICghdGhpcy5yZWFkeVRvU3RvcChsb2FkZXJJZCwgdGFza0lkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICAhdGhpcy5oYXNSdW5uaW5nVGFzayhGT1JFR1JPVU5ELCBsb2FkZXJJZCkgJiZcbiAgICAgICF0aGlzLmhhc1J1bm5pbmdUYXNrKEJBQ0tHUk9VTkQsIGxvYWRlcklkKVxuICAgICkge1xuICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2xvc2VvdXQobG9hZGVySWQpO1xuICAgICAgdGhpcy5zaG93QmFja2dyb3VuZC5uZXh0KHsgbG9hZGVySWQsIGlzU2hvdzogZmFsc2UgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgYSBiYWNrZ3JvdW5kIGxvYWRpbmcgb2YgbWFzdGVyIGxvYWRlciB3aXRoIHNwZWNpZmljIHRhc2tJZFxuICAgKlxuICAgKiBAcGFyYW0gdGFza0lkIHRoZSBvcHRpb25hbCB0YXNrIElkIHRvIHN0b3AuIElmIG5vdCBwcm92aWRlZCwgJ2JnLWRlZmF1bHQnIGlzIHVzZWQuXG4gICAqIEByZXR1cm5zIE9iamVjdFxuICAgKi9cbiAgc3RvcEJhY2tncm91bmQodGFza0lkOiBzdHJpbmcgPSBERUZBVUxUX0JHX1RBU0tfSUQpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3BCYWNrZ3JvdW5kTG9hZGVyKHRoaXMuZGVmYXVsdENvbmZpZy5tYXN0ZXJMb2FkZXJJZCwgdGFza0lkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIGFsbCB0aGUgYmFja2dyb3VuZCBhbmQgZm9yZWdyb3VuZCBsb2FkaW5ncyBvZiBsb2FkZXIgaGF2aW5nIGBsb2FkZXJJZGBcbiAgICpcbiAgICogQHBhcmFtIGxvYWRlcklkIHRoZSBsb2FkZXIgSWRcbiAgICovXG4gIHN0b3BBbGxMb2FkZXIobG9hZGVySWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5sb2FkZXJzW2xvYWRlcklkXSkge1xuICAgICAgY29uc29sZS53YXJuKGBbbmd4LXVpLWxvYWRlcl0gLSBsb2FkZXJJZCBcIiR7bG9hZGVySWR9XCIgZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmhhc1J1bm5pbmdUYXNrKEZPUkVHUk9VTkQsIGxvYWRlcklkKSkge1xuICAgICAgdGhpcy5mb3JlZ3JvdW5kQ2xvc2VvdXQobG9hZGVySWQpO1xuICAgICAgdGhpcy5zaG93Rm9yZWdyb3VuZC5uZXh0KHsgbG9hZGVySWQsIGlzU2hvdzogZmFsc2UgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmhhc1J1bm5pbmdUYXNrKEJBQ0tHUk9VTkQsIGxvYWRlcklkKSkge1xuICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2xvc2VvdXQobG9hZGVySWQpO1xuICAgICAgdGhpcy5zaG93QmFja2dyb3VuZC5uZXh0KHsgbG9hZGVySWQsIGlzU2hvdzogZmFsc2UgfSk7XG4gICAgfVxuICAgIHRoaXMuY2xlYXJBbGxUaW1lcnModGhpcy5sb2FkZXJzW2xvYWRlcklkXS50YXNrcyk7XG4gICAgdGhpcy5sb2FkZXJzW2xvYWRlcklkXS50YXNrcyA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgYWxsIHRoZSBiYWNrZ3JvdW5kIGFuZCBmb3JlZ3JvdW5kIGxvYWRpbmdzIG9mIG1hc3RlciBsb2FkZXJcbiAgICovXG4gIHN0b3BBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9wQWxsTG9hZGVyKHRoaXMuZGVmYXVsdENvbmZpZy5tYXN0ZXJMb2FkZXJJZCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgc3BlY2lmaWVkIGxvYWRlciBoYXMgYSBydW5uaW5nIHRhc2sgd2l0aCB0aGUgZ2l2ZW4gYHRhc2tJZGAuXG4gICAqIElmIG5vIGB0YXNrSWRgIHNwZWNpZmllZCwgaXQgd2lsbCBjaGVjayB3aGV0aGVyIHRoZSBsb2FkZXIgaGFzIGFueSBydW5uaW5nIHRhc2tzLlxuICAgKiBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXG4gICAqXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICogQHBhcmFtIGlzRm9yZWdyb3VuZCBmb3JlZ3JvdW5kIHRhc2sgb3IgYmFja2dyb3VuZCB0YXNrXG4gICAqIEBwYXJhbSBsb2FkZXJJZCB0aGUgbG9hZGVyIElkXG4gICAqIEBwYXJhbSB0YXNrSWQgdGhlIG9wdGlvbmFsIHRhc2sgSWRcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKi9cbiAgaGFzUnVubmluZ1Rhc2soXG4gICAgaXNGb3JlZ3JvdW5kOiBib29sZWFuLFxuICAgIGxvYWRlcklkOiBzdHJpbmcsXG4gICAgdGFza0lkPzogc3RyaW5nXG4gICk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmxvYWRlcnNbbG9hZGVySWRdKSB7XG4gICAgICBjb25zdCB0YXNrczogVGFza3MgPSB0aGlzLmxvYWRlcnNbbG9hZGVySWRdLnRhc2tzO1xuICAgICAgaWYgKHRhc2tJZCkge1xuICAgICAgICByZXR1cm4gdGFza3NbdGFza0lkXSA/ICh0YXNrc1t0YXNrSWRdLnN0YXJ0QXQgPyB0cnVlIDogZmFsc2UpIDogZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModGFza3MpLnNvbWUoXG4gICAgICAgIChpZCkgPT4gISF0YXNrc1tpZF0uc3RhcnRBdCAmJiB0YXNrc1tpZF0uaXNGb3JlZ3JvdW5kID09PSBpc0ZvcmVncm91bmRcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgbG9hZGVyIGRhdGEgaWYgaXQgZG9lcyBub3QgZXhpc3RcbiAgICpcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVMb2FkZXJEYXRhKFxuICAgIGxvYWRlcklkOiBzdHJpbmcsXG4gICAgaXNNYXN0ZXI6IGJvb2xlYW4sXG4gICAgaXNCb3VuZDogYm9vbGVhblxuICApOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMubG9hZGVyc1tsb2FkZXJJZF0pIHtcbiAgICAgIHRoaXMubG9hZGVyc1tsb2FkZXJJZF0gPSB7XG4gICAgICAgIGxvYWRlcklkLFxuICAgICAgICB0YXNrczoge30sXG4gICAgICAgIGlzTWFzdGVyLFxuICAgICAgICBpc0JvdW5kLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFuYWdlIHRvIGNsb3NlIGZvcmVncm91bmQgbG9hZGluZ1xuICAgKlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqIEBwYXJhbSBsb2FkZXJJZCB0aGUgbG9hZGVyIGlkXG4gICAqL1xuICBwcml2YXRlIGZvcmVncm91bmRDbG9zZW91dChsb2FkZXJJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5mZ0Nsb3NpbmcubmV4dCh7IGxvYWRlcklkLCBpc1Nob3c6IHRydWUgfSk7XG4gICAgc2V0VGltZW91dChcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy5mZ0Nsb3NpbmcubmV4dCh7IGxvYWRlcklkLCBpc1Nob3c6IGZhbHNlIH0pO1xuICAgICAgfSxcbiAgICAgIHRoaXMuZGVmYXVsdENvbmZpZy5mYXN0RmFkZU91dCA/IEZBU1RfQ0xPU0lOR19USU1FIDogQ0xPU0lOR19USU1FXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYW5hZ2UgdG8gY2xvc2UgYmFja2dyb3VuZCBsb2FkaW5nXG4gICAqXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICogQHBhcmFtIGxvYWRlcklkIHRoZSBsb2FkZXIgaWRcbiAgICovXG4gIHByaXZhdGUgYmFja2dyb3VuZENsb3Nlb3V0KGxvYWRlcklkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmJnQ2xvc2luZy5uZXh0KHsgbG9hZGVySWQsIGlzU2hvdzogdHJ1ZSB9KTtcbiAgICBzZXRUaW1lb3V0KFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLmJnQ2xvc2luZy5uZXh0KHsgbG9hZGVySWQsIGlzU2hvdzogZmFsc2UgfSk7XG4gICAgICB9LFxuICAgICAgdGhpcy5kZWZhdWx0Q29uZmlnLmZhc3RGYWRlT3V0ID8gRkFTVF9DTE9TSU5HX1RJTUUgOiBDTE9TSU5HX1RJTUVcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIGFsbCB0aW1lcnMgb2YgdGhlIGdpdmVuIHRhc2tcbiAgICpcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBjbGVhclRpbWVycyh0YXNrOiBUYXNrKTogdm9pZCB7XG4gICAgY2xlYXJUaW1lb3V0KHRhc2suZGVsYXlUaW1lcik7XG4gICAgY2xlYXJUaW1lb3V0KHRhc2subWF4VGltZXIpO1xuICAgIGNsZWFyVGltZW91dCh0YXNrLm1pblRpbWVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBhbGwgdGltZXJzIG9mIHRoZSBnaXZlbiB0YXNrc1xuICAgKlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBwcml2YXRlIGNsZWFyQWxsVGltZXJzKHRhc2tzOiBUYXNrcyk6IHZvaWQge1xuICAgIE9iamVjdC5rZXlzKHRhc2tzKS5tYXAoKGlkKSA9PiB7XG4gICAgICB0aGlzLmNsZWFyVGltZXJzKHRhc2tzW2lkXSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSByZWFkeVRvU3RhcnQoXG4gICAgbG9hZGVySWQ6IHN0cmluZyxcbiAgICB0YXNrSWQ6IHN0cmluZyxcbiAgICBpc0ZvcmVncm91bmQ6IGJvb2xlYW4sXG4gICAgdGltZTogVGltZSA9IERFRkFVTFRfVElNRVxuICApOiBib29sZWFuIHtcbiAgICB0aGlzLmNyZWF0ZUxvYWRlckRhdGEobG9hZGVySWQsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgIGNvbnN0IGlzT3RoZXJSdW5uaW5nID0gdGhpcy5oYXNSdW5uaW5nVGFzayhpc0ZvcmVncm91bmQsIGxvYWRlcklkKTtcbiAgICBpZiAoIXRoaXMubG9hZGVyc1tsb2FkZXJJZF0udGFza3NbdGFza0lkXSkge1xuICAgICAgdGhpcy5sb2FkZXJzW2xvYWRlcklkXS50YXNrc1t0YXNrSWRdID0ge1xuICAgICAgICB0YXNrSWQsXG4gICAgICAgIGlzRm9yZWdyb3VuZCxcbiAgICAgICAgbWluVGltZTpcbiAgICAgICAgICB0aW1lLm1pblRpbWUgPj0gTUlOX1RJTUUgPyB0aW1lLm1pblRpbWUgOiB0aGlzLmRlZmF1bHRDb25maWcubWluVGltZSxcbiAgICAgICAgbWF4VGltZTogdGltZS5tYXhUaW1lID8gdGltZS5tYXhUaW1lIDogdGhpcy5kZWZhdWx0Q29uZmlnLm1heFRpbWUsXG4gICAgICAgIGRlbGF5OiB0aW1lLmRlbGF5ID49IE1JTl9ERUxBWSA/IHRpbWUuZGVsYXkgOiB0aGlzLmRlZmF1bHRDb25maWcuZGVsYXksXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5sb2FkZXJzW2xvYWRlcklkXS50YXNrc1t0YXNrSWRdLmlzRm9yZWdyb3VuZCAhPT0gaXNGb3JlZ3JvdW5kKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgW25neC11aS1sb2FkZXJdIC0gdGFza0lkIFwiJHt0YXNrSWR9XCIgaXMgZHVwbGljYXRlZC5gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuc2V0RGVsYXlUaW1lcih0aGlzLmxvYWRlcnNbbG9hZGVySWRdLnRhc2tzW3Rhc2tJZF0sIGxvYWRlcklkKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmxvYWRlcnNbbG9hZGVySWRdLnRhc2tzW3Rhc2tJZF0gPSB7XG4gICAgICAuLi50aGlzLmxvYWRlcnNbbG9hZGVySWRdLnRhc2tzW3Rhc2tJZF0sXG4gICAgICBpc090aGVyUnVubmluZyxcbiAgICAgIHN0YXJ0QXQ6IERhdGUubm93KCksXG4gICAgfTtcbiAgICB0aGlzLnNldE1heFRpbWVyKHRoaXMubG9hZGVyc1tsb2FkZXJJZF0udGFza3NbdGFza0lkXSwgbG9hZGVySWQpO1xuICAgIGlmICghdGhpcy5sb2FkZXJzW2xvYWRlcklkXS5pc0JvdW5kKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgcmVhZHlUb1N0b3AobG9hZGVySWQ6IHN0cmluZywgdGFza0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMubG9hZGVyc1tsb2FkZXJJZF0pIHtcbiAgICAgIGNvbnNvbGUud2FybihgW25neC11aS1sb2FkZXJdIC0gbG9hZGVySWQgXCIke2xvYWRlcklkfVwiIGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB0YXNrOiBUYXNrID0gdGhpcy5sb2FkZXJzW2xvYWRlcklkXS50YXNrc1t0YXNrSWRdO1xuICAgIGlmICghdGFzaykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGFzay5pc0RlbGF5ZWQpIHtcbiAgICAgIHRoaXMuY2xlYXJUaW1lcnModGFzayk7XG4gICAgICBkZWxldGUgdGhpcy5sb2FkZXJzW2xvYWRlcklkXS50YXNrc1t0YXNrSWRdO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5zZXRNaW5UaW1lcih0YXNrLCBsb2FkZXJJZCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5jbGVhclRpbWVycyh0YXNrKTtcbiAgICBkZWxldGUgdGhpcy5sb2FkZXJzW2xvYWRlcklkXS50YXNrc1t0YXNrSWRdO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBkZWxheSB0aW1lciwgaWYgYGRlbGF5YCA+IDBcbiAgICpcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqL1xuICBwcml2YXRlIHNldERlbGF5VGltZXIodGFzazogVGFzaywgbG9hZGVySWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0YXNrLmRlbGF5ID4gTUlOX0RFTEFZKSB7XG4gICAgICBpZiAodGFzay5pc0RlbGF5ZWQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoIXRhc2suZGVsYXlUaW1lcikge1xuICAgICAgICB0YXNrLmlzRGVsYXllZCA9IHRydWU7XG4gICAgICAgIHRhc2suZGVsYXlUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRhc2suaXNEZWxheWVkID0gZmFsc2U7XG4gICAgICAgICAgaWYgKHRhc2suaXNGb3JlZ3JvdW5kKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0TG9hZGVyKGxvYWRlcklkLCB0YXNrLnRhc2tJZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRCYWNrZ3JvdW5kTG9hZGVyKGxvYWRlcklkLCB0YXNrLnRhc2tJZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0YXNrLmRlbGF5KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgbWF4VGltZXIgaWYgYG1heFRpbWVgID4gYG1pblRpbWVgXG4gICAqXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKi9cbiAgcHJpdmF0ZSBzZXRNYXhUaW1lcih0YXNrOiBUYXNrLCBsb2FkZXJJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRhc2subWF4VGltZSA+IHRhc2subWluVGltZSkge1xuICAgICAgLy8gcmVzdGFydCB0aGUgdGFzaywgcmVzZXQgbWF4VGltZXJcbiAgICAgIGNsZWFyVGltZW91dCh0YXNrLm1heFRpbWVyKTtcbiAgICAgIHRhc2subWF4VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKHRhc2suaXNGb3JlZ3JvdW5kKSB7XG4gICAgICAgICAgdGhpcy5zdG9wTG9hZGVyKGxvYWRlcklkLCB0YXNrLnRhc2tJZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zdG9wQmFja2dyb3VuZExvYWRlcihsb2FkZXJJZCwgdGFzay50YXNrSWQpO1xuICAgICAgICB9XG4gICAgICB9LCB0YXNrLm1heFRpbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgbWluVGltZXIgaWYgYHN0YXJ0QXRgICsgYG1pblRpbWVgID4gYERhdGUubm93KClgXG4gICAqXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKi9cbiAgcHJpdmF0ZSBzZXRNaW5UaW1lcih0YXNrOiBUYXNrLCBsb2FkZXJJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBpZiAodGFzay5zdGFydEF0KSB7XG4gICAgICBpZiAodGFzay5zdGFydEF0ICsgdGFzay5taW5UaW1lID4gbm93KSB7XG4gICAgICAgIHRhc2subWluVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZiAodGFzay5pc0ZvcmVncm91bmQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcExvYWRlcihsb2FkZXJJZCwgdGFzay50YXNrSWQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BCYWNrZ3JvdW5kTG9hZGVyKGxvYWRlcklkLCB0YXNrLnRhc2tJZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0YXNrLnN0YXJ0QXQgKyB0YXNrLm1pblRpbWUgLSBub3cpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=