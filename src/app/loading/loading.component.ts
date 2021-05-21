import { CertificationService, PersonalProfileService } from '../_services';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { combineAll, debounceTime, distinct, distinctUntilChanged, tap, withLatestFrom } from 'rxjs/operators';

import { Router } from '@angular/router';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  public loading: boolean = true;
  public AssetUrl: string = `${environment.bacbLogoUrl}`;
  constructor(
    private Profile: PersonalProfileService,
    private Certification: CertificationService,
    private loadingRouter: Router
  ) {
    combineLatest([this.Profile.PersonalProfile$, this.Certification.CurrentCertification$]).pipe(
      // distinct(),
      tap( ([profile, certs]) => {
        // debounceTime(500),
        // tap(profile => {
          console.warn('Loading', profile, certs,this.loadingRouter.url)
          // Once the profile loads, reveal everything
          if ( profile.Id ) {
            this.loading = false;
            // Let's ensure that we have a profile and then route new users
            if ( !profile.Addresses[0]?.Address1 && this.loadingRouter.url !== '/registration' ) {
              console.log('Registration');
              this.loadingRouter.navigate(['/registration']);
            }
          }
        })
    ).subscribe();
  }

  ngOnInit() {
  }



}

