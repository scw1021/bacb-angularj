import { BehaviorSubject, Observable } from 'rxjs';
import { ICertification, IConfirm, IListObject, IResponseObject, ISupervision } from '../_interfaces';

import { AuthenticationService } from '.';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { Certification, Customer } from '../_models';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concatMap, concatMapTo, distinctUntilChanged, filter, map, shareReplay, tap } from 'rxjs/operators';
import { ICreateSupervision, IFlatSupervision, IRemoveSupervisor } from '../supervision-tools/supervision-tools.component';

@Injectable({
  providedIn: 'root'
})
export class SupervisionService extends BaseService {

  // Subjects
  // private _SupervisionSuperviseeSubject: BehaviorSubject<ISupervision[]> = new BehaviorSubject<ISupervision[]>([]);
  // private _SupervisionSupervisorSubject: BehaviorSubject<ISupervision[]> = new BehaviorSubject<ISupervision[]>([]);
  // private _SupervisionCertificationSubject: BehaviorSubject<Certification[]> = new BehaviorSubject<Certification[]>([]);
  // private _ReasonsForRemoval: BehaviorSubject<IListObject[]> = new BehaviorSubject<IListObject[]>([]);

  // // Observables
  // public Supervisee$: Observable<ISupervision[]> = this._SupervisionSuperviseeSubject.asObservable();
  // public Supervisor$: Observable<ISupervision[]> = this._SupervisionSupervisorSubject.asObservable();
  // public Certification$: Observable<Certification[]> = this._SupervisionCertificationSubject.asObservable();
  // public ReasonsForRemoval$: Observable<IListObject[]> = this._ReasonsForRemoval.asObservable();
  public Supervisees$: Observable<ISupervision[]>;
  public Supervisors$: Observable<ISupervision[]>;
  public UserHighestCert$: Observable<ICertification>;
  public ReasonsForRemoval$: Observable<IListObject[]>;
  private refetchSupervisors: BehaviorSubject<"Supervisors" | "Supervisees" | "Certs" | "ReasonsForRemoval" > = new BehaviorSubject(null);
  private refetchSupervisees: BehaviorSubject<null > = new BehaviorSubject(null);
  private refetchCert: BehaviorSubject<null > = new BehaviorSubject(null);
  private refetch: BehaviorSubject<"Supervisors" | "Supervisees" | "Certs" | "ReasonsForRemoval" > = new BehaviorSubject(null);

  public constructor(
    private http: HttpClient,
    // private authService: AuthenticationService,
  ) {
    super();
    this.UserHighestCert$ = this.refetchCert.asObservable().pipe(
      concatMap<any, Observable<ICertification>>(() =>
        this.httpFactoryFn<ICertification>("Supervisions/GetHighestCertForCurrentUser")),
      shareReplay(1)
    )
    this.Supervisors$ = this.refetchSupervisors.asObservable().pipe(
      concatMap<any, Observable<ISupervision[]>>(() => this.httpFactoryFn<ISupervision[]>("Supervisions/ReadSupervisors")),
      shareReplay(1)
    )

    this.Supervisees$ = this.refetchSupervisees.asObservable().pipe(
      concatMap<any, Observable<ISupervision[]>>(() => this.httpFactoryFn<ISupervision[]>("Supervisions/ReadSupervisees")),
      shareReplay(1)
    )
    this.ReasonsForRemoval$ = this.getReasonsForRemoval()
    this.refetchData("Supervisors");
    this.refetchData("Supervisees");
    //this.ReadReasonsForRemoval();
  };
  public refetchData(dataToRefetch : "Supervisors" | "Supervisees" | "Certs" | "ReasonsForRemoval" ){
    switch (dataToRefetch){
      case "Supervisors":
        this.refetchSupervisors.next(null);
      case "Supervisees":
        this.refetchSupervisees.next(null);
      case "Certs":
        this.refetchCert.next(null);
    }

  }
  private httpFactoryFn<T>(endpointStr: string): Observable<T>{
    return this.http.get<T>(this.BaseUrl + endpointStr);
  }

  public getSingleCustomerFromBACBID(superviseeBacbId: string, superviseeCertTypeId: string){
    return this.http.post<any>(this.BaseUrl + 'Supervisions/GetSingleCustomerFromBACBID', {"BACBID": superviseeBacbId, "SuperviseeCertTypeId": superviseeCertTypeId})
    .pipe(
      map<any, [Customer, string]>((customerAndCertID) =>
      // Item1 and Item2 are the names given by C# to a tuple
      [customerAndCertID["Item1" ], customerAndCertID["Item2"]]
      )
    )
  }

  public addSupervision(supervisionCreate: ICreateSupervision){
    return this.http.post<string>(this.BaseUrl + "Supervisions/CreateSupervision", supervisionCreate)
  }
  public removeSupervision(SupervisionId: string){
    return this.http.post(this.BaseUrl + 'Supervisions/SetSupervisionInactive', {SupervisionId: SupervisionId})
  }

  public removeSupervisee(removalInformation: IRemoveSupervisor){
    return this.http.post(this.BaseUrl + 'Supervisions/RemoveSupervisee', removalInformation)
  }

  public getReasonsForRemoval(){
    return this.httpFactoryFn<IListObject[]>("Supervisions/GetAllReasonsForRemoval")
  }
  public validateAceTrainerBACBID(bacbId: string): Observable<string>{
    return this.http.post<string>(this.BaseUrl + "Supervisions/GetACETrainingBACBID", {"InstructorBACBID": bacbId})
  }
  public validateAceTrainerAceProvider(bacbId: string): Observable<string>{
    return this.http.post<string>(this.BaseUrl + "Supervisions/GetACETrainingProviderNumber", {"AcePrioviderNumber": bacbId})
  }
}
