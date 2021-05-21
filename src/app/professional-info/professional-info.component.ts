import { AlertService, ModelToolsService, ProfessionalInfoService } from 'src/app/_services';
import { AppData, ComponentData, Confirm, ListObject } from 'src/app/_models';
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfirm, IListObject, IProfessionalData } from 'src/app/_interfaces';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, first, tap } from 'rxjs/operators';

@Component({
  selector: "professional-info",
  templateUrl: "./professional-info.component.html",
  styleUrls: ["./professional-info.component.css"]
})
export class ProfessionalInfoComponent implements OnInit, OnDestroy {
  @Input() public InstComponentData: ComponentData;
  @Input() public InstAppData: AppData;

  public NewData: IProfessionalData = null;
  public IsSubmitted: boolean = false;
  public IsLoading: boolean = false;
  public ProfessionalForm: FormGroup | null = null;

  private SubscriptionArray: Array<Subscription> = [];
  public constructor(
    protected ProfessionAlertServ: AlertService,
    protected ProfessionFormBuilder: FormBuilder,
    protected ProfessionServ: ProfessionalInfoService,
    protected ProfModelToolsServ: ModelToolsService
  ) {}

  public ngOnInit() {
    this.InitForm()
    this.ProfessionServ.Read();

    // This subscription tracks the valuechanges on 'PrimaryArea' and sets 'PrimaryAreaOther' to required when true.
    this.SubscriptionArray.push(
      this.ProfessionalForm.get('PrimaryArea').valueChanges.pipe(filter(( emission ) => (emission != null) )).subscribe((PrimaryAreaValChange: IListObject) => {
        if(PrimaryAreaValChange.Value == "Other"){
          console.log("Primary area.Value DOES == Other ")
          this.ProfessionalForm.get('PrimaryAreaOther').setValidators(Validators.required);
        }else{
          this.ProfessionalForm.get('PrimaryAreaOther').setValue('')
          this.ProfessionalForm.get('PrimaryAreaOther').clearValidators();
        }
        this.ProfessionalForm.get('PrimaryAreaOther').updateValueAndValidity({emitEvent: false, onlySelf: true});
      })
    );

    // Same as above for 'SecondaryArea'
    this.SubscriptionArray.push(
      this.ProfessionalForm.get('SecondaryArea').valueChanges.pipe(filter(( emission ) => (emission != null) )).subscribe((SecondaryAreaValChange: IListObject) => {
        if(SecondaryAreaValChange.Value == "Other"){
          console.log("Secondary area.Value DOES == Other ")

          this.ProfessionalForm.get('SecondaryAreaOther').setValidators(Validators.required);
        }else{
          this.ProfessionalForm.get('SecondaryAreaOther').setValue('')
          this.ProfessionalForm.get('SecondaryAreaOther').clearValidators();
        }
        this.ProfessionalForm.get('SecondaryAreaOther').updateValueAndValidity({emitEvent: false, onlySelf: true});
      })
    );


    this.SubscriptionArray.push(
      // This subscription sychronizes the form controls with the backend
      this.ProfessionalData.pipe(
        distinctUntilChanged()
      )
      .subscribe(
        (ProfDataNext : IProfessionalData) => {
          // console.log("PRofdataNext PIBcomp ln 75", ProfDataNext.SecondaryClientAges)
          for (const stKey in {PrimaryRole : '',
                              SecondaryRole : '',
                              PrimaryArea : '',
                              SecondaryArea : '',
                              PrimaryAreaOther : '',
                              SecondaryAreaOther : '',
                              TertiaryArea : '',
                              ClientAges : '',
                              SecondaryClientAges: '' }) {
            // console.log("ProfData Key: " + stKey + "Value: " + JSON.stringify(ProfDataNext[stKey]));
            if (ProfDataNext[stKey] && ProfDataNext[stKey].Id !== '') {
              if(ProfDataNext[stKey]){
                this.ProfessionalForm.get(stKey).setValue(ProfDataNext[stKey]);
              } else {
                this.ProfessionalForm.get(stKey).setValue(ProfDataNext[stKey]);
              }
            }
          }
          // console.log('ProfDataNext:',(ProfDataNext));
        },
        ProfDataError => {
          this.ProfessionAlertServ.error(ProfDataError);
        },
        () => { // OnComplete

        })
    )
  }

  public InitForm() {
    this.ProfessionalForm = this.ProfessionFormBuilder.group({
      PrimaryRole: ["", Validators.required],
      SecondaryRole: [""],
      PrimaryArea: ["", Validators.required],
      SecondaryArea: [""],
      PrimaryAreaOther: [""],
      SecondaryAreaOther: [""],
      TertiaryArea: [""],
      ClientAges: ["", Validators.required],
      SecondaryClientAges: [""],
    });
    // this.ProfessionServ.Read();

  }

