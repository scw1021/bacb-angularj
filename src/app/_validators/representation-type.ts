import { AbstractControl, ValidatorFn } from '@angular/forms';

import { IListObject } from '../_interfaces';
import { ListObject } from '../_models';

export function RepresentationTypeValidator(NumberOfSupervisors: number): ValidatorFn {
  return (Control: AbstractControl): { [key: string]: any } => {
    let RepresentationType : IListObject = new ListObject(Control.value).Export();
    if (RepresentationType.Id == '2' && NumberOfSupervisors !== 1) {
        return { 'InvalidSupervisorTotal' : true };
    }
    else if (RepresentationType.Id == '1' && NumberOfSupervisors === 0) {
        return { 'InvalidSupervisorTotal' : true };
    }
    else {
        return null;
    }
  }
}
