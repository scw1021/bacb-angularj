import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { Confirm, ContentAreaHours, Course, RegisteredCourse } from '../_models';
import { IApplication, IContentAreaHours, ICourse, ICourseHours, IDepartment, IRegisteredCourse, IResponseObject } from '../_interfaces';
import { Injectable, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { filter, map, pluck, tap, toArray } from 'rxjs/operators';

import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { CourseworkFull } from '../_models/coursework-full';
import { HttpClient } from '@angular/common/http';
import { IConfirm } from '../_interfaces/i-confirm';
import { ICourseworkData } from '../_interfaces/i-coursework-data';
import { ICourseworkFull } from '../_interfaces/i-coursework-full';

@Injectable({
  providedIn: 'root'
})
export class CourseworkService extends BaseService {

  // Subjects
  public _DepartmentSubject: BehaviorSubject<IDepartment[]> = new BehaviorSubject<IDepartment[]>([]);
  public _RegisteredCourseSubject: BehaviorSubject<IRegisteredCourse[]> = new BehaviorSubject<IRegisteredCourse[]>([new RegisteredCourse().Export()]);
  public _ContentAreaHourSubject: BehaviorSubject<IContentAreaHours> = new BehaviorSubject<IContentAreaHours>(new ContentAreaHours().Export());
  public _CourseworkSubject: BehaviorSubject<ICourseworkFull[]> = new BehaviorSubject<ICourseworkFull[]>([new CourseworkFull().Export()]);
  public _CheckSubject: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>(new Confirm().Export());

  // Observable
  public Department$: Observable<IDepartment[]> = this._DepartmentSubject.asObservable();
  public RegisteredCourse$: Observable<IRegisteredCourse[]> = this._RegisteredCourseSubject.asObservable();
  public ContentAreaHour$: Observable<IContentAreaHours> = this._ContentAreaHourSubject.asObservable();
  public Coursework$: Observable<ICourseworkFull[]> = this._CourseworkSubject.asObservable();
  public Check$: Observable<IConfirm> = this._CheckSubject.asObservable();

  public constructor(
    private Http: HttpClient,
    private azure: AzureHttpPostService,
  ) {
    super()
  }

  public Check(AppID: string) : void {
        // Killed to unFk the Console.logs mm 9.2.20
        return null;
    this.azure.post<IConfirm>(this.BaseUrl + "/POST/224/Check", {'AppId' : AppID})
      .pipe(tap(
        (CheckNext: IConfirm) => {
          if (CheckNext && CheckNext.Response) {
            this._CheckSubject.next(new Confirm(CheckNext).Export());
          }
          else {
            this._CheckSubject.next(new Confirm({'Response': 'F', 'Message': 'No response from check function.'}).Export());
          }
        }
      )).subscribe();
  }

  public Create(NewCoursework: ICourseworkData[]) : Observable<IConfirm[]> {
        // Killed to unFk the Console.logs mm 9.2.20
        return null;
    return this.azure.post<IResponseObject<IConfirm>>(this.BaseUrl + "/POST/224/Create", {'Array': NewCoursework})
           .pipe(map((CourseworkResponse: IResponseObject<IConfirm>) => CourseworkResponse.Array));
  }

  public Delete(CourseworkID: string) : Observable<IConfirm> {
        // Killed to unFk the Console.logs mm 9.2.20
        return null;
    return this.azure.post<IConfirm>(this.BaseUrl + "/POST/224/Delete", {'Id': CourseworkID});
  }

  public Read(AppID: string) : void {
        // Killed to unFk the Console.logs mm 9.2.20
        return null;
    this.azure.post<IResponseObject<ICourseworkFull>>(this.BaseUrl + "/POST/224/Read", {'AppId' : AppID})
      .subscribe(
        (CourseworkNext: IResponseObject<ICourseworkFull>) => {
          if (CourseworkNext && CourseworkNext.Array != null && CourseworkNext.Array.length) {
            this._CourseworkSubject.next(CourseworkNext.Array)
          }
          else {
            this._CourseworkSubject.next([]);
          }
        },
        CourseworkError => {

        },
        () => { // OnComplete

        }
      );
  };

  public ReadDepartments(InstitutionID: string) : void {
        // Killed to unFk the Console.logs mm 9.2.20
        return null;
    this.azure.post<IResponseObject<IDepartment>>(this.BaseUrl + "Utilities/GetDepartments", {'InstitutionId' : InstitutionID })
      .pipe()
      .subscribe(
        (DepartmentNext: IResponseObject<IDepartment>) => {
          if (DepartmentNext.Array != null && DepartmentNext.Array.length) {
            this._DepartmentSubject.next(DepartmentNext.Array)
          }
        },
        DepartmentError => {

        },
        () => { // OnComplete
//testaetaetaetaetaetasdgasd
        }
      );
  };

  public ReadRegisteredCoursesObservable(DepartmentID: string): Observable<IRegisteredCourse[]>{
    console.log("is this the problem")
    return this.azure.post<IResponseObject<IRegisteredCourse>>(this.BaseUrl + "Utilities/GetCoursesClean", {'DepartmentId' : DepartmentID })
    .pipe(pluck('Array'));


  }

  public ClearRegisteredCourseSubject(): void{
    this._RegisteredCourseSubject.next([]);
  }

  public ReadRegisteredCourses(DepartmentID: string) : void {
    this.azure.post<IResponseObject<IRegisteredCourse>>(this.BaseUrl + "Utilities/GetRegisteredCourses", {'DepartmentId' : DepartmentID })
      // .pipe(tap((RegCourseTap: IResponseObject<IRegisteredCourse>) => console.log(JSON.stringify(RegCourseTap))))
      .subscribe(
        (RegCourseNext: IResponseObject<IRegisteredCourse>) => {
          if (RegCourseNext != null && RegCourseNext.Array != null && RegCourseNext.Array.length) {
            this._RegisteredCourseSubject.next(RegCourseNext.Array)
          }
        },
        RegCourseError => {

        },
        () => { // OnComplete

        }
      );
  };
  public Submit(objRequest): IConfirm {
    let confirmation: IConfirm;
    this.azure.post<IConfirm>(this.BaseUrl + "/POST/224/Submit", objRequest)
    .pipe()
    .subscribe(
      (_confirmation: IConfirm) => {
        // console.log(`Coursework Submission Result: ${JSON.stringify(_confirmation)}`);
        confirmation = _confirmation;
      },
      CourseworkError => {
        console.log(`CourseworkError: ${JSON.stringify(CourseworkError)}`)
      },
      () => {
        // Dump result to console
        console.log
      }
    )
    return confirmation;
  }

  public Update(SelectedCoursework : ICourseworkData) : Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + "/POST/224/Update", SelectedCoursework);
  }

  public UpdateApplication(AppObject: IApplication) : Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + "/POST/215/Update", AppObject);
  }

}
