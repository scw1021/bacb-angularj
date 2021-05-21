import { ValidatorFn, AbstractControl } from '@angular/forms';
import { IExperienceType } from '../_interfaces';

export function SupervisedHourTotalValidator(RepresentationTypeControl: AbstractControl, TotalHoursControl: AbstractControl): ValidatorFn {
    return (Control: AbstractControl): { [key: string]: any } => {
        if (RepresentationTypeControl && RepresentationTypeControl.value) {
            switch (RepresentationTypeControl.value.Id) {
                case '1': {
                    return (parseInt(Control.value,10) < TotalHoursControl.value * .05) ? {'InsufficentSupervisionHours' : true } : null;
                    break;
                }
                case '2': {
                    return (parseInt(Control.value,10) < TotalHoursControl.value * .07) ? {'InsufficentSupervisionHours' : true } : null;
                    break;
                }
                case '3': {
                    return (parseInt(Control.value,10) < TotalHoursControl.value * .1) ? {'InsufficentSupervisionHours' : true } : null;
                    break;
                }
                default: {
                    return null;
                }
            }
        }
        else {
            return null;
        }
    }
}
