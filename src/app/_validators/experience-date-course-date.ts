import { ValidatorFn, AbstractControl } from '@angular/forms';
import { IExperienceType } from '../_interfaces';

export function ExperienceDateCourseDateValidator(StartDateControl: AbstractControl, FirstCourseDate: Date): ValidatorFn {
    return (Control: AbstractControl): { [key: string]: any } => {
        if (StartDateControl && StartDateControl.value && FirstCourseDate) {
                    return FirstCourseDate > StartDateControl.value ? {'InvalidStartDate' : true} : null;
        }
        else {
            return null;
        }
    }
}