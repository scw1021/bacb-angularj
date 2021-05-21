import { ValidatorFn, AbstractControl } from '@angular/forms';
import { IExperienceType } from '../_interfaces';

export function ExperienceDateRangeValidator(StartDateControl: AbstractControl, EndDateControl: AbstractControl): ValidatorFn {
    return (Control: AbstractControl): { [key: string]: any } => { 
        if (StartDateControl && StartDateControl.value && EndDateControl && EndDateControl.value) {
            if (StartDateControl.value > EndDateControl.value) {
                return {'InvalidExpDateRange' : true};
            }
            else {
                const FiveYears: number = (1000 * 60 * 60 * 24 * 365 * 5);
                return (FiveYears > Math.abs(EndDateControl.value.getTime() - StartDateControl.value.getTime())) ? null : {'InvalidExpDateRange' : true};
            }
        }
        else {
            return null;
        }
    }
}