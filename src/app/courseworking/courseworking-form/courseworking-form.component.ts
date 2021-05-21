import { AppData, ComponentData } from 'src/app/_models';
import { ApplicationService, ModelToolsService } from 'src/app/_services';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ICourseFlat, IDepartment, IInstitution, IListObject, IListRange } from 'src/app/_interfaces';
import { concatMap, debounce, debounceTime, filter, map, shareReplay, startWith, tap, withLatestFrom } from 'rxjs/operators';

import { CheckCompletionService } from '../checkCompletion.service';
import { CourseSubmissionService } from '../courseSubmission.service';
import { ICourseworkFlat } from '../tmp/i-coursework-flat';
import { ICourseworkResponse } from '../i-coursework-response';

interface OptionGroup {
  name: string,
  options: IListObject[]
}
@Component({
  selector: 'app-courseworking-form',
  templateUrl: './courseworking-form.component.html',
  styleUrls: ['./courseworking-form.component.css']
})

export class CourseworkingFormComponent implements OnInit {
  // @Input() public InstComponentData : ComponentData;
  // @Input() public InstAppData : AppData;
  public ShowForm = false;
  public IsLoading = false;
  public HasLoaded = false;
  public EnableSubmitButton = false;
  // Local Observable filtered
  public FilteredInstitutions$: Observable<IInstitution[]>;
  public InstitutionSelection$: BehaviorSubject<IInstitution> = new BehaviorSubject<IInstitution>(null);
  public FilteredDepartments$: Observable<IDepartment[]>;
  public courseArray$: Observable<any[]>;
  public Semesters: IListObject[] = [];
  public Quarters: IListObject[] = [];
  private _semesters = [{Id: "565c575f-2bba-ea11-a812-000d3a5a1477",Value: "Spring"},
  {Id: "7c5c575f-2bba-ea11-a812-000d3a5a1477", Value: "Summer"},
  {Id: "bf60ef65-2bba-ea11-a812-000d3a5a1477", Value: "Fall"},
  {Id: "d960ef65-2bba-ea11-a812-000d3a5a1477", Value: "Winter"}];
  private _quarters = [{Id: "15f3c9fd-2bba-ea11-a812-000d3a5a1477", Value: "Quarter 1"},
  {Id: "ea99c403-2cba-ea11-a812-000d3a5a1477", Value: "Quarter 2"},
  {Id: "129ac403-2cba-ea11-a812-000d3a5a1477", Value: "Quarter 3"},
  {Id: "e6a1c109-2cba-ea11-a812-000d3a5a1477", Value: "Quarter 4"}];
  public TermGroup: OptionGroup[] = [
    {
      name: 'Semesters',
      options: this._semesters
    },
    {
      name: 'Quarters',
      options: this._quarters
    }
  ]

  // Housekeeping
  public subs: Subscription[] = [];
  // Form Group and Controls
  public formGroup: FormGroup;
  public InstitutionControl = new FormControl();
  public DepartmentControl = new FormControl();
  public TermControl = new FormControl();
  public YearControl = new FormControl();
  private SelectedCoursework: {[key:string]: ICourseworkResponse} = {};


  /**@description Simply an array of displayed properties */
  public displayedColumns: string[] = ['skip','Course #','Name', 'Edition', "Level", "Duration", "Year", "TermSelect","YearSelect", "Add"];

  constructor(
    private applicationService: ApplicationService,
    private checkService: CheckCompletionService,
    private formService: CourseSubmissionService,
    private modelToolsService: ModelToolsService,
    formBuilder: FormBuilder
  ) {
    this.FilteredInstitutions$ = this.InstitutionControl.valueChanges
    .pipe(
      debounceTime(200),
      startWith(''),
      map( value => value?.Id ? value.Name : value ),
      withLatestFrom(this.formService.InstitutionsArr$),
      map(
        ([formValue, institutions]) => {
          console.log(formValue);
          return institutions.filter( institution =>
            institution.Name.toLowerCase().includes(formValue.toLowerCase())
          )
        }
      ),
      tap(x=>this.HasLoaded = false),
    )
    this.FilteredDepartments$ = this.InstitutionControl.valueChanges
    .pipe(
      debounceTime(100),
      withLatestFrom(this.formService.DepartmentsArr$),
      map(
        ([institution, departments]) =>
          departments.filter( department => department.InstitutionId == institution.Id)
      ),
      tap( departments => {
        if ( !departments.find( department => department.Id == this.DepartmentControl.value?.Id )){
          this.DepartmentControl.setValue(null);
          this.HasLoaded = false;
        }
      }),
      // tap(console.log)
    );
    this.courseArray$ = this.DepartmentControl.valueChanges
    .pipe(
      tap(x => {this.IsLoading = true; console.log('IsLoading')}),
      filter((depCtrlVal: string | IDepartment) => typeof(depCtrlVal) !== ("string" || "null")),
      concatMap((dep: IDepartment) => {
        console.log('Department', dep)
        if ( dep?.Id ){
          return this.formService.getCourseByDepartmentId(dep.Id);
        }
        else {
          this.IsLoading = false;
          return of([]);
        }
      }),
      tap((courseCallOutPut) => {
        if ( this.IsLoading && courseCallOutPut ) {
          this.IsLoading = false;
          this.HasLoaded = true;
        }
        console.log('Courses in form', courseCallOutPut)
      }),
      withLatestFrom(this.formService._storedCoursework),
      map( ([coursesSelected, coursesSubmitted]) => {

        coursesSelected.forEach(selected => {
          selected.Disabled = false;
          coursesSubmitted.forEach(course => {
            if ( selected.Id == course.CourseDurationId ) {
              selected.Disabled = true;
            }
          })
        });
        console.log('selected', coursesSelected);
        console.log('courses', coursesSubmitted);
        return coursesSelected;
      }),
      shareReplay(1)
    );
    this.TermControl.setValidators(Validators.required);
    this.YearControl.setValidators(Validators.required);
    this.formGroup = formBuilder.group({
      FirstCourseStartDate: ['', Validators.required],
      LastCourseEndDate: ['', Validators.required],
      Institution: this.InstitutionControl,
      Department: this.DepartmentControl,
      YearControl: this.YearControl,
      TermControl: this.TermControl
    });
  }

