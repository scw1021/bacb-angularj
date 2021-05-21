import { IListObject } from './i-list-object';

export interface ICourseworkData {
    Id: string;
    ContentHourId: string;
    Semester: IListObject;
    Quarter: IListObject;
    Year: string;
    AppId: string;
}
