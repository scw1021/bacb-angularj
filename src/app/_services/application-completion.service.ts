import { ApplicationService, AttestationService, EducationService, ExperienceService, ModelToolsService, OtherCredentialsService, PersonalProfileService, ProfessionalInfoService } from '.';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { CONFIRM_SUCCESS, IConfirm, IConfirmDefault } from '../_interfaces';
import { delay, mapTo, shareReplay, tap, withLatestFrom } from 'rxjs/operators';

import { AccommodationService } from './accommodation.service';
import { AlertService } from './alert.service';
import { CheckCompletionService } from '../courseworking/checkCompletion.service';
import { ContinuingEducationService } from '../continuing-education/continuing-education.service';
import { CourseSubmissionService } from '../courseworking/courseSubmission.service';
import { FileMgmtService } from './file-mgmt.service';
import { ICompetency } from '../_interfaces/i-competency';
import { IResponsibleRelationship } from '../_interfaces/i-responsible-relationship';
import { Injectable } from '@angular/core';
import { Link } from '../applications/i-link';
import { RbtApplicationService } from './rbt-application.service';
import { ResponsibleRelationship } from '../_models/responsible-relationship';
import { map } from 'rxjs/internal/operators/map';

export const enum CheckEnum {
  Instructions= 0,
  Personal= 1,
  Info= 2,
  Professional= 3,
  OtherCredential= 4,
  Education= 5,
  Coursework= 6,
  Experience= 7,
  Attestations= 8,
  Terms= 9,
  Research= 10,
  PostDoc= 11,
  Accommodation= 12,
  Training= 13,
  Competency= 14,
  BackgroundCheck= 15,
  ContinuingEducation = 16,
}
@Injectable({
  providedIn: 'root'
})

export class ApplicationCompletionService {
  public Check$: Observable<IConfirm>[] = [];
  public Links$: BehaviorSubject<Link[]> = new BehaviorSubject<Link[]>([]);
  private Links: Observable<Link[]> = this.Links$.asObservable().pipe(shareReplay(1));
  public IssueWithSubmission$: Observable<string>;
  public IssueWithSubmission: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  constructor(
    private applicationService: ApplicationService,
    private attestationService: AttestationService,
    private accommodationService: AccommodationService,
    private courseworkService: CourseSubmissionService,
    private courseCheck: CheckCompletionService,
    private personalService: PersonalProfileService,
    private professionalService: ProfessionalInfoService,
    private otherCredentialService: OtherCredentialsService,
    private educationService: EducationService,
    private experienceService: ExperienceService,
    private fileMgmt: FileMgmtService,
    private rbtService: RbtApplicationService,
    private continuingEducationService: ContinuingEducationService
  ) {
    this.Initialize();

    this.IssueWithSubmission$ = combineLatest(this.Check$).pipe(
      withLatestFrom(this.Links),
      // tap(x=> console.log('CanSubmit$', x)),
      map( ([checks, links]) => {
        let response: string = 'T';
        links.forEach( link => {
          if ( link.Index ) { // skip summary
            if (checks[link.Index].Response == 'F') {
              console.log('IssueWithSubmission$', link.Title + ' is incomplete')
              response = response != 'T' ? response : link.Title + ' is incomplete'; // just do the first one
            }
          }
        });
        this.IssueWithSubmission.next(response);
        return response;
      }),
      shareReplay(1)
    )
  }

  // For elements that are calculated in components after compile, we cite them here
  // so that we can feed these values when required
  public TrainingSubject: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>(IConfirmDefault);
  public CompetencySubject: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>(IConfirmDefault);
  public BackgroundCheckSubject: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>(IConfirmDefault);

