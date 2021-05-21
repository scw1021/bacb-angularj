import { AlertService, CertificationService, ModelToolsService } from 'src/app/_services';
import { BehaviorSubject, Observable } from 'rxjs';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfirm, IInstitution, IListObject, IRequiredType } from 'src/app/_interfaces';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';

import { ContinuingEducationCredit } from '../../../_models/continuing-education-credit';
import { ContinuingEducationService } from '../../continuing-education.service';
import { Institution } from 'src/app/_models';
import { __GetNetSuiteDate } from 'src/app/_helpers/utility-functions';

@Component({
  selector: 'app-learning-coursework-form',
  templateUrl: './learning-coursework-form.component.html',
  styleUrls: ['./learning-coursework-form.component.css']
})
export class LearningCourseworkFormComponent implements OnInit {
  // Tell parent component to remove child component from DOM
  @Output() public ClearEvent: EventEmitter<boolean> = new EventEmitter<boolean>();


  // Form Elements
  public InputForm: FormGroup;
  public CourseGradeOptions: IListObject[];
  public FileCheck: BehaviorSubject<IConfirm>;
  public FileTypes: IRequiredType[] = [
    {
      Type: {Code:'CEC2', Description:'Learning: Coursework - Course Syllabus', Id:'863ab710-dc26-eb11-a813-000d3a5a7103'},
      RequirementMet: 'F'
    },
    {
      Type: {Code:'CEC3', Description:'Learning: Coursework - Updated Transcript', Id:'8abee116-dc26-eb11-a813-000d3a5a7103'},
      RequirementMet: 'F'
    }
  ];
  public FilteredInstitutions: Observable<IInstitution[]>;
  public SelectedInstitution: Institution;

  constructor(
    protected alertService: AlertService,
    private certService: CertificationService,
    private continuingEducationService: ContinuingEducationService,
    private formBuilder: FormBuilder,
    private modelService: ModelToolsService,
  ) {
    this.CourseGradeOptions = this.continuingEducationService.GradeList$;
    this.FileCheck = new BehaviorSubject<IConfirm>({
      Response: 'F',
      Message: ''
    });
    this.SelectedInstitution = new Institution();

  }

  ngOnInit() {
    this.InputForm = this.formBuilder.group({
      InstitutionFC: ['', Validators.required],
      CourseName: ['', Validators.required],
      CourseNumber: ['', Validators.required],
      CreditHours: ['', Validators.required],
      Grade: ['', Validators.required],
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      GeneralCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
      EthicsCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
      SupervisionCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
    });
    this.FilteredInstitutions = this.InputForm.controls['InstitutionFC'].valueChanges
    .pipe(
      startWith(""),
      debounceTime(300),
      switchMap((value : string) => this.SearchInstitution(value))
    );
  }
  public SearchInstitution(ParamName: string) : Observable<IInstitution[]> {
    return this.modelService.Institution$
    .pipe(
      map((InstitutionMap : IInstitution[]) => InstitutionMap.filter((InstFilter : IInstitution) => {
        return InstFilter.Name.toLowerCase().match(new RegExp(ParamName,"i"));
      }))
    )
  }
  public DisplayInstitution(ChosenInstitution : IInstitution) : string {
    if (ChosenInstitution.Id) {
      this.SelectedInstitution = new Institution(ChosenInstitution);
      return this.SelectedInstitution.Name;
    }
  }
  public OnSelectInstitution(SelectedIInstitution : IInstitution) : void {
    this.SelectedInstitution = new Institution(SelectedIInstitution);
  }
  private translateForm(): ContinuingEducationCredit {
    return new ContinuingEducationCredit({
      Id: '',
      Type: {Id: '100000001', Value: 'Learning: Coursework'},
      TypeId: '100000001',
      Title: this.InputForm.controls['CourseName'].value,
      Provider: this.InputForm.controls['InstitutionFC'].value.Name,
      CourseNumber: this.InputForm.controls['CourseNumber'].value,
      CreditHours: this.InputForm.controls['CreditHours'].value,
      Grade: this.InputForm.controls['Grade'].value,
      StartDate: __GetNetSuiteDate(this.InputForm.controls['StartDate'].value),
      CompletionDate: __GetNetSuiteDate(this.InputForm.controls['EndDate'].value),
      GeneralUnits: this.InputForm.controls['GeneralCredits'].value,
      EthicsUnits: this.InputForm.controls['EthicsCredits'].value,
      SupervisionUnits: this.InputForm.controls['SupervisionCredits'].value,
      CertCycle: null,
    })
  }
  public FileEvent(event: IConfirm): void {
    this.FileCheck.next(event);
  }
  public Save(): void {
    if (this.InputForm.invalid) {
      this.alertService.error('Form is Incomplete!');
      return;
    }
    // if ( this.FileCheck.value.Response != 'T' ) {
    //   this.alertService.error('Please submit your required files first!');
    //   return;
    // }
    console.warn('Create', this.translateForm().Export())
    this.continuingEducationService.Create(
      this.translateForm().Export()
    )
    .subscribe(
      (_response: IConfirm) => {
        if ( _response && _response.Response && _response.Response == 'T' ) {
          this.alertService.success('Continuing Education Credit added!');
          this.CloseForm();
          this.continuingEducationService.Read();
        }
        else {
          this.alertService.error( _response.Message ? _response.Message : 'HTTP request failed!');
        }
      }
    )
  }
  public Cancel(): void {
    // clear form elements
    this.InputForm.controls['InstitutionFC'].setValue('');
    this.InputForm.controls['CourseName'].setValue('');
    this.InputForm.controls['CourseNumber'].setValue('');
    this.InputForm.controls['CreditHours'].setValue('');
    this.InputForm.controls['Grade'].setValue('');
    this.InputForm.controls['StartDate'].setValue('');
    this.InputForm.controls['EndDate'].setValue('');
    this.InputForm.controls['GeneralCredits'].setValue('');
    this.InputForm.controls['EthicsCredits'].setValue('');
    this.InputForm.controls['SupervisionCredits'].setValue('');
    // close form
    this.ClearEvent.emit(true);
  }
  public CloseForm(): void {
    this.ClearEvent.emit(true);
  }
}
