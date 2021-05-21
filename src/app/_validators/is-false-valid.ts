import { AbstractControl, ValidatorFn } from '@angular/forms';

export function IsFalseValid(CanBeFalse: boolean = false): ValidatorFn {
    return (Control: AbstractControl): { [key: string]: boolean } | null => {
        if (Control.value != null && Control.value != undefined ){
            if (Control.value == 'F' && CanBeFalse === false) {
                return { 'canNotBeFalse' : true };
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }
}