import { AuthenticationService, CertificationService, PersonalProfileService } from '../_services';
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { Certification } from '../_models';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public BacbLogoUrl = `${environment.bacbLogoUrl}`;

  public IsCertificationHolder$: Observable<boolean>;
  public IsBcbaBcabaOrBcbad: boolean = false;

  public constructor(
    private HeadAuthServ: AuthenticationService,
    private HeadRouter: Router,
    private certService: CertificationService,
    private profileService: PersonalProfileService,
  ) {
    this.IsCertificationHolder$ = this.certService.CheckHolding();
  }

  ngOnInit() {

    this.certService.Certifications$.pipe(
      filter((certArr : Certification[]) => (!(typeof certArr[0] == 'undefined') || (typeof certArr[0] == null))),
      filter((cerArr : Certification[]) => ( cerArr[0].Id != '')),
      take(1),
    ).subscribe((certArray: Certification[]) => {
      let currentCert: Certification = certArray.find(aCert => (aCert.IsCurrent == true && +aCert.Type.Id < 3) );
      this.IsBcbaBcabaOrBcbad = currentCert? true: false;
    })
  }

  public OnClickLogout() {
    this.certService.ClearData();
    this.profileService.ClearData();
    this.HeadAuthServ.logout();
  }

  public OnClickNavigate(Route: string) : void {
    this.HeadRouter.navigate([Route]);
  }
}


