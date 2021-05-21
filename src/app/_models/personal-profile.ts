import { Address } from "./address";
import { IAddress } from '../_interfaces';
import { IPersonalProfile } from "../_interfaces/i-personal-profile";
import { IRegistration } from '../_interfaces/i-registration';
import { ListObject } from "./list-object";
import { Registration } from "./registration";
import { __GetNetSuiteDate } from '../_helpers/utility-functions';

export class PersonalProfile extends Registration {
  public Addresses: Address[] = [];
  public Birthdate: Date | null = null;
  public Gender: ListObject = new ListObject();
  public GenderOther: string = '';
  public Ethnicity: ListObject = new ListObject();


  public constructor(Param1?: IPersonalProfile) {
    super(Param1);
    if (Param1 && typeof Param1 == "object") {
      this.Addresses = [];
      if (Param1.Addresses && Param1.Addresses.length) {
        for (const objAddress of Param1.Addresses) {
          this.Addresses.push(new Address(objAddress));
        }
      }
      if (Param1.Birthdate) {
        this.Birthdate = new Date(Param1.Birthdate);
      }
      this.Gender = new ListObject(Param1.Gender);
      this.GenderOther = Param1.GenderOther;
      this.Ethnicity = new ListObject(Param1.Ethnicity);
    }
  }

  public Erase(): void {
    super.Erase();
    this.AltEmail = "";
    this.Addresses.splice(0, this.Addresses.length);
    this.Birthdate = null;
    this.Gender.Erase();
    this.GenderOther = "";
    this.Ethnicity.Erase();
  }

  public Export(): IPersonalProfile {
    let RegistrationExport: IRegistration = super.Export();
    let AddressExport: IAddress[] = [];
    for (const objAddress of this.Addresses) {
      AddressExport.push(objAddress.Export());
    }
    return Object.assign(RegistrationExport, {
      'Addresses' : AddressExport,
      'Birthdate' : __GetNetSuiteDate(this.Birthdate),
      'Gender' : this.Gender.Export(),
      'GenderOther' : this.GenderOther,
      'Ethnicity' : this.Ethnicity.Export()
    });
  }
}
