import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VoluntaryInactivePeriod, VoluntaryInactiveService } from './voluntary-inactive.service';

import { CertificationService } from '../_services';
import { __GetNetSuiteDate } from '../_helpers';

@Component({
  selector: 'app-voluntary-inactive',
  templateUrl: './voluntary-inactive.component.html',
  styleUrls: ['./voluntary-inactive.component.css']
})
export class VoluntaryInactiveComponent implements OnInit {
  public InputForm: FormGroup;
  constructor(
    private certService: CertificationService,
    private formBuilder: FormBuilder,
    private voluntaryService: VoluntaryInactiveService
  ) { }

  ngOnInit(): void {
    // We just need a form that includes StartDate, EndDate, and Reason (long text form box)
    // It will be nice if we can also have a summary element that displays inactive periods with it's EntityStatus
    // This is likely the only place where this information will be displayed.

    // As always, separate logic into service in it's entirety.

    this.InputForm = this.formBuilder.group({
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      Reason: ['', Validators.required],
    })
  }
  public Save(): void {
    // Just make sure we have it
    this.certService.UpdateCertCycleId();
    this.voluntaryService.Upsert({
      CycleId: this.certService.CertificationCycleId,
      StartDate: (this.InputForm.get("StartDate")).value,
      EndDate: (this.InputForm.get("EndDate")).value,
      Reason: this.InputForm.get("Reason").value
    })

  }
  public Cancel(): void {
    this.InputForm.reset();
  }

}
