import { ValidatorFn, AbstractControl } from '@angular/forms';

export function DigitsOnly(): ValidatorFn {
  const regex: RegExp = new RegExp('^[0-9]+$')
  return(control: AbstractControl): {[key: string]: any} | null => {
    if(!control.value){
      return null;
    }
   return regex.test(control.value) == true? null : { 'ContainsLetters': true };
  }
}
