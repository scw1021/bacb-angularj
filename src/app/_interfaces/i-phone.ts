import { ICountry } from './i-country';

export interface IPhone {
    Country: ICountry;
    Number: string;
    Ext: string;
    IsMobile: boolean;
}
