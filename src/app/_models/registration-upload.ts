import { IRegistrationUpload } from '../_interfaces/i-registration-upload';
import { Registration } from './registration';
import { IRegistration } from '../_interfaces/i-registration';

export class RegistrationUpload extends Registration {
  public Password1: string =  '';
  public Password2: string = '';

  public constructor(Param1?: IRegistrationUpload ) {
    super()
    if (Param1) {
      this.Password1 = Param1.Password1;
      this.Password2 = Param1.Password2;
    }
  }

  public Erase() : void {
    this.Password1 = '';
    this.Password2 = '';
  }

  public Export() : IRegistrationUpload {
    let RegistrationExport: IRegistration = super.Export();
    return Object.assign(RegistrationExport, {'Password1': this.Password1, 'Password2': this.Password2})
  }

}
