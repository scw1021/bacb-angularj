import { Component, OnInit, ViewChild } from '@angular/core';
import { map, tap } from 'rxjs/operators';

import { AccommodationService } from 'src/app/_services/accommodation.service';
import { ApplicationCompletionService } from 'src/app/_services/application-completion.service';
import { ApplicationService } from 'src/app/_services';
import { IApplication } from 'src/app/_interfaces';
import { Link } from '../i-link';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-bcaba',
  templateUrl: './bcaba.component.html',
  styleUrls: ['./bcaba.component.css']
})
export class BcabaComponent implements OnInit {

  @ViewChild('tabGroup') public tabGroup: MatTabGroup;

  private CurrentComponentNumber: number = 1;
  public OnInstructions = false;
  public OnSummary = false;
  private SummaryPage = 10;

  public Check: boolean[] = [];

  public CurrentApplication: IApplication;

  public Links: Link[] = [
    {Path: "./instructions", Title: "Instructions", Index: 0 },
    {Path: "./personal-profile", Title: "Personal Profile", Index: 1 },
    {Path: "./info", Title: "Info Release", Index: 2 },
    {Path: "./professional-info", Title: "Professional", Index: 3 },
    {Path: "./other-credentials", Title: "Other Credentials", Index: 4 },
    {Path: "./education", Title: "Education", Index: 5 },
  ];
  private ExperienceLink: Link = {Path: "./experience", Title: "Experience", Index: 7 };
  private LastLinks: Link[] = [
    {Path: "./attestations", Title: "Attestations", Index: 8 },
    {Path: "./terms", Title: "Terms and Conditions", Index: 9 },
    {Path: "./accommodations", Title: "Accommodations", Index: 12},
    {Path: "./summary", Title: "Summary", Index: null }
  ];


  public activeLink = this.Links[0];
  constructor(
    private completion: ApplicationCompletionService,
    private applicationService: ApplicationService,
    private accomService: AccommodationService,
    private AppRouter: Router
  ) {
    this.accomService.fetchUserAccomodations();
    this.CurrentApplication = this.applicationService.SelectedApplication;
    // Experience not required on retest.
    this.Links = (this.CurrentApplication.AppType.NetSuiteId == '7') ?
     [...this.Links, ...this.LastLinks] : [...this.Links, this.ExperienceLink, ...this.LastLinks];
    // console.log(this.Links)

    this.completion.LoadData();
    combineLatest(this.completion.Check$).pipe(
      map(values => {
        let response = [];
        for (var index in values) {
          response.push(values[index].Response == "T")
        }
        return response;
      }),
      // tap(console.log)
    ).subscribe(
      value => this.Check = value
    );
    // console.warn('option1NgInit', this.CurrentApplication);
  }

  ngOnInit(): void {
    // this.activeLink = this.Links[0];
    // // FIXME - this ought to be slightly better... IE not a hard string
    // this.AppRouter.navigate(['bcaba/instructions'])

    if( !this.CurrentApplication.Id ) {
      this.AppRouter.navigate(['application-home']);
    }
    else {
      this.activeLink = this.Links[0];
      // FIXME - this ought to be slightly better... IE not a hard string
      this.AppRouter.navigate(['bcaba/instructions']);
    }
  }

  public AssignComponent(index: number) {

  }
  public OnPageRoute(navigation : string) {
    this.AppRouter.navigate([navigation]);
  }
  public OnPageChange(NewComponentNumber: number) {
    this.CurrentComponentNumber += NewComponentNumber;
    this.OnInstructions = false;
    this.OnSummary = false;
    // How was this not like, ALREADY HERE?
    if ( this.CurrentComponentNumber <= 0 ) {
      this.CurrentComponentNumber = 0;
      this.OnInstructions = true;
    }
    if ( this.CurrentComponentNumber >= this.SummaryPage ) {
      this.CurrentComponentNumber = this.SummaryPage;
      this.OnSummary = true;
    }
    console.log(this.CurrentComponentNumber, this.SummaryPage);
  }
}
