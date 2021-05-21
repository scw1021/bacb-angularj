import { Certification, PersonalProfile } from '../_models';
import { CertificationService, PersonalProfileService } from '../_services';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable } from 'rxjs/internal/Observable';
import { __GetNetSuiteDate } from '../_helpers/utility-functions';

@Component({
  selector: 'app-home-alternate',
  templateUrl: './home-alternate.component.html',
  styleUrls: ['./home-alternate.component.css']
})
export class HomeAlternateComponent implements OnInit, OnDestroy {
  public CurrentUser$: Observable<PersonalProfile> | null = null;
  public CurrentCertification$: Observable<Certification> | null = null;
  public Certifications$: Observable<Certification[]> | null = null;
  public GetNetSuiteDate = __GetNetSuiteDate;

  public DisplaySettings: {
    FullLengthNews: boolean,
    UserIsCertified: boolean,
    NewUser: boolean,
    NearingRecertDate: boolean,
    ActionItemsAvailable: boolean
  } = {
    FullLengthNews: false,
    UserIsCertified: false,
    NewUser: false,
    NearingRecertDate: false,
    ActionItemsAvailable: false
  }

  public constructor (
    private ProfileServ: PersonalProfileService,
    private certService: CertificationService
  ) {
    this.Certifications$ = this.certService.Certifications$;
    this.CurrentCertification$ = this.certService.CurrentCertification$;
    this.CurrentUser$ = this.ProfileServ.PersonalProfile$;
  }

  ngOnInit(): void {

  }
  ngOnDestroy(): void {

  }
}
