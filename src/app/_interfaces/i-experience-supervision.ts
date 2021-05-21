import { ICustomer } from './i-customer';

export interface IExperienceSupervision {
    Id : string;
    ExpId: string;
    Supervisor: ICustomer;
    IsPrimary: string; // boolean 'T' or 'F'
    MarkedForDeletion?: boolean;
}
