import { BaseService, CertificationService } from '../_services';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Certification, ResponseObject } from '../_models';
import { IConfirm, IListObject } from '../_interfaces';
import { __AddDays, __GetNetSuiteDate } from '../_helpers/utility-functions';
import { map, share, shareReplay, tap, withLatestFrom } from 'rxjs/operators';

import { AzureHttpPostService } from '../_services/azure-http-post.service';
import { ContinuingEducationCredit } from '../_models/continuing-education-credit';
import { FileMgmtService } from '../_services/file-mgmt.service';
import { HttpClient } from '@angular/common/http';
import { IApplicationQualifications } from '../_interfaces/i-application-qualifications';
import { IContinuingEducationCredit } from '../_interfaces/i-continuing-education-credit';
import { IContinuingEducationSubmission } from '../_interfaces/i-continuing-education-submission';
import { IContinuingEducationSummaryCredit } from '../_interfaces/i-continuing-education-summary-credit';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContinuingEducationService extends BaseService {

  private CurrentCertificationId: string = '';
  private CurrentCertCycleId: string = '';

  private _ContinuingEducationSubject: BehaviorSubject<ContinuingEducationCredit[]> = new BehaviorSubject<ContinuingEducationCredit[]>([]);
  public ContinuingEducation$: Observable<ContinuingEducationCredit[]> = this._ContinuingEducationSubject.asObservable().pipe(shareReplay(1));
  public ContinuingEducationSummary$: Observable<IContinuingEducationSummaryCredit[]>;
  public ContinuingEducationTotals$: Observable<number[]>;

  public ContinuingEducationTypes$: IListObject[] = [ // bacb_ce_type
    {Id: '100000000', Value: 'Learning: ACE Event'},
    {Id: '100000001', Value: 'Learning: Coursework'},
    {Id: '100000002', Value: 'Teaching: Coursework'},
    {Id: '100000003', Value: 'Teaching: ACE Event'},
    {Id: '100000004', Value: 'Scholarship: Publication'},
    {Id: '100000005', Value: 'Scholarship: Review'},
  ];
  // private _EventTypes: BehaviorSubject<IListObject[]>;
  public EventTypes$: IListObject[] = [
    {Id: '100000000', Value: 'Online'},
    {Id: '100000001', Value: 'In-Person'}
  ];
  // private _GradeList: BehaviorSubject<IListObject[]>;
  public GradeList$: IListObject[] = [ // bacb_grades
    {Id: '100000000', Value: 'A'},
    {Id: '100000001', Value: 'B'},
    {Id: '100000002', Value: 'C'},
    {Id: '100000003', Value: 'Pass'},
  ];
  private DefaultQualifications: IApplicationQualifications = {
    QualifiedForBCBAExamViaPastCert: false,
    QualifiedForBCBARenewal: false,
    QualifiedForBCBANewApplication: true,
    QualifiedForBCABAExamViaPastCert: false,
    QualifiedForBCABARenewal: false,
    QualifiedForBCABANewApplication: true,
    QualifiedForRBTRenewal: false,
    QualifiedForRBTNewApplication: true,
  };
  public CurrentCertification$: Observable<Certification>;

  public CertificationApplicationQualifications: Observable<IApplicationQualifications>;

  constructor(
    private azure: AzureHttpPostService,
    // private Http: HttpClient,
    private certificationService: CertificationService,
    private fileMgmt: FileMgmtService
  ) {
    super();
    // When we first use CurrentCert in this service, we need the ID and we also want to seed our subject
    this.CurrentCertification$ = this.certificationService.CurrentCertification$.pipe(
      tap( Certification => {
        if ( Certification.Id ) {
          // If we hold this statically, then we can use it when we use the forms.
          this.CurrentCertificationId = Certification.Id;
          this.CurrentCertCycleId = Certification.GetCurrentCycle().Id;
          // console.warn(this.CurrentCertificationId, this.CurrentCertCycleId);
          this.Read(this.CurrentCertCycleId);
        }
      }),
      shareReplay(1)
    );
    // For our Subject matter, when we have values, we want to seed the summary
    this.ContinuingEducationSummary$ = this.ContinuingEducation$.pipe(
      withLatestFrom(this.CurrentCertification$),
      map(
        // I can't remember how to typecast this rn
        ([credits, cert]) => {
          return this.CalculateCredits(credits, cert);
        }
      ), shareReplay(1)
    );
    this.ContinuingEducationTotals$ = this.ContinuingEducationSummary$.pipe(
      map( credits => {
        return this.CalculateTotals(credits)
      }), shareReplay(1)
    );
    this.CertificationApplicationQualifications = this.ContinuingEducationTotals$.pipe(
      withLatestFrom(this.CurrentCertification$),
      map(
        ([totals, certification]) => {
          let qualifications = this.DefaultQualifications;
          if ( !totals ) {
            return qualifications;
          }
          // Skip RBT's
          if ( certification.Type.Abbrev == 'RBT' ) {
            console.log('ContinuingEducationQualifications - NO RBT');
            // Allegedly, you only need the 40hr training once, so it's always renewal
            qualifications.QualifiedForRBTNewApplication = false;
            qualifications.QualifiedForRBTRenewal = true;
            return qualifications;
          }
          let requiredCredits = 0;
          let yearlyExpiredCertCredits = 0;
          let expiredTotal = 0;
          let requiredEthicsCredits = 0;
          let today = new Date();
          let renewalDate = certification.GetCurrentCycle().RenewalDate;
          let totalCredits = totals.reduce((first, second) => first + second, 0) / 2;

          // Set up the requirements for this process
          switch ( certification.Type.Abbrev ) {
            case 'BCBA':
              requiredCredits = 36;
              yearlyExpiredCertCredits = 16;
              requiredEthicsCredits = 4;
              if ( renewalDate.getTime() < today.getTime() ) {
                qualifications.QualifiedForBCBAExamViaPastCert = true;
              }
              else {
                qualifications.QualifiedForBCBARenewal = true;
                qualifications.QualifiedForBCBANewApplication = false;
              }
              break;
            case 'BCaBA':
              requiredCredits = 23;
              yearlyExpiredCertCredits = 10;
              requiredEthicsCredits = 3;
              if ( renewalDate.getTime() < today.getTime() ) {
                qualifications.QualifiedForBCABAExamViaPastCert = true;
              }
              else {
                qualifications.QualifiedForBCABARenewal = true;
                qualifications.QualifiedForBCABANewApplication = false;
              }
              break;
            default:
              console.error('Cert Type Abbreviation Invalid for Required Credit Calc', certification);
          }
          // Today must at least be beyond the certification allowance 45 days before the cert expires
          if ( today.getTime() > __AddDays(renewalDate, -45 ).getTime() ) {
            let nYearsExpired = 0;
            // For every year beyond the expiration date, we have additional hours required.
            let yearParse = today;
            while( yearParse.getTime() > renewalDate.getTime() ) {
              nYearsExpired++;
              expiredTotal += yearlyExpiredCertCredits;
              today = __AddDays(yearParse, -365);
              if ( nYearsExpired > 5 ) {
                // must be 5 years or fewer
                return qualifications;
              }
            }
            // Check Renewal
            if ( expiredTotal > 0 ) {
              // for printing later
              requiredCredits = expiredTotal;
              qualifications.QualifiedForBCBAExamViaPastCert = (expiredTotal <= totalCredits);
            }
            else {
              // _qualifications.QualifiedForBCBARenewal = (requiredCredits <= totalCredits) && (requiredEthicsCredits <= this.ContinuingEducationSummaryTotals$.value[1]);
            }
          }
          else {
            console.log('Not Eligible for Recert/Renew because no BCBA or BCaBA expires within 45 days.');
            console.log(`Current Cycle expires in ${ Math.floor((renewalDate.getTime() - today.getTime()) / (1000*60*60*24)) } days.`)
          }

          return qualifications;
        }
      )
    )

    // PROBABLY WOULD MAKE A GOOD TESTING TOOL
    // of( true ).pipe(
    //   tap( () => {
    //     console.log('pre')
    //     // Remove all values
    //     this._ContinuingEducationSubject.next([]);
    //     this._ContinuingEducationTypes.next([]);
    //   }),
    //   delay(5000),
    //   tap( () => {
    //     console.log('post');
    //     // Reapply all values 5 seconds later
    //     this.Read(); this.ReadTypes();
    //   })
    // ).subscribe()

  }

  // Calculate the Summary credits for display
  private CalculateCredits(Credits: ContinuingEducationCredit[], Certification: Certification): IContinuingEducationSummaryCredit[] {
    if ( !Certification ){
      return null;
    }
    let summaryCredits: IContinuingEducationSummaryCredit[] = [];
    // Clear out existing Credit Types values
    this.ContinuingEducationTypes$.forEach( (_type : IListObject) => {
      summaryCredits.push( {
        Type: _type,
        GeneralCredits: 0,
        EthicsCredits: 0,
        SupervisionCredits: 0,
        TotalCredits: 0
      } as IContinuingEducationSummaryCredit)
    });
    // let totals = [0,0,0,0];
    let _renewalTime = Certification.GetCurrentCycle().RenewalDate.getTime();
    let _todayTime = new Date().getTime();
    let _maxExpiration = __AddDays(new Date(), -5*365).getTime();
    // If we have exceeded maximum expiration, return
    if ( _maxExpiration > _renewalTime ) {
      console.log('Cert is invalid: Greater than Five Years Expired:', __GetNetSuiteDate(new Date(_maxExpiration)), ' > ', __GetNetSuiteDate( new Date(_renewalTime) ));
      return;
    }
    let CurrentCycleId = Certification.GetCurrentCycle().Id;
    Credits.forEach( (_credit: ContinuingEducationCredit) => {
      // We need to only grab credits if they make sense

      // Ensure the CE is for the current CertCycle
      console.log(CurrentCycleId, _credit.CertCycle.Id)
      if ( CurrentCycleId == _credit.CertCycle.Id ) {
        // Today must be before renewal or it's expired and we only want credits after expiration
        if ( _todayTime < _renewalTime || _renewalTime < _credit.CompletionDate.getTime() ) {
          summaryCredits.forEach( (_summaryCredit: IContinuingEducationSummaryCredit) => {
            if ( _credit.Type.Id == _summaryCredit.Type.Id ) {
              _summaryCredit.GeneralCredits += _credit.GeneralUnits;
              // totals[0] += _credit.GeneralUnits;
              _summaryCredit.EthicsCredits += _credit.EthicsUnits;
              // totals[1] += _credit.EthicsUnits;
              _summaryCredit.SupervisionCredits += _credit.SupervisionUnits;
              // totals[2] += _credit.SupervisionUnits;
              _summaryCredit.TotalCredits
                += ( _credit.GeneralUnits + _credit.EthicsUnits + _credit.SupervisionUnits );
              // totals[3] += ( _credit.GeneralUnits + _credit.EthicsUnits + _credit.SupervisionUnits );
            }
          })
        }
      }
    });
    return summaryCredits;
  }

  // Calculate the totals from the Summary Credits
  private CalculateTotals(summaryCredits: IContinuingEducationSummaryCredit[]) {
    let totals = [0,0,0,0];
    summaryCredits.forEach( (_credit: IContinuingEducationSummaryCredit) => {
      totals[0] += _credit.GeneralCredits;
      totals[1] += _credit.EthicsCredits;
      totals[2] += _credit.SupervisionCredits;
      totals[3] += ( _credit.GeneralCredits + _credit.EthicsCredits + _credit.SupervisionCredits );
    });
    return totals;
  }
  public Read(id?: string): void {
    if ( !id ) {
      console.log('no id')
      id = this.CurrentCertCycleId;
      if ( !id ) {
        // if we don't have a cert cycle, just ignore the read.
        return;
      }
    }
    console.log(id)
    this.azure.post<IContinuingEducationCredit[]>(this.BaseUrl + 'ContinuingEducation/ReadCE', {Id: id})
    .pipe(tap(_x => {
      console.log('CE: ', _x)
    }))
    .subscribe(
      (_response: IContinuingEducationCredit[]) => {
        let nextEmission: ContinuingEducationCredit[] = [];
        if ( _response ) {
          _response.forEach( (_value: IContinuingEducationCredit) => {
            nextEmission.push( new ContinuingEducationCredit(_value) );
          })
        }
        this._ContinuingEducationSubject.next(nextEmission);
      }
    )
  }

  public Create(objRequest: IContinuingEducationCredit): Observable<IConfirm> {
    objRequest.CertCycleId = this.CurrentCertCycleId;
    return this.azure.post<IConfirm>(this.BaseUrl + 'ContinuingEducation/UpsertCE', objRequest).pipe(
      tap(x=> this.fileMgmt.Read())
    );
  }
}

