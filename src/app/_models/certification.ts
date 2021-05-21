import { CertCycle } from './cert-cycle';
import { CertType } from './cert-type';
import { ICertCycle } from '../_interfaces/i-cert-cycle';
import { ICertification } from '../_interfaces';
import { Customer } from './customer';

export class Certification {
    public Id: string = '';
    public Number: string = '';
    public Customer: Customer = new Customer();
    public Type: CertType = new CertType();
    public Cycles: CertCycle[] = [];

    public constructor(Param1?: ICertification) {
        if (Param1){
            this.Id = Param1.Id;
            this.Number = Param1.Number;
            this.Customer = new Customer(Param1.Contact);
            this.Type = new CertType(Param1.Type);
            for (let CertCycleIndex in Param1.Cycles) {
                this.Cycles.push(new CertCycle(Param1.Cycles[CertCycleIndex]));
            };
        }
    }

    // Accessors
    public get IsCurrent(): boolean {
      let currentRenewalDate = this.GetCurrentCycle().RenewalDate;
      return (currentRenewalDate && currentRenewalDate.getTime() > new Date().getTime());
    }

    public get Name(): string {
        if (this.Cycles.length) {
        return this.Type.Name + this.GetCurrentCycle.name;
        }
        else {
            return " - None - ";
        }
    }

    // Methods
    public GetCurrentCycle(): CertCycle {
      let response = new CertCycle();
      if (this.Cycles.length) {
        let maximum = new Date(0);
        this.Cycles.forEach((Cycle, Index) => {
          if (Cycle.RenewalDate > maximum) {
            response = Cycle;
            maximum = Cycle.RenewalDate;
          }
        });
      }
      return response;
    }

    public GetStartDateOfCurrentCycle(): Date{
      return this.GetCurrentCycle().StartDate;
    }

    public Erase(): void {
        this.Id = '';
        this.Number = '';
        this.Customer.Erase();
        this.Type.Erase();
        this.Cycles.splice(0,this.Cycles.length);
    }

    public Export() : ICertification {
        let ExportCertCycles : ICertCycle [] = [];
        for (let ExportCertCycleIndex in this.Cycles) {
            ExportCertCycles.push(this.Cycles[ExportCertCycleIndex].Export())
        }
        return {'Id' : this.Id,
                'Number' : this.Number,
                'Contact' : this.Customer.Export(),
                'Type' : this.Type.Export(),
                'Cycles' : ExportCertCycles
        }
    }
}
