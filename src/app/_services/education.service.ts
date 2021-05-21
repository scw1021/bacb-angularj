import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { IConfirm, IInstitution } from '../_interfaces';
import { map, shareReplay, tap } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { Confirm } from '../_models';
import { HttpClient } from '@angular/common/http';
import { IDegree } from '../_interfaces/i-degree';
import { IResponseObject } from '../_interfaces/i-response-object';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EducationService extends BaseService {

  // Subjects
  public _EducationSubject: ReplaySubject<IDegree[]> = new ReplaySubject<IDegree[]>();
  public _CheckSubject: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>(new Confirm().Export());

  // Observables
  public Degree$: Observable<IDegree[]> = this._EducationSubject.asObservable();
  public Check$: Observable<IConfirm> = this._CheckSubject.asObservable().pipe(shareReplay(1));
  private _RequireCustomerId$: Observable<string> = this.authService.CustomerId$;

  public constructor(
    private Http: HttpClient,
    private azure: AzureHttpPostService,
    private authService: AuthenticationService
) {
    super();
  };

  public Check(CertTypeID: string) : void {
    // Also needs is doctoral
    this.azure.post<IConfirm>(this.BaseUrl + "DegreeInfo/Check",{"CertTypeId" : CertTypeID, 'CustomerId': this.authService.CustomerIdSubject.value})
      .subscribe(
        (CheckNext: IConfirm) => {
          if (CheckNext && CheckNext.Response) {
            this._CheckSubject.next(new Confirm(CheckNext).Export());
          }
          else {
            this._CheckSubject.next(new Confirm({'Response': 'F', 'Message': 'No response from check function.'}).Export());
          }
        }
      )
  }

  public Create(NewDegree: IDegree) : Observable<IConfirm>{
    return this.azure.post<IConfirm>(this.BaseUrl + "DegreeInfo/Upsert",
    NewDegree);
  }

  public Delete(ID: string) : Observable<IConfirm>{
    return this.azure.post<IConfirm>(this.BaseUrl + "DegreeInfo/Delete", {'Id': ID});
  }

  public Find(SelectedDegree : IDegree) : Observable<IDegree> {
    return this.Degree$
      .pipe(
        map((ObjectMap: IDegree[]) => ObjectMap.find((DegreeFind : IDegree) => DegreeFind.Id == SelectedDegree.Id))
      )
  }

  public Read() : void {
    this.azure.post<IDegree[]>(this.BaseUrl + "DegreeInfo/Read", {'CustomerId': this.authService.CustomerIdSubject.value})
      .pipe(
        // tap( degree => console.log(`Degree Found in Read: ${JSON.stringify(degree)}`))
      )
      .subscribe(
        (EducationNext: IDegree[]) => {
          if (EducationNext  != null ) {
            this._EducationSubject.next(EducationNext)
          }
        },
        EducationError => {

        },
        () => { // OnComplete

        }
      );
  }

  public Update(ModifiedDegree: IDegree) : Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + "DegreeInfo/Upsert", ModifiedDegree);
  }
  public CreateInstitution(institution: IInstitution) {
    return this.azure.post<IConfirm>(this.BaseUrl + "DegreeInfo/UpsertInstitution", institution)
  }

  public Submit(objRequest): IConfirm {
    let confirmation: IConfirm;
    this.azure.post<IConfirm>(this.BaseUrl + "DegreeInfo/Submit", objRequest)
    .pipe()
    .subscribe(
      (_confirmation: IConfirm) => {
        console.log(`Degree Submission Result: ${JSON.stringify(_confirmation)}`);
        confirmation = _confirmation;
      },
      DegreeError => {
        console.log(`DegreeError: ${JSON.stringify(DegreeError)}`)
      },
      () => {
        // Dump result to console
        console.log
      }
    )
    return confirmation;
  }

  public Upsert(degree: IDegree): Observable<IConfirm>{
    return this.azure.post<IConfirm>(this.BaseUrl + "DegreeInfo/Upsert", degree)
  }
}
