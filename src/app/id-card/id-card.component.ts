import { Component, OnInit } from '@angular/core';
import { CertificationService, PersonalProfileService } from '../_services';
import { Certification, PersonalProfile } from '../_models';
import { Observable, of } from 'rxjs';
import { tap, map, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { __GetNetSuiteDate } from '../_helpers/utility-functions'


@Component({
  selector: 'id-card',
  templateUrl: './id-card.component.html',
  styleUrls: ['./id-card.component.css']
})
export class IdCardComponent implements OnInit {
  public imageString: string = `${environment.Assets}` + "/images/BACB_Logo_200.png";
  public certArr$: Observable<Certification[]> = new Observable<Certification[]>();
  public currentCert$: Observable<Certification> = new Observable<Certification>();
  public humanFriendlyIssuedOnDate: string = '';
  public humanFriendlyValidToDate: string = '';
  public currentUser$: Observable<PersonalProfile> = new Observable<PersonalProfile>();

  constructor(protected certSvc: CertificationService,
              protected profileSvc: PersonalProfileService) {
  }

  ngOnInit() {
    this.certSvc.ReadAll();
    this.certArr$ = this.certSvc.Certifications$.pipe(
      map<Certification[], Certification[]>((cert: Certification[]) => {
        return cert
      }
    ));
    this.currentUser$ = this.profileSvc.PersonalProfile$;
    this.currentCert$ = this.certSvc.CurrentCertification$
      .pipe(
        tap((cert: Certification) => {
          this.humanFriendlyValidToDate = __GetNetSuiteDate(cert.GetCurrentCycle().RenewalDate),
          this.humanFriendlyIssuedOnDate = __GetNetSuiteDate(cert.GetStartDateOfCurrentCycle())
        })
      );
  }

}
