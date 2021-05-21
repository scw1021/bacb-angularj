import { IListObject } from '.';

export interface IContinuingEducationCredit {
  Id: string,
  Type: IListObject,
  TypeId?: string,
  // Event Title, Course Name, Activity
  Title: string,
  // Instructor Name, University Name, Journal Name
  Provider: string,
  // NS ID of Provider
  ProviderId?: string,
  CourseId?: string,
  Grade?: IListObject,
  GradeId?: string,
  CreditHours?: string,
  CourseNumber?: string,
  // Files Associated?
  FileIds?: string[],

  // Date Strings
  StartDate?: string,
  // CompletionDate, Date Published, Date Reviewed, End Date
  CompletionDate?: string

  // Continuing Education Units
  GeneralUnits: string,
  EthicsUnits: string,
  SupervisionUnits: string,
  // Cert Cycle
  CertCycle: any;
  CertCycleId?: string;
}