  public get RoleList() : IListObject [] {
    return this.ProfModelToolsServ.RolesInBA$;
  }

  public get AreaOfEmphasis() : IListObject [] {
    return this.ProfModelToolsServ.ProfessionalEmphasisType$;
  }
  // public get SecondaryEmphasis(): IListObject[] {
  //   return [{"Id":"1", "Value":""}, ...this.ProfModelToolsServ.ProfessionalEmphasisType$];
  // }

  public get AgesOfClientele() : IListObject [] {
    return this.ProfModelToolsServ.AgesOfClientele$;
  }

  public get SecondaryAgesOfClientele(): IListObject[] {
    // This is the same as AgesOfClientele because the data is being populated by the same list on the backend MM 3.5.20
    return this.ProfModelToolsServ.AgesOfClientele$;
  }

  public get ProfessionalData() : Observable<IProfessionalData> {
    return this.ProfessionServ.ProfessionalData$;
  }

  public CompareListObj(Param1: IListObject, Param2: IListObject) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }

  public TranslateForm(CurrentForm : FormGroup) : IProfessionalData {
    console.warn("TranslateForm",CurrentForm)
    let NewTertiaryArea : IListObject[] = [];
    for (let objTertiaryArea of CurrentForm.get('TertiaryArea').value) {
      if (objTertiaryArea.Id) {
        NewTertiaryArea.push(new ListObject(objTertiaryArea).Export());
      }
    }

    let NewClientAges : IListObject[] = [];

    for (let objClientAges of CurrentForm.get('ClientAges').value) {
      if (objClientAges.Id) {
        NewClientAges.push(new ListObject(objClientAges).Export());
      }
    }
    let NewSecondaryClientAges: IListObject[] = [];
    for (let objClientAges of CurrentForm.get('SecondaryClientAges').value) {
      if (objClientAges.Id) {
        NewSecondaryClientAges.push(new ListObject(objClientAges).Export());
      }
    }
    // This does return everything specified, all values are correct
    return {'PrimaryRole' : new ListObject(CurrentForm.get('PrimaryRole').value).Export(),
            'SecondaryRole' : new ListObject(CurrentForm.get('SecondaryRole').value).Export(),
            'PrimaryArea' : new ListObject(CurrentForm.get('PrimaryArea').value).Export(),
            'SecondaryArea' : new ListObject(CurrentForm.get('SecondaryArea').value).Export(),
            'PrimaryAreaOther' : CurrentForm.get('PrimaryAreaOther').value? CurrentForm.get('PrimaryAreaOther').value: '',
            'SecondaryAreaOther' : CurrentForm.get('SecondaryAreaOther').value? CurrentForm.get('SecondaryAreaOther').value: '',
            'TertiaryArea' : NewTertiaryArea,
            'ClientAges' : NewClientAges,
            'SecondaryClientAges' : NewSecondaryClientAges,
    }
  }

  public OnSubmit() {

    console.log(this.ProfessionalForm)
    console.log("onsubmit")
    this.IsSubmitted = true;
    this.ProfessionalForm.get('PrimaryRole').updateValueAndValidity()
    // stop here if form is invalid
    if (this.ProfessionalForm.invalid) {
      // this.ProfessionAlertServ.error('Please ensure that all of the required fields have been completed.')
      return;
    }

    // No data loss on ProfessionalData conversion...
    this.NewData = this.TranslateForm(this.ProfessionalForm);
    this.IsLoading = true;
    this.SubscriptionArray.push(
      this.ProfessionServ.Update(this.NewData)
        .pipe(first())
        .subscribe(
          (ProfessionNext: IConfirm) => {
            if (ProfessionNext) {
              this.ProfessionAlertServ.success(ProfessionNext.Message, true);
            }
          },
          ProfessionError => {
            this.ProfessionAlertServ.error(ProfessionError),
            this.IsLoading = false
          },
          () => {
            this.NewData = null;
            this.IsLoading = false;
            this.IsSubmitted = false;
            this.ProfessionalForm.reset();
            this.ProfessionServ.Read();
            this.ProfessionServ.Check();
            // Yeah this is wrong
            // console.log(this.ProfessionServ.Check)
            // if(this.InstAppData){
            //   this.ProfessionServ.Check()
            //   this.InstAppData.Check[this.InstComponentData.Page] = this.ProfessionServ.Check$;
            // }
          }
        )
      )
  }
  public OnClickCancel() {
    this.ProfessionServ.Read();
  }

  ngOnDestroy(): void {
    this.SubscriptionArray.forEach((subscription: Subscription) =>{
      if(!subscription.closed){
        subscription.unsubscribe();
      }
    })
  }

}


