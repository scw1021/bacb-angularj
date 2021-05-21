import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { NgIdleModule } from '@ng-idle/core';


export function IsBACBID(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value: string = control.value;
        if (value == null) {return null};
        const regex: RegExp = new RegExp('[^0-9]');
        const errs = [];

        if( value.length > 7){
            return {"overSevenDigits": true}
        }
        if( value.length < 7){
            return{"underSevenDigits": true}
        }

        return null;
    }
}

export const HasName: ValidatorFn  = (  fg: FormGroup) => {
        const nameCtrl = fg.get('SuperviseeName')
        if(nameCtrl.value){
            return null
        } else {
            return {"missingName": true}
        }
    }

export const IfOtherEnterOther: ValidatorFn  = (  fg: FormGroup) => {
    const reasonCtrl = fg.get('Reason')
    const otherReasonBox = fg.get('OtherReason')
    if(reasonCtrl.value == '100000003'){
        if(!otherReasonBox.value){
            return {"missingOtherReasonText": true}
        }
    }
    return null;
}

export function IsACEProvider(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value: string = control.value;
        if (value == null) {return null};
        const regex: RegExp = new RegExp('[^0-9]');
        const errs = [];

        if( value.length > 7){
            return {"overSevenDigits": true}
        }
        if( value.length < 7){
            return{"underSevenDigits": true}
        }

        return null;
    }
}