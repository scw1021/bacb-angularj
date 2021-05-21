import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { IConfirm } from '../_interfaces/i-confirm';
import { ILoginCredentials } from '../_interfaces';
import { IRegistration } from '../_interfaces/i-registration';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService extends BaseService {

  public constructor(private Http: HttpClient) { super() }

  public register(RegistrationObj: IRegistration): Observable<IConfirm> {
    return this.Http.post<IConfirm>(this.BaseUrl + "/elevatedPortal.ss?param=Register", RegistrationObj);
  };

  public update(RegistrationObj: IRegistration): Observable<IConfirm> {
    return this.Http.post<IConfirm>(this.BaseUrl + "/elevatedPortal.ss?param=Update", RegistrationObj);
  }

  // public checkRegistration(ObjRequest: ILoginCredentials): Observable<IConfirm> {
  //   return this.Http.post<IConfirm>(this.BaseUrl + "/elevatedPortal.ss?param=CheckRegistration", ObjRequest);
  // }
  public checkUsername(ObjRequest: string): Observable<IConfirm> {
    return this.Http.post<IConfirm>(this.BaseUrl + "/elevatedPortal.ss?param=ValidateUsername", {Username: ObjRequest});
  }
  public checkEmail(ObjRequest: string): Observable<IConfirm> {
    return this.Http.post<IConfirm>(this.BaseUrl + "/elevatedPortal.ss?param=ValidateEmail", {Email: ObjRequest});
  }
}

