import { IState } from './i-state';
import { ICountry } from './i-country';

export interface IAddress {
    Index: string;
    Address1: string;
    Address2: string;
    City: string;
    State: IState;
    Country: ICountry;
    PostalCode: string;
    isShipping: string;
    isBilling: string;
}
