import { AlertService, CertificationService, ModelToolsService } from 'src/app/_services';
import { BehaviorSubject, Observable } from 'rxjs';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfirm, IInstitution, IListObject, IRequiredType } from 'src/app/_interfaces';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';

import { ContinuingEducationCredit } from '../../../_models/continuing-education-credit';
import { ContinuingEducationService } from '../../continuing-education.service';
import { Institution } from 'src/app/_models';
import { __GetNetSuiteDate } from 'src/app/_helpers/utility-functions';

@Component({
  selector: 'app-teaching-ace-form',
  templateUrl: './teaching-ace-form.component.html',
  styleUrls: ['./teaching-ace-form.component.css']
})
export class TeachingAceFormComponent implements OnInit {
  // Tell parent component to remove child component from DOM
  @Output() public ClearEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Form Elements
  public InputForm: FormGroup;
  public FileCheck: BehaviorSubject<IConfirm>;
  public FileTypes: IRequiredType[] = [
    {
      Type: {Code:'CEC4', Description:'Teaching: ACE Event - Supporting Document', Id:'2ff30da9-2f29-eb11-a813-000d3a5a7103'},
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
      ACEProviderId: ['', Validators.required],
      Title: ['', Validators.required],
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      GeneralCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
      EthicsCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
      SupervisionCredits: ['', [Validators.required, Validators.pattern('(^[0-9]{1,3}(.[0|5])?$){1}')]],
    })
  }
  private translateForm(): ContinuingEducationCredit {
    return new ContinuingEducationCredit({
      Id: '',
      Type: {Id: '100000003', Value: 'Teaching: ACE Event'},
      TypeId: '100000003',
      Title: this.InputForm.controls['Title'].value,
      Provider: this.InputForm.controls['ACEProviderId'].value,
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
    //   this.alertService.error('Please submit your required files first!');
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
    this.InputForm.controls['ACEProviderId'].setValue('');
    this.InputForm.controls['Title'].setValue('');
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
