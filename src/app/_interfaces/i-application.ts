import { IAppType } from './i-app-type';
import { ICertType } from './i-cert-type';
import { IEntityStatus } from './i-entity-status';

export interface IApplication {
    Id: string;
    Status: string;
    AppType: IAppType;
    CertType: ICertType;
    DateSubmitted: string;
    DateCreated: string;
    FirstCourseStartDate: string;
    LastCourseEndDate: string;
    Invoice: string;
}
