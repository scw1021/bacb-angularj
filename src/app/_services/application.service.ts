import { BehaviorSubject, Observable, ReplaySubject, Subscription, concat, of } from 'rxjs';
import { IApplication, IConfirm, IResponseObject } from '../_interfaces';
import { concatMap, concatMapTo, debounceTime, map, mapTo, shareReplay, switchMap, tap } from 'rxjs/operators'

import { ActivatedRoute } from '@angular/router';
import { Application } from '../_models';
import { AuthenticationService } from './authentication.service';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PersonalProfileService } from './personal-profile.service';
import { __GetNetSuiteDate } from '../_helpers/utility-functions';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService extends BaseService {

  // Subjects
  private _ApplicationSubject: BehaviorSubject<IApplication[]> = new BehaviorSubject<IApplication[]>([]);
  private _SelectedApplicationSubject: BehaviorSubject<IApplication> = new BehaviorSubject<IApplication>(null);
  // Observables
  public Application$ : Observable<IApplication[]> = this._ApplicationSubject.asObservable().pipe(shareReplay(1));
  private _RequireCustomerId$: Observable<string> = this.authService.CustomerId$;

  public SelectedApplication: IApplication = new Application().Export();

  public constructor(
    private Http: HttpClient,
    private AppActiveRoute: ActivatedRoute,
    private azure: AzureHttpPostService,
    private authService: AuthenticationService,
  ) {
    super()
    // Like honestly, why on earth isn't this the norm? Ensuring the service has its required data on load???
    // this._RequireCustomerId$.subscribe(
    //   (_value: string) => {
    //     if ( _value ) {
    //       // If the profile is read, we ought to ensure the custID is changed
    //       // But this needs to happen in succession
    //       this.Read();
    //     }
    //   }
    // )
    this.Read();
    // Testing only, this is app 1000 for RVI
    // BCBA 1000
    // this.SelectedApplication = {"Id":"cbb4d63b-4de2-ea11-a813-000d3a5a1cf8","Status":"Incomplete","AppType":{"Id":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","NetSuiteId":"1","Name":"New Certification"},"CertType":{"Id":"220519d3-27d0-ea11-a812-000d3a5a1477","NetSuiteId":"1","Abbrev":"BCBA","Name":"Board Certified Behavior Analyst"},"DateSubmitted":"2013-08-13T18:00:00","DateCreated":"2013-08-13T18:00:00","FirstCourseStartDate":"2020-09-01T18:00:00","LastCourseEndDate":"2020-09-05T18:00:00","Invoice":""};
    // RBT 1019, i think
    // this.SelectedApplication = {"Id":"df0a89e9-9c09-eb11-a813-000d3a5a7103","Status":"Incomplete","AppType":{"Id":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","NetSuiteId":"1","Name":"New Certification"},
    //   "CertType":{"Id":"e0d00fd3-27d0-ea11-a812-000d3a5a1cf8","NetSuiteId":"3","Abbrev":"RBT","Name":"Registered Behavioral Technican"},"DateSubmitted":"2013-08-13T18:00:00","DateCreated":"2013-08-13T18:00:00","FirstCourseStartDate":"2020-09-01T18:00:00","LastCourseEndDate":"2020-09-05T18:00:00","Invoice":""};

  }


   // WHAM!
   public SetApplication(appId: string){
     this.SelectedApplication = this._ApplicationSubject.value.find( app => app.Id == appId);
   }
   public Create(MyAppTypeID: string, MyCertTypeID: string, ParentApplication: string = ''): Observable<void> {
     // From Application-Home.service, retired 9/21/20
    let AppObj = {AppType: MyAppTypeID, CertType: MyCertTypeID, Parent: ParentApplication};

    return this.azure.post<string>(this.BaseUrl  + "Applications/Create", AppObj).pipe(
        concatMap((appId: string) => this.azure.get<IApplication[]>(this.BaseUrl + "Applications/Read")
        .pipe(
          map((ApplicationNext : IApplication[]) => {
            // let nextArray: IApplication[] = [];
            // if (ApplicationNext && ApplicationNext.length) {
            //   ApplicationNext.forEach( (_app: IApplication) => {
            //     if ( _app.Status == '' ) {
            //       _app.Status = 'In Progress';
            //     }
            //     if ( _app.DateSubmitted == '' ) {
            //       _app.DateSubmitted = '';
            //     }
            //     nextArray.push(_app);
            //   });
            // }
            this._ApplicationSubject.next(ApplicationNext);
            return;
          }),
          tap(() => this.SetApplication(appId))

          //ENDMAP
        ),
      ),
    )
    //   this.azure.post<string>(this.BaseUrl  + "Applications/Create", AppObj).pipe(
    //   concatMap((guid: string) => {
    //     this.Read();
    //   })
    // );
  }

   public Read(): void {
     // From Application-Home.service, retired 9/21/20
    this.azure.get<IApplication[]>(this.BaseUrl + "Applications/Read")
    // FIXME - remove this after testing
    // .pipe(mapTo([{"Id":"cbb4d63b-4de2-ea11-a813-000d3a5a1cf8","ContactId":"3686dbbe-94c7-ea11-a812-000d3a5a1cf8","NetSuiteId":null,"StatusId":"ba65aa31-26d0-ea11-a812-000d3a5a1477","Status":"Incomplete","AppTypeId":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","AppType":{"Id":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","NetSuiteId":"1","Name":"New Certification"},"CertTypeId":"220519d3-27d0-ea11-a812-000d3a5a1477","CertType":{"Id":"220519d3-27d0-ea11-a812-000d3a5a1477","NetSuiteId":"1","Abbrev":"BCBA","Name":"Board Certified Behavior Analyst"},"DateSubmitted":"2013-08-13T18:00:00","DateCreated":"2013-08-13T18:00:00","FirstCourseStartDate":"2020-09-01T18:00:00","LastCourseEndDate":"2020-09-05T18:00:00","Invoice":""},{"Id":"af3cb104-52e2-ea11-a813-000d3a5a1cf8","ContactId":"3686dbbe-94c7-ea11-a812-000d3a5a1cf8","NetSuiteId":null,"StatusId":"ba65aa31-26d0-ea11-a812-000d3a5a1477","Status":"Incomplete","AppTypeId":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","AppType":{"Id":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","NetSuiteId":"1","Name":"New Certification"},"CertTypeId":"220519d3-27d0-ea11-a812-000d3a5a1477","CertType":{"Id":"220519d3-27d0-ea11-a812-000d3a5a1477","NetSuiteId":"1","Abbrev":"BCBA","Name":"Board Certified Behavior Analyst"},"DateSubmitted":"2013-08-13T06:00:00","DateCreated":"2013-08-13T06:00:00","FirstCourseStartDate":"2013-08-13T06:00:00","LastCourseEndDate":"2020-08-01T06:00:00","Invoice":""},{"Id":"a7f656f6-04e4-ea11-a813-000d3a5a1cf8","ContactId":"3686dbbe-94c7-ea11-a812-000d3a5a1cf8","NetSuiteId":null,"StatusId":"ba65aa31-26d0-ea11-a812-000d3a5a1477","Status":"Incomplete","AppTypeId":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","AppType":{"Id":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","NetSuiteId":"1","Name":"New Certification"},"CertTypeId":"220519d3-27d0-ea11-a812-000d3a5a1477","CertType":{"Id":"220519d3-27d0-ea11-a812-000d3a5a1477","NetSuiteId":"1","Abbrev":"BCBA","Name":"Board Certified Behavior Analyst"},"DateSubmitted":null,"DateCreated":null,"FirstCourseStartDate":null,"LastCourseEndDate":null,"Invoice":""},{"Id":"56bf1780-5cf5-ea11-a815-000d3a5a1cf8","ContactId":"3686dbbe-94c7-ea11-a812-000d3a5a1cf8","NetSuiteId":null,"StatusId":"ba65aa31-26d0-ea11-a812-000d3a5a1477","Status":"Incomplete","AppTypeId":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","AppType":{"Id":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","NetSuiteId":"1","Name":"New Certification"},"CertTypeId":"220519d3-27d0-ea11-a812-000d3a5a1477","CertType":{"Id":"220519d3-27d0-ea11-a812-000d3a5a1477","NetSuiteId":"1","Abbrev":"BCBA","Name":"Board Certified Behavior Analyst"},"DateSubmitted":null,"DateCreated":null,"FirstCourseStartDate":null,"LastCourseEndDate":null,"Invoice":""},{"Id":"6f72f5c6-42e9-ea11-a817-000d3a5a1cf8","ContactId":"3686dbbe-94c7-ea11-a812-000d3a5a1cf8","NetSuiteId":null,"StatusId":"ba65aa31-26d0-ea11-a812-000d3a5a1477","Status":"Incomplete","AppTypeId":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","AppType":{"Id":"c6099328-2bd0-ea11-a812-000d3a5a1cf8","NetSuiteId":"1","Name":"New Certification"},"CertTypeId":"220519d3-27d0-ea11-a812-000d3a5a1477","CertType":{"Id":"220519d3-27d0-ea11-a812-000d3a5a1477","NetSuiteId":"1","Abbrev":"BCBA","Name":"Board Certified Behavior Analyst"},"DateSubmitted":null,"DateCreated":null,"FirstCourseStartDate":null,"LastCourseEndDate":null,"Invoice":""},{"Id":"8ac0e238-20e4-ea11-a813-00224808102a","ContactId":"3686dbbe-94c7-ea11-a812-000d3a5a1cf8","NetSuiteId":null,"StatusId":"ba65aa31-26d0-ea11-a812-000d3a5a1477","Status":"Incomplete","AppTypeId":"c7099328-2bd0-ea11-a812-000d3a5a1cf8","AppType":{"Id":"c7099328-2bd0-ea11-a812-000d3a5a1cf8","NetSuiteId":"2","Name":"New Certification - Option 2"},"CertTypeId":"220519d3-27d0-ea11-a812-000d3a5a1477","CertType":{"Id":"220519d3-27d0-ea11-a812-000d3a5a1477","NetSuiteId":"1","Abbrev":"BCBA","Name":"Board Certified Behavior Analyst"},"DateSubmitted":null,"DateCreated":null,"FirstCourseStartDate":null,"LastCourseEndDate":null,"Invoice":""}]))
    .subscribe(
        (ApplicationNext: IApplication[]) => {
          let nextArray: IApplication[] = [];
          if (ApplicationNext && ApplicationNext.length) {
            ApplicationNext.forEach( (_app: IApplication) => {
              if ( _app.Status == '' ) {
                _app.Status = 'In Progress';
              }
              if ( _app.DateSubmitted == '' ) {
                _app.DateSubmitted = '';
              }
              nextArray.push(_app);
            });
          }
          this._ApplicationSubject.next(nextArray);
        }
      );
  };

  public Update(ID: string): Observable<IConfirm> {
    // From Application-Home.service, retired 9/21/20
    return this.azure.post<IConfirm>(this.BaseUrl + "Applications/Update", {"ParentAppId": ID});
  }

  public Delete(ID: string): Observable<IConfirm> {
    return this.azure.post(this.BaseUrl + "Applications/Delete", {"AppId": ID});


    // Delete all Attestation, Coursework and Experience records associated with App
    // Then delete the application record
    // From Application-Home.service, retired 9/21/20

    // return this.azure.post(this.BaseUrl + "216/Delete_All", {"AppId": ID})
    //   .pipe(
    //     switchMap((AttestationReturn: IConfirm) => {
    //       if (AttestationReturn.Response == 'T') {
    //         return this.azure.post<IConfirm>(this.BaseUrl + "POST/224/Delete_All", {"AppId": ID})
    //       }
    //       else {
    //         return of(AttestationReturn);
    //       }
    //     }),
    //     switchMap((CourseworkReturn: IConfirm) => {
    //       if (CourseworkReturn.Response == 'T') {
    //         return this.azure.post<IConfirm>(this.BaseUrl + "POST/227/DeleteAll", {"AppId": ID});
    //       }
    //       else {
    //         return of(CourseworkReturn);
    //       }
    //     }),
    //     switchMap((ExperienceReturn: IConfirm) => {
    //       if (ExperienceReturn.Response == 'T') {
    //         return this.azure.post<IConfirm>(this.BaseUrl + "Applications/Delete", {"AppId": ID});
    //       }
    //       else {
    //         return of(ExperienceReturn);
    //       }
    //     })
    //   )
  }


  public GetApplication(AppId: string): Observable<Application> {
    // console.log('Available Applications: ', this._ApplicationSubject.value);
    return this._ApplicationSubject
    .pipe(
      // tap(_s => console.log(_s)),
      map((_apps: IApplication[]) => {
        let _value = new Application();
        _apps.forEach( _app => {

          if ( AppId == _app.Id ) {
            // console.log('YEEEEET');
            _value = new Application(_app);
          }
        })
        // console.log('Get Application: ', _value);
        return _value;
      }
    ));
  }

  public Find(AppID : string) : Observable<IApplication> {
    return this.Application$.pipe(map((AppMap : IApplication[]) => AppMap.find((AppFilter : IApplication) => AppFilter.Id == AppID)));
  }
  public PayApplication(appId: string): Observable<IConfirm> {
    let objRequest = {
      AppId: appId,
      PaidDate: __GetNetSuiteDate(new Date()),
    }
    return this.azure.post<IConfirm>(this.BaseUrl + 'Applications/PayApplication', objRequest)

  }
  public get CertTypeId(): string {
    return this.SelectedApplication.CertType.NetSuiteId;
  }
  public get AppTypeId(): string {
    return this.SelectedApplication.AppType.NetSuiteId;
  }
  public get AppId(): string {
    return this.SelectedApplication.Id;
  }
}
