import { ApplicationCompletionService, CheckEnum } from 'src/app/_services/application-completion.service';
import { Component, OnInit } from '@angular/core';
import { map, tap } from 'rxjs/operators';

import { AccommodationService } from 'src/app/_services/accommodation.service';
import { ApplicationService } from 'src/app/_services';
import { IApplication } from 'src/app/_interfaces';
import { Link } from '../i-link';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-rbt',
  templateUrl: './rbt.component.html',
  styleUrls: ['./rbt.component.css']
})
export class RbtComponent implements OnInit {
  public Check: boolean[] = [];

  public CurrentApplication: IApplication;

  public Links: Link[] = [
    {Path: "./instructions", Title: "Instructions", Index: CheckEnum.Instructions },
    {Path: "./personal-profile", Title: "Personal Profile", Index: CheckEnum.Personal },
    {Path: "./info", Title: "Info-Release", Index: CheckEnum.Info },
    {Path: "./professional-info", Title: "Professional", Index: CheckEnum.Professional },
    {Path: "./other-credentials", Title: "Other Credentials", Index: CheckEnum.OtherCredential },
  ];
  private NewPtOne: Link = {Path: "./training", Title: "40HR Training", Index: CheckEnum.Training };
  private Competency: Link = {Path: "./competency", Title: "Competency", Index: CheckEnum.Competency };
  private NewPartTwo: Link[] = [
    {Path: "./education", Title: "Education", Index: CheckEnum.Education },
    {Path: "./backgroundcheck", Title: "Background Check", Index: CheckEnum.BackgroundCheck },
  ];

  private LastLinks: Link[] = [
    {Path: "./attestations", Title: "Attestations", Index: CheckEnum.Attestations },
    {Path: "./terms", Title: "Terms and Conditions", Index: CheckEnum.Terms },
    {Path: "./accommodations", Title: "Accommodations", Index: 12},
    {Path: "./summary", Title: "Summary", Index: null }
  ];


  /// Issues OC bypass doesn't work
  // RBT base tabs need submission confirmation
  // NeW rEqUiReMeNtS! - 40hr has start and end validator, <6mo apart
  // ACCO
  public activeLink = this.Links[0];
  constructor(
    public completion: ApplicationCompletionService,
    private applicationService: ApplicationService,
    private applicationCompletion: ApplicationCompletionService,
    private accomService: AccommodationService,
    private AppRouter: Router
  ) {
    this.CurrentApplication = this.applicationService.SelectedApplication;
    this.accomService.fetchUserAccomodations();
    if ( this.applicationService.AppTypeId == '1' ) { // if new cert
      this.Links = [...this.Links, this.NewPtOne, this.Competency, ...this.NewPartTwo, ...this.LastLinks];
    }
    else if ( this.applicationService.AppTypeId == '4') {
      // renewal, technically #4 in NS
      this.Links = [...this.Links, this.Competency, ...this.LastLinks];
    }
    else {
      // RETAKE
      this.Links = [...this.Links, ...this.LastLinks];
    }

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
  }

  ngOnInit(): void {
    // this.activeLink = this.Links[0];
    // // FIXME - this ought to be slightly better... IE not a hard string
    // this.AppRouter.navigate(['rbt/instructions'])

    if( !this.CurrentApplication.Id ) {
      this.AppRouter.navigate(['application-home']);
    }
    else {
      this.activeLink = this.Links[0];
      // FIXME - this ought to be slightly better... IE not a hard string
      this.AppRouter.navigate(['rbt/instructions']);
    }
  }

}
