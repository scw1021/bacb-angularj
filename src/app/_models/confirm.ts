import { IConfirm } from '../_interfaces/i-confirm';

export class Confirm {
    public Response: boolean = false;
    public Message: string = '';
    public ReturnId?: string;

    public constructor(Param1?: IConfirm) {
        if (Param1) {
            this.Response = Param1.Response == 'T' ? true : false;
            this.Message = Param1.Message;
            if (Param1.ReturnId) {
                this.ReturnId = Param1.ReturnId;
            }
        }
    }

    public Erase(): void {
        this.Response = false;
        this.Message = '';
        if(this.ReturnId){
          this.ReturnId = null;
        }
    }

    public Export() : IConfirm {
        return {'Response' : this.Response == true ? 'T' : 'F',
                'Message' : this.Message,
                'ReturnId' : this.ReturnId}
    }
}
