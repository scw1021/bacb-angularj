import { AlertService, CustomerService } from 'src/app/_services';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Customer, ExperienceSupervision } from 'src/app/_models';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ICustomer, ICustomerExt } from 'src/app/_interfaces';
import { Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap, tap } from 'rxjs/operators';

import { IResponsibleRelationship } from '../_interfaces/i-responsible-relationship';
import { IResponsibleRelationshipPercolation } from '../_interfaces/i-responsible-relationship-percolation';
import { RbtApplicationService } from '../_services/rbt-application.service';
import { ResponsibleRelationship } from '../_models/responsible-relationship';

@Component({
  selector: 'responsible-relationship',
  templateUrl: './responsible-relationship.component.html',
  styleUrls: ['./responsible-relationship.component.css']
})


/**
 * Provides input fields for Supervisor search by BACBID, some dates and extra strings.
 * Designed initially for usage in RBT applications
 */
export class ResponsibleRelationshipComponent implements OnInit {

  @Input() public ComponentType: string;
  public ResponsiblePartyRelationship: string = '';
  public SpecificEndDateString: string = '';
  public ShowAgencyField: boolean = false;
  public ShowRelationshipField: boolean = false;
  public ShowStartDate: boolean = false;

  // Error Handling
  public StartDate: FormControl | null = null;
  public StartDateErrorMessage: string = '';
  public EndDate: FormControl | null = null;
  public EndDateErrorMessage: string = '';
  public BACBID: FormControl | null = null;
  public AgencyName: FormControl | null = null;
  public RelationshipName: FormControl | null = null;
  public ResponsibleName: FormControl | null = null;
  public SavedRelationship: Observable<ResponsibleRelationship> | null = null;
  public SavedRelationshipInstance: IResponsibleRelationship = new ResponsibleRelationship().Export();

  @Output() public RelationshipEvent: EventEmitter<IResponsibleRelationshipPercolation>;

  // Member Variable for Add Supervisor Form
  // protected SupervisionSubject: BehaviorSubject<IExperienceSupervision[]> = new BehaviorSubject<IExperienceSupervision[]>([]);


      // Member Variable for Edit Supervisor Form
  public CustomerForm : FormGroup;
  public _SelectedSupervision : ExperienceSupervision;
  public FilteredCustomers : Observable<ICustomerExt[]>;
  public IsSubmitted: boolean = false;
  public IsLoading: boolean = false;

  public constructor(
    protected alertServ: AlertService,
    private customerServ: CustomerService,
    private rbtService: RbtApplicationService,
    private supervisorFormBuilder: FormBuilder,
  ) {
    this.RelationshipEvent = new EventEmitter<IResponsibleRelationshipPercolation>();
  }

