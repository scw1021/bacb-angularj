import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { BlankProfessionalData, IProfessionalData } from '../_interfaces/i-professional-data';
import { shareReplay, tap } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { Confirm } from '../_models';
import { HttpClient } from '@angular/common/http';
import { IConfirm } from '../_interfaces/i-confirm';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalInfoService extends BaseService {

  // Subjects
  private _ProfessionalSubject: BehaviorSubject<IProfessionalData> = new BehaviorSubject<IProfessionalData>(BlankProfessionalData);
  private _CheckSubject: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>(new Confirm().Export());

  // Observables
  public ProfessionalData$: Observable<IProfessionalData> = this._ProfessionalSubject.asObservable();
  public Check$: Observable<IConfirm> = this._CheckSubject.asObservable().pipe(shareReplay());
  private _RequireCustomerId$: Observable<string> = this.authService.CustomerId$;

  public constructor(
    private Http: HttpClient,
    private authService: AuthenticationService,
    private azure: AzureHttpPostService
  ) {
    super();
    this.Check();
  };

  public Check() : void {
    this.azure.get<IConfirm>(this.BaseUrl + "ProfessionalInfo/Check")
    .pipe()
    .subscribe(
      (CheckNext: IConfirm) => {
        if (CheckNext && CheckNext.Response) {
          this._CheckSubject.next(new Confirm(CheckNext).Export());
        }
        else {
          this._CheckSubject.next(new Confirm({'Response': 'F', 'Message': 'No response from check function.'}).Export());
        }
      },
      CheckError => { // OnComplete
        this._CheckSubject.next(new Confirm({'Response': 'F', 'Message': CheckError}).Export());
      },
      () => {

      }
    );
  };

  public Read() : void {
    this.azure.get<IProfessionalData[]>(this.BaseUrl + "ProfessionalInfo/Read")
    .pipe(
      // tap((profObj) => console.log("ProfessionalObj READ", profObj) )
    )
    .subscribe(
      (ProfessionalNext: IProfessionalData[]) => {
        this._ProfessionalSubject.next(ProfessionalNext[0]);
        // console.log("ProfessionalInfo READ", ProfessionalNext[0])
      },
      ProfessionalError => {

      },
      () => { // OnComplete

      }
    )
  }

  public Update(NewProfessionalData: IProfessionalData) : Observable<IConfirm> {
    console.warn(NewProfessionalData)
    return this.azure.post<IConfirm>(this.BaseUrl + "ProfessionalInfo/Update", NewProfessionalData)
    .pipe(tap(console.log));
  }
}
