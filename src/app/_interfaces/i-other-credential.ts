import { ICountry } from './i-country';
import { IState } from './i-state';
import { IListObject } from './i-list-object';

export interface IOtherCredential {
    Id: string;
    Type: IListObject;
    Title: string;
    Country: ICountry;
    State: IState;
    Number: string;
    Year: string;
}
