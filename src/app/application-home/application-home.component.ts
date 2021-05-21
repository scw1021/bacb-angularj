import { AlertService, ApplicationService, CertificationService, ModelToolsService, PaymentService } from '../_services';
import { AppType, Application, CertType } from '../_models';
import { BehaviorSubject, Observable, ReplaySubject, Subscribable, Subscription } from 'rxjs';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IAlertObject, IApplication, IApplicationType, IConfirm } from '../_interfaces';
import { NavigationExtras, Router } from '@angular/router';
import { finalize, map, take, tap } from 'rxjs/operators';

import { ContinuingEducationService } from '../continuing-education/continuing-education.service';
import { IApplicationQualifications } from '../_interfaces/i-application-qualifications';
import { MatDialog } from '@angular/material/dialog';
import { DeleteApplicationWarningComponent } from './delete-application-warning/delete-application-warning.component';

// This is only used for the dropdown in this component


@Component({
  selector: 'application-home',
  templateUrl: './application-home.component.html',
  styleUrls: ['./application-home.component.css']
})
export class ApplicationHomeComponent implements OnInit, OnDestroy {

  @Input() public HomeSection: string;
  @Input() public HomePage: string;
  @Input() public HomeMessage: Observable<IAlertObject>;

  public ApplicationQualifications$: Observable<IApplicationQualifications>;
  private _LineItemSubscription: Subscription;
  public LineItems: BehaviorSubject<IApplicationType[]> = new BehaviorSubject<IApplicationType[]>(new Array<IApplicationType>());


  public constructor(
    private AppHomeAlertServ: AlertService,
    private AppHomeRouter: Router,
    private AppHomePayServ: PaymentService,
    private AppServ: ApplicationService,
    private ceService: ContinuingEducationService,
    public deletionWarnDialog: MatDialog,
    // cause let's just have it load here, when there's less goin on
    private modelToolsService: ModelToolsService,
  ) {
    this.LineItems = new BehaviorSubject<IApplicationType[]>([]);
    this.ApplicationQualifications$ = this.ceService.CertificationApplicationQualifications;
  }

  public ngOnInit() {
    this._LineItemSubscription = this.ApplicationQualifications$.subscribe(
      (_qualifications: IApplicationQualifications) => {
        // Prepare the available List Items
        if ( _qualifications == null ) {
          return null;
        }
        // YUP. This is not how I wan't to do this. BUT HERE WE ARE
        let appTypeList: IApplicationType[] = [];
        if ( _qualifications.QualifiedForBCBANewApplication ) {
          appTypeList.push({
            Name: 'Start New BCBA Certification Application - Option 1',
            ApplicationType: '1',
            CertificationType: '1'
          });
          appTypeList.push({
            Name: 'Start New BCBA Certification Application - Option 2',
            ApplicationType: '1',
            CertificationType: '2'
          });
          appTypeList.push({
            Name: 'Start New BCBA Certification Application - Option 3',
            ApplicationType: '1',
            CertificationType: '3'
          })
        }
        if ( _qualifications.QualifiedForBCBARenewal ) {
          appTypeList.push({
            Name: 'Start BCBA Recertification Application',
            ApplicationType: '1',
            CertificationType: '4'
          })
        }
        if ( _qualifications.QualifiedForBCBAExamViaPastCert ) {
          appTypeList.push({
            Name: 'Start Qualify via Past BCBA Certification Application',
            ApplicationType: '1',
            CertificationType: '6'
          })
        }
        if ( _qualifications.QualifiedForBCABAExamViaPastCert ) {
          appTypeList.push({
            Name: 'Start Qualify via Past BCaBA Certification Application',
            ApplicationType: '2',
            CertificationType: '6'
          })
        }
        if ( _qualifications.QualifiedForBCABANewApplication ) {
          appTypeList.push({
            Name: 'Start New BCaBA Certification Application',
            ApplicationType: '2',
            CertificationType: '1'
          })
        }
        if ( _qualifications.QualifiedForBCABARenewal ) {
          appTypeList.push({
            Name: 'Start BCaBA ReCertification Application',
            ApplicationType: '2',
            CertificationType: '4'
          })
        }
        if ( _qualifications.QualifiedForRBTNewApplication ) {
          appTypeList.push({
            Name: 'Start New RBT Certification Application',
            ApplicationType: '3',
            CertificationType: '1'
          })
        }
        if ( _qualifications.QualifiedForRBTRenewal ) {
          appTypeList.push({
            Name: 'Start RBT ReCertification Application',
            ApplicationType: '3',
            CertificationType: '4'
          })
        }
        this.LineItems.next(appTypeList);
      }
    )
  }
  public ngOnDestroy() {
    this._LineItemSubscription?.unsubscribe();
  }