  /**
   * Sets up the Form for the component and determines which elements to reveal to the UI.
   * This also determines the subscription observable in the switch statement.
   */
  ngOnInit() {

    let  formValidators: ValidatorFn[] = [];
    // Set up the DOM for whatever we are using
    switch( this.ComponentType ) {
      case 'Training':
        this.ResponsiblePartyRelationship = 'Responsible Trainer';
        this.SpecificEndDateString = 'End Date';
        this.ShowAgencyField = true;
        this.ShowStartDate = true;
        this.SavedRelationship = this.rbtService.Trainings$;
        formValidators = [this.IsQualifiedValidator, this.StartEndDateRelationshipValidator]
        break;
      case 'Competency':
        this.ResponsiblePartyRelationship = 'Responsible Assessor';
        this.SpecificEndDateString = 'Date Competency Assessment Completed';
        this.ShowRelationshipField = true;
        this.SavedRelationship = this.rbtService.CompetencyRelationship$;
        formValidators = [this.IsQualifiedValidator, this.CompletedSupervisionValidator]
        break;
      case 'BackgroundCheck':
        this.ResponsiblePartyRelationship = 'Attesting Certificant';
        this.SpecificEndDateString = 'Date Signed';
        this.ShowRelationshipField = true;
        this.SavedRelationship = this.rbtService.BackgroundCheck$;
        break;
    }

    this.EndDate = this.supervisorFormBuilder.control('', [Validators.required]);
    this.BACBID = this.supervisorFormBuilder.control('', [Validators.required]);
    this.ResponsibleName = this.supervisorFormBuilder.control('', [Validators.required]);
    this.StartDate = this.supervisorFormBuilder.control('', null);

    this.AgencyName = this.supervisorFormBuilder.control('', this.ShowAgencyField ? [Validators.required] : null);
    this.RelationshipName = this.supervisorFormBuilder.control('', this.ShowRelationshipField ? [Validators.required] : null);

    this.CustomerForm = this.supervisorFormBuilder.group({
      BACBID: this.BACBID,
      Name: this.ResponsibleName,
      StartDate: this.StartDate,
      EndDate: this.EndDate,
      AgencyName: this.AgencyName,
      RelationshipName: this.RelationshipName,
    }, {validators: formValidators});// this.ShowStartDate ? [StartEndDateRelationshipValidator] : null});

    this.CustomerForm.get('StartDate').setValidators(this.ShowStartDate ? [Validators.required, this.StartEndDateRelationshipValidator] : null)
    this.LoadFormFromSavedRelationship();

    // Customer (Supervisor) AutoComplete
    this.FilteredCustomers = this.CustomerForm.controls['BACBID'].valueChanges
    .pipe(
      startWith(""),
      debounceTime(300),
      //tap(() => this.IsLoading = true),
      switchMap((value : string) => this.SearchCustomers(value)),
      //finalize(() => this.IsLoading = false)
    );
  }

  // Accessors
  public get SelectedSupervisor() : ICustomer {
    return this.CustomerForm.controls['BACBID'].value != null ? this.CustomerForm.controls['BACBID'].value : new Customer().Export();
  }

  // Methods
  private SearchCustomers(ParamName: string) : Observable<ICustomerExt[]> {
    if (ParamName && ParamName.length >= 7) {
    return this.customerServ.Customer(ParamName)
      .pipe(map((CustomerMap : ICustomerExt) => {
        return [CustomerMap];
      }));
    }
    else {
      return of([]);
    }
  }

  public OnSelectCustomer(SelectedCustomer : ICustomer) : void {
    if (SelectedCustomer.Id) {
      this.CustomerForm.get('Name').setValue(SelectedCustomer.Name);
      this._SelectedSupervision = new ExperienceSupervision({'Id': '', 'ExpId': '', 'Supervisor': new Customer(this.SelectedSupervisor).Export() ,'IsPrimary': 'F'});
    }
  }

  public DisplayCustomerFn(SelectedCustomer: ICustomer) : string {
    if (SelectedCustomer != null && SelectedCustomer.Id) {
      return SelectedCustomer.BACBID;
    }
    return "";
  }

  /**
   * To load the form, we are simply taking whichever service observable is preferred and pull
   * whatever data is required from that service.
   * @usageNotes Training.Service contains the required behavior subjects/ observables
   * required for all three elements in the RBT application
   */
  public LoadFormFromSavedRelationship() {
    this.SavedRelationship
    .pipe(tap(_response => {
      // console.log(this.ComponentType);
      // console.log('LoadFormFromSavedRelationship: ', _response)
      if ( _response && _response.Id ) {
        this.SavedRelationshipInstance = _response.Export();
        // Percolate the existing check to parent component
        this.RelationshipEvent.emit({ResponsibleRelationship: this.SavedRelationshipInstance, 'ComponentType': '-1'});
      }
    }))
    .subscribe(
      (_response: ResponsibleRelationship) => {
        // We really just need to check for the ID to know if the relationship is previously submitted
        if ( _response && _response.Id ) {
          this.CustomerForm.get('EndDate').setValue(_response.EndDate);
          this.CustomerForm.get('Name').setValue(_response.Customer ? _response.Customer.Name : '');
          // hotfix for reloading customer
          _response.Customer['CompletedSupervision'] = true;
          _response.Customer['IsQualified'] = true;
          this.CustomerForm.get('BACBID').setValue(_response.Customer);
          if ( _response.Agency ) {
          this.CustomerForm.get('AgencyName').setValue(_response.Agency);
          }
          if ( _response.StartDate ) {
            this.CustomerForm.get('StartDate').setValue(_response.StartDate);
          }
          if( _response.SupervisorRelationship ) {
            this.CustomerForm.get('RelationshipName').setValue(_response.SupervisorRelationship);
          }
        }
      }
    )
  }

