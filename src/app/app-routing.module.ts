import { ActivatedRouteSnapshot, RouterModule, Routes } from '@angular/router';

import { APP_BASE_HREF } from '@angular/common';
import { AccommodationsComponent } from './accommodations/accommodations.component';
import { ActionItemDetailComponent } from './action-item-detail/action-item-detail.component';
import { ActionItemsComponent } from './action-items/action-items.component';
import { ApplicationHomeComponent } from './application-home/application-home.component';
import { AttestationsComponent } from './attestations/attestations.component';
import { AuthenticationGuard } from './_guards';
import { BackgroundCheckComponent } from './rbt-base-tab/background-check/background-check.component';
import { BcabaComponent } from './applications/bcaba/bcaba.component';
import { BrowserModule } from '@angular/platform-browser';
import { CertificationGuard } from './_guards/certification.guard';
import { ChangeEmailComponent } from './change-email/change-email.component';
import { CompetencyAssessmentComponent } from './rbt-base-tab/competency-assessment/competency-assessment.component';
import { ContinuingEducationComponent } from './continuing-education/continuing-education.component';
import { CourseworkingComponent } from './courseworking/courseworking.component';
import { CourseworkingFormComponent } from './courseworking/courseworking-form/courseworking-form.component';
import { CreateInstitutionComponent } from './create-institution/create-institution.component';
import { EducationComponent } from './education/education.component';
import { EmailDetailComponent } from './email-communications/email-detail/email-detail.component';
import { ErrorComponent } from './error/error.component';
import { ExperienceComponent } from './experience/experience.component';
import { FortyHourTrainingComponent } from './rbt-base-tab/forty-hour-training/forty-hour-training.component';
import { HomeAlternateComponent } from './home-alternate/home-alternate.component';
import { HomeComponent } from './home/home.component';
import { IdCardComponent } from './id-card/id-card.component';
import { InjectionToken } from '@angular/core';
import { InstructionsComponent } from './instructions/instructions.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { LargeFileUploadComponent } from './large-file-upload/large-file-upload.component';
import { LargeFileUploadContainerComponent } from './large-file-upload-container/large-file-upload-container.component';
import { MarketingOptionsComponent } from './marketing-options/marketing-options.component';
import { MsalGuard } from '@azure/msal-angular';
import { NameChangeRequestComponent } from './name-change-request/name-change-request.component';
import { NewBcbaComponent } from './applications/new-bcba/new-bcba.component';
import { NewsCardComponent } from './news-card/news-card.component';
import { NgModule } from '@angular/core';
import { OtherCredentialsComponent } from './other-credentials/other-credentials.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PaymentComponent } from './payment/payment.component';
import { PersonalInfoRewriteComponent } from './personal-info-rewrite/personal-info-rewrite.component';
import { PostDoctoralExperienceComponent } from './post-doctoral-experience/post-doctoral-experience.component';
import { ProfessionalInfoComponent } from './professional-info/professional-info.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { RbtComponent } from './applications/rbt/rbt.component';
import { RbtSummaryComponent } from './summary/rbt-summary/rbt-summary.component';
import { RegistrationComponent } from './registration/registration.component';
import { ResearchExperienceComponent } from './research-experience/research-experience.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SandboxComponent } from './sandbox/sandbox.component';
import { SummaryComponent } from './summary/new-cert-summary/summary.component';
import { SupervisionToolsComponent } from './supervision-tools/supervision-tools.component';
import { SupervisorEligibilityComponent } from './supervision-tools/supervisor-eligibility/supervisor-eligibility.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { UnimplementedComponent } from './unimplemented/unimplemented.component';
import { UnitTestComponent } from './unit-test/unit-test.component';
import { VoluntaryInactiveComponent } from './voluntary-inactive/voluntary-inactive.component';
import { WileyJournalComponent } from './wiley-journal/wiley-journal.component';
import { environment } from 'src/environments/environment';

const externalUrlProvider = new InjectionToken('externalUrlRedirectResolver');

