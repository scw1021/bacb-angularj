import { AlertDirective, DisableControlDirective, DynamicAttestationDirective, ExternalUrlDirective } from './_directives';
import { AlertService, AuthenticationService, CertificationService, UserService } from './_services';
import { BrowserCacheLocation, IPublicClientApplication, InteractionType, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { ContentAreaAllocTypePipe, EditionPipe, FloorPipe } from './_pipes/registered-courses-pipes'
import { ContinuingEducationSummaryComponent, NonZeroPipe } from './continuing-education/continuing-education-summary/continuing-education-summary.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalGuardConfiguration, MsalInterceptor, MsalInterceptorConfiguration, MsalModule, MsalRedirectComponent, MsalService } from '@azure/msal-angular';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { apiConfig, b2cPolicies } from './b2c-config';

import { AccommodationSummaryComponent } from './accommodations/accommodation-summary/accommodation-summary.component';
import { AccommodationsComponent } from './accommodations/accommodations.component';
import { ActionItemDetailComponent } from './action-item-detail/action-item-detail.component';
import { ActionItemsComponent } from './action-items/action-items.component';
import { AlertComponent } from './alert/alert.component';
import { AlertDialogComponent } from './alert/alert-dialog-component/alert-dialog.component';
import { AltPaymentComponent } from './alt-payment/alt-payment.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ApplicationHomeComponent } from './application-home/application-home.component';
import { AttestationsComponent } from './attestations/attestations.component';
import { AttestationsSummaryComponent } from './attestations/attestations-summary/attestations-summary.component';
import { AuthenticationGuard } from './_guards';
import { AzureHttpPostService } from './_services/azure-http-post.service';
import { BacbPanelComponent } from './bacb-panel/bacb-panel.component';
import { BackgroundCheckComponent } from './rbt-base-tab/background-check/background-check.component';
import { BackgroundCheckSummaryComponent } from './rbt-base-tab/background-check/background-check-summary/background-check-summary.component';
import { BcabaComponent } from './applications/bcaba/bcaba.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CertCycleSummaryComponent } from './cert-cycle-summary/cert-cycle-summary.component';
import { ChangeEmailComponent } from './change-email/change-email.component';
import { CommonModule } from '@angular/common';
import { CompetencyAssessmentComponent } from './rbt-base-tab/competency-assessment/competency-assessment.component';
import { CompetencySkillsAssessedComponent } from './rbt-base-tab/competency-assessment/competency-skills-assessed/competency-skills-assessed.component';
import { CompetencySummaryComponent } from './rbt-base-tab/competency-assessment/competency-summary/competency-summary.component';
import { ContinuingEducationCardComponent } from './continuing-education-card/continuing-education-card.component';
import { ContinuingEducationComponent } from './continuing-education/continuing-education.component';
import { CountryAndDialCodePipe } from './_pipes/country-dial-code';
import { CourseworkingComponent } from './courseworking/courseworking.component';
import { CourseworkingFormComponent } from './courseworking/courseworking-form/courseworking-form.component';
import { CreateInstitutionComponent } from './create-institution/create-institution.component';
import { DisplayNamePipe } from './personal-info-rewrite/displayNameProp';
import { EditionIdToValuePipe } from './_pipes/registered-courses-pipes'
import { EducationComponent } from './education/education.component';
import { EducationSummaryComponent } from './education/education-summary/education-summary.component';
import { EmailCommunicationsComponent } from './email-communications/email-communications.component';
import { EmailDetailComponent } from './email-communications/email-detail/email-detail.component';
import { ErrorComponent } from './error/error.component';
import { ExperienceComponent } from './experience/experience.component';
import { ExperienceSummaryComponent } from './experience/experience-summary/experience-summary.component';
import { ExperienceSupervisionComponent } from './experience/experience-supervision/experience-supervision.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { FooterComponent } from './footer/footer.component';
import { FormsModule } from '@angular/forms';
import { FortyHourTrainingComponent } from './rbt-base-tab/forty-hour-training/forty-hour-training.component';
import { FortyHourTrainingSummaryComponent } from './rbt-base-tab/forty-hour-training/forty-hour-training-summary/forty-hour-training-summary.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { IdCardComponent } from './id-card/id-card.component';
import { InformationComponent } from './information/information.component';
import { InitHeaderComponent } from './header/init-header/init-header.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { LargeFileUploadComponent } from './large-file-upload/large-file-upload.component';
import { LargeFileUploadContainerComponent } from './large-file-upload-container/large-file-upload-container.component';
import { LargeFileUploadSummaryComponent } from './large-file-upload/large-file-upload-summary/large-file-upload-summary.component';
import { LearningBACBFormComponent } from './continuing-education/forms/learning-bacbform/learning-bacbform.component';
import { LearningCourseworkFormComponent } from './continuing-education/forms/learning-coursework-form/learning-coursework-form.component';
import { LearningEventFormComponent } from './continuing-education/forms/learning-event-form/learning-event-form.component';
import { ListObjectPipe } from './courseworking/tmp/lobjpipe';
import { LoadingComponent } from './loading/loading.component';
import { MarketingOptionsComponent } from './marketing-options/marketing-options.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NameChangeRequestComponent } from './name-change-request/name-change-request.component';
import { NavigationComponent } from './applications/navigation/navigation.component';
import { NewBcbaComponent } from './applications/new-bcba/new-bcba.component';
import { NewsCardComponent } from './news-card/news-card.component';
import { NgIdleModule } from '@ng-idle/core';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OtherCredentialsComponent } from './other-credentials/other-credentials.component';
import { OtherCredentialsSummaryComponent } from './other-credentials/other-credentials-summary/other-credentials-summary.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PaymentComponent } from './payment/payment.component';
import { PersonalInfoRewriteComponent } from './personal-info-rewrite/personal-info-rewrite.component';
import { PersonalInfoSummaryComponent } from './personal-info-rewrite/personal-info-summary/personal-info-summary.component';
import { PostDoctoralExperienceComponent } from './post-doctoral-experience/post-doctoral-experience.component';
import { ProfessionalInfoComponent } from './professional-info/professional-info.component';
import { ProfessionalInfoSummaryComponent } from './professional-info/professional-info-summary/professional-info-summary.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ProgressComponent } from './progress/progress.component';
import { RbtComponent } from './applications/rbt/rbt.component';
import { RbtSummaryComponent } from './summary/rbt-summary/rbt-summary.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RemoveSupervisorWarningComponent } from './supervision-tools/remove-supervisor-warning/remove-supervisor-warning.component';
import { ResearchExperienceComponent } from './research-experience/research-experience.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ResponsibleRelationshipComponent } from './responsible-relationship/responsible-relationship.component';
import { SafePipe } from './_pipes/safe.pipe';
import { SandboxComponent } from './sandbox/sandbox.component';
import { ScholarshipPublicationFormComponent } from './continuing-education/forms/scholarship-publication-form/scholarship-publication-form.component';
import { ScholarshipReviewFormComponent } from './continuing-education/forms/scholarship-review-form/scholarship-review-form.component';
import { SubmittedHeaderComponent } from './summary/submitted-header/submitted-header.component';
import { SummaryComponent } from './summary/new-cert-summary/summary.component';
import { SupervisionManagementComponent } from './supervision-management/supervision-management.component';
import { SupervisionToolsComponent } from './supervision-tools/supervision-tools.component';
import { SupervisorEligibilityComponent } from './supervision-tools/supervisor-eligibility/supervisor-eligibility.component';
import { SupervisorSelectorComponent } from './supervisor-selector/supervisor-selector.component';
import { TeachingAceFormComponent } from './continuing-education/forms/teaching-ace-form/teaching-ace-form.component';
import { TeachingCourseworkFormComponent } from './continuing-education/forms/teaching-coursework-form/teaching-coursework-form.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { UnimplementedComponent } from './unimplemented/unimplemented.component';
import { UnitTestComponent } from './unit-test/unit-test.component';
import { VoluntaryInactiveComponent } from './voluntary-inactive/voluntary-inactive.component';
import { VoluntaryInactiveSummaryComponent } from './voluntary-inactive/voluntary-inactive-summary/voluntary-inactive-summary.component';
import { WileyJournalComponent } from './wiley-journal/wiley-journal.component';
import { environment } from 'src/environments/environment';
import { HomeAlternateComponent } from './home-alternate/home-alternate.component';
import { ApplicationsCardComponent } from './applications-card/applications-card.component';
import { RegistrationComponent } from './registration/registration.component';
import { AddCommasIfDataExists } from './_pipes/no-commas-without-data.pipe';
import { DeleteApplicationWarningComponent } from './application-home/delete-application-warning/delete-application-warning.component';