  /**
   * For this component, we don't perform the update here, but instead in the parent component.
   * This is currently ( 11/2019 ) used in the RBT component.
   * This method simply emits the value of the supervision to the RBT component because the
   * NetSuite record also requires a Documentation File.
   */
  public OnSubmit() : void {
    if ( this.IsSubmitted ) {
      return;
    }
    this.IsSubmitted = true;
    if (this.CustomerForm.invalid) {
      console.log('Form Invalid', this.CustomerForm);
      console.log(this.CustomerForm.hasError('ltfiveDays'))
      return;
    }
    // This component simply sends the relavant information to the parent component
    let relationship = new ResponsibleRelationship();
    // grab permanent data members
    relationship.Customer = this.CustomerForm.controls['BACBID'].value;
    relationship.EndDate = this.CustomerForm.controls['EndDate'].value;
    // grab other elements
    if ( this.ShowAgencyField ) {
      relationship.Agency = this.CustomerForm.controls['AgencyName'] ? this.CustomerForm.controls['AgencyName'].value : null;
    }
    if ( this.ShowRelationshipField ) {
      relationship.SupervisorRelationship = this.CustomerForm.controls['RelationshipName'] ? this.CustomerForm.controls['RelationshipName'].value : null;
    }
    if ( this.ShowStartDate ) {
      relationship.StartDate = this.CustomerForm.controls['StartDate'] ? this.CustomerForm.controls['StartDate'].value : null;
    }
    // Grab other values from Saved Response if available, if none exists, the element is null
    if ( this.SavedRelationshipInstance ) {
      relationship.Id = this.SavedRelationshipInstance.Id;
    }
    let objResponse: IResponsibleRelationshipPercolation = {
      ResponsibleRelationship: relationship.Export(),
      ComponentType: this.ComponentType
    }
    // console.log(objResponse);
    this.RelationshipEvent.next(objResponse);
    this.IsSubmitted = false;
  }

  public CompletedSupervisionValidator: ValidatorFn = (fg: FormGroup) => {
    if ( !fg.get('Name').value ) {
      return null;
    }
    const customer = fg.get('BACBID').value as ICustomerExt;
    // console.log('Validator Customer', customer)
    // console.log(fg);
    if ( customer.CompletedSupervision ){
      // console.log('completed supervision')
      return null;
    }
    // console.log('not completed supervision');
    return {'nosupervision': true}
  }
  public IsQualifiedValidator: ValidatorFn = (fg: FormGroup) => {
    if ( !fg.get('Name').value ) {
      return null;
    }
    const customer = fg.get('BACBID').value as ICustomerExt;
    if ( customer.IsQualified ) {
      // console.log('customer is qualified')
      return null;
    }
    return {'notqualified': true}
  }
  public StartEndDateRelationshipValidator: ValidatorFn = (fc: FormControl, fg: FormGroup = this.CustomerForm) =>{
    if ( !fg ) {
      return null;
    }
    const StartDate: number = fg.get('StartDate').value;
    const EndDate: number = fg.get('EndDate').value;
    // console.log("StartDate", StartDate, "EndDate", EndDate);
    const fiveDays = 1000 * 60 * 60 * 24 * 5;
    const oneEightyDays = 1000 * 60 * 60 * 24 * 180;
    if(StartDate && EndDate){
      if ( EndDate - StartDate < fiveDays ) {
        return { 'ltfiveDays': true }
      }
      else if ( EndDate - StartDate > oneEightyDays) {
        return { 'gtOneEightyDays': true }
      }
      else {
        return null;
      }
    }
    else {
      return { 'bothRequired': true }
    }

  }

}



