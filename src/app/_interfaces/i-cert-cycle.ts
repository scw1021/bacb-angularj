import { IEntityStatus } from './i-entity-status';

export interface ICertCycle {
    Id: string;
    Status: IEntityStatus;
    RenewalDate: string;
    StartDate: string;
    AbbrevMod: string;
    NameMod: string;
}
