import { IAppType } from '../_interfaces/i-app-type';

export class AppType {
    public Id: string = '';
    public Name: string = '';
    public NetSuiteId: string = '';

    public constructor(Param1?: IAppType) {
      if (Param1) {
        this.Id = Param1.Id;
        this.Name = Param1.Name;
        this.NetSuiteId = Param1.NetSuiteId;
      }
    }

    public Erase() : void {
        this.Id = '';
        this.Name = '';
        this.NetSuiteId = '';
    }

    public Export() : IAppType {
        return {
          'Id' : this.Id,
          'Name' : this.Name,
          'NetSuiteId': this.NetSuiteId
        };
    }
}
