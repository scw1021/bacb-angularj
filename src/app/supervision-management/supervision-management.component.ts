import { AlertService, CertificationService, CustomerService } from '../_services';
import { Certification, Supervision } from '../_models';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfirm, ICustomer, ISupervision } from '../_interfaces';
import { Observable, Subscription, of } from 'rxjs';
import { debounceTime, delay, map, startWith, switchMap, tap } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { SupervisionService } from '../_services/supervision.service';

@Component({
  selector: 'supervision-management',
  templateUrl: './supervision-management.component.html',
  styleUrls: ['./supervision-management.component.css']
})
export class SupervisionManagementComponent implements OnInit {

  public Supervisor$: Observable<ISupervision[]> | null = null;
  private SupervisorSubscription: Subscription;
  public SupervisorCurrentData: MatTableDataSource<Supervision> = new MatTableDataSource<Supervision>();
  public SupervisorOldData:  MatTableDataSource<Supervision> = new MatTableDataSource<Supervision>();
  public Supervisee$: Observable<ISupervision[]>;
  private SuperviseeSupscription: Subscription;
  public SuperviseeCurrentData: MatTableDataSource<Supervision> = new MatTableDataSource<Supervision>();
  public SuperviseeOldData:  MatTableDataSource<Supervision> = new MatTableDataSource<Supervision>();
  // FIXME - This must be updated to filter based on cycle status, active only!
  //public SelectedCertification$ = this.SupervisionCertificationServ.OtherCustomerCertification$;
 // public SelectedCertification$ = of(mockCerts);
  public IsVisibleRemoveSupervision: boolean = false;
  public RemoveSupervisionForm: FormGroup | null = null;
  public IsVisibleAddSupervisee: boolean = false;
  public AddSupervisionForm: FormGroup | null = null;
  public FilteredCustomers : Observable<ICustomer[]>;
  public SelectedCertifications: Certification[] = []; // not used?
  public CertificationSubscription: Subscription;
  public UserHighestCertification: Certification = new Certification();
  private UserCertificationSubscription: Subscription;
  public SelectedSupervision: Supervision = new Supervision();
  public IsSubmitted: boolean = false;
  public DefaultTab: number = 0;
  public ReasonsForRemoval: Observable<any> | null = null;

  public constructor(
    private SupervisionAlertServ: AlertService,
    private SupervisionServ: SupervisionService,
    private SupervisionFormBuilder: FormBuilder,
    private SupervisionCustomerServ: CustomerService,
    private SupervisionCertificationServ: CertificationService
  ) {
    this.ReasonsForRemoval = this.SupervisionServ.ReasonsForRemoval$;
  }

