import { ICertType } from './i-cert-type';
import { ICertCycle } from './i-cert-cycle';
import { ICustomer } from './i-customer';

export interface ICertification {
    Id: string;
    Number: string;
    Contact: ICustomer;
    Type: ICertType;
    Cycles: ICertCycle [];
}
