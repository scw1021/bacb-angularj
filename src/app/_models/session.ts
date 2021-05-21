import { Confirm } from './confirm';
import { ISession } from '../_interfaces/i-session';

export class Session {
    public IsLoggedIn: Confirm;
    public IdleState: string = 'Not started.';
    public TimedOut: boolean = false;
    public LoginTime: Date | null;
    private _IdleTime: number = 600;
    private _TimeoutTime: number = 120;

    public constructor(Param1?: ISession) {
        if ( Param1 ) {
            this.IsLoggedIn = new Confirm (Param1.IsLoggedIn);
            this.IdleState = Param1.IdleState;
            this.TimedOut = Param1.TimedOut;
            this.LoginTime = Param1.LoginTime;
        }
        else {
            this.IsLoggedIn = new Confirm();
            this.LoginTime = new Date();
        }

    }

    public get IdleTime(): number {
        return this._IdleTime;
    }

    public get TimeoutTime(): number {
        return this._TimeoutTime;
    }
}
