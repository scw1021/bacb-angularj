import { Component, Input,  OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { AppData, Experience, ExperienceType, ComponentData, ListObject } from '../_models';
import { AlertService, ExperienceService, ModelToolsService, ApplicationService } from '../_services/';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfirm, IExperience, IExperienceType, IListObject } from '../_interfaces';
import { IExperienceSupervision } from '../_interfaces/i-experience-supervision';
import { MatTableDataSource } from '@angular/material/table';
import { INetsuiteFile } from '../_interfaces/i-netsuite-file';
import { RepresentationTypeValidator, SupervisedHourTotalValidator, ExperienceDateRangeValidator, ExperienceDateCourseDateValidator } from '../_validators';

@Component({
  selector: 'experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})
export class ExperienceComponent implements OnInit, OnDestroy {

  @Input() public InstComponentData : ComponentData;
  @Input() public InstAppData : AppData;

  public ExperienceDataArray$: Observable<IExperience[]>;
  public ExperienceDataArraySubscription: Subscription;
  public IsSubmitted: boolean = false;
  public IsLoading: boolean = false;
  public InstFile: INetsuiteFile;
  private _progress: number = 0;
  private submittedDocumentId: string;

  // Member Variables for Add Form
  public IsVisibleNew: boolean = false;
  // public SupervisorCount: number = 0;
  public FirstCourseworkStartDate: Date | null = null;

  // Member Variables for Edit Form
  public _SelectedExperience: Experience = new Experience();
  public _SubmittedExperience: Experience = new Experience();
  public SupervisionArray: BehaviorSubject<IExperienceSupervision[]> = new BehaviorSubject<IExperienceSupervision[]>([]);
  public ExpForm : FormGroup;
  public IsVisibleEdit: boolean = false;
  public SubmittedExpId: Subject<string> = new Subject<string>();
  public ExperienceArray$: Observable<IExperience[]> = this.ExpServ.Experience$;
  public ExpDataSource: MatTableDataSource<IExperience> = new MatTableDataSource<IExperience>([]);
  // public SupervisedHourTotal: number = 0;
  // public IndependentHourTotal: number = 0;
  // public TotalHourTotal: number = 0;
  // public CalculatedHourTotal: number = 0;

  public RepresentationTypes: IListObject[] = this.ExpModelToolsServ.RepresentationType$;
  public ExperienceTypes: IExperienceType[] = this.ExpModelToolsServ.ExperienceType$;
  //TODO: Add this to validator for start date
  public FirstCourseStartDate = this.appService.SelectedApplication.FirstCourseStartDate;
  public SupervisionsListedInForm: IExperienceSupervision[] = [];
  SetSupervisionArrayFromForm($event) {
    console.log('Emitter', $event);
  }

  public constructor(
    private appService: ApplicationService,
    private ExpAlertServ : AlertService,
    private ExpFormBuilder : FormBuilder,
    private ExpServ : ExperienceService,
    private ExpModelToolsServ : ModelToolsService
  ) {

    this.ResetForm();
    this.ExpServ.Read();
  };
  private ResetForm(): void {
    this.ExpForm = this.ExpFormBuilder.group({
      FirstCourseStartDate: this.ExpFormBuilder.control(null),
      Id: this.ExpFormBuilder.control(null),
      RepresentationType: this.ExpFormBuilder.control('', [Validators.required]),
      Type: this.ExpFormBuilder.control(''),
      PracticumName: this.ExpFormBuilder.control(null),
      PracticumId: this.ExpFormBuilder.control(null),
      StartDate: this.ExpFormBuilder.control(null, [Validators.required]),
      EndDate: this.ExpFormBuilder.control(null, [Validators.required]),
      SupervisedHours: this.ExpFormBuilder.control(0, [Validators.required]),
      IndependentHours: this.ExpFormBuilder.control(0, [Validators.required]),
      TotalHours: this.ExpFormBuilder.control(0),
      CalculatedHours: this.ExpFormBuilder.control(0),
      // EvfFile: ['']    //TODO: use RequiredFileType to limit file types
    });
    this.SupervisionArray.next([]);
  }
  public get CertType(): string {
    return this.appService.CertTypeId;
  }
  public get AppType(): string {
    return this.appService.AppTypeId;
  }

  public ngOnInit() : void {
    this.ExperienceDataArray$ = this.ExperienceArray$.pipe(
      tap((ExpTap: IExperience[]) => {
        this.ExpDataSource.data = ExpTap;
      })
    );
    this.ExperienceDataArraySubscription = this.ExperienceDataArray$.subscribe();
    console.log('FORMY', this.ExpForm)
  }

  public ngOnDestroy() : void {
    this.ExperienceDataArraySubscription.unsubscribe();
  }

  // Accessors
  public get DisplayedColumns() : string [] {
    return ['Type','Supervisors','StartDate','EndDate','SupervisedHours','IndependentHours','TotalHours','CalculatedHours','Actions'];
  }

  public get RepresentationType() : IListObject {
    return this.ExpForm.controls['RepresentationType'].value ? this.ExpForm.controls['RepresentationType'].value : new ListObject().Export();
  }

  public get FormTotalHours() : number {
    const IndependantHourTotal = (this.ExpForm.controls['IndependentHours'].value * 1) > 0 ? (this.ExpForm.controls['IndependentHours'].value * 1) : 0;
    const SupervisedHourTotal = (this.ExpForm.controls['SupervisedHours'].value * 1) > 0 ? (this.ExpForm.controls['SupervisedHours'].value * 1) : 0;
    return (IndependantHourTotal + SupervisedHourTotal);
  }

  public get FormCalculatedHours() : number {
    return (this.ExpForm.controls['Type'].value.HourModifier * 1) * this.FormTotalHours;
  }

  public get StartDateError() : string {
    return (ExperienceDateCourseDateValidator(this.ExpForm.controls['StartDate'], this.FirstCourseworkStartDate) != null) ? "Start date for experience entries must be after the start date of your first coursework." : "Start Date is required.";
  }

  public get EndDateError() : string {
    return (ExperienceDateRangeValidator(this.ExpForm.controls['StartDate'], this.ExpForm.controls['EndDate']) != null) ? "End date must be after start date and no more than 5 years after start date." : "End Date is required.";
  }


  public get SupervisedHoursError() : string {
    return (SupervisedHourTotalValidator(this.ExpForm.controls['Type'], this.ExpForm.controls['TotalHours']) != null) ? "Too few supervision hours." : "Supervised Hours are required.";
  }

  public get ExpStartDate() : string {
    return this.ExpForm.controls['StartDate'].value ? this.ExpForm.controls['StartDate'].value : "";
  }

  public get UploadProgress() : number {
    return this._progress;
  }

  touchEverythingCauseDaveWantsThingsToWorkACertainWay(): void {
    this.ExpForm.markAllAsTouched();
  }

  public OnClickNew() : void {
    this.IsVisibleEdit = false;
    this.IsVisibleNew = true;
    this.ResetForm();
    // this.EnableValidators();
  }
  public OnClickEdit(SelectedIExperience: IExperience) : void {
    this._SelectedExperience = new Experience(SelectedIExperience);
    this.IsVisibleEdit = true;
    this.IsVisibleNew = false;
    this.ResetForm();
    this.SetFormValues();
    // this.EnableValidators();
  }

  public OnClickDelete(SelectedIExperience: IExperience) : void {
    this.ExpServ.Delete(SelectedIExperience)
      .pipe(first())
      .subscribe(
        (ExpNext : IConfirm) => {
          if (ExpNext.Response) {
            this.ExpAlertServ.success(ExpNext.Message, true);
          }
        },
        ExpError => {
          this.ExpAlertServ.error(ExpError);
        },
        () => {  // OnComplete
          this.ExpServ.Read();
          this.ExpServ.Check();
        }
      )
  }

  public OnClickCancel() : void {
    this.IsVisibleEdit = false;
    this.IsVisibleNew = false;
    this.ExpForm.reset();
    this.DisableValidators();
    this._SelectedExperience.Erase();
    this.SupervisionArray.next([]);
  }

  public SetUploadProgress(response: IConfirm) : void {
    const progress = response.UrlResponse['progress'];
    this._progress = parseInt(progress, 10);
  }

  public File_Event(event: INetsuiteFile): void {
    this._progress = 0;
    this.InstFile = event;
  }

  // Form Methods
  public OnSelectType(SelectedType: IExperienceType) : void {
    if (parseInt(SelectedType.Id,10) > 1) {
      this.ExpForm.controls['PracticumName'].setValidators([Validators.required]);
      this.ExpForm.controls['PracticumId'].setValidators([Validators.required]);
    }
    else {
      this.ExpForm.controls['PracticumName'].clearValidators();
      this.ExpForm.controls['PracticumName'].updateValueAndValidity();
      this.ExpForm.controls['PracticumId'].clearValidators();
      this.ExpForm.controls['PracticumId'].updateValueAndValidity();
    }
    this.CalculateHours();
  }

  public CalculateHours() : void {
    this.ExpForm.controls['TotalHours'].setValue(this.FormTotalHours);
    this.ExpForm.controls['CalculatedHours'].setValue(this.FormCalculatedHours);
  }

  private EnableValidators() : void {
    console.log('Experience Validators: On');
    this.ExpForm.controls['RepresentationType'].setValidators([Validators.required]);
    this.ExpForm.controls['Type'].setValidators([Validators.required]);
    this.ExpForm.controls['StartDate'].setValidators([Validators.required, ExperienceDateCourseDateValidator(this.ExpForm.controls['startDate'], this.FirstCourseworkStartDate)]);
    this.ExpForm.controls['EndDate'].setValidators([Validators.required, ExperienceDateRangeValidator(this.ExpForm.controls['StartDate'], this.ExpForm.controls['EndDate'])]);
    this.ExpForm.controls['SupervisedHours'].setValidators([Validators.required, SupervisedHourTotalValidator(this.ExpForm.controls['Type'], this.ExpForm.controls['TotalHours'])]);
    this.ExpForm.controls['IndependentHours'].setValidators([Validators.required]);
    this.ExpForm.controls['TotalHours'].setValidators([Validators.required, Validators.min(20)]);
    this.ExpForm.controls['CalculatedHours'].setValidators([]);
    // this.ExpForm.controls['EvfFile'].setValidators([Validators.required]);
  }

  private DisableValidators() : void {
    console.log('Experience Validators: Off');
    this.ExpForm.controls['RepresentationType'].clearValidators();
    this.ExpForm.controls['Type'].clearValidators();
    this.ExpForm.controls['StartDate'].clearValidators();
    this.ExpForm.controls['EndDate'].clearValidators();
    this.ExpForm.controls['SupervisedHours'].clearValidators();
    this.ExpForm.controls['IndependentHours'].clearValidators();
    this.ExpForm.controls['TotalHours'].clearValidators();
    this.ExpForm.controls['CalculatedHours'].clearValidators();
    //this.ExpForm.controls['EvfFile'].clearValidators();
    //this.ExpForm.controls['EvfFile'].updateValueAndValidity();
  }
  private UpdateValueAndValidity(): void {
    this.ExpForm.controls['RepresentationType'].updateValueAndValidity();
    this.ExpForm.controls['Type'].updateValueAndValidity();
    this.ExpForm.controls['StartDate'].updateValueAndValidity();
    this.ExpForm.controls['EndDate'].updateValueAndValidity();
    this.ExpForm.controls['SupervisedHours'].updateValueAndValidity();
    this.ExpForm.controls['IndependentHours'].updateValueAndValidity();
    this.ExpForm.controls['TotalHours'].updateValueAndValidity();
    this.ExpForm.controls['CalculatedHours'].updateValueAndValidity();
  }

  private SetFormValues() : void {
    this.ExpForm.controls['FirstCourseStartDate'].setValue(this.FirstCourseStartDate);
    this.ExpForm.controls['Id'].setValue(this._SelectedExperience.Id);
    this.ExpForm.controls['RepresentationType'].setValue(this._SelectedExperience.RepresentationType);
    this.ExpForm.controls['Type'].setValue(this._SelectedExperience.Type);
    this.ExpForm.controls['StartDate'].setValue(this._SelectedExperience.StartDate);
    this.ExpForm.controls['EndDate'].setValue(this._SelectedExperience.EndDate);
    this.ExpForm.controls['SupervisedHours'].setValue(this._SelectedExperience.SupervisedHours);
    this.ExpForm.controls['IndependentHours'].setValue(this._SelectedExperience.IndependentHours);
    this.ExpForm.controls['TotalHours'].setValue(this._SelectedExperience.TotalHours);
    this.ExpForm.controls['CalculatedHours'].setValue(this._SelectedExperience.CalculatedHours);
    let NewArray = [];
    for (const stIndex in this._SelectedExperience.Supervisions) {
      NewArray.push(this._SelectedExperience.Supervisions[stIndex].Export());
    }
    this.SupervisionArray.next(NewArray);
  }


  public CompareListObj(Param1: IListObject, Param2: IListObject) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }

  public CompareExpType(Param1: IExperienceType, Param2: IExperienceType) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }

  public TranslateForm(CurrentForm : FormGroup) : IExperience {
    const StartDate = new Date(CurrentForm.controls['StartDate'].value);
    const EndDate = new Date(CurrentForm.controls['EndDate'].value);
    return {'Id' : CurrentForm.controls['Id'].value,
            'RepresentationType': new ListObject(CurrentForm.controls['RepresentationType'].value).Export(),
            'Type' : new ExperienceType(<IExperienceType>CurrentForm.controls['Type'].value).Export(),
            'PracticumName': CurrentForm.controls['PracticumName'].value,
            'PracticumId': CurrentForm.controls['PracticumId'].value,
            'StartDate' : '' + (1 + StartDate.getMonth()) + '/' + StartDate.getDate() + '/' + StartDate.getFullYear(),
            'EndDate' : '' + (1 + EndDate.getMonth()) + '/' + EndDate.getDate() + '/' + EndDate.getFullYear(),
            'Supervisions' : this.SupervisionArray.value,
            'SupervisedHours' : parseInt(CurrentForm.controls['SupervisedHours'].value,10),
            'IndependentHours' : parseInt(CurrentForm.controls['IndependentHours'].value,10),
            'TotalHours' : parseInt(CurrentForm.controls['TotalHours'].value,10),
            'CalculatedHours' : parseInt(CurrentForm.controls['CalculatedHours'].value,10)
    }
  }

  public OnSubmit() : void {
    this.EnableValidators();
    this.UpdateValueAndValidity();
    // So edge case... somebody deletes everyone or doesn't specify a remaining lead supervisor
    let hasSupervisorSelected = false;
    this.SupervisionArray.value.forEach( supervision => {
      if ( supervision.IsPrimary == 'T' && !supervision.MarkedForDeletion ) {
        hasSupervisorSelected = true;
      }
    });
    if ( !hasSupervisorSelected ) {
      console.error('supervision Responsible Supervisor not selected', this.SupervisionArray.value);
      this.ExpAlertServ.error("You must have a Responsible Supervisor selected to continue")
      return;
    }
    console.log('FORM', this.ExpForm)
    this.touchEverythingCauseDaveWantsThingsToWorkACertainWay();
    this.IsSubmitted = true;
    const StartDate = new Date(this.ExpForm.controls['StartDate'].value);
    const EndDate = new Date(this.ExpForm.controls['EndDate'].value);
    this.ExpForm.controls['RepresentationType'].setValidators([Validators.required]);
    // stop here if form is invalid

    if ( EndDate < StartDate ) {
      this.ExpAlertServ.error('End Date or Start Date incorrect');
      this.IsSubmitted = false;
      return;
    }
    else if ( EndDate > new Date() ) {
      this.ExpAlertServ.error('Experience must be completed before submission');
      this.IsSubmitted = false;
      return;
    }
    else if (this.ExpForm.invalid) {
      this.ExpAlertServ.error('Please ensure that all required fields have been filled in');
      this.IsSubmitted = false;
      return;
    }
    console.log('OnSubmit called and form is valid.');
    this.submitFile();
  }

  private submitFile(): void {
    this.submitExperience();
    // Rob here. We never got a good answer for file mgmt stuff from ANYONE so I refuse to garbage this up.
    // fileMgmt.write should have the appropriate logic to load to a specific location, but I'm not dummying it up
    // because I DO NOT HAVE the time or patience to do it right now.
    //
    // Thanks for coming to my TED talk.


    // if (this.InstFile && this.InstFile.Name != "") {
    //   this.fileService
    //   .Write(this.InstFile, this.InstAppData.AppId$.value, 'FEFV', '3')
    //   .subscribe(
    //     (_result: IConfirm) => {
    //       if (_result.Response == "T") {
    //         this.ExpAlertServ.success(
    //           `${this.InstFile.Name} submitted successfully!`
    //         );
    //         // Risky, but this is how it comes back if we get a 'T' response.
    //         this.submittedDocumentId = _result.UrlResponse['data'].DocumentRecordId;
    //         console.log(this.submittedDocumentId);
    //         this._progress = -1; // tells the component to show 'complete'
    //         // Start the process of actually adding the experience to netsuite
    //         this.submitExperience()
    //       }
    //       else if ( _result.Response == 'I' ) {
    //         this.ExpAlertServ.clear();
    //          // there's a handful of conditions of HttpResponse that we don't really need
    //          // so just tag 'progress' messages
    //         if ( _result.Message == 'progress' ) {
    //           this.SetUploadProgress(_result)
    //         }
    //         else {
    //           // for all other messages we are loading
    //           this.ExpAlertServ.loading();
    //         }
    //       }
    //       else if ( _result.Response == 'X' ){
    //                  }
    //       else {
    //         this._progress = 0;
    //         this.ExpAlertServ.error(
    //           `${this.InstFile.Name} failed to submit!`
    //         )
    //       }
    //     });
    // }
    // else {
    //   this.ExpAlertServ.error('No File was specified, but is required');
    // }
  }
  /**
   * This is called after the positive response from File->Document addition
   */
  private submitExperience(): void {
    console.log(`Submitting Experience Called ${this.submittedDocumentId}`);
    this.ExpAlertServ.loading();
    this._SubmittedExperience = new Experience(this.TranslateForm(this.ExpForm));
    if (!this.SupervisionArray.value || !this.SupervisionArray.value.length) {
      this.ExpAlertServ.error('You must provide at least one supervisor before submitting an experience record.')
    }
    this.ExpServ.Update(this._SubmittedExperience.Export())
    .pipe()
    .subscribe(
      (ExperienceNext: IConfirm) => {
        if (ExperienceNext.Response && ExperienceNext.Response === 'T') {
          this.ExpAlertServ.success(ExperienceNext.Message, false);
        }
      },
      ExperienceError => {
        this.ExpAlertServ.error(ExperienceError, false)
      },
      () => { // OnComplete
        this.SubmittedExpId.next(this._SubmittedExperience.Id);
        this._SelectedExperience.Erase();
        this.OnClickCancel();
        this.ExpServ.Read();
        this.DisableValidators();
        this.IsVisibleEdit = false;
        this.ExpServ.Check();
      }
    )
  }

  public CheckEndDate() : void {
    // This just checks that the end date is beyond start date and before today's date
    // Throw alert if there is an issue
    const StartDate = new Date(this.ExpForm.controls['StartDate'].value);
    const EndDate = new Date(this.ExpForm.controls['EndDate'].value);
    console.log(StartDate);
    console.log(EndDate);
    if ( EndDate < new Date() && EndDate > StartDate ) {
      // great?
    }
    else {
      // clear and alert
      this.ExpForm.controls['EndDate'].setValue('');
      this.ExpAlertServ.error('End date must be after Start and before Today');
    }
  }

  public OnSubmitWrong() : void {
    // Why do we even have this??
    console.log("Wrong way to submit.");
  }
}