  public get Applications() : Observable<IApplication []> {
    return this.AppServ.Application$;
  }

  public OnClickLineItem($option: IApplicationType): void {
    switch ( $option.ApplicationType ) {
      case '1':
        this.OnClickBCBA($option.CertificationType);
        break;
      case '2':
        this.OnClickBCaBA($option.CertificationType);
        break;
      case '3':
        this.OnClickRBT($option.CertificationType);
        break;
      default:
        console.log('Hey Something is very wrong with OnClickLineItem in App-Home, I got: ', $option);
        break;
    }
  }
  public OnClickBCBA(Type: string, Args?: NavigationExtras): void {
    // console.warn(Args);
    let navString = 'bcba';
    // switch (Type) {
    //   case '1':
    //     navString = '/new-bcba';
    //     // this.AppHomeRouter.navigate(['/new-bcba-option1'], Args);
    //     break;
    //   case '2':
    //       navString = '/new-bcba';
    //     // this.AppHomeRouter.navigate(['/new-bcba-option2'], Args);
    //     break;
    //   case '3':
    //       navString = '/new-bcba';
    //     // this.AppHomeRouter.navigate(['/new-bcba-option3'], Args);
    //     break;
    //   case '4':
    //       navString = '/bcba-recertification';
    //     // this.AppHomeRouter.navigate(['/bcba-recertification'], Args);
    //     break;
    //   case '6':
    //       navString = '/bcba-qualify-via-past-cert';
    //     // this.AppHomeRouter.navigate(['bcba-qualify-via-past-cert'], Args);
    //     break;
    //   case '7':
    //       navString = '/bcba-exam-retake';
    //     // this.AppHomeRouter.navigate(['bcba-exam-retake'], Args);
    // }
    if ( !Args ) {
        this.AppServ.Create(Type, '1').pipe( tap( x => {
          console.log(`OnClickBCBA: ${JSON.stringify(x)}`)
        }),
        finalize(()=> this.AppHomeRouter.navigate([navString], Args))
        ).subscribe();
    } else {
      console.log(Args);
      this.AppHomeRouter.navigate([navString], Args)
    }

  }


  public OnClickBCaBA(Type: string, Args?: NavigationExtras): void {
    let navString = '/bcaba';
    // switch (Type) {
    //   case '1':
    //     // this.AppHomeRouter.navigate(['/new-bcaba'], Args);
    //     navString = '/new-bcaba';
    //     break;
    //   case '4':
    //     navString = '/bcaba-recertification';
    //     // this.AppHomeRouter.navigate(['/bcaba-recertification'], Args);
    //     break;
    //   case '6':
    //     navString = '/bcaba-qualify-via-past-cert';
    //     // this.AppHomeRouter.navigate(['bcaba-qualify-via-past-cert'], Args);
    //     break;
    //   case '7':
    //     navString = '/bcaba-exam-retake';
    //     // this.AppHomeRouter.navigate(['bcaba-exam-retake'], Args);
    // }
    if ( !Args ) {
      this.AppServ.Create(Type, '2')
      .pipe(
         tap( x => {console.log(`OnClickBCABA: ${JSON.stringify(x)}`)}),
         finalize(()=> this.AppHomeRouter.navigate([navString], Args))
        )
      .subscribe();
    } else {
      this.AppHomeRouter.navigate([navString], Args)
    }

  }

