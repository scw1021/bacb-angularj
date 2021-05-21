import { AlertObject } from "../_models";
import { BaseService } from "./base.service";
import { HttpClient } from "@angular/common/http";
import { IConfirm } from "../_interfaces";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ResetPasswordService extends BaseService {
  private Passwords: {} = {};
  constructor(private Http: HttpClient) {
    super();
    this.Passwords = {};
  }

  public update(objPasswords: any): Observable<IConfirm> {
    return this.Http.post<IConfirm>(
      this.BaseUrl + "/elevatedPortal.ss?param=ResetPassword",
      objPasswords
    );
  }

  public forgotPassword(objEmail: any): Observable<IConfirm> {
    return this.Http.post<IConfirm>(
      this.BaseUrl + "/initPortal.ss?param=retrievalEmail",
      objEmail
    );
  }
}
