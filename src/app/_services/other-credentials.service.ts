import { BehaviorSubject, Observable } from 'rxjs';
import { Confirm, ListObject } from '../_models';
import { map, shareReplay, skip, take } from 'rxjs/operators';

import { ApplicationService } from './application.service';
import { AuthenticationService } from './authentication.service';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { IConfirm } from '../_interfaces/i-confirm';
import { IListObject } from '../_interfaces';
import { IOtherCredential } from '../_interfaces/i-other-credential';
import { Injectable, } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OtherCredentialsService extends BaseService {

  // Subjects
  public _OtherCredentialSubject : BehaviorSubject<IOtherCredential[]> = new BehaviorSubject<IOtherCredential[]>(new Array<IOtherCredential>());
  public _CheckSubject: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>(new Confirm().Export());
  public _BypassSubject: BehaviorSubject<IListObject> = new BehaviorSubject<IListObject>(new ListObject().Export());
  // Observables
  public OtherCredential$ : Observable<IOtherCredential[]> = this._OtherCredentialSubject.asObservable();
  public Check$: Observable<IConfirm> = this._CheckSubject.asObservable().pipe(shareReplay(1));
  public Bypass$: Observable<IListObject> = this._BypassSubject.asObservable().pipe(skip(1));

  constructor(
    private authService: AuthenticationService,
    private applicationService: ApplicationService,
    private azure: AzureHttpPostService
  ) {
    super();
  }

  public Check() : void {
      this.azure.post<IConfirm>( this.BaseUrl + 'OtherCredentials/CheckOtherCredentials', {"AppId": this.applicationService.AppId})
      .subscribe((checkRes: IConfirm) => this._CheckSubject.next(checkRes));
  }

  public Upsert(NewCredential: IOtherCredential) : Observable<IConfirm> {
    return this.azure.post<IConfirm>(
      this.BaseUrl + "OtherCredentials/Upsert",NewCredential
    );
  }

  // public Create(NewCredential: IOtherCredential) : Observable<IConfirm> {
  //   return this.azure.post<IConfirm>(
  //     this.BaseUrl + "OtherCredentials/CreateOtherCredential",NewCredential
  //   );
  // }

  public Delete(ID: string) : Observable<IConfirm>{
    return this.azure.post<IConfirm>(this.BaseUrl + "OtherCredentials/DeleteOtherCredential", {"Id": ID});
  }

  public Find(Credential : IOtherCredential) : Observable<IOtherCredential> {
    return this.OtherCredential$
      .pipe(
        map((OtherCredMap : IOtherCredential[]) => OtherCredMap.find((OtherCredential : IOtherCredential) => OtherCredential.Id == Credential.Id))
      )
  };

  public Read() : void {
    this.azure.post<IOtherCredential[]>(this.BaseUrl + "OtherCredentials/ReadOtherCredentials", {CustomerId: this.authService.CustomerIdSubject.value})
      .subscribe(
        (OtherCredentialNext: IOtherCredential[]) => {
          if ( OtherCredentialNext && OtherCredentialNext ) {
            this._OtherCredentialSubject.next(OtherCredentialNext)
          }
        },
        OtherCredentialError => {

        },
        () => { // OnComplete

        }
      );
  };

  public SetBypass(BypassValue: IListObject) : Observable<IConfirm> {
    // // Because this checkbox is "Do NOT have credentials", a value of "F" correlates to TRUE, as in it is TRUE that I do NOT have credentials
    // // Coupling backend logic tightly with arbitrary wording on a frontend checkbox is a mortal sin, so it's being done on the frontend.
    // const actualBoolean: boolean = BypassValue == "F"? true : false;
    return this.azure.post<IConfirm>(this.BaseUrl + "OtherCredentials/UpdateOtherCredentialsBypass", {'AppId': this.applicationService.AppId, 'Bypass': BypassValue});
  }

  public ReadBypass() : void {
    this.azure.post<IListObject>(this.BaseUrl + "OtherCredentials/ReadOtherCredentialsBypass", {"AppId": this.applicationService.AppId})
    .pipe(
      take(1),
    )
    .subscribe((bypassObj: IListObject) =>{
      this._BypassSubject.next(bypassObj)
    }

    )
  }
  public Submit(objRequest): IConfirm {

    return new Confirm({'Response': 'T', "Message": 'success'}).Export();
  }
}