  public OnClickRBT(Type: string, Args?: NavigationExtras): void {

    let navString = '';
    switch (Type) {
      case '1':
        navString = '/rbt';
        break;
      case '5':
        navString = '/rbt';
        break;
    }
    if ( !Args ) {
      this.AppServ.Create(Type, '3').pipe(
        tap( x => {console.log(`OnClickRBT: ${JSON.stringify(x)}`)}),
        finalize(() => this.AppHomeRouter.navigate([navString], Args))
      ).subscribe();
    } else {
      this.AppHomeRouter.navigate([navString], Args)
    }

  }

  public OnClickRetake(MyApp: Application) {
    console.log(MyApp);
    // We always create a new app, so let's just figure out a nav string from the known application
    let navString = '';
    switch( MyApp.CertType.NetSuiteId ) {
      case '1':
        navString = 'bcba';
        break;
      case '2':
        navString = 'bcaba';
        break;
      case '3':
        navString = 'rbt';
        break;
      default:
        navString = 'error';
        break;
    }
    this.AppServ.Create('7', MyApp.CertType.NetSuiteId, MyApp.Id)
    .pipe(
       tap( x => {console.log(`OnClickRetake: ${JSON.stringify(x)}`)}),
       finalize(()=> this.AppHomeRouter.navigate([navString],  {queryParams: {AppId: this.AppServ.SelectedApplication.Id}}))
      )
    .subscribe();
  }

  public OnClickEdit(MyApp: Application) {
    console.log(MyApp);
    this.AppServ.SetApplication(MyApp.Id);
    switch (MyApp.CertType.NetSuiteId) {
      case '1':
        this.OnClickBCBA(MyApp.AppType.NetSuiteId, {queryParams: {AppId: MyApp.Id}});
        break;
      case '2':
        this.OnClickBCaBA(MyApp.AppType.NetSuiteId, {queryParams: {AppId: MyApp.Id}});
        break;
      case '3':
        this.OnClickRBT(MyApp.AppType.NetSuiteId, {queryParams: {AppId: MyApp.Id}});
        break;
      default :
        this.AppHomeRouter.navigate(['/error'], {queryParams: {AppId: MyApp.Id}});
    }
  }

  public OnClickDelete(MyApp: Application) {
    // dialogRef is the hook to create the warning component and read the results.
    const dialogRef = this.deletionWarnDialog.open(DeleteApplicationWarningComponent, {width: "33%"})
    const warningResult = dialogRef.afterClosed()
    .pipe(
      take(1)
    ).subscribe((dialogWarningResult) => {
      if(dialogWarningResult == true){
        
        this.AppServ.Delete(MyApp.Id)
          .pipe()
          .subscribe(
          (DeleteNext: IConfirm) => {
            if (DeleteNext.Response) {
                this.AppHomeAlertServ.success(DeleteNext.Message,false);
                this.AppServ.Read();
              }
              else {
                  this.AppHomeAlertServ.error(DeleteNext.Message);
                }
              },
              (DeleteError : string) => {
                  this.AppHomeAlertServ.error(DeleteError);
                },
                () => { // OnComplete
                  this.HomeMessage = this.AppHomeAlertServ.getMessage();
                }
              )
          }
        }) 
  }
          
  public OnClickPayNow(MyApp: Application) {
    this.AppHomeRouter.navigate(['payment'],{queryParams: {'AppId': MyApp.Id}});
  }
  public OnClickAddFile(MyApp: Application) {
    this.AppHomeRouter.navigate(['file-upload'],  {queryParams: {'AppId': MyApp.Id}});
  }

  public get DisplayedColumns() : string [] {
    return ['Type','Status','DateCreated','DateSubmitted','Actions'];
  }

}
