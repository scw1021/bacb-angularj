import { ValidatorFn, AbstractControl, Validator, ValidationErrors, FormGroup, Form } from '@angular/forms';
import { PhoneNumberUtil, PhoneNumber } from 'google-libphonenumber';
import { IsFalseValid } from './is-false-valid';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

  export function UniversalGoogleLibValidator(countryCodeControlName: string, group: FormGroup): ValidatorFn{
    return(control: AbstractControl):{[key: string]: any} | null => {
      let isValid = false;
     // console.log("ctrl N group",control, group);
      if(!control.value){
        // Handle this with a Required validator
        return null;
      }
      if(!group.get(countryCodeControlName)){
          if(!group.get(countryCodeControlName).value){
            if(!(group.get(countryCodeControlName).value.Country)){
              return { "GAH": true}

          }
        }
      }
      try {
          let phoneNumber = phoneNumberUtil.parseAndKeepRawInput(
          control.value, group.get(countryCodeControlName).value.Abbrev
        );
        isValid = phoneNumberUtil.isValidNumber(phoneNumber);
        if(isValid){
          return null;
        } else {
          return { 'InvalidNumber': true}
        }

      } catch (e) {
        return { GooglePhoneNumberLibraryError: e.message };
       }
       return null;
    }
  }


/**
 * https://angular.io/guide/form-validation#custom-validators
 */
