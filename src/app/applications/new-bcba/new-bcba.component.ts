import { ApplicationCompletionService, CheckEnum } from 'src/app/_services/application-completion.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { map, tap } from 'rxjs/operators';

import { AccommodationService } from 'src/app/_services/accommodation.service';
import { ApplicationService } from 'src/app/_services';
import { IApplication } from 'src/app/_interfaces';
import { Link } from '../i-link';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-new-bcba',
  templateUrl: './new-bcba.component.html',
  styleUrls: ['./new-bcba.component.css']
})
export class NewBcbaComponent implements OnInit {

  @ViewChild('tabGroup') public tabGroup: MatTabGroup;

  private CurrentComponentNumber: number = 0;
  public OnInstructions = true;
  public OnSummary = false;
  private SummaryPage = 10;

  public Check: boolean[] = [];

  public CurrentApplication: IApplication;

  public Links: Link[] = [
    {Path: "./instructions", Title: "Instructions", Index: CheckEnum.Instructions },
    {Path: "./personal-profile", Title: "Personal Profile", Index: CheckEnum.Personal },
    {Path: "./info", Title: "Info Release", Index: CheckEnum.Info },
    {Path: "./professional-info", Title: "Professional", Index: CheckEnum.Professional },
    {Path: "./other-credentials", Title: "Other Credentials", Index: CheckEnum.OtherCredential },
    {Path: "./education", Title: "Education", Index: CheckEnum.Education },
  ];
  private Coursework: Link = {Path: "./coursework", Title: "Coursework", Index: CheckEnum.Coursework };
  private Research: Link = {Path: "./research", Title: "Research Experience", Index: CheckEnum.Research };
  private PostDoc: Link = {Path: "./postdoc", Title: "Post Doc Experience", Index: CheckEnum.PostDoc };
  private ContinuingEducation: Link = {Path: "./continuing-education", Title: "Continuing Education", Index: CheckEnum.ContinuingEducation}
  private ExperienceLink: Link = {Path: "./experience", Title: "Experience", Index: CheckEnum.Experience };
  private LastLinks: Link[] = [
    {Path: "./attestations", Title: "Attestations", Index: CheckEnum.Attestations },
    {Path: "./terms", Title: "Terms and Conditions", Index: CheckEnum.Terms },
    {Path: "./accommodations", Title: "Accommodations", Index: CheckEnum.Accommodation},
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
    var middleLink: Link;
    switch (this.CurrentApplication.AppType.NetSuiteId) {
      case '1':
        middleLink = this.Coursework;
        break;
      case '2':
        middleLink = this.Research;
        break;
      case '3':
        middleLink = this.PostDoc;
        break;
      case '6':
        middleLink = this.ContinuingEducation;
        break;
    }
    // Experience is required on all non-retake applications
    this.Links = middleLink ?
      [...this.Links, middleLink, this.ExperienceLink, ...this.LastLinks] :
      [...this.Links, ...this.LastLinks];
    console.log(this.Links)
    this.completion.Links$.next(this.Links);
    this.SummaryPage = this.Links.length - 1;



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
    console.warn('option1NgInit', this.CurrentApplication);
  }

  ngOnInit(): void {
    // Just go back if it's a refresh and we don't have application information
    if( !this.CurrentApplication.Id ) {
      this.AppRouter.navigate(['application-home']);
    }
    else {
      this.activeLink = this.Links[0];
      // FIXME - this ought to be slightly better... IE not a hard string
      this.AppRouter.navigate(['bcba/instructions']);
    }
  }

  public AssignComponent(index: number) {

  }
  public OnPageRoute(navigation : string) {
    console.log(navigation)
    this.AppRouter.navigate([navigation]);
  }
  public OnRouteClick(link: Link, $event) {
    this.activeLink = link;
    this.CurrentComponentNumber = link.Index;
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
    this.activeLink = this.Links[this.CurrentComponentNumber];
    // console.log(this.Links[this.CurrentComponentNumber].Path, this.CurrentComponentNumber, this.SummaryPage);
    this.OnPageRoute( 'bcba/' + this.Links[this.CurrentComponentNumber].Path.substring(2) );
  }
}
