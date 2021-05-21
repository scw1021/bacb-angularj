import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ICertification, ICertType, IListObject, ISupervision } from '../_interfaces';
import { Certification, CertType, Customer, ListObject } from '../_models';
import { AlertService, ModelToolsService } from '../_services';
import { SupervisionService } from '../_services/supervision.service';
import { DigitsOnly } from '../_validators';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { HasName, IfOtherEnterOther, IsBACBID} from '../_validators/supervision-validators';
import { RemoveSupervisorWarningComponent } from './remove-supervisor-warning/remove-supervisor-warning.component';
import { ThrowStmt } from '@angular/compiler';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-supervision-tools',
  templateUrl: './supervision-tools.component.html',
  styleUrls: ['./supervision-tools.component.css']
})
export class SupervisionToolsComponent implements OnInit, OnDestroy {

  public noActionColumns = [
    "Name",
    "BACB ID",
    "Certification Type",
    "Status",
    "Date Added"
  ]
  public allCols = [
    "Name",
    "BACB ID",
    "Certification Type",
    "Status",
    "Date Added",
    "Actions"
  ];

  public showAddSupervisee: boolean = false;
  public showRemoveSupervisee: boolean = false;
  public oneCurrentSupervisorLeft: boolean = false;
  private formValue: IAddSupervisor;
  private subs: Subscription[] = [];
  public currentSupervisorsData$: Observable<IFlatSupervision[]>;
  public previousSupervisorsData$: Observable<IFlatSupervision[]>;
  public currentSuperviseesData$: Observable<IFlatSupervision[]>;
  public previousSuperviseesData$: Observable<IFlatSupervision[]>;
  public reasonsForRemovingSupervisee: Observable<IListObject[]>
  public certTypes: ICertType[];
  public highestLevelCert: ICertification;
  public _devShowTestInfo = false;
  public addSuperviseeForm: FormGroup;
  public removeSuperviseeForm: FormGroup;
  constructor(private supervisionService: SupervisionService,
              private formBuilder: FormBuilder,
              private alertServ: AlertService,
              private modelToolsService: ModelToolsService,
              public dialog: MatDialog) { }
  ngOnDestroy(): void {
    this.subs.forEach((subscription)=> subscription.closed? null: subscription.unsubscribe())
  }

