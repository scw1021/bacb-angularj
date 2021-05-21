import { IListObject } from './i-list-object';
import { IInstitution } from './i-institution';

export interface IDegree {
    Id: string;
    Type: IListObject;
    Major: string;
    DateConferred: string;
    Institution: IInstitution;
}
