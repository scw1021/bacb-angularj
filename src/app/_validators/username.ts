// import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
// import { AuthenticationService, RegisterService } from '../_services'
// import { debounce, map, tap } from 'rxjs/operators';

// import { IConfirm } from '../_interfaces';
// import { Observable } from 'rxjs';

// export function ValidateUsername(AuthService: AuthenticationService): AsyncValidatorFn {
//     return (ParamControl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
//         if (ParamControl.value) {
//             return AuthService.ValidateUsername(ParamControl.value).pipe(map(Credential => { return (Credential && Credential.Username) ? {"invalidUsername": true} : null}));
//           }
//           else {
//             return null;
//           }
//     }
// }
// export function ValidateUsernameAvailable(service: RegisterService): AsyncValidatorFn {
//   return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
//     if ( control && control.value ) {
//       service.checkUsername(control.value).pipe(
//         // tap( x => console.log(`Username: ${JSON.stringify(x)} ? ${control.value}`))
//       ).subscribe(
//         (confirm: IConfirm) => {
//           if (confirm && confirm.Message != '') {
//             console.log(`Existing Username: ${confirm.Message}`)
//             control.setErrors( {invalid: true} );
//           }
//         }
//       )
//     }
//     else {
//       return null;
//     }
//   }
// }
