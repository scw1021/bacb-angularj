import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';

import { Observable } from 'rxjs';

export function PasswordsMatchValidator(): AsyncValidatorFn {
    return (ParamControl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
        if (ParamControl && ParamControl.value || ParamControl.value != undefined) {
            if (ParamControl.root.get('Password1') && ParamControl.value) {
                const password1 = ParamControl.root.get('Password1').value;
                const password2 = ParamControl.value;
                if (password1 === '' || password1 !== password2)  {
                    ParamControl.setErrors({ "notequal" : true });
                }
                else {
                    return null;
                }
            }
        }
        else {
        return null;
        }
    }
}

export function ControlValueMatchValidator(matchingControl: string): ValidatorFn {
  return (ParamControl: AbstractControl): {[key: string]: boolean} => {
    if (ParamControl && ParamControl.value || ParamControl.value != undefined) {
      if (ParamControl.root.get(matchingControl) && ParamControl.value) {
        const password1 = ParamControl.root.get(matchingControl).value;
        const password2 = ParamControl.value;
        if (password1 === '' || password1 !== password2)  {
          ParamControl.setErrors({ notequal : true });
          return { notequal : true };
        }
        else {
          // ParamControl.setErrors({ "notequal" : false });
          return null;
        }
      }
    }
    else {
      return null;
    }
  }
}
