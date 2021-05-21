import { BehaviorSubject, Observable, Observer, ReplaySubject } from 'rxjs';
import { Confirm, PersonalProfile } from '../_models';
import { map, pluck, shareReplay, tap } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { IConfirm } from '../_interfaces/i-confirm';
import { INameChangeRequest } from '../_interfaces';
import { IPersonalProfile } from '../_interfaces/i-personal-profile';
import { IResponseObject } from '../_interfaces';
import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class PersonalProfileService extends BaseService {

  // State Management
  private _IsReading: boolean = false;

  // Subjects
  private _PersonalProfileSubject: BehaviorSubject<PersonalProfile> =  new BehaviorSubject<PersonalProfile>(new PersonalProfile());
  private _CheckSubject: BehaviorSubject<IConfirm> = new BehaviorSubject(new Confirm().Export());
  private _NameChangeRequests: BehaviorSubject<INameChangeRequest[]> = new BehaviorSubject(new Array<INameChangeRequest>());
  // Observable
  public PersonalProfile$: Observable<PersonalProfile> = this._PersonalProfileSubject.asObservable().pipe(shareReplay(1));
  public NameChanges$: Observable<INameChangeRequest[]> = this._NameChangeRequests.asObservable();
  public Check$: Observable<IConfirm> = this._CheckSubject.asObservable().pipe(shareReplay(1));
  private CustomerId$: BehaviorSubject<string> = new BehaviorSubject<string>('64572');
  public CustomerIdObs: Observable<string> = this.CustomerId$.pipe(
    shareReplay(1)
  )

  constructor(private Http: HttpClient,private azure: AzureHttpPostService,private authService: AuthenticationService, private  msalService: MsalService) {
    super();
    // console.log('Personal Profile Service');
    this._CheckSubject = new BehaviorSubject<IConfirm>(new Confirm().Export());
    this.Check$ = this._CheckSubject.asObservable();
    this._NameChangeRequests = new BehaviorSubject<INameChangeRequest[]>([]);
    this.NameChanges$ = this._NameChangeRequests.asObservable();
    this.Read();
    // this.Http.get<any>('https://portal.bacb.com/service/NetSuite.svc/TEST').subscribe( _x => console.log('TEST: ', _x));
  };


  // public SetNext(value: PersonalProfile): IConfirm{
  //   this._PersonalProfileSubject.next(value);
  //   return {
  //     Response: value ? 'T' : 'F',
  //     Message: value ? JSON.stringify(value) : 'Value supplied was null'
  //   };
  // }

  public Check() : void {
    this.azure.get<IConfirm>(this.BaseUrl  + "PersonalInfo/Check")
      // .pipe(tap(console.error))
      .subscribe(
        (CheckNext: IConfirm) => {
          if (CheckNext) {
            this._CheckSubject.next(CheckNext);
          }
          else {
            this._CheckSubject.next(new Confirm({'Response': 'F', 'Message': 'No response from check function.'}).Export());
          }
        },
        PersonalProfileError => {

        },
        () => { // OnComplete

        }
      );
  };

  public Read() : void {
    if ( this._IsReading ) {
      return;
    }
    this._IsReading = true;
    this.azure.get<IPersonalProfile[]>(this.BaseUrl + "PersonalInfo/Read")
      .pipe(
        //tap(_x => console.log('Profile from Azure',_x)),
        map ((_response: IPersonalProfile[]) => _response[0]),
      )
      .subscribe(
        (PersonalProfileNext: IPersonalProfile) => {
          // console.log("oooohkay there pardner. Persoanl Profile serv", PersonalProfileNext)
          // console.log("Put this in an obj", new PersonalProfile(PersonalProfileNext));
          // After we made changes, we must ensure this element has all required
          // features attached.
          this._PersonalProfileSubject.next(new PersonalProfile(PersonalProfileNext))
          this.CustomerId$.next(PersonalProfileNext?.Id);
        },
        PersonalProfileError => {

        },
        () => { // Oncomplete
          this._IsReading = false;
        }
      );
  };

  public ClearData(): void {
    this._PersonalProfileSubject.next(new PersonalProfile());
    this.CustomerId$.next('');
  }

  public Update(Profile: IPersonalProfile): Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + 'PersonalInfo/Update', Profile);
  }
  public submitNameChangeRequest(ncReq: INameChangeRequest){
    return this.azure.post<boolean>(this.BaseUrl + 'PersonalInfo/CreateNameChangeRequest', ncReq)
  }
  public ChangeUserEmail(newEmail: string): Observable<any>{
    return this.azure.post(this.BaseUrl + 'ChangeEmailRequest/CreateRequest', {"NewEmail": newEmail})
  }
  public SubmitVerificationCode(userEnteredVerificationCode: string, emailChangeRequestId: string){
    return this.azure.post<IConfirm>(this.BaseUrl + 'ChangeEmailRequest/VerifyNewEmail', {"VerificationCode": userEnteredVerificationCode, "RequestId": emailChangeRequestId})
    //.pipe(
      // This is here to force a logout if user changes email.  If I do it in the change-email component, then they can navigate away and kill the auto logout.
      // tap((result: IConfirm) => {
      //   if(result.Response == "T"){
      // //  as of 3.08.21 we no longer need to do the logout. 
      //     setTimeout(() => {this.msalService.logout()}, 10000);
      //   }
      // })
    //)
  }
}
