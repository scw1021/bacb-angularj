import {FormControl, FormGroup, ValidatorFn} from '@angular/forms';
import { PhoneNumberUtil, PhoneNumber, AsYouTypeFormatter } from 'google-libphonenumber';


import { IsFalseValid } from './is-false-valid';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

export const PhoneFieldsAreCompleteOrEmpty: ValidatorFn = (fg: FormGroup) =>{
  const country: number = fg.get('Country').value;
  const number: number = fg.get('Number').value;
  //console.log("country", country, "number", number)
  if(country && number){
    return null;
  }
  if(!country && !number){
    return null;
  }

  if( country && !number) {
    return {"numberRequired": true}
  } else if ( !country && number){
    return {"dialCodeRequired": true}
  }
}


export const validCountryAndNumberCombination: ValidatorFn = ( fg: FormGroup) => {
  try {
    const countryCode = fg.get("Country")?.value?.Abbrev;
    var providedNumber = fg.get("Number")?.value;
    //console.log(countryCode, providedNumber)
    if(countryCode && providedNumber){
      //const testNum = countryCode + providedNumber;
      const formatter = new AsYouTypeFormatter(countryCode)
      providedNumber = formatter.inputDigit(providedNumber)
      const isPossible: boolean = phoneNumberUtil.isValidNumberForRegion(phoneNumberUtil.parse(providedNumber, countryCode), countryCode)
      if(!isPossible){
        return { "numberImpossible": true }
      }
    }
    return null;
  } catch( ex) {
    console.log(ex)

    return {"numberImpossible": true}
  }

}

export const isObj: ValidatorFn = ( fc: FormControl) => {
  if(fc.value == null || fc.value == ""){
    return null;
  }
  if(typeof(fc.value) !== "object") {
    return {"valNotObj": true}
  }
}

export const userEighteenPlus = () => {}

