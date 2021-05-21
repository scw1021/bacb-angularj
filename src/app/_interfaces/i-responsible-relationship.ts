import { ICustomer } from './i-customer';

export interface IResponsibleRelationship {
  Id: string,
  StartDate?: string,
  EndDate: string,
  Customer: ICustomer,
  Agency?: string,
  SupervisorRelationship?: string,
  Document?: string,
  TrainingType?: string,
}
