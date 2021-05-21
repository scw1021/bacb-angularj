import { IListObject } from '.';
import { IUser } from './i-user';
import { IPhone } from './i-phone';

export interface IRegistration extends IUser {
  Prefix: IListObject;
  Suffix: IListObject;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  FullName: string;
  Phone: IPhone;
  AltPhone: IPhone;
  MobilePhone: IPhone;
}
