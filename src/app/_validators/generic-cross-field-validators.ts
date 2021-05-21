import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';
import { ɵConsole } from '@angular/core';
export class GenericCrossFieldValidators{

  static AtLeastOneControlRequired: ValidatorFn = (group: FormGroup) => {
      let theOne = undefined;
      if( group.controls ){
        theOne  = Object.keys(group.controls).find((key: string) => group.controls[key].value !== false )
        console.log(theOne)
        return theOne? null: {'atLeastOneControlRequired': true};
      }

  }
}

