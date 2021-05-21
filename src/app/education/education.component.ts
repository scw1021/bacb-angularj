import { AlertService, ApplicationService, EducationService, ModelToolsService } from '../_services';
import { AppData, ComponentData, Degree } from '../_models';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICertType, IConfirm, IConfirmDefault, ICountry, IDegree, IDocumentType, IInstitution, IListObject, IRequiredType, IState, IStateSet } from '../_interfaces';
import { filter, map, shareReplay, startWith, take, tap, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit, OnDestroy {

  @Input() public ComponentIndex: string;

  // These SHOULD NOT BE USED, FIXME - remove as soon as summaries no longer include this GARBAGE
  // @Input() public InstComponentData : ComponentData;
  // @Input() public InstAppData : AppData;



  @Output() public SectionEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() public PageEmitter: EventEmitter<string> = new EventEmitter<string>();

  public CertType: string = '';
  public IsLoading: boolean = false;
  public StateList$ = this.EducationModelServ.AllState$;
  public SelectedState: IState;
  public SelectedCountry: ICountry;
  public CountryList$ = this.EducationModelServ.Countrie$;
  public EducationForm: FormGroup;
  public InstitutionForm: FormGroup;
  public EducationRequirementString: string = '';
  public HighSchoolDiplomaDocumentType: IRequiredType = {
    Type: {
      Id: '682e9f65-0755-eb11-a812-002248091dbb',
      Code: 'HSDT',
      Description: 'High School Diploma/Transcript'
    },
    RequirementMet: 'F'
  }
  public FileCheck: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>(IConfirmDefault);
  public FileCheck$: Observable<IConfirm> = this.FileCheck.asObservable().pipe(shareReplay(1));
  public FileEvent(event: IConfirm): void {
    this.FileCheck.next(event);
  }
  public DisplayedTableColumns = ['Level','Major','DateConferred','Institution','Actions'];
  // As we add more forms, we have been asked to populate the instructions element with app-specific material
  private educationRequirementStrings = [
    "BCBA applications require a Master's degree", "BCaBA applications require a Bachelor's degree", "RBT applications require a GED or national equivalent"
  ]

  public DegreeArr$: Observable<IDegree[]> = new Observable<IDegree[]>();
  public DegreeTypesLOArr$: IListObject[] = this.EducationModelServ.DegreeType$;
  public InstitutionsArr$: Observable<IInstitution[]> = this.EducationModelServ.Institution$;
  public Countries: ICountry[] = this.EducationModelServ.Countrie$;
  /**@description autoInst is the list of institutions filtered for autocomplete */
  public autoInst: Observable<IInstitution[]>;
  private formControlStringNames: string[] = ['Id','Type','Major','DateConferred','InstitutionFC','AddInstitution']
  /**@description This tuple represents ["Edit or add", ShowAddEditPanel(bool)]  The first prop is simply whats displayed in the legend */
  public _actionAndVisible: BehaviorSubject<[string, boolean]> = new BehaviorSubject<[string, boolean]>(['Initial', false]);
  public actionAndVisible: Observable<[string, boolean]> = this._actionAndVisible.asObservable();

  public constructor(
    private AppService: ApplicationService,
    private EducationAlertServ: AlertService,
    private EducationFormBuilder: FormBuilder,
    private EducationModelServ: ModelToolsService,
    private EducationServ: EducationService
  ) {
    this.EducationForm = this.EducationFormBuilder.group({
      Id: [''],
      Type: [''],
      Major: [''],
      DateConferred: [''],
      InstitutionFC: [''],
      AddInstitution: [null]
    });
    this.InstitutionForm = this.EducationFormBuilder.group({
      Name: [''],
      Website: [''],
      Address1: [''],
      Address2: [''],
      City: [''],
      State: [''],
      Country: [''],
      PostalCode: ['']
    });
    this.EducationForm.controls['AddInstitution'].setValue(false)
  }

  public ngOnInit() {
    // Institution AutoComplete. Takes latest from the Instvalchanges & the whole institution array
    this.autoInst = this.EducationForm.controls['InstitutionFC'].valueChanges
    .pipe(
      filter((valchange) => (typeof(valchange) === "string")),
      withLatestFrom(this.InstitutionsArr$),
      map<[string, IInstitution[]], IInstitution[]>(([valChangeStr, instsArr]) => {
        // return only the institutions that include the string that the user typed into the formcontrol for institutions.
        return instsArr.filter((institution) => {
          return institution
          .Name
          .toLowerCase()
          .includes(valChangeStr.toLowerCase())
        });
      }),
    )
    this.EducationRequirementString = this.educationRequirementStrings[parseInt(this.AppService.CertTypeId, 10) - 1];
    this.CertType = this.AppService.CertTypeId;
    // So pretty sure it makes the MOST sense to just create the run-time checks in the parent component

    // this.InstAppData.CertType$.pipe(
    //   tap((CertTypeTap: ICertType) => {
    //     if (this.InstComponentData.Page !== this.InstComponentData.SummaryPage) {
    //       this.EducationServ.Check(CertTypeTap.Id);
    //       this.InstAppData.Check[this.InstComponentData.Page] = this.EducationServ._CheckSubject.asObservable();
    //     }
    //     // let's add a DOM element because we were asked politely
    //     // but in a lazy way, so it throws an error when we add more features.
    //     // The strings are currently guesses, and will need correction

    //   })
    // ).subscribe();
    this.DegreeArr$ = this.EducationServ.Degree$
    // this.EducationServ.Read();
  }

  public ngOnDestroy(){}

  /**@description When the user clicks cancel, clear form and hide panel */
  public OnClickCancel(){
    this._actionAndVisible.next(["", false]);
    this.clearForm();
  }
  public OnClickEdit(degreeToEdit: IDegree): void {
    this._actionAndVisible.next(["Edit Degree", true]);
    this.clearForm();
    this.EnableValidators();
    this.loadForm(degreeToEdit);

  }

  public loadForm(degreeToLoad: IDegree){
    console.log("degType", degreeToLoad.Type)
    this.EducationForm.get("Id").setValue(degreeToLoad.Id);
    this.EducationForm.get("Type").setValue(degreeToLoad.Type);
    this.EducationForm.get("Major").setValue(degreeToLoad.Major);
    this.EducationForm.get("DateConferred").setValue(degreeToLoad.DateConferred);
    this.EducationForm.get("InstitutionFC").setValue(degreeToLoad.Institution);
    this.EnableValidators();
  }
  public OnClickNew(): void {
    this.clearForm();
    this._actionAndVisible.next(["Enter New Degree", true]);
  }
  public clearForm(){
    this.formControlStringNames.forEach((formCtrStr) => this.EducationForm.get(formCtrStr).setValue(''));
  }
  public CompareListObj(Param1: IListObject, Param2: IListObject) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }
  public OnClickDelete(SelectedDegree: Degree) : void {
    this.EducationServ.Delete(SelectedDegree.Id)
      .pipe()
      .subscribe(
        (DegreeNext : IConfirm) => {
          if (DegreeNext.Response === 'T') {
            this.EducationAlertServ.success(DegreeNext.Message, false);
          }
          else {
            this.EducationAlertServ.error("Degree save failed.", false);
          }
        },
        DegreeError => {
          this.EducationAlertServ.error("Degree save failed.");
        },
        () => {  // OnComplete
          this.EducationServ.Read();
          this.EducationServ.Check(this.AppService.CertTypeId);
        }
      )
      this.EducationForm.reset();
  }
  /** @description Template function to pluck name of institution*/
  public displayInstitution(institution: IInstitution){
    return institution && institution.Name ? institution.Name : '';
  }

  public get DefaultCountry() : ICountry {
    return this.EducationModelServ.DefaultCountry;
  }

  public CompareCountry(Param1: ICountry, Param2 : ICountry) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }

  private EnableValidators() : void {
    this.EducationForm.controls['Type'].setValidators([Validators.required]);
    this.EducationForm.controls['Major'].setValidators([Validators.required]);
    this.EducationForm.controls['DateConferred'].setValidators([Validators.required]);
    this.EducationForm.controls['InstitutionFC'].setValidators([Validators.required]);
  }

  private DisableValidators() : void {
    this.EducationForm.controls['Type'].clearValidators();
    this.EducationForm.controls['Type'].updateValueAndValidity();
    this.EducationForm.controls['Major'].clearValidators();
    this.EducationForm.controls['Major'].updateValueAndValidity();
    this.EducationForm.controls['DateConferred'].clearValidators();
    this.EducationForm.controls['DateConferred'].updateValueAndValidity();
    this.EducationForm.controls['InstitutionFC'].clearValidators();
    this.EducationForm.controls['InstitutionFC'].updateValueAndValidity();
  }
  public devkilltestalert(){
    //this.EducationAlertServ.alert("test");
    this.EducationAlertServ.error("test");
  }

  public OnSubmit() : void {
    // stop here if form is invalid

    if (this.EducationForm.invalid) {
      this.EducationAlertServ.error('Form Invalid');
      return;
    }
    let DegreeFromForm: IDegree = new Degree().Export();
    console.log(DegreeFromForm);
    let formValues = this.EducationForm.value;
    console.log(formValues);
    DegreeFromForm.DateConferred = formValues["DateConferred"];
    DegreeFromForm.Id = formValues["Id"];
    DegreeFromForm.Institution = formValues["InstitutionFC"];
    DegreeFromForm.Major = formValues["Major"];
    DegreeFromForm.Type = formValues["Type"];
    console.log("edformVal", this.EducationForm.value);

    this.EducationServ.Upsert(DegreeFromForm)
    .pipe(
      take(1),
    )
    .subscribe((confirmation)=>{
      confirmation.Response == "T"? this.EducationAlertServ.success("Degree saved"): this.EducationAlertServ.error("Degree Save Failed, Please try later");
      this.EducationServ.Read();
      this.EducationServ.Check(this.AppService.CertTypeId);
      this._actionAndVisible.next(["", false]);
      this.EducationForm.reset();
    },
    (error) => this.EducationAlertServ.error("Submit failed, please try again later" + error))

  }
  public OnSelectCountry(country: ICountry) {
    this.SelectedCountry = country;
  }
  public OnSubmitInstitution() {
    let institution: IInstitution = {
      Id: '', Departments: null,
      Name: this.InstitutionForm.controls['Name'].value,
      Website: this.InstitutionForm.controls['Website'].value
    }
    this.EducationServ.CreateInstitution(institution).subscribe( response => {
      console.log('Degree Upsert Response', response);
      institution.Id = response.ReturnId;
      this.EducationForm.controls['AddInstitution'].setValue(false);
      this.EducationForm.controls['InstitutionFC'].setValue(institution);
    });
  }
}
