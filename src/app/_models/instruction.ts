import { IAppInstruction } from '../_interfaces';

export class Instruction {
    public Id: string = '';
    public CertTypeId: string = '';
    public AppTypeId: string = '';
    public Title: string = '';
    public Text: string = '';

    public constructor(Param1?: IAppInstruction) {
        if ( Param1 ) {
            this.Id = Param1.Id;
            this.CertTypeId = Param1.CertTypeId;
            this.AppTypeId = Param1.AppTypeId;
            this.Title = Param1.Title;
            this.Text = Param1.Text;
        }
    }

    public Erase() {
        this.Id = '';
        this.CertTypeId = '';
        this.AppTypeId = '';
        this.Title = '';
        this.Text = '';
    }
}
