import { IUser } from "../_interfaces/i-user";

export class User {
  public Id: string = '';
  public BACBID: string = '';
  public Email: string = '';
  public AltEmail: string = '';

  public constructor(Param1?: IUser) {
    if ( Param1 ) {
      this.Id = Param1.Id;
      this.BACBID = Param1.BACBID;
      this.Email = Param1.Email;
      this.AltEmail = Param1.AltEmail ? Param1.AltEmail : '';
    }
  }
  public Erase() {
    this.Id = "";
    this.BACBID = "";
    this.Email = "";
  }

  public Export() : IUser {
    return {
      'Id' : this.Id,
      'BACBID' : this.BACBID,
      'Email' : this.Email,
      'AltEmail' : this.AltEmail
    }
  }
}
