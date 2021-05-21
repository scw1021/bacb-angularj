import { ICertType } from '../_interfaces/i-cert-type';

export class CertType {
  public Id: string = '';
  public Name: string = '';
  public Abbrev: string = '';
  public NetSuiteId: string = '';
    public constructor(Param1?: ICertType) {
      if ( Param1 ) {
        this.Id = Param1.Id;
        this.Name = Param1.Name;
        this.Abbrev = Param1.Abbrev;
        this.NetSuiteId = Param1.NetSuiteId;
      }
    }

    public Erase() : void {
        this.Id = '';
        this.Name = '';
        this.Abbrev = '';
        this.NetSuiteId = '';
    }

    public Export() : ICertType {
        return {'Id' : this.Id,
                'Name' : this.Name,
                'Abbrev' : this.Abbrev,
                'NetSuiteId': this.NetSuiteId}
    }
}