  public ngOnInit() {
    // this.RemoveSupervisionForm = this.SupervisionFormBuilder.group({
    //   'Id': [''],
    //   'SupervisorBACBID': [''],
    //   'SupervisorName': [''],
    //   'SuperviseeBACBID': [''],
    //   'SuperviseeName': [''],
    //   'EndDate': [''],
    //   'Reason': ['']
    // });

    // this.AddSupervisionForm = this.SupervisionFormBuilder.group({
    //   'BACBID': [''],
    //   'Name': [''],
    //   'Certification': [''],
    //   'StartDate': ['']
    // })
    // this.SupervisionServ.ReadSupervisors();
    // this.Supervisor$ = this.SupervisionServ.Supervisor$
    //   .pipe(
    //     tap((SupervisorTap: ISupervision[]) => {
    //       if (SupervisorTap && SupervisorTap.length) {
    //         let lists = this.OldAndNew(SupervisorTap);
    //         this.SupervisorCurrentData = new MatTableDataSource(lists[0]);
    //         this.SupervisorOldData = new MatTableDataSource(lists[1]);
    //       }
    //     })
    //   );
    // this.SupervisorSubscription = this.Supervisor$.subscribe();
    // this.SupervisionServ.ReadSupervisees();
    // this.Supervisee$ = this.SupervisionServ.Supervisee$
    //   .pipe(
    //     tap((SuperviseeTap: ISupervision[]) => {
    //       if (SuperviseeTap && SuperviseeTap.length) {
    //         let lists = this.OldAndNew(SuperviseeTap);
    //         this.SuperviseeCurrentData = new MatTableDataSource(lists[0]);
    //         this.SuperviseeOldData = new MatTableDataSource(lists[1]);
    //       }
    //     })
    //   )
    // this.SuperviseeSupscription = this.Supervisee$.subscribe();
    // // this.SupervisionServ.ReadSupervisees();
    // this.CertificationSubscription = this.SupervisionServ.Certification$
    //   .pipe(tap((CertificationTap: Certification[]) => {
    //     this.SelectedCertifications = CertificationTap;
    //   })).subscribe();

    // this.SupervisionCertificationServ.ReadAll();
    // this.UserCertificationSubscription = this.SupervisionCertificationServ.Certifications$
    //   .pipe(tap((UserCertTap: Certification[]) => {
    //     this.UserHighestCertification.Erase();
    //     for(const CertificationIndex in UserCertTap) {
    //       let TempCertification = new Certification(UserCertTap[CertificationIndex].Export());
    //       if (TempCertification.IsCurrent && TempCertification.Type.Abbrev === 'BCBA') {
    //         console.log("Cert is BCBA tab set to 1 ", TempCertification);
    //         this.UserHighestCertification = TempCertification;
    //         this.DefaultTab = 1;
    //       }
    //       else if (this.UserHighestCertification.Type.Abbrev != 'BCBA' && TempCertification.IsCurrent && TempCertification.Type.Abbrev === 'BCaBA') {
    //         console.log("Cert is BCaBA tab set to 1");
    //         this.UserHighestCertification = TempCertification;
    //         this.DefaultTab = 1;
    //       }
    //       else if (this.UserHighestCertification.Id === '' && TempCertification.IsCurrent){
    //         console.log("Cert is RBT tab set to 0");
    //         this.UserHighestCertification = TempCertification;
    //       }
    //     }
    //   })).subscribe()

    // // Customer (Supervisor) AutoComplete
    // this.FilteredCustomers = this.AddSupervisionForm.controls['BACBID'].valueChanges
    // .pipe(
    //   startWith(""),
    //   debounceTime(300),
    //   delay(0),
    //   switchMap((value : string) => {
    //     return this.SearchCustomers(value).pipe();
    //   })
    // )
  }

  // private OldAndNew(obj: Array<ISupervision>): Array<Array<Supervision>> {
  //   let currentList = [];
  //   let oldList = [];
  //   if (obj && obj.length) {
  //     obj.forEach(_supervision => {
  //       let SupervisionObject = new Supervision(_supervision);
  //       if (SupervisionObject.EndDate != null || SupervisionObject.Status.Id === '48' ) {
  //         oldList.push(SupervisionObject);
  //       }
  //       else {
  //         currentList.push(SupervisionObject)
  //       }
  //     });
  //   }
  //   return [currentList, oldList];
  // }

  // public ngOnDestroy() {
  //   this.SupervisorSubscription.unsubscribe();
  //   this.SuperviseeSupscription.unsubscribe();
  //   this.CertificationSubscription.unsubscribe();
  //   this.UserCertificationSubscription.unsubscribe();
  // }

  // // Accessors
  // public get CurrentDisplayedColumns() : string[] {
  //   return ["Name", "BACB ID", "Certification Type", "Status", "Date Added", "Actions"];
  // }

  // public get HistoricDisplayedColumns() : string[] {
  //   return ["Name", "BACB ID", "Certification Type", "Status", "Date Added", "Date Removed"];
  // }

  // // Methods
  // private SearchCustomers(ParamName: string) : Observable<ICustomer[]> {
  //   if (ParamName && ParamName.length >= 4) {
  //   return this.SupervisionCustomerServ.Customer$
  //     .pipe(map((CustomerMap : ICustomer[]) => {
  //       let FilterResultArray =  CustomerMap.filter((InstFilter : ICustomer) => {
  //         return InstFilter.BACBID.match(new RegExp(ParamName,"i"));
  //       })
  //       return FilterResultArray;
  //     }));
  //   }
  //   else {
  //     return of([]);
  //   }
  // }

  // public DisplayCustomerFn(SelectedCustomer: ICustomer) : string {
  //   if (SelectedCustomer != null && SelectedCustomer.Id) {
  //     return SelectedCustomer.BACBID;
  //   }
  //   return "";
  // }

  // public OnSelectCustomer(SelectedCustomer : ICustomer) : void {
  //   if (SelectedCustomer.Id) {
  //     this.AddSupervisionForm.get('Name').setValue(SelectedCustomer.Name);
  //     this.SupervisionCertificationServ.ReadAll(SelectedCustomer.Id);
  //     //this.SupervisionServ.ReadCertifications(SelectedCustomer.Id);

