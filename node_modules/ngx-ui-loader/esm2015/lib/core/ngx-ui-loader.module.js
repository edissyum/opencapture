import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxUiLoaderComponent } from './ngx-ui-loader.component';
import { NgxUiLoaderBlurredDirective } from './ngx-ui-loader-blurred.directive';
import { NGX_UI_LOADER_CONFIG_TOKEN } from './ngx-ui-loader-config.token';
export class NgxUiLoaderModule {
    /**
     * forRoot
     *
     * @returns A module with its provider dependencies
     */
    static forRoot(ngxUiLoaderConfig) {
        return {
            ngModule: NgxUiLoaderModule,
            providers: [
                {
                    provide: NGX_UI_LOADER_CONFIG_TOKEN,
                    useValue: ngxUiLoaderConfig,
                },
            ],
        };
    }
}
NgxUiLoaderModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                declarations: [NgxUiLoaderComponent, NgxUiLoaderBlurredDirective],
                exports: [NgxUiLoaderComponent, NgxUiLoaderBlurredDirective],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXVpLWxvYWRlci5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtdWktbG9hZGVyL3NyYy9saWIvY29yZS9uZ3gtdWktbG9hZGVyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUF1QixNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFL0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDakUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDaEYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFRMUUsTUFBTSxPQUFPLGlCQUFpQjtJQUM1Qjs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FDWixpQkFBb0M7UUFFcEMsT0FBTztZQUNMLFFBQVEsRUFBRSxpQkFBaUI7WUFDM0IsU0FBUyxFQUFFO2dCQUNUO29CQUNFLE9BQU8sRUFBRSwwQkFBMEI7b0JBQ25DLFFBQVEsRUFBRSxpQkFBaUI7aUJBQzVCO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQzs7O1lBdkJGLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7Z0JBQ3ZCLFlBQVksRUFBRSxDQUFDLG9CQUFvQixFQUFFLDJCQUEyQixDQUFDO2dCQUNqRSxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSwyQkFBMkIsQ0FBQzthQUM3RCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBOZ3hVaUxvYWRlckNvbXBvbmVudCB9IGZyb20gJy4vbmd4LXVpLWxvYWRlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgTmd4VWlMb2FkZXJCbHVycmVkRGlyZWN0aXZlIH0gZnJvbSAnLi9uZ3gtdWktbG9hZGVyLWJsdXJyZWQuZGlyZWN0aXZlJztcbmltcG9ydCB7IE5HWF9VSV9MT0FERVJfQ09ORklHX1RPS0VOIH0gZnJvbSAnLi9uZ3gtdWktbG9hZGVyLWNvbmZpZy50b2tlbic7XG5pbXBvcnQgeyBOZ3hVaUxvYWRlckNvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2ludGVyZmFjZXMnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcbiAgZGVjbGFyYXRpb25zOiBbTmd4VWlMb2FkZXJDb21wb25lbnQsIE5neFVpTG9hZGVyQmx1cnJlZERpcmVjdGl2ZV0sXG4gIGV4cG9ydHM6IFtOZ3hVaUxvYWRlckNvbXBvbmVudCwgTmd4VWlMb2FkZXJCbHVycmVkRGlyZWN0aXZlXSxcbn0pXG5leHBvcnQgY2xhc3MgTmd4VWlMb2FkZXJNb2R1bGUge1xuICAvKipcbiAgICogZm9yUm9vdFxuICAgKlxuICAgKiBAcmV0dXJucyBBIG1vZHVsZSB3aXRoIGl0cyBwcm92aWRlciBkZXBlbmRlbmNpZXNcbiAgICovXG4gIHN0YXRpYyBmb3JSb290KFxuICAgIG5neFVpTG9hZGVyQ29uZmlnOiBOZ3hVaUxvYWRlckNvbmZpZ1xuICApOiBNb2R1bGVXaXRoUHJvdmlkZXJzPE5neFVpTG9hZGVyTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBOZ3hVaUxvYWRlck1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogTkdYX1VJX0xPQURFUl9DT05GSUdfVE9LRU4sXG4gICAgICAgICAgdXNlVmFsdWU6IG5neFVpTG9hZGVyQ29uZmlnLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG59XG4iXX0=