import { AlertService, CertificationService } from 'src/app/_services';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfirm, IRequiredType } from 'src/app/_interfaces';

import { BehaviorSubject } from 'rxjs';
import { ContinuingEducationCredit } from '../../../_models/continuing-education-credit';
import { ContinuingEducationService } from '../../continuing-education.service';
import { __GetNetSuiteDate } from 'src/app/_helpers/utility-functions';

@Component({
  selector: 'app-scholarship-review-form',
  templateUrl: './scholarship-review-form.component.html',
  styleUrls: ['./scholarship-review-form.component.css']
})
export class ScholarshipReviewFormComponent implements OnInit {
  // Tell parent component to remove child component from DOM
  @Output() public ClearEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Form Elements
  public InputForm: FormGroup;
  public FileCheck: BehaviorSubject<IConfirm>;
  public FileTypes: IRequiredType[] = [
    {
      Type: {Code:'CEC6', Description:'Scholarship: Review - Supporting Document', Id:'36ee4a8a-2f29-eb11-a813-000d3a5a7103'},
      RequirementMet: 'F'
    },
  ];

  constructor(
    protected alertService: AlertService,
    private certService: CertificationService,
    private continuingEducationService: ContinuingEducationService,
    private formBuilder: FormBuilder,
  ) {
    this.FileCheck = new BehaviorSubject<IConfirm>({
      Response: 'F',
      Message: ''
    });
  }

  ngOnInit() {
    this.InputForm = this.formBuilder.group({
      Provider: ['', Validators.required],
      Title: ['', Validators.required],
      EndDate: ['', Validators.required],
      GeneralCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
      EthicsCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
      SupervisionCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
    })
  }
  private translateForm(): ContinuingEducationCredit {
    return new ContinuingEducationCredit({
      Id: '',
      Type: {Id: '100000005', Value: 'Scholarship: Review'},
      TypeId: '100000005',
      Title: this.InputForm.controls['Title'].value,
      Provider: this.InputForm.controls['Provider'].value,
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
    //   this.alertService.error('Please submit your publication review file first!');
    //   return;
    // }
    this.continuingEducationService.Create(this.translateForm().Export())
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
    this.InputForm.controls['Title'].setValue('');
    this.InputForm.controls['Provider'].setValue('');
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
