import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { AlertService, ApplicationService, ModelToolsService, OtherCredentialsService } from '../_services';
import { AppData, ComponentData, Country, ListObject, OtherCredential, State, StateSet} from '../_models';
import { IConfirm, ICountry, IListObject, IOtherCredential, IResponseObject, IState } from '../_interfaces';
import { IStateSet } from '../_interfaces/i-state-set';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { isParameter } from 'typescript';


@Component({
  selector: 'other-credentials',
  templateUrl: './other-credentials.component.html',
  styleUrls: ['./other-credentials.component.css']
})
export class OtherCredentialsComponent implements OnInit, OnDestroy {

  @Input() public InstComponentData : ComponentData;
  @Input() public InstAppData : AppData;
  @Output() public SectionEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() public PageEmitter: EventEmitter<string> = new EventEmitter<string>();


  public Credentials: Observable<IOtherCredential[]> = this.CredentialServ.OtherCredential$;
  public DisplayedColumns: string[] = ['Type','Title','Country','State','Number','Year','Actions'];

  private _SelectedCredential: OtherCredential = new OtherCredential();
  public IsVisibleEdit: boolean = false;
  public IsVisibleNew: boolean = false;
  public IsSubmitted: boolean = false;
  public IsLoading: boolean = false;
  public IsValid: boolean = false;

  public BypassForm: FormGroup;
  public CredentialForm: FormGroup;
  public StateSet = this.CredentialToolsServ.AllState$;

  public OtherCredentialTypes: IListObject[] = this.CredentialToolsServ.OtherCredType$;
  public Countries: ICountry[] = this.CredentialToolsServ.Countrie$;
  private subs: Subscription[] = [];
  public constructor(
    private alertService: AlertService,
    private appService: ApplicationService,
    private CredentialAlertServ: AlertService,
    private formBuilder: FormBuilder,
    private CredentialServ: OtherCredentialsService,
    private CredentialToolsServ: ModelToolsService
  ) {
    this.BypassForm = this.formBuilder.group({BypassCheck: ['']});
    this.ResetForm();
  }
  public ResetForm() {
    this.CredentialForm = this.formBuilder.group({
      CredentialId: this.formBuilder.control(null),
      Type: this.formBuilder.control(null, [Validators.required]),
      Title: this.formBuilder.control(null),
      Country: this.formBuilder.control(this.CredentialToolsServ.DefaultCountry, [Validators.required]),
      State: new FormControl(null, [Validators.required]),
      Number: this.formBuilder.control(null, [Validators.required]),
      Year: this.formBuilder.control(null, [Validators.required, Validators.minLength(4), Validators.maxLength(4)])
    });
  }
  public TestFunction() {
    this.DisableValidators();
    this.updateValueAndValidity();
    this.EnableValidators();
    // this.ResetForm();
    // this.CredentialForm.updateValueAndValidity();
  }
  public OnClickDelete(SelectedCredential: IOtherCredential) {
    this.CredentialServ.Delete(SelectedCredential.Id)
    .pipe()
    .subscribe(
      (CredentialNext : IConfirm) => {
        if (CredentialNext.Response) {
          this.alertService.success(CredentialNext.Message);
        }
        else {
          this.alertService.error(CredentialNext.Message);
        }
      },
      CredentialError => {
        this.alertService.error(CredentialError);
      },
      () => { // OnComplete
        this.CredentialServ.Read();
        this.CredentialServ.Check();
      }
    )
  }

  public ngOnInit() {


    this.CredentialServ.Read();
    this.CredentialServ.ReadBypass();
    this.SetBypassForm();
    this.subs.push(
      this.CredentialForm.get("Country").valueChanges.subscribe((Valu) => {
        if(Valu){
           if(Valu["Abbrev"] != "US" ){
            console.log("Vakl", Valu)
            this.CredentialForm.get("State").setValue(null)
            this.CredentialForm.get("State").setValidators(null);
          }
          else {

          }
        }

       this.CredentialForm.get("State").updateValueAndValidity({emitEvent: true, onlySelf: true})
      }))

  }

  public SetBypassForm() : void {
    this.subs.push(this.CredentialServ.Bypass$
      .pipe(
        tap((BypassTap: IListObject) => {
          this.BypassForm.controls['BypassCheck'].setValue((BypassTap.Value == "Yes")? true: false)
        })
      ).subscribe());
  }

  public OnClickNoOtherCredentialBox(CheckboxEvent: MatCheckboxChange) : void {

    this.subs.push(
      this.CredentialServ.SetBypass(CheckboxEvent.checked ? <IListObject>{Id: "100000000", Value: "Yes"} : <IListObject>{Id: "100000001", Value: "No"})
      .pipe()
      .subscribe(
        (BypassNext: IConfirm) => {
          if (BypassNext && BypassNext.Response == 'T') {
            console.log(BypassNext);
            this.CredentialAlertServ.success('Other Credential Information Saved', false);
          }
        },
        BypassError => {
          this.CredentialAlertServ.error(BypassError, false);
        },
        () => { // OnComplete
          console.warn("Oncomp firing")
          this.CredentialServ.ReadBypass();
          this.CredentialServ.Check();
        }
      )
    )
  }

  public OnClickNew() : void {
    this.IsVisibleEdit = true;
    this.IsVisibleNew = true;
    this.ResetForm();

    // this.CredentialForm.reset();
    // this.CredentialForm.get('Country').setValue(this.CredentialToolsServ.DefaultCountry);
    // this.EnableValidators();

    // console.log(this.CredentialForm);

    // this.updateValueAndValidity();
  }

