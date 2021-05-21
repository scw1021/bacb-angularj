import { IListObject } from 'src/app/_interfaces';

export interface IActionItem {
  Id: string,
  Abstract: string,
  CustomText: string,
  DueDate: string;
  DateSubmitted: string,
  DocumentRequired: string,
  Status: IListObject,
  CertificationCycleId: string,
  Source: IListObject,
  Type: IListObject,
}
