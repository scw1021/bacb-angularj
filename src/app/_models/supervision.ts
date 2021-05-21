import { Certification } from './certification';
import { EntityStatus } from './entity-status';
import { ISupervision } from '../_interfaces/i-supervision';
import { ListObject } from './list-object';
import { __GetNetSuiteDate } from '../_helpers/utility-functions';

export class Supervision {
    public Id: string = '';
    public Supervisor: Certification = new Certification();
    public Supervisee: Certification = new Certification();
    public StartDate:  Date | null = null;
    public Status: EntityStatus = new EntityStatus();
    public EndDate?: Date | null = null;
    public Reason?: string = '';

    public constructor(Param1?: ISupervision) {
        if (Param1) {
            this.Id = Param1.Id;
            this.Supervisor = new Certification(Param1.Supervisor);
            this.Supervisee = new Certification(Param1.Supervisee);
            if (Param1.StartDate) {
                let DateArray1 = Param1.StartDate.split("/", 3);
                this.StartDate = new Date(DateArray1[2] + "-" + DateArray1[0] + "-" + DateArray1[1])
            }
            this.Status = new EntityStatus(Param1.Status);
            if (Param1.EndDate) {
                let DateArray2 = Param1.StartDate.split("/", 3);
                this.EndDate = new Date(DateArray2[2] + "-" + DateArray2[0] + "-" + DateArray2[1])
            }
            this.Reason = Param1.Reason;
        }
    }

    public Erase() : void {
        this.Id = '';
        this.Supervisor.Erase();
        this.Supervisee.Erase();
        this.StartDate = null;
        this.Status.Erase();
        this.EndDate = null;
        this.Reason = '';
    }

    public Export() : ISupervision {
        return {
            'Id' : this.Id,
            'Supervisor' : this.Supervisor.Export(),
            'Supervisee' : this.Supervisee.Export(),
            'StartDate' : __GetNetSuiteDate(this.StartDate),
            'Status' : this.Status.Export(),
            'EndDate' : __GetNetSuiteDate(this.EndDate),
            'Reason' : this.Reason
        };
    }
}
