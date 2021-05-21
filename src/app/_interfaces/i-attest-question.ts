import { IAppType } from './i-app-type';
import { ICertType } from './i-cert-type';

export interface IAttestQuestion {
    Id: string;
    AQAppType: IAppType;
    AQCertType: ICertType;
    Number: string;
    Section: string;
    Title: string;
    Text: string;
    HTML: string;
    CanBeFalse: string; //boolean 'T' or 'F'
    TrueOption: string;
    FalseOption: string;
    DocRequired: string; //boolean 'T' or 'F'
    DocRequiredOn: string; //boolean 'T' or 'F'
}