  //     // this.SelectedSupervision.Supervisee = this.SelectedCertifications
  //     //   .find((CertificationFind: Certification) => CertificationFind.Type.Id === this.TypeOfSuperviseeToAdd);
  //     // this.SelectedSupervision.Supervisor = this.UserHighestCertification;
  //   }
  // }

  // public OnSelectCertification(SelectedCertification: Certification) : void {
  //   this.SelectedSupervision.Supervisee = SelectedCertification;
  // }

  // public CompareCertifications(Param1: Certification, Param2: Certification) : boolean {
  //   return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  // }

  // public OnClickRemoveSupervision(SelectedSupervision: Supervision) : void {
  //   this.RemoveSupervisionForm.controls['Id'].setValue(SelectedSupervision.Id);
  //   this.RemoveSupervisionForm.controls['SupervisorBACBID'].setValue(SelectedSupervision.Supervisor.Customer.BACBID);
  //   this.RemoveSupervisionForm.controls['SupervisorName'].setValue(SelectedSupervision.Supervisor.Customer.Name);
  //   this.RemoveSupervisionForm.controls['SuperviseeBACBID'].setValue(SelectedSupervision.Supervisee.Customer.BACBID);
  //   this.RemoveSupervisionForm.controls['SuperviseeName'].setValue(SelectedSupervision.Supervisee.Customer.Name);
  //   this.SelectedSupervision.Erase();
  //   this.SelectedSupervision = new Supervision(SelectedSupervision.Export());
  //   this.RemoveSupervisionEnableValidators();
  // this.IsVisibleRemoveSupervision = true;
  // }

  // public OnClickCancel() : void {
  //   this.IsVisibleRemoveSupervision = false;
  //   this.IsVisibleAddSupervisee = false;
  //   this.AddSupervisionForm.reset();
  //   this.RemoveSupervisionForm.reset();
  //   this.SelectedSupervision.Erase();
  //   this.RemoveSupervisionDisableValidators();
  //   this.AddSuperviseeDisableValidators();
  //   this.SelectedCertifications.splice(0, this.SelectedCertifications.length);
  // }

  // public RemoveSupervisionEnableValidators() : void {
  //   this.RemoveSupervisionForm.controls['Id'].setValidators([Validators.required]);
  //   this.RemoveSupervisionForm.controls['SupervisorBACBID'].setValidators([Validators.required]);
  //   this.RemoveSupervisionForm.controls['SupervisorName'].setValidators([Validators.required]);
  //   this.RemoveSupervisionForm.controls['SuperviseeBACBID'].setValidators([Validators.required]);
  //   this.RemoveSupervisionForm.controls['SuperviseeName'].setValidators([Validators.required]);
  //   this.RemoveSupervisionForm.controls['EndDate'].setValidators([Validators.required]);
  //   this.RemoveSupervisionForm.controls['Reason'].setValidators([Validators.required]);
  // }

  // public RemoveSupervisionDisableValidators() : void {
  //   this.RemoveSupervisionForm.controls['Id'].clearValidators();
  //   this.RemoveSupervisionForm.controls['Id'].updateValueAndValidity();
  //   this.RemoveSupervisionForm.controls['SupervisorBACBID'].clearValidators();
  //   this.RemoveSupervisionForm.controls['SupervisorBACBID'].updateValueAndValidity();
  //   this.RemoveSupervisionForm.controls['SupervisorName'].clearValidators();
  //   this.RemoveSupervisionForm.controls['SupervisorName'].updateValueAndValidity();
  //   this.RemoveSupervisionForm.controls['SuperviseeBACBID'].clearValidators();
  //   this.RemoveSupervisionForm.controls['SuperviseeBACBID'].updateValueAndValidity();
  //   this.RemoveSupervisionForm.controls['SuperviseeName'].clearValidators();
  //   this.RemoveSupervisionForm.controls['SuperviseeName'].updateValueAndValidity();
  //   this.RemoveSupervisionForm.controls['EndDate'].clearValidators();
  //   this.RemoveSupervisionForm.controls['EndDate'].updateValueAndValidity();
  //   this.RemoveSupervisionForm.controls['Reason'].clearValidators();
  //   this.RemoveSupervisionForm.controls['Reason'].updateValueAndValidity();
  // }

