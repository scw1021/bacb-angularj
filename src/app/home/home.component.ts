import { Address, Certification, PersonalProfile } from "../_models";
import { CertificationService, PersonalProfileService } from "../_services";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subscription } from 'rxjs';

import { ICertification } from '../_interfaces';
import { __GetNetSuiteDate } from '../_helpers/utility-functions';
import { tap } from 'rxjs/operators';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  @Input() public HomeSection: string;
  @Input() public HomePage: string;
  @Input() public HomeMessage: string;

  // public CurrentUser: ExtendedUser = null;
  public TestAbbrev: string = "";

  public CurrentUser$: Observable<PersonalProfile> | null = null;
  public CurrentCertification$: Observable<Certification> | null = null;
  public Certifications$: Observable<Certification[]> | null = null;

  // Neat
  public GetNetSuiteDate = __GetNetSuiteDate;
  public constructor(
    private ProfileServ: PersonalProfileService,
    private certService: CertificationService
  ) {
    // console.log('constructed HOME')
    // this.ProfileServ.Read();
    this.Certifications$ = this.certService.Certifications$;
    this.CurrentCertification$ = this.certService.CurrentCertification$;
    this.CurrentUser$ = this.ProfileServ.PersonalProfile$;
  }

  public ngOnInit() {

  }
}
