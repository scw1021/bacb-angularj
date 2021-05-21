import { ICertification } from './i-certification';
import { IEntityStatus } from './i-entity-status';

export interface ISupervision {
    Id: string;
    Supervisor: ICertification;
    Supervisee: ICertification;
    StartDate:  string;
    Status: IEntityStatus;
    EndDate?: string;
    Reason?: string;
}
