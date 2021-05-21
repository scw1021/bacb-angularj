import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

import { VoluntaryInactiveService } from '../voluntary-inactive.service';

@Component({
  selector: 'app-voluntary-inactive-summary',
  templateUrl: './voluntary-inactive-summary.component.html',
  styleUrls: ['./voluntary-inactive-summary.component.css']
})
export class VoluntaryInactiveSummaryComponent implements OnInit {
  public SummaryElements: Observable<any> = this.voluntaryService.InactivePeriods$;
  public DisplayColumns: string[] = ['Status', 'Start Date', 'End Date', 'Reason'];
  constructor(
    private voluntaryService: VoluntaryInactiveService
  ) { }

  ngOnInit(): void {
  }

}
