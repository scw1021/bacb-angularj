import { Customer } from './customer';
import { IExperienceSupervision } from '../_interfaces/i-experience-supervision';

export class ExperienceSupervision {
    public Id: string = '';
    public ExpId: string = '';
    public Supervisor: Customer = new Customer();
    public IsPrimary: boolean = false;

    public constructor(Param1?: IExperienceSupervision) {
        if (Param1) {
            this.Id = Param1.Id;
            this.ExpId = Param1.ExpId;
            this.Supervisor = new Customer(Param1.Supervisor);
            this.IsPrimary = Param1.IsPrimary === 'T' ? true : false;
        }
    }

    public Erase() : void {
        this.Id = '';
        this.ExpId = '';
        this.Supervisor.Erase();
        this.IsPrimary = false;
    }

    public Export() : IExperienceSupervision {
        return {'Id' : this.Id,
                'ExpId' : this.ExpId,
                'Supervisor' : this.Supervisor.Export(),
                'IsPrimary' : this.IsPrimary === true ? 'T' : 'F'
        }
    }
}