  ngOnInit(): void {
    this.reasonsForRemovingSupervisee = this.supervisionService.ReasonsForRemoval$;
    this.subs.push( this.supervisionService.UserHighestCert$.subscribe((highestCert) => {
      this.highestLevelCert = highestCert
    }));
    this.certTypes = this.modelToolsService.CertType$;
    this.addSuperviseeForm = this.formBuilder.group({
      SuperviseeBacbId: this.formBuilder.control(null, [IsBACBID(), DigitsOnly(), Validators.required]),
      SuperviseeName: this.formBuilder.control(null),
      SuperviseeContactId: this.formBuilder.control(null),
      StartDate: this.formBuilder.control(null, Validators.required),
      SuperviseeCertTypeId: this.formBuilder.control(null, Validators.required),
      SuperviseeCertId: this.formBuilder.control(null)
    }, {validators: HasName})

    this.addSuperviseeForm.valueChanges.subscribe((value) => {
      this.formValue = value;
    })
    this.addSuperviseeForm.get('SuperviseeName').disable();

    this.removeSuperviseeForm = this.formBuilder.group({
       SupervisionId: this.formBuilder.control(null, Validators.required),
       Reason: this.formBuilder.control(null, Validators.required),
       OtherReason: this.formBuilder.control(null),
       EndDate: this.formBuilder.control(null, Validators.required)
    }, {validators: IfOtherEnterOther})

    this.currentSupervisorsData$ =  this.supervisionService.Supervisors$
     .pipe(
       map((supervisions, index) =>
       {
        return supervisions.reduce((result, supervision) => {
          if(supervision?.Status?.InternalId != "48"){
            result.push(supervision)
          }
          return result;
        }, [])
      }
      ),
       map<ISupervision[], IFlatSupervision[]>((supervisions) =>
       supervisions.map<IFlatSupervision>((supervison) =>{
        return this.flattenSupervision(supervison, "ShowSupervisor")
      })
      ),
      tap((res) => {
        console.log("Current supervisors", res)
        if(res.length == 1){this.oneCurrentSupervisorLeft = true}
         else{ this.oneCurrentSupervisorLeft = false}})
    )

  this.previousSupervisorsData$ =  this.supervisionService.Supervisors$
     .pipe(
       map((supervisions, index) =>
       {
        return supervisions.reduce((result, supervision) => {
          if(supervision?.Status?.InternalId == "48"){
            result.push(supervision)
          }
          return result;
        }, [])
      }
      ),
       map<ISupervision[], IFlatSupervision[]>((supervisions) =>
       supervisions.map<IFlatSupervision>((supervison) =>{
          return this.flattenSupervision(supervison, "ShowSupervisor");
        })
      )
    )
  this.previousSuperviseesData$ =  this.supervisionService.Supervisees$
    .pipe(
      map((supervisions, index) =>
      {
       return supervisions.reduce((result, supervision) => {
         if(supervision?.Status?.InternalId == "48"){
           result.push(supervision)
         }
         return result;
       }, [])
     }
     ),
      map<ISupervision[], IFlatSupervision[]>((supervisions) =>
      supervisions.map<IFlatSupervision>((supervison) =>{
         return this.flattenSupervision(supervison, "ShowSupervisee");
       })
     )
   )

  this.currentSuperviseesData$ =  this.supervisionService.Supervisees$
    .pipe(
      map((supervisions, index) =>
      {
       return supervisions.reduce((result, supervision) => {
         if(supervision?.Status?.InternalId != "48"){
           result.push(supervision)
         }
         return result;
       }, [])
     }
     ),
      map<ISupervision[], IFlatSupervision[]>((supervisions) =>
      supervisions.map<IFlatSupervision>((supervison) =>{
         return this.flattenSupervision(supervison, "ShowSupervisee");
       })
     )
   )
  }

  /**@description Flattens the ISupervision data into a IFlatSupervision to reduce clutter and remove accessing deep properties in the template */
  private flattenSupervision(supervision: ISupervision,  supervisorOrSupervisee: "ShowSupervisee" | "ShowSupervisor"): IFlatSupervision{

    if(supervisorOrSupervisee == "ShowSupervisor"){
      return{
        SupervisionId: supervision?.Id,
        Name: supervision?.Supervisor?.Contact?.Name,
        BACBID: supervision?.Supervisor?.Contact?.BACBID,
        CertificationType: supervision?.Supervisee?.Type?.Name,
        Status: supervision?.Status?.ExternalName,
        Actions: supervision?.Reason,
        Type: supervision?.Supervisor?.Type?.Name,
        StartDate: supervision?.StartDate,
        EndDate: supervision?.EndDate
      }
    } else if (supervisorOrSupervisee == "ShowSupervisee") {
      return{
        SupervisionId: supervision?.Id,
        Name: supervision?.Supervisee?.Contact?.Name,
        BACBID: supervision?.Supervisee?.Contact?.BACBID,
        CertificationType: supervision?.Supervisee?.Type?.Name,
        Status: supervision?.Status?.ExternalName,
        Actions: supervision?.Reason,
        Type: supervision?.Supervisor?.Type?.Name,
        StartDate: supervision?.StartDate,
        EndDate: supervision?.EndDate
      }
    }

  }

  onClickAddSupervisee(){
    this.showAddSupervisee = true;
  }

