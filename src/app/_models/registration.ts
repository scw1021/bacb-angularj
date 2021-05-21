import { IRegistration } from "../_interfaces/i-registration";
import { IUser } from '../_interfaces/i-user';
import { ListObject } from "./list-object";
import { Phone } from "./phone";
import { User } from "./user";

export class Registration extends User {
  public Prefix: ListObject = new ListObject();
  public Suffix: ListObject = new ListObject();
  public FirstName: string = '';
  public MiddleName: string = '';
  public LastName: string = '';
  public Phone: Phone = new Phone();
  public AltPhone: Phone = new Phone();
  public MobilePhone: Phone = new Phone();

  public constructor(Param1?: IRegistration) {
    super(Param1);

    if (Param1) {
      if (Param1.Prefix) {
        this.Prefix = new ListObject(Param1.Prefix);
      }
      if (Param1.Suffix) {
        this.Suffix = new ListObject(Param1.Suffix);
      }
      this.FirstName = Param1.FirstName;   
      this.MiddleName = Param1.MiddleName;
      this.LastName = Param1.LastName;
      this.Phone = new Phone(Param1.Phone);
      this.AltPhone = new Phone(Param1.AltPhone);
      this.MobilePhone = new Phone(Param1.MobilePhone);
    }
  }

  public get FullName() : string {
    let Name = this.MiddleName ? this.FirstName + " " + this.MiddleName + " " + this.LastName : this.FirstName + " " + this.LastName;
    if (this.Prefix && this.Prefix.Value !== '') {
      Name = this.Prefix.Value + " " + Name;
    }
    if (this.Suffix && this.Suffix.Value !== '') {
      Name += " " + this.Suffix.Value;
    }
    return Name;
  }

  public SetMobile(Primary: boolean, Secondary: boolean) {
    if (Primary) {
      this.MobilePhone = this.Phone;
    } else if (Secondary) {
      this.MobilePhone = this.AltPhone;
    }
  }

  public Erase() {
    super.Erase();
    this.Prefix.Erase();
    this.Suffix.Erase();
    this.FirstName = "";
    this.MiddleName = "";
    this.LastName = "";
    this.Email = "";
    this.Phone.Erase();
    this.AltPhone.Erase();
    this.MobilePhone.Erase();
    // this.Username = "";
  }

  public Export() : IRegistration {
    let UserExport: IUser = super.Export();
    return Object.assign(UserExport, {
            'Prefix' : this.Prefix.Export(),
            'Suffix' : this.Suffix.Export(),
            'FirstName' : this.FirstName,
            'MiddleName' : this.MiddleName,
            'LastName' : this.LastName,
            'FullName' : this.FullName,
            'Email' : this.Email,
            'Phone' : this.Phone.Export(),
            'AltPhone' : this.AltPhone.Export(),
            'MobilePhone' : this.MobilePhone.Export()})
  }
}
