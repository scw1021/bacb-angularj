import { IRegistration } from './i-registration';

export interface IRegistrationUpload extends IRegistration{
  Password1: string;
  Password2: string;
}
