import { EntityStatus } from './entity-status';
import { ICertCycle } from '../_interfaces/i-cert-cycle';
import { __GetNetSuiteDate } from '../_helpers/utility-functions';

export class CertCycle {
  public Id: string = '';
  public Status: EntityStatus = new EntityStatus();
  public StartDate: Date | null = null;
  public RenewalDate: Date | null = null;
  public AbbrevMod: string = '';
  public NameMod: string = '';

  public constructor(Param1?: ICertCycle) {
    if (Param1){
      this.Id = Param1.Id;
      this.Status = new EntityStatus(Param1.Status);
      this.StartDate = new Date(Param1.StartDate);
      this.RenewalDate = new Date(Param1.RenewalDate);
      this.AbbrevMod = Param1.AbbrevMod;
      this.NameMod = Param1.NameMod;
    }
  }

  public GetCertAbbrev(Abbrev: string) {
    return Abbrev + this.AbbrevMod;
  }
  public GetCertName(Name: string) {
    return Name + this.NameMod;
  }

  public Erase(): void {
    this.Id = '';
    this.Status = new EntityStatus();
    this.StartDate = null;
    this.RenewalDate = null;
    this.AbbrevMod = '';
    this.NameMod = '';
  }

  public Export() : ICertCycle {
    let StartDateExport = __GetNetSuiteDate( this.StartDate );
    let RenewDateExport = __GetNetSuiteDate( this.RenewalDate );
    return {
      'Id' : this.Id,
      'Status' : this.Status.Export(),
      'StartDate': StartDateExport,
      'RenewalDate' : RenewDateExport,
      'AbbrevMod' : this.AbbrevMod,
      'NameMod' : this.NameMod
    }
  }
}

