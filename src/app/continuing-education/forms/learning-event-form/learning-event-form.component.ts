import { AlertService, CertificationService } from 'src/app/_services';
import { BehaviorSubject, Observable } from 'rxjs';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfirm, IListObject, IRequiredType } from 'src/app/_interfaces';

import { ContinuingEducationCredit } from '../../../_models/continuing-education-credit';
import { ContinuingEducationService } from '../../continuing-education.service';
import { __GetNetSuiteDate } from 'src/app/_helpers/utility-functions';

@Component({
  selector: 'app-learning-event-form',
  templateUrl: './learning-event-form.component.html',
  styleUrls: ['./learning-event-form.component.css']
})
export class LearningEventFormComponent implements OnInit {
  // Tell parent component to remove child component from DOM
  @Output() public ClearEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Form Elements
  public InputForm: FormGroup;
  public EventFormatTypes: IListObject[];
  public FileCheck: BehaviorSubject<IConfirm>;
  public FileTypes: IRequiredType[] = [{
    Type: {Code:'CEC1', Description:'Learning: ACE Event Certificate of Completion', Id:'3ad7dc64-2f29-eb11-a813-000d3a5a7103'},
    RequirementMet: 'F'
  }];

  constructor(
    protected alertService: AlertService,
    private certService: CertificationService,
    private continuingEducationService: ContinuingEducationService,
    private formBuilder: FormBuilder,
  ) {
    this.EventFormatTypes = this.continuingEducationService.EventTypes$;
    this.FileCheck = new BehaviorSubject<IConfirm>({
      Response: 'F',
      Message: ''
    });
  }

  ngOnInit() {
    this.InputForm = this.formBuilder.group({
      EventTitle: ['', Validators.required],
      Format: ['', Validators.required],
      ACEProviderId: ['', Validators.required],
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      EventLength: [''],
      GeneralCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
      EthicsCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
      SupervisionCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
    })
  }

  private translateForm(): ContinuingEducationCredit {
    return new ContinuingEducationCredit({
      Id: '',
      Type: {Id: '100000000', Value: 'Learning: ACE Event'},
      TypeId: '100000000',
      Title: this.InputForm.controls['EventTitle'].value,
      Provider: '' ,//this.InputForm.controls['Instructor'].value,
      ProviderId: this.InputForm.controls['ACEProviderId'].value,
      StartDate: __GetNetSuiteDate(this.InputForm.controls['StartDate'].value),
      CompletionDate: __GetNetSuiteDate(this.InputForm.controls['EndDate'].value),
      GeneralUnits: this.InputForm.controls['GeneralCredits'].value,
      EthicsUnits: this.InputForm.controls['EthicsCredits'].value,
      SupervisionUnits: this.InputForm.controls['SupervisionCredits'].value,
      CertCycle: null,
    })
  }
  public FileEvent(event: IConfirm): void {
    this.FileCheck.next(event);
  }

  public Save(): void {
    if (this.InputForm.invalid) {
      this.alertService.error('Form is Incomplete!');
      return;
    }
    // if ( this.FileCheck.value.Response != 'T' ) {
    //   this.alertService.error('Please submit your completion certificate first!');
    //   return;
    // }
    this.continuingEducationService.Create(
      this.translateForm().Export()
    )
    .subscribe(
      (_response: IConfirm) => {
        if ( _response && _response.Response && _response.Response == 'T' ) {
          this.alertService.success('Continuing Education Credit added!');
          this.CloseForm();
          this.continuingEducationService.Read();
        }
        else {
          this.alertService.error( _response.Message ? _response.Message : 'HTTP request failed!');
        }
      }
    )
  }

  public Cancel(): void {
    // clear form elements
    this.InputForm.controls['Format'].setValue('');
    this.InputForm.controls['ACEProviderId'].setValue('');
    this.InputForm.controls['EventLength'].setValue('');
    this.InputForm.controls['EventTitle'].setValue('');
    this.InputForm.controls['StartDate'].setValue('');
    this.InputForm.controls['EndDate'].setValue('');
    this.InputForm.controls['GeneralCredits'].setValue('');
    this.InputForm.controls['EthicsCredits'].setValue('');
    this.InputForm.controls['SupervisionCredits'].setValue('');
    // close form
    this.ClearEvent.emit(true);
  }
  public CloseForm(): void {
    this.ClearEvent.emit(true);
  }

}