const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: 'c3df2106-1e6e-4ede-b395-d741d37eddf3',
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      // This was just an experiment. Set the redirect URI to wherever you'd like.
      // redirectUri: environment.baseUrl,
      redirectUri: environment.baseUrl,
      postLogoutRedirectUri: environment.baseUrl,
      knownAuthorities: [b2cPolicies.authorityDomain]
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE, // set to true for IE 11
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(apiConfig.uri, apiConfig.scopes);


  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...apiConfig.scopes],
    },
  };
}



@NgModule({
  imports: [
    CommonModule, // I fuckin swear
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSortModule,
    MatSidenavModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MsalModule,
    NgbModule,
    NgIdleModule.forRoot(),
    ReactiveFormsModule,

  ],
  declarations: [
    CountryAndDialCodePipe,
    AlertDirective,
    AppComponent,
    ApplicationHomeComponent,
    BacbPanelComponent,
    BackgroundCheckComponent,
    ContinuingEducationCardComponent,
    ContinuingEducationComponent,
    DisableControlDirective,
    DynamicAttestationDirective,
    EducationComponent,
    ErrorComponent,
    ExperienceComponent,
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    InstructionsComponent,
    NewBcbaComponent,
    NewsCardComponent,
    OtherCredentialsComponent,
    PaymentComponent,
    ProfessionalInfoComponent,
    ProfessionalInfoSummaryComponent,
    ResetPasswordComponent,
    OtherCredentialsSummaryComponent,
    ExperienceSummaryComponent,
    EducationSummaryComponent,
    CompetencySummaryComponent,
    BackgroundCheckSummaryComponent,
    SafePipe,
    ListObjectPipe,
    EditionPipe,
    FloorPipe,
    FileUploadComponent,
    ChangeEmailComponent,
    ProfileEditComponent,
    UnimplementedComponent,
    InitHeaderComponent,
    AlertComponent,
    LoadingComponent,
    InvoiceComponent,
    AltPaymentComponent,
    ExperienceSupervisionComponent,
    AccommodationsComponent,
    ResearchExperienceComponent,
    LargeFileUploadComponent,
    LargeFileUploadContainerComponent,
    LargeFileUploadSummaryComponent,
    PostDoctoralExperienceComponent,
    ProgressComponent,
    RbtSummaryComponent,
    ResponsibleRelationshipComponent,
    PageNotFoundComponent,
    CreateInstitutionComponent,
    ContentAreaAllocTypePipe,
    EditionIdToValuePipe,
    FortyHourTrainingComponent,
    CompetencyAssessmentComponent,
    CompetencySkillsAssessedComponent,
    FortyHourTrainingSummaryComponent,
    SandboxComponent,
    ContinuingEducationSummaryComponent,
    LearningEventFormComponent,
    LearningCourseworkFormComponent,
    LearningBACBFormComponent,
    TeachingCourseworkFormComponent,
    TeachingAceFormComponent,
    ScholarshipPublicationFormComponent,
    ScholarshipReviewFormComponent,
    CertCycleSummaryComponent,
    // RecertSummaryComponent,
    // RenewalRbtSummaryComponent,
    SubmittedHeaderComponent,
    SupervisionManagementComponent,
    SupervisorEligibilityComponent,
    SummaryComponent,
    NameChangeRequestComponent,
    IdCardComponent,
    // RetestSummaryComponent,
    AccommodationSummaryComponent,
    UnauthorizedComponent,
    NonZeroPipe,
    ActionItemsComponent,
    DisplayNamePipe,
    ActionItemDetailComponent,
    UnitTestComponent,
    MarketingOptionsComponent,
    AlertDialogComponent,
    EmailCommunicationsComponent,
    EmailDetailComponent,
    CourseworkingComponent,
    CourseworkingFormComponent,
    NavigationComponent,
    AttestationsComponent,
    AttestationsSummaryComponent,
    RbtComponent,
    BcabaComponent,
    VoluntaryInactiveComponent,
    VoluntaryInactiveSummaryComponent,
    SupervisionToolsComponent,
    RemoveSupervisorWarningComponent,
    PersonalInfoRewriteComponent,
    PersonalInfoSummaryComponent,
    WileyJournalComponent,
    InformationComponent,
    SupervisorEligibilityComponent,
    SupervisorSelectorComponent,
    HomeAlternateComponent,
    ApplicationsCardComponent,
    RegistrationComponent,
    AddCommasIfDataExists,
    DeleteApplicationWarningComponent,
  ],
  providers: [
    // { provide: HTTP_INTERCEPTORS,
    //     useClass: MsalInterceptor,
    //     multi: true,
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    AlertService,
    AuthenticationGuard,
    AuthenticationService,
    AzureHttpPostService,
    CertificationService,
    UserService,
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
  entryComponents: [
    AlertDialogComponent,
    RemoveSupervisorWarningComponent
  ]
})
export class AppModule { }
