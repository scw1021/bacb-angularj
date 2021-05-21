import { AlertService, ApplicationService, CourseworkService, EducationService, OtherCredentialsService, PersonalProfileService } from '../../_services';
import { AppData, ComponentData, Course } from '../../_models';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { CONFIRM_SUCCESS, IConfirm, ICourse, ICourseworkFull, IDegree, IOtherCredential } from '../../_interfaces';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { combineAll, first, map, tap } from 'rxjs/operators';

import { ApplicationCompletionService } from 'src/app/_services/application-completion.service';
import { Behavior } from 'popper.js';
import {CheckEnum} from '../../_services/application-completion.service';
import { CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';
import { CzechService } from 'src/app/_services/czech-service.service';
import { Link } from 'src/app/applications/i-link';
import { Service } from '../../_services/deployable.service';

@Component({
  selector: 'summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  // @Input() public InstComponentData : ComponentData;
  // @Input() public InstAppData : AppData;
  @Input() public CanEditSummary: boolean = true;
  @Output() public SectionEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() public PageEmitter: EventEmitter<string> = new EventEmitter<string>();
  public EditPageNumber: number | null = null;
  private Coursework$: Observable<ICourseworkFull[]> = this.CourseworkServ.Coursework$;
  private Degrees$: Observable<IDegree[]> = this.EducationServ.Degree$;
  private Credentials$: Observable<IOtherCredential[]> = this.CredentialServ.OtherCredential$;
  public CertType: string = '';
  public AppType: string = '';
  public Check$: Observable<IConfirm>[];
  public IssueWithSubmission$: Observable<string>;
  // public CanSubmit$: Observable<boolean>;
  @Output() EditEventTriggered: EventEmitter<number> = new EventEmitter<number>();
  // public get BaseAppData() : AppData {
  //   return this.InstAppData;
  // }
  // public get InstAppId(): string {
  //   return this.InstAppData.AppId$.value;
  // }
  public constructor(
    private AppService: ApplicationService,
    private completion: ApplicationCompletionService,
    private alertService: AlertService,
    private CourseworkServ: CourseworkService,
    private EducationServ: EducationService,
    private CredentialServ: OtherCredentialsService,
    // private PersonalServ: PersonalProfileService,
    private deployable: Service,
    private router: Router,
    // public czechService: CzechService
    ) {
      this.AppType = this.AppService.AppTypeId;
      this.CertType = this.AppService.CertTypeId;
      this.Check$ = this.completion.Check$;
    }

  public ngOnInit() {
    this.CertType = this.AppService.CertTypeId;
    this.IssueWithSubmission$ = this.completion.IssueWithSubmission$;
    // this.CanSubmit$ = combineLatest(this.Check$).pipe(
    //   map<IConfirm[], boolean>( values => {
    //     let response = true;
    //     this.completion.AvailableLinks.forEach( link => {
    //       if ( values[link.Index]?.Response == 'F' ) {
    //         console.log('Invalid Check at ', link);
    //         response = false;
    //       }
    //     })
    //     return response;
    //   })
    // );
  }

  public ResearchExperienceFileTypes = [
    {Code:'LOA2',Description:'Letter of Attestation (BCBA Option 2)',     id:11,detected:false},
    {Code:'SYL2',Description:'Teaching/Research Syllabus (BCBA Option 2)',id:14,detected:false},
    {Code:'CVR2',Description:'Curriculum Vitae or Resume (BCBA Option 2)',id:13,detected:false},
    {Code:'RAR2',Description:'Research Article (BCBA Option 2)',          id:12,detected:false},
  ];
  public PostDocExperienceFileTypes = [
    {Code:'LOA3',Description:'Letter of Attestation (BCBA Option 3)',     id:16,detected:false},
    {Code:'PCE3',Description:'Professional Credential of Employee (BCBA Option 3)',id:17,detected:false},
    {Code:'CVR3',Description:'Curriculum Vitae or Resume (BCBA Option 3)',id:18,detected:false},
  ]
  public OnEditChange(PageNumber: number) {
    this.EditPageNumber = PageNumber;
    this.EditEventTriggered.emit(PageNumber);
  }
  // public Check(Index: number): Observable<string> {
  //   return this.BaseAppData.Check[Index].pipe(
  //     map( (_confirm: IConfirm) => {
  //       if ( _confirm.Response == 'T') {
  //         return 'Complete';
  //       }
  //       else {
  //         return 'Incomplete';
  //       }
  //     })
  //   );
  // }
  public Czech( index: number ): Observable<string> {
    return this.completion.Check$[index].pipe(
      map( (protests: IConfirm) => {
        if ( protests ) {
          return protests.Response == 'T' ? 'Completed' : 'Incomplete'
        }
        else {
          return 'Incomplete';
        }

      })
    )
  }
  public OnPageChange($event){
    this.PageEmitter.emit($event);
  }
  public OnClickSubmit() {
    /// Overview of Function -
    // 1. Ensure that checks are completed - x
    //  1.1 - 'Failed to Complete' alerts specified for each section - x
    // 2. Formally save all information shared across applications
    //  2.1 - How should errors be handled? Presumably it should stop the process
    // 3. Set Submission date for the application
    // 4. Navigate to Payment
    //  4.1 - And then of course actually make the payment page.

    // Check Completion
    if ( this.completion.IssueWithSubmission.value != 'T' ) {
      this.alertService.error(this.completion.IssueWithSubmission.value);
      return;
    }



    // let _incomplete = false;

    // this.completion.Check$.forEach(_check => {
    //   _check.subscribe(
    //     (_value: IConfirm) => {
    //       console.log(`Section Check Value: ${JSON.stringify(_value)}`);
    //       // So we kind of don't have a good way of evaluating which Attestation elements are
    //       // not finished, but this Summary component is BCBA only, so there are only three
    //       // options anyway
    //       if ( _value.Response == 'F' ) {
    //         _incomplete = true;
    //         // Check for attestation section failures, because they need specific messages
    //         if ( _value.Message == '1' ) {
    //           this.alertService.error('Information Release is not completed!');
    //         }
    //         else if ( _value.Message == '2' ) {
    //           this.alertService.error('Attestations are not completed!');
    //         }
    //         else if ( _value.Message == '3' ) {
    //           this.alertService.error('Terms and Conditions are not accepted');
    //         }
    //         else {
    //           this.alertService.error('Application is not complete! ' + _value.Message );

    //         }
    //         return;
    //       }
    //     },
    //     CheckError => {
    //       this.alertService.error('Application is not complete! Server Request Failed.');
    //       console.log(`Summary Check Error: ${JSON.stringify(CheckError)}`);
    //     },
    //     () => {


    //     }
    //   )
    // });


    // if ( this.CanSubmit$.value ) {
      // Permanently Save Coursework, Education, and Other Credentials
      this.SubmitAll();
    // }
    // this.SubmitAll();


    /// For full functionality the following tasks must be completed
    // 1 - All tables and information for submitted applications must be managed
    //     in an unalterable state upon application review
    // 2 - Deletion of all application elements shared across applications must
    //     must have logic implemented to prevent deletion after submission
    // 3 - Multiple open applications must be prevented
    // 4 - Shared informations must have applicable fields for NetSuite checkbox
  }
  private SubmitAll() {
    // Permanently Save Coursework, Education, and Other Credentials
    // I've set this up for ease of debugging, so multiple helper functions

    // this._submitCoursework();
    // this._submitDegrees();
    // this._submitCredentials();
    this._submitApplication();

    // Navigate to Payment Page - FIXME, it's better while it doens't work to send to app-home
    // Second note, when this get changed to PAYMENT, you need to ensure appID makes the route
    this.router.navigate(['application-home']);
  }

  private _submitCoursework() {
    // this.CourseworkServ.Read(this.InstAppId);
    // console.log(`Submitting Coursework -start-`);
    let coursesRequest = {
      AppId: this.AppService.AppId,
      Coursework: [],
      NumCourses: 0
    };
    // All Sumissions can happen simultaneously, so let's pipe them individually
    this.Coursework$.pipe(
      // tap (console.log),
      first(),
      tap( ( _courses: ICourseworkFull[] ) => {
        _courses.forEach( (_course: ICourseworkFull) =>{
          coursesRequest.Coursework.push(_course.Id);
          coursesRequest.NumCourses++;
        });
        // console.log(`Submitting Coursework: ${JSON.stringify(coursesRequest)}`);
        this.CourseworkServ.Submit(coursesRequest);
      })
    ).subscribe(
      (_value) => console.log,
      CourseError => {
        this.alertService.error(JSON.stringify(CourseError));
      },
      () => {
        // Once we have the ID's submit it to the server using our service
        this.alertService.success('Coursework Submitted');
      }
    );
    // console.log(`Submitting Coursework -end-`);
  }
  private _submitDegrees() {
    let degreesRequest = {
      AppId: this.AppService.AppId,
      Degrees: [],
      NumDegrees: 0
    }

    this.Degrees$.pipe(
      first(),
      tap( (_degrees: IDegree[] ) => {
        _degrees.forEach( (_degree: IDegree) => {
          degreesRequest.Degrees.push(_degree.Id);
          degreesRequest.NumDegrees++;
        });
        this.EducationServ.Submit(degreesRequest);
      })
    ).subscribe(
      (_value) => console.log,
      DegreeError => {
        this.alertService.error(JSON.stringify(DegreeError));
      },
      () => {
        // Once we have the ID's submit it to the server using our service
        this.alertService.success('Degrees Submitted');
      }
    );
  }
  private _submitCredentials() {
    let credentialsRequest = {
      AppId: this.AppService.AppId,
      Credentials: [],
      NumCredentials: 0
    }

    this.Credentials$.pipe(
      first(),
      tap( (_creds: IOtherCredential[] ) => {
        _creds.forEach( (_cred: IOtherCredential) => {
          credentialsRequest.Credentials.push(_cred.Id);
          credentialsRequest.NumCredentials++;
        });
        this.CredentialServ.Submit(credentialsRequest);
      })
    ).subscribe(
      (_value) => console.log,
      CredError => {
        this.alertService.error(JSON.stringify(CredError));
      },
      () => {
        // Once we have the ID's submit it to the server using our service
        this.alertService.success('Other Credentials Submitted');
      }
    );
  }
  private _submitApplication() {
    // Set submission date and save to NetSuite
    let date = new Date();
    let submissionDateStr = '' + (1 + date.getMonth()) + '/' + date.getDate() + '/' + date.getFullYear();
    console.log(submissionDateStr);

    let invoiceSubmission = {
      AppId: this.AppService.AppId,
      CertType: this.CertType,
      DoctoralDesignation: 'F',
      FeeType: 'New Certification' // FIXME - needs to include Option for BCBA 2&3, though price currently equivalent
    };
    let applicationSubmission = {
      AppId: this.AppService.AppId,
      DateSubmitted: submissionDateStr,
      InvoiceId: '',
    };
    this.deployable.PostObject('Payment', 'Invoice', invoiceSubmission)
    .pipe(
      tap(_x => console.log('Invoice:', _x)))
    .subscribe(
      (_response: IConfirm) => {
        if ( !_response ) {
          this.alertService.error('Bad HTTP response creating invoice');
        }
        else if ( _response.Response == 'T') {
          applicationSubmission.InvoiceId = _response.ReturnId;
          this.deployable.PostObject('Applications', 'Submit', applicationSubmission)
          .subscribe( (response: IConfirm) => console.log('Application Submission:', response));
        }
        else {
          // If we got an error, we never created the invoice, so we don't submit the application
          this.alertService.error(_response.Message);
        }
      }
    )

    // Original 'working' code
    // this.deployable.PostObject('Applications', 'Submit', applicationSubmission)
    // .pipe(
    //   tap(console.log)
    // ).subscribe(
    //   ( (_response: IConfirm) => {
    //     if ( _response && _response.Response) {
    //       if ( _response.Response == 'T' ) {
    //         // Success, let's create an invoice
    //         // Let's make sure this is reusable if possible
    //         let _postObj = {

    //           AppId: this.InstAppData.AppId$.value,
    //           CertType: this.CertType,
    //           DoctoralDesignation: 'F',
    //           FeeType: 'New Certification' // FIXME - needs to include Option for BCBA 2&3, though price currently equivalent
    //         };
    //         this.deployable.PostObject( 'Invoices', 'Create', _postObj )
    //         .pipe()
    //         .subscribe(console.log);
    //       }
    //     }
    //   })
    // );
  }
}
