import { ICustomer } from '../_interfaces/i-customer';

export class Customer {
    public Id: string = '';
    public BACBID: string = '';
    public Name: string = '';

    public constructor(Param1?: ICustomer){
        if (Param1) {
            this.Id = Param1.Id;
            this.BACBID = Param1.BACBID;
            this.Name = Param1.Name;
        }
    }

    public Erase(): void {
        this.Id = '';
        this.BACBID = '';
        this.Name = '';
    }

    public Export() : ICustomer {
        return {
          'Id' : this.Id,
          'BACBID' : this.BACBID,
          'Name' : this.Name
        }
    }
}
