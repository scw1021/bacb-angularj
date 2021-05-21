import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { AuthenticationService, CertificationService, PersonalProfileService } from '../_services';
import { Injectable, Output } from '@angular/core';
import { map, tap } from 'rxjs/operators';

import { IConfirm } from '../_interfaces';
import { Observable } from 'rxjs';
import { longStackSupport } from 'q';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  public constructor(
    private AuthServ: AuthenticationService,
    private AuthRouter: Router,
    private personalProfileService: PersonalProfileService,
    private certificationService: CertificationService,
  ) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean | UrlTree {
    return (
      // We return the boolean observable for navigation to new element, but also just
      // knock back to login on error
      this.AuthServ.checkLogin()
      .pipe(tap( _isLoggedIn => {
        if ( !_isLoggedIn ) {
          this.personalProfileService.ClearData();
          this.certificationService.ClearData();
          this.AuthRouter.navigate(["/login"]);
        }
      }))
    )
  }


  // public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  //   return new Observable<boolean>(observer => {
  //     this.AuthServ.checkLogin()
  //       .subscribe( (LoggedIn : boolean) => {
  //         if (LoggedIn) {
  //           return observer.next(true);
  //         }
  //         else {
  //           this.AuthServ.logout().subscribe(
  //             (_value: IConfirm) => {
  //               if ( _value.Response == 'T' ) {
  //                 this.AuthRouter.navigate(["/login"]);
  //               }
  //             }
  //           )
  //           return observer.next(false);
  //         }
  //       });
  //   });
  // }
}


  // return this.AuthServ.checkLogin()
  //     .pipe(
  //       map((AuthData: boolean) => {
  //         console.log('... checkLogin Response ... ' + JSON.stringify(AuthData));
  //         if (AuthData === false) {
  //           console.log('... canActivate interpreted AuthData.Response as false ...');
  //           this.AuthRouter.navigate(['/login'], {queryParams: {returnUrl: state.url }});
  //           return !!AuthData;
  //         }
  //         else {
  //           console.log('... canActivate interpreted AuthData.Response as true ...');
  //           return !!AuthData;
  //         }
  //       }),
  //       catchError(() => {
  //         this.AuthRouter.navigate(['/error'], {queryParams: {returnUrl: state.url }});
  //         return of(false);
  //       }),
  //       take(1)
  //     );