  ngOnInit(): void {
  }
  public OnClickAddCoursework() : void {
    this.ShowForm = !this.ShowForm;
    this.formGroup.controls['FirstCourseStartDate'].setValue(this.applicationService.SelectedApplication.FirstCourseStartDate);
    this.formGroup.controls['LastCourseEndDate'].setValue(this.applicationService.SelectedApplication.LastCourseEndDate);
  }
  public onClickCourse(courseFlatToAdd: ICourseFlat){
    // UI/UX
    courseFlatToAdd.Selected = !courseFlatToAdd.Selected;
    // Coursework maintenance
    if ( courseFlatToAdd.Selected ){
      this.SelectedCoursework[courseFlatToAdd.Id] = {
        CourseDurationId: courseFlatToAdd.Id,
        Application: this.applicationService.AppId,
        // We can add multiple, and we can seed it with previous values
        Semester: this._semesters.find( (value: IListObject) => value.Id == this.TermControl.value?.['Id']),
        Quarter: this._quarters.find( (value: IListObject) => value.Id == this.TermControl.value?.['Id']),
        Year: this.YearRange(courseFlatToAdd).find( year => year == this.YearControl.value as number)?.toString(),
      } as ICourseworkResponse;
    }
    else {
      var currentCoursework: {[ket:string]: ICourseworkResponse} = {};
      for( var key in this.SelectedCoursework){
        if ( key != courseFlatToAdd.Id ){
          currentCoursework[key] = this.SelectedCoursework[key];
        }
      }
      this.SelectedCoursework = currentCoursework;
    }
    // console.log('Enable', Object.keys(this.SelectedCoursework));
    this.EnableSubmitButton = ( Object.keys(this.SelectedCoursework).length != 0 );
  }
  public OnSelectTerm(event, course: ICourseFlat){
    // We don't care what we get, we just want to get it. Plus we need the reset on swap anyway
    this.SelectedCoursework[course.Id].Semester = this._semesters.find( (value: IListObject) =>
      value.Id == event.value.Id);
    this.SelectedCoursework[course.Id].Quarter = this._quarters.find( (value: IListObject) =>
      value.Id == event.value.Id);
  }
  public OnSelectYear(event, course: ICourseFlat){
    this.SelectedCoursework[course.Id].Year = event.value;
  }

  /** @description Template function to pluck name of institution*/
  public displayInstitution(institution: IInstitution){
    return institution && institution.Name ? institution.Name : '';
  }
  public OnSelectInstitution(SelectedIInstitution : IInstitution) : void {
    this.InstitutionSelection$.next(SelectedIInstitution);
  }
  public displayDepartment(department: IDepartment){
    return department && department.Name ? department.Name : '';
  }
  public YearRange(course: ICourseFlat): number[] {
    let start:number = 2000;
    let end:number = 2020;
    let list: number[] = [];
    if ( course.Year.Start) {
      start = course.Year.Start as number;
    }
    else if (course.Date.Start) {
      start = (new Date(course.Date.Start)).getFullYear();
    }
    if ( course.Year.End) {
      end = course.Year.Start as number;
    }
    else if (course.Date.End) {
      end = (new Date(course.Date.End)).getFullYear();
    }
    for (var year = start; year <= end; year++){
      list.push(year);
    }
    return list;
  }
  public SelectionClass(selected: boolean): string {
    return selected ? "highlighted" : "";
  }

  public SubmitForm(): void{
     /* TODO -
      * Add validators to form controls, required on year/term
      * X - Create Application Service to store Application Model: Id, CertId Dates etc
      * USE that service for courseworkResponse creation and filtration events
      * Make sure that dates fill in, and subsequently are updated
      *
      * X - Upsert 1 coursework
      * X - Upsert +1 coursework {Array:[]}
      * Clear form on successful submit
      * X - Set up Delete buttons on existing coursework
      * X - Check that upsert/delete both trigger reads? or have delete just update local
      *
      * With upload/delete and refresh working, get Hybrid 'started' within reason for demo
      *
      */
    console.warn(this.formGroup.valid)

    console.warn(this.SelectedCoursework);
    let request: ICourseworkResponse[] = [];
    for (var key in this.SelectedCoursework) {
      request.push(this.SelectedCoursework[key])
    }
    if ( !request.length ) {
      return;
    }
    this.formService.SubmitCoursework(request,
      this.formGroup.controls['FirstCourseStartDate'].value,
      this.formGroup.controls['LastCourseEndDate'].value);
    this.InstitutionControl.setValue('');
    this.DepartmentControl.setValue('');
    this.DepartmentControl.reset();
    this.SelectedCoursework = {};



  }
}

export interface matTableDisplayNameAndPropertyName{
  display: string;
  propertyName: string;
}
