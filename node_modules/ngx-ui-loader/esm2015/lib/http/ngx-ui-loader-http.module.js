import { NgModule, Optional, SkipSelf, } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxUiLoaderHttpInterceptor } from './ngx-ui-loader-http.interceptor';
import { NGX_UI_LOADER_HTTP_CONFIG_TOKEN } from './ngx-ui-loader-http-config.token';
export class NgxUiLoaderHttpModule {
    /**
     * Constructor
     */
    constructor(parentModule) {
        if (parentModule) {
            throw new Error('[ngx-ui-loader] - NgxUiLoaderHttpModule is already loaded. It should be imported in the root `AppModule` only!');
        }
    }
    /**
     * forRoot
     *
     * @returns A module with its provider dependencies
     */
    static forRoot(httpConfig) {
        return {
            ngModule: NgxUiLoaderHttpModule,
            providers: [
                {
                    provide: NGX_UI_LOADER_HTTP_CONFIG_TOKEN,
                    useValue: httpConfig,
                },
            ],
        };
    }
}
NgxUiLoaderHttpModule.decorators = [
    { type: NgModule, args: [{
                providers: [
                    {
                        provide: HTTP_INTERCEPTORS,
                        useClass: NgxUiLoaderHttpInterceptor,
                        multi: true,
                    },
                ],
            },] }
];
NgxUiLoaderHttpModule.ctorParameters = () => [
    { type: NgxUiLoaderHttpModule, decorators: [{ type: Optional }, { type: SkipSelf }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXVpLWxvYWRlci1odHRwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC11aS1sb2FkZXIvc3JjL2xpYi9odHRwL25neC11aS1sb2FkZXItaHR0cC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFFBQVEsRUFFUixRQUFRLEVBQ1IsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXpELE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRTlFLE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBV3BGLE1BQU0sT0FBTyxxQkFBcUI7SUFDaEM7O09BRUc7SUFDSCxZQUFvQyxZQUFtQztRQUNyRSxJQUFJLFlBQVksRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUNiLGdIQUFnSCxDQUNqSCxDQUFDO1NBQ0g7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxPQUFPLENBQ1osVUFBaUM7UUFFakMsT0FBTztZQUNMLFFBQVEsRUFBRSxxQkFBcUI7WUFDL0IsU0FBUyxFQUFFO2dCQUNUO29CQUNFLE9BQU8sRUFBRSwrQkFBK0I7b0JBQ3hDLFFBQVEsRUFBRSxVQUFVO2lCQUNyQjthQUNGO1NBQ0YsQ0FBQztJQUNKLENBQUM7OztZQXRDRixRQUFRLFNBQUM7Z0JBQ1IsU0FBUyxFQUFFO29CQUNUO3dCQUNFLE9BQU8sRUFBRSxpQkFBaUI7d0JBQzFCLFFBQVEsRUFBRSwwQkFBMEI7d0JBQ3BDLEtBQUssRUFBRSxJQUFJO3FCQUNaO2lCQUNGO2FBQ0Y7OztZQUttRCxxQkFBcUIsdUJBQTFELFFBQVEsWUFBSSxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgTmdNb2R1bGUsXG4gIE1vZHVsZVdpdGhQcm92aWRlcnMsXG4gIE9wdGlvbmFsLFxuICBTa2lwU2VsZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIVFRQX0lOVEVSQ0VQVE9SUyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgTmd4VWlMb2FkZXJIdHRwSW50ZXJjZXB0b3IgfSBmcm9tICcuL25neC11aS1sb2FkZXItaHR0cC5pbnRlcmNlcHRvcic7XG5pbXBvcnQgeyBOZ3hVaUxvYWRlckh0dHBDb25maWcgfSBmcm9tICcuLi91dGlscy9pbnRlcmZhY2VzJztcbmltcG9ydCB7IE5HWF9VSV9MT0FERVJfSFRUUF9DT05GSUdfVE9LRU4gfSBmcm9tICcuL25neC11aS1sb2FkZXItaHR0cC1jb25maWcudG9rZW4nO1xuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgIHVzZUNsYXNzOiBOZ3hVaUxvYWRlckh0dHBJbnRlcmNlcHRvcixcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIE5neFVpTG9hZGVySHR0cE1vZHVsZSB7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgcGFyZW50TW9kdWxlOiBOZ3hVaUxvYWRlckh0dHBNb2R1bGUpIHtcbiAgICBpZiAocGFyZW50TW9kdWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdbbmd4LXVpLWxvYWRlcl0gLSBOZ3hVaUxvYWRlckh0dHBNb2R1bGUgaXMgYWxyZWFkeSBsb2FkZWQuIEl0IHNob3VsZCBiZSBpbXBvcnRlZCBpbiB0aGUgcm9vdCBgQXBwTW9kdWxlYCBvbmx5ISdcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGZvclJvb3RcbiAgICpcbiAgICogQHJldHVybnMgQSBtb2R1bGUgd2l0aCBpdHMgcHJvdmlkZXIgZGVwZW5kZW5jaWVzXG4gICAqL1xuICBzdGF0aWMgZm9yUm9vdChcbiAgICBodHRwQ29uZmlnOiBOZ3hVaUxvYWRlckh0dHBDb25maWdcbiAgKTogTW9kdWxlV2l0aFByb3ZpZGVyczxOZ3hVaUxvYWRlckh0dHBNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IE5neFVpTG9hZGVySHR0cE1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogTkdYX1VJX0xPQURFUl9IVFRQX0NPTkZJR19UT0tFTixcbiAgICAgICAgICB1c2VWYWx1ZTogaHR0cENvbmZpZyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufVxuIl19