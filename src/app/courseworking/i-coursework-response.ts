import { IListObject } from '../_interfaces';

export interface ICourseworkResponse {
  // Clerical, used for Dynamics
  Id?: string; // recall this is creation, so this is not necessary
  CourseDurationId: string;
  Application: string;
  // Visual, for Portal Display
  Semester?: IListObject;
  Quarter?: IListObject;
  Year: string;
}
