import { AuthenticationService } from './_services';
import { Component, OnInit, Inject } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionType, PopupRequest, RedirectRequest, AuthenticationResult, AuthError } from '@azure/msal-browser';

import { HostListener } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { b2cPolicies } from './b2c-config';
import { filter, takeUntil } from 'rxjs/operators';


interface IdTokenClaims extends AuthenticationResult {
  idTokenClaims: {
    acr?: string
  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent implements OnInit {
  public title = 'Portal';
  public Message: string;
  isIframe = false;
  loggedIn = false;
  private readonly _destroying$ = new Subject<void>();

  public constructor(private AppAuthServ: AuthenticationService,
                     private MsalAuthServ: MsalService,
                     private http: HttpClient,
                     private router: Router,
                     @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
                     private authService: MsalService,
                     private msalBroadcastService: MsalBroadcastService
                     ) {



    Object.defineProperty(MatInput.prototype, 'required', {
      get: function (): boolean {
        if (this._required) {
          return this._required;
        }

        // The required attribute is set
        // when the control return an error from validation with an empty value
        if (this.ngControl && this.ngControl.control && this.ngControl.control.validator) {
          const emptyValueControl = Object.assign({}, this.ngControl.control);
          (emptyValueControl as any).value = null;
          return 'required' in (this.ngControl.control.validator(emptyValueControl) || {});
        }
        return false;
      },
      set: function (value: boolean) {
        this._required = coerceBooleanProperty(value);
      }
    });

    Object.defineProperty(MatSelect.prototype, 'required', {
      get: function (): boolean {
        if (this._required) {
          return this._required;
        }

        // The required attribute is set
        // when the control return an error from validation with an empty value
        if (this.ngControl && this.ngControl.control && this.ngControl.control.validator) {
          const emptyValueControl = Object.assign({}, this.ngControl.control);
          (emptyValueControl as any).value = null;
          return 'required' in (this.ngControl.control.validator(emptyValueControl) || {});
        }
        return false;
      },
      set: function (value: boolean) {
        this._required = coerceBooleanProperty(value);
      }
    });
  }
  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;
    this.checkAccount();

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
      
        // let payload: IdTokenClaims = <AuthenticationResult>result.payload;
        // // We need to reject id tokens that were not issued with the default sign-in policy.
        // // "acr" claim in the token tells us what policy is used (NOTE: for new policies (v2.0), use "tfp" instead of "acr")
        // // To learn more about b2c tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview

        // if (payload.idTokenClaims?.acr === b2cPolicies.names.forgotPassword) {
        //   window.alert('Password has been reset successfully. \nPlease sign-in with your new password.');
        //   return this.authService.logout();
        // } else if (payload.idTokenClaims['acr'] === b2cPolicies.names.editProfile) {
        //   window.alert('Profile has been updated successfully. \nPlease sign-in again.');
        //     return this.authService.logout();
        // }

        this.checkAccount();
        return result;
      });

      this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_FAILURE || msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        console.log("login failure:",result)
        if (result.error instanceof AuthError) {
          /** 
           * In the previous/MS documented approach, here we would redirect to the password flow.
           * THIS IS DEPRECATED IN OUR IMPLEMENTATION- 
           * Password reset is now being handled by an additional orchestration step from the custom policy
           * We only have ONE custom policy now. This is because when we kicked over to the password reset flow, the token was signed from the password reset policy
           * Securing authentication through adb2c only seems to support one flow at a time as the signer.
           * To get around this, we now have the logic as an orchestration step in the user journey in CNorris' custom policy(signup and signin)
           * Now the only thing we need is to check for the user canceled self asserted information in the error message.
           * 
           * Please don't touch this s**t unless you know what you're doing <3 MM 2.17.21
          */

 
          // Handle cancel
           if(result.error.message.includes('AADB2C90091')){
            // let returnToLoginPageFlowRequest = {
            //   scopes: ['openid'],
            //   authority: b2cPolicies.authorities.signUpSignIn
            // }
            // this.login(returnToLoginPageFlowRequest)
            console.trace("Cancelled request redirect")
            window.location.href = environment.baseUrl
          } 
          //
        }
      });

  }
  checkAccount() {
    this.loggedIn = this.authService.instance.getAllAccounts().length > 0;
  }

  login(userFlowRequest?: RedirectRequest | PopupRequest) {

    this.msalGuardConfig
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (this.msalGuardConfig.authRequest) {
        this.authService.loginPopup({...this.msalGuardConfig.authRequest, ...userFlowRequest} as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
           // this.authService.instance.setActiveAccount(response.account);
           console.log("login succeeded(popup sub):",response)

           this.checkAccount();
          });
      } else {
        this.authService.loginPopup(userFlowRequest)
          .subscribe((response: AuthenticationResult) => {
           // this.authService.instance.setActiveAccount(response.account);
           console.log("login succeeded(userflow sub):",response)

           this.checkAccount();
          });
      }
    } else {
      if (this.msalGuardConfig.authRequest){
        this.authService.loginRedirect({...this.msalGuardConfig.authRequest, ...userFlowRequest} as RedirectRequest);
      } else {
        this.authService.loginRedirect(userFlowRequest);
      }
    }
  }

  logout() {
    this.authService.logout();
  }

  editProfile() {
    let editProfileFlowRequest = {
      scopes: ["openid"],
      authority: b2cPolicies.authorities.editProfile.authority,
    }

    this.login(editProfileFlowRequest);
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }



}