  public OnClickEdit(SelectedCredential : IOtherCredential) : void {

    this._SelectedCredential = new OtherCredential(SelectedCredential);
    this.IsVisibleEdit = true;
    this.IsVisibleNew = false;
    this.ResetForm();
    this.SetFormValues();
    // this.EnableValidators();
  }



  public OnClickCancel() : void {
    this.IsVisibleEdit = false;
    this.IsVisibleNew = false;
    this.CredentialForm.reset();
    // this.ResetForm();
    this.DisableValidators();
    this._SelectedCredential.Erase();
  }

  private EnableValidators() : void {
    this.CredentialForm.controls['Type'].setValidators([Validators.required]);
    // this.CredentialForm.controls['Title'].setValidators([Validators.required]);
    this.CredentialForm.controls['Country'].setValidators([Validators.required]);

    if (this.CredentialForm.controls['Country'].value && this.CredentialForm.controls['Country'].value.DialCode == '1') {
      this.CredentialForm.controls['State'].setValidators([Validators.required]);
    } else {
      this.CredentialForm.controls['State'].setValidators(null);
    }
    this.CredentialForm.controls['Number'].setValidators([Validators.required]);
    this.CredentialForm.controls['Year'].setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(4)])
  }

  private DisableValidators() : void {
    this.CredentialForm.controls['Type'].clearValidators();
    this.CredentialForm.controls['Title'].clearValidators();
    this.CredentialForm.controls['Country'].clearValidators();
    this.CredentialForm.controls['State'].clearValidators();
    this.CredentialForm.controls['Number'].clearValidators();
    this.CredentialForm.controls['Year'].clearValidators();
  }
  private updateValueAndValidity() {
    this.CredentialForm.controls['Title'].updateValueAndValidity();
    this.CredentialForm.controls['Country'].updateValueAndValidity();
    this.CredentialForm.controls['State'].updateValueAndValidity();
    this.CredentialForm.controls['Number'].updateValueAndValidity();
    this.CredentialForm.controls['Year'].updateValueAndValidity();
    this.CredentialForm.controls['Type'].updateValueAndValidity();
    // this.CredentialForm.controls['Title'].
  }

  private SetFormValues() : void {
    this.CredentialForm.get('CredentialId').setValue(this._SelectedCredential.Id);
    this.CredentialForm.get('Type').setValue(this._SelectedCredential.Type);
    this.CredentialForm.get('Title').setValue(this._SelectedCredential.Title);
    if (this._SelectedCredential.Country && this._SelectedCredential.Country.Id){
      this.CredentialForm.get('Country').setValue(this._SelectedCredential.Country);
    }
    else {
      this.CredentialForm.get('Country').setValue(this.CredentialToolsServ.DefaultCountry);
    }
    // if (this._SelectedCredential.Country.DialCode == '1') {

    // }
    this.CredentialForm.get('Number').setValue(this._SelectedCredential.Number);
    this.CredentialForm.get('Year').setValue(this._SelectedCredential.Year);
    this.CredentialForm.get('State').setValue(this._SelectedCredential.State);
  }

  public CompareCountry(Param1: ICountry, Param2 : ICountry) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }
  public CompareState(Param1: IState, Param2 : IState) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }

  public CompareListObj(Param1: IListObject, Param2: IListObject) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }

  public TranslateForm(CurrentForm : FormGroup) : IOtherCredential {
    return {'Id' : CurrentForm.get('CredentialId').value,
            'Type' : new ListObject(<IListObject>CurrentForm.get('Type').value),
            'Title' : CurrentForm.get('Title').value ?  CurrentForm.get('Title').value : '',
            'Country' : new Country(<ICountry>CurrentForm.get('Country').value),
            'State' : CurrentForm.get('State').value ? new State(<IState>CurrentForm.get('State').value) : new State(),
            'Number' : CurrentForm.get('Number').value,
            'Year' : CurrentForm.get('Year').value
    }
  }

  public OnSubmit() {

    this.EnableValidators();
    this.updateValueAndValidity();
    // stop here if form is invalid
    if (this.CredentialForm.invalid) {
      this.CredentialAlertServ.error('Please ensure that all required values are submitted.');
      console.warn('Form', this.CredentialForm)
      return;
    }
    this.IsSubmitted = true;
    this.CredentialServ.Upsert(this.TranslateForm(this.CredentialForm)).subscribe(
      (CredentialNext : IConfirm) => {
        if (CredentialNext.Response == 'T') {
          this.CredentialAlertServ.success(CredentialNext.Message, true);

          this.OnClickCancel();
          this.CredentialAlertServ.success('Other Credential Saved');
          console.warn('Form', this.CredentialForm)
        }
        else {
          this.CredentialAlertServ.error(CredentialNext.Message)
        }
      },
      error => {},
      () => {
        this.OnClickCancel();
        this.DisableValidators();
        this.CredentialServ.Read();
      }
    )
  }


  ngOnDestroy(): void {
    this.subs.forEach((subscription: Subscription) => subscription.closed ? null: subscription.unsubscribe() )
  }
}

// const isObj: ValidatorFn = ( fc: FormControl) => {
//   if(fc.value == null || fc.value == ""){
//     return null;
//   }
//   if(typeof(fc.value) !== "object") {
//     return {"valNotObj": true}
//   }
// }
