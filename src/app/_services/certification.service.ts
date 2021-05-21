import { BehaviorSubject, Observable } from 'rxjs';
import { CertCycle, CertType, Certification, Customer } from '../_models';
import { ICertification, IConfirm, IResponseObject } from '../_interfaces';
import { first, map, pluck, shareReplay, startWith, tap } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { IInvoice } from '../_interfaces/i-invoice';
import { Injectable } from '@angular/core';
import { PersonalProfileService } from './personal-profile.service';

@Injectable({
  providedIn: 'root'
})
export class CertificationService extends BaseService {

  // Subjects
  private _CertificationSubject: BehaviorSubject<Certification[]> = new BehaviorSubject<Certification[]>([]);
  private _OtherCustomerCertificationSubject: BehaviorSubject<Certification[]> = new BehaviorSubject<Certification[]>([]);
  public CurrentCertification$: Observable<Certification>;
  private _CurrentCertSubject: BehaviorSubject<Certification> = new BehaviorSubject<Certification>(null);
  public CertificationCycleId: string = '';

  // Private Evaluations
  private UpdateCurrentCertification$: Observable<Certification>;
  private BootFromHeader: boolean = true;
  // private _RequireCustomerId$: Observable<string> = this.authService.CustomerId$;

  // Public Observables
  public Certifications$: Observable<Certification[]> = this._CertificationSubject.asObservable().pipe(shareReplay(1));
  public OtherCustomerCertification$: Observable<Certification[]> = this._OtherCustomerCertificationSubject.asObservable();

  public constructor(
    private Http: HttpClient,
    private azure: AzureHttpPostService,
    private authService: AuthenticationService
  ) {
    super();
    this.CurrentCertification$ = this.UserCertifications$.pipe(
      first(null),
      map(
        (_certs: Certification[]) => {
          if ( _certs == null ) {
            return new Certification();
          }
          let maxCert = new Certification();
          let maxCycle = new CertCycle();
          let maxDate: Date = new Date(0); // EPOCH, like everything expires after 5 years anyway
          _certs.forEach( (_cert: Certification) => {
            _cert.Cycles.forEach( (_cycle: CertCycle) => {
              // We should only have one active cert, so okay
              if ( _cycle.RenewalDate.getTime() > maxDate.getTime() ) {
                maxDate = _cycle.RenewalDate;
                maxCert = _cert;
                maxCycle = _cycle;
              }
            })
          });
          return new Certification({
            Id: maxCert.Id,
            Number: maxCert.Number,
            Contact: maxCert.Customer,
            Type: maxCert.Type,
            // Yuck? But whatever. I don't forsee me having the time to full rewrite
            // every last element of this monolith
            Cycles: maxCert.Cycles.map(cycle => cycle.Export()),
          });
        }
      ),
      tap(cert=>this._CurrentCertSubject.next(cert)),
      tap(x=> this.UpdateCertCycleId()),
      shareReplay(1)
    )
  }
  // NEW
  private UserCertifications$: Observable<Certification[]> = this.azure.get<ICertification[]>
  ( this.BaseUrl + 'Certifications/ReadAll' ).pipe(
    map(_response => _response.map( _icert => new Certification(_icert))),
    tap(x=>console.log('User Certifications', x)),
    tap(certs=> this._CertificationSubject.next(certs)),
    shareReplay(1)
  );

  // OLD


  public __CreateTestingCertCycle(objRequest: {Invoice: IInvoice, StartDate: string, EndDate}): Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + 'Certifications/CreateTestCert', objRequest)
      .pipe(tap(
        (_response:IConfirm) => {
          console.log(_response);
          if ( _response && _response.Response == 'T' ) {
            this.ReadAll();
          }
      }))
  }
  public ClearData(): void {
    this._CertificationSubject.next(null);
  }
  public UpdateCertCycleId(): void {
    this.CertificationCycleId = this._CurrentCertSubject.value.GetCurrentCycle().Id;
    console.warn('UpdatecycleId', this.CertificationCycleId)
  }

  // public ReadAllFromHeader(): void {
  //   // We want to read from the header, but we only want to do it on initial load.
  //   if ( this.BootFromHeader ) {
  //     this.ReadAll(this.authService.CustomerIdSubject.value);
  //     this.BootFromHeader = false;
  //   }
  // }



  public ReadAll(CustomerID?: string) : void {
    this.azure.get<ICertification[]>(this.BaseUrl + "Certifications/ReadAll")
    .pipe(
      tap(_x => console.log('CertVal: ', _x)),
      // pluck('Array'),
    )
    .subscribe(
      (CertificationNext: ICertification[]) => {
        // We always get back some kind of array, but we just need to nullcheck first
        if ( CertificationNext !== null && CertificationNext.length ) {
          let CertArray: Certification[] = [];
          CertificationNext.forEach( (_cert: ICertification ) => {
            CertArray.push(new Certification(_cert))
          })
          if (CustomerID) {
            this._OtherCustomerCertificationSubject.next(CertArray);
          }
          else {
            this._CertificationSubject.next(CertArray);
          }
        }
        else {
          if (CustomerID) {
            this._OtherCustomerCertificationSubject.next([]);
          }
          else {
            this._CertificationSubject.next([]);
          }
        }

      },
      CertificationError => {

      },
      () => { // OnComplete

      }
    )
  }
  public CheckHolding(): Observable<boolean> {
    return this.azure.post<IConfirm>(this.BaseUrl + 'Certifications/Check', {id: this.authService.CustomerIdSubject.value})
      .pipe( map ( (_response: IConfirm) => {
        console.log('CheckHolding: ', _response);
        return ( _response && _response.Response == 'T' )
      }))
  }
}


