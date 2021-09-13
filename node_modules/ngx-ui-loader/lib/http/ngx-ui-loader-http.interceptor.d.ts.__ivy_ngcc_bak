import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NgxUiLoaderService } from '../core/ngx-ui-loader.service';
import { NgxUiLoaderHttpConfig } from '../utils/interfaces';
export declare class NgxUiLoaderHttpInterceptor implements HttpInterceptor {
    private loader;
    private count;
    private config;
    private exclude;
    /**
     * Constructor
     */
    constructor(customConfig: NgxUiLoaderHttpConfig, loader: NgxUiLoaderService);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
