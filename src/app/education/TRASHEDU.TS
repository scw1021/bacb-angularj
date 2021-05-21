import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { first, debounceTime, map, startWith, switchMap, tap } from 'rxjs/operators';
import { MatTableDataSource, MatTable } from '@angular/material/table';

import { AlertService, EducationService, ModelToolsService } from '../_services';
import { AppData, Degree, Country, ListObject, Institution, ComponentData, State, StateSet, CertType } from '../_models';
import { IConfirm, IDegree, IInstitution, IListObject, ICountry, ICertType, IStateSet } from '../_interfaces';

@Component({
  selector: 'education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit, OnDestroy {

  @Input() public InstComponentData : ComponentData;
  @Input() public InstAppData : AppData;
  @Output() public SectionEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() public PageEmitter: EventEmitter<string> = new EventEmitter<string>();

  public SubmittedDegree: Degree = new Degree();
  public IsVisibleEdit: boolean = false;
  public IsVisibleNew : boolean = false;
  public IsVisibleInstitution : boolean = false;
  public IsSubmitted: boolean = false;
  public IsLoading: boolean = false;
  public EducationForm: FormGroup;

  public FilteredInstitutions: Observable<IInstitution[]>
  public EducationRequirementString: string = '';
  // As we add more forms, we have been asked to populate the instructions element with app-specific material
  private educationRequirementStrings = [
    "BCBA applications require a Master's degree", "BCaBA applications require a Bachelor's degree", "RBT applications require a GED or national equivalent"
  ]

  public DegreeData$: Observable<IDegree[]> = new Observable<IDegree[]>();
  public DegreeSubscription: Subscription;
  public SelectedDegree: Degree = new Degree();
  public SelectedInstitution: Institution = new Institution();
  public SelectedCountry: Country = new Country();
  public EducationDataSource: MatTableDataSource<Degree> = new MatTableDataSource<Degree>();

  public DegreeTypes: Observable<IListObject[]> = this.EducationModelServ.DegreeType$.pipe(
    tap(x => console.log("Deg Types", x ))
  );
  public Institutions: Observable<IInstitution[]> = this.EducationModelServ.Institution$;
  public Degrees: Observable<IDegree[]> = this.EducationServ.Degree$.pipe(
    tap(x => console.log("Degrees", x ))
  );
  public Countries: Observable<ICountry[]> = this.EducationModelServ.Countrie$;


  public constructor(
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
      AddInstitution: ['']
    })
  }

  public ngOnInit() {
    this.InstAppData.CertType$.pipe(
      tap((CertTypeTA: ICertType) => console.trace("CertType trace wtf is happ", CertTypeTA)),
      tap((CertTypeTap: ICertType) => {
        if (this.InstComponentData.Page !== this.InstComponentData.SummaryPage) {
          this.EducationServ.Check(CertTypeTap.Id);
          this.InstAppData.Check[this.InstComponentData.Page] = this.EducationServ._CheckSubject.asObservable();
        }
        // let's add a DOM element because we were asked politely
        // but in a lazy way, so it throws an error when we add more features.
        // The strings are currently guesses, and will need correction
        this.EducationRequirementString = this.educationRequirementStrings[parseInt(CertTypeTap.Id, 10) - 1];
      })
    ).subscribe();

    this.EducationServ.Read();
    this.DegreeData$ = this.Degrees.pipe(
      tap((DegreeTap: IDegree[]) => {
        this.EducationDataSource = new MatTableDataSource<Degree>();
        if (DegreeTap && DegreeTap.length) {
          for (const stIndex in DegreeTap) {
            this.EducationDataSource.data.push(new Degree(DegreeTap[stIndex]));
          }
        }
      })
    );
    this.DegreeSubscription = this.DegreeData$.subscribe();

    // Institution AutoComplete
    this.FilteredInstitutions = this.EducationForm.controls['InstitutionFC'].valueChanges
    .pipe(
      startWith(""),
      debounceTime(300),
      //tap(() => this.IsLoading = true),
      switchMap((value : string) => this.SearchInstitution(value)),
      // finalize(() => this.IsLoading = false)
    );
  }

  public ngOnDestroy() {
    this.DegreeSubscription.unsubscribe();
  }



  // Accessors
  public get StateSet() : Observable<IStateSet> {
    if (this.SelectedCountry) {
      return this.EducationModelServ.ReadStates(this.SelectedCountry.Export());
    }
    else {
      return of(new StateSet().Export());
    }
  }

  public get DisplayedColumns() : string [] {
    return ['Level','Major','DateConferred','Institution','Actions'];
  }

  // Methods
  public LoadTable() : void {

  }

  private SearchInstitution(ParamName: string) : Observable<IInstitution[]> {
    return this.EducationModelServ.Institution$
      .pipe(map((InstitutionMap : IInstitution[]) => {
        let FilterResultArray =  InstitutionMap.filter((InstFilter : IInstitution) => {
          return InstFilter.Name.toLowerCase().match(new RegExp(ParamName,"i"));
        })
        this.IsVisibleInstitution = FilterResultArray.length === 0;
        return FilterResultArray;
      }));
  }

  public DisplayInstitution(ChosenInstitution : IInstitution) : string {
    if (ChosenInstitution && ChosenInstitution.Id) {
      this.SelectedInstitution = new Institution(ChosenInstitution);
      return this.SelectedInstitution.Name;
    }
  }

  public CompareListObj(Param1: IListObject, Param2: IListObject) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }

  public OnClickNew() : void {
    this.IsVisibleEdit = false;
    this.IsVisibleNew = true;
    this.EnableValidators();
  }

  public OnClickEdit(SelectedDegree: Degree) : void {
    this.SelectedDegree = new Degree(SelectedDegree.Export());
    this.IsVisibleEdit = true;
    this.IsVisibleNew = false;
    this.SetFormValues();
    this.EnableValidators();
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
            this.EducationAlertServ.error(DegreeNext.Message, false);
          }
        },
        DegreeError => {
          this.EducationAlertServ.error(DegreeError);
        },
        () => {  // OnComplete
          this.EducationServ.Read();
          this.InstAppData.CertType$.pipe(
            tap((CertType: ICertType) => this.EducationServ.Check(CertType.NetSuiteId))
          ).subscribe();
          //this.InstAppData.Check[this.InstComponentData.Page] = this.EducationServ._CheckSubject.asObservable();
        }
      )
  }

  public OnClickCancel() : void {
    this.IsVisibleEdit = false;
    this.IsVisibleNew = false;
    this.EducationForm.reset();
    this.DisableValidators();
    this.SelectedDegree.Erase();
  }

  public OnSelectInstitution(SelectedIInstitution : IInstitution) : void {
    if (SelectedIInstitution && SelectedIInstitution.Id) {
      this.SelectedInstitution = new Institution(SelectedIInstitution);
    }
  }

  public get DefaultCountry() : ICountry {
    return this.Countries.pipe(
        map( (CountryMap: ICountry[]) => CountryMap.find((CountryFind: ICountry) => CountryFind.Id == '202'))
      ).subscribe()[0];
  }

  public CompareCountry(Param1: ICountry, Param2 : ICountry) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }

  public OnSelectCountry(SelectedICountry : ICountry) : void {
    if (SelectedICountry && SelectedICountry.Id) {
      this.SelectedCountry = new Country(SelectedICountry);
    }
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

  private SetFormValues() : void {
    this.EducationForm.get('Id').setValue(this.SelectedDegree.Id);
    this.EducationForm.get('Type').setValue(this.SelectedDegree.Type);
    this.EducationForm.get('Major').setValue(this.SelectedDegree.Major);
    this.EducationForm.get('DateConferred').setValue(this.SelectedDegree.DateConferred);
    // We also need to sure the Institution is 'selected'
    this.SelectedInstitution = this.SelectedDegree.Institution;
    this.EducationForm.get('InstitutionFC').setValue(this.SelectedDegree.Institution);
  }

  public TranslateForm(CurrentForm : FormGroup) : IDegree {
    let DegreeObj: Degree = new Degree();
    DegreeObj.Id = CurrentForm.get('Id').value;
    DegreeObj.Type = new ListObject(<IListObject>CurrentForm.get('Type').value);
    DegreeObj.Major = CurrentForm.get('Major').value;
    DegreeObj.DateConferred = new Date(CurrentForm.get('DateConferred').value);
    DegreeObj.Institution = new Institution(this.SelectedInstitution.Export());
    return DegreeObj.Export();
  }

  public FormToInstitution(CurrentForm: FormGroup) : IInstitution {
    let NewInstitution = new Institution();
    NewInstitution.Name = CurrentForm.get('Name').value;
    NewInstitution.Address.Address1 = CurrentForm.get('Address1').value;
    NewInstitution.Address.Address2 = CurrentForm.get('Address2').value;
    if (CurrentForm.get('Country').value) {
      NewInstitution.Address.Country = new Country(CurrentForm.get('Country').value);
    }
    if (CurrentForm.get('State').value) {
      NewInstitution.Address.State = new State(CurrentForm.get('State').value);
    }
    NewInstitution.Address.PostalCode = CurrentForm.get('PostalCode').value;
    NewInstitution.Address.isShipping = true;
    NewInstitution.Address.isBilling = true;
    return NewInstitution.Export();
  }

  public OnSubmit() : void {
    this.IsSubmitted = true;

    // stop here if form is invalid
    if (this.EducationForm.invalid) {
      this.EducationAlertServ.error('Form Invalid');
      return;
    }

    this.SubmittedDegree = new Degree(this.TranslateForm(this.EducationForm));

    if (this.SubmittedDegree && this.SubmittedDegree.Id) {
    this.EducationServ.Update(this.SubmittedDegree.Export())
      .pipe()
      .subscribe(
        (DegreeNext: IConfirm) => {
          if (DegreeNext && DegreeNext.Response && DegreeNext.Response == 'T') {
            this.EducationAlertServ.success('Education saved');
          }
          else {
            this.EducationAlertServ.error('Degree Next Error: ' + DegreeNext.Message);
          }},
          DegreeError => {
            this.EducationAlertServ.error('Degree Next Error: ' + DegreeError);
          },
          () => { // OnComplete
            this.EducationServ.Read();
            this.LoadTable();
            this.IsVisibleEdit = false;
            this.DisableValidators();
            this.SelectedDegree.Erase();
            this.SelectedInstitution.Erase();
            this.SubmittedDegree.Erase();
            this.EducationForm.reset();
            this.InstAppData.CertType$.pipe(
              tap((CertType: ICertType) => this.EducationServ.Check(CertType.Id))
            ).subscribe();
            //this.InstAppData.Check[this.InstComponentData.Page] = this.EducationServ._CheckSubject.asObservable();
          }
      );
    }
    else {
      this.EducationServ.Create(this.SubmittedDegree.Export())
      .pipe(
        tap((SubmittedDeg) => console.log("Submitted degree" + SubmittedDeg))
      )
      .subscribe(
        (DegreeNext: IConfirm) => {
            this.EducationAlertServ.success('Education saved');
        },
          DegreeError => {
            this.EducationAlertServ.error('Degree Next Error: ' + DegreeError);
          },
          () => { // OnComplete

            this.EducationServ.Read();
            this.LoadTable();
            this.IsVisibleNew = false;
            this.DisableValidators();
            this.SelectedDegree.Erase();
            this.SelectedInstitution.Erase();
            this.SubmittedDegree.Erase();
            this.EducationForm.reset();
            this.InstAppData.CertType$.pipe(
              tap((GARBAGE) => console.log("CertTypePipe", GARBAGE))
            )
            this.InstAppData.CertType$.pipe(tap((CertType: ICertType) => this.EducationServ.Check(CertType.Id))).subscribe();
            //this.InstAppData.Check[this.InstComponentData.Page] = this.EducationServ._CheckSubject.asObservable();
          }
      );
    }
  }
}