  onClickVerify(){
    console.log(this.formValue);
    this.supervisionService.getSingleCustomerFromBACBID(this.formValue.SuperviseeBacbId, this.formValue.SuperviseeCertTypeId)
    .subscribe(
      (customerAndCertId) => {
        this.addSuperviseeForm.get('SuperviseeName').patchValue(customerAndCertId[0].Name)
        this.addSuperviseeForm.get('SuperviseeContactId').patchValue(customerAndCertId[0].Id)
        this.addSuperviseeForm.get('SuperviseeCertId').patchValue(customerAndCertId[1])
      },
      (err) => {
        this.alertServ.error(err.error)
      }
    )

  }
  _devShowTesterTools(){
    this._devShowTestInfo = !this._devShowTestInfo;
  }
  onClickRemoveSupervision(flatSupervisionToRemove: IFlatSupervision){

     console.log("Flat Supervision", flatSupervisionToRemove)
     this.supervisionService.removeSupervision(flatSupervisionToRemove.SupervisionId).subscribe(
       (success) => {
         this.supervisionService.refetchData("Supervisors")
         this.supervisionService.refetchData("Supervisees")
       },
       (error) => {this.alertServ.alert("Supervision Failed to delete. Please try again later")}
     );
  }
  onClickRemoveSupervisee(Supervision: IFlatSupervision){
    this.removeSuperviseeForm.get("SupervisionId").setValue(Supervision.SupervisionId);
    this.showRemoveSupervisee = true
  }

  onClickCancelRemoveSupervisee(){
    this.showRemoveSupervisee = false
    this.removeSuperviseeForm.reset();
  }
  onClickConfirmRemoveSupervisee(){
    console.log(this.removeSuperviseeForm.value)
    this.supervisionService.removeSupervisee(this.removeSuperviseeForm.value).subscribe(
      (success) => {
        this.supervisionService.refetchData("Supervisees")
      },
      (error) => {this.alertServ.alert("Supervisee Failed. Please try later")}
      );
  }
  onClickRemoveSupervisor(flatSupervisionToRemove: IFlatSupervision){

    if(this.oneCurrentSupervisorLeft){


      const dialogRef = this.dialog.open(RemoveSupervisorWarningComponent,{
        width: '50rem',
      })

      const res = dialogRef.afterClosed().subscribe((result: boolean) => {
        if(result) {this.onClickRemoveSupervision(flatSupervisionToRemove)};
      });
      this.subs.push()
    } else {
      this.onClickRemoveSupervision(flatSupervisionToRemove)
    }

  }

  onClickCancelAddSupervisee(){
    this.showAddSupervisee = false;
    this.addSuperviseeForm.reset();
  }

  onSubmitAddSupervisee(){
    let supervisionToCreate = <ICreateSupervision>{
      StartDate: this.formValue.StartDate,
      SuperviseeId: this.formValue.SuperviseeCertId,
      SupervisorId: this.highestLevelCert.Id,
      // The Guid for a default supervision active
      StatusId: "5a66aa31-26d0-ea11-a812-000d3a5a1477"
    }
    this.supervisionService.addSupervision(supervisionToCreate).subscribe(
      (createResult) => {
        // this.alertServ.success("It worked")
        this.supervisionService.refetchData("Supervisees")
        this.showAddSupervisee = false;
      },
      (creationFailed) => {this.alertServ.alert("An error occured when creating this supervision. Please try again later.")},
    )
  }

}


export interface IFlatSupervision {
  SupervisionId: string,
  Name: string,
  BACBID: string,
  CertificationType: string,
  Status: string,
  StartDate: string,
  EndDate: string,
  Actions: string,
  Type: string,
}

export interface ICreateSupervision{
  StartDate: Date,
  SupervisorId: string,
  SuperviseeId: string,
  StatusId: string,
}
export interface IAddSupervisor{
  SuperviseeBacbId: string,
  SuperviseeCertTypeId: string,
  SuperviseeCertId: string,
  StartDate: Date,
  Name: string,
}

export interface IRemoveSupervisor{
  SupervisionId: string,
  Reason: string,
  OtherReason: string,
  EndDate: Date,
}
