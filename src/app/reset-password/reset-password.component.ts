import { AlertService, PersonalProfileService } from '../_services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfirm, IPersonalProfile } from '../_interfaces';
import { Observable, fromEvent, interval } from 'rxjs';

import { PersonalProfile } from '../_models';
import { ResetPasswordService } from '../_services/reset-password.service';
import { stringify } from 'querystring';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})

export class ResetPasswordComponent implements OnInit {

  public PasswordForm: FormGroup;
  IsSubmitted: boolean;
  private personalProfile: IPersonalProfile;
  private oldPasswordInput = '';
  private newPasswordInput = '';
  private newPasswordRepeatInput = '';
  private oldPasswordElement: HTMLElement;
  private newPasswordElement: HTMLElement;
  private newPasswordRepeatElement: HTMLElement;
  private newPasswordListener: Observable<any>;
  private repeatPasswordListener : Observable<any>;
  public passwordErrors;
  private passwordIntervalObservable: Observable<number>;

  constructor(
    private PasswordFormBuilder: FormBuilder,
    private personalProfileServ: PersonalProfileService,
    private PasswordAlertServ: AlertService,
    private PasswordServ: ResetPasswordService
  ) {
    this.personalProfileServ.Check();
    this.passwordErrors = {
      newMatch: false,
      required: false,
      lessMinLength: true,
      exceedsMaxLength: false,
      containsCharacters: false,
      forbidden: false
    }

    // Set up some listeners to check password status
    this.passwordIntervalObservable = interval(3000);
    this.passwordIntervalObservable.pipe(
      tap( x => {
        // get Mismatch
        this.passwordErrors.newMatch = ( this.PasswordForm.get('newPassword').value != this.PasswordForm.get('newPasswordRepeat').value );
        // get minlength
        this.passwordErrors.lessMinLength = ( this.PasswordForm.get('newPassword').value.length < 8)
        // get maxlength
        this.passwordErrors.exceedsMaxLength = (this.PasswordForm.get('newPassword').value.length > 32)
        // get characters
        this.passwordErrors.minLength = (true)

      }),
      // tap(x => console.log(`Tap: ${this.PasswordForm.get('newPassword').value}!=${this.PasswordForm.get('newPasswordRepeat').value}, ${this.passwordErrors.forbidden}` ))
    ).subscribe();
  }

  ngOnInit() {
    this.PasswordForm = this.PasswordFormBuilder.group({
      oldPassword: [''],
      newPassword: [''],
      newPasswordRepeat: ['']
    });
  }

  public get Profile(): Observable<PersonalProfile> {
    return this.personalProfileServ.PersonalProfile$;
  }

  public OnSubmit() {
    let passwordRegex : RegExp;

    const passwordValidators = [Validators.required, Validators.minLength(8), Validators.maxLength(32), Validators.pattern(passwordRegex)];

    let passwordComponents = {
      old: this.PasswordForm.get('oldPassword').value,
      new: this.PasswordForm.get('newPassword').value,
      repeat: this.PasswordForm.get('newPasswordRepeat').value
    };

    this.PasswordServ.update(passwordComponents)
      .pipe(
      ).subscribe(
        (LoginNext: IConfirm) => {
          if (LoginNext.Response == 'T') {

          }
          else {

          }
      },
      UpdateError => {
        this.PasswordAlertServ.error(UpdateError);
      },
      () => {  // OnComplete
        alert('Password changed successfully!');
      });

    this.IsSubmitted = true;

  }

}
