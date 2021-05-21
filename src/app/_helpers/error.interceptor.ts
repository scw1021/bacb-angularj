import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { empty, Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthenticationService } from '../_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    public ErrorMessage: string = '';

    public constructor( private ErrorAuthServ: AuthenticationService, 
                        private ErrorRouter: Router) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                retry(1),
                catchError((MyError: HttpErrorResponse) => {
                    
                    if (MyError instanceof HttpErrorResponse && MyError.status == 404) {
                        this.ErrorRouter.navigate(['/login']);
                        return empty();
                    }
                    if (MyError.status === 401) {
                        // auto logout if 401 response returned from api
                        console.log('... 401 error caught ...');
                        this.ErrorAuthServ.logout();
                        location.reload(true);
                    }
                    else if (MyError.error instanceof ErrorEvent) {
                        // Client-side Error
                        this.ErrorMessage = `Error: ${MyError.error.message}`;
                    }
                    else {
                        // Server-side Error
                        this.ErrorMessage = `Error Code: ${MyError.status}\nMessage: ${MyError.message}`;
                    }
                    
                    return throwError(this.ErrorMessage);
        }))
    }
}