import { AlertService, ApplicationService, CourseworkService, EducationService, OtherCredentialsService } from 'src/app/_services';
import { AppData, ComponentData } from 'src/app/_models';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IConfirm, IDegree, IOtherCredential } from 'src/app/_interfaces';
import { first, map, tap } from 'rxjs/operators';

import { ApplicationCompletionService } from 'src/app/_services/application-completion.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Service } from 'src/app/_services/deployable.service';

@Component({
  selector: 'rbt-summary',
  templateUrl: './rbt-summary.component.html',
  styleUrls: ['./rbt-summary.component.css']
})
export class RbtSummaryComponent implements OnInit {

  @Input() public InstComponentData : ComponentData;
  @Input() public InstAppData : AppData;
  @Input() public CanEditSummary: boolean = true;
  @Output() public SectionEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() public PageEmitter: EventEmitter<string> = new EventEmitter<string>();
  public InstAppId: string = '';
  public AppType: string = '';
  public EditPageNumber: number = 0;
  private CertType: string | null = null;
  public Check$;
  private Degrees$: Observable<IDegree[]> = this.EducationServ.Degree$;
  private Credentials$: Observable<IOtherCredential[]> = this.CredentialServ.OtherCredential$;
  @Output() EditEventTriggered: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private alertService: AlertService,
    private AppService: ApplicationService,
    private CourseworkServ: CourseworkService,
    private completion: ApplicationCompletionService,
    private EducationServ: EducationService,
    private CredentialServ: OtherCredentialsService,
    // private PersonalServ: PersonalProfileService,
    private deployable: Service,
    private router: Router
  ) {
    this.AppType = this.AppService.AppTypeId;
    this.CertType = this.AppService.CertTypeId;
    this.Check$ = this.completion.Check$;
  }

  ngOnInit() {
    this.CertType = this.AppService.CertTypeId;
  }

  public OnEditChange(PageNumber: number) {
    this.EditPageNumber = PageNumber;
    this.EditEventTriggered.emit(PageNumber);
  }

  public get BaseAppData() : AppData {
    return this.InstAppData;
  }

  public OnPageChange($event){
    this.PageEmitter.emit($event);
  }
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

  public SubmitAll() {
    // Permanently Save Coursework, Education, and Other Credentials
    // I've set this up for ease of debugging, so multiple helper functions

  //   this._submitDegrees();
  //   this._submitCredentials();
    this._submitApplication();

    // Navigate to Payment Page - FIXME, it's better while it doens't work to send to app-home
    // Second note, when this get changed to PAYMENT, you need to ensure appID makes the route
    this.router.navigate(['application-home']);
  }

  // private _submitCredentials() {
  //   let credentialsRequest = {
  //     AppId: this.InstAppData.AppId$.value,
  //     Credentials: [],
  //     NumCredentials: 0
  //   }

  //   this.Credentials$.pipe(
  //     first(),
  //     tap( (_creds: IOtherCredential[] ) => {
  //       _creds.forEach( (_cred: IOtherCredential) => {
  //         credentialsRequest.Credentials.push(_cred.Id);
  //         credentialsRequest.NumCredentials++;
  //       });
  //       this.CredentialServ.Submit(credentialsRequest);
  //     })
  //   ).subscribe(
  //     (_value) => console.log,
  //     CredError => {
  //       this.alertService.error(JSON.stringify(CredError));
  //     },
  //     () => {
  //       // Once we have the ID's submit it to the server using our service
  //       this.alertService.success('Other Credentials Submitted');
  //     }
  //   );
  // }
  // private _submitDegrees() {
  //   let degreesRequest = {
  //     AppId: this.InstAppData.AppId$.value,
  //     Degrees: [],
  //     NumDegrees: 0
  //   }

  //   this.Degrees$.pipe(
  //     first(),
  //     tap( (_degrees: IDegree[] ) => {
  //       _degrees.forEach( (_degree: IDegree) => {
  //         degreesRequest.Degrees.push(_degree.Id);
  //         degreesRequest.NumDegrees++;
  //       });
  //       this.EducationServ.Submit(degreesRequest);
  //     })
  //   ).subscribe(
  //     (_value) => console.log,
  //     DegreeError => {
  //       this.alertService.error(JSON.stringify(DegreeError));
  //     },
  //     () => {
  //       // Once we have the ID's submit it to the server using our service
  //       this.alertService.success('Degrees Submitted');
  //     }
  //   );
  // }
  private _submitApplication() {
    // Set submission date and save to NetSuite
    let date = new Date();
    let submissionDateStr = '' + (1 + date.getMonth()) + '/' + date.getDate() + '/' + date.getFullYear();
    console.log(submissionDateStr);
    let applicationSubmission = {
      AppId: this.InstAppData.AppId$.value,
      DateSubmitted: submissionDateStr
    };
    this.deployable.PostObject('Applications', 'Submit', applicationSubmission)
    .pipe(
      tap(console.log)
    ).subscribe(
      ( (_response: IConfirm) => {
        if ( _response && _response.Response) {
          if ( _response.Response == 'T' ) {
            // Success, let's create an invoice
            // Let's make sure this is reusable if possible
            let _postObj = {
              AppId: this.InstAppData.AppId$.value,
              CertType: this.CertType,
              DoctoralDesignation: 'F',
              FeeType: 'New Certification' // FIXME - needs to include Option for BCBA 2&3, though price currently equivalent
            };
            this.deployable.PostObject( 'Invoices', 'Create', _postObj )
            .pipe()
            .subscribe(console.log);
          }
        }
      })
    );
  }
}
