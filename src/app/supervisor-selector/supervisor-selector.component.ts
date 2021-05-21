import { BehaviorSubject, Subscription } from 'rxjs';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounce, debounceTime, filter, map, tap } from 'rxjs/operators';

import { CustomerService } from '../_services';
import { ICustomerExt } from '../_interfaces';

@Component({
  selector: 'app-supervisor-selector',
  templateUrl: './supervisor-selector.component.html',
  styleUrls: ['./supervisor-selector.component.css']
})
export class SupervisorSelectorComponent implements OnInit, OnDestroy {

  @Output() SelectedSupervisor: EventEmitter<ICustomerExt> = new EventEmitter<ICustomerExt>();

  public formGroup: FormGroup;
  public SelectedCustomer: BehaviorSubject<ICustomerExt> = new BehaviorSubject<ICustomerExt>(null);
  public NumbersOnlyError: {Value: boolean} = {Value: false};
  private Subscriptions: Subscription[] = [];

  constructor(
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
  ) {
    this.formGroup = this.formBuilder.group({
      BACBID: this.formBuilder.control(null, Validators.required),
      Name: this.formBuilder.control(null)
    });
  }

  ngOnInit(): void {
    let customerObservable = this.SelectedCustomer.asObservable().pipe(
      tap(
        customer => {
          this.formGroup.controls['Name'].setValue(customer?.Name)
        }
      )
    );
    let valueObservable = this.formGroup.controls['BACBID'].valueChanges.pipe(
      map( value => '' + value),
      filter( value => {
        this.NumbersOnlyError.Value = false;
        if ( value.length > 7 || value.match(/\D+/) ) {
          this.NumbersOnlyError.Value = true;
          this.SelectedCustomer.next(null);
          return false;
        }
        if ( value?.length < 7 ) {
          // Ignore all numbers without proper length without real issue
          this.SelectedCustomer.next(null);
          return false;
        }
        return true;
      }),
      tap( value => {
        // for all correct values, let's get the user
        this.GetCustomer(value);
      })
    );
    this.Subscriptions.push(customerObservable.subscribe());
    this.Subscriptions.push(valueObservable.subscribe());
  }
  ngOnDestroy(): void {
    this.Subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public AddSupervisor() {
    this.SelectedSupervisor.emit(this.SelectedCustomer.value);
    this.formGroup.controls['BACBID'].setValue(0);
    this.SelectedCustomer.next(null);
  }

  private GetCustomer(value: string): void {
    this.customerService.Customer(value).pipe(
      tap(value => this.SelectedCustomer.next(value))
    ).subscribe();
  }
}
