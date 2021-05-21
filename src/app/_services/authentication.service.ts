import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { MsalModule, MsalService } from '@azure/msal-angular';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { filter, map, shareReplay, take, tap } from 'rxjs/operators';

import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { IConfirm } from '../_interfaces/i-confirm';
import { ILoginCredentials } from '../_interfaces/i-login-credentials';
import { Injectable } from '@angular/core';
import { LoginCredentials } from '../_models/login-credentials';
import { Registration } from '../_models/registration';
import { Session } from '../_models/session';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService extends BaseService {

    public CurrentSession: Session = new Session();

    // But like for real don't touch this right here, touch it in the component calling it.
    public CustomerIdSubject: BehaviorSubject<string> = new BehaviorSubject('IF YOU SEE THIS THEN RM AUTH SERV');
    public CustomerId$: Observable<string> = this.CustomerIdSubject.pipe(
      filter((val) => val != ''),
      shareReplay(1)
    )
    public Subscriptions: Subscription[] = [];
    public constructor(
      private Http: HttpClient,
      private azure: AzureHttpPostService,
      private idle: Idle,
      private MsalAuthService: MsalService
    ) {
        super();
        this.CurrentSession = new Session();
        this.idle.setIdle(this.CurrentSession.IdleTime);
        this.idle.setTimeout(this.CurrentSession.TimeoutTime);
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
        this.MsalAuthLogic()
    }

    public MsalAuthLogic(){
      // this.BroadcastService.subscribe("msal:loginSuccess", payload => {
      //   console.log("Payload",payload)
      //   var account = this.MsalAuthService.getAccount()
      //   console.trace("Msal Auth Success:", account)
      // })
    }
    public GetIsLoggedIn() : Observable<IConfirm> {
        return this.Http.get<IConfirm>(this.BaseUrl + "/initPortal.ss?param=isLoggedIn");
    }

    public checkLogin(): Observable<boolean> {

      return this.GetIsLoggedIn()
        .pipe(map( (_response: IConfirm) => {
          return (_response && _response.Response && _response.Response == 'T')
        }))

        // if (this.CurrentSession.IsLoggedIn.Response == false) {
        //     return new Observable<boolean>( observer => {
        //         this.GetIsLoggedIn()
        //         // .pipe(take(1))
        //         .subscribe(
        //             (CheckLoginNext: IConfirm) => {
        //               console.log('checkLogin: ', CheckLoginNext)
        //                 if (CheckLoginNext != null && typeof CheckLoginNext === 'object'){
        //                         this.CurrentSession.IsLoggedIn = new Confirm(CheckLoginNext);
        //                         observer.next(this.CurrentSession.IsLoggedIn.Response);
        //                 }
        //                 else {
        //                     this.CurrentSession.IsLoggedIn.Response = false;
        //                     this.CurrentSession.IsLoggedIn.Message = 'Return from isLoggedIn was null.';
        //                     observer.next(this.CurrentSession.IsLoggedIn.Response);
        //                 }
        //             },
        //             (CheckLoginError: string) => {
        //                 this.CurrentSession.IsLoggedIn.Message = CheckLoginError;
        //                 observer.next(false);
        //             },
        //             () => { // OnComplete
        //               console.log('CheckLogin Complete');
        //                 this.CurrentSession.LoginTime = new Date();
        //             }
        //         )
        //     })
        // }
        // else {
        //     return new Observable<boolean>( elseObserver => { elseObserver.next(this.CurrentSession.IsLoggedIn.Response)});
        // }
    };

    public logout() {
        this.MsalAuthService.logout();
    };

    public login(objCredentials: ILoginCredentials): Observable<IConfirm> {
        return this.azure.post<IConfirm>(this.BaseUrl + "/initPortal.ss?param=login",objCredentials);
    };

    public register(objRegistration: Registration): Observable<IConfirm> {
        return this.azure.post<IConfirm>(this.BaseUrl + "/elevatedPortal.ss?param=register", objRegistration);
    };

    public translateUsername(objCredentials: LoginCredentials): Observable<ILoginCredentials> {
        return this.azure.post<ILoginCredentials>(this.BaseUrl + "/elevatedPortal.ss?param=translate", objCredentials);
    };

    public ValidateUsername(Username: string): Observable<ILoginCredentials> {
        return this.azure.post<ILoginCredentials>(this.BaseUrl + "/elevatedPortal.ss?param=translate", {"Username": Username});
    };

    // public get onIdleEnd(): Observable<Confirm> {
    //     this.idle.onIdleEnd.subscribe(() => this.CurrentSession.IdleState = 'No longer idle.');
    //     let RetVal = new Confirm(true, "No longer idle.");
    //     return of(RetVal);
    // };

    // public get onTimeout(): Observable<Confirm> {
    //     this.idle.onTimeout.subscribe(() => {
    //         console.log(' ... onTimeout() called ... ')
    //         this.CurrentSession.IdleState = "Timed out!";
    //         this.CurrentSession.TimedOut = true;
    //     })
    //     return this.logout();
    // };

    // public get onIdleStart(): Observable<Confirm> {
    //     this.idle.onIdleStart.subscribe(() => this.CurrentSession.IdleState = 'You\'ve gone idle!');
    //     let RetVal = new Confirm(true, 'You\'ve gone idle.');
    //     return of(RetVal);
    // };

    // public get onTimeoutWarning(): Observable<number> {
    //     return this.idle.onTimeoutWarning;
    // };

    //old version of check login
    // public checkLogin(): Observable<boolean> {
    //     console.log('... Checking Login ...');
    //     if (this.CurrentSession.IsLoggedIn.Response == false) {
    //         console.log('... checkLogin Response is false ...');
    //         console.log('CurrentSession: ' + JSON.stringify(this.CurrentSession));
    //         return new Observable<boolean>( observer => {
    //             this.Http.get<Confirm>(this.BaseUrl + "/initPortal.ss?param=isLoggedIn")
    //             .pipe(
    //                 take(1)
    //             )
    //             .subscribe(
    //                 (CheckLoginNext: Confirm) => {
    //                     console.log('... isLoggedIn called ...');
    //                     console.log('Response: ' + JSON.stringify(CheckLoginNext));
    //                     if (CheckLoginNext != null && typeof CheckLoginNext === 'object'){
    //                             this.CurrentSession.IsLoggedIn = <Confirm>CheckLoginNext;
    //                             console.log('CheckLoginNext valid, CurrentSession.IsLoggedIn: ' + JSON.stringify(this.CurrentSession.IsLoggedIn));
    //                             observer.next(this.CurrentSession.IsLoggedIn.Response);
    //                     }
    //                     else {
    //                         this.CurrentSession.IsLoggedIn.Response = false;
    //                         this.CurrentSession.IsLoggedIn.Message = 'Return from isLoggedIn was null.';
    //                         console.log('CheckLoginNext NOT-valid, CurrentSession.IsLoggedIn: ' + JSON.stringify(this.CurrentSession.IsLoggedIn));
    //                         observer.next(this.CurrentSession.IsLoggedIn.Response);
    //                     }
    //                 },
    //                 (CheckLoginError: string) => {
    //                     this.CurrentSession.IsLoggedIn.Message = CheckLoginError;
    //                     observer.next(false);
    //                 },
    //                 () => { // OnComplete
    //                     this.CurrentSession.LoginTime = new Date();
    //                 }
    //             )
    //         })
    //     }
    //     else {
    //         console.log('... checkLogin Response is true ...');
    //         console.log('CurrentSession: ' + JSON.stringify(this.CurrentSession));
    //         return new Observable<boolean>( elseObserver => { elseObserver.next(this.CurrentSession.IsLoggedIn.Response)});
    //     }
    // };
}
