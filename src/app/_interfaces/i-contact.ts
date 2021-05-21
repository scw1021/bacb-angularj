import { ICustomer } from './i-customer';
import { IContactLink } from './i-contact-link';

export interface IContact {
    Id: string;
    Contact: ICustomer;
    Links: IContactLink[];
    Accepted: string;
}
