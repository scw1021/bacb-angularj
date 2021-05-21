import { IExperienceType } from '../_interfaces/i-experience-type';

export class ExperienceType {
    public Id: string = '';
    public NetSuiteId: string = '';
    public Name: string = '';
    public HourModifier: number = 0;
    public constructor(Param1?: IExperienceType) {
        if (Param1) {
            this.Id = Param1.Id;
            this.NetSuiteId = Param1.NetSuiteId;
            this.Name = Param1.Name;
            this.HourModifier = Param1.HourModifier;
        }
    }

    public Erase() {
        this.Id = '';
        this.NetSuiteId = '';
        this.Name = '';
        this.HourModifier = 0;
    }

    public Export() : IExperienceType {
        return {
          'Id' : this.Id,
          'NetSuiteId': this.NetSuiteId,
          'Name' : this.Name,
          'HourModifier' : this.HourModifier
        }
    }
}
