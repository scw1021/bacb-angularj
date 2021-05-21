import { BehaviorSubject, Observable } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';

import { AuthenticationService } from '.';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { IConfirm } from '../_interfaces';
import { IResponsibleRelationship } from '../_interfaces/i-responsible-relationship';
import { Injectable } from '@angular/core';
import { ResponseObject } from '../_models';
import { ResponsibleRelationship } from '../_models/responsible-relationship';

@Injectable({
  providedIn: 'root'
})
export class TrainingService extends BaseService {
  private _TrainingsSubject: BehaviorSubject<ResponsibleRelationship> = new BehaviorSubject<ResponsibleRelationship>(new ResponsibleRelationship());
  public Trainings$: Observable<ResponsibleRelationship> = this._TrainingsSubject.asObservable();

  public constructor(
    private Http: HttpClient,
    private authService: AuthenticationService,
    private azure: AzureHttpPostService
  ) {
    super();
    this._TrainingsSubject = new BehaviorSubject<ResponsibleRelationship>(null);
    this.Trainings$ = this._TrainingsSubject.asObservable();
  }

  public Create(objRequest: IResponsibleRelationship): Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + '/POST/239/Create',
    {data: objRequest, CustomerId: this.authService.CustomerIdSubject.value});
  }
  public Update(objRequest: IResponsibleRelationship): Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + '/POST/239/Update',
    {data: objRequest, CustomerId: this.authService.CustomerIdSubject.value});
  }

  public ReadFortyHour(): void {
    this.azure.post<ResponseObject<IResponsibleRelationship>>(this.BaseUrl + '/POST/239/Read',
    {CustomerId: this.authService.CustomerIdSubject.value, Type: '40 Hour RBT Training' })
    .pipe(
      tap(console.log),
      // pluck('Trainings'),
      tap( (_training: IResponsibleRelationship ) => {
        if ( _training !== null) {
            this._TrainingsSubject.next(new ResponsibleRelationship( _training));
        }
      })
    ).subscribe();
  }
}
