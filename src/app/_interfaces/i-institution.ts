import { IAddress } from './i-address';
import { IDepartment } from './i-department';

export interface IInstitution {
    Id: string;
    Name: string;
    Website: string;
    Address?: IAddress;
    Departments: IDepartment[];
    NetSuiteId?: any;
    CrmId?: any;
}
