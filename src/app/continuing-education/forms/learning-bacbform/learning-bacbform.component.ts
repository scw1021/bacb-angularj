import { AlertService, CertificationService } from 'src/app/_services';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ContinuingEducationCredit } from '../../../_models/continuing-education-credit';
import { ContinuingEducationService } from '../../continuing-education.service';
import { IConfirm } from 'src/app/_interfaces';
import { __GetNetSuiteDate } from 'src/app/_helpers/utility-functions';

@Component({
  selector: 'app-learning-bacbform',
  templateUrl: './learning-bacbform.component.html',
  styleUrls: ['./learning-bacbform.component.css']
})
export class LearningBACBFormComponent implements OnInit {

  // Tell parent component to remove child component from DOM
  @Output() public ClearEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Form Elements
  public InputForm: FormGroup;

  constructor(
    protected alertService: AlertService,
    private certService: CertificationService,
    private continuingEducationService: ContinuingEducationService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.InputForm = this.formBuilder.group({
      Activity: ['', Validators.required],
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      GeneralCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
      EthicsCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
      SupervisionCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]]
    })
  }

  private translateForm(): ContinuingEducationCredit {
    return new ContinuingEducationCredit();//{
    //   Id: '',
    //   Type: {Id: '3', Value: 'Learning: BACB Activity'},
    //   Title: this.InputForm.controls['Activity'].value,
    //   Provider: 'BACB',
    //   stInitialDate: __GetNetSuiteDate(this.InputForm.controls['StartDate'].value),
    //   stCompletionDate: __GetNetSuiteDate(this.InputForm.controls['EndDate'].value),
    //   stGeneralUnits: this.InputForm.controls['GeneralCredits'].value,
    //   stEthicsUnits: this.InputForm.controls['EthicsCredits'].value,
    //   stSupervisionUnits: this.InputForm.controls['SupervisionCredits'].value,
    //   CertCycle: null,
    // })
  }

  public Save(): void {
    if (this.InputForm.invalid) {
      this.alertService.error('Form is Incomplete!');
      return;
    }
    this.continuingEducationService.Create(
      this.translateForm().Export()
    )
    .subscribe(
      (_response: IConfirm) => {
        if ( _response && _response.Response && _response.Response == 'T' ) {
          this.alertService.success('Continuing Education Credit added!');
          this.CloseForm();
        }
        else {
          this.alertService.error( _response.Message ? _response.Message : 'HTTP request failed!');
        }
      }
    )
  }

  public Cancel(): void {
    // clear form elements
    this.InputForm.controls['Activity'].setValue('');
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
