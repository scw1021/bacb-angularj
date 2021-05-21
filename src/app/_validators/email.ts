import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';

import { IConfirm } from '../_interfaces';
import { Observable } from 'rxjs';
import { RegisterService } from '../_services';
import { tap } from 'rxjs/operators';

export function ValidateEmailAvailable(service: RegisterService): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    if ( control && control.value ) {
      service.checkEmail(control.value)
        .pipe()
        .subscribe(
          (confirm: IConfirm) => {
            if (confirm && confirm.Message != '') {
              control.setErrors( {invalid: true} );
            }
          }
        )
    }
    else {
      return null;
    }
  }
}
