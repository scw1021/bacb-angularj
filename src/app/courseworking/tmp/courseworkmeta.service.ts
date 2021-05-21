import { BehaviorSubject, Observable, of } from 'rxjs';
import { ICourseFlat, IDepartment, IInstitution } from '../../_interfaces';
import { Injectable, OnInit } from '@angular/core';
import { map, pluck, shareReplay, tap, withLatestFrom } from 'rxjs/operators';

import { AzureHttpPostService } from 'src/app/_services/azure-http-post.service';
import { BaseService } from 'src/app/_services';
import { ICourseworkFlat } from './i-coursework-flat';
import {InstitutionsAndDepartments} from './IInstitutionsAndDepartments';
import {mockinstsndeps} from './mockinstsdeps';

@Injectable({
  providedIn: 'root'
})
export class NewCourseworkSelectionService extends BaseService implements OnInit{
  // Safeway's Private Selection BS
  private  _selectedInstitution: BehaviorSubject<IInstitution>;
  private _currentlySelectedDepartmentId: BehaviorSubject<string | null>;

  // Displayed Selected Coursework
  private _privateSelectionCoursework: BehaviorSubject<ICourseworkFlat[]>;
  public SafewaysPrivateSelection$: Observable<ICourseworkFlat[]>;


  public InstitutionsArrAndDepartmentsArr$: Observable<InstitutionsAndDepartments>;
  public InstitutionsArr$: Observable<IInstitution[]>;

  public SelectedInstitution:Observable<IInstitution>;
  public SelectedDepartment:Observable<IDepartment>;
  public DepartmentsArr$: Observable<IDepartment[]>;

  public currentlySelectedDepartmentId$: Observable<string | null>;

  public FilteredDepartmentsArr: Observable<IDepartment[]>;

  constructor(
    private Http: AzureHttpPostService
  ) {
    // constructor inits for Coursework BS/O$
    super();
    this._privateSelectionCoursework = new BehaviorSubject<ICourseworkFlat[]>([]);
    this.SafewaysPrivateSelection$ = this._privateSelectionCoursework.asObservable();
    this.InstitutionsArrAndDepartmentsArr$ = this.Http.get<InstitutionsAndDepartments>(
      this.BaseUrl + "Coursework/Read").pipe(shareReplay(1));
          // Institution and Department Section
    this.InstitutionsArr$ = this.InstitutionsArrAndDepartmentsArr$.pipe(
      pluck("Institutions"),
      map(_x => _x.sort( (a, b ) => a.Name > b.Name ? 1 : -1 )),
      // tap(x => console.log("all Insts", x)),
      shareReplay(1)
    );

    this.DepartmentsArr$ = this.InstitutionsArrAndDepartmentsArr$.pipe(
      pluck("Departments"),
      // Why sort, there are so few
      // map(_x => _x.sort( (a, b ) => a.Name > b.Name ? 1 : -1 )),
      // tap(x => console.log("all Depts", x)),
      shareReplay(1)
    );
  }
  ngOnInit(): void {

    this.FilteredDepartmentsArr = this.DepartmentsArr$.pipe(
      withLatestFrom(this.SelectedInstitution),
      map<[IDepartment[], IInstitution], IDepartment[]>(([iDeps, SelectedInstitution]) =>
        {
          iDeps.map((department) => department.InstitutionId == SelectedInstitution.Id)
          return iDeps
        }
      ),
    );
  }
  public getCourseByDepartmentId(id: string){
    return this.Http.post<ICourseFlat>(this.BaseUrl + 'Coursework/FlatCoursesByDepartment', {"Id": id})
  }
  // NEXTS
  public setSelectedInstitution(inst: IInstitution){
    this._selectedInstitution.next(inst);
  }

  public setSelectedDepartment(dep: IDepartment){
    this._currentlySelectedDepartmentId.next(dep.Id);
  }

}
