import { IContentAreaHours } from './../../_interfaces';
import { IHoursAllocation } from '../i-hours-allocation';
import { IListObject } from '../../_interfaces';

export interface ICourseworkFlat {
  // Clerical, used for Dynamics
  Id: string;
  CourseDurationId: string;
  // Visual, for Portal Display
  Institution?: string;
  Department?: string;
  Title: string;
  Number: string;
  Edition: IListObject;
  Semester?: IListObject;
  Quarter?: IListObject;
  Year: string;
  Hours: {[key:string]:IHoursAllocation};
  // ????
  CreditLevel?: IListObject;
  CreditHours?: string;
  SyllabiName?: string;
  ModeOfInstruction?: IListObject;
}
