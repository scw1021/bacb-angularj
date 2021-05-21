import { ILoginCredentials } from '../_interfaces/i-login-credentials';

export class LoginCredentials implements ILoginCredentials {
    public Email: string = '';
    public Password: string = '';

    public constructor(public Param1?: ILoginCredentials) {
        if ( Param1 ) {
            this.Email = Param1.Email;
            this.Password = Param1.Password;
        }
    }

    public Erase() : void {
        this.Email = '';
        this.Password = '';
    }

    public Export() : ILoginCredentials {
        return {
          'Email' : this.Email,
          'Password' : this.Password}
    }
}

