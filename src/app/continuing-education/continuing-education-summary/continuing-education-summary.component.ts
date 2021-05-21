import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';

import { ContinuingEducationCredit } from '../../_models/continuing-education-credit';
import { ContinuingEducationService } from '../continuing-education.service';
import { IApplicationQualifications } from '../../_interfaces/i-application-qualifications';
import { IContinuingEducationSubmission } from '../../_interfaces/i-continuing-education-submission';
import { IContinuingEducationSummaryCredit } from '../../_interfaces/i-continuing-education-summary-credit';
import { Observable } from 'rxjs';

@Component({
  selector: 'continuing-education-summary',
  templateUrl: './continuing-education-summary.component.html',
  styleUrls: ['./continuing-education-summary.component.css']
})
export class ContinuingEducationSummaryComponent implements OnInit {

  public SummaryElements: Observable<IContinuingEducationSummaryCredit[]>;
  public SummaryTotals: Observable<number[]>;
  public testElements: Observable<ContinuingEducationCredit[]>;
  public ApplicationQualifications$: Observable<IApplicationQualifications>;
  public get DisplayColumns(): string[] {
    return [
      'Continuing Education Type', 'General Credits',
      'Ethics Credits', 'Supervision Credits', 'Total Credits'
    ]
  }

  constructor(
    private continuingEducationService: ContinuingEducationService
  ) {
    this.SummaryElements = this.continuingEducationService.ContinuingEducationSummary$;
    this.SummaryTotals = this.continuingEducationService.ContinuingEducationTotals$;
    this.testElements = this.continuingEducationService.ContinuingEducation$;
    this.ApplicationQualifications$ = this.continuingEducationService.CertificationApplicationQualifications;
  }

  ngOnInit() {
  }

}

@Pipe({name: 'nonzero'})
export class NonZeroPipe implements PipeTransform {
  transform(values: IContinuingEducationSummaryCredit[]): IContinuingEducationSummaryCredit[] {
    if ( values ) {
      return values?.filter(_value => _value.TotalCredits > 0);
    }
    return [];
  }
}
