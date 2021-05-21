import { FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import {ErrorStateMatcher} from "@angular/material/core"
export class PhoneCrossFieldErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl, form: FormGroupDirective | NgForm): boolean {
    return control.dirty && form.invalid
  }

}
