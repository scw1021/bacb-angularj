import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MsalService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';
import { IConfirm } from '../_interfaces';
import { AlertService, PersonalProfileService } from '../_services';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
  styleUrls: ['./change-email.component.css']
})
export class ChangeEmailComponent {
  public newEmail: FormGroup;
  public verificationCode: FormGroup;
  public requestSent: boolean;
  public requestId: string;
  public emailChangedSuccessfully: boolean = false;
  constructor(private personalProfileSvc: PersonalProfileService,
              private alertService: AlertService,) {
    this.newEmail = new FormGroup({
      NewEmail: new FormControl('', [Validators.required, Validators.email]),
    })
    this.verificationCode = new FormGroup({
      VerificationCode: new FormControl('', Validators.required)
    })
  }

  fireCodeVerification(){
    var userEnteredVerificationCode = this.verificationCode.get("VerificationCode").value;
    this.personalProfileSvc.SubmitVerificationCode(userEnteredVerificationCode, this.requestId)
    .subscribe(
      (response: any) => { 
        this.emailChangedSuccessfully = true;
        console.warn("success response: ", response)
        this.personalProfileSvc.Read()
      },
      (error: HttpErrorResponse) => { 
        switch(error.status){
          case 400:
            this.alertService.error("The code you've entered does not match the one we sent to your new email address. Double check the code in your inbox and try again. If you've made a mistake entering your email address, start over.")
          case 409:
            this.alertService.error("The email address you've provided is associated with an existing account. Log in with that account to make changes.");
          default: 
            this.alertService.error("Email change request failed")
          }
       }
    )
  }
  fireChangeRequest(){
    var newEmail: string = this.newEmail.get('NewEmail').value;
    this.personalProfileSvc.ChangeUserEmail(newEmail)
    .subscribe(
      (response) => {
        this.requestSent = true;
        this.requestId = response;
      },
      (error: HttpErrorResponse) => {
        console.warn("failed test", error)
        switch (error.status){
          case 409:
            this.alertService.error("The email address you've provided is associated with an existing account. Log in with that account to make changes.");
          default: 
            this.alertService.error("Email change request failed")
        }}
      )
  }

  resetAndTryAgain(){
    this.requestSent = false;
    this.requestId = null;
    this.emailChangedSuccessfully = false;
    this.newEmail.reset();
    this.verificationCode.reset();
  }

}
