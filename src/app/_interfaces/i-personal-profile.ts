import { IAddress } from './i-address';
import { IListObject } from './i-list-object';
import { IRegistration } from './i-registration';

export interface IPersonalProfile extends IRegistration{
  FullName: string;
  Addresses: IAddress[];
  Birthdate: string;
  Gender: IListObject;
  GenderOther: string;
  Ethnicity: IListObject;
  // Also need these fields

  // Prefix: IListObject;
  // Suffix: IListObject;
  // FirstName: string;
  // MiddleName: string;
  // LastName: string;
  // FullName: string;
  // Phone: IPhone;
  // AltPhone: IPhone;
  // MobilePhone: IPhone;

  // Id: string;
  // BACBID: string;
  // Email: string;
  // AltEmail: string;
}