  // public AddSuperviseeEnableValidators() : void {
  //   this.AddSupervisionForm.controls['BACBID'].setValidators([Validators.required]);
  //   this.AddSupervisionForm.controls['Name'].setValidators([Validators.required]);
  //   this.AddSupervisionForm.controls['StartDate'].setValidators([Validators.required]);
  //   this.AddSupervisionForm.controls['Certification'].setValidators([Validators.required]);
  // }

  // public AddSuperviseeDisableValidators() : void {
  //   this.AddSupervisionForm.controls['BACBID'].clearValidators();
  //   this.AddSupervisionForm.controls['BACBID'].updateValueAndValidity();
  //   this.AddSupervisionForm.controls['Name'].clearValidators();
  //   this.AddSupervisionForm.controls['Name'].updateValueAndValidity();
  //   this.AddSupervisionForm.controls['StartDate'].clearValidators();
  //   this.AddSupervisionForm.controls['StartDate'].updateValueAndValidity();
  //   this.AddSupervisionForm.controls['Certification'].clearValidators();
  //   this.AddSupervisionForm.controls['Certification'].updateValueAndValidity();
  // }

  // public AddSupervision() : void {
  //   this.AddSuperviseeEnableValidators();
  //   this.IsVisibleAddSupervisee = true;
  // }

  // public OnSubmitAdd(AddForm: FormGroup) : void {

  //   // stop here if form is invalid
  //   if (this.AddSupervisionForm.invalid) {
  //     this.SupervisionAlertServ.error('Form Invalid');
  //     return;
  //   }

  //   this.SelectedSupervision.Supervisor = this.UserHighestCertification;
  //   this.SelectedSupervision.StartDate = new Date(this.AddSupervisionForm.controls['StartDate'].value);
  //   this.SelectedSupervision.Supervisee = this.AddSupervisionForm.controls['Certification'].value;


  //   if (this.SelectedSupervision && this.SelectedSupervision.Supervisee && this.SelectedSupervision.Supervisee.Id) {
  //     this.SupervisionServ.Create(this.SelectedSupervision.Export())
  //       .pipe()
  //       .subscribe(
  //         (SupervisionNext: IConfirm) => {
  //           if (SupervisionNext && SupervisionNext.Response === 'T') {
  //             this.SupervisionAlertServ.success(SupervisionNext.Message);
  //           }
  //           else {
  //             this.SupervisionAlertServ.error(SupervisionNext.Message);
  //           }
  //         },
  //         SupervisionError => {
  //           this.SupervisionAlertServ.error(SupervisionError);
  //         },
  //         () => { // OnComplete
  //           this.SupervisionServ.ReadSupervisees();
  //           this.SelectedSupervision.Erase();
  //           this.SelectedCertifications.splice(0,this.SelectedCertifications.length);
  //           this.IsSubmitted = false;
  //           this.IsVisibleAddSupervisee = false;
  //         }
  //       )
  //   }
  //   else {
  //     this.SupervisionAlertServ.error("The selected credential holder does not have a certification.");
  //     this.SelectedSupervision.Erase();
  //     this.SelectedCertifications.splice(0,this.SelectedCertifications.length);
  //     this.IsSubmitted = false;
  //     this.IsVisibleAddSupervisee = false;
  //   }
  // }

  // public OnSubmitRemove(RemoveForm: FormGroup) : void {

  //   // stop here if form is invalid
  //   if (this.RemoveSupervisionForm.invalid) {
  //     this.SupervisionAlertServ.error('Form Invalid');
  //     return;
  //   }

  //   this.SelectedSupervision.EndDate = this.RemoveSupervisionForm.controls['EndDate'].value;
  //   this.SelectedSupervision.Reason = this.RemoveSupervisionForm.controls['Reason'].value;
  //   console.log(this.SelectedSupervision.Export());
  //   this.SupervisionServ.Update(this.SelectedSupervision.Export())
  //     .pipe()
  //     .subscribe((UpdateNext: IConfirm) => {
  //       if (UpdateNext && UpdateNext.Response === 'T') {
  //         this.SupervisionAlertServ.success(UpdateNext.Message);
  //       }
  //       else {
  //         this.SupervisionAlertServ.error(UpdateNext.Message);
  //       }
  //     },
  //     UpdateError => {
  //       this.SupervisionAlertServ.error(UpdateError);
  //     },
  //     () => {
  //       this.SupervisionServ.ReadSupervisors();
  //       this.IsVisibleRemoveSupervision = false;
  //       this.SelectedSupervision.Erase();
  //       this.IsSubmitted = false;
  //     });
  // }

}