  public Initialize(): void {
    // So we want to keep all this as clean as possible so we can maintain checks across all apps
    this.Check$[0] = of(CONFIRM_SUCCESS).pipe(shareReplay(1));
    this.Check$[1] = this.personalService.Check$;
    this.Check$[2] = this.attestationService.CheckObservable('1');
    this.Check$[3] = this.professionalService.Check$;
    this.Check$[4] = this.otherCredentialService.Check$;
    this.Check$[5] = this.educationService.Check$;
    this.Check$[6] = this.courseCheck.TotalCompletion;
    this.Check$[7] = this.experienceService.Check$;
    this.Check$[8] = this.attestationService.CheckObservable('2');
    this.Check$[9] = this.attestationService.CheckObservable('3');
    this.Check$[10] = this.fileMgmt.ResearchCheck;
    this.Check$[11] = this.fileMgmt.PostDocCheck;
    this.Check$[12] = this.accommodationService.Check();
    this.Check$[13] = this.TrainingSubject.asObservable().pipe(shareReplay(1));
    this.Check$[14] = this.CompetencySubject.asObservable().pipe(shareReplay(1));
    this.Check$[15] = this.BackgroundCheckSubject.asObservable().pipe(shareReplay(1));
    this.Check$[16] = of(CONFIRM_SUCCESS).pipe(shareReplay(1));
  }
  public LoadData() {
    // Mouseketeers, 14114A
    this.fileMgmt.ReadApplication();
    this.professionalService.Check();
    this.personalService.Check();
    this.attestationService.ReadQuestions();
    this.attestationService.ReadAnswers();
    this.professionalService.Read();
    this.otherCredentialService.Read();
    this.educationService.Read();
    this.otherCredentialService.Check();
    this.educationService.Check(this.applicationService.CertTypeId);
    // BCBA Only
    if ( this.applicationService.CertTypeId == '1' ) {
      this.experienceService.Read();
      this.experienceService.Check();
      if (this.applicationService.AppTypeId == '1') {
        this.courseworkService.Fetch();
      }
    }
    // RBT Only
    else if ( this.applicationService.CertTypeId == '3' ) {
      this.rbtService.ReadCompetency();
      this.StartRBTCheck(this.rbtService.Competency$, this.fileMgmt.CompetencyCheck, of(CONFIRM_SUCCESS), this.CompetencySubject, 'CompetencyRBTCheck');
      // only for new apps
      if ( this.applicationService.AppTypeId == '1' ) {
        this.rbtService.ReadTraining();
        this.rbtService.ReadBackgroundCheck();
        this.StartRBTCheck(this.rbtService.Trainings$, this.fileMgmt.TrainingCheck, this.attestationService.CheckObservable('4'), this.TrainingSubject, 'TrainingRBTCheck');
        this.StartRBTCheck(this.rbtService.BackgroundCheck$, this.fileMgmt.BackgroundCheck, this.attestationService.CheckObservable('5'), this.BackgroundCheckSubject, 'BackgroundRBTCheck');
      }
    }
  }
  // I forking dislike that ICompetency is used, but like I can only do so much at one time.
  // So HERE WE ARE
  private StartRBTCheck(Relationship: Observable<ResponsibleRelationship>, FileCheck: Observable<IConfirm>,
    Attestation: Observable<IConfirm>, Daddy: BehaviorSubject<IConfirm>, Thing: string) {
    combineLatest([Relationship, FileCheck, Attestation]).pipe(
      delay(0),
      map( checks => {
        console.warn(Thing, checks);
        // let response = [];
        // If the relationship does not have an Azure provided ID we quit
        if (checks[0].Id) {
          if ( checks[1].Response == 'T' && checks[2].Response == 'T' ) {
            return {
              Response: 'T',
              Message: Thing
            } as IConfirm
          }
        }
        return IConfirmDefault;
      })
    ).subscribe(response => {
      // console.error(Thing,response)
      Daddy.next(response); // honestly try me on this nomenclature.
    })
  }

    // this.completionService.Check$[0] = combineLatest([
    //   this.FileCheck.asObservable(),
    //   this.RelationshipCheck.asObservable(),
    //   this.AttestationCheck.asObservable()
    // ]).pipe(
    //   delay(0), // This delay ensures the observable first emits once everything is loaded.
    //   map( (_checks: IConfirm[]) => {
    //     let response = 'T';
    //     _checks.forEach( _check => {
    //       // console.log('Check: ', _check);
    //       if (_check.Response == 'F') {
    //         response = 'F';
    //         //return { Response: 'F', Message: '' } as IConfirm;
    //       }
    //     });
    //     // console.log('C:', response);
    //     return { Response: response, Message: '' } as IConfirm;
    //   })
    // );
    // Technically, this should happen in the Summary component, which is always visible
    // this.rbtService.ReadCompetency(this.InstAppData.AppId$.getValue());
}
type RbtCheck = {Relationship: IConfirm, FileCheck: IConfirm, Attestation: IConfirm}