const routes: Routes = [
  // {path: 'page-setup',
    // component: UserTokenCheckComponent
  // },
//
  // {
    // path: '',
    // component: AccommodationsComponent,
    // canActivate: [MsalGuard]
//
  // },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '#',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'externalRedirect',
    resolve: {
      url: externalUrlProvider
    },
    component: PageNotFoundComponent
  },
  // {
  //   path: 'c.2058486/BACB/CustomerPortal/index.ssp',
  //   component: LoginComponent
  // },
  // {
  //   path: 'c.2058486/BACB/CustomerPortal/index.ssp/login',
  //   component: LoginComponent
  // },
  {
    path: 'home',
    component: HomeAlternateComponent,
    canActivate: [MsalGuard]
  },
  { path: 'action-items',
    component: ActionItemsComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'action-item-detail',
    component: ActionItemDetailComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'test',
    component: AccommodationsComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'email-detail',
    component: EmailDetailComponent,
    canActivate: [AuthenticationGuard]
  },
  // {
  //   path: 'c.2058486/BACB/CustomerPortal/home',
  //   component: HomeComponent,
  //   canActivate: [MsalGuard]
  // },
  // {
  //   path: 'rc-create-institution',
  //   component: AddInstitutionContainerComponent,
  //   canActivate: [MsalGuard]
  // },

  {
    path: 'profile-edit',
    component: ProfileEditComponent,
    children: [
      {
        path: '',
       redirectTo: 'personal-profile',
        // redirectTo: 'personal-profile-two',
        pathMatch: 'full'
      },
      {
        path: 'personal-profile',
        component: PersonalInfoRewriteComponent,
      },
      // {
      //   path: 'personal-profile',
      //   component: PersonalProfileComponent
      // },
      {
        path: 'professional-info',
        component: ProfessionalInfoComponent
      },
      {
        path: 'email-subscriptions',
        component:  MarketingOptionsComponent
      },
      {
        path: 'password-change',
        component: ResetPasswordComponent
      },
      {
        path: 'name-change',
        component: NameChangeRequestComponent
      },
      {
        path: 'email-change',
        component: ChangeEmailComponent
      }
    ]
  },

  {
    path: 'error',
    component: ErrorComponent
  },
  {
    path: 'sandbox',
    component: SandboxComponent
  },
  {
    path: 'news',
    component: NewsCardComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'id-card',
    component: IdCardComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'reset',
    component: ResetPasswordComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'registration',
    component: RegistrationComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'marketing-options',
    component: MarketingOptionsComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'file-upload',
    component: LargeFileUploadContainerComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'continuing-education',
    component: ContinuingEducationComponent,
    canActivate: [CertificationGuard]
  },
  {
    path: 'application-home',
    component: ApplicationHomeComponent,
    canActivate: [MsalGuard]
  },
  // {
  //   path: 'new-bcaba',
  //   component: NewBcabaComponent,
  //   canActivate: [MsalGuard]
  // },
  {
    path: 'bcba',
    component: NewBcbaComponent,
    canActivate: [MsalGuard],
    children:[
      {
        path: 'instructions',
        component: InstructionsComponent
      },
      {
        path: 'personal-profile',
        component: PersonalInfoRewriteComponent,
      },
      {
        path: 'info',
        component: AttestationsComponent,
        data: {section: '1'}
      },
      {
        path: 'professional-info',
        component: ProfessionalInfoComponent
      },
      {
        path: 'other-credentials',
        component: OtherCredentialsComponent
      },
      {
        path: 'education',
        component: EducationComponent
      },
      {
        path: 'coursework',
        component: CourseworkingFormComponent
      },
      {
        path: 'research',
        component: ResearchExperienceComponent
      },
      {
        path: 'postdoc',
        component: PostDoctoralExperienceComponent
      },
      {
        path: 'experience',
        component: ExperienceComponent
      },
      {
        path: 'accommodations',
        component: AccommodationsComponent
      },
      {
        path: 'attestations',
        component: AttestationsComponent,
        data: {section: '2'}
      },
      {
        path: 'terms',
        component: AttestationsComponent,
        data: {section: '3'}
      },
      {
        path: 'summary',
        component: SummaryComponent
      }
    ]
  },
  {
    path: 'bcaba',
    component: BcabaComponent,
    canActivate: [MsalGuard],
    children:[
      {
        path: 'instructions',
        component: InstructionsComponent
      },
      {
        path: 'personal-profile',
        component: PersonalInfoRewriteComponent
      },
      {
        path: 'info',
        component: AttestationsComponent,
        data: {section: '1'}
      },
      {
        path: 'professional-info',
        component: ProfessionalInfoComponent
      },
      {
        path: 'other-credentials',
        component: OtherCredentialsComponent
      },
      {
        path: 'education',
        component: EducationComponent
      },
      {
        path: 'experience',
        component: ExperienceComponent
      },
      {
        path: 'attestations',
        component: AttestationsComponent,
        data: {section: '2'}
      },
      {
        path: 'terms',
        component: AttestationsComponent,
        data: {section: '3'}
      },
      {
        path: 'accommodations',
        component: AccommodationsComponent
      },
      {
        path: 'summary',
        component: SummaryComponent
      }
    ]
  },
  {
    path: 'rbt',
    component: RbtComponent,
    canActivate: [MsalGuard],
    children:[
      {
        path: 'instructions',
        component: InstructionsComponent
      },
      {
        path: 'personal-profile',
        component: PersonalInfoRewriteComponent,
      },
      {
        path: 'info',
        component: AttestationsComponent,
        data: {section: '1'}
      },
      {
        path: 'professional-info',
        component: ProfessionalInfoComponent
      },
      {
        path: 'other-credentials',
        component: OtherCredentialsComponent
      },
      {
        path: 'training',
        component: FortyHourTrainingComponent,
        data: {section: '4'}
      },
      {
        path: 'competency',
        component: CompetencyAssessmentComponent,
        data: {section: '6'}
      },
      {
        path: 'education',
        component: EducationComponent
      },
      {
        path: 'backgroundcheck',
        component: BackgroundCheckComponent,
        data: {section: '5'}
      },
      {
        path: 'attestations',
        component: AttestationsComponent,
        data: {section: '2'}
      },
      {
        path: 'terms',
        component: AttestationsComponent,
        data: {section: '3'}
      },
      {
        path: 'accommodations',
        component: AccommodationsComponent
      },
      {
        path: 'summary',
        component: RbtSummaryComponent
      }
    ]
  },
  // {
  //   path: 'new-bcba-option2',
  //   component: NewBcbaOption2Component,
  //   canActivate: [MsalGuard]
  // },
  // {
  //   path: 'new-bcba-option3',
  //   component: NewBcbaOption3Component,
  //   canActivate: [MsalGuard]
  // },
  // {
  //   path: 'new-rbt',
  //   component: NewRbtComponent,
  //   canActivate: [MsalGuard]
  // },
  // {
  //   path: 'bcba-recertification',
  //   component: RecertBcbaComponent,
  //   canActivate: [MsalGuard]
  // },
  // {
  //   path: 'bcaba-recertification',
  //   component: RecertBcabaComponent,
  //   canActivate: [MsalGuard]
  // },
  // {
  //   path: 'bcaba-qualify-via-past-cert',
  //   component: ExamBcabaComponent,
  //   canActivate: [MsalGuard]
  // },
  // {
  //   path: 'rbt-renewal',
  //   component: RenewalRbtComponent,
  //   canActivate: [MsalGuard]
  // },
  // {
  //   path: 'bcba-qualify-via-past-cert',
  //   component: ExamBcbaComponent,
  //   canActivate: [MsalGuard]
  // },
  // {
  //   path: 'bcba-exam-retake',
  //   component: RetakeBcbaComponent,
  //   canActivate: [MsalGuard]
  // },
  // {
  //   path: 'bcaba-exam-retake',
  //   component: RetakeBcabaComponent,
  //   canActivate: [MsalGuard]
  // },
  {
    path: 'payment',
    component: InvoiceComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'profile-settings',
    component: ProfileEditComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'supervision',
    component: SupervisionToolsComponent,
    canActivate: [CertificationGuard]
  },
  {
    path: 'supervision-eligibility',
    component: SupervisorEligibilityComponent,
    canActivate: [CertificationGuard]
  },
  {
    path: 'change-email',
    component: ChangeEmailComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'name-change',
    component: NameChangeRequestComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'unimplemented',
    component: UnimplementedComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'externalRedirect',
    canActivate: [externalUrlProvider],
    component: PageNotFoundComponent
  },
  {
    path: 'testSuite',
    canActivate: [CertificationGuard],
    component: UnitTestComponent
  },
  {
    path: 'voluntary-inactive',
    canActivate: [MsalGuard],
    component: VoluntaryInactiveComponent
  },
  {
    path: 'journal',
    canActivate: [MsalGuard],
    component: WileyJournalComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
const isIframe = window !== window.parent && !window.opener;
@NgModule({
  providers: [

  //{provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ],
  imports: [BrowserModule, RouterModule.forRoot(routes, {
    enableTracing: false,
    useHash: true,
    scrollPositionRestoration: 'enabled',
    initialNavigation: !isIframe ? 'enabled' : 'disabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
