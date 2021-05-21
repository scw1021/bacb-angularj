import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { IUser } from '../_interfaces/i-user';
import { Injectable } from '@angular/core';
import { User } from '../_models';

@Injectable(  {
  providedIn: 'root'
})
export class UserService extends BaseService {

  // Subjects
  private _UserSubject: BehaviorSubject<IUser> = new BehaviorSubject<IUser>(new User().Export());

  // Observable
  public User$: Observable<IUser> = this._UserSubject.asObservable();

  public constructor(private Http: HttpClient) {
    super()
    this.Read();
  }

  public Read(): void {
    this.Http.get<IUser>(this.BaseUrl + "/initPortal.ss?param=getUserExt")
      .subscribe(
        (UserNext: IUser) => {
          // console.log(`Next IUser: ${JSON.stringify(UserNext)}`);
          this._UserSubject.next(UserNext);
        },
        UserError => {

        },
        () => { // OnComplete

        }
      );
  };
}
