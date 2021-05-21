import { AlertService, CertificationService } from '../_services';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ICertification, IConfirm, IListObject } from '../_interfaces';
import { Observable, Subject, Subscription, concat } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { Certification } from '../_models';
import { ContinuingEducationCredit } from '../_models/continuing-education-credit';
import { ContinuingEducationService } from './continuing-education.service';
import { FileMgmtService } from '../_services/file-mgmt.service';
import { IApplicationQualifications } from '../_interfaces/i-application-qualifications';
import { IContinuingEducationEvent } from '../_interfaces/i-continuing-education-event';

@Component({
  selector: 'app-continuing-education',
  templateUrl: './continuing-education.component.html',
  styleUrls: ['./continuing-education.component.css']
})
export class ContinuingEducationComponent implements OnInit, OnDestroy {

  // Form Elements
  public ContinuingEducationResults: Observable<ContinuingEducationCredit[]>;
  public CurrentCertificationCycle$: Observable<Certification>;
  public ApplicationQualifications$: Observable<IApplicationQualifications>;
  public get DisplayColumns(): string[] {
    return [
      'Continuing Education Type', 'Description', 'Provider', 'Start Date', 'Completion Date',
      'General Credits', 'Ethics Credits', 'Supervision Credits'
    ];
  }
  public ContinuingEducationTypes: IListObject[];
  public ContinuingEducationType: IListObject;
  public AddingNewEducation: boolean = false;
  // Form Component Controls
  public AddLearningBACB: boolean = false;
  public AddLearningCoursework: boolean = false;
  public AddLearningEvent: boolean = false;
  public AddScholarshipPublication: boolean = false;
  public AddScholarshipReview: boolean = false;
  public AddTeachingAce: boolean = false;
  public AddTeachingCoursework: boolean = false;

  // Form Elements
  public ContinuingEducationForm: FormGroup;
  private UpdateContinuingEducationElements$: Subscription;
  private Unsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private alertService: AlertService,
    private certService: CertificationService,
    private continuingEducationService: ContinuingEducationService,
    protected formBuilder: FormBuilder,
    private fileMgmtService: FileMgmtService
  ) {
    this.ContinuingEducationResults = this.continuingEducationService.ContinuingEducation$;
    this.ContinuingEducationTypes = this.continuingEducationService.ContinuingEducationTypes$;
    this.CurrentCertificationCycle$ = this.certService.CurrentCertification$;
    this.ApplicationQualifications$ = this.continuingEducationService.CertificationApplicationQualifications ;
    // this.UpdateContinuingEducationElements$ = this.certService.CurrentCertification$
    // .pipe(
    //   takeUntil(this.Unsubscribe)
    // )
    // .subscribe(
    //   (_cert: Certification) => {
    //     this.continuingEducationService.Read();
    //   }
    // )
  }

  ngOnInit() {
    this.ContinuingEducationForm = this.formBuilder.group({
      CEType: [''],
    });
    this.fileMgmtService.Read();
  }
  ngOnDestroy() {
    // this.UpdateContinuingEducationElements$.unsubscribe();
  }

  public OnClickNew(): void {
    this.AddingNewEducation = true;
  }

  public ClearEvent($event: boolean): void {
    this.AddingNewEducation = false;
    this.AddLearningBACB = false;
    this.AddLearningCoursework = false;
    this.AddLearningEvent = false;
    this.AddScholarshipPublication = false;
    this.AddScholarshipReview = false;
    this.AddTeachingAce = false;
    this.AddTeachingCoursework = false;
  }

  public OnSelectCEType($event): void {
    this.ContinuingEducationType = $event;
    // console.log(this.ContinuingEducationType)
    this.AddLearningBACB = false;
    this.AddLearningCoursework = false;
    this.AddLearningEvent = false;
    this.AddScholarshipPublication = false;
    this.AddScholarshipReview = false;
    this.AddTeachingAce = false;
    this.AddTeachingCoursework = false;
    switch( $event.Id ) {
      case '100000000':
        this.AddLearningEvent = true;
        break;
      case '100000001':
        this.AddLearningCoursework = true;
        break;
      case '100000002':
        this.AddTeachingCoursework = true;
        break;
      case '100000003':
        this.AddTeachingAce = true;
        break;
      case '100000004':
        this.AddScholarshipPublication = true;
        break;
      case '100000005':
        this.AddScholarshipReview = true;
        break;
    }
  }
  // Am I in love with JS? I certainly am when it accepts my calls and returns my promises
  // Too bad I don't use this
  public CreateEvent($event: IContinuingEducationEvent): void {
    // Like literally does this actuall work?
    this.continuingEducationService[$event.stFunction]($event.objRequest)
    .pipe(tap( _response => { console.log(`CEC ${$event.stFunction}: '`, _response) } ))
    .subscribe(
      (_response: IConfirm) => {
        if ( _response && _response.Response ) {
          if (_response.Response == 'T') {
            this.alertService.success(_response.Message);
            // Update the DOM and service elements
            this.continuingEducationService.Read();
            // We should also update our files, as they have now been changed in the MW
            this.fileMgmtService.Read();
          }
          else {
            this.alertService.error(_response.Message);
          }
        }
        else {
          this.alertService.error('Http request failed');
        }
      }
    )
  }
}
