import { AlertService, CustomerService, ExperienceService } from 'src/app/_services';
import { BehaviorSubject, Observable, Subscription, forkJoin, of } from 'rxjs';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Customer, ExperienceSupervision, ListObject } from 'src/app/_models';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IConfirm, ICustomer, ICustomerExt, IExperienceSupervision, IListObject } from 'src/app/_interfaces';
import { debounceTime, delay, finalize, map, startWith, switchMap, tap } from 'rxjs/operators';

import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'experience-supervision',
  templateUrl: './experience-supervision.component.html',
  styleUrls: ['./experience-supervision.component.css']
})
export class ExperienceSupervisionComponent implements OnInit, OnDestroy {

  @Input() public ExpRepresentationType: IListObject = new ListObject().Export();
  @Input() public ExpSubmittedExpId: Observable<string> = new Observable<string>();
  @Input() public ExpSupervisionArray: BehaviorSubject<IExperienceSupervision[]> = new BehaviorSubject<IExperienceSupervision[]>([]);
  @Output() public SupervisionArrayEmitter: EventEmitter<IExperienceSupervision[]> = new EventEmitter();

  // Member Variable for Add Supervisor Form
  public SupervisionArray: MatTableDataSource<IExperienceSupervision> = new MatTableDataSource<IExperienceSupervision>();
  public Supervision$: Observable<IExperienceSupervision[]>;
  public SupervisionSubscription: Subscription | null = null;

      // Member Variable for Edit Supervisor Form
  public CustomerForm : FormGroup | null = null;
  public IsVisibleEditSuperSubmit : boolean = false;
  public SubmitSubscription: Subscription | null = null;
  public IsSubmitted: boolean = false;
  public IsLoading: boolean = false;

  public constructor(
    private SuperAlertServ: AlertService,
    private SuperCustomerServ: CustomerService,
    private SuperFormBuilder: FormBuilder,
    private ExperienceService: ExperienceService
  ) {

  }

  ngOnInit() {
    this.Supervision$ = this.ExpSupervisionArray.asObservable();
    this.CustomerForm = this.SuperFormBuilder.group({
      BACBID: [''],
      Name: [''],
      IsPrimary: ['']
    });

    this.SubmitSubscription = this.ExpSubmittedExpId.pipe()
    .subscribe(
      (SubmitNext: string) => {
        if (SubmitNext) {
          this.OnSubmit(SubmitNext);
        }
      }
    )

    this.SupervisionSubscription = this.Supervision$.pipe(
      tap(
        (SupervisionList: IExperienceSupervision[]) => {
          this.SupervisionArray.data = SupervisionList;
        })
      ).subscribe();
  }

  ngOnDestroy() {
    this.SupervisionSubscription.unsubscribe();
    this.SubmitSubscription.unsubscribe();
  }

  // Accessors
  public get SelectedSupervisor() : ICustomer {
    return this.CustomerForm.controls['BACBID'].value != null ? this.CustomerForm.controls['BACBID'].value : new Customer().Export();
  }

  public get SupervisorColumns() : string [] {
    return ['Name', 'BACBID','Responsible', 'Actions'];
  }

  // Methods

  public DisplayCustomerFn(SelectedCustomer: ICustomer) : string {
    if (SelectedCustomer != null && SelectedCustomer.Id) {
      return SelectedCustomer.BACBID;
    }
    return "";
  }

  public MarkedAsPrimary(primarySupervision: IExperienceSupervision) {
    let newArray = [];
    console.log('Marked', primarySupervision);
    this.ExpSupervisionArray.value.forEach( supervision => {
      supervision.IsPrimary = supervision.Supervisor.Id == primarySupervision.Supervisor.Id ? 'T' : 'F';
      newArray.push(supervision);
    });
    this.ExpSupervisionArray.next(newArray);
    this.SupervisionArrayEmitter.emit(this.ExpSupervisionArray.value);
  }

  public OnClickAddSupervisor(customer: ICustomerExt) : void {
    console.log(this.ExpRepresentationType)
    if ( this.ExpRepresentationType.Id == '08c049e0-e7db-ea11-a813-000d3a5a1477' &&  this.ExpSupervisionArray.value.length == 1) {
      this.SuperAlertServ.error("An experience entry with a relationship type of Individual can only have one supervisor.", false);
      return;
    }
    console.log(this.ExpSupervisionArray.value, customer)
    if ( this.ExpSupervisionArray.value.filter( supervision => supervision.Supervisor.Id == customer.Id).length ) {
      this.SuperAlertServ.error('You have already added ' + customer.Name + ' as a supervisor.', false);
      return;
    }
    this.ExpSupervisionArray.next( [...this.ExpSupervisionArray.value, {'Id': '', 'ExpId': '', 'Supervisor': customer, 'IsPrimary': 'F'}])
    this.SupervisionArrayEmitter.emit(this.ExpSupervisionArray.value);
  }

  public OnClickDeleteSupervision(RemovedSupervision : IExperienceSupervision) : void {
    RemovedSupervision.MarkedForDeletion = !RemovedSupervision.MarkedForDeletion;
    if ( RemovedSupervision.MarkedForDeletion ) {
      RemovedSupervision.IsPrimary = 'F';
    }
  }

  public OnSubmit(ExperienceId?: string) : void {

    this.IsSubmitted = true;
    this.CustomerForm.markAllAsTouched();
    // stop here if form is invalid
    if (this.CustomerForm.invalid) {
      this.SuperAlertServ.error('Form Invalido');
      return;
    }
    let primary = this.CustomerForm.controls['IsPrimary'].value;
    console.log(primary);
    // Because you can't have s@#$ in Detroit.
    primary = primary == '' ? 0 : primary;
    // console.log('SupervisionToRemove', this.SupervisionToRemove);
    // console.log('ExpSupercisionArray', this.ExpSupervisionArray);
    if (ExperienceId) {
      if (this.ExpSupervisionArray.value.length) {
        let SuccessCount : number = 0;
        let updatedData: IExperienceSupervision[]  = [];
        let AddServiceArray : Observable<IConfirm>[] = [];

        for ( const stIndex in this.ExpSupervisionArray.value) {
          let experience = this.ExpSupervisionArray.value[stIndex];
          experience.ExpId = ExperienceId;
          console.log(stIndex, primary);
          experience.IsPrimary = stIndex == primary ? 'T' : 'F';
          if ( experience.MarkedForDeletion ) {
            AddServiceArray.push(this.ExperienceService.DeleteSupervisor(experience))
          }
          else {
            AddServiceArray.push(this.ExperienceService.CreateSupervisor(experience));
            updatedData.push(experience);
          }
        }
        forkJoin(AddServiceArray)
        .pipe()
        .subscribe(
          (ResultNext : IConfirm[]) => {
            for (let Result of ResultNext) {
              if (Result.Response) {
                SuccessCount++;
              }
            }
          },
          ResultError => {
            this.SuperAlertServ.error(ResultError);
          },
          () => {
            if (SuccessCount === this.SupervisionArray.data.length) {
              this.SuperAlertServ.success("All Supervisors created successfully.")
              this.ExpSupervisionArray.next(updatedData);
              this.ExperienceService.UpdateSupervisionSubject(updatedData);
              // So.. because this is a race condition... we are low key forked.
              this.ExperienceService.Read();
            }
          }
        );
      }
    }
  }
}
