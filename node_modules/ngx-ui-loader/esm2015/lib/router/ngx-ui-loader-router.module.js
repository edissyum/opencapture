import { NgModule, Inject, Optional, SkipSelf, } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, } from '@angular/router';
import { NgxUiLoaderService } from '../core/ngx-ui-loader.service';
import { NGX_UI_LOADER_ROUTER_CONFIG_TOKEN } from './ngx-ui-loader-router-config.token';
import { ROUTER_LOADER_TASK_ID } from '../utils/constants';
import { getExcludeObj, isIgnored } from '../utils/functions';
export class NgxUiLoaderRouterModule {
    /**
     * Constructor
     */
    constructor(parentModule, customConfig, router, loader) {
        if (parentModule) {
            throw new Error('[ngx-ui-loader] - NgxUiLoaderRouterModule is already loaded. It should be imported in the root `AppModule` only!');
        }
        let config = {
            loaderId: loader.getDefaultConfig().masterLoaderId,
            showForeground: true,
        };
        this.exclude = getExcludeObj(customConfig);
        if (customConfig) {
            config = Object.assign(Object.assign({}, config), customConfig);
        }
        router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                if (!isIgnored(event.url, this.exclude.strs, this.exclude.regExps)) {
                    if (config.showForeground) {
                        loader.startLoader(config.loaderId, ROUTER_LOADER_TASK_ID);
                    }
                    else {
                        loader.startBackgroundLoader(config.loaderId, ROUTER_LOADER_TASK_ID);
                    }
                }
            }
            if (event instanceof NavigationEnd ||
                event instanceof NavigationCancel ||
                event instanceof NavigationError) {
                if (!isIgnored(event.url, this.exclude.strs, this.exclude.regExps)) {
                    if (config.showForeground) {
                        loader.stopLoader(config.loaderId, ROUTER_LOADER_TASK_ID);
                    }
                    else {
                        loader.stopBackgroundLoader(config.loaderId, ROUTER_LOADER_TASK_ID);
                    }
                }
            }
        });
    }
    /**
     * forRoot
     *
     * @returns A module with its provider dependencies
     */
    static forRoot(routerConfig) {
        return {
            ngModule: NgxUiLoaderRouterModule,
            providers: [
                {
                    provide: NGX_UI_LOADER_ROUTER_CONFIG_TOKEN,
                    useValue: routerConfig,
                },
            ],
        };
    }
}
NgxUiLoaderRouterModule.decorators = [
    { type: NgModule, args: [{},] }
];
NgxUiLoaderRouterModule.ctorParameters = () => [
    { type: NgxUiLoaderRouterModule, decorators: [{ type: Optional }, { type: SkipSelf }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [NGX_UI_LOADER_ROUTER_CONFIG_TOKEN,] }] },
    { type: Router },
    { type: NgxUiLoaderService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXVpLWxvYWRlci1yb3V0ZXIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXVpLWxvYWRlci9zcmMvbGliL3JvdXRlci9uZ3gtdWktbG9hZGVyLXJvdXRlci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFFBQVEsRUFFUixNQUFNLEVBQ04sUUFBUSxFQUNSLFFBQVEsR0FDVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixlQUFlLEVBQ2YsZUFBZSxFQUNmLE1BQU0sR0FFUCxNQUFNLGlCQUFpQixDQUFDO0FBRXpCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRW5FLE9BQU8sRUFBRSxpQ0FBaUMsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzNELE9BQU8sRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFJOUQsTUFBTSxPQUFPLHVCQUF1QjtJQUdsQzs7T0FFRztJQUNILFlBQzBCLFlBQXFDLEVBRzdELFlBQXFDLEVBQ3JDLE1BQWMsRUFDZCxNQUEwQjtRQUUxQixJQUFJLFlBQVksRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUNiLGtIQUFrSCxDQUNuSCxDQUFDO1NBQ0g7UUFFRCxJQUFJLE1BQU0sR0FBNEI7WUFDcEMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLGNBQWM7WUFDbEQsY0FBYyxFQUFFLElBQUk7U0FDckIsQ0FBQztRQUVGLElBQUksQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTNDLElBQUksWUFBWSxFQUFFO1lBQ2hCLE1BQU0sbUNBQVEsTUFBTSxHQUFLLFlBQVksQ0FBRSxDQUFDO1NBQ3pDO1FBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFrQixFQUFFLEVBQUU7WUFDN0MsSUFBSSxLQUFLLFlBQVksZUFBZSxFQUFFO2dCQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDbEUsSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFO3dCQUN6QixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsQ0FBQztxQkFDNUQ7eUJBQU07d0JBQ0wsTUFBTSxDQUFDLHFCQUFxQixDQUMxQixNQUFNLENBQUMsUUFBUSxFQUNmLHFCQUFxQixDQUN0QixDQUFDO3FCQUNIO2lCQUNGO2FBQ0Y7WUFFRCxJQUNFLEtBQUssWUFBWSxhQUFhO2dCQUM5QixLQUFLLFlBQVksZ0JBQWdCO2dCQUNqQyxLQUFLLFlBQVksZUFBZSxFQUNoQztnQkFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDbEUsSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFO3dCQUN6QixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsQ0FBQztxQkFDM0Q7eUJBQU07d0JBQ0wsTUFBTSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsQ0FBQztxQkFDckU7aUJBQ0Y7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsT0FBTyxDQUNaLFlBQXFDO1FBRXJDLE9BQU87WUFDTCxRQUFRLEVBQUUsdUJBQXVCO1lBQ2pDLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxPQUFPLEVBQUUsaUNBQWlDO29CQUMxQyxRQUFRLEVBQUUsWUFBWTtpQkFDdkI7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDOzs7WUEvRUYsUUFBUSxTQUFDLEVBQUU7OztZQVE4Qix1QkFBdUIsdUJBQTVELFFBQVEsWUFBSSxRQUFROzRDQUNwQixRQUFRLFlBQ1IsTUFBTSxTQUFDLGlDQUFpQztZQXJCM0MsTUFBTTtZQUlDLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIE5nTW9kdWxlLFxuICBNb2R1bGVXaXRoUHJvdmlkZXJzLFxuICBJbmplY3QsXG4gIE9wdGlvbmFsLFxuICBTa2lwU2VsZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBOYXZpZ2F0aW9uQ2FuY2VsLFxuICBOYXZpZ2F0aW9uRW5kLFxuICBOYXZpZ2F0aW9uRXJyb3IsXG4gIE5hdmlnYXRpb25TdGFydCxcbiAgUm91dGVyLFxuICBSb3V0ZXJFdmVudCxcbn0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgTmd4VWlMb2FkZXJTZXJ2aWNlIH0gZnJvbSAnLi4vY29yZS9uZ3gtdWktbG9hZGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgTmd4VWlMb2FkZXJSb3V0ZXJDb25maWcgfSBmcm9tICcuLi91dGlscy9pbnRlcmZhY2VzJztcbmltcG9ydCB7IE5HWF9VSV9MT0FERVJfUk9VVEVSX0NPTkZJR19UT0tFTiB9IGZyb20gJy4vbmd4LXVpLWxvYWRlci1yb3V0ZXItY29uZmlnLnRva2VuJztcbmltcG9ydCB7IFJPVVRFUl9MT0FERVJfVEFTS19JRCB9IGZyb20gJy4uL3V0aWxzL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBnZXRFeGNsdWRlT2JqLCBpc0lnbm9yZWQgfSBmcm9tICcuLi91dGlscy9mdW5jdGlvbnMnO1xuaW1wb3J0IHsgRXhjbHVkZSB9IGZyb20gJy4uL3V0aWxzL2ludGVyZmFjZXMnO1xuXG5ATmdNb2R1bGUoe30pXG5leHBvcnQgY2xhc3MgTmd4VWlMb2FkZXJSb3V0ZXJNb2R1bGUge1xuICBwcml2YXRlIGV4Y2x1ZGU6IEV4Y2x1ZGU7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwYXJlbnRNb2R1bGU6IE5neFVpTG9hZGVyUm91dGVyTW9kdWxlLFxuICAgIEBPcHRpb25hbCgpXG4gICAgQEluamVjdChOR1hfVUlfTE9BREVSX1JPVVRFUl9DT05GSUdfVE9LRU4pXG4gICAgY3VzdG9tQ29uZmlnOiBOZ3hVaUxvYWRlclJvdXRlckNvbmZpZyxcbiAgICByb3V0ZXI6IFJvdXRlcixcbiAgICBsb2FkZXI6IE5neFVpTG9hZGVyU2VydmljZVxuICApIHtcbiAgICBpZiAocGFyZW50TW9kdWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdbbmd4LXVpLWxvYWRlcl0gLSBOZ3hVaUxvYWRlclJvdXRlck1vZHVsZSBpcyBhbHJlYWR5IGxvYWRlZC4gSXQgc2hvdWxkIGJlIGltcG9ydGVkIGluIHRoZSByb290IGBBcHBNb2R1bGVgIG9ubHkhJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgY29uZmlnOiBOZ3hVaUxvYWRlclJvdXRlckNvbmZpZyA9IHtcbiAgICAgIGxvYWRlcklkOiBsb2FkZXIuZ2V0RGVmYXVsdENvbmZpZygpLm1hc3RlckxvYWRlcklkLFxuICAgICAgc2hvd0ZvcmVncm91bmQ6IHRydWUsXG4gICAgfTtcblxuICAgIHRoaXMuZXhjbHVkZSA9IGdldEV4Y2x1ZGVPYmooY3VzdG9tQ29uZmlnKTtcblxuICAgIGlmIChjdXN0b21Db25maWcpIHtcbiAgICAgIGNvbmZpZyA9IHsgLi4uY29uZmlnLCAuLi5jdXN0b21Db25maWcgfTtcbiAgICB9XG5cbiAgICByb3V0ZXIuZXZlbnRzLnN1YnNjcmliZSgoZXZlbnQ6IFJvdXRlckV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uU3RhcnQpIHtcbiAgICAgICAgaWYgKCFpc0lnbm9yZWQoZXZlbnQudXJsLCB0aGlzLmV4Y2x1ZGUuc3RycywgdGhpcy5leGNsdWRlLnJlZ0V4cHMpKSB7XG4gICAgICAgICAgaWYgKGNvbmZpZy5zaG93Rm9yZWdyb3VuZCkge1xuICAgICAgICAgICAgbG9hZGVyLnN0YXJ0TG9hZGVyKGNvbmZpZy5sb2FkZXJJZCwgUk9VVEVSX0xPQURFUl9UQVNLX0lEKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9hZGVyLnN0YXJ0QmFja2dyb3VuZExvYWRlcihcbiAgICAgICAgICAgICAgY29uZmlnLmxvYWRlcklkLFxuICAgICAgICAgICAgICBST1VURVJfTE9BREVSX1RBU0tfSURcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgZXZlbnQgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uRW5kIHx8XG4gICAgICAgIGV2ZW50IGluc3RhbmNlb2YgTmF2aWdhdGlvbkNhbmNlbCB8fFxuICAgICAgICBldmVudCBpbnN0YW5jZW9mIE5hdmlnYXRpb25FcnJvclxuICAgICAgKSB7XG4gICAgICAgIGlmICghaXNJZ25vcmVkKGV2ZW50LnVybCwgdGhpcy5leGNsdWRlLnN0cnMsIHRoaXMuZXhjbHVkZS5yZWdFeHBzKSkge1xuICAgICAgICAgIGlmIChjb25maWcuc2hvd0ZvcmVncm91bmQpIHtcbiAgICAgICAgICAgIGxvYWRlci5zdG9wTG9hZGVyKGNvbmZpZy5sb2FkZXJJZCwgUk9VVEVSX0xPQURFUl9UQVNLX0lEKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9hZGVyLnN0b3BCYWNrZ3JvdW5kTG9hZGVyKGNvbmZpZy5sb2FkZXJJZCwgUk9VVEVSX0xPQURFUl9UQVNLX0lEKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBmb3JSb290XG4gICAqXG4gICAqIEByZXR1cm5zIEEgbW9kdWxlIHdpdGggaXRzIHByb3ZpZGVyIGRlcGVuZGVuY2llc1xuICAgKi9cbiAgc3RhdGljIGZvclJvb3QoXG4gICAgcm91dGVyQ29uZmlnOiBOZ3hVaUxvYWRlclJvdXRlckNvbmZpZ1xuICApOiBNb2R1bGVXaXRoUHJvdmlkZXJzPE5neFVpTG9hZGVyUm91dGVyTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBOZ3hVaUxvYWRlclJvdXRlck1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogTkdYX1VJX0xPQURFUl9ST1VURVJfQ09ORklHX1RPS0VOLFxuICAgICAgICAgIHVzZVZhbHVlOiByb3V0ZXJDb25maWcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cbn1cbiJdfQ==