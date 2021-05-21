import {FormControl, FormGroup, ValidatorFn} from '@angular/forms'

export class DateValidators {

  //Note: if validators are successful, they return null
  static yearIsAfterThisYear(control: FormControl): {[key: string]: boolean}{
      if(control.value > new Date()){
        return null
      } else return { 'dateIsInPast' : true}

  }

  static yearIsAfterStartYear: ValidatorFn = (fg: FormGroup) =>{
    const start: number = fg.get('activeStart').value;
    const end: number = fg.get('activeEnd').value;
    return start !== null && end !== null && start < end ? null :{ 'endDateBeforeStartDate' : true }
  }
  //Note: if validators are successful, they return null
  static yearIsBeforeThisYear(control: FormControl): {[key: string]: boolean}{
    if(control.value < new Date()){
      return null
    } else return { 'dateIsInPast' : true}
}

static courseworkFormDateValidator: ValidatorFn = (fg: FormGroup) =>{
  const start: number = fg.get('FirstCourseStartDate').value;
  const end: number = fg.get('LastCourseEndDate').value;
  return start !== null && end !== null && start < end ? null :{ 'endDateBeforeStartDate' : true }
}

}
