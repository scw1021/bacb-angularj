import { IListObject } from './i-list-object';

export interface IEntityStatus {
    Id: string;
    InternalId?: string;
    RecordTypeName: IListObject;
    InternalName: string;
    ExternalName: string;
}
