import { ApplicationService, BaseService } from '../_services';
import { BehaviorSubject, Observable } from 'rxjs';
import { IConfirm, IDepartment, IInstitution } from '../_interfaces';
import { Injectable, OnInit } from '@angular/core';
import { map, shareReplay, tap } from 'rxjs/operators';

import { AzureHttpPostService } from '../_services/azure-http-post.service';
import { ICourseworkFlat } from './tmp/i-coursework-flat';
import { ICourseworkResponse } from './i-coursework-response';
import { NewCourseworkSelectionService } from './tmp/courseworkmeta.service';

@Injectable({
  providedIn: 'root'
})

export class CourseSubmissionService extends BaseService  implements OnInit{

  // Institutions and Departments from CDS
  public InstitutionsArr$: Observable<IInstitution[]>;
  public DepartmentsArr$: Observable<IDepartment[]>;
  // coursework from CDS
  public  _storedCoursework: BehaviorSubject<ICourseworkFlat[]>;
  public MyFourthCoursework$: Observable<ICourseworkFlat[]>;
  public MyFourthEditionTotals$: Observable<any>;
  public MyFifthCoursework$: Observable<ICourseworkFlat[]>;
  public MyFifthEditionTotals$: Observable<any>;
  // coursework selected in form, updated on submission
  private _selectedCoursework: BehaviorSubject<ICourseworkFlat[]>;


  constructor(
    private Http: AzureHttpPostService,
    private crseMeta: NewCourseworkSelectionService,
    private appService: ApplicationService
  ) {
    super();
    this.InstitutionsArr$ = this.crseMeta.InstitutionsArr$.pipe(shareReplay(1));
    this.DepartmentsArr$ = this.crseMeta.DepartmentsArr$.pipe(shareReplay(1));
    this._storedCoursework = new BehaviorSubject<ICourseworkFlat[]>(null);
    this._selectedCoursework = new BehaviorSubject<ICourseworkFlat[]>(null);
    // Coursework Display
    this.MyFourthCoursework$ = this._storedCoursework.pipe(
      map<ICourseworkFlat[], ICourseworkFlat[]>( (coursework) => {
        if ( coursework ) return coursework.filter((course) =>
          course.Edition.Value == "Fourth Edition");
        else return [];
      }),
      // tap(x=>console.log('Fourth', x)),
      shareReplay(1),
      // Yes, that's what it is.
    );
    this.MyFifthCoursework$ = this._storedCoursework.pipe(
      map<ICourseworkFlat[], ICourseworkFlat[]>( (coursework) =>{
        if ( coursework ) return coursework.filter((course) =>
          course.Edition.Value == "Fifth Edition");
        else return [];
      }),
      // tap(x=>console.log('Fifth', x)),
      shareReplay(1),
    );
  }
  ngOnInit(): void {

  }
  public Fetch(): void {
    this.appService.Application$
    this.Http.post<ICourseworkFlat[]>(this.BaseUrl + "Coursework/Read", {"AppId": this.appService.AppId} )
    // .pipe(tap(console.warn),
    // tap(x => console.log(x[0] as ICourseworkFlat)))
    .subscribe( (response: ICourseworkFlat[]) => {
      this._storedCoursework.next(response);
    });
  }

  public SubmitCoursework(coursework: ICourseworkResponse[], firstDate, lastDate){
    let submission: DynamicsCoursework[] = [];
    coursework.forEach( (course) => {
      submission.push({
        Application: course.Application,
        SemesterId: course.Semester?.Id,
        QuarterId: course.Quarter?.Id,
        CourseDurationId: course.CourseDurationId,
        Year: course.Year
      });
    })
    this.Http.post<IConfirm>(this.BaseUrl + "Coursework/Create",
      {Array:submission, FirstDate: firstDate, LastDate: lastDate, AppId: this.appService.AppId}
    ).subscribe( (_response: IConfirm) => {
      if ( _response.Response == "T" ) {
        console.log(_response)
        this.appService.SelectedApplication.FirstCourseStartDate = firstDate;
        this.appService.SelectedApplication.LastCourseEndDate = lastDate;
        this.Fetch();
      }
      else {
        console.error(_response);
      }
    });
  }
  // Why not have the delete auto update the stored data in the UI?
  public DeleteCoursework(coursework: ICourseworkFlat){
    this.Http.post<ICourseworkFlat[]>(this.BaseUrl + "Coursework/Delete",
      {"Id": coursework.Id, "AppId": this.appService.AppId})
    .subscribe( (response: ICourseworkFlat[]) =>{
      this._storedCoursework.next(response);
    })
  }
  public getCourseByDepartmentId(id: string){
    return this.Http.post<any>(this.BaseUrl + 'Coursework/FlatCoursesByDepartment', {"Id": id})
  }
}

interface DynamicsCoursework {
  Application: string;
  SemesterId: string;
  QuarterId: string;
  CourseDurationId: string;
  Year: string;
}
