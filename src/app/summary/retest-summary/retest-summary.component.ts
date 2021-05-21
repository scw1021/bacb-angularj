import { AlertService, CourseworkService, EducationService, OtherCredentialsService } from 'src/app/_services';
import { AppData, ComponentData } from 'src/app/_models';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IConfirm, ICourseworkFull, IDegree, IOtherCredential } from 'src/app/_interfaces';
import { first, tap } from 'rxjs/operators';

import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Service } from 'src/app/_services/deployable.service';

@Component({
  selector: 'app-retest-summary',
  templateUrl: './retest-summary.component.html',
  styleUrls: ['./retest-summary.component.css']
})
export class RetestSummaryComponent implements OnInit {

  @Input() public InstComponentData : ComponentData;
  @Input() public InstAppData : AppData;
  @Input() public CanEditSummary: boolean = true;
  @Output() public SectionEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() public PageEmitter: EventEmitter<string> = new EventEmitter<string>();
  public EditPageNumber: number = 0;
  private Coursework$: Observable<ICourseworkFull[]> = this.CourseworkServ.Coursework$;
  private Degrees$: Observable<IDegree[]> = this.EducationServ.Degree$;
  private Credentials$: Observable<IOtherCredential[]> = this.CredentialServ.OtherCredential$;
  private CertType: string = '';

  @Output() EditEventTriggered: EventEmitter<number> = new EventEmitter<number>();

  public constructor(
    private alertService: AlertService,
    private CourseworkServ: CourseworkService,
    private EducationServ: EducationService,
    private CredentialServ: OtherCredentialsService,
    // private PersonalServ: PersonalProfileService,
    private deployable: Service,
    private router: Router
    ) { }

  public ngOnInit() {
    this.InstAppData.CertType$
    .pipe(
      tap( _value => {
        this.CertType = _value.Id ;
      })
    ).subscribe();
  }

  public OnEditChange(PageNumber: number) {
    this.EditPageNumber = PageNumber;
    this.EditEventTriggered.emit(PageNumber);
  }

  public get BaseAppData() : AppData {
    return this.InstAppData;
  }
  public get InstAppId(): string {
    return this.InstAppData.AppId$.value;
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
    let _incomplete = false;

    console.log(`Application Submitted - ID:${this.InstAppData.AppId$.value}`);
    this.InstAppData.Check.forEach(_check => {
      _check.subscribe(
        (_value: IConfirm) => {
          console.log(`Section Check Value: ${JSON.stringify(_value)}`);
          // So we kind of don't have a good way of evaluating which Attestation elements are
          // not finished, but this Summary component is BCBA only, so there are only three
          // options anyway
          if ( _value.Response == 'F' ) {
            _incomplete = true;
            // Check for attestation section failures, because they need specific messages
            if ( _value.Message == '1' ) {
              this.alertService.error('Information Release is not completed!');
            }
            else if ( _value.Message == '2' ) {
              this.alertService.error('Attestations are not completed!');
            }
            else if ( _value.Message == '3' ) {
              this.alertService.error('Terms and Conditions are not accepted');
            }
            else {
              this.alertService.error('Application is not complete! ' + _value.Message );

            }
            return;
          }
        },
        CheckError => {
          this.alertService.error('Application is not complete! Server Request Failed.');
          console.log(`Summary Check Error: ${JSON.stringify(CheckError)}`);
        },
        () => {


        }
      )
    });
    if ( !_incomplete ) {
      // Permanently Save Coursework, Education, and Other Credentials
      this.SubmitAll();
    }
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
    this._submitApplication();

    // Navigate to Payment Page - FIXME, it's better while it doens't work to send to app-home
    // Second note, when this get changed to PAYMENT, you need to ensure appID makes the route

  }
  private _submitApplication() {
    // Set submission date and save to NetSuite
    let date = new Date();
    let submissionDateStr = '' + (1 + date.getMonth()) + '/' + date.getDate() + '/' + date.getFullYear();
    console.log(submissionDateStr);

    let invoiceSubmission = {
      AppId: this.InstAppData.AppId$.value,
      CertType: this.CertType,
      DoctoralDesignation: 'F',
      FeeType: 'New Certification' // FIXME - needs to include Option for BCBA 2&3, though price currently equivalent
    };
    let applicationSubmission = {
      AppId: this.InstAppData.AppId$.value,
      DateSubmitted: submissionDateStr,
      InvoiceId: '',
    };
    this.deployable.PostObject('Invoices', 'Create', invoiceSubmission)
    .pipe(
      tap(_x => console.log('Invoice:', _x)))
    .subscribe(
      (_response: IConfirm) => {
        if ( !_response ) {
          this.alertService.error('Bad HTTP response creating invoice');
        }
        else if ( _response.Response == 'T') {
          applicationSubmission.InvoiceId = _response.Message;
          this.deployable.PostObject('Applications', 'Submit', applicationSubmission)
          .subscribe( (response: IConfirm) => {
            console.log('Application Submission:', response)
            this.router.navigate(['application-home']);
          });
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
