import { IConfirm } from '.';

export interface ISession  {
  IsLoggedIn: IConfirm;
  IdleState: string;
  TimedOut: boolean;
  LoginTime: Date;
}
